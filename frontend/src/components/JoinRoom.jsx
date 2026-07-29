import React, { useState } from 'react';
import { Swords, Plus, LogIn } from 'lucide-react';

export default function JoinRoom({ onCreateRoom, onJoinRoom, error }) {
  const [nickname, setNickname] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    onCreateRoom(nickname.trim());
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!nickname.trim() || !roomIdInput.trim()) return;
    onJoinRoom(roomIdInput.trim().toUpperCase(), nickname.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md p-8 rounded-2xl glass-panel relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-fab-gold to-transparent opacity-60"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-zinc-900 rounded-full border border-fab-gold/30 text-fab-gold mb-3 shadow-lg shadow-fab-gold/5">
            <Swords size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide text-center">
            DECKSTALISHAR
          </h1>
          <p className="text-xs text-fab-gold font-medium uppercase tracking-widest mt-1">
            Flesh and Blood Ban Manager
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/60 border border-red-500/40 text-red-200 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Nickname Input */}
          <div>
            <label className="block text-xs font-semibold text-fab-gold uppercase tracking-wider mb-2">
              Seu Nickname / Nome
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ex: RhinarLord"
              maxLength={15}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-fab-gold/50 rounded-xl text-white outline-none transition-all placeholder:text-zinc-600 font-medium"
            />
          </div>

          <hr className="border-zinc-800" />

          {/* Action: Create Room */}
          <div>
            <button
              onClick={handleCreate}
              disabled={!nickname.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-fab-gold to-amber-500 hover:from-amber-500 hover:to-fab-gold disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 disabled:border-zinc-700 text-zinc-950 font-bold rounded-xl transition-all shadow-md shadow-fab-gold/10 hover:shadow-fab-gold/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={18} />
              Criar Nova Sala
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-zinc-800"></div>
            <span className="px-3 text-xs text-zinc-500 uppercase font-medium">Ou entre em uma</span>
            <div className="flex-1 border-t border-zinc-800"></div>
          </div>

          {/* Action: Join Room */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-fab-gold uppercase tracking-wider mb-2">
                Código da Sala (4-5 Caracteres)
              </label>
              <input
                type="text"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                placeholder="Ex: A1B2"
                maxLength={6}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-fab-gold/50 rounded-xl text-white outline-none transition-all placeholder:text-zinc-600 font-mono text-center tracking-widest text-lg font-bold"
              />
            </div>

            <button
              onClick={handleJoin}
              disabled={!nickname.trim() || !roomIdInput.trim()}
              className="w-full py-3.5 bg-zinc-900 border border-zinc-700 hover:border-fab-gold text-white hover:text-fab-gold disabled:border-zinc-800 disabled:text-zinc-600 disabled:hover:border-zinc-800 font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn size={18} />
              Entrar na Sala
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
