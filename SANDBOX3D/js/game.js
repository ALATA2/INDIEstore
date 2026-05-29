import * as THREE from 'three';
import { Player } from './player.js';
import { World } from './world.js';
import { Inventory } from './inventory.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        
        this.initEngine();
        this.initLights();
        
        // Instantiate entities
        this.world = new World(this.scene);
        this.player = new Player(this.scene, this.camera, this.canvas);
        this.inventory = new Inventory();
        
        this.interactionPrompt = document.getElementById('interaction-prompt');
        
        this.setupResize();
        this.setupInteractions();
        this.startLoop();
    }

    initEngine() {
        // Create Scene with a beautiful milky sky background (matches sky dome horizon)
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xe0f2fe); 
        this.scene.fog = new THREE.FogExp2(0xe0f2fe, 0.0035); // Thinned fog for expanded 8x open map

        // Create Perspective Camera
        this.camera = new THREE.PerspectiveCamera(
            55, // Field of View
            window.innerWidth / window.innerHeight, // Aspect Ratio
            0.1, // Near plane
            1000 // Far plane
        );

        // Create WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: "high-performance"
        });
        
        // Setup Renderer Settings
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Shadow configuration: hard, sharp shadows for anime styling
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap; // Hard shadows
        
        // Tone mapping for bright colors
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
    }

    initLights() {
        // 1. Ambient / Hemisphere Light: sky bounce light
        const hemiLight = new THREE.HemisphereLight(0xa3cef1, 0x4f772d, 0.7);
        this.scene.add(hemiLight);

        // 2. Directional Light: strong summer sun casting sharp shadows
        const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.4);
        sunLight.castShadow = true;
        
        // Configure shadow properties
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.bias = -0.0002;
        
        const shadowBound = 20;
        sunLight.shadow.camera.left = -shadowBound;
        sunLight.shadow.camera.right = shadowBound;
        sunLight.shadow.camera.top = shadowBound;
        sunLight.shadow.camera.bottom = -shadowBound;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 60;
        
        this.scene.add(sunLight);
        this.sunLight = sunLight;
    }

    setupResize() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });
    }

    setupInteractions() {
        // Mouse click Raycasting
        this.canvas.addEventListener('click', (e) => this.onCanvasClick(e));

        // Keyboard interact shortcut: 'E'
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'e') {
                this.tryInteract();
            }
        });

        // Mobile touch interact button (pointerdown handles both click and touch seamlessly)
        const mobileActionBtn = document.getElementById('mobile-action-btn');
        if (mobileActionBtn) {
            mobileActionBtn.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Stop propagation to prevent Raycaster fire
                this.tryInteract();
            });
        }
    }

    onCanvasClick(e) {
        // If inventory is open, clicks are handled by the inventory DOM overlay
        if (this.inventory.isOpen) return;

        const rect = this.canvas.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1
        );

        this.raycaster.setFromCamera(mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        
        let clickedChest = null;
        for (const intersect of intersects) {
            let obj = intersect.object;
            while (obj) {
                if (obj.userData && obj.userData.isInteractive && obj.userData.type === 'chest') {
                    clickedChest = obj;
                    break;
                }
                obj = obj.parent;
            }
            if (clickedChest) break;
        }

        if (clickedChest) {
            this.interactWithChest(clickedChest);
        }
    }

    tryInteract() {
        if (this.inventory.isOpen) {
            this.inventory.close();
            return;
        }

        if (this.world && this.world.chestGroup) {
            const chestPos = new THREE.Vector3();
            this.world.chestGroup.getWorldPosition(chestPos);
            const distance = this.player.position.distanceTo(chestPos);

            if (distance <= 3.0) {
                this.inventory.open();
            } else {
                this.showToast("You are too far from the chest to open it!");
            }
        }
    }

    interactWithChest(chest) {
        const chestPos = new THREE.Vector3();
        chest.getWorldPosition(chestPos);
        const distance = this.player.position.distanceTo(chestPos);

        if (distance <= 3.0) {
            this.inventory.open();
        } else {
            this.showToast("You are too far from the chest! Come closer.");
        }
    }

    showToast(msg) {
        let toast = document.getElementById('game-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'game-toast';
            toast.style.position = 'absolute';
            toast.style.left = '50%';
            toast.style.bottom = '180px';
            toast.style.transform = 'translateX(-50%)';
            toast.style.background = '#e7825c'; // Terracotta orange
            toast.style.color = '#fff';
            toast.style.padding = '12px 24px';
            toast.style.borderRadius = '30px';
            toast.style.fontWeight = '800';
            toast.style.fontSize = '13px';
            toast.style.border = '3px solid #fdf6e2'; // Parchment border
            toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
            toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
            toast.style.zIndex = '999';
            toast.style.pointerEvents = 'none';
            document.body.appendChild(toast);
        }
        toast.innerText = msg;
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
        
        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(10px)';
        }, 2200);
    }

    startLoop() {
        const animate = () => {
            requestAnimationFrame(animate);

            const elapsed = this.clock.getElapsedTime();
            const isFrozen = this.inventory ? this.inventory.isOpen : false;

            // Update entities (passes isFrozen to Player so controls are disabled but camera rotates)
            if (this.player) {
                this.player.update(elapsed, isFrozen);
                
                // Keep shadow light centered around player
                if (this.sunLight) {
                    this.sunLight.position.set(
                        this.player.position.x + 15,
                        this.player.position.y + 25,
                        this.player.position.z + 10
                    );
                    this.sunLight.target = this.player.mesh;
                }
            }
            
            if (this.world) {
                this.world.update(elapsed);
                
                // Toggle proximity interaction prompt
                if (this.world.chestGroup && this.interactionPrompt) {
                    const chestPos = new THREE.Vector3();
                    this.world.chestGroup.getWorldPosition(chestPos);
                    const distance = this.player.position.distanceTo(chestPos);

                    if (distance <= 3.0 && !isFrozen) {
                        this.interactionPrompt.classList.remove('hidden');
                    } else {
                        this.interactionPrompt.classList.add('hidden');
                    }
                }
            }

            // Render
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new Game();
});
