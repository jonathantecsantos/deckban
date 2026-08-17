import React, { useState } from 'react';
import { Copy, Check, Users, User, Clock, ShieldAlert } from 'lucide-react';

export default function WaitingRoom({ roomId, players, nickname, onSubmitDecks, onLeaveRoom }) {
  const [deck1, setDeck1] = useState('');
  const [deck2, setDeck2] = useState('');
  const [deck3, setDeck3] = useState('');
  const [copied, setCopied] = useState(false);

  const me = players.find(p => p.name === nickname);
  const opponent = players.find(p => p.name !== nickname);
  const isFull = players.length === 2;

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!deck1.trim() || !deck2.trim() || !deck3.trim()) return;
    onSubmitDecks([deck1.trim(), deck2.trim(), deck3.trim()]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Upper header section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="text-fab-gold" size={20} />
            Sala de Espera
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Compartilhe o código com seu oponente para começar o duelo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Room ID card */}
          <div className="flex items-center bg-zinc-950 border border-fab-gold/20 rounded-xl px-4 py-2">
            <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mr-3">Código:</span>
            <span className="text-white font-mono font-bold tracking-widest text-lg mr-3">{roomId}</span>
            <button
              onClick={handleCopy}
              className="text-fab-gold hover:text-white transition-colors cursor-pointer"
              title="Copiar código"
            >
              {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
            </button>
          </div>

          <button
            onClick={onLeaveRoom}
            className="px-4 py-2 border border-zinc-800 hover:border-red-500/50 text-zinc-400 hover:text-red-400 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            Sair da Sala
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Players List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl glass-panel relative overflow-hidden">
            <h3 className="text-sm font-bold text-fab-gold uppercase tracking-wider mb-4">Jogadores</h3>

            <div className="space-y-4">
              {/* Player 1 (Me or Host) */}
              <div className="flex items-center justify-between p-3 bg-zinc-950/60 rounded-xl border border-zinc-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-fab-gold/10 border border-fab-gold/30 flex items-center justify-center text-fab-gold font-bold">
                    <User size={18} />
                  </div>
                  <div>
                    <span className="text-white font-bold text-sm block truncate max-w-[120px]">
                      {me ? me.name : nickname}
                    </span>
                    <span className="text-[10px] text-fab-gold/80 font-bold uppercase tracking-wider">Você</span>
                  </div>
                </div>
                <div>
                  {me && me.ready ? (
                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg uppercase">
                      Pronto
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-zinc-800/80 text-zinc-500 text-xs font-bold rounded-lg uppercase">
                      Aguardando
                    </span>
                  )}
                </div>
              </div>

              {/* Player 2 (Opponent) */}
              {opponent ? (
                <div className="flex items-center justify-between p-3 bg-zinc-950/60 rounded-xl border border-zinc-900">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                      <User size={18} />
                    </div>
                    <div>
                      <span className="text-white font-bold text-sm block truncate max-w-[120px]">
                        {opponent.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Oponente</span>
                    </div>
                  </div>
                  <div>
                    {opponent.ready ? (
                      <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg uppercase">
                        Pronto
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-zinc-800/80 text-zinc-500 text-xs font-bold rounded-lg uppercase">
                        Aguardando
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 bg-zinc-950/20 border border-dashed border-zinc-800 rounded-xl">
                  <div className="w-8 h-8 border-2 border-t-fab-gold border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-3"></div>
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider animate-pulse">
                    Aguardando oponente...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick instructions panel */}
          <div className="p-5 bg-zinc-950/40 border border-zinc-900 rounded-2xl">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Clock size={14} className="text-fab-gold" />
              Como Funciona
            </h4>
            <ul className="text-xs text-zinc-500 space-y-2 list-disc list-inside">
              <li>Ambos os jogadores devem registrar seus 3 heróis.</li>
              <li>Os decks ficam ocultos até que ambos estejam "Prontos".</li>
              <li>O banimento é feito de forma simultânea e secreta por ambos.</li>
              <li>A revelação das escolhas ocorre apenas após os dois banirem.</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Deck Submission Form */}
        <div className="lg:col-span-2">
          {!isFull ? (
            <div className="flex flex-col items-center justify-center min-h-[250px] p-8 rounded-2xl glass-panel text-center">
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-full text-zinc-500 mb-4">
                <Clock size={40} className="animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Aguardando Conexão</h3>
              <p className="text-sm text-zinc-400 max-w-sm">
                Assim que um oponente entrar na sala usando o código <strong className="text-fab-gold font-mono">{roomId}</strong>, a submissão de decks será liberada para ambos.
              </p>
            </div>
          ) : (
            <div className="p-8 rounded-2xl glass-panel relative">
              <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 bg-fab-gold/10 border border-fab-gold/30 text-fab-gold text-xs font-bold rounded-full uppercase tracking-wider">
                Partida Encontrada
              </div>

              {me && me.ready ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/5">
                    <Check size={36} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Decks Submetidos!</h3>
                  <p className="text-sm text-zinc-400 max-w-md">
                    Seus decks foram registrados com sucesso. O duelo começará assim que {opponent?.name} finalizar a submissão dos decks dele.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Submissão de Decks</h3>
                    <p className="text-xs text-zinc-400">
                      Informe o nome ou o link (ex: Fabrary) dos 3 Decks/Heróis que você trouxe para este confronto.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-fab-gold uppercase tracking-wider mb-2">
                        Deck / Herói 1
                      </label>
                      <input
                        type="text"
                        value={deck1}
                        onChange={(e) => setDeck1(e.target.value)}
                        placeholder="Ex: Rhinar, Reckless Rampage"
                        required
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-fab-gold/50 rounded-xl text-white outline-none transition-all placeholder:text-zinc-600 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-fab-gold uppercase tracking-wider mb-2">
                        Deck / Herói 2
                      </label>
                      <input
                        type="text"
                        value={deck2}
                        onChange={(e) => setDeck2(e.target.value)}
                        placeholder="Ex: Kayo, Armed and Dangerous"
                        required
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-fab-gold/50 rounded-xl text-white outline-none transition-all placeholder:text-zinc-600 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-fab-gold uppercase tracking-wider mb-2">
                        Deck / Herói 3
                      </label>
                      <input
                        type="text"
                        value={deck3}
                        onChange={(e) => setDeck3(e.target.value)}
                        placeholder="Ex: Prism, Awakener of Sol"
                        required
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-fab-gold/50 rounded-xl text-white outline-none transition-all placeholder:text-zinc-600 font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-fab-gold to-amber-500 hover:from-amber-500 hover:to-fab-gold text-zinc-950 font-bold rounded-xl transition-all shadow-md shadow-fab-gold/10 hover:shadow-fab-gold/20 flex items-center justify-center gap-2 cursor-pointer text-base uppercase tracking-wider"
                  >
                    Submeter Decks & Ficar Pronto
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
