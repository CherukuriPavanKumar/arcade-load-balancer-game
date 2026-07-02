'use client'

import React, { useEffect } from 'react'

export default function StartButton({ onClick, showPassword }: { onClick: Function, showPassword: boolean }) {
  useEffect(() => {
    if (!showPassword) {
      const handleKeyDown = (event: KeyboardEvent): void => {
        if (event.code === 'KeyS' || event.code === 'Enter') {
          onClick(true);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [showPassword, onClick]);

  return (
    <button
      onClick={() => onClick()}
      className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-[#4285F4] rounded-full hover:bg-[#3367D6] hover:scale-105 shadow-[0_0_20px_rgba(66,133,244,0.4)]"
    >
      <span className="text-2xl tracking-wider uppercase font-sans">
        Start Game
      </span>
      <span className="absolute -bottom-8 text-sm text-gray-400 font-normal">
        Or press <kbd className="font-mono text-white">S</kbd>
      </span>
    </button>
  );
}
