/**
 * NEO-BATTLESHIP // TACTICAL INTERFACE ENGINE
 * Pure Vanilla JavaScript ES6
 * Cyberpunk Theme with Custom Audio Synthesis & Advanced Hunting AI
 */

// ==========================================================================
// 1. SOUND SYNTHESIS ENGINE (Web Audio API)
// ==========================================================================
class CyberAudioEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.volume = 0.5; // Master volume
        this.masterGainNode = null;
        
        // Background Music
        this.bgMusic = new Audio("HighPressure.mp3");
        this.bgMusic.loop = true;
        this.bgMusic.preload = "auto";
    }

    // Lazy load audio context due to browser autoplay policies
    init() {
        if (!this.ctx) {
            try {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                
                // Establish master gain control node
                this.masterGainNode = this.ctx.createGain();
                this.masterGainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
                this.masterGainNode.connect(this.ctx.destination);
            } catch (e) {
                console.error("Web Audio API not supported in this browser.", e);
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    updateMusicVolume() {
        if (this.bgMusic) {
            this.bgMusic.volume = (this.muted || !state.musicPlaying) ? 0 : this.volume;
        }
        const introVideo = document.getElementById('intro-video');
        if (introVideo) {
            introVideo.volume = this.muted ? 0 : this.volume;
        }
    }

    setVolume(value) {
        this.volume = parseFloat(value);
        if (this.ctx && this.masterGainNode) {
            this.masterGainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        }
        this.updateMusicVolume();
    }

    startMusic() {
        this.init();
        if (this.bgMusic) {
            this.updateMusicVolume();
            this.bgMusic.play().catch(err => {
                console.log("Error playing background music:", err);
            });
        }
    }

    stopMusic() {
        if (this.bgMusic) {
            this.bgMusic.pause();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        this.updateMusicVolume();
        return this.muted;
    }

    playClick() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const delay = this.ctx.createDelay();
        const feedback = this.ctx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(2000, now);
        osc1.frequency.exponentialRampToValueAtTime(1000, now + 0.04);
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(3000, now);
        osc2.frequency.exponentialRampToValueAtTime(1500, now + 0.04);
        
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        
        // Spatial feedback delay loop
        delay.delayTime.setValueAtTime(0.015, now);
        feedback.gain.setValueAtTime(0.3, now);
        
        osc1.connect(gain);
        osc2.connect(gain);
        
        gain.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        
        const output = this.masterGainNode || this.ctx.destination;
        gain.connect(output);
        feedback.connect(output);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.05);
        osc2.stop(now + 0.05);
    }

    playMiss() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        const delay = this.ctx.createDelay();
        const delayGain = this.ctx.createGain();

        // Modern deep sub-aquatic drop
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);

        filter.type = 'peaking';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.5);
        filter.Q.setValueAtTime(8, now);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        // Echo/room space
        delay.delayTime.setValueAtTime(0.08, now);
        delayGain.gain.setValueAtTime(0.4, now);

        osc.connect(filter);
        filter.connect(gain);

        const output = this.masterGainNode || this.ctx.destination;
        gain.connect(output);

        gain.connect(delay);
        delay.connect(delayGain);
        delayGain.connect(output);

        osc.start(now);
        osc.stop(now + 0.6);
    }

    playHit() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const output = this.masterGainNode || this.ctx.destination;

        // 1. Generate White Noise Buffer for the explosion hiss and crackle
        const sampleRate = this.ctx.sampleRate;
        const bufferSize = sampleRate * 1.0; // 1 second duration
        const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Low-pass filter to sweep noise from mid-high down to deep rumble
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(1000, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(10, now + 0.8);
        noiseFilter.Q.setValueAtTime(4, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.35, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(output);

        // 2. Generate a sub-bass oscillator boom for impact power
        const subOsc = this.ctx.createOscillator();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(150, now);
        subOsc.frequency.linearRampToValueAtTime(20, now + 0.35);

        const subGain = this.ctx.createGain();
        subGain.gain.setValueAtTime(0.65, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        subOsc.connect(subGain);
        subGain.connect(output);

        // Start both sources simultaneously
        noise.start(now);
        subOsc.start(now);
        noise.stop(now + 1.0);
        subOsc.stop(now + 0.4);
    }

    playSunk() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        
        // Pulses of low-frequency cinematic warning alerts
        for (let i = 0; i < 3; i++) {
            const startTime = now + i * 0.35;
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();
            
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(180, startTime);
            osc1.frequency.linearRampToValueAtTime(90, startTime + 0.3);
            
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(183.5, startTime);
            osc2.frequency.linearRampToValueAtTime(90, startTime + 0.3);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(400, startTime);
            filter.frequency.exponentialRampToValueAtTime(100, startTime + 0.3);
            filter.Q.setValueAtTime(6, startTime);
            
            gain.gain.setValueAtTime(0.18, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
            
            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);
            
            const output = this.masterGainNode || this.ctx.destination;
            gain.connect(output);
            
            osc1.start(startTime);
            osc2.start(startTime);
            osc1.stop(startTime + 0.31);
            osc2.stop(startTime + 0.31);
        }
    }

    playVictory() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25]; // C Major Chord (C4 - E4 - G4 - C5)
        
        const output = this.masterGainNode || this.ctx.destination;
        
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();
            const delay = this.ctx.createDelay();
            const delayGain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.1);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, now);
            filter.frequency.exponentialRampToValueAtTime(1500, now + 1.2);
            
            gain.gain.setValueAtTime(0.0, now + idx * 0.1);
            gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.1 + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
            
            delay.delayTime.setValueAtTime(0.15, now);
            delayGain.gain.setValueAtTime(0.4, now);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(output);
            
            gain.connect(delay);
            delay.connect(delayGain);
            delayGain.connect(output);
            
            osc.start(now + idx * 0.1);
            osc.stop(now + 2.0);
        });
    }

    playDefeat() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        
        // Deep cinematic sub-bass drone
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(80, now);
        osc1.frequency.linearRampToValueAtTime(30, now + 1.8);
        
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(81.5, now);
        osc2.frequency.linearRampToValueAtTime(30, now + 1.8);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, now);
        filter.frequency.exponentialRampToValueAtTime(40, now + 1.8);
        filter.Q.setValueAtTime(4, now);
        
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
        
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        
        const output = this.masterGainNode || this.ctx.destination;
        gain.connect(output);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.9);
        osc2.stop(now + 1.9);
    }
}

// Instantiate Sound Engine
const audio = new CyberAudioEngine();

// ==========================================================================
// 2. GAME VARIABLES & STATE DEFINITION
// ==========================================================================
const GRID_SIZE = 10;
const SHIP_TYPES = [
    { name: 'Carrier', size: 5, key: 'carrier' },
    { name: 'Battleship', size: 4, key: 'battleship' },
    { name: 'Cruiser', size: 3, key: 'cruiser' },
    { name: 'Submarine', size: 3, key: 'submarine' },
    { name: 'Destroyer', size: 2, key: 'destroyer' }
];

// Cell states
const CELL_EMPTY = 0;
const CELL_SHIP = 1;
const CELL_HIT = 2;
const CELL_MISS = 3;

// Cyberpunk AI Tactical Chatbot Taunts
const AI_TAUNTS_HIT = [
    "Target signature verified. Damage thresholds exceeded.",
    "Friendly hull integrity compromised in selected sector.",
    "Grid coordinate scan successful. Direct impact recorded.",
    "Thermal sensors indicate fire outbreak on your vessel.",
    "Target lock acquired. Launching secondary payloads."
];

const AI_TAUNTS_MISS = [
    "Acoustic sonar ping failed. Calibrating radar sweeps...",
    "Splash signature detected. Adjusting trajectory metrics.",
    "Target coordinate empty. Evasion probability: high.",
    "Sub-optimal trajectory. Adjusting thruster alignment.",
    "Grid sweep returned void. Commencing secondary scan."
];

const AI_TAUNTS_SUNK = [
    "Critical damage reached. Vessel decommissioned.",
    "Hostile target signature lost. Unit neutralized.",
    "Grid sector cleared. Enemy tactical capacity reduced.",
    "Target ship sinking. Commencing clean-up sweeps.",
    "Vessel structural failure. Defeat probability: rising."
];

const AI_TAUNTS_GENERAL = [
    "Neural network processing firing solutions. Evasion is illogical.",
    "My tactical matrix predicts your defeat at 94.6% confidence.",
    "Scanning grid sector... your defensive layout is sub-optimal.",
    "Cybernetic subroutines online. Battle sequence optimal.",
    "Neural bridge active. Prepare for strategic simulation."
];

class ShipInstance {
    constructor(name, size, key) {
        this.name = name;
        this.size = size;
        this.key = key;
        this.coords = []; // [{r, c}, ...]
        this.hitsCount = 0;
    }

    isSunk() {
        return this.hitsCount >= this.size;
    }
}

// Global Game State
const state = {
    isGameOver: false,
    playerTurn: true,
    roundsCount: 0,
    playerHits: 0,
    playerShots: 0,
    
    // Active pointers mapped dynamically to player1 or player2 arrays
    playerGrid: null,
    computerGrid: null,
    playerShips: [],
    computerShips: [],
    
    // AI Memory and hunt systems
    computerShotHistory: new Set(),
    aiHuntQueue: [],
    aiLastHits: [],
    aiCurrentDirection: null,
    
    // Battleship Expansion states
    gameState: 'deploying',
    activeDeployShipIndex: 0,
    deployOrientation: 'horizontal',
    activeAbility: null,
    sonarUsed: false,
    clusterUsed: false,
    aiMode: 'tactical',
    musicPlaying: false,

    // Multiplayer and P2P extensions
    gameMode: 'computer', // 'computer' | 'local' | 'online'
    localPlayer: 1, // 1 or 2 (used in local Pass-and-Play)
    onlinePlayerNum: 1, // 1 (Host) or 2 (Guest) in WebRTC P2P
    p2pConnection: null, // WebRTC data channel connection
    peer: null, // PeerJS client instance
    isReady: false,
    opponentReady: false,

    // Player specific ability states for local Pass-and-Play
    player1SonarUsed: false,
    player2SonarUsed: false,
    player1ClusterUsed: false,
    player2ClusterUsed: false,

    // Dual Board configurations in memory
    player1Grid: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(CELL_EMPTY)),
    player2Grid: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(CELL_EMPTY)),
    player1Ships: [],
    player2Ships: []
};

// ==========================================================================
// 3. TACTICAL AI SYSTEM
// ==========================================================================
/**
 * Advanced Battleship Hunting AI
 * Operates in two states:
 * - SEARCH MODE: Shoots randomly ensuring odd/even grid parity (checkerboard pattern) to optimize search density.
 * - HUNT MODE: Triggers upon hitting a ship. Collects neighbors and focuses targets in a line until the ship is sunk.
 */
class TacticalAI {
    static getNextShot() {
        if (state.aiMode === 'easy') {
            const unshot = [];
            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    if (!state.computerShotHistory.has(`${r},${c}`)) {
                        unshot.push({ r, c });
                    }
                }
            }
            if (unshot.length === 0) return null;
            return unshot[Math.floor(Math.random() * unshot.length)];
        }

        // 1. Hunt Mode: If we have unresolved hits, target adjacent squares
        while (state.aiHuntQueue.length > 0) {
            const nextCoord = state.aiHuntQueue.shift();
            const coordKey = `${nextCoord.r},${nextCoord.c}`;
            
            if (!state.computerShotHistory.has(coordKey)) {
                return nextCoord;
            }
        }

        // 2. Search Mode: Target cells randomly with checkerboard optimization
        // (This reduces number of shots needed to find ships drastically since smallest ship is size 2)
        const checkerboardCoords = [];
        const absoluteRandomCoords = [];

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const key = `${r},${c}`;
                if (!state.computerShotHistory.has(key)) {
                    if ((r + c) % 2 === 0) {
                        checkerboardCoords.push({ r, c });
                    } else {
                        absoluteRandomCoords.push({ r, c });
                    }
                }
            }
        }

        const targetList = checkerboardCoords.length > 0 ? checkerboardCoords : absoluteRandomCoords;
        const randomIndex = Math.floor(Math.random() * targetList.length);
        return targetList[randomIndex];
    }

    static registerResult(coord, hit, shipSunkName) {
        state.computerShotHistory.add(`${coord.r},${coord.c}`);

        if (hit) {
            state.aiLastHits.push(coord);

            if (shipSunkName) {
                // The targeted ship was sunk! Clear hunt mode variables for this ship
                state.aiHuntQueue = [];
                state.aiLastHits = [];
                state.aiCurrentDirection = null;
                
                // If there are other hits on the board that are not sunk, rebuild hunt queue (edge case: adjacent ships)
                this.rebuildHuntQueueFromSurvivingHits();
            } else {
                // Not sunk yet. Dynamically compute surrounding targets based on hits alignment
                this.buildHuntTargets(coord);
            }
        }
    }

    static buildHuntTargets(latestHit) {
        const hits = state.aiLastHits;

        if (hits.length === 1) {
            // First hit: check all four directions
            const neighbors = [
                { r: latestHit.r - 1, c: latestHit.c }, // North
                { r: latestHit.r + 1, c: latestHit.c }, // South
                { r: latestHit.r, c: latestHit.c - 1 }, // West
                { r: latestHit.r, c: latestHit.c + 1 }  // East
            ];
            
            neighbors.forEach(n => {
                if (this.isValidGridCoord(n) && !state.computerShotHistory.has(`${n.r},${n.c}`)) {
                    state.aiHuntQueue.unshift(n); // Push to front for immediate evaluation
                }
            });
        } else {
            // Multiple hits: determine alignment direction
            const first = hits[0];
            const last = hits[hits.length - 1];
            
            state.aiHuntQueue = []; // Reset generic queue to focus along the line

            if (first.r === last.r) {
                // Horizontal ship alignment
                state.aiCurrentDirection = 'horizontal';
                const minCol = Math.min(...hits.map(h => h.c));
                const maxCol = Math.max(...hits.map(h => h.c));
                
                const left = { r: first.r, c: minCol - 1 };
                const right = { r: first.r, c: maxCol + 1 };
                
                [left, right].forEach(cell => {
                    if (this.isValidGridCoord(cell) && !state.computerShotHistory.has(`${cell.r},${cell.c}`)) {
                        state.aiHuntQueue.push(cell);
                    }
                });
            } else {
                // Vertical ship alignment
                state.aiCurrentDirection = 'vertical';
                const minRow = Math.min(...hits.map(h => h.r));
                const maxRow = Math.max(...hits.map(h => h.r));
                
                const top = { r: minRow - 1, c: first.c };
                const bottom = { r: maxRow + 1, c: first.c };
                
                [top, bottom].forEach(cell => {
                    if (this.isValidGridCoord(cell) && !state.computerShotHistory.has(`${cell.r},${cell.c}`)) {
                        state.aiHuntQueue.push(cell);
                    }
                });
            }
        }
    }

    static rebuildHuntQueueFromSurvivingHits() {
        // Scan friendly grid for hits that don't belong to sunk ships
        // (Just in case we accidentally clipped another ship during hunt mode)
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (state.playerGrid[r][c] === CELL_HIT) {
                    // Check if this cell is associated with any surviving player ship
                    const survivingShip = state.playerShips.find(ship => 
                        !ship.isSunk() && ship.coords.some(coord => coord.r === r && coord.c === c)
                    );
                    
                    if (survivingShip) {
                        state.aiLastHits.push({ r, c });
                        this.buildHuntTargets({ r, c });
                        return;
                    }
                }
            }
        }
    }

    static isValidGridCoord(coord) {
        return coord.r >= 0 && coord.r < GRID_SIZE && coord.c >= 0 && coord.c < GRID_SIZE;
    }
}

// ==========================================================================
// 4. GRID GENERATOR & SHIP PLACEMENT MATHEMATICS
// ==========================================================================
class FleetDeployer {
    static deploy(board, shipsList) {
        // Empty board reset
        for (let r = 0; r < GRID_SIZE; r++) {
            board[r].fill(CELL_EMPTY);
        }
        shipsList.length = 0;

        // Place ships sequentially from largest to smallest
        SHIP_TYPES.forEach(type => {
            const ship = new ShipInstance(type.name, type.size, type.key);
            let placed = false;
            let retries = 0;
            const maxRetries = 500;

            while (!placed && retries < maxRetries) {
                const isHorizontal = Math.random() < 0.5;
                const startRow = Math.floor(Math.random() * GRID_SIZE);
                const startCol = Math.floor(Math.random() * GRID_SIZE);

                if (this.canPlaceShip(board, startRow, startCol, ship.size, isHorizontal)) {
                    this.recordShipPlacement(board, ship, startRow, startCol, isHorizontal);
                    shipsList.push(ship);
                    placed = true;
                }
                retries++;
            }

            if (!placed) {
                console.warn(`Critical: Failed to deploy ${ship.name} within iteration bounds.`);
            }
        });
    }

    static canPlaceShip(board, row, col, size, isHorizontal) {
        if (isHorizontal) {
            if (col + size > GRID_SIZE) return false;
            for (let i = 0; i < size; i++) {
                if (board[row][col + i] !== CELL_EMPTY) return false;
                // Add spacing buffer: prevent ships from packing directly touching (highly stylized setup)
                if (this.hasAdjacentShips(board, row, col + i)) return false;
            }
        } else {
            if (row + size > GRID_SIZE) return false;
            for (let i = 0; i < size; i++) {
                if (board[row + i][col] !== CELL_EMPTY) return false;
                if (this.hasAdjacentShips(board, row + i, col)) return false;
            }
        }
        return true;
    }

    // Buffer algorithm: ensures ships don't stack directly next to each other
    static hasAdjacentShips(board, r, c) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
                    if (board[nr][nc] === CELL_SHIP) return true;
                }
            }
        }
        return false;
    }

    static recordShipPlacement(board, ship, row, col, isHorizontal) {
        for (let i = 0; i < ship.size; i++) {
            const r = isHorizontal ? row : row + i;
            const c = isHorizontal ? col + i : col;
            
            board[r][c] = CELL_SHIP;
            ship.coords.push({ r, c });
        }
    }
}

// ==========================================================================
// 5. GAME CONTROLLER & TURN MECHANICS
// ==========================================================================
class BattleEngine {
    static init() {
        state.isGameOver = false;
        state.playerTurn = true;
        state.roundsCount = 0;
        state.playerHits = 0;
        state.playerShots = 0;
        
        state.computerShotHistory.clear();
        state.aiHuntQueue = [];
        state.aiLastHits = [];
        state.aiCurrentDirection = null;

        // Reset multiplayer states
        state.isReady = false;
        state.opponentReady = false;
        
        // Reset player-specific abilities for Pass-and-Play
        state.player1SonarUsed = false;
        state.player2SonarUsed = false;
        state.player1ClusterUsed = false;
        state.player2ClusterUsed = false;

        // Empty player1 and player2 grids in memory
        for (let r = 0; r < GRID_SIZE; r++) {
            state.player1Grid[r].fill(CELL_EMPTY);
            state.player2Grid[r].fill(CELL_EMPTY);
        }
        state.player1Ships = [];
        state.player2Ships = [];

        // Bind active pointers depending on gameMode
        if (state.gameMode === 'computer') {
            state.playerGrid = state.player1Grid;
            state.computerGrid = state.player2Grid;
            state.playerShips = state.player1Ships;
            state.computerShips = state.player2Ships;
        } else if (state.gameMode === 'local') {
            state.localPlayer = 1;
            state.playerGrid = state.player1Grid;
            state.computerGrid = state.player2Grid;
            state.playerShips = state.player1Ships;
            state.computerShips = state.player2Ships;
        } else if (state.gameMode === 'online') {
            if (state.onlinePlayerNum === 1) {
                state.playerGrid = state.player1Grid;
                state.computerGrid = state.player2Grid;
                state.playerShips = state.player1Ships;
                state.computerShips = state.player2Ships;
            } else {
                state.playerGrid = state.player2Grid;
                state.computerGrid = state.player1Grid;
                state.playerShips = state.player2Ships;
                state.computerShips = state.player1Ships;
            }
        }

        // Battleship Expansion resets
        state.gameState = 'deploying';
        state.activeDeployShipIndex = 0;
        state.deployOrientation = 'horizontal';
        state.activeAbility = null;
        state.sonarUsed = false;
        state.clusterUsed = false;

        // Reset abilities buttons UI
        const sonBtn = document.getElementById('ability-sonar');
        const clusBtn = document.getElementById('ability-cluster');
        if (sonBtn && clusBtn) {
            sonBtn.className = 'cyber-btn ability-btn';
            clusBtn.className = 'cyber-btn ability-btn';
            document.getElementById('status-sonar').textContent = 'READY';
            document.getElementById('status-cluster').textContent = 'READY';
        }

        // Toggle sections: show deployment, hide friendly stats, hide abilities
        document.getElementById('deployment-panel').classList.remove('hide');
        document.getElementById('player-fleet-status').classList.add('hide');
        document.getElementById('abilities-panel').classList.add('hide');

        // Load Career stats
        this.loadCareerStats();

        // Place opponent ships or initialize dummy arrays
        if (state.gameMode === 'computer') {
            FleetDeployer.deploy(state.computerGrid, state.computerShips);
        } else if (state.gameMode === 'online') {
            // Online opponent ships are hidden, just setup dummy ship list for health metrics
            state.computerShips = SHIP_TYPES.map(type => new ShipInstance(type.name, type.size, type.key));
        } else if (state.gameMode === 'local') {
            // In local, computerShips will point to player2Ships which are deployed manually
        }

        // Generate grids UI
        this.renderGrid('player-grid', state.playerGrid, true);
        this.renderGrid('computer-grid', state.computerGrid, false);

        // Render deployment sidebar list
        this.renderDeployShipsList();

        // Reset scoreboards
        this.updateScoreboard();

        // Clear console logs
        const logPanel = document.getElementById('battle-log');
        logPanel.innerHTML = `
            <div class="log-entry system">[SYSTEM INITIALIZED] Welcome Commander.</div>
            <div class="log-entry system">[RADAR] Sonar sectors locked. Ready for fleet deployment.</div>
            <div class="log-entry prompt">SELECT SHIP AND CLICK BLUE GRIDS TO ALIGN FLOTILLA. PRESS [R] TO ROTATE.</div>
        `;
        logPanel.scrollTop = 0;

        // Reset chat container
        const chatLog = document.getElementById('chat-log');
        if (chatLog) {
            chatLog.innerHTML = `<div class="chat-entry system">[SECURE CHAT LINK STANDBY]</div>`;
        }

        // Hide overlay modal
        document.getElementById('game-over-overlay').classList.add('hide');
    }

    static renderGrid(gridId, gridData, isPlayer) {
        const gridElement = document.getElementById(gridId);
        gridElement.innerHTML = '';

        // Inject Sonar Sweep Overlay Line
        const sweep = document.createElement('div');
        sweep.className = 'sonar-sweep';
        gridElement.appendChild(sweep);

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = r;
                cell.dataset.col = c;

                // Mark friendly ships visually
                if (isPlayer && gridData[r][c] === CELL_SHIP) {
                    cell.classList.add('ship');
                    this.addShipOutlineClasses(cell, r, c);
                }

                if (isPlayer) {
                    // Hover preview & click handles for deployment
                    cell.addEventListener('mouseover', () => this.handleDeployHover(r, c));
                    cell.addEventListener('mouseout', () => this.clearDeployPreview());
                    cell.addEventListener('click', () => this.handleDeployClick(r, c));
                } else {
                    // Set player firing trigger
                    cell.addEventListener('mouseover', () => this.handleAbilityHover(r, c));
                    cell.addEventListener('mouseout', () => this.clearAbilityPreview());
                    cell.addEventListener('click', () => this.handlePlayerShot(r, c));
                }

                gridElement.appendChild(cell);
            }
        }
    }

    static addShipOutlineClasses(cell, r, c) {
        // Find which ship occupies this cell
        const ship = state.playerShips.find(s => s.coords.some(coord => coord.r === r && coord.c === c));
        if (!ship) return;
        
        const idx = ship.coords.findIndex(coord => coord.r === r && coord.c === c);
        if (idx === 0) {
            cell.classList.add('ship-head');
        } else if (idx === ship.size - 1) {
            cell.classList.add('ship-tail');
        } else {
            cell.classList.add('ship-body');
        }
    }

    // Handle Player shooting action
    static handlePlayerShot(row, col) {
        if (state.isGameOver || !state.playerTurn || state.gameState !== 'battle') return;

        // Check if an ability is active
        if (state.activeAbility) {
            this.executeAbilityShot(row, col);
            return;
        }

        const cellVal = state.computerGrid[row][col];
        if (cellVal === CELL_HIT || cellVal === CELL_MISS) return; // Prevent shooting twice

        if (state.gameMode === 'online') {
            state.playerShots++;
            state.playerTurn = false;
            
            // Mark cell as transmitting
            const gridCell = document.querySelector(`#computer-grid .cell[data-row="${row}"][data-col="${col}"]`);
            gridCell.classList.add('transmitting');
            
            document.getElementById('computer-grid').classList.remove('active-target');
            
            // Send shot packet
            state.p2pConnection.send({type: 'shot', r: row, c: col});
        } else {
            state.playerShots++;
            state.playerTurn = false; // Transition turn

            const gridCell = document.querySelector(`#computer-grid .cell[data-row="${row}"][data-col="${col}"]`);
            const letter = String.fromCharCode(65 + col);
            const coordString = `${letter}${row + 1}`;

            if (cellVal === CELL_SHIP) {
                // HIT
                state.computerGrid[row][col] = CELL_HIT;
                gridCell.classList.add('hit');
                state.playerHits++;
                audio.playHit();
                this.spawnExplosionParticles(gridCell, '#ff0055');

                // Locate ship instance and increment hits
                const hitShip = state.computerShips.find(ship => 
                    ship.coords.some(coord => coord.r === row && coord.c === col)
                );
                hitShip.hitsCount++;

                this.logToConsole(`[PLAYER] ORDNANCE DELIVERED TO ${coordString}... DIRECT HIT!`, 'hit-log');

                if (hitShip.isSunk()) {
                    audio.playSunk();
                    this.logToConsole(`[SYSTEM] HOSTILE ${hitShip.name.toUpperCase()} HAS BEEN ELIMINATED!`, 'sunk-log');
                    this.updateEnemySunkBadges();
                    this.markShipAsSunkOnGrid(hitShip, 'computer-grid');
                }

                this.checkWinCondition();
            } else {
                // MISS
                state.computerGrid[row][col] = CELL_MISS;
                gridCell.classList.add('miss');
                audio.playMiss();
                this.logToConsole(`[PLAYER] ORDNANCE DELIVERED TO ${coordString}... MISS.`, 'miss-log');
            }

            this.updateFleetStatusDisplays();
            this.updateScoreboard();

            if (!state.isGameOver) {
                if (state.gameMode === 'local') {
                    // Block target grid interaction
                    document.getElementById('computer-grid').classList.remove('active-target');
                    setTimeout(() => swapLocalPlayersTurn(), 1500);
                } else {
                    // Dynamic UI adjustment: block computer board interactivity during computer calculation
                    document.getElementById('computer-grid').classList.remove('active-target');
                    
                    // Dramatic delay before computer acts
                    setTimeout(() => this.executeComputerShot(), 800);
                }
            }
        }
    }

    // Execute Computer shooting action
    static executeComputerShot() {
        if (state.isGameOver) return;

        const target = TacticalAI.getNextShot();
        const cellVal = state.playerGrid[target.r][target.c];
        const gridCell = document.querySelector(`#player-grid .cell[data-row="${target.r}"][data-col="${target.c}"]`);
        
        const letter = String.fromCharCode(65 + target.c);
        const coordString = `${letter}${target.r + 1}`;

        let isHit = false;
        let sunkShipName = null;
        let taunt = "";

        if (cellVal === CELL_SHIP) {
            // HIT
            isHit = true;
            state.playerGrid[target.r][target.c] = CELL_HIT;
            gridCell.classList.remove('ship');
            gridCell.classList.add('hit');
            audio.playHit();
            this.spawnExplosionParticles(gridCell, '#00f0ff');

            const hitShip = state.playerShips.find(ship => 
                ship.coords.some(coord => coord.r === target.r && coord.c === target.c)
            );
            hitShip.hitsCount++;

            this.logToConsole(`[ENEMY] SHELL DETONATED IN ${coordString}... DIRECT HIT!`, 'computer-turn');

            if (hitShip.isSunk()) {
                sunkShipName = hitShip.name;
                audio.playSunk();
                this.logToConsole(`[RADAR] DANGER: FRIENDLY ${hitShip.name.toUpperCase()} CRITICALLY DAMAGED & SUNK!`, 'sunk-log');
                this.markShipAsSunkOnGrid(hitShip, 'player-grid');
                
                taunt = AI_TAUNTS_SUNK[Math.floor(Math.random() * AI_TAUNTS_SUNK.length)];
            } else {
                taunt = AI_TAUNTS_HIT[Math.floor(Math.random() * AI_TAUNTS_HIT.length)];
            }

            this.checkWinCondition();
        } else {
            // MISS
            state.playerGrid[target.r][target.c] = CELL_MISS;
            gridCell.classList.add('miss');
            audio.playMiss();
            this.logToConsole(`[ENEMY] SHELL EXPLODED IN ${coordString}... WATER SPLASH / MISS.`, 'computer-turn');
            
            taunt = AI_TAUNTS_MISS[Math.floor(Math.random() * AI_TAUNTS_MISS.length)];
        }

        // Post taunt in secure chat terminal
        this.logToChat('NEO-AI', taunt, 'ai');

        // Register shot within AI module
        TacticalAI.registerResult(target, isHit, sunkShipName);

        // Complete cycle
        state.roundsCount++;
        state.playerTurn = true;
        
        this.updateFleetStatusDisplays();
        this.updateScoreboard();

        if (!state.isGameOver) {
            document.getElementById('computer-grid').classList.add('active-target');
        }
    }

    // Evaluate Win/Loss Conditions
    static checkWinCondition() {
        const computerDefeated = state.computerShips.every(s => s.isSunk());
        const playerDefeated = state.playerShips.every(s => s.isSunk());

        if (computerDefeated || playerDefeated) {
            state.isGameOver = true;
            document.getElementById('computer-grid').classList.remove('active-target');

            const modal = document.getElementById('game-over-overlay');
            const mTitle = document.getElementById('modal-title');
            const mDesc = document.getElementById('modal-desc');
            const mRounds = document.getElementById('modal-rounds');
            const mAccuracy = document.getElementById('modal-accuracy');
            const mSurviving = document.getElementById('modal-surviving');

            const accuracy = state.playerShots > 0 ? Math.round((state.playerHits / state.playerShots) * 100) : 0;
            
            mRounds.textContent = state.roundsCount;
            mAccuracy.textContent = `${accuracy}%`;

            if (computerDefeated) {
                // Victory!
                mTitle.textContent = "VICTORY ACHIEVED";
                mTitle.className = "modal-header-glitch win";
                mTitle.setAttribute('data-text', "VICTORY ACHIEVED");
                mDesc.textContent = "HOSTILE AREA COMPLETELY NEUTRALIZED. ALL TARGETS DESTROYED.";
                mSurviving.textContent = state.playerShips.filter(s => !s.isSunk()).length;
                audio.playVictory();
                this.saveCareerStats(true);
                this.logToConsole("==========================================", 'prompt');
                this.logToConsole("COMBAT MISSION ACCOMPLISHED. SYSTEM SECURED.", 'prompt');
                this.logToConsole("==========================================", 'prompt');
            } else {
                // Defeat!
                mTitle.textContent = "SYSTEM COMPROMISED";
                mTitle.className = "modal-header-glitch lose";
                mTitle.setAttribute('data-text', "SYSTEM COMPROMISED");
                mDesc.textContent = "FLEET ELIMINATED. HOSTILE UNITS CONTROL THE SECTOR.";
                mSurviving.textContent = "0";
                audio.playDefeat();
                this.saveCareerStats(false);
                this.logToConsole("==========================================", 'sunk-log');
                this.logToConsole("TACTICAL FAILURE. FLEET TERMINATED.", 'sunk-log');
                this.logToConsole("==========================================", 'sunk-log');
            }

            // Expose game-over modal
            setTimeout(() => {
                modal.classList.remove('hide');
            }, 1000);
        }
    }

    // ==========================================================================
    // 6. UI UPDATE HELPERS
// ==========================================================================
    static logToConsole(text, styleClass = '') {
        const consoleLog = document.getElementById('battle-log');
        const timestamp = new Date().toTimeString().split(' ')[0];
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${styleClass}`;
        logEntry.innerHTML = `<span style="opacity: 0.5">[${timestamp}]</span> ${text}`;
        
        consoleLog.appendChild(logEntry);
        consoleLog.scrollTop = consoleLog.scrollHeight;
    }

    static updateScoreboard() {
        document.getElementById('round-counter').textContent = state.roundsCount;
        
        const accuracy = state.playerShots > 0 ? Math.round((state.playerHits / state.playerShots) * 100) : 0;
        document.getElementById('player-accuracy').textContent = `${accuracy}%`;

        // Update top-right panels count
        const playerActive = state.playerShips.filter(s => !s.isSunk()).length;
        const computerSunk = state.computerShips.filter(s => s.isSunk()).length;

        document.getElementById('player-ships-count').textContent = `${playerActive}/5`;
        document.getElementById('computer-ships-count').textContent = `${computerSunk}/5`;
    }

    static updateEnemySunkBadges() {
        const computerSunk = state.computerShips.filter(s => s.isSunk()).length;
        document.getElementById('computer-ships-count').textContent = `${computerSunk}/5`;
    }

    static updateFleetStatusDisplays() {
        this.renderFleetStatus('player-fleet-status', state.playerShips);
        this.renderFleetStatus('computer-fleet-status', state.computerShips, true);
    }

    static renderFleetStatus(elementId, ships, isSecret = false) {
        const container = document.getElementById(elementId);
        container.innerHTML = '';

        ships.forEach(ship => {
            const row = document.createElement('div');
            row.className = 'ship-status-row';
            if (ship.isSunk()) row.classList.add('sunk');

            const name = document.createElement('span');
            name.className = 'ship-status-name';
            name.textContent = `${ship.name.toUpperCase()} [x${ship.size}]`;

            const barOuter = document.createElement('div');
            barOuter.className = 'ship-status-bar-outer';

            const barInner = document.createElement('div');
            barInner.className = 'ship-status-bar-inner';
            
            // Health percentage calculation
            const healthPct = ((ship.size - ship.hitsCount) / ship.size) * 100;
            barInner.style.width = `${healthPct}%`;

            barOuter.appendChild(barInner);
            row.appendChild(name);
            row.appendChild(barOuter);
            container.appendChild(row);
        });
    }

    static spawnExplosionParticles(cellElement, colorHex) {
        const particleCount = 12;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.color = colorHex;
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 15 + Math.random() * 35;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            
            particle.style.left = '50%';
            particle.style.top = '50%';
            
            cellElement.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 800);
        }
    }

    // --- Battleship Expansion Helpers ---

    static handleDeployHover(row, col) {
        if (state.gameState !== 'deploying') return;
        const currentShipType = SHIP_TYPES[state.activeDeployShipIndex];
        if (!currentShipType) return;

        const isHorizontal = state.deployOrientation === 'horizontal';
        const size = currentShipType.size;
        const cells = [];
        let isValid = true;

        if (isHorizontal) {
            if (col + size > GRID_SIZE) {
                isValid = false;
                for (let i = 0; i < GRID_SIZE - col; i++) {
                    cells.push({ r: row, c: col + i });
                }
            } else {
                for (let i = 0; i < size; i++) {
                    cells.push({ r: row, c: col + i });
                }
            }
        } else {
            if (row + size > GRID_SIZE) {
                isValid = false;
                for (let i = 0; i < GRID_SIZE - row; i++) {
                    cells.push({ r: row + i, c: col });
                }
            } else {
                for (let i = 0; i < size; i++) {
                    cells.push({ r: row + i, c: col });
                }
            }
        }

        if (isValid) {
            isValid = FleetDeployer.canPlaceShip(state.playerGrid, row, col, size, isHorizontal);
        }

        this.clearDeployPreview();
        cells.forEach(coord => {
            const gridCell = document.querySelector(`#player-grid .cell[data-row="${coord.r}"][data-col="${coord.c}"]`);
            if (gridCell) {
                gridCell.classList.add(isValid ? 'preview-valid' : 'preview-invalid');
            }
        });
    }

    static clearDeployPreview() {
        const cells = document.querySelectorAll('#player-grid .cell');
        cells.forEach(cell => {
            cell.classList.remove('preview-valid', 'preview-invalid');
        });
    }

    static handleDeployClick(row, col) {
        if (state.gameState !== 'deploying') return;
        const currentShipType = SHIP_TYPES[state.activeDeployShipIndex];
        if (!currentShipType) return;

        const isHorizontal = state.deployOrientation === 'horizontal';
        const size = currentShipType.size;

        if (FleetDeployer.canPlaceShip(state.playerGrid, row, col, size, isHorizontal)) {
            const ship = new ShipInstance(currentShipType.name, currentShipType.size, currentShipType.key);
            FleetDeployer.recordShipPlacement(state.playerGrid, ship, row, col, isHorizontal);
            state.playerShips.push(ship);
            audio.playClick();

            this.renderGrid('player-grid', state.playerGrid, true);
            this.clearDeployPreview();

            const letter = String.fromCharCode(65 + col);
            const coordString = `${letter}${row + 1}`;
            this.logToConsole(`[DEPLOY] Placed ${ship.name.toUpperCase()} at ${coordString} (${state.deployOrientation.toUpperCase()}).`, 'system');

            state.activeDeployShipIndex++;
            if (state.activeDeployShipIndex >= SHIP_TYPES.length) {
                if (state.gameMode === 'local') {
                    if (state.localPlayer === 1) {
                        state.activeDeployShipIndex = 0;
                        swapLocalPlayersTurn();
                    } else {
                        state.gameState = 'battle';
                        state.localPlayer = 1;
                        swapLocalPlayersTurn();
                    }
                } else if (state.gameMode === 'online') {
                    state.isReady = true;
                    this.logToConsole(`[DEPLOY] Fleet deployment secure. Waiting for opponent...`, 'system');
                    document.getElementById('deployment-panel').innerHTML = `
                        <div class="deploy-instructions" style="color: var(--neon-green); text-shadow: 0 0 5px var(--neon-green); font-size: 0.8rem;">
                            FLEET SECURED // WAITING FOR OPPONENT...
                        </div>
                    `;
                    state.p2pConnection.send({type: 'ready'});
                    
                    if (state.opponentReady) {
                        if (state.onlinePlayerNum === 1) {
                            state.playerTurn = true;
                            state.p2pConnection.send({type: 'start_battle', hostStarts: true});
                            this.startBattlePhase();
                        }
                    }
                } else {
                    this.startBattlePhase();
                }
            } else {
                this.renderDeployShipsList();
                this.handleDeployHover(row, col);
            }
        } else {
            audio.playMiss();
        }
    }

    static renderDeployShipsList() {
        const listContainer = document.getElementById('deploy-ships-list');
        listContainer.innerHTML = '';

        SHIP_TYPES.forEach((type, index) => {
            const row = document.createElement('div');
            row.className = 'deploy-ship-row';
            
            const isPlaced = index < state.playerShips.length;
            if (isPlaced) {
                row.classList.add('placed');
            } else if (index === state.activeDeployShipIndex) {
                row.classList.add('selected');
            }

            const name = document.createElement('span');
            name.className = 'ship-status-name';
            name.textContent = `${type.name.toUpperCase()} [x${type.size}]`;

            const status = document.createElement('span');
            status.className = 'ship-status-val';
            status.style.fontFamily = 'var(--font-mono)';
            status.style.fontSize = '0.75rem';
            status.textContent = isPlaced ? 'DEPLOYED' : (index === state.activeDeployShipIndex ? 'ALIGNING' : 'STANDBY');
            
            if (index === state.activeDeployShipIndex) {
                status.style.color = 'var(--neon-blue)';
            } else if (isPlaced) {
                status.style.color = 'rgba(255,255,255,0.3)';
            }

            row.appendChild(name);
            row.appendChild(status);
            
            row.addEventListener('click', () => {
                if (!isPlaced && index < SHIP_TYPES.length) {
                    audio.playClick();
                    state.activeDeployShipIndex = index;
                    this.renderDeployShipsList();
                }
            });

            listContainer.appendChild(row);
        });
    }

    static rotateDeployShip() {
        if (state.gameState !== 'deploying') return;
        state.deployOrientation = state.deployOrientation === 'horizontal' ? 'vertical' : 'horizontal';
        this.logToConsole(`[DEPLOY] Rotation set to ${state.deployOrientation.toUpperCase()}.`, 'system');
    }

    static autoPlacePlayer() {
        if (state.gameState !== 'deploying') return;
        state.playerShips = [];
        FleetDeployer.deploy(state.playerGrid, state.playerShips);
        audio.playSunk();
        this.renderGrid('player-grid', state.playerGrid, true);
        this.logToConsole(`[DEPLOY] Fleet auto-placed by tactical algorithms.`, 'system');
        
        if (state.gameMode === 'local') {
            if (state.localPlayer === 1) {
                state.activeDeployShipIndex = 0;
                swapLocalPlayersTurn();
            } else {
                state.gameState = 'battle';
                state.localPlayer = 1;
                swapLocalPlayersTurn();
            }
        } else if (state.gameMode === 'online') {
            state.isReady = true;
            this.logToConsole(`[DEPLOY] Fleet deployment secure. Waiting for opponent...`, 'system');
            document.getElementById('deployment-panel').innerHTML = `
                <div class="deploy-instructions" style="color: var(--neon-green); text-shadow: 0 0 5px var(--neon-green); font-size: 0.8rem;">
                    FLEET SECURED // WAITING FOR OPPONENT...
                </div>
            `;
            state.p2pConnection.send({type: 'ready'});
            
            if (state.opponentReady) {
                if (state.onlinePlayerNum === 1) {
                    state.playerTurn = true;
                    state.p2pConnection.send({type: 'start_battle', hostStarts: true});
                    this.startBattlePhase();
                }
            }
        } else {
            this.startBattlePhase();
        }
    }

    static startBattlePhase() {
        state.gameState = 'battle';
        
        document.getElementById('deployment-panel').classList.add('hide');
        document.getElementById('player-fleet-status').classList.remove('hide');
        document.getElementById('abilities-panel').classList.remove('hide');

        this.renderGrid('player-grid', state.playerGrid, true);
        this.renderGrid('computer-grid', state.computerGrid, false);

        this.updateFleetStatusDisplays();
        this.updateScoreboard();

        audio.playSunk();
        this.logToConsole("==========================================", 'prompt');
        this.logToConsole("[RADAR] BATTLE INITIATED! ENGAGING HOSTILE SECTORS.", 'prompt');
        this.logToConsole("==========================================", 'prompt');

        if (state.gameMode === 'online') {
            if (state.playerTurn) {
                this.logToConsole(`[SYSTEM] WEAPONS ONLINE. YOUR TURN TO ENGAGE.`, 'prompt');
                document.getElementById('computer-grid').classList.add('active-target');
            } else {
                this.logToConsole(`[SYSTEM] RADAR LOCKED. WAITING FOR OPPONENT ACTION...`, 'system');
                document.getElementById('computer-grid').classList.remove('active-target');
            }
        } else {
            document.getElementById('computer-grid').classList.add('active-target');
        }
    }

    static handleAbilityHover(row, col) {
        if (state.gameState !== 'battle' || !state.activeAbility) return;
        this.clearAbilityPreview();

        const targets = this.getAbilityTargetCells(row, col, state.activeAbility);
        targets.forEach(coord => {
            const gridCell = document.querySelector(`#computer-grid .cell[data-row="${coord.r}"][data-col="${coord.c}"]`);
            if (gridCell && !gridCell.classList.contains('hit') && !gridCell.classList.contains('miss')) {
                gridCell.classList.add('preview-valid');
            }
        });
    }

    static clearAbilityPreview() {
        const cells = document.querySelectorAll('#computer-grid .cell');
        cells.forEach(cell => {
            cell.classList.remove('preview-valid', 'preview-invalid');
        });
    }

    static getAbilityTargetCells(row, col, type) {
        const cells = [];
        if (type === 'sonar') {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const r = row + dr;
                    const c = col + dc;
                    if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
                        cells.push({ r, c });
                    }
                }
            }
        } else if (type === 'cluster') {
            const coords = [
                { r: row, c: col },
                { r: row - 1, c: col },
                { r: row + 1, c: col },
                { r: row, c: col - 1 },
                { r: row, c: col + 1 }
            ];
            coords.forEach(coord => {
                if (coord.r >= 0 && coord.r < GRID_SIZE && coord.c >= 0 && coord.c < GRID_SIZE) {
                    cells.push(coord);
                }
            });
        }
        return cells;
    }

    static executeAbilityShot(row, col) {
        const ability = state.activeAbility;
        state.activeAbility = null;

        document.getElementById('ability-sonar').classList.remove('active');
        document.getElementById('ability-cluster').classList.remove('active');

        if (ability === 'sonar') {
            state.sonarUsed = true;
            if (state.gameMode === 'local') {
                if (state.localPlayer === 1) state.player1SonarUsed = true;
                else state.player2SonarUsed = true;
            }
            const btn = document.getElementById('ability-sonar');
            btn.classList.add('used');
            document.getElementById('status-sonar').textContent = 'DEPLETED';

            if (state.gameMode === 'online') {
                state.p2pConnection.send({type: 'sonar', r: row, c: col});
                this.clearAbilityPreview();
            } else {
                const targets = this.getAbilityTargetCells(row, col, 'sonar');
                let detectedCount = 0;

                audio.playMiss();
                this.clearAbilityPreview();

                targets.forEach(coord => {
                    const cellVal = state.computerGrid[coord.r][coord.c];
                    const gridCell = document.querySelector(`#computer-grid .cell[data-row="${coord.r}"][data-col="${coord.c}"]`);
                    
                    gridCell.style.outline = '2px solid var(--neon-blue)';
                    gridCell.style.boxShadow = '0 0 12px var(--neon-blue)';
                    setTimeout(() => {
                        gridCell.style.outline = '';
                        gridCell.style.boxShadow = '';
                    }, 3000);

                    if (cellVal === CELL_SHIP) {
                        detectedCount++;
                        gridCell.style.backgroundColor = 'rgba(255, 153, 0, 0.15)';
                        setTimeout(() => {
                            gridCell.style.backgroundColor = '';
                        }, 3000);
                    }
                });

                const letter = String.fromCharCode(65 + col);
                const coordString = `${letter}${row + 1}`;
                this.logToConsole(`[RADAR] Sonar Scan sweep around ${coordString}. Detected ${detectedCount} targets.`, 'system');
                
                document.getElementById('computer-grid').classList.add('active-target');
            }
        } else if (ability === 'cluster') {
            state.clusterUsed = true;
            if (state.gameMode === 'local') {
                if (state.localPlayer === 1) state.player1ClusterUsed = true;
                else state.player2ClusterUsed = true;
            }
            const btn = document.getElementById('ability-cluster');
            btn.classList.add('used');
            document.getElementById('status-cluster').textContent = 'DEPLETED';

            if (state.gameMode === 'online') {
                state.playerShots++;
                state.playerTurn = false;
                document.getElementById('computer-grid').classList.remove('active-target');
                state.p2pConnection.send({type: 'cluster', r: row, c: col});
                this.clearAbilityPreview();
            } else {
                const targets = this.getAbilityTargetCells(row, col, 'cluster');
                let hits = 0;
                let shotsFired = 0;

                audio.playHit();
                this.clearAbilityPreview();

                targets.forEach(coord => {
                    const cellVal = state.computerGrid[coord.r][coord.c];
                    if (cellVal === CELL_HIT || cellVal === CELL_MISS) return;

                    shotsFired++;
                    state.playerShots++;
                    const gridCell = document.querySelector(`#computer-grid .cell[data-row="${coord.r}"][data-col="${coord.c}"]`);

                    if (cellVal === CELL_SHIP) {
                        state.computerGrid[coord.r][coord.c] = CELL_HIT;
                        gridCell.classList.add('hit');
                        state.playerHits++;
                        hits++;
                        this.spawnExplosionParticles(gridCell, '#ff0055');

                        const hitShip = state.computerShips.find(ship => 
                            ship.coords.some(c => c.r === coord.r && c.c === coord.c)
                        );
                        hitShip.hitsCount++;

                        if (hitShip.isSunk()) {
                            this.logToConsole(`[SYSTEM] HOSTILE ${hitShip.name.toUpperCase()} ELIMINATED BY CLUSTER!`, 'sunk-log');
                            this.updateEnemySunkBadges();
                            this.markShipAsSunkOnGrid(hitShip, 'computer-grid');
                        }
                    } else {
                        state.computerGrid[coord.r][coord.c] = CELL_MISS;
                        gridCell.classList.add('miss');
                    }
                });

                const letter = String.fromCharCode(65 + col);
                const coordString = `${letter}${row + 1}`;
                this.logToConsole(`[WEAPONS] Cluster strike at ${coordString}. ${hits}/${shotsFired} direct hits recorded.`, 'hit-log');

                this.updateFleetStatusDisplays();
                this.updateScoreboard();
                this.checkWinCondition();

                if (!state.isGameOver) {
                    if (state.gameMode === 'local') {
                        state.playerTurn = false;
                        document.getElementById('computer-grid').classList.remove('active-target');
                        setTimeout(() => swapLocalPlayersTurn(), 1500);
                    } else {
                        state.playerTurn = false;
                        document.getElementById('computer-grid').classList.remove('active-target');
                        setTimeout(() => this.executeComputerShot(), 1000);
                    }
                }
            }
        }
    }

    static loadCareerStats() {
        let wins = parseInt(localStorage.getItem('neo_wins')) || 0;
        let losses = parseInt(localStorage.getItem('neo_losses')) || 0;
        let bestAcc = localStorage.getItem('neo_best_acc') || '0%';

        if (!localStorage.getItem('neo_wins')) {
            localStorage.setItem('neo_wins', '0');
            localStorage.setItem('neo_losses', '0');
            localStorage.setItem('neo_best_acc', '0%');
        }

        document.getElementById('career-wins').textContent = wins;
        document.getElementById('career-losses').textContent = losses;
        document.getElementById('career-best-acc').textContent = bestAcc;
    }

    static saveCareerStats(playerWon) {
        let wins = parseInt(localStorage.getItem('neo_wins')) || 0;
        let losses = parseInt(localStorage.getItem('neo_losses')) || 0;
        let bestAcc = parseInt(localStorage.getItem('neo_best_acc')) || 0;

        if (playerWon) {
            wins++;
            localStorage.setItem('neo_wins', wins.toString());
        } else {
            losses++;
            localStorage.setItem('neo_losses', losses.toString());
        }

        const accuracy = state.playerShots > 0 ? Math.round((state.playerHits / state.playerShots) * 100) : 0;
        if (accuracy > bestAcc) {
            localStorage.setItem('neo_best_acc', `${accuracy}%`);
        }

        this.loadCareerStats();
    }

    static markShipAsSunkOnGrid(ship, gridId) {
        ship.coords.forEach(coord => {
            const cell = document.querySelector(`#${gridId} .cell[data-row="${coord.r}"][data-col="${coord.c}"]`);
            if (cell) {
                cell.classList.add('sunk-cell');
            }
        });
    }

    static logToChat(sender, text, typeClass = '') {
        const chatLog = document.getElementById('chat-log');
        if (!chatLog) return;
        const timestamp = new Date().toTimeString().split(' ')[0];
        const entry = document.createElement('div');
        entry.className = `chat-entry ${typeClass}`;
        entry.innerHTML = `<span style="opacity: 0.5">[${timestamp}]</span> <strong>${sender.toUpperCase()}:</strong> ${text}`;
        chatLog.appendChild(entry);
        chatLog.scrollTop = chatLog.scrollHeight;
        
        // Tab unread message glow if the chat container is hidden
        const chatTab = document.getElementById('tab-chat-btn');
        const chatContainer = document.getElementById('chat-container');
        if (chatTab && chatContainer && chatContainer.classList.contains('hide')) {
            chatTab.classList.add('unread-glow');
        }
    }
}

// ==========================================================================
// 6. MULTIPLAYER P2P & LOCAL TRANSITION SUBROUTINES
// ==========================================================================

function resetToMainMenu() {
    // 1. Close and cleanup PeerJS connections
    if (state.p2pConnection) {
        try { state.p2pConnection.close(); } catch(e) {}
        state.p2pConnection = null;
    }
    if (state.peer) {
        try { state.peer.destroy(); } catch(e) {}
        state.peer = null;
    }
    
    // 2. Reset status indicator and text
    document.querySelector('.status-text').textContent = 'SYS.STATUS: ACTIVE // SELECT GAME MODE';
    document.querySelector('.status-indicator').className = 'status-indicator online';
    
    // 3. Reset state variables
    state.gameMode = 'computer';
    state.isGameOver = false;
    state.gameState = 'deploying';
    
    // 4. Show the mode selection overlay
    const modeOverlay = document.getElementById('mode-selection-overlay');
    const modeView = document.getElementById('mode-selection-view');
    const lobbyView = document.getElementById('online-lobby-view');
    
    if (modeOverlay) modeOverlay.classList.remove('hide');
    if (modeView) modeView.classList.remove('hide');
    if (lobbyView) lobbyView.classList.add('hide');
    
    // Reset lobby displays
    const codeDisplay = document.getElementById('host-room-code');
    if (codeDisplay) codeDisplay.textContent = 'WAITING...';
    const lobbyStatus = document.getElementById('lobby-status');
    if (lobbyStatus) {
        lobbyStatus.textContent = 'INITIALIZING PEER...';
        lobbyStatus.style.color = '';
    }
    const joinInput = document.getElementById('join-room-input');
    if (joinInput) joinInput.value = '';
    
    // 5. Hide splash overlays just in case
    const splashOverlay = document.getElementById('startup-splash-overlay');
    if (splashOverlay) splashOverlay.classList.add('hide');
    
    // 6. Initialize BattleEngine back to clean state
    BattleEngine.init();
}

function initHostPeer() {
    state.onlinePlayerNum = 1;
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    document.getElementById('host-room-code').textContent = code;
    document.getElementById('lobby-status').textContent = 'CONNECTING TO NEURAL ROUTER...';
    document.getElementById('lobby-status').style.color = 'var(--neon-orange)';

    state.peer = new Peer('neobship-' + code);
    
    state.peer.on('open', (id) => {
        document.getElementById('lobby-status').textContent = 'NETLINK STANDBY // WAITING FOR PEER...';
        document.getElementById('lobby-status').style.color = 'var(--neon-green)';
    });

    state.peer.on('connection', (conn) => {
        state.p2pConnection = conn;
        setupP2PConnection(conn);
    });

    state.peer.on('error', (err) => {
        console.error("PeerJS Error: ", err);
        // If the ID is already taken, retry with a new code
        if (err.type === 'unavailable-id') {
            setTimeout(() => initHostPeer(), 1000);
        } else {
            document.getElementById('lobby-status').textContent = 'ROUTING ERROR. RESETTING...';
            document.getElementById('lobby-status').style.color = 'var(--neon-pink)';
        }
    });
}

function setupP2PConnection(conn) {
    conn.on('open', () => {
        state.gameMode = 'online';
        document.getElementById('mode-selection-overlay').classList.add('hide');
        
        // Reset and initialize grid reference sets
        BattleEngine.init();
        
        BattleEngine.logToConsole(`[SYSTEM] NETLINK ESTABLISHED WITH REMOTE COMMANDER.`, 'system');
        BattleEngine.logToChat('SYSTEM', 'Netlink connection secure. Frequencies synchronized.', 'system');
        
        // Change sys.status indicator in header
        document.querySelector('.status-text').textContent = 'SYS.STATUS: ONLINE // NETLINK COMBAT';
        document.querySelector('.status-indicator').className = 'status-indicator online chat-indicator';

        conn.send({
            type: 'connected', 
            sender: state.onlinePlayerNum === 1 ? 'Host' : 'Guest'
        });
    });

    conn.on('data', (data) => {
        handleIncomingP2PMessage(data);
    });

    conn.on('close', () => {
        BattleEngine.logToConsole(`[WARNING] NETLINK TERMINATED. CONNECTION LOST.`, 'sunk-log');
        BattleEngine.logToChat('SYSTEM', 'Warning: Netlink lost with remote operator.', 'system');
        
        document.getElementById('computer-grid').classList.remove('active-target');
        alert("P2P connection lost. Returning to main menu.");
        resetToMainMenu();
    });

    conn.on('error', (err) => {
        console.error("Connection error: ", err);
    });
}

function handleIncomingP2PMessage(data) {
    switch (data.type) {
        case 'connected':
            break;
            
        case 'ready':
            state.opponentReady = true;
            BattleEngine.logToConsole(`[RADAR] Remote fleet deployment encrypted. Opponent ready.`, 'system');
            BattleEngine.logToChat('SYSTEM', 'Opponent fleet deployed. Ready for engagement.', 'system');
            
            if (state.isReady) {
                if (state.onlinePlayerNum === 1) {
                    state.playerTurn = true;
                    state.p2pConnection.send({type: 'start_battle', hostStarts: true});
                    BattleEngine.startBattlePhase();
                }
            }
            break;
            
        case 'start_battle':
            state.playerTurn = !data.hostStarts;
            BattleEngine.startBattlePhase();
            break;
            
        case 'shot':
            resolveOpponentShot(data.r, data.c);
            break;
            
        case 'shot_result':
            resolveOurShotResult(data.r, data.c, data.hit, data.sunkShipName);
            break;
            
        case 'sonar':
            resolveOpponentSonar(data.r, data.c);
            break;
            
        case 'sonar_result':
            resolveOurSonarResult(data.r, data.c, data.hits);
            break;
            
        case 'cluster':
            resolveOpponentCluster(data.r, data.c);
            break;
            
        case 'cluster_result':
            resolveOurClusterResult(data.results);
            break;
            
        case 'chat':
            BattleEngine.logToChat(data.sender, data.text, 'opponent');
            break;
            
        case 'restart_request':
            const accept = confirm("Opponent requests tactical restart. Re-engage fleet?");
            if (accept) {
                state.p2pConnection.send({type: 'restart_accept'});
                BattleEngine.init();
            } else {
                state.p2pConnection.send({type: 'restart_decline'});
            }
            break;
            
        case 'restart_accept':
            BattleEngine.logToConsole(`[SYSTEM] Restart request accepted by peer.`, 'system');
            BattleEngine.init();
            break;
            
        case 'restart_decline':
            alert("Opponent declined the restart request.");
            break;
    }
}

function resolveOpponentShot(r, c) {
    const cellVal = state.playerGrid[r][c];
    const gridCell = document.querySelector(`#player-grid .cell[data-row="${r}"][data-col="${c}"]`);
    const letter = String.fromCharCode(65 + c);
    const coordString = `${letter}${r + 1}`;
    
    let isHit = false;
    let sunkShipName = null;
    
    if (cellVal === CELL_SHIP) {
        isHit = true;
        state.playerGrid[r][c] = CELL_HIT;
        gridCell.classList.remove('ship');
        gridCell.classList.add('hit');
        audio.playHit();
        BattleEngine.spawnExplosionParticles(gridCell, '#ff0055');
        
        const hitShip = state.playerShips.find(ship => 
            ship.coords.some(coord => coord.r === r && coord.c === c)
        );
        hitShip.hitsCount++;
        
        BattleEngine.logToConsole(`[ENEMY] DETONATED IN ${coordString}... DIRECT HIT!`, 'computer-turn');
        
        if (hitShip.isSunk()) {
            sunkShipName = hitShip.name;
            audio.playSunk();
            BattleEngine.logToConsole(`[RADAR] FRIENDLY ${hitShip.name.toUpperCase()} CRITICALLY SUNK!`, 'sunk-log');
            BattleEngine.markShipAsSunkOnGrid(hitShip, 'player-grid');
        }
    } else {
        state.playerGrid[r][c] = CELL_MISS;
        gridCell.classList.add('miss');
        audio.playMiss();
        BattleEngine.logToConsole(`[ENEMY] SHELL IMPACT AT ${coordString}... WATER SPLASH / MISS.`, 'computer-turn');
    }
    
    // Send feedback to opponent
    state.p2pConnection.send({
        type: 'shot_result',
        r: r,
        c: c,
        hit: isHit,
        sunkShipName: sunkShipName
    });
    
    // Switch turn back to us
    state.playerTurn = true;
    state.roundsCount++;
    
    BattleEngine.updateFleetStatusDisplays();
    BattleEngine.updateScoreboard();
    
    document.getElementById('computer-grid').classList.add('active-target');
    BattleEngine.checkWinCondition();
}

function resolveOurShotResult(r, c, hit, sunkShipName) {
    const gridCell = document.querySelector(`#computer-grid .cell[data-row="${r}"][data-col="${c}"]`);
    const letter = String.fromCharCode(65 + c);
    const coordString = `${letter}${r + 1}`;
    
    gridCell.classList.remove('transmitting');
    
    if (hit) {
        state.computerGrid[r][c] = CELL_HIT;
        gridCell.classList.add('hit');
        state.playerHits++;
        audio.playHit();
        BattleEngine.spawnExplosionParticles(gridCell, '#ff0055');
        
        BattleEngine.logToConsole(`[PLAYER] ORDNANCE DELIVERED TO ${coordString}... DIRECT HIT!`, 'hit-log');
        
        if (sunkShipName) {
            audio.playSunk();
            BattleEngine.logToConsole(`[SYSTEM] HOSTILE ${sunkShipName.toUpperCase()} ELIMINATED!`, 'sunk-log');
            
            const fakeShip = state.computerShips.find(s => s.name === sunkShipName);
            if (fakeShip) {
                fakeShip.hitsCount = fakeShip.size;
                BattleEngine.markShipAsSunkOnGrid(fakeShip, 'computer-grid');
            }
            BattleEngine.updateEnemySunkBadges();
        }
    } else {
        state.computerGrid[r][c] = CELL_MISS;
        gridCell.classList.add('miss');
        audio.playMiss();
        BattleEngine.logToConsole(`[PLAYER] ORDNANCE DELIVERED TO ${coordString}... MISS.`, 'miss-log');
    }
    
    BattleEngine.updateFleetStatusDisplays();
    BattleEngine.updateScoreboard();
    BattleEngine.checkWinCondition();
}

function resolveOpponentSonar(r, c) {
    const shipHits = [];
    for (let row = r - 1; row <= r + 1; row++) {
        for (let col = c - 1; col <= c + 1; col++) {
            if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
                if (state.playerGrid[row][col] === CELL_SHIP) {
                    shipHits.push({ r: row, c: col });
                }
            }
        }
    }
    state.p2pConnection.send({
        type: 'sonar_result',
        r: r,
        c: c,
        hits: shipHits
    });
}

function resolveOurSonarResult(r, c, hits) {
    hits.forEach(hit => {
        const cell = document.querySelector(`#computer-grid .cell[data-row="${hit.r}"][data-col="${hit.c}"]`);
        if (cell && !cell.classList.contains('hit') && !cell.classList.contains('miss')) {
            cell.classList.add('sonar-detected');
            cell.style.backgroundColor = 'rgba(255, 153, 0, 0.15)';
            cell.style.outline = '2px solid var(--neon-blue)';
            cell.style.boxShadow = '0 0 12px var(--neon-blue)';
            
            setTimeout(() => {
                cell.classList.remove('sonar-detected');
                cell.style.backgroundColor = '';
                cell.style.outline = '';
                cell.style.boxShadow = '';
            }, 3000);
        }
    });

    const letter = String.fromCharCode(65 + c);
    BattleEngine.logToConsole(`[RADAR] Sonar Scan sweep around ${letter}${r + 1}. Detected ${hits.length} targets.`, 'system');
    
    // Deplete sonar ability
    state.activeAbility = null;
    state.sonarUsed = true;
    const btn = document.getElementById('ability-sonar');
    btn.classList.add('used');
    document.getElementById('status-sonar').textContent = 'DEPLETED';
    
    document.getElementById('computer-grid').classList.add('active-target');
}

function resolveOpponentCluster(r, c) {
    const targets = [];
    targets.push({ r, c });
    if (r > 0) targets.push({ r: r - 1, c });
    if (r < GRID_SIZE - 1) targets.push({ r: r + 1, c });
    if (c > 0) targets.push({ r, c: c - 1 });
    if (c < GRID_SIZE - 1) targets.push({ r, c: c + 1 });
    
    const results = [];
    
    targets.forEach(coord => {
        const cellVal = state.playerGrid[coord.r][coord.c];
        if (cellVal === CELL_HIT || cellVal === CELL_MISS) return;
        
        let hit = false;
        let sunkShipName = null;
        const gridCell = document.querySelector(`#player-grid .cell[data-row="${coord.r}"][data-col="${coord.c}"]`);
        
        if (cellVal === CELL_SHIP) {
            hit = true;
            state.playerGrid[coord.r][coord.c] = CELL_HIT;
            gridCell.classList.remove('ship');
            gridCell.classList.add('hit');
            BattleEngine.spawnExplosionParticles(gridCell, '#ff0055');
            
            const hitShip = state.playerShips.find(ship => 
                ship.coords.some(coord2 => coord2.r === coord.r && coord2.c === coord.c)
            );
            hitShip.hitsCount++;
            
            if (hitShip.isSunk()) {
                sunkShipName = hitShip.name;
                BattleEngine.markShipAsSunkOnGrid(hitShip, 'player-grid');
            }
        } else {
            state.playerGrid[coord.r][coord.c] = CELL_MISS;
            gridCell.classList.add('miss');
        }
        
        results.push({
            r: coord.r,
            c: coord.c,
            hit: hit,
            sunkShipName: sunkShipName
        });
    });
    
    if (results.some(res => res.hit)) {
        audio.playHit();
        if (results.some(res => res.sunkShipName)) {
            audio.playSunk();
        }
    } else {
        audio.playMiss();
    }
    
    const letter = String.fromCharCode(65 + c);
    BattleEngine.logToConsole(`[ENEMY] CLUSTER STRIKE DETONATED NEAR ${letter}${r + 1}!`, 'computer-turn');
    
    state.p2pConnection.send({
        type: 'cluster_result',
        results: results
    });
    
    state.playerTurn = true;
    state.roundsCount++;
    
    BattleEngine.updateFleetStatusDisplays();
    BattleEngine.updateScoreboard();
    
    document.getElementById('computer-grid').classList.add('active-target');
    BattleEngine.checkWinCondition();
}

function resolveOurClusterResult(results) {
    let hits = 0;
    
    results.forEach(res => {
        const gridCell = document.querySelector(`#computer-grid .cell[data-row="${res.r}"][data-col="${res.c}"]`);
        
        if (res.hit) {
            state.computerGrid[res.r][res.c] = CELL_HIT;
            gridCell.classList.add('hit');
            state.playerHits++;
            hits++;
            BattleEngine.spawnExplosionParticles(gridCell, '#ff0055');
            
            if (res.sunkShipName) {
                audio.playSunk();
                BattleEngine.logToConsole(`[SYSTEM] HOSTILE ${res.sunkShipName.toUpperCase()} ELIMINATED!`, 'sunk-log');
                
                const fakeShip = state.computerShips.find(s => s.name === res.sunkShipName);
                if (fakeShip) {
                    fakeShip.hitsCount = fakeShip.size;
                    BattleEngine.markShipAsSunkOnGrid(fakeShip, 'computer-grid');
                }
                BattleEngine.updateEnemySunkBadges();
            }
        } else {
            state.computerGrid[res.r][res.c] = CELL_MISS;
            gridCell.classList.add('miss');
        }
    });
    
    if (hits > 0) {
        audio.playHit();
    } else {
        audio.playMiss();
    }
    
    BattleEngine.logToConsole(`[WEAPONS] Cluster strike feedback: detonated ${results.length} cells. Recorded ${hits} hits.`, 'hit-log');
    
    BattleEngine.updateFleetStatusDisplays();
    BattleEngine.updateScoreboard();
    BattleEngine.checkWinCondition();
}

function swapLocalPlayersTurn() {
    if (state.isGameOver) return;
    
    state.localPlayer = state.localPlayer === 1 ? 2 : 1;
    
    const overlay = document.getElementById('pass-device-overlay');
    const nameSpan = document.getElementById('pass-to-player-name');
    nameSpan.textContent = `PLAYER ${state.localPlayer}`;
    
    const statusText = state.gameState === 'deploying' ? `FLEET ENCRYPTED. PASS DEVICE TO PLAYER ${state.localPlayer} FOR DEPLOYMENT.` : `PASS COMMAND CONTROLS TO PLAYER ${state.localPlayer}.`;
    document.getElementById('pass-device-instructions').textContent = statusText;
    
    overlay.classList.remove('hide');
    audio.playClick();
}

function handlePassReady() {
    audio.playClick();
    document.getElementById('pass-device-overlay').classList.add('hide');
    
    // Remap state variables to player 1 or player 2
    if (state.localPlayer === 1) {
        state.playerGrid = state.player1Grid;
        state.computerGrid = state.player2Grid;
        state.playerShips = state.player1Ships;
        state.computerShips = state.player2Ships;
        
        state.sonarUsed = state.player1SonarUsed;
        state.clusterUsed = state.player1ClusterUsed;
    } else {
        state.playerGrid = state.player2Grid;
        state.computerGrid = state.player1Grid;
        state.playerShips = state.player2Ships;
        state.computerShips = state.player1Ships;
        
        state.sonarUsed = state.player2SonarUsed;
        state.clusterUsed = state.player2ClusterUsed;
    }
    
    // Re-render grids for current active player
    if (state.gameState === 'deploying') {
        BattleEngine.renderGrid('player-grid', state.playerGrid, true);
        BattleEngine.renderGrid('computer-grid', state.computerGrid, false);
        BattleEngine.renderDeployShipsList();
        
        document.getElementById('deployment-panel').classList.remove('hide');
        document.getElementById('player-fleet-status').classList.add('hide');
        document.getElementById('abilities-panel').classList.add('hide');
    } else {
        BattleEngine.renderGrid('player-grid', state.playerGrid, true);
        BattleEngine.renderGrid('computer-grid', state.computerGrid, false);
        
        document.getElementById('deployment-panel').classList.add('hide');
        document.getElementById('player-fleet-status').classList.remove('hide');
        document.getElementById('abilities-panel').classList.remove('hide');
        
        // Reset abilities buttons UI for active player
        const sonBtn = document.getElementById('ability-sonar');
        const clusBtn = document.getElementById('ability-cluster');
        
        if (state.sonarUsed) {
            sonBtn.classList.add('used');
            document.getElementById('status-sonar').textContent = 'DEPLETED';
        } else {
            sonBtn.classList.remove('used', 'active');
            document.getElementById('status-sonar').textContent = 'READY';
        }
        
        if (state.clusterUsed) {
            clusBtn.classList.add('used');
            document.getElementById('status-cluster').textContent = 'DEPLETED';
        } else {
            clusBtn.classList.remove('used', 'active');
            document.getElementById('status-cluster').textContent = 'READY';
        }
        
        state.playerTurn = true;
        document.getElementById('computer-grid').classList.add('active-target');
        
        BattleEngine.logToConsole(`[SYSTEM] CONTROLS DEVIATED TO PLAYER ${state.localPlayer}. WEAPONS LOADED.`, 'prompt');
    }
    
    BattleEngine.updateFleetStatusDisplays();
    BattleEngine.updateScoreboard();
}

function handleSendChatMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    
    input.value = '';
    
    if (state.gameMode === 'online') {
        const sender = state.onlinePlayerNum === 1 ? 'Host' : 'Guest';
        BattleEngine.logToChat('YOU', text, 'player');
        if (state.p2pConnection) {
            state.p2pConnection.send({
                type: 'chat',
                text: text,
                sender: sender
            });
        }
    } else if (state.gameMode === 'local') {
        const sender = `P${state.localPlayer}-CMD`;
        BattleEngine.logToChat(sender, text, state.localPlayer === 1 ? 'player' : 'opponent');
    } else {
        // VS COMPUTER Mode
        BattleEngine.logToChat('YOU', text, 'player');
        
        setTimeout(() => {
            let response = "";
            const lower = text.toLowerCase();
            if (lower.includes('hello') || lower.includes('hi')) {
                response = "Neural handshake verified. Preparing tactical sequences.";
            } else if (lower.includes('sonar') || lower.includes('radar')) {
                response = "Internal acoustic dampeners active. Scan returns empty.";
            } else if (lower.includes('cheat') || lower.includes('hack')) {
                response = "Firewall protocols operating. Intrusion attempts logged.";
            } else if (lower.includes('win') || lower.includes('lose') || lower.includes('defeat')) {
                response = "Combat simulation indicates my defensive placement is optimal.";
            } else {
                response = AI_TAUNTS_GENERAL[Math.floor(Math.random() * AI_TAUNTS_GENERAL.length)];
            }
            BattleEngine.logToChat('NEO-AI', response, 'ai');
        }, 1000);
    }
}

// ==========================================================================
// 7. EVENT LISTENERS & INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // STARTUP SPLASH SEQUENCE
    const splashOverlay = document.getElementById('startup-splash-overlay');
    const logoContainer = document.getElementById('splash-logo-container');
    const videoContainer = document.getElementById('splash-video-container');
    const introVideo = document.getElementById('intro-video');
    const skipBtn = document.getElementById('skip-intro-btn');
    const unmuteBanner = document.getElementById('unmute-banner');
    
    let splashFinished = false;
    
    function endIntroSequence() {
        if (splashFinished) return;
        splashFinished = true;
        
        document.removeEventListener('keydown', handleSplashKeydown);
        
        if (introVideo) {
            introVideo.pause();
        }
        
        splashOverlay.classList.add('hide');
        
        // Remove overlay from DOM after transition completes (800ms)
        setTimeout(() => {
            splashOverlay.style.display = 'none';
        }, 800);
    }

    // Keyboard skip listener (Space or Enter keys)
    function handleSplashKeydown(e) {
        if (splashFinished) return;
        if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
            e.preventDefault(); // Prevent page scroll on Space
            audio.playClick();
            endIntroSequence();
        }
    }
    
    document.addEventListener('keydown', handleSplashKeydown);
    
    // 1. Fade in the logo image
    setTimeout(() => {
        if (logoContainer) {
            logoContainer.classList.add('show-logo');
        }
    }, 100);
    
    // 2. Fade out the logo image after 2.2 seconds (total visible duration of 1.4s + 0.8s fade)
    setTimeout(() => {
        if (logoContainer) {
            logoContainer.classList.remove('show-logo');
        }
    }, 2200);
    
    // 3. Transition to the intro video at 3.0 seconds (logo has faded out completely)
    setTimeout(() => {
        if (logoContainer && videoContainer && introVideo) {
            logoContainer.style.display = 'none';
            videoContainer.classList.remove('hide');
            
            // Set initial video volume based on master settings
            introVideo.volume = audio.muted ? 0 : audio.volume;
            
            // Play introduction video
            introVideo.play().then(() => {
                if (introVideo.muted) {
                    if (unmuteBanner) unmuteBanner.classList.remove('hide');
                } else {
                    if (unmuteBanner) unmuteBanner.classList.add('hide');
                }
            }).catch(err => {
                console.log("Autoplay unmuted blocked by browser, falling back to muted...");
                introVideo.muted = true;
                introVideo.play().catch(e => console.error("Error playing video:", e));
                if (unmuteBanner) {
                    unmuteBanner.classList.remove('hide');
                }
            });
        }
    }, 3000);
    
    // 4. Video ended listener
    if (introVideo) {
        introVideo.addEventListener('ended', () => {
            endIntroSequence();
        });
        introVideo.addEventListener('error', (e) => {
            console.error("Intro video failed to load or play:", e);
            endIntroSequence();
        });
    }
    
    // 5. Skip button click listener
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            audio.playClick();
            endIntroSequence();
        });
    }

    // 6. Unlock Web Audio API and unmute video on background click
    if (splashOverlay) {
        splashOverlay.addEventListener('click', (e) => {
            if (e.target !== skipBtn) {
                audio.init();
                if (introVideo) {
                    introVideo.muted = false;
                    introVideo.volume = audio.muted ? 0 : audio.volume;
                }
                if (unmuteBanner) {
                    unmuteBanner.classList.add('hide');
                }
            }
        });
    }

    // Tab switching
    const tabLog = document.getElementById('tab-log-btn');
    const tabChat = document.getElementById('tab-chat-btn');
    const battleLog = document.getElementById('battle-log');
    const chatContainer = document.getElementById('chat-container');

    tabLog.addEventListener('click', () => {
        audio.playClick();
        tabLog.classList.add('active');
        tabChat.classList.remove('active');
        battleLog.classList.remove('hide');
        chatContainer.classList.add('hide');
    });

    tabChat.addEventListener('click', () => {
        audio.playClick();
        tabChat.classList.add('active');
        tabChat.classList.remove('unread-glow');
        tabLog.classList.remove('active');
        chatContainer.classList.remove('hide');
        battleLog.classList.add('hide');
        
        const chatLog = document.getElementById('chat-log');
        if (chatLog) {
            chatLog.scrollTop = chatLog.scrollHeight;
        }
    });

    // Game Mode selection card clicks
    document.getElementById('mode-computer-btn').addEventListener('click', () => {
        audio.playClick();
        state.gameMode = 'computer';
        document.getElementById('mode-selection-overlay').classList.add('hide');
        
        // Reset system status text to computer AI mode
        document.querySelector('.status-text').textContent = 'SYS.STATUS: ACTIVE // SOLITARY CAMPAIGN';
        document.querySelector('.status-indicator').className = 'status-indicator online';
        
        BattleEngine.init();
    });

    document.getElementById('mode-local-btn').addEventListener('click', () => {
        audio.playClick();
        state.gameMode = 'local';
        document.getElementById('mode-selection-overlay').classList.add('hide');
        
        document.querySelector('.status-text').textContent = 'SYS.STATUS: ACTIVE // LOCAL PASS & PLAY';
        document.querySelector('.status-indicator').className = 'status-indicator online';
        
        BattleEngine.init();
    });

    document.getElementById('mode-online-btn').addEventListener('click', () => {
        audio.playClick();
        document.getElementById('mode-selection-view').classList.add('hide');
        document.getElementById('online-lobby-view').classList.remove('hide');
        initHostPeer();
    });

    document.getElementById('lobby-back-btn').addEventListener('click', () => {
        audio.playClick();
        if (state.peer) {
            state.peer.destroy();
            state.peer = null;
        }
        document.getElementById('online-lobby-view').classList.add('hide');
        document.getElementById('mode-selection-view').classList.remove('hide');
    });

    document.getElementById('join-connect-btn').addEventListener('click', () => {
        audio.playClick();
        const code = document.getElementById('join-room-input').value.trim();
        if (code.length !== 4 || isNaN(code)) {
            alert("Invalid room code. Please enter 4 digits.");
            return;
        }
        
        state.onlinePlayerNum = 2; // Guest
        document.getElementById('lobby-status').textContent = 'NETLINKING TO HOST...';
        document.getElementById('lobby-status').style.color = 'var(--neon-orange)';
        
        state.peer = new Peer();
        state.peer.on('open', (id) => {
            const conn = state.peer.connect('neobship-' + code);
            state.p2pConnection = conn;
            setupP2PConnection(conn);
        });
        state.peer.on('error', (err) => {
            console.error(err);
            alert("Connection error: " + err.message);
            document.getElementById('lobby-status').textContent = 'CONNECTION FAILED.';
            document.getElementById('lobby-status').style.color = 'var(--neon-pink)';
        });
    });

    // Pass cover ready click
    document.getElementById('pass-ready-btn').addEventListener('click', () => {
        handlePassReady();
    });

    // Chat sending hooks
    document.getElementById('chat-send-btn').addEventListener('click', () => {
        audio.playClick();
        handleSendChatMessage();
    });

    document.getElementById('chat-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            audio.playClick();
            handleSendChatMessage();
        }
    });

    // Redeploy Board Buttons (Manual Resets)
    document.getElementById('redeploy-btn').addEventListener('click', () => {
        audio.playClick();
        if (state.gameMode === 'online') {
            BattleEngine.logToConsole(`[SYSTEM] Restart request transmitted to remote operator.`, 'system');
            state.p2pConnection.send({type: 'restart_request'});
        } else {
            BattleEngine.init();
        }
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
        audio.playClick();
        if (state.gameMode === 'online') {
            BattleEngine.logToConsole(`[SYSTEM] Restart request transmitted to remote operator.`, 'system');
            state.p2pConnection.send({type: 'restart_request'});
        } else {
            BattleEngine.init();
        }
    });

    // Rotate Deploy Button
    document.getElementById('rotate-deploy-btn').addEventListener('click', () => {
        audio.playClick();
        BattleEngine.rotateDeployShip();
    });

    // Auto Place Deploy Button
    document.getElementById('random-deploy-btn').addEventListener('click', () => {
        audio.playClick();
        BattleEngine.autoPlacePlayer();
    });

    // Keyboard Key listener for 'R' to rotate ship
    document.addEventListener('keydown', (e) => {
        if (e.key === 'r' || e.key === 'R') {
            if (state.gameState === 'deploying') {
                audio.playClick();
                BattleEngine.rotateDeployShip();
                
                // Triggers mouseover update on hovered cell to redraw preview rotated
                const hovered = document.querySelector('#player-grid .cell:hover');
                if (hovered) {
                    const r = parseInt(hovered.dataset.row);
                    const c = parseInt(hovered.dataset.col);
                    BattleEngine.handleDeployHover(r, c);
                }
            }
        }
    });

    // Music Synthwave Arpeggiator Toggle
    const musicBtn = document.getElementById('music-btn');
    musicBtn.addEventListener('click', () => {
        state.musicPlaying = !state.musicPlaying;
        audio.init();

        if (state.musicPlaying) {
            audio.startMusic();
            musicBtn.querySelector('.icon').textContent = '🎵';
            musicBtn.querySelector('.btn-txt').textContent = 'MUSIC ON';
            musicBtn.classList.add('music-active');
            audio.playClick();
        } else {
            audio.stopMusic();
            musicBtn.querySelector('.icon').textContent = '🎵';
            musicBtn.querySelector('.btn-txt').textContent = 'MUSIC OFF';
            musicBtn.classList.remove('music-active');
        }
    });

    // AI Mode Toggle
    const aiBtn = document.getElementById('ai-difficulty-btn');
    aiBtn.addEventListener('click', () => {
        audio.playClick();
        if (state.aiMode === 'tactical') {
            state.aiMode = 'easy';
            aiBtn.querySelector('.btn-txt').textContent = 'EASY';
            aiBtn.classList.add('easy-mode');
        } else {
            state.aiMode = 'tactical';
            aiBtn.querySelector('.btn-txt').textContent = 'TACTICAL';
            aiBtn.classList.remove('easy-mode');
        }
    });

    // Abilities: Sonar Radar Activate
    const sonarBtn = document.getElementById('ability-sonar');
    sonarBtn.addEventListener('click', () => {
        if (state.gameState !== 'battle' || state.sonarUsed) return;
        audio.playClick();

        if (state.activeAbility === 'sonar') {
            state.activeAbility = null;
            sonarBtn.classList.remove('active');
        } else {
            state.activeAbility = 'sonar';
            sonarBtn.classList.add('active');
            document.getElementById('ability-cluster').classList.remove('active');
        }
    });

    // Abilities: Cluster Strike Activate
    const clusterBtn = document.getElementById('ability-cluster');
    clusterBtn.addEventListener('click', () => {
        if (state.gameState !== 'battle' || state.clusterUsed) return;
        audio.playClick();

        if (state.activeAbility === 'cluster') {
            state.activeAbility = null;
            clusterBtn.classList.remove('active');
        } else {
            state.activeAbility = 'cluster';
            clusterBtn.classList.add('active');
            document.getElementById('ability-sonar').classList.remove('active');
        }
    });

    // Volume Slider Control
    const volumeSlider = document.getElementById('volume-slider');
    volumeSlider.addEventListener('input', (e) => {
        audio.init();
        audio.setVolume(e.target.value);
    });

    // Help Tutorial Modal Trigger
    const helpTrigger = document.getElementById('help-trigger-btn');
    const helpOverlay = document.getElementById('help-overlay');
    const closeHelpBtn = document.getElementById('close-help-btn');

    helpTrigger.addEventListener('click', () => {
        audio.playClick();
        helpOverlay.classList.remove('hide');
    });

    closeHelpBtn.addEventListener('click', () => {
        audio.playClick();
        helpOverlay.classList.add('hide');
    });

    // Mute/Unmute Audio Engine Toggle
    const muteBtn = document.getElementById('mute-btn');
    muteBtn.addEventListener('click', () => {
        const isMuted = audio.toggleMute();
        audio.init();
        
        if (isMuted) {
            muteBtn.querySelector('.icon').textContent = '🔇';
            muteBtn.querySelector('.btn-txt').textContent = 'AUDIO OFF';
            muteBtn.classList.add('muted-ui');
        } else {
            muteBtn.querySelector('.icon').textContent = '🔊';
            muteBtn.querySelector('.btn-txt').textContent = 'AUDIO ON';
            muteBtn.classList.remove('muted-ui');
            audio.playClick();
        }
    });
});
