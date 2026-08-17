import React, { useState } from 'react';
import { ShieldAlert, Flame, User, Clock, CheckCircle } from 'lucide-react';

export default function BanPhase({ players, nickname, onBanDeck }) {
  const [selectedDeck, setSelectedDeck] = useState(null);

  const me = players.find(p => p.name === nickname);
  const opponent = players.find(p => p.name !== nickname);

  // Check if I have already banned a deck (using hasBanned flag from backend)
  const didIBan = me?.hasBanned;
  const opponentBanned = opponent?.hasBanned;

  // The deck of the opponent that I banned
  const opponentBannedDeck = me?.bannedOpponentDeck;

  const handleBanSubmit = () => {
    if (!selectedDeck || didIBan) return;
    onBanDeck(selectedDeck);
    setSelectedDeck(null); // Reset local selection
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <h1 className="sr-only">Fase de Banimento Secreto de Decks</h1>
      
      {/* Dynamic Banner Status */}
      <div className="mb-10 text-center">
        {!didIBan ? (
          <div className="inline-flex flex-col items-center p-6 rounded-2xl border border-red-500/30 bg-gradient-to-b from-red-950/20 to-zinc-950/80 shadow-lg shadow-red-500/5 animate-pulse max-w-xl w-full">
            <div className="flex items-center gap-2 text-red-500 font-extrabold tracking-widest text-sm uppercase mb-1">
              <Flame size={16} />
              Escolha seu banimento
            </div>
            <p className="text-zinc-200 text-base font-medium">
              Selecione 1 deck de {opponent?.name} abaixo para banir do confronto.
            </p>
          </div>
        ) : (
          <div className="inline-flex flex-col items-center p-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 max-w-xl w-full">
            <div className="flex items-center gap-2 text-fab-gold font-bold tracking-widest text-xs uppercase mb-1">
              <Clock className="animate-spin" size={14} />
              Aguardando oponente...
            </div>
            <p className="text-zinc-400 text-sm font-medium">
              Você baniu secretamente: <strong className="text-white">"{opponentBannedDeck}"</strong>.
            </p>
            <p className="text-xs text-zinc-500 mt-2">
              {opponentBanned 
                ? `${opponent?.name} também já baniu. Carregando resultado...` 
                : `Aguardando ${opponent?.name} enviar a escolha dele.`
              }
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
            {me?.decks.map((deck, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/25 opacity-80"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0 pr-4">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                      Herói {idx + 1}
                    </span>
                    <h4 className="text-base font-bold text-white truncate">
                      {deck}
                    </h4>
                  </div>

                  <div>
                    <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-bold rounded-md uppercase tracking-wider">
                      Ativo
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-zinc-950/40 border border-zinc-900/60 rounded-xl text-xs text-zinc-500">
            💡 O banimento do oponente permanece oculto para você até que ambos tenham finalizado suas escolhas.
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
              const isBannedByMe = opponentBannedDeck === deck;
              const isSelected = selectedDeck === deck;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (!didIBan) {
                      setSelectedDeck(isSelected ? null : deck);
                    }
                  }}
                  className={`p-5 rounded-xl border transition-all duration-300 ${
                    didIBan
                      ? isBannedByMe
                        ? 'border-red-950 bg-red-950/10 glow-crimson opacity-90 scale-[1.01]'
                        : 'border-zinc-900 bg-zinc-950/40 opacity-40 cursor-not-allowed'
                      : isSelected
                      ? 'border-fab-gold bg-zinc-900/60 glow-gold cursor-pointer scale-[1.02]'
                      : 'border-zinc-800 bg-zinc-950/20 hover:border-fab-gold/50 cursor-pointer hover:scale-[1.01]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0 pr-4">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                        Herói {idx + 1}
                      </span>
                      <h4 className={`text-base font-bold text-white truncate ${didIBan && !isBannedByMe ? 'opacity-40' : ''}`}>
                        {deck}
                      </h4>
                    </div>

                    <div>
                      {isBannedByMe ? (
                        <span className="px-2 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold rounded-md uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle size={10} />
                          Selecionado
                        </span>
                      ) : !didIBan ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="w-4 h-4 accent-fab-gold rounded border-zinc-700 bg-zinc-950"
                          />
                        </div>
                      ) : (
                        <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-500 text-[10px] font-bold rounded-md uppercase tracking-wider">
                          Oculto
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Ban Button */}
          {!didIBan && (
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
