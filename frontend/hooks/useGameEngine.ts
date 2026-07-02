import { useState, useEffect, useRef } from 'react';

const QUEUE_CAPACITY = 100;
const PROCESS_RATE = 2; // Tasks processed per tick
const INCOMING_RATE = 5; // Tasks incoming per tick

type VmStatus = {
  cpu: number;
  memory: number;
  score: number;
  hostName: string;
  queue: number;
  tasksCompleted: number;
  tasksRegistered: number;
  utilization: number;
  atMaxCapacity: boolean;
  crashCount: number;
};

export function useGameEngine() {
  const [isRunning, setIsRunning] = useState(false);
  const [playerVmSelected, setPlayerVmSelected] = useState(0);
  
  const [vms, setVms] = useState<VmStatus[]>(() => 
    Array.from({ length: 8 }, (_, i) => ({
      cpu: Math.random() * 10,
      memory: 11.5,
      score: 0,
      tasksCompleted: 0,
      tasksRegistered: 0,
      hostName: i < 4 ? `vm-player-0${i+1}` : `vm-ai-0${i-3}`,
      crashCount: 0,
      queue: 0,
      utilization: 0,
      atMaxCapacity: false,
    }))
  );

  const aiNextVmSelected = useRef(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setVms(currentVms => {
        const nextVms = currentVms.map(vm => ({ ...vm }));
        
        // AI Load Balancer Logic (Round Robin)
        aiNextVmSelected.current = (aiNextVmSelected.current + 1) % 4;
        
        // Incoming traffic - Player
        const pVm = nextVms[playerVmSelected];
        if (pVm.queue + INCOMING_RATE > QUEUE_CAPACITY) {
            pVm.atMaxCapacity = true;
            pVm.crashCount++;
        } else {
            pVm.queue += INCOMING_RATE;
            pVm.tasksRegistered += INCOMING_RATE;
            pVm.atMaxCapacity = false;
        }
        
        // Incoming traffic - AI
        const aVm = nextVms[4 + aiNextVmSelected.current];
        if (aVm.queue + INCOMING_RATE > QUEUE_CAPACITY) {
            aVm.atMaxCapacity = true;
            aVm.crashCount++;
        } else {
            aVm.queue += INCOMING_RATE;
            aVm.tasksRegistered += INCOMING_RATE;
            aVm.atMaxCapacity = false;
        }

        // Process Queues
        nextVms.forEach(vm => {
          const processed = Math.min(vm.queue, PROCESS_RATE + Math.floor(Math.random() * 2));
          vm.queue -= processed;
          vm.tasksCompleted += processed;
          vm.score += processed * 10;
          vm.utilization = vm.queue / QUEUE_CAPACITY;
        });

        return nextVms;
      });
    }, 250); // 4 ticks per second

    return () => clearInterval(interval);
  }, [isRunning, playerVmSelected]);

  const startGame = () => {
    setVms(current => current.map(vm => ({
      ...vm,
      score: 0,
      tasksCompleted: 0,
      tasksRegistered: 0,
      queue: 0,
      crashCount: 0,
      atMaxCapacity: false,
      utilization: 0,
    })));
    setIsRunning(true);
  };

  const stopGame = () => {
    setIsRunning(false);
  };

  const selectVm = (vmId: number) => {
    setPlayerVmSelected(vmId - 1);
  };

  return {
    vms,
    isRunning,
    startGame,
    stopGame,
    selectVm,
    playerOneScore: vms.slice(0, 4).reduce((sum, vm) => sum + vm.score, 0),
    playerTwoScore: vms.slice(4).reduce((sum, vm) => sum + vm.score, 0),
  };
}
