'use client'

import { useState } from "react";
import Play from "@/components/Play";
import { Canvas } from '@react-three/fiber'
import MessagePretty from "@/components/MessagePretty";
import StartButton from "@/components/StartButton";

export default function Home() {
  const [showPlayComponent, setShowPlayComponent] = useState<boolean>(false);

  if (showPlayComponent) {
    return (
      <Play />
    );
  }

  const colors = ['#EA4335', '#34A853','#FBBC04', '#4285F4'];
  const playerOneBlocks = Array.from(Array(100).keys()).map((index) => {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const randomNumber = Math.random() - 0.5;
    const xPosition = randomNumber * 10;
    const yPosition = (index / 5) + randomNumber;
    const uuid = crypto.randomUUID();
    return { randomNumber, xPosition, yPosition, uuid, color }
  });


  return (
    <>
      <div className="absolute min-h-screen top-0 bottom-0 left-0 right-0 -z-10 bg-[#121212]">
        <Canvas>
          <ambientLight intensity={Math.PI / 2} />
          <pointLight position={[-10, -10, -10]} decay={0} intensity={2} />
          <pointLight position={[5, 5, 5]} decay={0} intensity={3} />
          {playerOneBlocks.map(({ randomNumber, xPosition, yPosition, uuid, color }) => {
            return (
              <MessagePretty
                key={uuid}
                position={[xPosition, yPosition, -3]}
                endPoint={[randomNumber,0,0]}
                color={color}
              />
            )
          })}
        </Canvas>
      </div>
      <main className="flex flex-col min-h-screen items-center justify-center p-24 text-white">
        <div className="text-center bg-black/40 p-12 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl max-w-4xl">
          <h2 className="text-xl font-bold tracking-widest text-[#4285F4] uppercase mb-4">Google Developer Groups Arcade</h2>
          <h1 className="mb-8 text-6xl font-extrabold tracking-tight">
            Load Balancing <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EA4335] to-[#FBBC04]">Blitz</span>
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Race against the Google Cloud Load Balancer! Route incoming traffic across your 4 virtual machines before they overload. Keep moving, stay balanced, and don't let the queues fill up.
          </p>
          
          <div className="flex flex-col items-center gap-6">
            <StartButton
              onClick={() => setShowPlayComponent(true)}
              showPassword={false}
            />
            <div className="text-sm text-gray-400 bg-white/5 px-6 py-3 rounded-full border border-white/10">
              <span className="font-semibold text-white">Controls:</span> Press <kbd className="bg-white/20 px-2 py-1 rounded text-white font-mono mx-1">1</kbd> <kbd className="bg-white/20 px-2 py-1 rounded text-white font-mono mx-1">2</kbd> <kbd className="bg-white/20 px-2 py-1 rounded text-white font-mono mx-1">3</kbd> <kbd className="bg-white/20 px-2 py-1 rounded text-white font-mono mx-1">4</kbd> to distribute requests.
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
