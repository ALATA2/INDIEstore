import * as THREE from 'three';
import { getTerrainHeight } from './world.js';

export class Player {
    constructor(scene, camera, domElement) {
        this.scene = scene;
        this.camera = camera;
        this.domElement = domElement;

        // Player movement attributes
        this.speed = 0.08;
        this.rotationSpeed = 0.15;
        
        // Start on Home Plot terrace (Y = 2.0)
        this.position = new THREE.Vector3(0, 2.0, 0); 
        
        // Input states
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            ArrowUp: false,
            ArrowLeft: false,
            ArrowDown: false,
            ArrowRight: false
        };

        // Joystick Input values (for mobile)
        this.joystickInput = { x: 0, y: 0 };

        // Camera orbit angles and distance
        this.cameraDistance = 6.0;
        this.cameraTheta = Math.PI; // Horizontal rotation
        this.cameraPhi = Math.PI / 6;  // Vertical rotation (30 degrees)
        this.minPhi = 0.05;
        this.maxPhi = Math.PI / 2.2;
        
        this.isMouseDown = false;
        this.previousMousePosition = { x: 0, y: 0 };

        // Generate cel-shading gradient map
        this.toonGradient = this.createToonGradientTexture();

        // Create player visual representation
        this.mesh = this.createPlayerMesh();
        this.scene.add(this.mesh);
        
        this.mesh.position.copy(this.position);
        this.setupInputs();
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

    createPlayerMesh() {
        const playerGroup = new THREE.Group();

        // Materials: Toon Shaded
        const skinMat = new THREE.MeshToonMaterial({ color: 0xffd1b3, gradientMap: this.toonGradient });
        const shirtMat = new THREE.MeshToonMaterial({ color: 0x4cc9f0, gradientMap: this.toonGradient }); // Sky Blue
        const pantsMat = new THREE.MeshToonMaterial({ color: 0x3a0ca3, gradientMap: this.toonGradient }); // Indigo shorts
        const shoeMat = new THREE.MeshToonMaterial({ color: 0x7209b7, gradientMap: this.toonGradient });
        const hatMat = new THREE.MeshToonMaterial({ color: 0xe9c46a, gradientMap: this.toonGradient });  // Straw yellow
        const ribbonMat = new THREE.MeshToonMaterial({ color: 0xe76f51, gradientMap: this.toonGradient }); // Red ribbon
        const backpackMat = new THREE.MeshToonMaterial({ color: 0xf72585, gradientMap: this.toonGradient }); // Hot pink

        // 1. Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.4), shirtMat);
        torso.position.y = 0.65;
        torso.castShadow = true;
        torso.receiveShadow = true;
        playerGroup.add(torso);

        // 2. Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), skinMat);
        head.position.y = 1.15;
        head.castShadow = true;
        head.receiveShadow = true;
        playerGroup.add(head);

        // 3. Straw Hat
        const hatGroup = new THREE.Group();
        hatGroup.position.y = 1.35;
        
        const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.04, 12), hatMat);
        brim.castShadow = true;
        hatGroup.add(brim);

        const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.06, 12), ribbonMat);
        ribbon.position.y = 0.05;
        ribbon.castShadow = true;
        hatGroup.add(ribbon);

        const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.2, 12), hatMat);
        dome.position.y = 0.15;
        dome.castShadow = true;
        hatGroup.add(dome);

        playerGroup.add(hatGroup);

        // 4. Backpack
        const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.22), backpackMat);
        backpack.position.set(0, 0.65, -0.3);
        backpack.castShadow = true;
        
        const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.08), backpackMat);
        pocket.position.set(0, -0.08, -0.12);
        pocket.castShadow = true;
        backpack.add(pocket);

        playerGroup.add(backpack);

        // 5. Limbs
        const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.2), pantsMat);
        leftLeg.position.set(-0.18, 0.2, 0);
        leftLeg.castShadow = true;
        playerGroup.add(leftLeg);

        const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.2), pantsMat);
        rightLeg.position.set(0.18, 0.2, 0);
        rightLeg.castShadow = true;
        playerGroup.add(rightLeg);

        const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.28), shoeMat);
        leftShoe.position.set(-0.18, 0.02, 0.04);
        leftShoe.castShadow = true;
        playerGroup.add(leftShoe);

        const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.28), shoeMat);
        rightShoe.position.set(0.18, 0.02, 0.04);
        rightShoe.castShadow = true;
        playerGroup.add(rightShoe);

        this.leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.18), shirtMat);
        this.leftArm.position.set(-0.42, 0.65, 0);
        this.leftArm.castShadow = true;
        playerGroup.add(this.leftArm);

        this.rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.18), shirtMat);
        this.rightArm.position.set(0.42, 0.65, 0);
        this.rightArm.castShadow = true;
        playerGroup.add(this.rightArm);

        this.leftLeg = leftLeg;
        this.rightLeg = rightLeg;

        return playerGroup;
    }

    setupInputs() {
        // Keyboard inputs
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.keys) this.keys[key] = true;
            if (e.key in this.keys) this.keys[e.key] = true;
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.keys) this.keys[key] = false;
            if (e.key in this.keys) this.keys[e.key] = false;
        });

        // Mouse controls
        this.domElement.addEventListener('mousedown', (e) => {
            if (e.target === this.domElement) {
                this.isMouseDown = true;
                this.previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isMouseDown) return;

            const deltaX = e.clientX - this.previousMousePosition.x;
            const deltaY = e.clientY - this.previousMousePosition.y;

            this.cameraTheta += deltaX * 0.007;
            this.cameraPhi -= deltaY * 0.007;
            this.cameraPhi = Math.max(this.minPhi, Math.min(this.maxPhi, this.cameraPhi));

            this.previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });

        window.addEventListener('wheel', (e) => {
            this.cameraDistance += e.deltaY * 0.005;
            this.cameraDistance = Math.max(3.0, Math.min(12.0, this.cameraDistance));
        }, { passive: true });

        // --- Touch controls (Mobile Layout Joystick) ---
        const base = document.getElementById('joystick-base');
        const knob = document.getElementById('joystick-knob');
        const mobileControls = document.getElementById('mobile-controls');

        // Verify touch support and show mobile overlay dynamically
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (mobileControls && hasTouch) {
            mobileControls.classList.remove('hidden-mobile');
        }

        if (base && knob) {
            let touchId = null;

            const updateJoystick = (touch) => {
                const rect = base.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                let dx = touch.clientX - centerX;
                let dy = touch.clientY - centerY;

                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxRadius = 35; // Maximum travel distance for the visual knob

                if (dist > maxRadius) {
                    dx = (dx / dist) * maxRadius;
                    dy = (dy / dist) * maxRadius;
                }

                knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

                // Set speed vectors (-1 to 1)
                this.joystickInput.x = dx / maxRadius;
                this.joystickInput.y = -(dy / maxRadius); // Negate Y so dragging UP moves FORWARD
            };

            base.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (touchId !== null) return;
                const touch = e.changedTouches[0];
                touchId = touch.identifier;
                updateJoystick(touch);
            }, { passive: false });

            base.addEventListener('touchmove', (e) => {
                e.preventDefault();
                for (let i = 0; i < e.touches.length; i++) {
                    if (e.touches[i].identifier === touchId) {
                        updateJoystick(e.touches[i]);
                        break;
                    }
                }
            }, { passive: false });

            const stopJoystick = (e) => {
                e.preventDefault();
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === touchId) {
                        touchId = null;
                        knob.style.transform = 'translate(-50%, -50%)'; // Reset knob to center
                        this.joystickInput.x = 0;
                        this.joystickInput.y = 0;
                        break;
                    }
                }
            };

            base.addEventListener('touchend', stopJoystick, { passive: false });
            base.addEventListener('touchcancel', stopJoystick, { passive: false });
        }

        // Canvas swipe touch orbit logic
        let canvasTouchId = null;
        let lastTouchX = 0;
        let lastTouchY = 0;

        this.domElement.addEventListener('touchstart', (e) => {
            if (e.target !== this.domElement) return;
            if (canvasTouchId !== null) return;

            const touch = e.changedTouches[0];
            canvasTouchId = touch.identifier;
            lastTouchX = touch.clientX;
            lastTouchY = touch.clientY;
        }, { passive: true });

        this.domElement.addEventListener('touchmove', (e) => {
            for (let i = 0; i < e.touches.length; i++) {
                if (e.touches[i].identifier === canvasTouchId) {
                    const touch = e.touches[i];
                    const deltaX = touch.clientX - lastTouchX;
                    const deltaY = touch.clientY - lastTouchY;

                    // Apply swipe camera adjustments
                    this.cameraTheta += deltaX * 0.006;
                    this.cameraPhi -= deltaY * 0.006;
                    this.cameraPhi = Math.max(this.minPhi, Math.min(this.maxPhi, this.cameraPhi));

                    lastTouchX = touch.clientX;
                    lastTouchY = touch.clientY;
                    break;
                }
            }
        }, { passive: true });

        const endCanvasTouch = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === canvasTouchId) {
                    canvasTouchId = null;
                    break;
                }
            }
        };

        this.domElement.addEventListener('touchend', endCanvasTouch, { passive: true });
        this.domElement.addEventListener('touchcancel', endCanvasTouch, { passive: true });
    }

    update(time, isFrozen = false) {
        let isMoving = false;

        if (!isFrozen) {
            const right = new THREE.Vector3();
            const forward = new THREE.Vector3();

            // Extract camera direction columns
            right.setFromMatrixColumn(this.camera.matrixWorld, 0);
            right.y = 0;
            right.normalize();

            forward.setFromMatrixColumn(this.camera.matrixWorld, 2);
            forward.negate();
            forward.y = 0;
            forward.normalize();

            const moveDirection = new THREE.Vector3();

            // Keyboard keys
            if (this.keys.w || this.keys.ArrowUp) moveDirection.add(forward);
            if (this.keys.s || this.keys.ArrowDown) moveDirection.sub(forward);
            if (this.keys.a || this.keys.ArrowLeft) moveDirection.sub(right);
            if (this.keys.d || this.keys.ArrowRight) moveDirection.add(right);

            // Touch Joystick input overlays
            if (Math.abs(this.joystickInput.x) > 0.05 || Math.abs(this.joystickInput.y) > 0.05) {
                moveDirection.addScaledVector(right, this.joystickInput.x);
                moveDirection.addScaledVector(forward, this.joystickInput.y);
            }

            isMoving = moveDirection.lengthSq() > 0;

            if (isMoving) {
                moveDirection.normalize();
                
                // Map boundaries lock
                const newX = this.position.x + moveDirection.x * this.speed;
                const newZ = this.position.z + moveDirection.z * this.speed;
                
                if (Math.abs(newX) < 48) this.position.x = newX;
                if (Math.abs(newZ) < 48) this.position.z = newZ;

                const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
                let diff = targetRotation - this.mesh.rotation.y;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;
                this.mesh.rotation.y += diff * this.rotationSpeed;

                const swingSpeed = 12;
                const swingAngle = 0.4;
                const angle = Math.sin(time * swingSpeed) * swingAngle;
                
                this.leftLeg.rotation.x = angle;
                this.rightLeg.rotation.x = -angle;
                this.leftArm.rotation.x = -angle;
                this.rightArm.rotation.x = angle;
            }
        }

        // Stepped terrain heights snapping
        const targetY = getTerrainHeight(this.position.x, this.position.z);
        this.position.y += (targetY - this.position.y) * 0.18;
        
        this.mesh.position.copy(this.position);

        if (!isMoving) {
            this.leftLeg.rotation.x *= 0.8;
            this.rightLeg.rotation.x *= 0.8;
            this.leftArm.rotation.x *= 0.8;
            this.rightArm.rotation.x *= 0.8;
        }

        // Camera Follow alignment
        const targetCameraX = this.position.x + this.cameraDistance * Math.sin(this.cameraTheta) * Math.cos(this.cameraPhi);
        const targetCameraY = this.position.y + this.cameraDistance * Math.sin(this.cameraPhi);
        const targetCameraZ = this.position.z + this.cameraDistance * Math.cos(this.cameraTheta) * Math.cos(this.cameraPhi);

        const targetCamPos = new THREE.Vector3(targetCameraX, targetCameraY, targetCameraZ);
        this.camera.position.lerp(targetCamPos, 0.1);
        
        const lookTarget = new THREE.Vector3(this.position.x, this.position.y + 0.6, this.position.z);
        this.camera.lookAt(lookTarget);
    }
}
