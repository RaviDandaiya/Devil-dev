import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const GRAVITY = 0.8;

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

class Camera {
    constructor() { this.x = 0; this.width = canvas.width; }
    follow(player) {
        const targetX = player.x - this.width / 3;
        this.x += (targetX - this.x) * 0.1;
        if (this.x < 0) this.x = 0;
    }
}

class Entity {
    constructor(x, y, width, height, color) { this.x = x; this.y = y; this.width = width; this.height = height; this.color = color; this.active = true; }
    draw(camera) { if (!this.active) return; ctx.fillStyle = this.color; ctx.fillRect(this.x - camera.x, this.y, this.width, this.height); }
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
        this.width = 60;
        this.height = 80;
        this.x = 100;
        this.y = 400;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpForce = -15;
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
                console.log("3D Plumber Loaded!");
            });
        });
    }

    update(platforms, coins, enemies, blocks, goal) {
        if (this.won) return;

        if (this.velocityX > 0) { this.facingRight = true; this.rotation = 0; }
        else if (this.velocityX < 0) { this.facingRight = false; this.rotation = Math.PI; }

        this.velocityY += GRAVITY; this.y += this.velocityY;
        this.onGround = false;
        [...platforms, ...blocks].forEach(p => {
            if (this.collidesWith(p)) {
                if (this.velocityY > 0) { this.y = p.y - this.height; this.velocityY = 0; this.onGround = true; }
                else if (this.velocityY < 0) {
                    this.y = p.y + p.height; this.velocityY = 0;
                    if (p instanceof MysteryBlock && !p.hit) { p.hit = true; this.coins += 5; this.isLarge = true; this.height = 120; document.getElementById('score').innerText = `Coins: ${this.coins}`; }
                }
            }
        });
        this.x += this.velocityX;
        [...platforms, ...blocks].forEach(p => {
            if (this.collidesWith(p)) {
                if (this.velocityX > 0) this.x = p.x - this.width;
                else if (this.velocityX < 0) this.x = p.x + p.width;
            }
        });
        coins.forEach(c => { if (c.active && this.collidesWith(c)) { c.active = false; this.coins++; document.getElementById('score').innerText = `Coins: ${this.coins}`; } });
        enemies.forEach(e => {
            if (e.active && this.collidesWith(e)) {
                if (this.velocityY > 0 && this.y + this.height < e.y + e.height / 2) { e.active = false; this.velocityY = this.jumpForce / 2; }
                else if (this.isLarge) { this.isLarge = false; this.height = 80; e.active = false; }
                else this.respawn();
            }
        });
        if (this.collidesWith(goal)) { this.won = true; alert("Victory!"); location.reload(); }
        if (this.y > canvas.height) this.respawn();
    }

    collidesWith(rect) { return this.x < rect.x + rect.width && this.x + this.width > rect.x && this.y < rect.y + rect.height && this.y + this.height > rect.y; }
    respawn() { this.lives--; document.getElementById('lives').innerText = `Lives: ${this.lives}`; this.x = 100; this.y = 400; this.velocityY = 0; if (this.lives <= 0) { alert("Game Over!"); location.reload(); } }

    draw(camera) {
        if (!this.modelReady) {
            // Placeholder while loading
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x - camera.x, this.y, this.width, this.height);
            return;
        }

        // Update 3D Model State
        this.model.rotation.y = this.rotation + Math.PI / 2;
        if (!this.onGround) {
            this.model.rotation.x = -0.3; // Lean back when jumping
        } else {
            this.model.rotation.x = Math.sin(Date.now() * 0.01) * 0.1; // Gentle sway
        }

        // Render 3D Model to threeRenderer
        threeRenderer.render(threeScene, threeCamera);

        // Draw the 3D render onto the 2D canvas
        ctx.drawImage(threeRenderer.domElement, this.x - camera.x - this.width / 2, this.y - this.height / 4, this.width * 2, this.height * 1.5);
    }
}

const player = new Player();
const camera = new Camera();
const goal = { x: 2800, y: 460, width: 40, height: 100 };
const platforms = [
    { x: 0, y: 560, width: 3000, height: 40 },
    { x: 400, y: 450, width: 120, height: 40 }, { x: 600, y: 350, width: 200, height: 40 },
    { x: 900, y: 400, width: 150, height: 40 }, { x: 1200, y: 300, width: 300, height: 40 },
    { x: 1600, y: 450, width: 100, height: 40 }, { x: 2500, y: 450, width: 200, height: 40 }
];
const blocks = [new MysteryBlock(500, 300), new MysteryBlock(1300, 200), new MysteryBlock(2000, 350)];
const coins = [new Coin(450, 410), new Coin(650, 310), new Coin(1000, 360), new Coin(2200, 200)];
const enemies = [new Enemy(700, 530), new Enemy(1300, 530), new Enemy(1800, 530), new Enemy(2600, 530)];
const clouds = [new Cloud(100, 100), new Cloud(400, 150), new Cloud(800, 80), new Cloud(1200, 120), new Cloud(1600, 100)];

const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ADD8E6'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    clouds.forEach(c => c.draw(camera));
    player.velocityX = 0;
    if (keys['ArrowRight']) player.velocityX = player.speed;
    if (keys['ArrowLeft']) player.velocityX = -player.speed;
    if (keys['Space'] && player.onGround) player.velocityY = player.jumpForce;
    player.update(platforms, coins, enemies, blocks, goal);
    enemies.forEach(e => e.update(platforms));
    camera.follow(player);
    platforms.forEach(p => { ctx.fillStyle = '#8B4513'; ctx.fillRect(p.x - camera.x, p.y, p.width, p.height); ctx.fillStyle = '#228B22'; ctx.fillRect(p.x - camera.x, p.y, p.width, 10); });
    blocks.forEach(b => b.draw(camera));
    ctx.fillStyle = '#FF4500'; ctx.fillRect(goal.x - camera.x, goal.y, goal.width, goal.height);
    ctx.fillStyle = 'white'; ctx.fillRect(goal.x - camera.x + 15, goal.y, 5, goal.height);
    coins.forEach(c => c.draw(camera));
    enemies.forEach(e => e.draw(camera));
    player.draw(camera);
    requestAnimationFrame(gameLoop);
}
document.getElementById('start-btn').addEventListener('click', () => { document.getElementById('start-overlay').classList.add('hidden'); gameLoop(); });
