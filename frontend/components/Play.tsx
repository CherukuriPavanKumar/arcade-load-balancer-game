'use client'

import React, { memo, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Line } from '@react-three/drei'
const MessagePath = memo(Line);
import { useRouter } from 'next/navigation'
import { useGameEngine } from '@/hooks/useGameEngine'
import UtilizationBox from '@/components/UtilizationBox'
import EmptyVmBox from '@/components/EmptyVmBox'
import LoadBalancerBox from '@/components/LoadBalancerBox'
import MessageIncoming from '@/components/MessageIncoming'
import MessageFailure from '@/components/MessageFailure'
import MessageSuccess from '@/components/MessageSuccess'
import Results from '@/components/Results';

const totalGameTime = 60;
const player1VmXPositions = [-5.0, -3.5, -2.0, -0.6];
const player2VmXPositions = player1VmXPositions.map(xPosition => -1 * xPosition).reverse();
const vmYPosition = -1.7;
const vmYPositionTop = vmYPosition + 0.5;
const vmYPositionBottom = vmYPosition - 0.6;
const playerEndPositions: [number, number, number][] = player1VmXPositions.map(xPosition => ([xPosition, vmYPositionBottom, 0]));
const loadBalancerXPosition = -2.9;
const loadBalancerYPosition = vmYPositionTop + 2;
const playerMidYPosition = loadBalancerYPosition;

const playerOneLoadBalancerPosition: [number, number, number] = [loadBalancerXPosition, loadBalancerYPosition, 0];
const lineOneStart: [number, number, number] = [playerOneLoadBalancerPosition[0], playerOneLoadBalancerPosition[1] + 0.3, playerOneLoadBalancerPosition[2]];
const playerTwoLoadBalancerPosition: [number, number, number] = [-loadBalancerXPosition, loadBalancerYPosition, 0];
const lineTwoStart: [number, number, number] = [playerTwoLoadBalancerPosition[0], playerTwoLoadBalancerPosition[1] + 0.3, playerTwoLoadBalancerPosition[2]];;

const startingBoxZ = -7;

const colors = {
  utilization: '#FFFFFF',
  black: '#202124',
  red: '#EA4335',
  green: '#34A853',
  player1: '#FBBC04',
  player2: '#4285F4',
}

const playerOneBlocks = Array.from(Array(100).keys()).map((index) => {
  const randomNumber = Math.random() - 0.5;
  const xPosition = loadBalancerXPosition + randomNumber;
  const yPosition = (index / 5) + 7 + randomNumber;
  const uuid = crypto.randomUUID();
  return { xPosition, yPosition, uuid }
});

const playerTwoBlocks = Array.from(Array(100).keys()).map((index) => {
  const randomNumber = Math.random() - 0.5;
  const xPosition = -loadBalancerXPosition + randomNumber;
  const yPosition = (index / 5) + 7 + randomNumber;
  const uuid = crypto.randomUUID();
  return { xPosition, yPosition, uuid }
});



type ResultBlock = {
  uid: string,
  startingPosition: [number, number, number],
}

type FailResultBlock = {
  uid: string,
  startingPosition: [number, number, number],
  side: 'LEFT' | 'RIGHT',
}

export default function Play() {
  // TODO: Add pseudonyms for users
  const [playerOneEnd, setPlayerOneEnd] = useState<[number, number, number]>(playerEndPositions[0]);
  const [timeElapsed, setTimeElapsed] = useState(-5);
  const [failBlocks, setFailBlocks] = useState<FailResultBlock[]>([]);
  const [successBlocks, setSuccessBlocks] = useState<ResultBlock[]>([]);
  const [playerTwoTotal, setTotalPlayerTwoTotal] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const engine = useGameEngine();

  // calculated values based on variables
  const playerOneMid: [number, number, number] = [playerOneEnd[0], playerMidYPosition, 0]
  const player2NextVmIndex = playerTwoTotal % 4;
  const player2NextXPosition = player2VmXPositions[player2NextVmIndex];
  const playerTwoEnd: [number, number, number] = [player2NextXPosition, vmYPositionBottom, 0];
  const playerTwoMid: [number, number, number] = [playerTwoEnd[0], playerMidYPosition, 0]
  const playerOneActiveVmIndex = player1VmXPositions.findIndex(value => playerOneEnd[0] === value);
  const playerOneAtMaxCapacity = engine.vms[playerOneActiveVmIndex].atMaxCapacity;
  const playerOneActiveVmId = playerOneActiveVmIndex + 1
  const playerTwoActiveVmIndex = player2VmXPositions.findIndex(value => playerTwoEnd[0] === value);
  const playerTwoAtMaxCapacity = engine.vms[playerTwoActiveVmIndex + 4].atMaxCapacity;
  const playerOneScore = timeElapsed < 1 ? 0 : engine.playerOneScore;
  const playerTwoScore = timeElapsed < 1 ? 0 : engine.playerTwoScore;
  const timeRemaining = Math.max(0, Math.min(totalGameTime - timeElapsed, totalGameTime));

  useEffect(() => {
    engine.selectVm(playerOneActiveVmId);
  }, [playerOneActiveVmId])

  useEffect(() => {
    // add success block to any vm that has more than 0% in the queue
    const newSuccessXPosition = [];
    // add player one success block
    if (engine.vms[player2NextVmIndex].queue > 0) {
      newSuccessXPosition.push(player1VmXPositions[player2NextVmIndex])
    }
    // add player two success block
    if (engine.vms[player2NextVmIndex + 4].queue > 0) {
      newSuccessXPosition.push(player2VmXPositions[player2NextVmIndex])
    }
    const newSuccessBlocks = newSuccessXPosition.map(xPosition => {
      const startingPosition: [number, number, number] = [xPosition, vmYPosition + 0.42, -0.5];
      const uid = crypto.randomUUID();
      return { uid, startingPosition }
    })
    // limit to 100 blocks to prevent the screen from freezing up
    setSuccessBlocks(prev => [...newSuccessBlocks, ...prev].slice(0, 200));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player2NextVmIndex, engine.vms]);

  useEffect(() => {
    if (!engine.isRunning && timeElapsed > -2 && timeElapsed < totalGameTime) {
      engine.startGame();
    }
  }, [timeElapsed, engine]);

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'Digit1':
        return setPlayerOneEnd(playerEndPositions[0]);
      case 'Digit2':
        return setPlayerOneEnd(playerEndPositions[1]);
      case 'Digit3':
        return setPlayerOneEnd(playerEndPositions[2]);
      case 'Digit4':
        return setPlayerOneEnd(playerEndPositions[3]);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    //Implementing the setInterval method
    const interval = setInterval(() => {
      setTimeElapsed(timeElapsed + 1);
    }, 1000);

    //Clearing the interval
    return () => clearInterval(interval);
  }, [timeElapsed]);

  useEffect(() => {
    if (timeElapsed >= totalGameTime && !showResults) {
      engine.stopGame();
      setShowResults(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeElapsed]);

  const addFailBlock = (failBlockStartingPosition: [number, number, number]) => {
    const [x, y, z] = failBlockStartingPosition;
    if (x < 0) {
      const audio = new Audio('/beep.wav');
      audio.volume = 0.1;
      // audio.play();
    } else {
      setTotalPlayerTwoTotal(playerTwoTotal + 1);
    }
    const startingPosition: [number, number, number] = [x + Math.random() / 4 - 0.1, y, z];
    const uid = crypto.randomUUID();
    const side: 'LEFT' | 'RIGHT' = ['LEFT', 'RIGHT'][Math.floor(Math.random() * 2)] as 'LEFT' | 'RIGHT';
    const newBlock = { uid, startingPosition, side }
    // limit to 100 blocks to prevent the screen from freezing up
    setFailBlocks([newBlock, ...failBlocks].slice(0, 100));
  }

  return (
    <main className="flex h-screen flex-col items-center justify-between bg-[#121212] overflow-hidden">
      {/* Countdown */}
      <div className='absolute top-28 z-10'>
        <span className={`text-[12rem] font-black tracking-tighter text-white/10 transition-opacity duration-1000 ${timeRemaining > 0 && timeElapsed > -1 ? 'opacity-100' : 'opacity-0'}`}>
          {timeRemaining}
        </span>
      </div>
      <div className='flex w-full justify-center gap-4 p-6 z-20'>
        <div className='flex flex-row items-center transition-all duration-1000 justify-between px-6 rounded-l-full shadow-lg' style={{ height: '100px', width: `${Math.max(playerOneScore, 20)}%`, minWidth: '300px', backgroundColor: colors.player1 }}>
          <div className='flex flex-col'>
            <span className="text-sm font-bold text-black/60 uppercase tracking-widest">Player</span>
            <h2 className={`text-2xl font-black text-black`}>GDG Player</h2>
          </div>
          <h3 className='text-6xl font-black text-black drop-shadow-sm'>
            {playerOneScore}
          </h3>
        </div>
        <div className='flex flex-row items-center transition-all duration-1000 justify-between px-6 rounded-r-full shadow-lg' style={{ height: '100px', width: `${Math.max(playerTwoScore, 20)}%`, minWidth: '300px', backgroundColor: colors.player2 }}>
          <h3 className='text-6xl font-black text-white drop-shadow-sm'>
            {playerTwoScore}
          </h3>
          <div className='flex flex-col text-right'>
            <span className="text-sm font-bold text-white/70 uppercase tracking-widest">Google Cloud</span>
            <h2 className={`text-2xl font-black text-white`}>Load Balancer</h2>
          </div>
        </div>
      </div>
      <Canvas>
        <ambientLight intensity={Math.PI / 2} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={2} />
        <pointLight position={[5, 5, 5]} decay={0} intensity={3} />
        <LoadBalancerBox
          position={playerOneLoadBalancerPosition}
          playerColor={colors.player1}
        />
        <LoadBalancerBox
          position={playerTwoLoadBalancerPosition}
          playerColor={colors.player2}
        />
        {playerOneBlocks.map(({ xPosition, yPosition, uuid }) => {
          return (
            <MessageIncoming
              key={uuid}
              position={[xPosition, yPosition, startingBoxZ]}
              endPoint={playerOneMid}
              onVmContact={playerOneAtMaxCapacity ? () => addFailBlock([playerOneMid[0], vmYPositionTop + 0.3, playerOneMid[2]]) : () => { }}
              gameOver={showResults}
              color={colors.player1}
            />
          )
        })}
        {playerTwoBlocks.map(({ xPosition, yPosition, uuid }) => {
          return (
            <MessageIncoming
              key={uuid}
              position={[xPosition, yPosition, startingBoxZ]}
              endPoint={playerTwoEnd}
              onVmContact={playerTwoAtMaxCapacity ? () => addFailBlock(playerTwoEnd) : () => setTotalPlayerTwoTotal(playerTwoTotal + 1)}
              gameOver={showResults}
              color={colors.player2}
            />
          )
        })}
        {failBlocks.map((block) => {
          return (
            <MessageFailure
              key={block.uid}
              position={block.startingPosition}
              type={'FAILURE'}
              side={block.side}
            />
          )
        })}
        {successBlocks.map((block) => {
          return (
            <MessageSuccess
              key={block.uid}
              position={block.startingPosition}
              type={'SUCCESS'}
            />
          )
        })}
        <MessagePath
          points={[lineOneStart, playerOneMid, playerOneEnd]}
          color={colors.player1}
          lineWidth={10}
        />
        <MessagePath
          points={[lineTwoStart, playerTwoMid, playerTwoEnd]}
          color={colors.player2}
          lineWidth={10}
        />
        {/* Player VMs */}
        {player1VmXPositions.map((vmXPosition, index) => {
          const { atMaxCapacity } = engine.vms[index];
          return <EmptyVmBox
            key={vmXPosition}
            vmXPosition={vmXPosition}
            atMaxCapacity={atMaxCapacity}
            playerColor={colors.player1}
            index={index}
          />
        })}
        {/* Player VMs Utilization */}
        {player1VmXPositions.map((vmXPosition, index) => (
          <UtilizationBox
            position={[vmXPosition, vmYPosition - 0.45, 0.1]}
            key={vmXPosition}
            utilization={engine.vms[index].utilization}
          />
        ))}
        {/* Global Load Balancer VMs */}
        {player2VmXPositions.map((vmXPosition, index) => {
          const { atMaxCapacity } = engine.vms[index + 4];
          return <EmptyVmBox
            key={vmXPosition}
            vmXPosition={vmXPosition}
            atMaxCapacity={atMaxCapacity}
            playerColor={colors.player2}
            index={index + 4}
          />
        })}
        {/* Global Load Balancer VMs Utilization */}
        {player2VmXPositions.map((vmXPosition, index) => (
          <UtilizationBox
            position={[vmXPosition, vmYPosition - 0.45, 0.1]}
            key={vmXPosition}
            utilization={engine.vms[index + 4].utilization}
          />
        ))}
      </Canvas>
      {/* Start Game Countdown */}
      <div className={`flex items-center justify-center transition-all fixed inset-0 bg-black/80 backdrop-blur-sm duration-1000 ${timeElapsed < -1 ? 'opacity-100' : 'opacity-0'}  ${timeElapsed < 0 ? 'z-50' : '-z-50'}`}>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-[#4285F4] uppercase tracking-widest mb-4">Get Ready</span>
          <span className="text-[12rem] font-black text-white">{Math.abs(timeElapsed)}</span>
        </div>
      </div>
      {/* Results */}
      {showResults && <Results playerOneScore={playerOneScore} playerTwoScore={playerTwoScore} />}
    </main>
  );
}
