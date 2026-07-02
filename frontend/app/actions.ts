'use server'

const QUEUE_CAPACITY = 100;
const PROCESS_RATE = 2; // Tasks processed per tick
const INCOMING_RATE = 5; // Tasks incoming per tick

let gameState = {
  isRunning: false,
  startTime: 0,
  playerVmSelected: 0, // 0 to 3
  aiNextVmSelected: 0,
  vms: Array.from({ length: 8 }, (_, i) => ({
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
  })),
  playerName: 'GDG Player',
};

let gameLoop: NodeJS.Timeout | null = null;

export async function checkSecretPasswordExists() { return false; }

export async function setVm(vmSelected: { vmId: number }, secretPassword?: string) {
  gameState.playerVmSelected = vmSelected.vmId - 1; // 0-indexed
  return { success: true };
}

export async function stopGame(secretPassword?: string) {
  gameState.isRunning = false;
  if (gameLoop) clearInterval(gameLoop);
  gameLoop = null;
  return { success: true };
}

export async function resetGame(secretPassword?: string) {
  await stopGame();
  gameState.vms.forEach(vm => {
    vm.score = 0;
    vm.tasksCompleted = 0;
    vm.tasksRegistered = 0;
    vm.queue = 0;
    vm.crashCount = 0;
    vm.atMaxCapacity = false;
    vm.utilization = 0;
  });
  return { success: true };
}

export async function startLoader(secretPassword?: string) {
  if (gameState.isRunning) return { player_name: gameState.playerName };
  await resetGame();
  gameState.isRunning = true;
  gameState.startTime = Date.now();
  
  gameLoop = setInterval(() => {
    if (!gameState.isRunning) return;
    
    // AI Load Balancer Logic (Round Robin)
    gameState.aiNextVmSelected = (gameState.aiNextVmSelected + 1) % 4;
    
    // Incoming traffic
    // Player
    const pVm = gameState.vms[gameState.playerVmSelected];
    if (pVm.queue + INCOMING_RATE > QUEUE_CAPACITY) {
        pVm.atMaxCapacity = true;
        pVm.crashCount++;
    } else {
        pVm.queue += INCOMING_RATE;
        pVm.tasksRegistered += INCOMING_RATE;
        pVm.atMaxCapacity = false;
    }
    
    // AI
    const aVm = gameState.vms[4 + gameState.aiNextVmSelected];
    if (aVm.queue + INCOMING_RATE > QUEUE_CAPACITY) {
        aVm.atMaxCapacity = true;
        aVm.crashCount++;
    } else {
        aVm.queue += INCOMING_RATE;
        aVm.tasksRegistered += INCOMING_RATE;
        aVm.atMaxCapacity = false;
    }

    // Process Queues
    gameState.vms.forEach(vm => {
      const processed = Math.min(vm.queue, PROCESS_RATE + Math.floor(Math.random() * 2));
      vm.queue -= processed;
      vm.tasksCompleted += processed;
      vm.score += processed * 10;
      vm.utilization = vm.queue / QUEUE_CAPACITY;
    });
    
  }, 250); // 4 ticks per second

  return { player_name: gameState.playerName };
}

export async function getVmAllStats(secretPassword?: string) {
  const statusArray = gameState.vms.map(vm => ({ ...vm }));
  return {
    statusArray,
    playerName: gameState.playerName,
    gameVmSelection: gameState.vms[gameState.playerVmSelected].hostName,
    gameVmSelectionIndex: gameState.playerVmSelected,
    gameVmSelectionUpdates: 0,
    playerOneScore: statusArray.slice(0, 4).reduce((sum, vm) => sum + vm.score, 0),
    playerTwoScore: statusArray.slice(4).reduce((sum, vm) => sum + vm.score, 0),
  };
}
