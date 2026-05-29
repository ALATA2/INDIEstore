import * as THREE from 'three';

// Export terrain height calculation to snap entities like player to the ground
export function getTerrainHeight(x, z) {
    // Check bounds
    if (Math.abs(x) > 50 || Math.abs(z) > 50) return -2.0;
    
    // Coastal town stepped slope:
    // Z goes from -50 (back, mountain) to 50 (front, sea)
    if (z < -24) return 6.0;        // Mountain / High Cliff
    if (z < -12) return 4.0;        // High Terrace
    if (z < 12) return 2.0;          // Home Plot Terrace (Flat)
    if (z < 24) return 0.0;          // Low Terrace / Shore
    return -2.0;                     // Water plane level
}

export class World {
    constructor(scene) {
        this.scene = scene;
        this.chests = [];
        this.clouds = [];
        
        // 1. Create cel-shading gradient map
        this.toonGradient = this.createToonGradientTexture();

        // 2. Create elements
        this.createSteppedTerrain();
        this.createWater();
        this.createHomePlot();
        this.createStorageChest();
        this.createTrees();
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

    createSteppedTerrain() {
        // Materials for different steps
        const grassHigh = new THREE.MeshToonMaterial({ color: 0x4f772d, gradientMap: this.toonGradient }); // Darker forest grass
        const grassMid = new THREE.MeshToonMaterial({ color: 0x55a630, gradientMap: this.toonGradient });  // Standard vibrant grass
        const grassLow = new THREE.MeshToonMaterial({ color: 0x80b918, gradientMap: this.toonGradient });  // Lighter grass near shore
        const sandShore = new THREE.MeshToonMaterial({ color: 0xddb892, gradientMap: this.toonGradient }); // Warm terracotta sand shore

        const terrainWidth = 100;
        const baseDepth = -4.0; // The base y level where all terraces sink to

        // Terrace configurations: { zStart, zEnd, topY, material }
        const terraces = [
            { zStart: -50, zEnd: -24, topY: 6.0, mat: grassHigh },
            { zStart: -24, zEnd: -12, topY: 4.0, mat: grassHigh },
            { zStart: -12, zEnd: 12,  topY: 2.0, mat: grassMid },  // Home plot sits here
            { zStart: 12,  zEnd: 24,  topY: 0.0, mat: grassLow },
            { zStart: 24,  zEnd: 50,  topY: -2.0, mat: sandShore } // Snaps below water level
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

        // Giant water plane
        const waterGeo = new THREE.PlaneGeometry(150, 150);
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
        // Trunk material
        const trunkMat = new THREE.MeshToonMaterial({ color: 0x7a5c43, gradientMap: this.toonGradient });
        // Leaf material
        const leavesMat = new THREE.MeshToonMaterial({ color: 0x38b000, gradientMap: this.toonGradient });

        const treePositions = [
            { x: -14, z: -35 }, // Terrace 1 (Y=6)
            { x: 18,  z: -30 }, // Terrace 1 (Y=6)
            { x: -16, z: -18 }, // Terrace 2 (Y=4)
            { x: 20,  z: -16 }, // Terrace 2 (Y=4)
            { x: -12, z: 2 },   // Terrace 3 (Y=2)
            { x: 15,  z: -4 },  // Terrace 3 (Y=2)
            { x: -14, z: 16 },  // Terrace 4 (Y=0)
            { x: 16,  z: 18 }   // Terrace 4 (Y=0)
        ];

        treePositions.forEach(pos => {
            const groundY = getTerrainHeight(pos.x, pos.z);
            const treeGroup = new THREE.Group();
            treeGroup.position.set(pos.x, groundY, pos.z);

            // Trunk: tall box
            const trunkHeight = 1.6 + Math.random() * 0.6;
            const trunk = new THREE.Mesh(new THREE.BoxGeometry(0.3, trunkHeight, 0.3), trunkMat);
            trunk.position.y = trunkHeight / 2;
            trunk.castShadow = true;
            trunk.receiveShadow = true;
            treeGroup.add(trunk);

            // Leaves: 3 blocky overlapping boxes for Studio Ghibli/Minecraft blend
            const leafSizes = [1.2, 0.9, 0.6];
            let leafY = trunkHeight - 0.2;

            leafSizes.forEach((size, idx) => {
                const leaves = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), leavesMat);
                leaves.position.y = leafY + size / 2;
                leaves.castShadow = true;
                leaves.receiveShadow = true;
                treeGroup.add(leaves);
                leafY += size * 0.65;
            });

            this.scene.add(treeGroup);
        });
    }

    createClouds() {
        const cloudMat = new THREE.MeshToonMaterial({
            color: 0xffffff,
            gradientMap: this.toonGradient
        });

        // Create 5 cloud groups
        for (let i = 0; i < 5; i++) {
            const cloud = new THREE.Group();
            
            // Random horizontal positions, high in the sky (y=16 to 22)
            const cx = -40 + Math.random() * 80;
            const cy = 16 + Math.random() * 5;
            const cz = -40 + Math.random() * 80;
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
                speed: 0.03 + Math.random() * 0.05
            };

            this.scene.add(cloud);
            this.clouds.push(cloud);
        }
    }

    update(time) {
        // Slowly drift clouds across the sky
        this.clouds.forEach(cloud => {
            cloud.position.x += cloud.userData.speed;
            
            // Wrap around screen boundaries
            if (cloud.position.x > 65) {
                cloud.position.x = -65;
                cloud.position.z = -50 + Math.random() * 100;
            }
        });
    }
}
