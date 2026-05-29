import * as THREE from 'three';

// Export terrain height calculation to snap entities like player to the ground
export function getTerrainHeight(x, z) {
    // Check bounds (scaled 8x from 50 to 400)
    if (Math.abs(x) > 400 || Math.abs(z) > 400) return -2.0;
    
    // Coastal town stepped slope (scaled 8x):
    // Z goes from -400 (back, mountain) to 400 (front, sea)
    if (z < -192) return 6.0;        // Mountain / High Cliff
    if (z < -96) return 4.0;         // High Terrace
    if (z < 96) return 2.0;          // Home Plot Terrace (Flat)
    if (z < 192) return 0.0;         // Low Terrace / Shore
    return -2.0;                     // Water plane level
}

export class World {
    constructor(scene) {
        this.scene = scene;
        this.chests = [];
        this.clouds = [];
        
        // 1. Create cel-shading gradient maps
        this.toonGradient = this.createToonGradientTexture();
        this.cloudToonGradient = this.createCloudToonGradientTexture();

        // 2. Create elements
        this.createSkyDome();
        this.createSteppedTerrain();
        this.createWater();
        this.createHomePlot();
        this.createStorageChest();
        this.createTrees();
        this.createFlowers();
        this.createClouds();
    }

    createToonGradientTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 4;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#666666'; // shadow
        ctx.fillRect(0, 0, 2, 1);
        ctx.fillStyle = '#cccccc'; // midtone
        ctx.fillRect(2, 0, 1, 1);
        ctx.fillStyle = '#ffffff'; // highlight
        ctx.fillRect(3, 0, 1, 1);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;
        return texture;
    }

    // Creates a custom Ghibli toon gradient specifically for clouds with lavender shadows
    createCloudToonGradientTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 4;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        
        // Dusty lavender / soft violet-blue shadow (#b3b7db)
        ctx.fillStyle = '#b3b7db'; 
        ctx.fillRect(0, 0, 2, 1);
        
        // Light warm lavender midtone (#f1f2f9)
        ctx.fillStyle = '#f1f2f9'; 
        ctx.fillRect(2, 0, 1, 1);
        
        // Pure white highlight (#ffffff)
        ctx.fillStyle = '#ffffff'; 
        ctx.fillRect(3, 0, 1, 1);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;
        return texture;
    }

    // Generates a 2D canvas vertical gradient for the 3D sky dome (pastel blue theme)
    createSkyGradientTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        const grad = ctx.createLinearGradient(0, 0, 0, 256);
        grad.addColorStop(0, '#a2d2ff');    // Soft pastel blue top
        grad.addColorStop(0.45, '#bde0fe'); // Light pastel blue mid
        grad.addColorStop(0.8, '#dbe9f6');  // Soft milky blue lower
        grad.addColorStop(1.0, '#f3f8fb');  // Milky white-blue horizon
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1, 256);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createSkyDome() {
        // Sphere surrounding the 800x800 map
        const skyGeo = new THREE.SphereGeometry(450, 32, 15);
        const skyTexture = this.createSkyGradientTexture();
        const skyMat = new THREE.MeshBasicMaterial({
            map: skyTexture,
            side: THREE.BackSide // Render on the inside
        });
        
        const skyMesh = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(skyMesh);
    }

    createSteppedTerrain() {
        // Materials for different steps
        const grassHigh = new THREE.MeshToonMaterial({ color: 0x4f772d, gradientMap: this.toonGradient }); // Darker forest grass
        const grassMid = new THREE.MeshToonMaterial({ color: 0x55a630, gradientMap: this.toonGradient });  // Standard vibrant grass
        const grassLow = new THREE.MeshToonMaterial({ color: 0x80b918, gradientMap: this.toonGradient });  // Lighter grass near shore
        const sandShore = new THREE.MeshToonMaterial({ color: 0xddb892, gradientMap: this.toonGradient }); // Warm terracotta sand shore

        const terrainWidth = 800; // Scaled by 8 (was 100)
        const baseDepth = -4.0; // The base y level where all terraces sink to

        // Terrace configurations: { zStart, zEnd, topY, material } (scaled 8x)
        const terraces = [
            { zStart: -400, zEnd: -192, topY: 6.0, mat: grassHigh },
            { zStart: -192, zEnd: -96,  topY: 4.0, mat: grassHigh },
            { zStart: -96,  zEnd: 96,   topY: 2.0, mat: grassMid },  // Home plot sits here
            { zStart: 96,   zEnd: 192,  topY: 0.0, mat: grassLow },
            { zStart: 192,  zEnd: 400,  topY: -2.0, mat: sandShore } // Snaps below water level
        ];

        terraces.forEach((t) => {
            const depth = t.zEnd - t.zStart;
            const height = t.topY - baseDepth;
            const geo = new THREE.BoxGeometry(terrainWidth, height, depth);
            const mesh = new THREE.Mesh(geo, t.mat);
            
            // Calculate center positions
            const centerZ = (t.zStart + t.zEnd) / 2;
            const centerY = t.topY - height / 2;
            
            mesh.position.set(0, centerY, centerZ);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            
            this.scene.add(mesh);
        });
    }

    createWater() {
        // Turquoise Ghibli-style water plane
        const waterMat = new THREE.MeshToonMaterial({
            color: 0x00b4d8, // Vibrant turquoise water
            gradientMap: this.toonGradient,
            transparent: true,
            opacity: 0.85
        });

        // Giant water plane (scaled 8x)
        const waterGeo = new THREE.PlaneGeometry(1000, 1000);
        const water = new THREE.Mesh(waterGeo, waterMat);
        
        // Orient horizontally and place slightly above sand shore level
        water.rotation.x = -Math.PI / 2;
        water.position.set(0, -1.95, 0); 
        water.receiveShadow = true;
        
        this.scene.add(water);
    }

    createHomePlot() {
        const plotSize = 8;
        const halfSize = plotSize / 2;
        const plotY = 2.0; // Home Plot Terrace ground level is at Y = 2.0

        const woodMat = new THREE.MeshToonMaterial({
            color: 0xd85a38, // Warm terracotta
            gradientMap: this.toonGradient
        });

        const posts = [
            { x: -halfSize, z: -halfSize },
            { x: halfSize, z: -halfSize },
            { x: -halfSize, z: halfSize },
            { x: halfSize, z: halfSize },
            { x: -halfSize, z: -halfSize / 2 },
            { x: -halfSize, z: 0 },
            { x: -halfSize, z: halfSize / 2 },
            { x: halfSize, z: -halfSize / 2 },
            { x: halfSize, z: 0 },
            { x: halfSize, z: halfSize / 2 },
            { x: -halfSize / 2, z: -halfSize },
            { x: 0, z: -halfSize },
            { x: halfSize / 2, z: -halfSize },
            { x: -halfSize / 2 - 0.5, z: halfSize },
            { x: halfSize / 2 + 0.5, z: halfSize }
        ];

        const postGeometry = new THREE.BoxGeometry(0.18, 0.8, 0.18);
        
        posts.forEach(pos => {
            const post = new THREE.Mesh(postGeometry, woodMat);
            // Center Y is offset by plotY + post height/2
            post.position.set(pos.x, plotY + 0.4, pos.z);
            post.castShadow = true;
            post.receiveShadow = true;
            this.scene.add(post);
        });

        const createRail = (x1, z1, x2, z2) => {
            const dx = x2 - x1;
            const dz = z2 - z1;
            const length = Math.sqrt(dx * dx + dz * dz);
            const railGeo = new THREE.BoxGeometry(0.06, 0.08, length);
            
            const rail1 = new THREE.Mesh(railGeo, woodMat);
            rail1.position.set((x1 + x2) / 2, plotY + 0.25, (z1 + z2) / 2);
            rail1.rotation.y = Math.atan2(dx, dz);
            rail1.castShadow = true;
            rail1.receiveShadow = true;
            this.scene.add(rail1);

            const rail2 = new THREE.Mesh(railGeo, woodMat);
            rail2.position.set((x1 + x2) / 2, plotY + 0.55, (z1 + z2) / 2);
            rail2.rotation.y = Math.atan2(dx, dz);
            rail2.castShadow = true;
            rail2.receiveShadow = true;
            this.scene.add(rail2);
        };

        // Left, Right, Back, and Front rails
        createRail(-halfSize, -halfSize, -halfSize, halfSize);
        createRail(halfSize, -halfSize, halfSize, halfSize);
        createRail(-halfSize, -halfSize, halfSize, -halfSize);
        createRail(-halfSize, halfSize, -halfSize / 2 - 0.5, halfSize);
        createRail(halfSize / 2 + 0.5, halfSize, halfSize, halfSize);
    }

    createStorageChest() {
        const plotY = 2.0;
        const chestGroup = new THREE.Group();
        // Placed at z = -2, on the Home Plot terrace
        chestGroup.position.set(0, plotY, -2); 

        const mainChestMat = new THREE.MeshToonMaterial({
            color: 0x9e5a3c, // wood
            gradientMap: this.toonGradient
        });
        const strapMat = new THREE.MeshToonMaterial({
            color: 0x5c3d2e, // straps
            gradientMap: this.toonGradient
        });
        const lockMat = new THREE.MeshToonMaterial({
            color: 0xffbc42, // lock
            gradientMap: this.toonGradient
        });

        const base = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 0.65), mainChestMat);
        base.position.y = 0.25;
        base.castShadow = true;
        base.receiveShadow = true;
        chestGroup.add(base);

        const lid = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.2, 0.67), mainChestMat);
        lid.position.y = 0.6;
        lid.castShadow = true;
        lid.receiveShadow = true;
        chestGroup.add(lid);

        const strapLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.72, 0.69), strapMat);
        strapLeft.position.set(-0.3, 0.36, 0);
        strapLeft.castShadow = true;
        chestGroup.add(strapLeft);

        const strapRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.72, 0.69), strapMat);
        strapRight.position.set(0.3, 0.36, 0);
        strapRight.castShadow = true;
        chestGroup.add(strapRight);

        const lock = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.08), lockMat);
        lock.position.set(0, 0.45, 0.34);
        lock.castShadow = true;
        chestGroup.add(lock);

        this.scene.add(chestGroup);
        
        chestGroup.userData = {
            isInteractive: true,
            type: 'chest',
            name: 'Storage Chest'
        };
        
        this.chests.push(chestGroup);
        this.chestGroup = chestGroup;
    }

    createTrees() {
        const trunkMat = new THREE.MeshToonMaterial({ color: 0x7a5c43, gradientMap: this.toonGradient });
        const leavesMat = new THREE.MeshToonMaterial({ color: 0x38b000, gradientMap: this.toonGradient });

        this.trees = []; // Store trees for collisions and chopping interactions

        // Generate 80 random trees scattered across the land steps (Y >= 0)
        for (let i = 0; i < 80; i++) {
            const rx = -380 + Math.random() * 760;
            const rz = -380 + Math.random() * 760;
            
            // Avoid placing trees inside the Home Plot fence area (X: [-5, 5], Z: [-5, 5])
            if (Math.abs(rx) < 5.0 && Math.abs(rz) < 5.0) continue;

            const groundY = getTerrainHeight(rx, rz);
            if (groundY < 0.0) continue; // Only grow trees on dry terraces

            const treeGroup = new THREE.Group();
            treeGroup.position.set(rx, groundY, rz);

            // Trunk: tall box (Pivot is at bottom Y = 0)
            const trunkHeight = 1.6 + Math.random() * 0.6;
            const trunk = new THREE.Mesh(new THREE.BoxGeometry(0.3, trunkHeight, 0.3), trunkMat);
            trunk.position.y = trunkHeight / 2;
            trunk.castShadow = true;
            trunk.receiveShadow = true;
            treeGroup.add(trunk);

            // Leaves: 3 blocky overlapping boxes
            const leafSizes = [1.2, 0.9, 0.6];
            let leafY = trunkHeight - 0.2;

            leafSizes.forEach((size) => {
                const leaves = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), leavesMat);
                leaves.position.y = leafY + size / 2;
                leaves.castShadow = true;
                leaves.receiveShadow = true;
                treeGroup.add(leaves);
                leafY += size * 0.65;
            });

            this.scene.add(treeGroup);

            // Register tree group for collision raycasting
            treeGroup.userData = {
                isInteractive: true,
                type: 'tree',
                index: this.trees.length
            };

            this.trees.push({
                x: rx,
                z: rz,
                mesh: treeGroup,
                health: 3,
                isChopped: false,
                isChoppingAnim: false,
                fallAngle: 0
            });
        }
    }

    createFlowers() {
        const stemMat = new THREE.MeshToonMaterial({ color: 0x38b000, gradientMap: this.toonGradient });
        const petalMat = new THREE.MeshToonMaterial({ color: 0xffca3a, gradientMap: this.toonGradient });

        this.flowers = []; // Store flowers for pickup proximity

        // Spawn 60 Ghibli yellow flowers randomly on dry land
        for (let i = 0; i < 60; i++) {
            const rx = -380 + Math.random() * 760;
            const rz = -380 + Math.random() * 760;

            if (Math.abs(rx) < 5.0 && Math.abs(rz) < 5.0) continue; // Avoid Home Plot

            const groundY = getTerrainHeight(rx, rz);
            if (groundY < 0.0) continue;

            const flowerGroup = new THREE.Group();
            flowerGroup.position.set(rx, groundY, rz);

            // Stem
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 6), stemMat);
            stem.position.y = 0.125;
            flowerGroup.add(stem);

            // Petals
            const petals = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.14), petalMat);
            petals.position.y = 0.25;
            flowerGroup.add(petals);

            this.scene.add(flowerGroup);

            this.flowers.push({
                x: rx,
                z: rz,
                mesh: flowerGroup,
                isGathered: false
            });
        }
    }

    createClouds() {
        const cloudMat = new THREE.MeshToonMaterial({
            color: 0xffffff,
            gradientMap: this.cloudToonGradient
        });

        // Create 18 cloud groups scattered in the larger sky
        for (let i = 0; i < 18; i++) {
            const cloud = new THREE.Group();
            
            // Random horizontal positions, high in the sky (scaled 8x)
            const cx = -380 + Math.random() * 760;
            const cy = 16 + Math.random() * 6;
            const cz = -380 + Math.random() * 760;
            cloud.position.set(cx, cy, cz);

            // Create 5-8 overlapping spheres to form a fluffy shape
            const numSpheres = 5 + Math.floor(Math.random() * 4);
            for (let j = 0; j < numSpheres; j++) {
                const radius = 1.5 + Math.random() * 1.5;
                const geo = new THREE.SphereGeometry(radius, 8, 8);
                const mesh = new THREE.Mesh(geo, cloudMat);
                
                // Offset spheres relative to group center
                const ox = (j - numSpheres/2) * 1.2 + (Math.random() - 0.5) * 0.5;
                const oy = (Math.random() - 0.5) * 0.6;
                const oz = (Math.random() - 0.5) * 1.2;
                mesh.position.set(ox, oy, oz);
                
                mesh.castShadow = false; // Clouds don't block sunlight completely
                cloud.add(mesh);
            }

            // Save speed attribute for loop animation
            cloud.userData = {
                speed: 0.02 + Math.random() * 0.04
            };

            this.scene.add(cloud);
            this.clouds.push(cloud);
        }
    }

    update(time) {
        // Slowly drift clouds across the sky
        this.clouds.forEach(cloud => {
            cloud.position.x += cloud.userData.speed;
            
            // Wrap around screen boundaries (scaled 8x)
            if (cloud.position.x > 400) {
                cloud.position.x = -400;
                cloud.position.z = -380 + Math.random() * 760;
            }
        });

        // Animate chopped trees falling to the ground
        if (this.trees) {
            this.trees.forEach(tree => {
                if (tree.isChoppingAnim) {
                    tree.fallAngle += 0.06;
                    
                    // Rotate group on its edge (pivot Y=0 hinges from base)
                    tree.mesh.rotation.z = tree.fallAngle;
                    
                    // Once flat on ground, remove mesh
                    if (tree.fallAngle >= Math.PI / 2) {
                        tree.isChoppingAnim = false;
                        tree.mesh.position.y = -10; // Sink out of sight
                        this.scene.remove(tree.mesh);
                    }
                }
            });
        }
    }
}
