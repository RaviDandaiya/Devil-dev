import './style.css';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const GRAVITY = 0.8;
let currentLevelIndex = 0;
let gameStarted = false;

// --- Malice Engine ---
const maliceState = {
    deaths: [], // {x, y, level}
    jumpsAtX: {}, // Count jumps at specific X ranges
    stillTime: 0,
    repetitionCount: 0,
    startTime: Date.now(),
    uiDecay: 0 // 0 to 1
};

// --- Theme Logic ---
let activeTheme = 'classic';
function setTheme(theme) {
    activeTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
    });
}
window.setTheme = setTheme; // Make accessible for buttons

// Set initial theme choice listener
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('theme-btn')) {
        setTheme(e.target.getAttribute('data-theme'));
    }
});

class Camera {
    constructor() { this.x = 0; this.width = canvas.width; }
    follow(player) {
        const targetX = player.x - this.width / 3;
        this.x += (targetX - this.x) * 0.1;
        if (this.x < 0) this.x = 0;
    }
}

class Entity {
    constructor(x, y, width, height, color = '#1A100E') {
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
        const color = getComputedStyle(document.documentElement).getPropertyValue('--platform-color').trim() || '#B83018';
        ctx.fillStyle = color;
        ctx.fillRect(this.x - camera.x, this.y, this.width, this.height);
    }
}

class Spikes extends Entity {
    constructor(x, y, width = 40) {
        super(x, y, width, 20, '#1A100E');
        this.hidden = true;
    }
    draw(camera) {
        if (this.hidden || !this.active) return;
        ctx.fillStyle = '#1A100E';
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
    constructor(x, y) { super(x, y, 40, 40, '#1A100E'); this.hit = false; }
    draw(camera) {
        ctx.fillStyle = this.hit ? '#3A1F13' : this.color;
        ctx.fillRect(this.x - camera.x, this.y, this.width, this.height);
        // Remove stroke for silhouette look
        if (!this.hit) { ctx.fillStyle = '#C17D5C'; ctx.font = '20px Arial'; ctx.fillText('?', this.x - camera.x + 15, this.y + 25); }
    }
}

class Coin extends Entity {
    constructor(x, y) { super(x, y, 20, 20, '#1A100E'); }
    draw(camera) {
        if (!this.active) return;
        ctx.beginPath(); ctx.arc(this.x - camera.x + 10, this.y + 10, 10, 0, Math.PI * 2);
        ctx.fillStyle = this.color; ctx.fill();
        // Silhouette: Fill only, no gold stroke
    }
}

class Enemy extends Entity {
    constructor(x, y) { super(x, y, 35, 30, '#1A100E'); this.speed = -2; }
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
        ctx.fillStyle = '#1A100E'; ctx.beginPath();
        // Faint silhouette clouds
        ctx.arc(this.x - camera.x * 0.5 + 20, this.y, 25, 0, Math.PI * 2);
        ctx.arc(this.x - camera.x * 0.5 + 50, this.y - 10, 30, 0, Math.PI * 2);
        ctx.arc(this.x - camera.x * 0.5 + 80, this.y, 25, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Player {
    constructor() {
        this.width = 30;
        this.height = 45;
        this.resetPosition();
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpForce = -18;
        this.onGround = false;
        this.coins = 0;
        this.lives = 3;
        this.won = false;
        this.facingRight = true;
        this.rotation = 0;
        this.jumpCooldown = 0;
    }

    resetPosition() {
        this.x = 100;
        this.y = 400;
        this.velocityX = 0;
        this.velocityY = 0;
    }

    // No 3D model loading

    update(platforms, coins, enemies, blocks, goal, spikes, triggers) {
        if (this.won) return;

        // Malice: Track Stillness
        if (Math.abs(this.velocityX) < 0.1 && this.onGround && !this.won) {
            maliceState.stillTime++;
            if (maliceState.stillTime > 180) { // 3 seconds
                if (maliceState.stillTime % 30 === 0) {
                    canvas.style.transform = `translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 10}px)`;
                }
                if (maliceState.stillTime > 300) { // 5 seconds
                    this.velocityY = 15; // Ground "eats" you
                    maliceState.stillTime = 0;
                    console.log("%cMalice: Don't just stand there.", "color: red; font-weight: bold;");
                }
            }
        } else {
            maliceState.stillTime = 0;
            canvas.style.transform = "";
        }

        // Apply Gravity
        this.velocityY += GRAVITY;
        this.y += this.velocityY;
        this.onGround = false;

        // Malice: Track Jumping Habits
        if (keys['Space'] && this.onGround && this.jumpCooldown <= 0) {
            const gridX = Math.floor(this.x / 100) * 100;
            maliceState.jumpsAtX[gridX] = (maliceState.jumpsAtX[gridX] || 0) + 1;
            this.jumpCooldown = 30; // 30 frames

            // If you jump at the same spot too often, it becomes a trap
            if (maliceState.jumpsAtX[gridX] > 5 && Math.random() > 0.5) {
                this.velocityY = 10; // Forced fall!
                console.log("Malice: Jumping habit punished.");
            }
        }
        if (this.jumpCooldown > 0) this.jumpCooldown--;

        // Check Trigger Activations
        triggers.forEach(t => {
            if (!t.activated && this.x > t.triggerX) {
                // Adaptive Malice: Traps might trigger earlier if you've died nearby
                const nearbyDeath = maliceState.deaths.find(d => d.level === currentLevelIndex && Math.abs(d.x - t.triggerX) < 200);
                if (nearbyDeath || this.x > t.triggerX) {
                    t.activated = true;
                    t.action();
                }
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

                // Adaptive Malice: Some enemies become faster if you've killed them many times
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

        // Malice: Ghost Spikes (Previous Death Locations)
        maliceState.deaths.forEach(d => {
            if (d.level === currentLevelIndex && this.collidesWith({ x: d.x, y: d.y, width: 30, height: 30 })) {
                this.respawn();
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
        // Record Death for Malice
        maliceState.deaths.push({ x: this.x, y: this.y, level: currentLevelIndex });
        maliceState.uiDecay = Math.min(1, maliceState.uiDecay + 0.1);

        this.lives--;
        document.getElementById('lives').innerText = `Lives: ${this.lives}`;
        this.resetPosition();
        resetCurrentLevel();

        if (this.lives <= 0) {
            alert("THE GAME REMEMBERS YOUR FAILURES. RESTARTING...");
            currentLevelIndex = 0;
            this.lives = 3;
            maliceState.uiDecay = 0;
            document.getElementById('lives').innerText = `${this.lives} HEARTS`;
            loadLevel(currentLevelIndex);
        }
    }

    draw(camera) {
        ctx.fillStyle = "#000000"; // Solid Black Silhouette
        const drawX = this.x - camera.x;
        const drawY = this.y;

        // Blocky Body
        ctx.fillRect(drawX + 5, drawY + 10, 20, 25);
        // Head
        ctx.fillRect(drawX + 8, drawY, 14, 12);
        // Legs (simplified animation)
        const walk = Math.sin(Date.now() * 0.015) * 5;
        ctx.fillRect(drawX + 5, drawY + 35, 8, 10 + (this.velocityX !== 0 ? walk : 0));
        ctx.fillRect(drawX + 17, drawY + 35, 8, 10 - (this.velocityX !== 0 ? walk : 0));
    }
}

// --- Level Data & Management ---
const levels = [
    {
        name: "Devil Dev - Level 1",
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

    // Adaptive Malice: Shift platforms slightly to break muscle memory
    currentLevel.platforms.forEach(p => {
        if (p.width < 500) { // Only shift small/medium platforms
            const shiftX = (Math.random() - 0.5) * maliceState.uiDecay * 50;
            const shiftY = (Math.random() - 0.5) * maliceState.uiDecay * 20;
            p.x = p.initialX + shiftX;
            p.y = p.initialY + shiftY;
        }
    });

    const overlay = document.getElementById('start-overlay');
    document.getElementById('level-indicator').innerText = `LEVEL ${index + 1}`;
    overlay.innerHTML = `<h1>LEVEL ${index + 1}</h1><p>LEVEL DEVIL</p><button id="start-btn">BEGIN</button>`;
    overlay.classList.remove('hidden');
    document.getElementById('start-btn').onclick = () => {
        overlay.classList.add('hidden');
        player.won = false; // Ensure player isn't in won state
        if (!gameStarted) {
            gameStarted = true;
            gameLoop();
        }
    };
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
    const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = bgColor; ctx.fillRect(0, 0, canvas.width, canvas.height);

    clouds.forEach(c => {
        ctx.globalAlpha = 0.1;
        c.draw(camera);
        ctx.globalAlpha = 1.0;
    });

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

    // UI Decay / Psych Warfare
    const scoreEl = document.getElementById('game-ui');
    if (maliceState.uiDecay > 0.3) {
        const jitter = (Math.random() - 0.5) * maliceState.uiDecay * 10;
        scoreEl.style.transform = `translate(${jitter}px, ${jitter}px)`;
        scoreEl.style.opacity = 1 - (Math.random() * maliceState.uiDecay * 0.5);
        if (Math.random() > 0.98) {
            document.getElementById('level-indicator').innerText = "QUIT NOW";
            document.getElementById('stats').style.display = 'none';
        } else {
            document.getElementById('level-indicator').innerText = `LEVEL ${currentLevelIndex + 1}`;
            document.getElementById('stats').style.display = 'flex';
            document.getElementById('score').innerText = player.coins;
            document.getElementById('lives').innerText = `${player.lives} HEARTS`;
        }
    }

    // Draw Ghost Spikes (Faint indicators of where you died)
    ctx.fillStyle = `rgba(255, 0, 0, ${0.1 * maliceState.uiDecay})`;
    maliceState.deaths.forEach(d => {
        if (d.level === currentLevelIndex) {
            ctx.fillRect(d.x - camera.x, d.y, 30, 30);
            ctx.fillText("💀", d.x - camera.x + 5, d.y + 20);
        }
    });

    requestAnimationFrame(gameLoop);
}

// Initial Load
loadLevel(0);
