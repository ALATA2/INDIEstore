/* ==========================================================================
   SERPE 3D - SCREENSHOT-ACCURATE GAME LOGIC (2026 EDITION)
   ========================================================================== */

// --- 1. AUDIO SYNTH CONTROLLER ---
class AudioController {
    constructor() {
        this.ctx = null;
        this.enabled = false;
        this.bgMusic = null;
    }

    init() {
        if (this.ctx) {
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            if (this.bgMusic && this.bgMusic.paused) {
                this.bgMusic.play().catch(e => console.log(e));
            }
            return;
        }
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.enabled = true;
            this.playStartBlip();

            // Background Music Setup
            this.bgMusic = new Audio("redSnake.mp3");
            this.bgMusic.loop = true;
            this.bgMusic.volume = 0.25; // Balanced volume to not overpower synth SFX
            this.bgMusic.play().catch(err => {
                console.log("Riproduzione automatica musica bloccata o errore:", err);
            });
        } catch (e) {
            console.error("AudioContext non supportato.", e);
            this.enabled = false;
        }
    }

    disable() {
        this.enabled = false;
        if (this.bgMusic) {
            this.bgMusic.pause();
        }
        if (this.ctx && this.ctx.state !== 'closed') {
            this.ctx.close();
        }
    }

    playStartBlip() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
    }

    playEatApple() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now); // C5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
    }

    playEatOrb() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
    }

    playEatGem() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.50, now); // C6
        osc.frequency.exponentialRampToValueAtTime(2093.00, now + 0.2); // C7
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    }

    playLevelUp() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const tempo = 0.08;
        const freqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
        freqs.forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(f, now + i * tempo);
            gain.gain.setValueAtTime(0.05, now + i * tempo);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * tempo + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * tempo);
            osc.stop(now + i * tempo + 0.15);
        });
    }

    playPowerupActive() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.4);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
    }

    playGameOver() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.6);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
    }

    playTeleport() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.5);
        osc.frequency.exponentialRampToValueAtTime(100, now + 1.0);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.0);
    }

    playSqueal() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(850, now);
        osc.frequency.exponentialRampToValueAtTime(250, now + 0.16);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
    }

    playUiClick() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.setValueAtTime(350, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
    }
}

const audio = new AudioController();

// --- 2. GAME VARIABLES ---
const GRID_SIZE = 1.6;
const GRID_WIDTH = 25; // Large map for breathing room
const GRID_DEPTH = 19;

let score = 0;
let highScore = parseInt(localStorage.getItem('serpe_high_score')) || 0;
let gems = localStorage.getItem('serpe_gems') !== null ? parseInt(localStorage.getItem('serpe_gems')) : 245;
let level = 7; // Matching Level 7 from screenshot
let applesEaten = 5; // Track progress to next level

let isPlaying = false;
let isPaused = false;
let isGameOver = false;

// Snake Movement
let snake = [];
let snakePrev = [];
let snakeDir = { x: 0, z: -1 };
let nextDir = { x: 0, z: -1 };

// Timers
let tickTimer = 0;
let baseTickRate = 240; // Default millisecond delay (slower start)
let currentTickRate = 240;
let lastTickTime = 0;

// Power-ups state
let boostCount = 3;
let magnetCount = 2;
let speedMultiplier = 1.0; // Affected by Boost
let magnetActive = false;
let magnetTimer = 0; // Duration remaining in milliseconds
let boostActive = false;
let shieldCount = 1;
let shieldActive = false;
let shieldMesh = null;
let shieldImmunityTimer = 0; // Temporary invulnerability after shield break

// Entities
let food = { x: 0, z: 0 };
let orbs = []; // Visual/bonus elements scattered matching screenshot
const MAX_ORBS = 12; // Scattered colors matching screenshot

// Secret Dimension (Village Bonus Level)
let inBonusLevel = false;
let bonusDurationLeft = 60000; // 60 seconds
let portalActive = false;
let portalPos = { x: 0, z: 0 };
let portalMesh = null;
let portalLight = null;
let portalSpawnTimer = 0; // Time accumulator in ms
let villageHouses = []; // static array of { x, z, groupMesh }
let villagers = []; // moving array of { x, z, group, legL, legR, armL, armR, prevX, prevZ }
let villageTickCount = 0;

// Orb Colors
const ORB_TYPES = [
    { color: 0x39ff14, emissive: 0x22cc0e, name: 'green' },
    { color: 0xff9f00, emissive: 0xcc7f00, name: 'orange' },
    { color: 0xd000ff, emissive: 0x9a00cc, name: 'purple' },
    { color: 0x00f0ff, emissive: 0x00aacc, name: 'blue' }
];

// --- 3. THREE.JS ENGINE SETUP ---
let scene, camera, renderer, orbitControls;
let tileMeshes = [];
let snakeHeadMesh, snakeSegmentMeshes = [];
let appleMesh, appleLight;
let cornerPlants = [];
let shadowPlanes = [];
let ambientLight, dirLight;
let particles = []; // Active 3D particles system

function initThree() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // SCENE
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010105);
    scene.fog = new THREE.FogExp2(0x010105, 0.02);

    // CAMERA (isometric visual elevation angle matching image, zoomed out and tilted to show bottom area)
    camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 31, 23);
    camera.lookAt(0, 0, 1.5);

    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // ORBIT CONTROLS (Only free look during pause or game-over)
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.enablePan = false;
    orbitControls.maxPolarAngle = Math.PI / 2.1;
    orbitControls.minDistance = 12;
    orbitControls.maxDistance = 40;
    orbitControls.enabled = true; // Orbit on start screen

    // LIGHTING (Dark moody cyber ambient)
    ambientLight = new THREE.AmbientLight(0x0a0c20, 1.5);
    scene.add(ambientLight);

    // Subtle blue directional light
    dirLight = new THREE.DirectionalLight(0x1133aa, 0.9);
    dirLight.position.set(5, 30, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 45;
    const d = 20;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    // Grid Floor
    buildReflectiveGrid();

    // Spawn corner palm ferns
    buildCornerVegetation();
}

function gridToWorld(gridCoord) {
    const halfW = (GRID_WIDTH - 1) / 2;
    const halfD = (GRID_DEPTH - 1) / 2;
    return new THREE.Vector3(
        (gridCoord.x - halfW) * GRID_SIZE,
        0,
        (gridCoord.z - halfD) * GRID_SIZE
    );
}

// Generate highly metallic dark tiles for specular light pools
function buildReflectiveGrid() {
    const tileGeo = new THREE.BoxGeometry(GRID_SIZE * 0.94, 0.12, GRID_SIZE * 0.94);
    
    // Glossy metallic material
    const tileMat = new THREE.MeshStandardMaterial({
        color: 0x070815,
        emissive: 0x010208,
        roughness: 0.12, // High specular reflections
        metalness: 0.95, // High metalness
    });

    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let z = 0; z < GRID_DEPTH; z++) {
            const worldPos = gridToWorld({ x, z });
            const tileMesh = new THREE.Mesh(tileGeo, tileMat);
            tileMesh.position.copy(worldPos);
            tileMesh.position.y = -0.06;
            tileMesh.receiveShadow = true;
            scene.add(tileMesh);

            tileMeshes.push({
                x: x,
                z: z,
                mesh: tileMesh,
                defaultColor: new THREE.Color(0x070815),
                pulseTimer: 0
            });
        }
    }

    // Outer grid line glow backing
    const gridBackGeo = new THREE.PlaneGeometry(GRID_WIDTH * GRID_SIZE + 0.2, GRID_DEPTH * GRID_SIZE + 0.2);
    const gridBackMat = new THREE.MeshBasicMaterial({
        color: 0x05081e,
        side: THREE.DoubleSide
    });
    const gridBack = new THREE.Mesh(gridBackGeo, gridBackMat);
    gridBack.rotation.x = Math.PI / 2;
    gridBack.position.y = -0.13;
    scene.add(gridBack);
}

// Build lush dark fuchsia/purple palm ferns in the corners
function buildCornerVegetation() {
    const halfW = ((GRID_WIDTH - 1) / 2) * GRID_SIZE;
    const halfD = ((GRID_DEPTH - 1) / 2) * GRID_SIZE;

    const corners = [
        { x: -halfW - 2.5, z: -halfD - 2.5, rot: 0.4 },
        { x: halfW + 2.5, z: -halfD - 2.5, rot: -0.4 },
        { x: -halfW - 2.5, z: halfD + 2.5, rot: 0.8 },
        { x: halfW + 2.5, z: halfD + 2.5, rot: -0.8 }
    ];

    const leafMat = new THREE.MeshStandardMaterial({
        color: 0x7c006c,
        emissive: 0x3d003b,
        emissiveIntensity: 1.5,
        roughness: 0.3,
        metalness: 0.8,
        side: THREE.DoubleSide
    });

    corners.forEach(corner => {
        const plant = new THREE.Group();
        plant.position.set(corner.x, 0, corner.z);
        plant.rotation.y = corner.rot;

        // Render multiple fan leaves branching outwards
        const leafCount = 14;
        for (let i = 0; i < leafCount; i++) {
            const angle = (i / leafCount) * Math.PI * 0.8 - Math.PI * 0.4;
            const length = 2.5 + Math.random() * 1.5;
            
            // Draw a curved leaf plane using simple Box/Cylinder geometries warped
            const leafGeo = new THREE.BoxGeometry(0.2, 0.05, length);
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            
            // Position leaf at origin of corner
            leaf.position.y = 0.5 + (i * 0.15);
            leaf.rotation.y = angle;
            leaf.rotation.x = 0.4 + (i * 0.04); // Arch upwards
            
            plant.add(leaf);
        }
        scene.add(plant);
        cornerPlants.push(plant);
    });
}

// --- 4. GAME MECHANICS ---

function resetGameData() {
    score = 1250; // Visual start score matching image
    gems = localStorage.getItem('serpe_gems') !== null ? parseInt(localStorage.getItem('serpe_gems')) : 245;
    level = 7;
    applesEaten = 5;
    baseTickRate = 240; // Default start speed (slower, more manageable)
    currentTickRate = 240;
    
    document.getElementById('current-score').innerText = formatScore(score);
    document.getElementById('gem-count').innerText = gems;
    document.getElementById('level-num').innerText = level;
    
    boostCount = 3;
    magnetCount = 2;
    shieldCount = 1;
    shieldActive = false;
    shieldImmunityTimer = 0;
    if (shieldMesh) {
        scene.remove(shieldMesh);
        shieldMesh = null;
    }
    const btnShield = document.getElementById('btn-shield');
    if (btnShield) btnShield.classList.remove('active-glow');

    document.getElementById('count-boost').innerText = boostCount;
    document.getElementById('count-magnet').innerText = magnetCount;
    document.getElementById('count-shield').innerText = shieldCount;
    
    updateLevelProgressDots();

    // Spawn Snake center moving UP
    const startX = Math.floor(GRID_WIDTH / 2);
    const startZ = Math.floor(GRID_DEPTH / 2) + 2;
    snake = [];
    // Form standard initial segments (length 5)
    for (let i = 0; i < 5; i++) {
        snake.push({ x: startX, z: startZ + i });
    }
    
    snakeDir = { x: 0, z: -1 };
    nextDir = { x: 0, z: -1 };
    snakePrev = JSON.parse(JSON.stringify(snake));

    rebuildSnakeMeshes();
    spawnFood();
    rebuildOrbs();

    // Reset secret dimension states
    inBonusLevel = false;
    portalSpawnTimer = 0;
    villageTickCount = 0;
    closePortal();
    villageHouses.forEach(h => scene.remove(h.groupMesh));
    villageHouses = [];
    villagers.forEach(v => scene.remove(v.group));
    villagers = [];
    document.getElementById('bonus-countdown').classList.add('hidden');
    if (scene) {
        scene.background.setHex(0x010105);
        scene.fog.color.setHex(0x010105);
        scene.fog.density = 0.02;
    }
}

function formatScore(val) {
    // Format score with thousands separator (e.g. 1.250)
    return val.toLocaleString('it-IT');
}

// Rebuild glossy metallic segments
function rebuildSnakeMeshes() {
    snakeSegmentMeshes.forEach(m => scene.remove(m));
    snakeSegmentMeshes = [];
    if (snakeHeadMesh) scene.remove(snakeHeadMesh);

    // Cyan/blue metallic shader style
    const headMat = new THREE.MeshStandardMaterial({
        color: 0x00a2ff,
        emissive: 0x0033aa,
        emissiveIntensity: 1.2,
        roughness: 0.08,
        metalness: 0.95
    });

    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x0055ff,
        emissive: 0x001188,
        emissiveIntensity: 0.8,
        roughness: 0.1,
        metalness: 0.95
    });

    // Snake Head (Triangular Pit-Viper Wedge Skull)
    const headGeo = new THREE.CylinderGeometry(GRID_SIZE * 0.18, GRID_SIZE * 0.5, GRID_SIZE * 0.95, 3);
    headGeo.rotateX(Math.PI / 2); // Make it lie flat pointing along Z-axis (snout points forward along negative Z)
    headGeo.scale(1.35, 0.55, 1.0); // Widen X, flatten Y (wedge shape), keep Z length
    
    snakeHeadMesh = new THREE.Mesh(headGeo, headMat);
    snakeHeadMesh.castShadow = true;
    snakeHeadMesh.position.copy(gridToWorld(snake[0]));
    snakeHeadMesh.position.y = GRID_SIZE * 0.35; // Position flat head slightly above ground
    scene.add(snakeHeadMesh);

    // Realistic/scary glowing red reptilian eyes (placed on the wide back sides of the wedge skull)
    const eyeGeo = new THREE.SphereGeometry(GRID_SIZE * 0.08, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({ 
        color: 0xff2200, 
        emissive: 0xff0000, 
        emissiveIntensity: 2.0 
    });
    
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-GRID_SIZE * 0.3, GRID_SIZE * 0.08, GRID_SIZE * 0.1);
    snakeHeadMesh.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(GRID_SIZE * 0.3, GRID_SIZE * 0.08, GRID_SIZE * 0.1);
    snakeHeadMesh.add(eyeR);

    // Slitted pupils inside eyes for monster snake look
    const pupilGeo = new THREE.BoxGeometry(0.015, GRID_SIZE * 0.1, 0.04);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    const pupilL = new THREE.Mesh(pupilGeo, pupilMat);
    pupilL.position.set(0, 0, -GRID_SIZE * 0.05);
    eyeL.add(pupilL);

    const pupilR = new THREE.Mesh(pupilGeo, pupilMat);
    pupilR.position.set(0, 0, -GRID_SIZE * 0.05);
    eyeR.add(pupilR);

    // Creepy fangs pointing downward from front jaw
    const fangGeo = new THREE.ConeGeometry(0.032, 0.22, 4);
    const fangMat = new THREE.MeshStandardMaterial({
        color: 0x39ff14, // Acid neon green venom fangs
        emissive: 0x22cc0e,
        emissiveIntensity: 1.5
    });
    
    const fangL = new THREE.Mesh(fangGeo, fangMat);
    fangL.position.set(-GRID_SIZE * 0.18, -GRID_SIZE * 0.15, -GRID_SIZE * 0.35);
    fangL.rotation.x = 0.2;
    snakeHeadMesh.add(fangL);
    
    const fangR = new THREE.Mesh(fangGeo, fangMat);
    fangR.position.set(GRID_SIZE * 0.18, -GRID_SIZE * 0.15, -GRID_SIZE * 0.35);
    fangR.rotation.x = 0.2;
    snakeHeadMesh.add(fangR);

    // Spiky ridge spikes along the head (makes it look dinosaur-ugly/creepy)
    const hornGeo = new THREE.ConeGeometry(0.045, 0.18, 4);
    const hornMat = new THREE.MeshStandardMaterial({
        color: 0xd000ff,
        emissive: 0x9a00cc,
        emissiveIntensity: 1.5
    });
    
    for (let i = 0; i < 3; i++) {
        const horn = new THREE.Mesh(hornGeo, hornMat);
        horn.position.set(0, GRID_SIZE * 0.24, -GRID_SIZE * 0.15 + (i * GRID_SIZE * 0.2));
        horn.rotation.x = -0.25;
        snakeHeadMesh.add(horn);
    }

    // Red/magenta forked snake tongue sticking out from front
    const tongueGroup = new THREE.Group();
    tongueGroup.position.set(0, -GRID_SIZE * 0.04, -GRID_SIZE * 0.48);

    const tongueMat = new THREE.MeshStandardMaterial({
        color: 0xff0055,
        emissive: 0xff0033,
        emissiveIntensity: 1.8
    });

    const tongueStemGeo = new THREE.BoxGeometry(0.045, 0.015, 0.25);
    const tongueStem = new THREE.Mesh(tongueStemGeo, tongueMat);
    tongueStem.position.set(0, 0, -0.06);
    tongueGroup.add(tongueStem);

    const tongueTipGeo = new THREE.BoxGeometry(0.02, 0.015, 0.12);
    
    const tipL = new THREE.Mesh(tongueTipGeo, tongueMat);
    tipL.position.set(-0.03, 0, -0.2);
    tipL.rotation.y = 0.3;
    tongueGroup.add(tipL);

    const tipR = new THREE.Mesh(tongueTipGeo, tongueMat);
    tipR.position.set(0.03, 0, -0.2);
    tipR.rotation.y = -0.3;
    tongueGroup.add(tipR);

    snakeHeadMesh.add(tongueGroup);

    // Body segments (Capsules sharing glossy metalness)
    const segGeo = new THREE.SphereGeometry(GRID_SIZE * 0.4, 12, 12);
    for (let i = 1; i < snake.length; i++) {
        const seg = new THREE.Mesh(segGeo, bodyMat);
        seg.scale.set(1.0, 1.0, 1.2);
        seg.castShadow = true;
        seg.position.copy(gridToWorld(snake[i]));
        seg.position.y = GRID_SIZE * 0.35;
        scene.add(seg);
        snakeSegmentMeshes.push(seg);
    }
}

// Append new tail segment
function growSnakeMesh() {
    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x0055ff,
        emissive: 0x001188,
        emissiveIntensity: 0.8,
        roughness: 0.1,
        metalness: 0.95
    });

    const segGeo = new THREE.SphereGeometry(GRID_SIZE * 0.4, 12, 12);
    const seg = new THREE.Mesh(segGeo, bodyMat);
    seg.scale.set(1.0, 1.0, 1.2);
    seg.castShadow = true;
    
    const lastIdx = snake.length - 1;
    seg.position.copy(gridToWorld(snake[lastIdx]));
    seg.position.y = GRID_SIZE * 0.35;
    scene.add(seg);
    snakeSegmentMeshes.push(seg);
}

// Spawn single red apple with dynamic red light pool
function spawnFood() {
    let valid = false;
    let rx, rz;

    while (!valid) {
        rx = Math.floor(Math.random() * GRID_WIDTH);
        rz = Math.floor(Math.random() * GRID_DEPTH);
        
        valid = true;
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === rx && snake[i].z === rz) {
                valid = false;
                break;
            }
        }
        // Avoid orbs
        orbs.forEach(orb => {
            if (orb.x === rx && orb.z === rz) valid = false;
        });
    }

    food.x = rx;
    food.z = rz;

    const targetPos = gridToWorld(food);
    targetPos.y = 0.5;

    if (!appleMesh) {
        const appleGroup = new THREE.Group();
        
        // Realistic round apple sphere
        const appleBodyGeo = new THREE.SphereGeometry(GRID_SIZE * 0.38, 16, 16);
        const appleBodyMat = new THREE.MeshStandardMaterial({
            color: 0xff0022,
            emissive: 0x3d0008,
            roughness: 0.15,
            metalness: 0.9
        });
        const body = new THREE.Mesh(appleBodyGeo, appleBodyMat);
        body.castShadow = true;
        appleGroup.add(body);

        // Stem
        const stemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.2, 5);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = GRID_SIZE * 0.42;
        stem.rotation.z = -0.15;
        appleGroup.add(stem);

        // Leaf
        const leafGeo = new THREE.BoxGeometry(0.18, 0.02, 0.1);
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x39ff14, emissive: 0x22aa0b });
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.set(0.1, GRID_SIZE * 0.45, 0);
        leaf.rotation.z = 0.2;
        appleGroup.add(leaf);

        appleMesh = appleGroup;
        scene.add(appleMesh);

        // Large glow light pool
        appleLight = new THREE.PointLight(0xff0022, 2.5, 6.0);
        scene.add(appleLight);
    }

    appleMesh.position.copy(targetPos);
    appleLight.position.copy(targetPos);
    
    pulseTile(food.x, food.z, 0xff0022);
}

// Clear and spawn MAX_ORBS colored balls on grid matching image
function rebuildOrbs() {
    orbs.forEach(o => {
        scene.remove(o.mesh);
        scene.remove(o.light);
    });
    orbs = [];

    for (let i = 0; i < MAX_ORBS; i++) {
        spawnOrb(true);
    }
}

// Spawn single floating colored orb
function spawnOrb(initial = false) {
    let valid = false;
    let rx, rz;

    while (!valid) {
        rx = Math.floor(Math.random() * GRID_WIDTH);
        rz = Math.floor(Math.random() * GRID_DEPTH);
        
        valid = true;
        // Avoid food and snake
        if (food.x === rx && food.z === rz) valid = false;
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === rx && snake[i].z === rz) {
                valid = false;
                break;
            }
        }
        // Avoid other orbs
        orbs.forEach(o => {
            if (o.x === rx && o.z === rz) valid = false;
        });
    }

    // Pick random color type
    const type = ORB_TYPES[Math.floor(Math.random() * ORB_TYPES.length)];

    const targetPos = gridToWorld({ x: rx, z: rz });
    targetPos.y = 0.6;

    // Glowing Sphere
    const orbGeo = new THREE.SphereGeometry(GRID_SIZE * 0.25, 12, 12);
    const orbMat = new THREE.MeshStandardMaterial({
        color: type.color,
        emissive: type.emissive,
        emissiveIntensity: 2.2,
        roughness: 0.1,
        metalness: 0.9
    });
    const mesh = new THREE.Mesh(orbGeo, orbMat);
    mesh.position.copy(targetPos);
    mesh.castShadow = true;
    scene.add(mesh);

    // Colored Point Light for glow pool on tiles
    const light = new THREE.PointLight(type.color, 1.8, 4.5);
    light.position.copy(targetPos);
    scene.add(light);

    const orbObj = {
        x: rx,
        z: rz,
        mesh: mesh,
        light: light,
        type: type,
        // Magnets attraction parameters
        isBeingPulled: false,
        pullSpeed: 0.15
    };

    orbs.push(orbObj);
    if (!initial) {
        pulseTile(rx, rz, type.color);
    }
}

// Visual tile pulse
function pulseTile(gx, gz, hexColor) {
    const tile = tileMeshes.find(t => t.x === gx && t.z === gz);
    if (tile) {
        tile.mesh.material.color.setHex(hexColor);
        tile.mesh.material.emissive.setHex(hexColor);
        tile.mesh.material.emissiveIntensity = 0.8;
        tile.pulseTimer = 1.0;
    }
}

// --- 5. POWER-UPS IMPLEMENTATION ---

function activateMagnet() {
    if (magnetCount <= 0 || magnetActive) return;
    magnetCount--;
    document.getElementById('count-magnet').innerText = magnetCount;
    
    magnetActive = true;
    magnetTimer = 5000; // 5 seconds magnet duration
    audio.playPowerupActive();
    
    // Add visual border flashing class
    document.querySelector('.btn-magnet').classList.add('active-glow');
}

function activateBoost() {
    if (boostCount <= 0 || boostActive) return;
    boostCount--;
    document.getElementById('count-boost').innerText = boostCount;
    
    boostActive = true;
    speedMultiplier = 0.55; // Boost speed tick
    audio.playPowerupActive();
    
    document.querySelector('.btn-lightning').classList.add('active-glow');

    // Snake head glow flash
    snakeHeadMesh.material.emissiveIntensity = 3.0;

    // Reset boost after 4 seconds
    setTimeout(() => {
        boostActive = false;
        speedMultiplier = 1.0;
        if (snakeHeadMesh) snakeHeadMesh.material.emissiveIntensity = 1.2;
        document.querySelector('.btn-lightning').classList.remove('active-glow');
    }, 4000);
}

function activateShield() {
    if (shieldCount <= 0 || shieldActive) return;
    shieldCount--;
    document.getElementById('count-shield').innerText = shieldCount;
    
    shieldActive = true;
    audio.playPowerupActive();
    
    const btnShield = document.getElementById('btn-shield');
    if (btnShield) btnShield.classList.add('active-glow');
    
    // Create the 3D cyan wireframe sphere around head
    const shieldGeo = new THREE.SphereGeometry(GRID_SIZE * 0.8, 16, 16);
    const shieldMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.45
    });
    shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    if (snakeHeadMesh) {
        shieldMesh.position.copy(snakeHeadMesh.position);
    }
    scene.add(shieldMesh);
    
    // Spawn initial shield burst
    if (snakeHeadMesh) {
        createParticleBurst(snakeHeadMesh.position, 0x00f0ff, 12);
    }
}

function handleCollision() {
    if (shieldActive) {
        shieldActive = false;
        if (shieldMesh) {
            scene.remove(shieldMesh);
            shieldMesh = null;
        }
        
        // Break effect: burst of cyan particles
        if (snakeHeadMesh) {
            createParticleBurst(snakeHeadMesh.position, 0x00f0ff, 25);
        }
        
        const btnShield = document.getElementById('btn-shield');
        if (btnShield) btnShield.classList.remove('active-glow');
        
        // Play breaking sound using Game Over sfx
        audio.playGameOver();
        
        // Trigger 1.5 seconds of flashing immunity
        shieldImmunityTimer = 1500;
        return false; // Survive!
    }
    
    if (shieldImmunityTimer > 0) {
        return false; // Immune! Bypass death
    }
    
    triggerGameOver();
    return true; // Game Over
}

// Draw orbs towards snake head
function updateMagnetLogic(deltaTime) {
    if (!magnetActive || snake.length === 0) return;

    magnetTimer -= deltaTime;
    if (magnetTimer <= 0) {
        magnetActive = false;
        document.querySelector('.btn-magnet').classList.remove('active-glow');
        return;
    }

    const headWorld = gridToWorld(snake[0]);

    // Pull orbs if close enough (radius 4.5 tiles)
    orbs.forEach(orb => {
        const orbPos = orb.mesh.position;
        const dist = orbPos.distanceTo(headWorld);

        if (dist < 4.5 * GRID_SIZE) {
            orb.isBeingPulled = true;
            // Lerp orb position in 3D space toward head
            orbPos.lerp(headWorld, 0.12);
            orb.light.position.copy(orbPos);
            
            // Check if pulled close enough to be eaten
            if (dist < 0.8 * GRID_SIZE) {
                handleEatOrb(orb);
            }
        }
    });

    // Also pull Apple
    if (appleMesh) {
        const applePos = appleMesh.position;
        const dist = applePos.distanceTo(headWorld);
        
        if (dist < 4.5 * GRID_SIZE) {
            applePos.lerp(headWorld, 0.12);
            appleLight.position.copy(applePos);
            
            if (dist < 0.8 * GRID_SIZE) {
                handleEatApple();
            }
        }
    }
}

// --- 5.1 SECRET DIMENSION BONUS LEVEL HELPER FUNCTIONS ---

// Spawn 10-14 rustic house obstacles
function buildVillage() {
    villageHouses.forEach(h => scene.remove(h.groupMesh));
    villageHouses = [];

    const houseCount = 11 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < houseCount; i++) {
        let rx, rz;
        let valid = false;
        let attempts = 0;
        
        while (!valid && attempts < 100) {
            attempts++;
            rx = Math.floor(Math.random() * GRID_WIDTH);
            rz = Math.floor(Math.random() * GRID_DEPTH);
            
            valid = true;
            // Avoid spawning on or close to the snake segments
            for (let s = 0; s < snake.length; s++) {
                if (Math.abs(snake[s].x - rx) <= 1 && Math.abs(snake[s].z - rz) <= 1) {
                    valid = false;
                    break;
                }
            }
            // Avoid duplicates
            villageHouses.forEach(h => {
                if (h.x === rx && h.z === rz) valid = false;
            });
        }

        if (!valid) continue;

        const houseGroup = new THREE.Group();
        const targetPos = gridToWorld({ x: rx, z: rz });

        // House stone base
        const baseGeo = new THREE.BoxGeometry(GRID_SIZE * 0.95, GRID_SIZE * 0.7, GRID_SIZE * 0.95);
        const baseMat = new THREE.MeshStandardMaterial({
            color: 0x8a725d, // Warm lighter timber/brick
            roughness: 0.85,
            metalness: 0.05
        });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = (GRID_SIZE * 0.7) / 2;
        base.castShadow = true;
        base.receiveShadow = true;
        houseGroup.add(base);

        // Roof cone
        const roofGeo = new THREE.ConeGeometry(GRID_SIZE * 0.75, GRID_SIZE * 0.45, 4);
        const roofMat = new THREE.MeshStandardMaterial({
            color: 0xe63939, // Vibrant bright red
            roughness: 0.9,
            metalness: 0.02
        });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = GRID_SIZE * 0.7 + (GRID_SIZE * 0.45) / 2 - 0.05;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        houseGroup.add(roof);

        // Yellow window box
        const windowGeo = new THREE.BoxGeometry(0.12, 0.12, 0.02);
        const windowMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
        
        const winF = new THREE.Mesh(windowGeo, windowMat);
        winF.position.set(0, GRID_SIZE * 0.35, GRID_SIZE * 0.485);
        houseGroup.add(winF);

        const winB = new THREE.Mesh(windowGeo, windowMat);
        winB.position.set(0, GRID_SIZE * 0.35, -GRID_SIZE * 0.485);
        houseGroup.add(winB);

        houseGroup.position.copy(targetPos);
        scene.add(houseGroup);

        villageHouses.push({
            x: rx,
            z: rz,
            groupMesh: houseGroup
        });
    }
}

// Spawn fleeing stick figures (omini)
function spawnOmini() {
    villagers.forEach(v => scene.remove(v.group));
    villagers = [];

    const villagerCount = 7 + Math.floor(Math.random() * 3);
    for (let i = 0; i < villagerCount; i++) {
        spawnSingleOmino(true);
    }
}

function spawnSingleOmino(initial = false) {
    let rx, rz;
    let valid = false;
    
    while (!valid) {
        rx = Math.floor(Math.random() * GRID_WIDTH);
        rz = Math.floor(Math.random() * GRID_DEPTH);
        
        valid = true;
        // Avoid houses
        villageHouses.forEach(h => {
            if (h.x === rx && h.z === rz) valid = false;
        });
        // Avoid snake segments
        for (let s = 0; s < snake.length; s++) {
            if (snake[s].x === rx && snake[s].z === rz) {
                valid = false;
                break;
            }
        }
        // Avoid other villagers
        villagers.forEach(v => {
            if (v.x === rx && v.z === rz) valid = false;
        });
    }

    const ominoGroup = new THREE.Group();
    const targetPos = gridToWorld({ x: rx, z: rz });
    ominoGroup.position.copy(targetPos);

    // Highly visible glowing white or golden stick figures
    const isGolden = Math.random() < 0.15;
    const ominoMat = isGolden ? new THREE.MeshStandardMaterial({
        color: 0xffd700, // Gold
        emissive: 0xffaa00, // Golden glow
        emissiveIntensity: 2.8,
        roughness: 0.05,
        metalness: 0.95
    }) : new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 2.2, // Boosted glow for high visibility
        roughness: 0.1,
        metalness: 0.1
    });

    // Head
    const headGeo = new THREE.SphereGeometry(GRID_SIZE * 0.11, 8, 8);
    const head = new THREE.Mesh(headGeo, ominoMat);
    head.position.y = GRID_SIZE * 0.36;
    head.castShadow = true;
    ominoGroup.add(head);

    // Torso
    const torsoGeo = new THREE.CylinderGeometry(0.02, 0.02, GRID_SIZE * 0.24, 4);
    const torso = new THREE.Mesh(torsoGeo, ominoMat);
    torso.position.y = GRID_SIZE * 0.2;
    torso.castShadow = true;
    ominoGroup.add(torso);

    // Left leg
    const legGeo = new THREE.CylinderGeometry(0.015, 0.015, GRID_SIZE * 0.12, 4);
    const legL = new THREE.Mesh(legGeo, ominoMat);
    const legLGroup = new THREE.Group();
    legLGroup.position.set(-0.06, GRID_SIZE * 0.1, 0);
    legL.position.y = -GRID_SIZE * 0.06;
    legLGroup.add(legL);
    ominoGroup.add(legLGroup);

    // Right leg
    const legR = new THREE.Mesh(legGeo, ominoMat);
    const legRGroup = new THREE.Group();
    legRGroup.position.set(0.06, GRID_SIZE * 0.1, 0);
    legR.position.y = -GRID_SIZE * 0.06;
    legRGroup.add(legR);
    ominoGroup.add(legRGroup);

    // Left arm
    const armGeo = new THREE.CylinderGeometry(0.012, 0.012, GRID_SIZE * 0.15, 4);
    const armL = new THREE.Mesh(armGeo, ominoMat);
    const armLGroup = new THREE.Group();
    armLGroup.position.set(-0.06, GRID_SIZE * 0.26, 0);
    armL.position.set(-0.03, -GRID_SIZE * 0.06, 0);
    armL.rotation.z = -0.3;
    armLGroup.add(armL);
    ominoGroup.add(armLGroup);

    // Right arm
    const armR = new THREE.Mesh(armGeo, ominoMat);
    const armRGroup = new THREE.Group();
    armRGroup.position.set(0.06, GRID_SIZE * 0.26, 0);
    armR.position.set(0.03, -GRID_SIZE * 0.06, 0);
    armR.rotation.z = 0.3;
    armRGroup.add(armR);
    ominoGroup.add(armRGroup);

    scene.add(ominoGroup);

    const ominoObj = {
        x: rx,
        z: rz,
        prevX: rx,
        prevZ: rz,
        group: ominoGroup,
        legL: legLGroup,
        legR: legRGroup,
        armL: armLGroup,
        armR: armRGroup,
        isGolden: isGolden
    };

    villagers.push(ominoObj);
}

// Spawns fuchsia teleport gateway
function spawnPortal() {
    if (portalActive) return;

    let valid = false;
    let rx, rz;

    while (!valid) {
        rx = Math.floor(Math.random() * (GRID_WIDTH - 2)) + 1;
        rz = Math.floor(Math.random() * (GRID_DEPTH - 2)) + 1;
        
        valid = true;
        if (food.x === rx && food.z === rz) valid = false;
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === rx && snake[i].z === rz) {
                valid = false;
                break;
            }
        }
        orbs.forEach(o => {
            if (o.x === rx && o.z === rz) valid = false;
        });
    }

    portalPos = { x: rx, z: rz };
    const targetPos = gridToWorld(portalPos);
    targetPos.y = 0.5;

    const portalGeo = new THREE.TorusGeometry(GRID_SIZE * 0.48, 0.12, 8, 24);
    const portalMat = new THREE.MeshStandardMaterial({
        color: 0xff00ff,
        emissive: 0xff00ff,
        emissiveIntensity: 2.8,
        roughness: 0.1,
        metalness: 0.95
    });

    portalMesh = new THREE.Mesh(portalGeo, portalMat);
    portalMesh.position.copy(targetPos);
    portalMesh.rotation.x = Math.PI / 2;
    scene.add(portalMesh);

    portalLight = new THREE.PointLight(0xff00ff, 3.0, 7.0);
    portalLight.position.copy(targetPos);
    scene.add(portalLight);

    portalActive = true;
    pulseTile(rx, rz, 0xff00ff);
}

function closePortal() {
    if (portalMesh) scene.remove(portalMesh);
    if (portalLight) scene.remove(portalLight);
    portalMesh = null;
    portalLight = null;
    portalActive = false;
}

// Transitions to Secret Dimension (rustic village night)
function enterBonusLevel() {
    inBonusLevel = true;
    bonusDurationLeft = 60000; // 60 seconds
    villageTickCount = 0;
    audio.playTeleport();
    triggerScreenFlash();

    closePortal();

    // Hide main elements
    if (appleMesh) {
        appleMesh.visible = false;
        appleLight.intensity = 0;
    }
    orbs.forEach(o => {
        o.mesh.visible = false;
        o.light.intensity = 0;
    });

    // Dark reddish night mood (make it a bit lighter and atmospheric)
    scene.background.setHex(0x1d110f); 
    scene.fog.color.setHex(0x1d110f);
    scene.fog.density = 0.015; // Lower density to reduce obscurity

    // Brighten up global lights for the village dimension
    if (ambientLight) {
        ambientLight.color.setHex(0xaa8877); // Cozy warm ambient light
        ambientLight.intensity = 2.6;
    }
    if (dirLight) {
        dirLight.color.setHex(0xffddaa); // Bright warm moonlight/lantern light
        dirLight.intensity = 2.2;
    }

    // Show HUD timer
    document.getElementById('bonus-countdown').classList.remove('hidden');

    // Build static village and dynamic citizens
    buildVillage();
    spawnOmini();
}

function exitBonusLevel() {
    inBonusLevel = false;
    audio.playTeleport();
    triggerScreenFlash();

    // Hide HUD countdown
    document.getElementById('bonus-countdown').classList.add('hidden');

    // Clear village elements
    villageHouses.forEach(h => scene.remove(h.groupMesh));
    villageHouses = [];
    villagers.forEach(v => scene.remove(v.group));
    villagers = [];

    // Restore standard dark cyber colors
    scene.background.setHex(0x010105);
    scene.fog.color.setHex(0x010105);
    scene.fog.density = 0.02;

    // Restore standard cyber lights
    if (ambientLight) {
        ambientLight.color.setHex(0x0a0c20);
        ambientLight.intensity = 1.5;
    }
    if (dirLight) {
        dirLight.color.setHex(0x1133aa);
        dirLight.intensity = 0.9;
    }

    // Restore normal elements
    if (appleMesh) {
        appleMesh.visible = true;
        appleLight.intensity = 2.5;
        spawnFood();
    }
    orbs.forEach(o => {
        o.mesh.visible = true;
        o.light.intensity = 1.8;
    });

    portalSpawnTimer = 0; // Reset portal cooldown
}

// Slice snake tail segments off to give player visual advantage
function shortenSnake(amount) {
    const minLength = 3;
    const targetLength = Math.max(minLength, snake.length - amount);
    const removedCount = snake.length - targetLength;
    
    if (removedCount <= 0) return;
    
    snake = snake.slice(0, targetLength);
    snakePrev = snakePrev.slice(0, targetLength);
    
    for (let i = 0; i < removedCount; i++) {
        const mesh = snakeSegmentMeshes.pop();
        if (mesh) scene.remove(mesh);
    }
    
    for (let i = 0; i < snakeSegmentMeshes.length; i++) {
        const meshIdx = i + 1;
        const tailFactor = Math.max(0.45, 1.0 - (meshIdx / snake.length) * 0.4);
        snakeSegmentMeshes[i].scale.set(tailFactor, tailFactor, tailFactor);
    }
}

// --- 6. LOGIC GAME LOOP TICK ---

function updateGameTick() {
    if (!isPlaying || isPaused || isGameOver) return;

    snakeDir = { ...nextDir };
    snakePrev = JSON.parse(JSON.stringify(snake));

    const nextHead = {
        x: snake[0].x + snakeDir.x,
        z: snake[0].z + snakeDir.z
    };

    // Check Portal Entry (if portal is spawned and not in bonus level)
    if (portalActive && !inBonusLevel) {
        if (nextHead.x === portalPos.x && nextHead.z === portalPos.z) {
            enterBonusLevel();
            return; // Skip normal movement for this tick
        }
    }

    // Check Secret Dimension Tick Updates
    if (inBonusLevel) {
        // Move villagers (omini) fleeing from head (only on every 2nd tick to slow them down)
        villageTickCount++;
        if (villageTickCount % 2 === 0) {
            moveVillagers();
        } else {
            // Keep prev positions equal to current positions so they stay still during this tick
            villagers.forEach(v => {
                v.prevX = v.x;
                v.prevZ = v.z;
            });
        }

        // Check crash with Houses
        for (let i = 0; i < villageHouses.length; i++) {
            const h = villageHouses[i];
            if (nextHead.x === h.x && nextHead.z === h.z) {
                if (handleCollision()) return;
                if (snakeDir.x !== 0) {
                    nextDir = { x: 0, z: (snake[0].z < GRID_DEPTH / 2) ? 1 : -1 };
                } else {
                    nextDir = { x: (snake[0].x < GRID_WIDTH / 2) ? 1 : -1, z: 0 };
                }
                snakeDir = { ...nextDir };
                nextHead.x = snake[0].x + snakeDir.x;
                nextHead.z = snake[0].z + snakeDir.z;
                break;
            }
        }

        // Hitting self is still Game Over
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === nextHead.x && snake[i].z === nextHead.z) {
                if (handleCollision()) return;
                break;
            }
        }

        // Hitting boundary walls is still Game Over
        if (nextHead.x < 0 || nextHead.x >= GRID_WIDTH || nextHead.z < 0 || nextHead.z >= GRID_DEPTH) {
            if (handleCollision()) return;
            if (snakeDir.x !== 0) {
                nextDir = { x: 0, z: (snake[0].z < GRID_DEPTH / 2) ? 1 : -1 };
            } else {
                nextDir = { x: (snake[0].x < GRID_WIDTH / 2) ? 1 : -1, z: 0 };
            }
            snakeDir = { ...nextDir };
            nextHead.x = snake[0].x + snakeDir.x;
            nextHead.z = snake[0].z + snakeDir.z;
        }

        // Move snake
        snake.unshift(nextHead);

        // Check Eat Villager
        let ateVillagerIndex = -1;
        for (let i = 0; i < villagers.length; i++) {
            const v = villagers[i];
            if (nextHead.x === v.x && nextHead.z === v.z) {
                ateVillagerIndex = i;
                break;
            }
        }

        if (ateVillagerIndex !== -1) {
            handleEatVillager(villagers[ateVillagerIndex]);
        } else {
            snake.pop(); // Standard move
        }
        return; // Don't run normal apple/orbs collisions
    }

    // Collision check: boundaries
    if (nextHead.x < 0 || nextHead.x >= GRID_WIDTH || nextHead.z < 0 || nextHead.z >= GRID_DEPTH) {
        if (handleCollision()) return;
        if (snakeDir.x !== 0) {
            nextDir = { x: 0, z: (snake[0].z < GRID_DEPTH / 2) ? 1 : -1 };
        } else {
            nextDir = { x: (snake[0].x < GRID_WIDTH / 2) ? 1 : -1, z: 0 };
        }
        snakeDir = { ...nextDir };
        nextHead.x = snake[0].x + snakeDir.x;
        nextHead.z = snake[0].z + snakeDir.z;
    }

    // Collision check: self
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === nextHead.x && snake[i].z === nextHead.z) {
            if (handleCollision()) return;
            break;
        }
    }

    // Move
    snake.unshift(nextHead);

    // Collision check: Apple
    let ateApple = false;
    if (nextHead.x === food.x && nextHead.z === food.z) {
        handleEatApple();
        ateApple = true;
    }

    // Collision check: Orbs
    let ateOrbIndex = -1;
    for (let i = 0; i < orbs.length; i++) {
        const orb = orbs[i];
        if (!orb.isBeingPulled && nextHead.x === orb.x && nextHead.z === orb.z) {
            ateOrbIndex = i;
            break;
        }
    }

    if (ateOrbIndex !== -1) {
        handleEatOrb(orbs[ateOrbIndex]);
    }

    if (!ateApple && ateOrbIndex === -1) {
        snake.pop(); // Standard movement segment reduction
    }
}

function handleEatApple() {
    score += 250 * level;
    applesEaten++;
    document.getElementById('current-score').innerText = formatScore(score);
    audio.playEatApple();
    
    growSnakeMesh();
    pulseTile(food.x, food.z, 0xff0022);
    createParticleBurst(gridToWorld(food), 0xff0022, 16);

    if (applesEaten >= 7) {
        handleLevelUp();
    } else {
        updateLevelProgressDots();
    }

    spawnFood();
}

function handleEatOrb(orb) {
    score += 150 * level;
    gems += 2;
    localStorage.setItem('serpe_gems', gems);
    document.getElementById('current-score').innerText = formatScore(score);
    document.getElementById('gem-count').innerText = gems;
    audio.playEatOrb();

    // Grow snake tail on eating any orb/pearl
    growSnakeMesh();
    createParticleBurst(gridToWorld({ x: orb.x, z: orb.z }), orb.type.color, 12);

    // 25% chance to replenish powerups based on orb color
    if (orb.type.name === 'blue' && boostCount < 5) {
        if (Math.random() < 0.25) {
            boostCount++;
            document.getElementById('count-boost').innerText = boostCount;
        }
    } else if (orb.type.name === 'purple' && magnetCount < 3) {
        if (Math.random() < 0.25) {
            magnetCount++;
            document.getElementById('count-magnet').innerText = magnetCount;
        }
    }

    pulseTile(orb.x, orb.z, orb.type.color);

    // Remove
    scene.remove(orb.mesh);
    scene.remove(orb.light);
    const idx = orbs.indexOf(orb);
    if (idx !== -1) orbs.splice(idx, 1);

    // Respawn new orb elsewhere
    spawnOrb(false);
}

// Fleeing AI for village citizens
function moveVillagers() {
    villagers.forEach(v => {
        // Look at cardinal neighbors
        const moves = [
            { x: v.x + 1, z: v.z },
            { x: v.x - 1, z: v.z },
            { x: v.x, z: v.z + 1 },
            { x: v.x, z: v.z - 1 }
        ];

        // Filter valid empty moves
        const validMoves = moves.filter(m => {
            if (m.x < 0 || m.x >= GRID_WIDTH || m.z < 0 || m.z >= GRID_DEPTH) return false;
            // No houses
            for (let i = 0; i < villageHouses.length; i++) {
                if (villageHouses[i].x === m.x && villageHouses[i].z === m.z) return false;
            }
            // No snake segments
            for (let i = 0; i < snake.length; i++) {
                if (snake[i].x === m.x && snake[i].z === m.z) return false;
            }
            // No other villagers
            for (let i = 0; i < villagers.length; i++) {
                const other = villagers[i];
                if (other !== v && other.x === m.x && other.z === m.z) return false;
            }
            return true;
        });

        if (validMoves.length > 0) {
            // Find choice that maximizes distance to snake head
            const head = snake[0];
            let bestMove = validMoves[0];
            let maxDist = -1;

            validMoves.forEach(m => {
                const dx = m.x - head.x;
                const dz = m.z - head.z;
                const distSq = dx * dx + dz * dz;
                if (distSq > maxDist) {
                    maxDist = distSq;
                    bestMove = m;
                }
            });

            v.prevX = v.x;
            v.prevZ = v.z;
            v.x = bestMove.x;
            v.z = bestMove.z;
        } else {
            v.prevX = v.x;
            v.prevZ = v.z;
        }
    });
}

function handleEatVillager(v) {
    let pts = 500 * level;
    let shrinkAmount = 2;
    let pulseColor = 0xff0055;
    
    if (v.isGolden) {
        pts = 1000 * level;
        shrinkAmount = 4;
        pulseColor = 0xffea00;
        audio.playEatGem();
    }
    
    score += pts;
    document.getElementById('current-score').innerText = formatScore(score);
    audio.playSqueal();

    // Shorten tail
    shortenSnake(shrinkAmount);

    pulseTile(v.x, v.z, pulseColor);
    
    // Spawn burst particles!
    createParticleBurst(gridToWorld({ x: v.x, z: v.z }), pulseColor, 16);

    // Remove villager from scene
    scene.remove(v.group);
    const idx = villagers.indexOf(v);
    if (idx !== -1) villagers.splice(idx, 1);

    // Spawn new villager
    spawnSingleOmino(false);
}

function handleLevelUp() {
    level++;
    applesEaten = 0;
    document.getElementById('level-num').innerText = level;
    updateLevelProgressDots();
    audio.playLevelUp();

    baseTickRate = Math.max(80, baseTickRate - 12);
    
    // Wave tile pulse fireworks
    tileMeshes.forEach(t => {
        t.mesh.material.color.setHex(0xd000ff);
        t.mesh.material.emissive.setHex(0xd000ff);
        t.mesh.material.emissiveIntensity = 0.7;
        t.pulseTimer = 0.8;
    });
}

function updateLevelProgressDots() {
    const dots = document.getElementById('level-dots-container').children;
    for (let i = 0; i < dots.length; i++) {
        if (i < applesEaten) {
            dots[i].classList.add('active');
        } else {
            dots[i].classList.remove('active');
        }
    }
}

function triggerGameOver() {
    isGameOver = true;
    isPlaying = false;
    audio.playGameOver();

    document.getElementById('final-score').innerText = formatScore(score);
    document.getElementById('final-gems').innerText = gems;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('serpe_high_score', highScore);
        document.getElementById('highscore-alert').style.display = 'flex';
    } else {
        document.getElementById('highscore-alert').style.display = 'none';
    }

    // Reset Powerup UI glows
    document.querySelector('.btn-magnet').classList.remove('active-glow');
    document.querySelector('.btn-lightning').classList.remove('active-glow');
    magnetActive = false;
    boostActive = false;
    speedMultiplier = 1.0;

    orbitControls.enabled = true;
    document.getElementById('bonus-countdown').classList.add('hidden');
    document.getElementById('game-hud').classList.add('hidden');
    document.getElementById('screen-gameover').classList.remove('hidden');
    document.getElementById('mobile-controls').classList.add('hidden');
}

// --- 7. FRAME TICK UPDATES ---

function animate(currentTime) {
    requestAnimationFrame(animate);

    const deltaTime = currentTime - lastTickTime;

    // Hover vegetation swaying
    const timeSec = currentTime * 0.001;
    cornerPlants.forEach((plant, index) => {
        const sway = Math.sin(timeSec * 1.5 + index) * 0.05;
        plant.rotation.z = sway;
    });

    // Floating orbs animation (only animate when not in bonus level)
    orbs.forEach((orb, index) => {
        if (!inBonusLevel) {
            if (!orb.isBeingPulled) {
                orb.mesh.position.y = 0.5 + Math.sin(timeSec * 2.5 + index) * 0.08;
                orb.light.position.y = orb.mesh.position.y;
            }
            orb.mesh.rotation.y += 0.02;
        }
    });

    // Floating apple animation
    if (appleMesh && !magnetActive && !inBonusLevel) {
        appleMesh.position.y = 0.5 + Math.sin(timeSec * 3.0) * 0.06;
        appleLight.position.y = appleMesh.position.y;
        appleMesh.rotation.y += 0.012;
    }

    // Rotate active portal mesh
    if (portalActive && portalMesh) {
        portalMesh.rotation.z += 0.05;
    }

    // Decay grid pulses back to standard black tiles
    tileMeshes.forEach(t => {
        if (t.pulseTimer > 0) {
            t.pulseTimer -= 0.035;
            if (t.pulseTimer <= 0) {
                t.mesh.material.color.copy(t.defaultColor);
                t.mesh.material.emissive.setHex(0x000000);
                t.mesh.material.emissiveIntensity = 0.0;
            } else {
                t.mesh.material.color.lerp(t.defaultColor, 0.06);
                t.mesh.material.emissiveIntensity = t.pulseTimer;
            }
        }
    });

    // Dynamic gameplay updates
    if (isPlaying && !isPaused && !isGameOver) {
        // Update shield immunity flashing
        if (shieldImmunityTimer > 0) {
            shieldImmunityTimer -= deltaTime;
            const flash = Math.floor(currentTime / 100) % 2 === 0;
            const visibility = flash ? 0.35 : 1.0;
            if (snakeHeadMesh) {
                snakeHeadMesh.material.transparent = true;
                snakeHeadMesh.material.opacity = visibility;
            }
            snakeSegmentMeshes.forEach(m => {
                m.material.transparent = true;
                m.material.opacity = visibility;
            });
        } else {
            if (snakeHeadMesh) {
                snakeHeadMesh.material.transparent = false;
                snakeHeadMesh.material.opacity = 1.0;
            }
            snakeSegmentMeshes.forEach(m => {
                m.material.transparent = false;
                m.material.opacity = 1.0;
            });
        }

        // Align shield wireframe sphere with snake head
        if (shieldActive && shieldMesh && snakeHeadMesh) {
            shieldMesh.position.copy(snakeHeadMesh.position);
            shieldMesh.rotation.y += 0.02;
            shieldMesh.rotation.x += 0.015;
        }

        if (!inBonusLevel) {
            updateMagnetLogic(deltaTime);
            
            // Handle Portal spawning timers
            if (!portalActive) {
                portalSpawnTimer += deltaTime;
                if (portalSpawnTimer > 35000) { // 35 seconds cooldown
                    spawnPortal();
                    portalSpawnTimer = 0;
                }
            } else {
                portalSpawnTimer += deltaTime;
                if (portalSpawnTimer > 15000) { // 15 seconds open duration
                    closePortal();
                    portalSpawnTimer = 0;
                }
            }
        } else {
            // Count down secret dimension timer
            bonusDurationLeft -= deltaTime;
            document.getElementById('bonus-countdown').innerText = 'DIMENSIONE BONUS: ' + Math.ceil(bonusDurationLeft / 1000) + 's';
            
            if (bonusDurationLeft <= 0) {
                exitBonusLevel();
            }

            // Animate escaping stick figures wobbly limbs
            const ratio = tickTimer / currentTickRate;
            villagers.forEach((v, index) => {
                const prevPos = gridToWorld({ x: v.prevX, z: v.prevZ });
                const currPos = gridToWorld({ x: v.x, z: v.z });
                prevPos.y = 0.0;
                currPos.y = 0.0;
                v.group.position.lerpVectors(prevPos, currPos, ratio);
                
                if (v.x !== v.prevX || v.z !== v.prevZ) {
                    const angle = Math.atan2(v.x - v.prevX, v.z - v.prevZ);
                    v.group.rotation.y = angle;
                }

                // Wobbly limb wiggles
                v.legL.rotation.x = Math.sin(timeSec * 16 + index * 5) * 0.75;
                v.legR.rotation.x = -Math.sin(timeSec * 16 + index * 5) * 0.75;
                v.armL.rotation.x = -Math.sin(timeSec * 16 + index * 5) * 0.55;
                v.armR.rotation.x = Math.sin(timeSec * 16 + index * 5) * 0.55;
            });
        }

        pollGamepad();

        currentTickRate = baseTickRate * speedMultiplier;
        tickTimer += deltaTime;

        if (tickTimer >= currentTickRate) {
            updateGameTick();
            tickTimer = 0;
        }

        // Smooth position interpolation
        const t = Math.min(1.0, tickTimer / currentTickRate);
        interpolateSnake(t);
    }

    // Update active particle system
    const deltaTimeSec = Math.min(0.05, deltaTime * 0.001);
    updateParticles(deltaTimeSec);

    // Spawn trail particles behind snake tail
    if (isPlaying && !isPaused && !isGameOver) {
        let tailPos = new THREE.Vector3();
        if (snakeSegmentMeshes.length > 0) {
            snakeSegmentMeshes[snakeSegmentMeshes.length - 1].getWorldPosition(tailPos);
        } else if (snakeHeadMesh) {
            snakeHeadMesh.getWorldPosition(tailPos);
        }
        if (Math.random() < 0.5) {
            let trailColor = 0x00f0ff; // Cyan default
            if (boostActive) {
                trailColor = 0xff00bb; // Hot fuchsia for boost
            }
            spawnTrailParticle(tailPos, trailColor);
        }
    }

    orbitControls.update();
    renderer.render(scene, camera);
    lastTickTime = currentTime;
}

function createParticleBurst(position, color, count = 12) {
    const particleGeo = new THREE.BoxGeometry(0.16, 0.16, 0.16);
    for (let i = 0; i < count; i++) {
        const mat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 1.0
        });
        const mesh = new THREE.Mesh(particleGeo, mat);
        
        mesh.position.copy(position);
        mesh.position.x += (Math.random() - 0.5) * 0.5;
        mesh.position.y += Math.random() * 0.3;
        mesh.position.z += (Math.random() - 0.5) * 0.5;
        
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 4.0,
            2.0 + Math.random() * 4.0,
            (Math.random() - 0.5) * 4.0
        );
        
        scene.add(mesh);
        
        const maxLife = 0.5 + Math.random() * 0.5;
        particles.push({
            mesh: mesh,
            material: mat,
            velocity: velocity,
            life: maxLife,
            maxLife: maxLife
        });
    }
}

function spawnTrailParticle(position, color) {
    const particleGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const mat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8
    });
    const mesh = new THREE.Mesh(particleGeo, mat);
    mesh.position.copy(position);
    mesh.position.x += (Math.random() - 0.5) * 0.2;
    mesh.position.y += (Math.random() - 0.5) * 0.2;
    mesh.position.z += (Math.random() - 0.5) * 0.2;

    const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        Math.random() * 0.5,
        (Math.random() - 0.5) * 0.5
    );
    
    scene.add(mesh);
    const maxLife = 0.4 + Math.random() * 0.3;
    particles.push({
        mesh: mesh,
        material: mat,
        velocity: velocity,
        life: maxLife,
        maxLife: maxLife
    });
}

function updateParticles(deltaTimeSec) {
    const gravity = -9.8;
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= deltaTimeSec;
        if (p.life <= 0) {
            scene.remove(p.mesh);
            p.mesh.geometry.dispose();
            p.material.dispose();
            particles.splice(i, 1);
        } else {
            p.velocity.y += gravity * deltaTimeSec;
            p.mesh.position.addScaledVector(p.velocity, deltaTimeSec);
            p.material.opacity = Math.max(0.0, p.life / p.maxLife);
            const scale = p.life / p.maxLife;
            p.mesh.scale.set(scale, scale, scale);
        }
    }
}

function triggerScreenFlash() {
    const flash = document.getElementById('screen-flash');
    if (!flash) return;
    flash.classList.remove('hidden');
    flash.classList.remove('flash-animate');
    void flash.offsetWidth; // Trigger reflow
    flash.classList.add('flash-animate');
    
    // Hide overlay after animation finishes
    setTimeout(() => {
        flash.classList.add('hidden');
        flash.classList.remove('flash-animate');
    }, 500);
}

// Lerp segment locations for fluent 3D movement path
function interpolateSnake(t) {
    if (snake.length === 0 || snakePrev.length === 0) return;

    // Lerp head
    const headPrevPos = gridToWorld(snakePrev[0]);
    const headCurrPos = gridToWorld(snake[0]);
    headPrevPos.y = GRID_SIZE * 0.4;
    headCurrPos.y = GRID_SIZE * 0.4;
    snakeHeadMesh.position.lerpVectors(headPrevPos, headCurrPos, t);

    // Rotate head toward moving vector
    const targetAngle = Math.atan2(snakeDir.x, snakeDir.z);
    let diff = targetAngle - snakeHeadMesh.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    snakeHeadMesh.rotation.y += diff * 0.28;

    // Lerp body segments
    for (let i = 1; i < snake.length; i++) {
        const mesh = snakeSegmentMeshes[i - 1];
        if (!mesh) continue;

        const prevPos = gridToWorld(snakePrev[i] || snakePrev[snakePrev.length - 1]);
        const currPos = gridToWorld(snake[i]);
        prevPos.y = GRID_SIZE * 0.35;
        currPos.y = GRID_SIZE * 0.35;

        mesh.position.lerpVectors(prevPos, currPos, t);

        // Rotate body segments to align with curve
        const lead = snake[i - 1];
        const current = snake[i];
        const dx = lead.x - current.x;
        const dz = lead.z - current.z;
        mesh.rotation.y = Math.atan2(dx, dz);
    }

    // Camera follow lag
    const headWorld = gridToWorld(snake[0]);
    const targetCamX = headWorld.x * 0.18;
    const targetCamZ = 23 + (headWorld.z * 0.18);
    camera.position.x += (targetCamX - camera.position.x) * 0.05;
    camera.position.z += (targetCamZ - camera.position.z) * 0.05;
}

// --- 8. INPUT BINDINGS ---

// Key presses
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (isGameOver) handleRestartClick();
        else if (!isPlaying) handleStartClick();
        else togglePause();
        return;
    }

    if (!isPlaying || isPaused || isGameOver) return;

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (snakeDir.z !== 1) nextDir = { x: 0, z: -1 };
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (snakeDir.z !== -1) nextDir = { x: 0, z: 1 };
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (snakeDir.x !== 1) nextDir = { x: -1, z: 0 };
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (snakeDir.x !== -1) nextDir = { x: 1, z: 0 };
            break;
        case '1':
        case 'q':
        case 'Q':
            activateBoost();
            break;
        case '2':
        case 'e':
        case 'E':
            activateMagnet();
            break;
        case '3':
        case 'r':
        case 'R':
            activateShield();
            break;
    }
});

// Gamepad API integration
let gamepadConnected = false;
window.addEventListener("gamepadconnected", () => gamepadConnected = true);
window.addEventListener("gamepaddisconnected", () => gamepadConnected = false);

function pollGamepad() {
    if (!gamepadConnected) return;

    const gamepads = navigator.getGamepads();
    const gp = gamepads[0];
    if (!gp) return;

    const axisX = gp.axes[0];
    const axisY = gp.axes[1];
    const deadzone = 0.35;

    if (Math.abs(axisX) > deadzone || Math.abs(axisY) > deadzone) {
        if (Math.abs(axisX) > Math.abs(axisY)) {
            if (axisX > 0 && snakeDir.x !== -1) nextDir = { x: 1, z: 0 };
            else if (axisX < 0 && snakeDir.x !== 1) nextDir = { x: -1, z: 0 };
        } else {
            if (axisY > 0 && snakeDir.z !== -1) nextDir = { x: 0, z: 1 };
            else if (axisY < 0 && snakeDir.z !== 1) nextDir = { x: 0, z: -1 };
        }
    }

    if (gp.buttons[12]?.pressed && snakeDir.z !== 1) nextDir = { x: 0, z: -1 };
    if (gp.buttons[13]?.pressed && snakeDir.z !== -1) nextDir = { x: 0, z: 1 };
    if (gp.buttons[14]?.pressed && snakeDir.x !== 1) nextDir = { x: -1, z: 0 };
    if (gp.buttons[15]?.pressed && snakeDir.x !== -1) nextDir = { x: 1, z: 0 };

    if (gp.buttons[9]?.pressed) togglePause();
    
    // Gamepad mappings for Magnet (X / Button 2), Boost (A / Button 0) and Shield (B / Button 1 or Y / Button 3)
    if (gp.buttons[2]?.pressed) activateMagnet();
    if (gp.buttons[0]?.pressed) activateBoost();
    if (gp.buttons[1]?.pressed || gp.buttons[3]?.pressed) activateShield();
}

// D-pad Touch & Click mappings
function setupDpadControls() {
    const arrows = document.querySelectorAll('.dpad-arrow');

    arrows.forEach(arrow => {
        const handler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isPlaying || isPaused || isGameOver) return;
            
            const direction = arrow.getAttribute('data-dir');
            switch (direction) {
                case 'up':
                    if (snakeDir.z !== 1) nextDir = { x: 0, z: -1 };
                    break;
                case 'right':
                    if (snakeDir.x !== -1) nextDir = { x: 1, z: 0 };
                    break;
                case 'down':
                    if (snakeDir.z !== -1) nextDir = { x: 0, z: 1 };
                    break;
                case 'left':
                    if (snakeDir.x !== 1) nextDir = { x: -1, z: 0 };
                    break;
            }
        };
        arrow.addEventListener('touchstart', handler, { passive: false });
        arrow.addEventListener('mousedown', handler);
    });

    // Touch Powerup button mappings
    const btnBoost = document.getElementById('btn-boost');
    const btnMagnet = document.getElementById('btn-break'); // Remapped to Magnet button
    const btnShield = document.getElementById('btn-shield');

    btnBoost.addEventListener('touchstart', (e) => {
        e.preventDefault();
        activateBoost();
    });
    btnBoost.addEventListener('mousedown', (e) => {
        e.preventDefault();
        activateBoost();
    });

    btnMagnet.addEventListener('touchstart', (e) => {
        e.preventDefault();
        activateMagnet();
    });
    btnMagnet.addEventListener('mousedown', (e) => {
        e.preventDefault();
        activateMagnet();
    });

    if (btnShield) {
        btnShield.addEventListener('touchstart', (e) => {
            e.preventDefault();
            activateShield();
        });
        btnShield.addEventListener('mousedown', (e) => {
            e.preventDefault();
            activateShield();
        });
    }
}

function detectDevice() {
    // Show mobile controls overlay if user on mobile/tablet
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                    || (window.innerWidth <= 1024);
    
    const controlsDiv = document.getElementById('mobile-controls');
    if (isMobile) {
        controlsDiv.classList.remove('hidden');
    } else {
        controlsDiv.classList.add('hidden');
    }
}

// --- 9. LIFECYCLE UI HANDLERS ---

function handleStartClick() {
    audio.playUiClick();
    orbitControls.enabled = false;
    
    // High elevate isometric angle follow lock (zoomed out and tilted)
    camera.position.set(0, 31, 23);
    camera.lookAt(0, 0, 1.5);

    document.getElementById('screen-start').classList.add('hidden');
    document.getElementById('game-hud').classList.remove('hidden');
    detectDevice();
    
    resetGameData();
    isPlaying = true;
    isPaused = false;
    isGameOver = false;
}

function handleRestartClick() {
    audio.playUiClick();
    orbitControls.enabled = false;
    camera.position.set(0, 31, 23);
    camera.lookAt(0, 0, 1.5);

    document.getElementById('screen-gameover').classList.add('hidden');
    document.getElementById('game-hud').classList.remove('hidden');
    detectDevice();

    resetGameData();
    isPlaying = true;
    isPaused = false;
    isGameOver = false;
}

function togglePause() {
    if (!isPlaying || isGameOver) return;
    isPaused = !isPaused;
    audio.playUiClick();
    
    const pauseScreen = document.getElementById('screen-pause');
    if (isPaused) {
        document.getElementById('pause-score').innerText = formatScore(score);
        pauseScreen.classList.remove('hidden');
        orbitControls.enabled = true;
    } else {
        pauseScreen.classList.add('hidden');
        orbitControls.enabled = false;
        camera.position.set(0, 31, 23);
        camera.lookAt(0, 0, 1.5);
    }
}

// Window resizing
window.addEventListener('resize', () => {
    const container = document.getElementById('canvas-container');
    const w = container.clientWidth;
    const h = container.clientHeight;
    
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    detectDevice();
});

document.addEventListener('DOMContentLoaded', () => {
    initThree();
    
    const highScoreElem = document.getElementById('high-score');
    if (highScoreElem) {
        highScoreElem.innerText = formatScore(highScore);
    }

    // Auto-initialize audio on first interaction to play sfx and redSnake.mp3
    const initAudioOnInteraction = () => {
        audio.init();
        document.removeEventListener('click', initAudioOnInteraction);
        document.removeEventListener('touchstart', initAudioOnInteraction);
        document.removeEventListener('keydown', initAudioOnInteraction);
    };
    document.addEventListener('click', initAudioOnInteraction);
    document.addEventListener('touchstart', initAudioOnInteraction);
    document.addEventListener('keydown', initAudioOnInteraction);

    // Screen button binds
    document.getElementById('btn-start-game').addEventListener('click', handleStartClick);
    document.getElementById('btn-restart-game').addEventListener('click', handleRestartClick);
    document.getElementById('btn-resume-game').addEventListener('click', () => togglePause());
    document.getElementById('btn-pause').addEventListener('click', (e) => {
        e.stopPropagation();
        togglePause();
    });

    setupDpadControls();

    // Start tick loops
    lastTickTime = performance.now();
    requestAnimationFrame(animate);
});
