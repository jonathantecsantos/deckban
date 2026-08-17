import React, { useState, useEffect } from 'react';
import { Check, Copy, RefreshCw, Trophy, Swords, XCircle, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MatchSummary({ players, nickname, onResetRoom }) {
  const [copied, setCopied] = useState(false);

  // Identify players
  const player1 = players[0];
  const player2 = players[1];

  // For player 1
  const p1Banned = player2.bannedOpponentDeck; // Deck banned by player 2
  const p1ValidDecks = player1.decks.filter(d => d !== p1Banned);

  // For player 2
  const p2Banned = player1.bannedOpponentDeck; // Deck banned by player 1
  const p2ValidDecks = player2.decks.filter(d => d !== p2Banned);

  // Run confetti when summary mounts
  useEffect(() => {
    // Standard celebratory confetti burst
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#d4af37', '#ffffff', '#9e1a1a']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#d4af37', '#ffffff', '#9e1a1a']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  // Format matchup data to Markdown
  const getMarkdownText = () => {
    const p1Text = `${player1.name} (${p1ValidDecks.join(', ')})`;
    const p2Text = `${player2.name} (${p2ValidDecks.join(', ')})`;
    return `${p1Text} vs ${p2Text}`;
  };

  const handleCopy = () => {
    const text = getMarkdownText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Trophy / Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-fab-gold/10 border border-fab-gold/30 rounded-full text-fab-gold mb-4 shadow-lg shadow-fab-gold/10 animate-bounce">
          <Trophy size={40} />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-wide">
          Confronto Definido!
        </h1>
        <p className="text-sm text-zinc-400 mt-2">
          Os banimentos foram efetuados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-10">
        {/* PLAYER 1 CARD */}
        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-2 h-full bg-fab-gold"></div>
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white block truncate">
                {player1.name}
              </h3>
              {player1.name === nickname && (
                <span className="px-2 py-0.5 bg-fab-gold/10 border border-fab-gold/20 text-fab-gold text-[10px] font-bold rounded uppercase">
                  Você
                </span>
              )}
            </div>

            {/* Valid Decks */}
            <div className="space-y-3 mb-6">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                Decks Disponíveis para Jogar
              </span>
              {p1ValidDecks.map((deck, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl">
                  <div className="p-1 bg-emerald-500/10 text-emerald-400 rounded-full">
                    <Play size={14} fill="currentColor" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-200 truncate">{deck}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Banned Deck */}
          <div className="pt-4 border-t border-zinc-900/80">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">
              Deck Banido pelo Oponente
            </span>
            <div className="flex items-center gap-3 p-3 bg-red-950/10 border border-red-950/30 rounded-xl opacity-60">
              <div className="p-1 bg-red-500/10 text-red-400 rounded-full">
                <XCircle size={14} />
              </div>
              <span className="text-sm font-medium text-zinc-400 line-through truncate">{p1Banned}</span>
            </div>
          </div>
        </div>

        {/* PLAYER 2 CARD */}
        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white block truncate">
                {player2.name}
              </h3>
              {player2.name === nickname && (
                <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded uppercase">
                  Você
                </span>
              )}
            </div>

            {/* Valid Decks */}
            <div className="space-y-3 mb-6">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                Decks Disponíveis para Jogar
              </span>
              {p2ValidDecks.map((deck, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl">
                  <div className="p-1 bg-emerald-500/10 text-emerald-400 rounded-full">
                    <Play size={14} fill="currentColor" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-200 truncate">{deck}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Banned Deck */}
          <div className="pt-4 border-t border-zinc-900/80">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">
              Deck Banido pelo Oponente
            </span>
            <div className="flex items-center gap-3 p-3 bg-red-950/10 border border-red-950/30 rounded-xl opacity-60">
              <div className="p-1 bg-red-500/10 text-red-400 rounded-full">
                <XCircle size={14} />
              </div>
              <span className="text-sm font-medium text-zinc-400 line-through truncate">{p2Banned}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MATCH EXPORTER TOOL */}
      <div className="w-full p-6 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] text-fab-gold font-bold uppercase tracking-widest block mb-1">
            Formato de Exportação (WhatsApp)
          </span>
          <code className="text-xs bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-white font-mono block truncate max-w-full">
            {getMarkdownText()}
          </code>
        </div>

        <button
          onClick={handleCopy}
          className="px-6 py-3 bg-gradient-to-r from-fab-gold to-amber-500 hover:from-amber-500 hover:to-fab-gold text-zinc-950 font-bold rounded-xl transition-all shadow-md shadow-fab-gold/5 flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? 'Copiado!' : 'Copiar dados do confronto'}
        </button>
      </div>

      {/* RESET ROOM BUTTON */}
      <button
        onClick={onResetRoom}
        className="flex items-center gap-2 px-6 py-3 border border-zinc-800 hover:border-fab-gold text-zinc-400 hover:text-fab-gold font-bold rounded-xl transition-all cursor-pointer bg-zinc-950/20"
      >
        <RefreshCw size={16} />
        Reiniciar Confronto (Novos Decks)
      </button>
    </div>
  );
}
