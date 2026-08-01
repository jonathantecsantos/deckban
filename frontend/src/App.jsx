import React, { useState, useEffect } from 'react';
import { socket, SOCKET_URL } from './socket';
import JoinRoom from './components/JoinRoom';
import WaitingRoom from './components/WaitingRoom';
import DiceRollAnimation from './components/DiceRollAnimation';
import BanPhase from './components/BanPhase';
import MatchSummary from './components/MatchSummary';
import { Swords, Wifi, WifiOff } from 'lucide-react';

export default function App() {
  const [connected, setConnected] = useState(socket.connected);
  const [roomId, setRoomId] = useState(null);
  const [nickname, setNickname] = useState(null);
  const [roomState, setRoomState] = useState(null);
  const [error, setError] = useState(null);
  const [connectingAction, setConnectingAction] = useState(null); // 'create' | 'join' | 'reconnect' | null

  useEffect(() => {
    // Proactive background ping to wake up the Render backend immediately when user lands
    fetch(`${SOCKET_URL}/health`).catch(err => {
      console.log('Background server wake-up ping:', err);
    });

    // Check if there is an active session to recover
    const storedRoomId = sessionStorage.getItem('roomId');
    const storedNickname = sessionStorage.getItem('nickname');

    if (storedRoomId && storedNickname) {
      setRoomId(storedRoomId);
      setNickname(storedNickname);
      setConnectingAction('reconnect');
      socket.connect();
      socket.emit('join_room', { roomId: storedRoomId, nickname: storedNickname });
    }

    // Connect listener
    function onConnect() {
      setConnected(true);
      setError(null);
    }

    // Disconnect listener
    function onDisconnect() {
      setConnected(false);
      setConnectingAction(null);
    }

    // Connect error listener (server starting up or offline)
    function onConnectError(err) {
      console.error('Socket connection error:', err);
      setError('Não foi possível conectar ao servidor. O servidor pode estar iniciando (levando até 1 minuto) ou offline.');
      setConnectingAction(null);
    }

    // Handle room updates
    function onRoomUpdate(updatedState) {
      setRoomState(updatedState);
      setError(null);
    }

    // Handle errors from the backend
    function onError(message) {
      setError(message);
      setConnectingAction(null);
      // If there's a critical room join/find error, clear session storage
      if (message.includes('Sala não encontrada') || message.includes('cheia')) {
        handleLeaveRoom();
      }
    }

    // Handle room created confirmation
    function onRoomCreated({ roomId: createdRoomId, nickname: hostName }) {
      setRoomId(createdRoomId);
      setNickname(hostName);
      sessionStorage.setItem('roomId', createdRoomId);
      sessionStorage.setItem('nickname', hostName);
      setConnectingAction(null);
    }

    // Handle room joined confirmation
    function onRoomJoined({ roomId: joinedRoomId, nickname: playerName }) {
      setRoomId(joinedRoomId);
      setNickname(playerName);
      sessionStorage.setItem('roomId', joinedRoomId);
      sessionStorage.setItem('nickname', playerName);
      setConnectingAction(null);
    }

    // Handle left notification
    function onPlayerLeft(message) {
      // Just log or display as a message
      console.log(message);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('room_update', onRoomUpdate);
    socket.on('error', onError);
    socket.on('room_created', onRoomCreated);
    socket.on('room_joined', onRoomJoined);
    socket.on('player_left', onPlayerLeft);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('room_update', onRoomUpdate);
      socket.off('error', onError);
      socket.off('room_created', onRoomCreated);
      socket.off('room_joined', onRoomJoined);
      socket.off('player_left', onPlayerLeft);
    };
  }, []);

  const handleCreateRoom = (name) => {
    setConnectingAction('create');
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit('create_room', { nickname: name });
  };

  const handleJoinRoom = (roomCode, name) => {
    setConnectingAction('join');
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit('join_room', { roomId: roomCode, nickname: name });
  };

  const handleSubmitDecks = (decks) => {
    socket.emit('submit_decks', { roomId, decks });
  };

  const handleBanDeck = (deckName) => {
    socket.emit('ban_deck', { roomId, deckName });
  };

  const handleResetRoom = () => {
    socket.emit('reset_room', { roomId });
  };

  const handleLeaveRoom = () => {
    sessionStorage.removeItem('roomId');
    sessionStorage.removeItem('nickname');
    socket.disconnect();
    setRoomId(null);
    setNickname(null);
    setRoomState(null);
    setError(null);
    setConnectingAction(null);
  };

  // Determine current active view based on roomState.state
  const renderContent = () => {
    if (!roomId || !roomState) {
      return (
        <JoinRoom
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          error={error}
          connectingAction={connectingAction}
        />
      );
    }

    switch (roomState.state) {
      case 'waiting':
      case 'ready_to_submit':
        return (
          <WaitingRoom
            roomId={roomId}
            players={roomState.players}
            nickname={nickname}
            onSubmitDecks={handleSubmitDecks}
            onLeaveRoom={handleLeaveRoom}
          />
        );
      case 'dice_rolling':
        return (
          <DiceRollAnimation
            diceResult={roomState.diceResult}
            players={roomState.players}
            firstBannerIndex={roomState.firstBannerIndex}
          />
        );
      case 'banning':
        return (
          <BanPhase
            players={roomState.players}
            nickname={nickname}
            turnName={roomState.turnName}
            onBanDeck={handleBanDeck}
          />
        );
      case 'summary':
        return (
          <MatchSummary
            players={roomState.players}
            nickname={nickname}
            onResetRoom={handleResetRoom}
          />
        );
      default:
        return (
          <div className="text-center py-12 text-zinc-500">
            Estado desconhecido. Tente recarregar a página.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between font-sans">
      {/* Global Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/60 backdrop-blur px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-fab-gold">
              <Swords size={24} />
            </div>
            <div>
              <span className="text-lg font-bold text-white leading-none tracking-wide block">
                DECKSTALISHAR
              </span>
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold block mt-0.5">
                Real-Time Fab Ban Manager
              </span>
            </div>
          </div>

          {/* Connection badge */}
          <div className="flex items-center gap-2">
            {connected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg uppercase tracking-wider">
                <Wifi size={12} className="animate-pulse" />
                Conectado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold rounded-lg uppercase tracking-wider">
                <WifiOff size={12} />
                Desconectado
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center py-6">
        {renderContent()}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-zinc-950 bg-zinc-950/40 text-center py-4 text-xs text-zinc-600 font-medium">
        <p>Deckstalishar &copy; {new Date().getFullYear()} - Gerenciamento de Banimento de Decks para Flesh and Blood</p>
      </footer>
    </div>
  );
}
