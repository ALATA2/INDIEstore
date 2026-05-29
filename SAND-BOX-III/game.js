/**
 * Summer Memories - Sandbox MMO Prototype (Milestone 1)
 * Lead Web Game Developer & Art Director
 */

// --- Game Engine Configurations ---
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const TILE_SIZE = 48; // Grid tile size in pixels
const MAP_COLS = 30;  // 30 * 48 = 1440px
const MAP_ROWS = 20;  // 20 * 48 = 960px
const MAP_WIDTH = MAP_COLS * TILE_SIZE;
const MAP_HEIGHT = MAP_ROWS * TILE_SIZE;

// --- central Game Server Proxy ---
// Manages the state and serves as the bridge for future WebSocket sync.
class GameServerProxy {
    constructor() {
        this.playerState = {
            x: 8.5 * TILE_SIZE, // Start inside the Home Plot
            y: 6.5 * TILE_SIZE,
            dir: 'down',
            isMoving: false,
            zone: 'Home Plot Trail',
            inventory: [
                { id: 'wood', count: 5 },
                { id: 'stone', count: 3 }
            ]
        };
        
        this.chestInventory = [
            { id: 'apple', count: 12 },
            { id: 'herbs', count: 4 }
        ];
        
        // Mock sync delay to simulate server communication
        this.latency = 30;
    }

    async getPlayerState() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ ...this.playerState });
            }, this.latency);
        });
    }

    async updatePlayerState(newState) {
        return new Promise(resolve => {
            setTimeout(() => {
                Object.assign(this.playerState, newState);
                resolve({ success: true, state: this.playerState });
            }, this.latency);
        });
    }
    
    async getChestInventory() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([...this.chestInventory]);
            }, this.latency);
        });
    }

    async transferItem(itemId, direction) {
        return new Promise(resolve => {
            setTimeout(() => {
                let source, dest;
                if (direction === 'deposit') {
                    source = this.playerState.inventory;
                    dest = this.chestInventory;
                } else {
                    source = this.chestInventory;
                    dest = this.playerState.inventory;
                }

                // Find item in source
                const srcIdx = source.findIndex(item => item.id === itemId);
                if (srcIdx === -1 || source[srcIdx].count <= 0) {
                    resolve({ success: false, message: 'Item not found in source' });
                    return;
                }

                // Decrement from source
                source[srcIdx].count--;
                if (source[srcIdx].count === 0) {
                    source.splice(srcIdx, 1);
                }

                // Increment in destination
                const destIdx = dest.findIndex(item => item.id === itemId);
                if (destIdx !== -1) {
                    dest[destIdx].count++;
                } else {
                    dest.push({ id: itemId, count: 1 });
                }

                resolve({ 
                    success: true, 
                    playerInventory: [...this.playerState.inventory], 
                    chestInventory: [...this.chestInventory] 
                });
            }, this.latency);
        });
    }
}

// Instantiate server proxy
const serverProxy = new GameServerProxy();

// --- Sprites & Art Procedural Cache ---
// Renders all game assets onto offscreen canvases at startup for fast rendering and Ghibli look.
class SpriteCache {
    constructor() {
        this.sprites = {};
        this.generateSprites();
    }

    get(name) {
        return this.sprites[name];
    }

    generateSprites() {
        // 1. Grass Tile
        this.sprites['grass'] = this.createOffscreen(TILE_SIZE, TILE_SIZE, (ctx) => {
            // Vibrant lime-lush green base
            ctx.fillStyle = '#4cb050';
            ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
            
            // Stylized grass blades
            ctx.strokeStyle = '#388e3c';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            
            // Draw 3-4 small clusters of grass blades
            const clusters = [
                {x: 8, y: 12}, {x: 28, y: 10}, {x: 16, y: 32}, {x: 36, y: 36}
            ];
            clusters.forEach(c => {
                ctx.beginPath();
                ctx.moveTo(c.x, c.y);
                ctx.quadraticCurveTo(c.x - 2, c.y - 6, c.x - 4, c.y - 8);
                ctx.moveTo(c.x, c.y);
                ctx.quadraticCurveTo(c.x, c.y - 8, c.x, c.y - 10);
                ctx.moveTo(c.x, c.y);
                ctx.quadraticCurveTo(c.x + 2, c.y - 5, c.x + 4, c.y - 7);
                ctx.stroke();
            });
            
            // Tiny white & yellow wildflowers
            const flowers = [
                {x: 22, y: 18, color: '#ffffff'},
                {x: 10, y: 38, color: '#fff176'},
                {x: 38, y: 22, color: '#ffffff'}
            ];
            flowers.forEach(f => {
                ctx.fillStyle = f.color;
                ctx.beginPath();
                ctx.arc(f.x, f.y, 2, 0, Math.PI * 2);
                ctx.fill();
                // Center orange dot
                ctx.fillStyle = '#ff9800';
                ctx.beginPath();
                ctx.arc(f.x, f.y, 0.7, 0, Math.PI * 2);
                ctx.fill();
            });
        });

        // 2. Dirt Path Tile
        this.sprites['dirt'] = this.createOffscreen(TILE_SIZE, TILE_SIZE, (ctx) => {
            // Warm terracotta-beige sand base
            ctx.fillStyle = '#e5a975';
            ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
            
            // Texture pebbles
            ctx.fillStyle = '#d3925c';
            const stones = [
                {x: 5, y: 8, w: 4, h: 2}, {x: 18, y: 22, w: 3, h: 3},
                {x: 35, y: 12, w: 5, h: 3}, {x: 28, y: 38, w: 4, h: 2}
            ];
            stones.forEach(s => {
                ctx.beginPath();
                ctx.roundRect(s.x, s.y, s.w, s.h, 1);
                ctx.fill();
            });
            
            // Subtle shading on paths to blend edges
            ctx.fillStyle = 'rgba(76, 176, 80, 0.15)';
            ctx.fillRect(0, 0, TILE_SIZE, 3);
            ctx.fillRect(0, 0, 3, TILE_SIZE);
        });

        // 3. Fence Horizontal
        this.sprites['fence_h'] = this.createOffscreen(TILE_SIZE, TILE_SIZE, (ctx) => {
            // Clear sky shadows (blue-shifted) underneath
            ctx.fillStyle = 'rgba(26, 36, 86, 0.25)';
            ctx.fillRect(0, 24, TILE_SIZE, 12);
            
            // Wooden beams (warm orange-brown terracotta tint)
            ctx.fillStyle = '#bd6a3c';
            ctx.fillRect(0, 16, TILE_SIZE, 6);
            ctx.fillRect(0, 26, TILE_SIZE, 6);
            
            // Fence posts
            ctx.fillStyle = '#9c4d23';
            ctx.fillRect(8, 8, 8, 30);
            ctx.fillRect(32, 8, 8, 30);
            
            // Post caps/details (Cel highlight)
            ctx.fillStyle = '#e08b58';
            ctx.fillRect(8, 8, 8, 4);
            ctx.fillRect(32, 8, 8, 4);
            
            // Dark outlines
            ctx.strokeStyle = '#5c2b12';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(8, 8, 8, 30);
            ctx.strokeRect(32, 8, 8, 30);
        });

        // 4. Fence Vertical
        this.sprites['fence_v'] = this.createOffscreen(TILE_SIZE, TILE_SIZE, (ctx) => {
            // Blue-shifted shadows
            ctx.fillStyle = 'rgba(26, 36, 86, 0.25)';
            ctx.fillRect(16, 8, 16, 40);

            // Fence post
            ctx.fillStyle = '#9c4d23';
            ctx.fillRect(18, 0, 12, TILE_SIZE);
            
            // Connected rails
            ctx.fillStyle = '#bd6a3c';
            ctx.fillRect(6, 10, 24, 6);
            ctx.fillRect(6, 30, 24, 6);
            
            // Highlights & shadows
            ctx.fillStyle = '#e08b58';
            ctx.fillRect(18, 0, 4, TILE_SIZE);
            
            ctx.strokeStyle = '#5c2b12';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(18, 0, 12, TILE_SIZE);
        });

        // 5. Giant Summer Tree (96x112 - spans 2x3 tiles approx)
        this.sprites['tree'] = this.createOffscreen(96, 120, (ctx) => {
            // Blue-shifted shadow cast on the ground (slanted to bottom-left matching top-right light)
            ctx.fillStyle = 'rgba(22, 33, 76, 0.35)';
            ctx.beginPath();
            ctx.ellipse(48, 105, 36, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Tree Trunk (gnarly dark brown wood)
            ctx.fillStyle = '#512a18';
            ctx.beginPath();
            ctx.moveTo(42, 105);
            ctx.lineTo(40, 60);
            ctx.quadraticCurveTo(48, 55, 56, 60);
            ctx.lineTo(54, 105);
            ctx.closePath();
            ctx.fill();
            
            // Cel highlight on trunk (right side)
            ctx.fillStyle = '#824c32';
            ctx.beginPath();
            ctx.moveTo(48, 105);
            ctx.lineTo(48, 60);
            ctx.quadraticCurveTo(52, 58, 56, 60);
            ctx.lineTo(54, 105);
            ctx.closePath();
            ctx.fill();

            // Lush volumetric Ghibli Foliage - Overlapping green cloud shapes
            // Background deep shadow foliage first
            ctx.fillStyle = '#105e26'; // Deep forest green shadow
            this.drawLeafBubble(ctx, 30, 45, 26);
            this.drawLeafBubble(ctx, 66, 45, 26);
            this.drawLeafBubble(ctx, 48, 30, 32);
            
            // Mid-tone green foliage
            ctx.fillStyle = '#2ea446'; // Vibrant green
            this.drawLeafBubble(ctx, 34, 40, 24);
            this.drawLeafBubble(ctx, 62, 40, 24);
            this.drawLeafBubble(ctx, 48, 26, 28);
            this.drawLeafBubble(ctx, 22, 60, 20);
            this.drawLeafBubble(ctx, 74, 60, 20);

            // Bright sunlit highlights (cel-shading top-right light source)
            ctx.fillStyle = '#9ded5d'; // Bright summer yellow-green
            this.drawLeafBubble(ctx, 40, 34, 18);
            this.drawLeafBubble(ctx, 66, 36, 18);
            this.drawLeafBubble(ctx, 52, 20, 22);
            this.drawLeafBubble(ctx, 76, 54, 14);
            this.drawLeafBubble(ctx, 26, 54, 12);
        });

        // 6. Styled Rocks
        this.sprites['rock'] = this.createOffscreen(TILE_SIZE, TILE_SIZE, (ctx) => {
            // Shadow
            ctx.fillStyle = 'rgba(26, 36, 86, 0.3)';
            ctx.beginPath();
            ctx.ellipse(24, 38, 20, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Base shadow side of rock
            ctx.fillStyle = '#4c5f7a'; // Blue-grey slate
            ctx.beginPath();
            ctx.moveTo(10, 38);
            ctx.lineTo(38, 38);
            ctx.lineTo(42, 24);
            ctx.lineTo(24, 12);
            ctx.lineTo(6, 22);
            ctx.closePath();
            ctx.fill();

            // Light highlight side (Cel-shading)
            ctx.fillStyle = '#8ca0ba'; // Warm light slate
            ctx.beginPath();
            ctx.moveTo(24, 12);
            ctx.lineTo(42, 24);
            ctx.lineTo(34, 26);
            ctx.lineTo(22, 20);
            ctx.lineTo(12, 24);
            ctx.closePath();
            ctx.fill();

            // Hard line details
            ctx.strokeStyle = '#283545';
            ctx.lineWidth = 2;
            ctx.lineJoin = 'miter';
            ctx.beginPath();
            ctx.moveTo(10, 38);
            ctx.lineTo(38, 38);
            ctx.lineTo(42, 24);
            ctx.lineTo(24, 12);
            ctx.lineTo(6, 22);
            ctx.closePath();
            ctx.stroke();

            // Shading dividing edge
            ctx.beginPath();
            ctx.moveTo(24, 12);
            ctx.lineTo(22, 20);
            ctx.lineTo(12, 24);
            ctx.moveTo(22, 20);
            ctx.lineTo(34, 26);
            ctx.stroke();
        });
        
        // 7. Chest Sprite
        this.sprites['chest'] = this.createOffscreen(TILE_SIZE, TILE_SIZE, (ctx) => {
            // Ground shadow
            ctx.fillStyle = 'rgba(22, 33, 76, 0.35)';
            ctx.fillRect(4, 34, 40, 10);
            
            // Chest body (reddish terracotta wood)
            ctx.fillStyle = '#a04218';
            ctx.fillRect(6, 16, 36, 24);
            
            // Lid (curved top, orange highlight)
            ctx.fillStyle = '#bd5323';
            ctx.fillRect(6, 10, 36, 8);
            
            // Metal banding (gold straps)
            ctx.fillStyle = '#ffd54f';
            ctx.fillRect(12, 10, 4, 30);
            ctx.fillRect(32, 10, 4, 30);
            
            // Metal lock plate
            ctx.fillStyle = '#ffb300';
            ctx.fillRect(21, 16, 6, 8);
            ctx.fillStyle = '#37474f';
            ctx.beginPath();
            ctx.arc(24, 20, 1.5, 0, Math.PI*2);
            ctx.fill();

            // Black outline
            ctx.strokeStyle = '#511b05';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(6, 10, 36, 30);
        });

        // 8. Fluffy Volumetric Clouds
        this.sprites['cloud'] = this.createOffscreen(200, 100, (ctx) => {
            // Ghibli cloud shadow (soft blue-teal highlight at bottom)
            ctx.fillStyle = 'rgba(190, 225, 240, 0.85)';
            this.drawCloudCircles(ctx, 0, 10);

            // Brilliant white body
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            this.drawCloudCircles(ctx, 0, 0);
        });
    }

    createOffscreen(width, height, drawFn) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        drawFn(ctx);
        return canvas;
    }

    drawLeafBubble(ctx, x, y, r) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    drawCloudCircles(ctx, dx, dy) {
        ctx.beginPath();
        ctx.arc(60 + dx, 50 + dy, 30, 0, Math.PI * 2);
        ctx.arc(100 + dx, 40 + dy, 40, 0, Math.PI * 2);
        ctx.arc(140 + dx, 50 + dy, 25, 0, Math.PI * 2);
        ctx.arc(80 + dx, 65 + dy, 25, 0, Math.PI * 2);
        ctx.arc(120 + dx, 65 + dy, 25, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
}

const spriteCache = new SpriteCache();

// --- Map Data & Collision Zone ---
class TileMap {
    constructor() {
        this.cols = MAP_COLS;
        this.rows = MAP_ROWS;
        
        // Grid setup: G = Grass (walkable), D = Dirt Path (walkable), E = Empty cliff (non-walkable)
        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill('G'));
        
        // Build boundaries & layout
        this.initLayout();
    }

    initLayout() {
        // 1. Cliff drop-off (empty tiles north and west)
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (r < 3 || c < 3) {
                    this.grid[r][c] = 'E'; // Empty space (shows sky/ocean parallax)
                }
            }
        }

        // 2. Home Plot fence rectangle: col 5 to 11, row 4 to 8
        // Mark boundaries inside the grid
        for (let r = 4; r <= 8; r++) {
            for (let c = 5; c <= 11; c++) {
                if (r === 4 || r === 8 || c === 5 || c === 11) {
                    // Place fences on layout, except for gate on the right
                    if (!(c === 11 && r === 6)) {
                        this.grid[r][c] = 'F'; // Fence obstacle
                    }
                }
            }
        }

        // 3. Dirt paths (Home plot gate winding to right edge)
        // Gate is at (col 11, row 6)
        this.grid[6][11] = 'D';
        this.grid[6][12] = 'D';
        this.grid[6][13] = 'D';
        this.grid[7][13] = 'D';
        this.grid[8][13] = 'D';
        this.grid[8][14] = 'D';
        this.grid[8][15] = 'D';
        
        // Trail winding to the right edge (Mountain Edge)
        for (let c = 16; c < this.cols; c++) {
            this.grid[8][c] = 'D';
            this.grid[9][c] = 'D';
        }

        // Trail branch going south (Town Boundary)
        for (let r = 9; r < this.rows; r++) {
            this.grid[r][15] = 'D';
            this.grid[r][16] = 'D';
        }
        
        // Put Chest at Home Plot back wall (col 7, row 5)
        this.grid[5][7] = 'C'; // Chest obstacle

        // Put majestic trees along the cliff edge as a safety guard
        for (let c = 3; c < this.cols; c += 3) {
            this.grid[3][c] = 'T'; // Tree obstacle
        }
        for (let r = 3; r < this.rows; r += 3) {
            this.grid[r][3] = 'T'; // Tree obstacle on western cliff edge
        }

        // Put some decorative rocks
        this.grid[12][8] = 'R'; // Rock
        this.grid[15][24] = 'R'; // Rock
        this.grid[5][20] = 'R'; // Rock
        this.grid[17][6] = 'R'; // Rock
    }

    isBlocked(col, row) {
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return true;
        const tile = this.grid[row][col];
        return tile === 'E' || tile === 'F' || tile === 'T' || tile === 'R' || tile === 'C';
    }

    draw(ctx, camX, camY) {
        // Draw tiles inside screen viewport bounds
        const startCol = Math.max(0, Math.floor(camX / TILE_SIZE));
        const endCol = Math.min(this.cols, Math.ceil((camX + CANVAS_WIDTH) / TILE_SIZE));
        const startRow = Math.max(0, Math.floor(camY / TILE_SIZE));
        const endRow = Math.min(this.rows, Math.ceil((camY + CANVAS_HEIGHT) / TILE_SIZE));

        for (let r = startRow; r < endRow; r++) {
            for (let c = startCol; c < endCol; c++) {
                const x = c * TILE_SIZE - camX;
                const y = r * TILE_SIZE - camY;
                const tile = this.grid[r][c];

                if (tile === 'G' || tile === 'F' || tile === 'T' || tile === 'R' || tile === 'C') {
                    // Draw grass background first
                    ctx.drawImage(spriteCache.get('grass'), x, y);
                } else if (tile === 'D') {
                    ctx.drawImage(spriteCache.get('dirt'), x, y);
                }

                // Render obstacles on top
                if (tile === 'F') {
                    // Determine horizontal or vertical fence based on neighbors
                    const isLeftFence = c > 0 && this.grid[r][c-1] === 'F';
                    const isRightFence = c < this.cols - 1 && this.grid[r][c+1] === 'F';
                    if (isLeftFence || isRightFence) {
                        ctx.drawImage(spriteCache.get('fence_h'), x, y);
                    } else {
                        ctx.drawImage(spriteCache.get('fence_v'), x, y);
                    }
                } else if (tile === 'R') {
                    ctx.drawImage(spriteCache.get('rock'), x, y);
                } else if (tile === 'C') {
                    ctx.drawImage(spriteCache.get('chest'), x, y);
                }
            }
        }
    }

    // Secondary draw pass for elements that overlap the player (e.g. Tree tops)
    drawYAlignedElements(ctx, camX, camY, player) {
        const startCol = Math.max(0, Math.floor(camX / TILE_SIZE) - 2);
        const endCol = Math.min(this.cols, Math.ceil((camX + CANVAS_WIDTH) / TILE_SIZE) + 2);
        const startRow = Math.max(0, Math.floor(camY / TILE_SIZE) - 2);
        const endRow = Math.min(this.rows, Math.ceil((camY + CANVAS_HEIGHT) / TILE_SIZE) + 2);

        // Collect all depth-sortable objects (Trees and Player)
        const renderQueue = [];

        for (let r = startRow; r < endRow; r++) {
            for (let c = startCol; c < endCol; c++) {
                const tile = this.grid[r][c];
                if (tile === 'T') {
                    // Tree trunk is at (c * TILE_SIZE, r * TILE_SIZE)
                    // The tree is drawn offset (bottom center of trunk is at bottom edge of cell)
                    renderQueue.push({
                        type: 'tree',
                        x: (c * TILE_SIZE) - 24, // Sprite width 96 (48 * 2) -> center trunk
                        y: (r * TILE_SIZE) - 72, // Sprite height 120 -> align trunk base
                        depth: (r * TILE_SIZE) + 36 // Depth comparison at trunk base
                    });
                }
            }
        }

        // Add player to the queue
        renderQueue.push({
            type: 'player',
            x: player.x,
            y: player.y,
            depth: player.y
        });

        // Sort rendering elements by depth (Y position)
        renderQueue.sort((a, b) => a.depth - b.depth);

        // Draw everything sorted
        renderQueue.forEach(item => {
            if (item.type === 'tree') {
                ctx.drawImage(spriteCache.get('tree'), item.x - camX, item.y - camY);
            } else if (item.type === 'player') {
                player.draw(ctx, camX, camY);
            }
        });
    }
}

const tileMap = new TileMap();

// --- Player Character (PC) ---
class Player {
    constructor() {
        this.x = 8.5 * TILE_SIZE;
        this.y = 6.5 * TILE_SIZE;
        this.radius = 14;      // Collision radius at feet
        this.width = 32;       // Visual width
        this.height = 48;      // Visual height
        this.speed = 180;      // Pixels per second
        this.dir = 'down';     // Facing direction: 'up', 'down', 'left', 'right'
        this.isMoving = false;
        
        // Animation
        this.animTime = 0;
        this.walkCycleDuration = 0.4; // seconds for full stride
    }

    update(dt, input, map) {
        let vx = 0;
        let vy = 0;

        if (input.keys['KeyW'] || input.keys['ArrowUp']) {
            vy = -1;
            this.dir = 'up';
        } else if (input.keys['KeyS'] || input.keys['ArrowDown']) {
            vy = 1;
            this.dir = 'down';
        }

        if (input.keys['KeyA'] || input.keys['ArrowLeft']) {
            vx = -1;
            this.dir = 'left';
        } else if (input.keys['KeyD'] || input.keys['ArrowRight']) {
            vx = 1;
            this.dir = 'right';
        }

        // Normalize velocity
        if (vx !== 0 && vy !== 0) {
            const length = Math.hypot(vx, vy);
            vx /= length;
            vy /= length;
        }

        this.isMoving = (vx !== 0 || vy !== 0);

        if (this.isMoving) {
            this.animTime += dt;
            
            // Multi-pass sliding collision detection
            const nextX = this.x + vx * this.speed * dt;
            if (!this.checkCollision(nextX, this.y, map)) {
                this.x = nextX;
            }

            const nextY = this.y + vy * this.speed * dt;
            if (!this.checkCollision(this.x, nextY, map)) {
                this.y = nextY;
            }
            
            // Sync with central proxy server asynchronously
            serverProxy.updatePlayerState({
                x: this.x,
                y: this.y,
                dir: this.dir,
                isMoving: this.isMoving
            });
        } else {
            this.animTime = 0;
        }
    }

    checkCollision(x, y, map) {
        // Map edge boundaries
        if (x - this.radius < 0 || x + this.radius > MAP_WIDTH) return true;
        if (y - this.radius < 0 || y + this.radius > MAP_HEIGHT) return true;

        // Check points around player's bounding circle
        const angleStep = Math.PI / 4;
        for (let a = 0; a < Math.PI * 2; a += angleStep) {
            const checkX = x + Math.cos(a) * this.radius;
            const checkY = y + Math.sin(a) * this.radius;
            
            const col = Math.floor(checkX / TILE_SIZE);
            const row = Math.floor(checkY / TILE_SIZE);
            
            if (map.isBlocked(col, row)) {
                return true;
            }
        }
        return false;
    }

    draw(ctx, camX, camY) {
        const drawX = this.x - camX;
        const drawY = this.y - camY;

        // Vector-drawn Player Character (Ghibli Summer styling)
        ctx.save();

        // 1. Blue-shifted drop shadow under character
        ctx.fillStyle = 'rgba(26, 36, 86, 0.4)';
        ctx.beginPath();
        ctx.ellipse(drawX, drawY + 2, this.radius, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Leg walking animations using sine wave
        let stride = 0;
        if (this.isMoving) {
            stride = Math.sin(this.animTime * Math.PI * 2 / this.walkCycleDuration) * 6;
        }

        // Draw Legs
        ctx.fillStyle = '#4e342e'; // Dark brown boots
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 1.5;
        
        if (this.dir === 'up' || this.dir === 'down') {
            // Left leg
            ctx.fillRect(drawX - 7, drawY - 8 + stride, 4, 10);
            ctx.strokeRect(drawX - 7, drawY - 8 + stride, 4, 10);
            // Right leg
            ctx.fillRect(drawX + 3, drawY - 8 - stride, 4, 10);
            ctx.strokeRect(drawX + 3, drawY - 8 - stride, 4, 10);
        } else if (this.dir === 'left' || this.dir === 'right') {
            // Side walking legs
            ctx.fillRect(drawX - 5 + stride, drawY - 8, 4, 10);
            ctx.strokeRect(drawX - 5 + stride, drawY - 8, 4, 10);
            ctx.fillRect(drawX + 1 - stride, drawY - 8, 4, 10);
            ctx.strokeRect(drawX + 1 - stride, drawY - 8, 4, 10);
        }

        // 2. Large Iconic Backpack (Draw order depends on direction)
        // If facing UP, draw backpack LAST (covers back).
        // If facing DOWN, draw backpack FIRST (partially hidden by torso).
        // If facing LEFT/RIGHT, draw backpack sticking out side.
        const drawBackpack = () => {
            ctx.save();
            ctx.fillStyle = '#ff7043'; // Terracotta orange
            ctx.strokeStyle = '#bf360c'; // Terracotta dark outline
            ctx.lineWidth = 2;
            
            if (this.dir === 'down') {
                // Backpack visible peeking behind shoulders
                ctx.beginPath();
                ctx.roundRect(drawX - 16, drawY - 32, 32, 18, 4);
                ctx.fill();
                ctx.stroke();
                
                // Top roll (sleeping bag)
                ctx.fillStyle = '#ffd54f'; // Yellow blanket roll
                ctx.strokeStyle = '#f57f17';
                ctx.beginPath();
                ctx.roundRect(drawX - 12, drawY - 38, 24, 8, 2);
                ctx.fill();
                ctx.stroke();
            } else if (this.dir === 'up') {
                // Large full backpack covering the back
                ctx.beginPath();
                ctx.roundRect(drawX - 14, drawY - 34, 28, 26, 6);
                ctx.fill();
                ctx.stroke();

                // Pockets
                ctx.fillStyle = '#f4511e';
                ctx.fillRect(drawX - 10, drawY - 24, 20, 12);
                ctx.strokeRect(drawX - 10, drawY - 24, 20, 12);
                
                // Top roll
                ctx.fillStyle = '#ffd54f';
                ctx.strokeStyle = '#f57f17';
                ctx.beginPath();
                ctx.roundRect(drawX - 11, drawY - 40, 22, 8, 2);
                ctx.fill();
                ctx.stroke();
                
                // Straps
                ctx.strokeStyle = '#3e2723';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(drawX - 10, drawY - 34);
                ctx.lineTo(drawX - 10, drawY - 8);
                ctx.moveTo(drawX + 10, drawY - 34);
                ctx.lineTo(drawX + 10, drawY - 8);
                ctx.stroke();
            } else if (this.dir === 'left') {
                // Backpack bulging to the right (behind player looking left)
                ctx.beginPath();
                ctx.roundRect(drawX + 2, drawY - 34, 12, 24, 5);
                ctx.fill();
                ctx.stroke();

                // Sleeping roll
                ctx.fillStyle = '#ffd54f';
                ctx.strokeStyle = '#f57f17';
                ctx.beginPath();
                ctx.roundRect(drawX + 2, drawY - 39, 10, 7, 2);
                ctx.fill();
                ctx.stroke();
            } else if (this.dir === 'right') {
                // Backpack bulging to the left
                ctx.beginPath();
                ctx.roundRect(drawX - 14, drawY - 34, 12, 24, 5);
                ctx.fill();
                ctx.stroke();

                // Sleeping roll
                ctx.fillStyle = '#ffd54f';
                ctx.strokeStyle = '#f57f17';
                ctx.beginPath();
                ctx.roundRect(drawX - 12, drawY - 39, 10, 7, 2);
                ctx.fill();
                ctx.stroke();
            }
            ctx.restore();
        };

        if (this.dir === 'down') {
            drawBackpack();
        }

        // 3. Torso (Summer white/blue polo shirt)
        ctx.fillStyle = '#e0f7fa'; // Ice blue light shirt
        ctx.strokeStyle = '#006064';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(drawX - 11, drawY - 26, 22, 18, [6, 6, 2, 2]);
        ctx.fill();
        ctx.stroke();

        // 4. Head & Fluffy Hair (Cel shaded)
        ctx.fillStyle = '#ffe0b2'; // Peach skin
        ctx.beginPath();
        ctx.arc(drawX, drawY - 32, 9, 0, Math.PI * 2);
        ctx.fill();

        // Hair (Ghibli messy summer brown hair)
        ctx.fillStyle = '#5d4037'; // Cocoa brown
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        if (this.dir === 'down') {
            // Front hair bangs
            ctx.arc(drawX, drawY - 34, 10, Math.PI, 0); // main cap
            ctx.quadraticCurveTo(drawX + 6, drawY - 32, drawX + 10, drawY - 30);
            ctx.lineTo(drawX + 7, drawY - 32);
            ctx.lineTo(drawX + 3, drawY - 28);
            ctx.lineTo(drawX, drawY - 31);
            ctx.lineTo(drawX - 3, drawY - 28);
            ctx.lineTo(drawX - 7, drawY - 32);
            ctx.lineTo(drawX - 10, drawY - 30);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Little eyes (Anime style dots)
            ctx.fillStyle = '#101524';
            ctx.beginPath();
            ctx.arc(drawX - 3, drawY - 32, 1.2, 0, Math.PI * 2);
            ctx.arc(drawX + 3, drawY - 32, 1.2, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.dir === 'up') {
            // Back of hair fully visible
            ctx.arc(drawX, drawY - 34, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else if (this.dir === 'left') {
            // Side profile facing left
            ctx.arc(drawX, drawY - 34, 10, Math.PI * 1.5, Math.PI * 0.5);
            ctx.lineTo(drawX - 10, drawY - 32);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Side eye dot
            ctx.fillStyle = '#101524';
            ctx.beginPath();
            ctx.arc(drawX - 4, drawY - 32, 1.2, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.dir === 'right') {
            // Side profile facing right
            ctx.arc(drawX, drawY - 34, 10, Math.PI * 0.5, Math.PI * 1.5);
            ctx.lineTo(drawX + 10, drawY - 32);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Side eye dot
            ctx.fillStyle = '#101524';
            ctx.beginPath();
            ctx.arc(drawX + 4, drawY - 32, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw backpack if not already drawn
        if (this.dir !== 'down') {
            drawBackpack();
        }

        ctx.restore();
    }
}

const player = new Player();

// --- Camera System ---
class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = CANVAS_WIDTH;
        this.height = CANVAS_HEIGHT;
        this.lerpSpeed = 0.08; // Smooth follow speed
    }

    update(targetX, targetY) {
        // Target camera centered on player
        const targetCamX = targetX - this.width / 2;
        const targetCamY = targetY - this.height / 2;

        // Smoothly interpolate (lerp)
        this.x += (targetCamX - this.x) * this.lerpSpeed;
        this.y += (targetCamY - this.y) * this.lerpSpeed;

        // Clamp camera to map boundaries
        this.x = Math.max(0, Math.min(MAP_WIDTH - this.width, this.x));
        this.y = Math.max(0, Math.min(MAP_HEIGHT - this.height, this.y));
    }
}

const camera = new Camera();

// --- Keyboard Input Handling ---
class InputHandler {
    constructor() {
        this.keys = {};
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
}

const inputHandler = new InputHandler();

// --- Parallax Environment Renderer ---
class ParallaxRenderer {
    constructor() {
        this.clouds = [
            { x: 100, y: 80, speed: 12, scale: 0.8 },
            { x: 500, y: 40, speed: 8, scale: 1.2 },
            { x: 800, y: 120, speed: 15, scale: 0.6 }
        ];
    }

    update(dt) {
        // Update clouds position (slow scrolling + wind)
        this.clouds.forEach(c => {
            c.x -= c.speed * dt;
            if (c.x < -250) {
                c.x = MAP_WIDTH + 100;
                c.y = 30 + Math.random() * 120;
            }
        });
    }

    draw(ctx, camX, camY) {
        // 1. Sky Gradient (fixed screen background)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        skyGrad.addColorStop(0, '#2196f3'); // Azure Sky
        skyGrad.addColorStop(0.35, '#64b5f6'); // Sky Blue Light
        skyGrad.addColorStop(0.6, '#90caf9'); // Clear horizons
        skyGrad.addColorStop(0.72, '#26a69a'); // Emerald ocean highlight
        skyGrad.addColorStop(1, '#004d40'); // Ocean deep teal
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Sun flare (top right summer sunlight)
        const sunGrad = ctx.createRadialGradient(CANVAS_WIDTH * 0.8, 80, 5, CANVAS_WIDTH * 0.8, 80, 200);
        sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        sunGrad.addColorStop(0.4, 'rgba(255, 253, 230, 0.15)');
        sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = sunGrad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 2. Parallax Cloud Layer
        this.clouds.forEach(c => {
            // Camera movement has slow impact on clouds (parallax)
            const drawX = c.x - camX * 0.05;
            const drawY = c.y - camY * 0.02;
            
            ctx.save();
            ctx.translate(drawX, drawY);
            ctx.scale(c.scale, c.scale);
            ctx.drawImage(spriteCache.get('cloud'), 0, 0);
            ctx.restore();
        });

        // 3. Distant Ocean Horizon & Mountains (scrolled at 10%)
        ctx.fillStyle = '#00796b'; // Ocean Teal
        const oceanY = 320 - camY * 0.1;
        ctx.fillRect(0, oceanY, CANVAS_WIDTH, CANVAS_HEIGHT - oceanY);

        // Distant Mountain Silhouettes (Shinkai style mountains)
        ctx.fillStyle = '#4db6ac'; // Light Teal mountain shade
        ctx.beginPath();
        const mountainY = 320 - camY * 0.08;
        ctx.moveTo(-100, oceanY);
        ctx.lineTo(150 - camX * 0.08, mountainY - 60);
        ctx.lineTo(380 - camX * 0.08, oceanY);
        ctx.lineTo(450 - camX * 0.08, mountainY - 40);
        ctx.lineTo(600 - camX * 0.08, oceanY);
        ctx.lineTo(800 - camX * 0.08, mountainY - 80);
        ctx.lineTo(1000, oceanY);
        ctx.fill();

        // 4. Distant Coastal Town rooftops (Terracotta-orange roofs clustered near ocean)
        ctx.save();
        ctx.translate(-camX * 0.12, -camY * 0.1);
        ctx.fillStyle = '#ff7043'; // Terracotta Orange
        ctx.strokeStyle = '#d84315';
        ctx.lineWidth = 1;
        
        // Draw tiny house shapes clustered on the mountain slopes
        const townHouses = [
            {x: 220, y: 310}, {x: 235, y: 305}, {x: 250, y: 312},
            {x: 520, y: 315}, {x: 535, y: 308}, {x: 550, y: 311},
            {x: 510, y: 320}
        ];
        
        townHouses.forEach(h => {
            // Draw roof triangle
            ctx.beginPath();
            ctx.moveTo(h.x, h.y);
            ctx.lineTo(h.x + 8, h.y - 6);
            ctx.lineTo(h.x + 16, h.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Draw house body
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(h.x + 2, h.y, 12, 10);
            ctx.strokeRect(h.x + 2, h.y, 12, 10);
            ctx.fillStyle = '#ff7043';
        });
        ctx.restore();
    }
}

const parallaxRenderer = new ParallaxRenderer();

// --- Game Master Controller ---
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.lastTime = 0;
        this.isActive = true;

        // Proximity/modal states
        this.canInteract = false;
        this.isChestOpen = false;

        // UI Displays
        this.zoneDisplay = document.getElementById('zone-display');

        // Setup chest modal events
        this.setupModalEvents();

        // Welcome Toast notification
        this.showToast("Welcome to Home Plot Trail! Use WASD to explore.");

        // Start Loop
        requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    setupModalEvents() {
        const closeBtn = document.getElementById('modal-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeChest());
        }

        // Close on ESC or interact on E
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyE') {
                if (this.isChestOpen) {
                    this.closeChest();
                } else if (this.canInteract) {
                    this.openChest();
                }
            } else if (e.code === 'Escape' && this.isChestOpen) {
                this.closeChest();
            }
        });
    }

    async openChest() {
        this.isChestOpen = true;
        document.getElementById('chest-modal').classList.remove('hidden');
        await this.refreshInventories();
    }

    closeChest() {
        this.isChestOpen = false;
        document.getElementById('chest-modal').classList.add('hidden');
    }

    async refreshInventories() {
        const playerState = await serverProxy.getPlayerState();
        const chestInv = await serverProxy.getChestInventory();
        
        this.renderInventoryList('player-inventory-list', playerState.inventory, 'deposit');
        this.renderInventoryList('chest-inventory-list', chestInv, 'withdraw');
    }

    renderInventoryList(elementId, items, action) {
        const container = document.getElementById(elementId);
        if (!container) return;

        container.innerHTML = '';

        if (items.length === 0) {
            container.innerHTML = `<span class="empty-list-message">Empty</span>`;
            return;
        }

        const itemInfo = {
            wood: { name: 'Forest Wood', icon: '🪵' },
            stone: { name: 'River Stone', icon: '🪨' },
            apple: { name: 'Sweet Apple', icon: '🍎' },
            herbs: { name: 'Green Herbs', icon: '🌿' }
        };

        items.forEach(item => {
            const info = itemInfo[item.id] || { name: item.id, icon: '📦' };
            const div = document.createElement('div');
            div.className = 'inventory-item';
            div.innerHTML = `
                <div class="item-details">
                    <span class="item-icon">${info.icon}</span>
                    <span class="item-name">${info.name}</span>
                    <span class="item-count">${item.count}</span>
                </div>
                <button data-id="${item.id}" data-action="${action}">
                    ${action === 'deposit' ? 'Deposit' : 'Withdraw'}
                </button>
            `;
            container.appendChild(div);
        });

        // Add event listeners to the buttons
        container.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const itemId = e.target.dataset.id;
                const act = e.target.dataset.action;
                
                const result = await serverProxy.transferItem(itemId, act);
                if (result.success) {
                    await this.refreshInventories();
                    
                    const info = itemInfo[itemId] || { name: itemId };
                    if (act === 'deposit') {
                        this.showToast(`Deposited 1 ${info.name}`);
                    } else {
                        this.showToast(`Withdrew 1 ${info.name}`);
                    }
                }
            });
        });
    }

    loop(timestamp) {
        if (!this.isActive) return;

        if (!this.lastTime) this.lastTime = timestamp;
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        const cappedDt = Math.min(dt, 0.1);

        this.update(cappedDt);
        this.draw();

        requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    update(dt) {
        // Proximity detection for chest (Chest tile is col 7, row 5)
        const chestX = 7 * TILE_SIZE + TILE_SIZE / 2;
        const chestY = 5 * TILE_SIZE + TILE_SIZE / 2;
        const dist = Math.hypot(player.x - chestX, player.y - chestY);
        
        if (dist < TILE_SIZE * 1.5) {
            this.canInteract = true;
        } else {
            this.canInteract = false;
            // Auto close if player walks away
            if (this.isChestOpen) {
                this.closeChest();
            }
        }

        // Update objects
        if (!this.isChestOpen) {
            player.update(dt, inputHandler, tileMap);
        } else {
            player.isMoving = false;
        }

        camera.update(player.x, player.y);
        parallaxRenderer.update(dt);

        // Update HUD
        if (this.zoneDisplay) {
            this.zoneDisplay.textContent = player.y > TILE_SIZE * 12 && player.x > TILE_SIZE * 12 
                ? "Trail Crossing" : "Home Plot Trail";
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 1. Draw parallax sky, clouds, oceans, mountains
        parallaxRenderer.draw(this.ctx, camera.x, camera.y);

        // 2. Draw ground tiles (Grass & Dirt path)
        tileMap.draw(this.ctx, camera.x, camera.y);

        // 3. Draw depth-sorted objects (Player & Trees)
        tileMap.drawYAlignedElements(this.ctx, camera.x, camera.y, player);

        // 4. Draw interaction bubble above chest
        if (this.canInteract && !this.isChestOpen) {
            this.drawInteractPrompt();
        }
    }

    drawInteractPrompt() {
        const chestX = 7 * TILE_SIZE + TILE_SIZE / 2 - camera.x;
        const chestY = 5 * TILE_SIZE - 8 - camera.y;

        this.ctx.save();
        
        // Shadow
        this.ctx.fillStyle = 'rgba(26, 36, 86, 0.2)';
        this.ctx.beginPath();
        this.ctx.roundRect(chestX - 55, chestY - 25, 110, 22, 6);
        this.ctx.fill();

        // Bubble body
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = '#e64a19';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.roundRect(chestX - 55, chestY - 27, 110, 22, 6);
        this.ctx.fill();
        this.ctx.stroke();

        // Triangle pointer
        this.ctx.beginPath();
        this.ctx.moveTo(chestX - 5, chestY - 5);
        this.ctx.lineTo(chestX, chestY + 1);
        this.ctx.lineTo(chestX + 5, chestY - 5);
        this.ctx.closePath();
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
        this.ctx.strokeStyle = '#e64a19';
        this.ctx.stroke();

        // Text
        this.ctx.fillStyle = '#101524';
        this.ctx.font = '600 11px Outfit, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('[E] Open Chest', chestX, chestY - 16);

        this.ctx.restore();
    }

    showToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideUpFade 0.3s ease-out reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize Game when page loads
window.addEventListener('load', () => {
    new Game();
});
