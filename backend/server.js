const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.send('Server is healthy');
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// In-memory room state management
const rooms = {};

// Helper to generate a unique room ID (4-5 uppercase alphanumeric characters)
function generateRoomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result;
  do {
    result = '';
    const length = Math.random() < 0.5 ? 4 : 5;
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (rooms[result]); // Ensure uniqueness
  return result;
}

// Helper to clean up empty rooms or reset rooms with active players
function getCleanRoomState(room) {
  return {
    id: room.id,
    players: room.players.map(p => ({
      name: p.name,
      ready: p.ready,
      decks: p.ready && room.state !== 'ready_to_submit' && room.state !== 'waiting' ? p.decks : [], // Hide decks until both ready
      bannedOpponentDeck: p.bannedOpponentDeck,
      isHost: p.isHost
    })),
    state: room.state,
    diceResult: room.diceResult,
    firstBannerIndex: room.firstBannerIndex,
    // Send active banner's name instead of socket ID to be connection-agnostic
    activeBannerName: room.players[room.firstBannerIndex]?.name, // Fallback helper
    turnName: room.players.find(p => p.id === room.turn)?.name || null
  };
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 1. CREATE ROOM
  socket.on('create_room', ({ nickname }) => {
    if (!nickname || nickname.trim() === '') {
      socket.emit('error', 'Nickname inválido.');
      return;
    }

    const roomId = generateRoomId();
    rooms[roomId] = {
      id: roomId,
      players: [
        {
          id: socket.id,
          name: nickname.trim(),
          decks: [],
          ready: false,
          bannedOpponentDeck: null,
          isHost: true
        }
      ],
      state: 'waiting',
      diceResult: null,
      firstBannerIndex: null,
      turn: null
    };

    socket.join(roomId);
    socket.emit('room_created', { roomId, nickname });
    io.to(roomId).emit('room_update', getCleanRoomState(rooms[roomId]));
    console.log(`Room created: ${roomId} by ${nickname}`);
  });

  // 2. JOIN ROOM (with Session Recovery support)
  socket.on('join_room', ({ roomId, nickname }) => {
    if (!roomId || !nickname) {
      socket.emit('error', 'ID da Sala e Nickname são necessários.');
      return;
    }

    const roomKey = roomId.toUpperCase();
    const room = rooms[roomKey];

    if (!room) {
      socket.emit('error', 'Sala não encontrada.');
      return;
    }

    const formattedName = nickname.trim();

    // Check if player is reconnecting (same name already in the room)
    const existingPlayerIndex = room.players.findIndex(p => p.name.toLowerCase() === formattedName.toLowerCase());

    if (existingPlayerIndex !== -1) {
      // Reconnection: update the socket ID and rejoin room
      console.log(`Player ${formattedName} reconnected to room ${roomKey}`);
      const oldPlayerSocketId = room.players[existingPlayerIndex].id;
      room.players[existingPlayerIndex].id = socket.id;

      // Update turn if it belonged to the old socket
      if (room.turn === oldPlayerSocketId) {
        room.turn = socket.id;
      }

      socket.join(roomKey);
      socket.emit('room_joined', { roomId: roomKey, nickname: formattedName });
      io.to(roomKey).emit('room_update', getCleanRoomState(room));
      return;
    }

    // Regular joining flow
    if (room.players.length >= 2) {
      socket.emit('error', 'A sala está cheia (máximo 2 jogadores).');
      return;
    }

    // Add second player
    room.players.push({
      id: socket.id,
      name: formattedName,
      decks: [],
      ready: false,
      bannedOpponentDeck: null,
      isHost: false
    });

    room.state = 'ready_to_submit';
    socket.join(roomKey);
    socket.emit('room_joined', { roomId: roomKey, nickname: formattedName });
    io.to(roomKey).emit('room_update', getCleanRoomState(room));
    console.log(`Player ${formattedName} joined room ${roomKey}`);
  });

  // 3. SUBMIT DECKS
  socket.on('submit_decks', ({ roomId, decks }) => {
    const roomKey = roomId?.toUpperCase();
    const room = rooms[roomKey];

    if (!room) {
      socket.emit('error', 'Sala não encontrada.');
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
    if (!player) {
      socket.emit('error', 'Jogador não encontrado na sala.');
      return;
    }

    if (!Array.isArray(decks) || decks.length !== 3 || decks.some(d => !d || d.trim() === '')) {
      socket.emit('error', 'Você deve enviar exatamente 3 decks válidos.');
      return;
    }

    player.decks = decks.map(d => d.trim());
    player.ready = true;

    // Check if both are ready
    const allReady = room.players.length === 2 && room.players.every(p => p.ready);

    if (allReady) {
      room.state = 'dice_rolling';
      // Roll dice internally: 1 to 6 (50/50 splits: 1-3 vs 4-6)
      const dice = Math.floor(Math.random() * 6) + 1;
      room.diceResult = dice;
      // 1, 2, 3 -> Player 1 (Host/Index 0) bans first
      // 4, 5, 6 -> Player 2 (Joinee/Index 1) bans first
      room.firstBannerIndex = dice <= 3 ? 0 : 1;
      room.turn = room.players[room.firstBannerIndex].id;

      io.to(roomKey).emit('room_update', getCleanRoomState(room));
      console.log(`Room ${roomKey}: Both players ready. Rolled ${dice}. First banner: index ${room.firstBannerIndex}`);

      // Transition to 'banning' after a delay (allows dice roll animation to play)
      setTimeout(() => {
        // Double check if room still exists and is in dice_rolling state
        if (rooms[roomKey] && rooms[roomKey].state === 'dice_rolling') {
          rooms[roomKey].state = 'banning';
          io.to(roomKey).emit('room_update', getCleanRoomState(rooms[roomKey]));
        }
      }, 12500); // 12.5 seconds buffer: 3.5s read logic, 3s spin, 3.5s slow decelerate, 2.5s review winner
    } else {
      io.to(roomKey).emit('room_update', getCleanRoomState(room));
    }
  });

  // 4. BAN DECK
  socket.on('ban_deck', ({ roomId, deckName }) => {
    const roomKey = roomId?.toUpperCase();
    const room = rooms[roomKey];

    if (!room) {
      socket.emit('error', 'Sala não encontrada.');
      return;
    }

    if (room.state !== 'banning') {
      socket.emit('error', 'Não está na fase de banimento.');
      return;
    }

    if (room.turn !== socket.id) {
      socket.emit('error', 'Não é o seu turno para banir.');
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
    const opponent = room.players.find(p => p.id !== socket.id);

    if (!player || !opponent) {
      socket.emit('error', 'Jogadores não identificados.');
      return;
    }

    // Check if the deck to ban exists in opponent's decks
    if (!opponent.decks.includes(deckName)) {
      socket.emit('error', 'Deck selecionado não pertence ao oponente.');
      return;
    }

    // Set the ban
    player.bannedOpponentDeck = deckName;

    // Switch turn or end banning phase
    const allBanned = room.players.every(p => p.bannedOpponentDeck !== null);

    if (allBanned) {
      room.state = 'summary';
      room.turn = null;
    } else {
      // Switch turn to the opponent
      room.turn = opponent.id;
    }

    io.to(roomKey).emit('room_update', getCleanRoomState(room));
    console.log(`Room ${roomKey}: Player ${player.name} banned opponent's deck "${deckName}"`);
  });

  // 5. RESET / RESTART MATCH
  socket.on('reset_room', ({ roomId }) => {
    const roomKey = roomId?.toUpperCase();
    const room = rooms[roomKey];

    if (!room) {
      socket.emit('error', 'Sala não encontrada.');
      return;
    }

    // Reset game state
    room.state = 'ready_to_submit';
    room.diceResult = null;
    room.firstBannerIndex = null;
    room.turn = null;
    room.players.forEach(p => {
      p.decks = [];
      p.ready = false;
      p.bannedOpponentDeck = null;
    });

    io.to(roomKey).emit('room_update', getCleanRoomState(room));
    console.log(`Room ${roomKey} reset successfully`);
  });

  // 6. DISCONNECT
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Find room the player belonged to
    Object.keys(rooms).forEach(roomKey => {
      const room = rooms[roomKey];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);

      if (playerIndex !== -1) {
        const disconnectingPlayerName = room.players[playerIndex].name;
        
        // Setup a small timeout to allow session recovery.
        // If they reconnect within 5 seconds, they restore their spot.
        // If they don't, we notify the room and fallback.
        setTimeout(() => {
          const activeRoom = rooms[roomKey];
          if (!activeRoom) return;

          // Double check if the player is still represented by the same disconnected socket ID
          const stillDisconnected = activeRoom.players.some(p => p.id === socket.id);
          
          if (stillDisconnected) {
            // Remove the player
            activeRoom.players.splice(playerIndex, 1);
            console.log(`Player ${disconnectingPlayerName} removed from room ${roomKey} due to inactivity`);

            if (activeRoom.players.length === 0) {
              delete rooms[roomKey];
              console.log(`Room ${roomKey} deleted since it became empty`);
            } else {
              // Reset state back to waiting
              activeRoom.state = 'waiting';
              activeRoom.diceResult = null;
              activeRoom.firstBannerIndex = null;
              activeRoom.turn = null;
              activeRoom.players.forEach(p => {
                p.ready = false;
                p.decks = [];
                p.bannedOpponentDeck = null;
                p.isHost = true; // Remainder player becomes host
              });
              io.to(roomKey).emit('room_update', getCleanRoomState(activeRoom));
              io.to(roomKey).emit('player_left', `${disconnectingPlayerName} saiu da sala.`);
            }
          }
        }, 6000); // 6 seconds window for page refreshes
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
