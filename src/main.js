import './style.css';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const GRAVITY = 0.8;
let currentLevelIndex = 0;

// --- Three.js Setup for 3D Character ---
const threeScene = new THREE.Scene();
const threeCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
const threeRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
threeRenderer.setSize(256, 256); // Character render resolution
threeCamera.position.set(0, 1, 5);
threeCamera.lookAt(0, 1, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
threeScene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.position.set(5, 10, 7.5);
threeScene.add(dirLight);

class Entity {
    constructor(x, y, width, height, color) {
        this.x = x; this.y = y; this.width = width; this.height = height; this.color = color;
        this.active = true;
        this.initialX = x;
        this.initialY = y;
        this.velocityY = 0;
        this.isFalling = false;
    }
    update() {
        if (this.isFalling) {
            this.velocityY += GRAVITY * 0.5;
            this.y += this.velocityY;
        }
    }
    draw(camera) {
        if (!this.active) return;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - camera.x, this.y, this.width, this.height);
    }
}

class Spikes extends Entity {
    constructor(x, y, width = 40) {
        super(x, y, width, 20, '#555');
        this.hidden = true;
    }
    draw(camera) {
        if (this.hidden || !this.active) return;
        ctx.fillStyle = '#777';
        for (let i = 0; i < this.width / 10; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x - camera.x + i * 10, this.y + this.height);
            ctx.lineTo(this.x - camera.x + i * 10 + 5, this.y);
            ctx.lineTo(this.x - camera.x + i * 10 + 10, this.y + this.height);
            ctx.fill();
        }
    }
}

class MysteryBlock extends Entity {
    constructor(x, y) { super(x, y, 40, 40, '#FFA500'); this.hit = false; }
    draw(camera) {
        ctx.fillStyle = this.hit ? '#8B4513' : this.color;
        ctx.fillRect(this.x - camera.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#000'; ctx.strokeRect(this.x - camera.x, this.y, this.width, this.height);
        if (!this.hit) { ctx.fillStyle = 'white'; ctx.font = '20px Arial'; ctx.fillText('?', this.x - camera.x + 15, this.y + 25); }
    }
}

class Coin extends Entity {
    constructor(x, y) { super(x, y, 20, 20, '#FFD700'); }
    draw(camera) {
        if (!this.active) return;
        ctx.beginPath(); ctx.arc(this.x - camera.x + 10, this.y + 10, 10, 0, Math.PI * 2);
        ctx.fillStyle = this.color; ctx.fill(); ctx.strokeStyle = '#DAA520'; ctx.stroke();
    }
}

class Enemy extends Entity {
    constructor(x, y) { super(x, y, 35, 30, '#8B0000'); this.speed = -2; }
    update(platforms) {
        if (!this.active) return;
        this.x += this.speed;
        let onGround = false;
        platforms.forEach(p => { if (this.x + this.width / 2 > p.x && this.x + this.width / 2 < p.x + p.width && Math.abs(this.y + this.height - p.y) < 5) onGround = true; });
        if (!onGround || this.x < 0) this.speed *= -1;
    }
}

class Cloud {
    constructor(x, y) { this.x = x; this.y = y; }
    draw(camera) {
        ctx.fillStyle = 'white'; ctx.beginPath();
        ctx.arc(this.x - camera.x * 0.5 + 20, this.y, 25, 0, Math.PI * 2);
        ctx.arc(this.x - camera.x * 0.5 + 50, this.y - 10, 30, 0, Math.PI * 2);
        ctx.arc(this.x - camera.x * 0.5 + 80, this.y, 25, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Player {
    constructor() {
        this.width = 35;
        this.height = 50;
        this.resetPosition();
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpForce = -18;
        this.onGround = false;
        this.coins = 0;
        this.lives = 3;
        this.won = false;
        this.isLarge = false;
        this.facingRight = true;
        this.rotation = 0;

        // Load 3D Model
        this.modelReady = false;
        this.loadModel();
    }

    resetPosition() {
        this.x = 100;
        this.y = 400;
        this.velocityX = 0;
        this.velocityY = 0;
    }

    loadModel() {
        const mtlLoader = new MTLLoader();
        mtlLoader.setPath('./assets/models/');
        mtlLoader.load('plumber.mtl', (materials) => {
            materials.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('./assets/models/');
            objLoader.load('plumber.obj', (object) => {
                this.model = object;
                threeScene.add(this.model);
                this.modelReady = true;
            }, undefined, (err) => console.error("OBJ Loading failed:", err));
        }, undefined, (err) => console.error("MTL Loading failed:", err));
    }

    update(platforms, coins, enemies, blocks, goal, spikes, triggers) {
        if (this.won) return;

        // Apply Gravity
        this.velocityY += GRAVITY;
        this.y += this.velocityY;
        this.onGround = false;

        // Check Trigger Activations
        triggers.forEach(t => {
            if (!t.activated && this.x > t.triggerX) {
                t.activated = true;
                t.action();
            }
        });

        // Platform & Block Collisions
        [...platforms, ...blocks].forEach(p => {
            if (this.collidesWith(p)) {
                if (this.velocityY > 0 && this.y + this.height - this.velocityY <= p.y) {
                    this.y = p.y - this.height;
                    this.velocityY = 0;
                    this.onGround = true;
                    if (p.triggerOnStep) p.isFalling = true;
                } else if (this.velocityY < 0 && this.y - this.velocityY >= p.y + p.height) {
                    this.y = p.y + p.height;
                    this.velocityY = 0;
                    if (p instanceof MysteryBlock && !p.hit) {
                        p.hit = true;
                        this.coins += 5;
                        this.isLarge = true;
                        this.height = 75;
                        document.getElementById('score').innerText = `Coins: ${this.coins}`;
                    }
                }
            }
        });

        // Side Movement & Collisions
        this.x += this.velocityX;
        if (this.velocityX > 0) { this.facingRight = true; this.rotation = 0; }
        else if (this.velocityX < 0) { this.facingRight = false; this.rotation = Math.PI; }

        [...platforms, ...blocks].forEach(p => {
            if (this.collidesWith(p)) {
                if (this.velocityX > 0) this.x = p.x - this.width;
                else if (this.velocityX < 0) this.x = p.x + p.width;
            }
        });

        // Collectibles
        coins.forEach(c => { if (c.active && this.collidesWith(c)) { c.active = false; this.coins++; document.getElementById('score').innerText = `Coins: ${this.coins}`; } });

        // Hazard Collisions
        [...enemies, ...spikes].forEach(h => {
            if (h.active && this.collidesWith(h)) {
                if (h instanceof Spikes && h.hidden) return;
                if (h instanceof Enemy && this.velocityY > 0 && this.y + this.height < h.y + h.height / 2) {
                    h.active = false;
                    this.velocityY = this.jumpForce / 2;
                } else if (this.isLarge) {
                    this.isLarge = false;
                    this.height = 50;
                    h.active = false;
                } else {
                    this.respawn();
                }
            }
        });

        if (this.collidesWith(goal)) {
            this.won = true;
            setTimeout(() => nextLevel(), 500);
        }

        if (this.y > canvas.height) this.respawn();
    }

    collidesWith(rect) { return this.x < rect.x + rect.width && this.x + this.width > rect.x && this.y < rect.y + rect.height && this.y + this.height > rect.y; }

    respawn() {
        this.lives--;
        document.getElementById('lives').innerText = `Lives: ${this.lives}`;
        this.resetPosition();
        resetCurrentLevel();
        if (this.lives <= 0) {
            alert("Game Over! Restarting Level 1.");
            currentLevelIndex = 0;
            this.lives = 3;
            document.getElementById('lives').innerText = `Lives: ${this.lives}`;
            loadLevel(currentLevelIndex);
        }
    }

    draw(camera) {
        if (!this.modelReady) {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x - camera.x, this.y, this.width, this.height);
            return;
        }
        this.model.rotation.y = this.rotation + Math.PI / 2;
        this.model.rotation.x = !this.onGround ? -0.3 : Math.sin(Date.now() * 0.01) * 0.1;

        threeRenderer.render(threeScene, threeCamera);
        const drawWidth = this.width * 2.2;
        const drawHeight = this.height * 2.0;
        ctx.drawImage(threeRenderer.domElement, this.x - camera.x - (drawWidth - this.width) / 2, this.y - (drawHeight - this.height), drawWidth, drawHeight);
    }
}

// --- Level Data & Management ---
const levels = [
    {
        name: "Level 1: The First Troll",
        platforms: [
            new Entity(0, 560, 800, 40, '#8B4513'), // Start ground
            new Entity(1000, 560, 2000, 40, '#8B4513'), // End ground
            new Entity(400, 450, 120, 40, '#8B4513'), // Safe jump
            Object.assign(new Entity(650, 450, 100, 40, '#8B4513'), { triggerOnStep: true }), // Troll: Falls on step
        ],
        goal: { x: 2800, y: 460, width: 40, height: 100, initialX: 2800 },
        coins: [new Coin(450, 410)],
        enemies: [new Enemy(1200, 530)],
        spikes: [],
        triggers: [
            {
                triggerX: 2600, activated: false, action: () => {
                    // Troll: Goal moves away!
                    const g = levels[currentLevelIndex].goal;
                    g.x += 400;
                    console.log("Goal moved! Troll!");
                }
            }
        ]
    },
    {
        name: "Level 2: Hidden Dangers",
        platforms: [
            new Entity(0, 560, 3000, 40, '#8B4513'),
            new Entity(400, 450, 120, 40, '#8B4513'),
            new Entity(700, 350, 120, 40, '#8B4513'),
        ],
        goal: { x: 2800, y: 460, width: 40, height: 100, initialX: 2800 },
        coins: [new Coin(450, 410), new Coin(750, 310)],
        enemies: [],
        spikes: [new Spikes(1000, 540, 100), new Spikes(1500, 540, 100)],
        triggers: [
            {
                triggerX: 900, activated: false, action: () => {
                    levels[1].spikes[0].hidden = false;
                }
            },
            {
                triggerX: 1400, activated: false, action: () => {
                    levels[1].spikes[1].hidden = false;
                }
            }
        ]
    }
];

let player = new Player();
const camera = new Camera();
let currentLevel = levels[currentLevelIndex];

function loadLevel(index) {
    currentLevelIndex = index;
    currentLevel = levels[index];
    player.won = false;
    player.resetPosition();
    // Reset triggers and entity states
    currentLevel.triggers.forEach(t => t.activated = false);
    currentLevel.platforms.forEach(p => { p.y = p.initialY; p.isFalling = false; p.velocityY = 0; });
    currentLevel.goal.x = currentLevel.goal.initialX;
    if (currentLevel.spikes) currentLevel.spikes.forEach(s => s.hidden = true);

    const overlay = document.getElementById('start-overlay');
    overlay.innerHTML = `<h1>${currentLevel.name}</h1><p>Level ${index + 1}</p><button id="start-btn">START LEVEL</button>`;
    overlay.classList.remove('hidden');
    document.getElementById('start-btn').onclick = () => overlay.classList.add('hidden');
}

function resetCurrentLevel() {
    currentLevel.triggers.forEach(t => t.activated = false);
    currentLevel.platforms.forEach(p => { p.y = p.initialY; p.isFalling = false; p.velocityY = 0; });
    currentLevel.goal.x = currentLevel.goal.initialX;
}

function nextLevel() {
    currentLevelIndex++;
    if (currentLevelIndex >= levels.length) {
        alert("COMPLETED ALL LEVELS! You are the master.");
        currentLevelIndex = 0;
    }
    loadLevel(currentLevelIndex);
}

const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

const clouds = [new Cloud(100, 100), new Cloud(400, 150), new Cloud(800, 80), new Cloud(1200, 120), new Cloud(1600, 100)];

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ADD8E6'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    clouds.forEach(c => c.draw(camera));

    player.velocityX = 0;
    if (keys['ArrowRight']) player.velocityX = player.speed;
    if (keys['ArrowLeft']) player.velocityX = -player.speed;
    if (keys['Space'] && player.onGround) player.velocityY = player.jumpForce;

    player.update(currentLevel.platforms, currentLevel.coins, currentLevel.enemies, [], currentLevel.goal, currentLevel.spikes, currentLevel.triggers);
    currentLevel.enemies.forEach(e => e.update(currentLevel.platforms));
    currentLevel.platforms.forEach(p => p.update());

    camera.follow(player);

    currentLevel.platforms.forEach(p => {
        ctx.fillStyle = '#8B4513'; ctx.fillRect(p.x - camera.x, p.y, p.width, p.height);
        ctx.fillStyle = '#228B22'; ctx.fillRect(p.x - camera.x, p.y, p.width, 10);
    });

    ctx.fillStyle = '#FF4500'; ctx.fillRect(currentLevel.goal.x - camera.x, currentLevel.goal.y, currentLevel.goal.width, currentLevel.goal.height);
    ctx.fillStyle = 'white'; ctx.fillRect(currentLevel.goal.x - camera.x + 15, currentLevel.goal.y, 5, currentLevel.goal.height);

    currentLevel.coins.forEach(c => c.draw(camera));
    currentLevel.enemies.forEach(e => e.draw(camera));
    currentLevel.spikes.forEach(s => s.draw(camera));
    player.draw(camera);

    requestAnimationFrame(gameLoop);
}

document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('start-overlay').classList.add('hidden');
    gameLoop();
});
