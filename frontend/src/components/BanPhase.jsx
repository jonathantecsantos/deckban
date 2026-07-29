import React, { useState } from 'react';
import { ShieldAlert, Flame, User, AlertCircle } from 'lucide-react';

export default function BanPhase({ players, nickname, turnName, onBanDeck }) {
  const [selectedDeck, setSelectedDeck] = useState(null);

  const me = players.find(p => p.name === nickname);
  const opponent = players.find(p => p.name !== nickname);

  const isMyTurn = turnName === nickname;

  // Check if I have already banned a deck
  const didIBan = me?.bannedOpponentDeck !== null;

  // Opponent's banned deck (the deck of mine that the opponent banned)
  const myBannedDeck = opponent?.bannedOpponentDeck;

  // My banned deck (the deck of the opponent that I banned)
  const opponentBannedDeck = me?.bannedOpponentDeck;

  const handleBanSubmit = () => {
    if (!selectedDeck || !isMyTurn || didIBan) return;
    onBanDeck(selectedDeck);
    setSelectedDeck(null); // Reset local selection
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <h1 className="sr-only">Fase de Banimento de Decks</h1>
      {/* Turn Banner Status */}
      <div className="mb-10 text-center">
        {isMyTurn ? (
          <div className="inline-flex flex-col items-center p-6 rounded-2xl border border-red-500/30 bg-gradient-to-b from-red-950/20 to-zinc-950/80 shadow-lg shadow-red-500/5 animate-pulse max-w-xl w-full">
            <div className="flex items-center gap-2 text-red-500 font-extrabold tracking-widest text-sm uppercase mb-1">
              <Flame size={16} />
              Sua vez de banir!
            </div>
            <p className="text-zinc-200 text-base font-medium">
              Escolha exatamente 1 deck do oponente abaixo para banir do confronto.
            </p>
          </div>
        ) : (
          <div className="inline-flex flex-col items-center p-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 max-w-xl w-full">
            <div className="flex items-center gap-2 text-zinc-500 font-bold tracking-widest text-xs uppercase mb-1">
              <div className="w-2 h-2 rounded-full bg-zinc-600 animate-ping"></div>
              Aguardando oponente...
            </div>
            <p className="text-zinc-400 text-sm font-medium">
              {opponent?.name} está escolhendo qual dos seus decks banir.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT COLUMN: MY DECKS (Our Decks) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="text-sm font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <User size={16} className="text-zinc-500" />
              Seus Decks (Aliados)
            </h3>
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
              {nickname}
            </span>
          </div>

          <div className="space-y-4">
            {me?.decks.map((deck, idx) => {
              const isBanned = myBannedDeck === deck;
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-xl border transition-all duration-300 ${
                    isBanned
                      ? 'border-red-950 bg-zinc-950/40 opacity-40 shadow-inner'
                      : 'border-zinc-800 bg-zinc-950/20 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0 pr-4">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                        Herói {idx + 1}
                      </span>
                      <h4 className={`text-base font-bold text-white truncate ${isBanned ? 'line-through text-red-500/70' : ''}`}>
                        {deck}
                      </h4>
                    </div>

                    <div>
                      {isBanned ? (
                        <span className="px-2 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold rounded-md uppercase tracking-wider">
                          Banido pelo Oponente
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-bold rounded-md uppercase tracking-wider">
                          Ativo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: OPPONENT'S DECKS (Decks to Ban) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="text-sm font-extrabold text-fab-gold uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert size={16} className="text-fab-gold" />
              Decks de {opponent?.name} (Inimigos)
            </h3>
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
              Alvos de Banimento
            </span>
          </div>

          <div className="space-y-4">
            {opponent?.decks.map((deck, idx) => {
              const isBanned = opponentBannedDeck === deck;
              const isSelected = selectedDeck === deck;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (isMyTurn && !didIBan && !isBanned) {
                      setSelectedDeck(isSelected ? null : deck);
                    }
                  }}
                  className={`p-5 rounded-xl border transition-all duration-300 ${
                    isBanned
                      ? 'border-red-950 bg-zinc-950/40 opacity-40 shadow-inner cursor-not-allowed'
                      : isMyTurn && !didIBan
                      ? isSelected
                        ? 'border-fab-gold bg-zinc-900/60 glow-gold cursor-pointer scale-[1.02]'
                        : 'border-zinc-800 bg-zinc-950/20 hover:border-fab-gold/50 cursor-pointer hover:scale-[1.01]'
                      : 'border-zinc-800 bg-zinc-950/20'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0 pr-4">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                        Herói {idx + 1}
                      </span>
                      <h4 className={`text-base font-bold text-white truncate ${isBanned ? 'line-through text-red-500/70' : ''}`}>
                        {deck}
                      </h4>
                    </div>

                    <div>
                      {isBanned ? (
                        <span className="px-2 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold rounded-md uppercase tracking-wider">
                          Banido por Você
                        </span>
                      ) : isMyTurn && !didIBan ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="w-4 h-4 accent-fab-gold rounded border-zinc-700 bg-zinc-950"
                          />
                        </div>
                      ) : (
                        <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-bold rounded-md uppercase tracking-wider">
                          Ativo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Ban Button */}
          {isMyTurn && !didIBan && (
            <div className="pt-4">
              <button
                onClick={handleBanSubmit}
                disabled={!selectedDeck}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 disabled:from-zinc-900 disabled:to-zinc-900 disabled:border-zinc-800 disabled:text-zinc-600 text-white font-bold rounded-xl transition-all shadow-md shadow-red-900/15 hover:shadow-red-900/30 cursor-pointer flex items-center justify-center gap-2 text-base uppercase tracking-wider border border-red-600/30"
              >
                <Flame size={18} />
                Banir Deck Selecionado
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
