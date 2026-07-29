import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

export default function DiceRollAnimation({ diceResult, players, firstBannerIndex }) {
  const [animationClass, setAnimationClass] = useState('');
  const [statusText, setStatusText] = useState('Preparando o sorteio... Leia as regras acima!');
  const [showWinner, setShowWinner] = useState(false);

  const hostName = players[0]?.name;
  const joineeName = players[1]?.name;
  const winnerName = players[firstBannerIndex]?.name;

  useEffect(() => {
    // 1. Wait 3.5 seconds for users to read the rules, then start spinning
    const startTimer = setTimeout(() => {
      setAnimationClass('dice-rolling');
      setStatusText('Embaralhando o destino... ROLANDO O DADO!');

      // 2. Spin for 3.0 seconds, then start decelerating to the final face
      const stopTimer = setTimeout(() => {
        setAnimationClass(`roll-${diceResult}`);
        setStatusText(`O dado parou em: ${diceResult}!`);

        // 3. Show winner after deceleration completes (3.5s transition, total 10.0s)
        const winnerTimer = setTimeout(() => {
          setShowWinner(true);
        }, 3500);

        return () => clearTimeout(winnerTimer);
      }, 3000);

      return () => clearTimeout(stopTimer);
    }, 3500);

    return () => clearTimeout(startTimer);
  }, [diceResult]);

  // Helper to render dots on the dice faces
  const renderDots = (faceNum) => {
    const dotsCountMap = {
      1: [1],
      2: [1, 2],
      3: [1, 2, 3],
      4: [1, 2, 3, 4],
      5: [1, 2, 3, 4, 5],
      6: [1, 2, 3, 4, 5, 6]
    };
    
    return (
      <div className="dice-dots">
        {dotsCountMap[faceNum].map((dotIndex) => (
          <div key={dotIndex} className={`dot dot-${faceNum}-${dotIndex}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8">
      <div className="w-full max-w-md p-8 rounded-2xl glass-panel text-center relative overflow-hidden">
        {/* Decorative Top Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-fab-gold to-transparent opacity-60"></div>
        
        <h1 className="text-sm font-bold text-fab-gold uppercase tracking-widest mb-6">
          Sorteio de Ordem
        </h1>

        {/* Dice Rules Explanation Card */}
        <div className="mb-6 p-4 bg-zinc-950/80 border border-zinc-900 rounded-xl text-left text-xs space-y-2.5">
          <span className="text-[10px] text-fab-gold font-bold uppercase tracking-widest block border-b border-zinc-900 pb-1.5">
            Lógica do Sorteio (Dado 1d6)
          </span>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400 font-medium">Se cair em 1, 2 ou 3:</span>
            <span className="text-white font-bold">{hostName} <span className="text-zinc-500 font-normal">(Criador)</span> bane primeiro</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400 font-medium">Se cair em 4, 5 ou 6:</span>
            <span className="text-white font-bold">{joineeName} <span className="text-zinc-500 font-normal">(Oponente)</span> bane primeiro</span>
          </div>
        </div>

        {/* 3D Dice Scene */}
        <div className="py-8 my-4">
          <div className="dice-scene">
            <div className={`dice ${animationClass}`}>
              <div className="dice-face face-1">{renderDots(1)}</div>
              <div className="dice-face face-2">{renderDots(2)}</div>
              <div className="dice-face face-3">{renderDots(3)}</div>
              <div className="dice-face face-4">{renderDots(4)}</div>
              <div className="dice-face face-5">{renderDots(5)}</div>
              <div className="dice-face face-6">{renderDots(6)}</div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        <div className="mt-8 space-y-4">
          <p className="text-lg font-bold text-white transition-all duration-300">
            {statusText}
          </p>

          <div className={`transition-all duration-500 transform ${showWinner ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
            <div className="p-4 bg-zinc-950 border border-fab-gold/30 rounded-xl max-w-xs mx-auto">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                Primeiro a Banir
              </span>
              <span className="text-lg font-extrabold text-fab-gold block truncate">
                {winnerName}
              </span>
              <span className="text-[11px] text-zinc-400 mt-2 block font-medium">
                {diceResult <= 3 
                  ? `Dado ${diceResult} (≤ 3): Criador (${hostName}) inicia` 
                  : `Dado ${diceResult} (≥ 4): Oponente (${joineeName}) inicia`
                }
              </span>
            </div>
            
            <p className="text-xs text-zinc-500 mt-4 animate-pulse">
              Redirecionando para a fase de banimentos em instantes...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
