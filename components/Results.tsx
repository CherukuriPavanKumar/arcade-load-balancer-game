'use client'

import React, { memo, useEffect, useState } from 'react'

export default memo(function Results({ playerOneScore, playerTwoScore }: { playerOneScore: number, playerTwoScore: number }) {
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.code === 'KeyS' || event.code === 'Enter') {
        window.location.reload();
      }
    };
    const timeout = setTimeout(() => setShowResults(true), 200);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const playerEfficiency = playerTwoScore > 0 ? (Number(playerOneScore) / Number(playerTwoScore) * 100).toFixed(1) : `00.0`;
  const isWinner = playerOneScore >= playerTwoScore;

  return (
    <div className={`flex flex-col items-center justify-center transition-all fixed inset-0 bg-black/80 backdrop-blur-xl duration-1000 z-50 ${showResults ? 'opacity-100' : 'opacity-0'}`}>
      <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-12 shadow-2xl max-w-3xl w-full text-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-32 blur-3xl opacity-20 ${isWinner ? 'bg-[#34A853]' : 'bg-[#EA4335]'}`} />
        
        <h2 className="text-xl font-bold tracking-widest text-[#4285F4] uppercase mb-2">Game Over</h2>
        <h1 className={`text-6xl font-black mb-8 ${isWinner ? 'text-[#34A853]' : 'text-[#EA4335]'}`}>
          {isWinner ? 'You Beat The AI!' : 'The AI Won!'}
        </h1>
        
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col items-center">
            <span className="text-sm font-bold text-white/50 uppercase tracking-widest mb-2">Your Score</span>
            <span className="text-6xl font-mono text-[#FBBC04]">{playerOneScore}</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col items-center">
            <span className="text-sm font-bold text-white/50 uppercase tracking-widest mb-2">GLB Score</span>
            <span className="text-6xl font-mono text-[#4285F4]">{playerTwoScore}</span>
          </div>
        </div>
        
        <p className="text-2xl text-gray-300 mb-12">
          You performed <span className="font-bold text-white">{playerEfficiency}%</span> as well as the<br/>Google Cloud Load Balancer.
        </p>
        
        <button
          onClick={() => window.location.reload()}
          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 hover:scale-105"
        >
          <span className="text-xl tracking-wider uppercase font-sans mr-2">
            Play Again
          </span>
          <span className="inline-block transition-transform group-hover:translate-x-2">
            &rarr;
          </span>
          <span className="absolute -bottom-8 text-sm text-gray-500 font-normal">
            Or press <kbd className="font-mono text-gray-400 mx-1">S</kbd>
          </span>
        </button>
      </div>
    </div>
  );
});
