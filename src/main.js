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

// --- Username Generation System ---
const ADJECTIVES = [
    'Swift', 'Blaze', 'Shadow', 'Thunder', 'Mystic', 'Infernal', 'Dark', 'Wild',
    'Fierce', 'Crimson', 'Divine', 'Eternal', 'Phantom', 'Savage', 'Ancient',
    'Demon', 'Devil', 'Hellish', 'Devi', 'Cursed', 'Blazing', 'Wicked',
    'Storm', 'Chaos', 'Void', 'Neon', 'Toxic', 'Rogue', 'Epic', 'Deadly'
];

const NOUNS = [
    'Dragon', 'Runner', 'Escaper', 'Slayer', 'Hunter', 'Warrior', 'Knight', 'Rider',
    'Demon', 'Devil', 'Beast', 'Phoenix', 'Wolf', 'Reaper', 'Ninja', 'Devi',
    'Samurai', 'Champion', 'Legend', 'Hero', 'Master', 'Soul', 'Spirit',
    'Avenger', 'Crusher', 'Striker', 'Ranger', 'Viper', 'Titan', 'Fury'
];

function generateRandomUsername() {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const number = Math.floor(Math.random() * 100);
    return `${adjective}${noun}${number}`;
}

function getOrCreateUsername() {
    const STORAGE_KEY = 'devil_dev_username';
    let username = localStorage.getItem(STORAGE_KEY);

    if (!username) {
        username = generateRandomUsername();
        localStorage.setItem(STORAGE_KEY, username);
    }

    return username;
}

// Initialize and display username
const username = getOrCreateUsername();
const usernameDisplay = document.getElementById('username-display');
if (usernameDisplay) {
    usernameDisplay.textContent = username;
}


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

// --- Sound System ---
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let soundEnabled = true;

const sounds = {
    playJump() {
        if (!soundEnabled) return;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = 400;
        osc.type = 'square';
        gain.gain.setValueAtTime(0.1, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        osc.start();
        osc.stop(audioContext.currentTime + 0.1);
    },

    playDeath() {
        if (!soundEnabled) return;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(300, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5);
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.2, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        osc.start();
        osc.stop(audioContext.currentTime + 0.5);
    },

    playCoin() {
        if (!soundEnabled) return;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(800, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.15, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        osc.start();
        osc.stop(audioContext.currentTime + 0.15);
    },

    playWin() {
        if (!soundEnabled) return;
        [0, 0.15, 0.3].forEach((delay, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = [523, 659, 784][i];
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.1, audioContext.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + 0.2);
            osc.start(audioContext.currentTime + delay);
            osc.stop(audioContext.currentTime + delay + 0.2);
        });
    },

    playMalice() {
        if (!soundEnabled) return;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(150, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.15, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        osc.start();
        osc.stop(audioContext.currentTime + 0.3);
    }
};

// Mute button
const muteBtn = document.getElementById('mute-btn');
if (muteBtn) {
    muteBtn.onclick = () => {
        soundEnabled = !soundEnabled;
        muteBtn.textContent = soundEnabled ? '🔊 SOUND ON' : '🔇 SOUND OFF';
    };
}

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
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#FF0000"; // Red danger glow

        ctx.fillStyle = '#1A100E'; // Dark Base
        for (let i = 0; i < this.width / 10; i++) {
            // Spike Base
            ctx.beginPath();
            ctx.moveTo(this.x - camera.x + i * 10, this.y + this.height);
            ctx.lineTo(this.x - camera.x + i * 10 + 5, this.y);
            ctx.lineTo(this.x - camera.x + i * 10 + 10, this.y + this.height);
            ctx.fill();

            // Highlight Tip (Red)
            ctx.beginPath();
            ctx.moveTo(this.x - camera.x + i * 10 + 5, this.y);
            ctx.lineTo(this.x - camera.x + i * 10 + 5, this.y + 8);
            ctx.strokeStyle = "#FF0000";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.restore();
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
    constructor(x, y) { super(x, y, 20, 20, '#FFD700'); } // Gold Color
    draw(camera) {
        if (!this.active) return;
        const cx = this.x - camera.x + 10;
        const cy = this.y + 10;

        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#FFD700"; // Gold Glow

        // Outer Gold Ring with Gradient
        const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 10);
        grad.addColorStop(0, "#FFFFE0"); // Light yellow center
        grad.addColorStop(1, "#DAA520"); // Gold edge

        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = "#FFFF00"; // Bright Yellow border
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner Sparkle
        ctx.beginPath();
        ctx.arc(cx - 3, cy - 3, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fill();

        ctx.restore();
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

// Sky Falling Mechanics
class FallingCeiling {
    constructor(startY = -100, fallSpeed = 0.3) {
        this.y = startY;
        this.fallSpeed = fallSpeed;
        this.initialY = startY;
        this.active = false;
    }

    update() {
        if (this.active) {
            this.y += this.fallSpeed;
        }
    }

    draw() {
        if (!this.active) return;
        // Draw ominous ceiling
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(0, this.y, canvas.width, 60);
        // Draw spikes on bottom
        ctx.fillStyle = '#1A100E';
        for (let i = 0; i < canvas.width / 20; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 20, this.y + 60);
            ctx.lineTo(i * 20 + 10, this.y + 40);
            ctx.lineTo(i * 20 + 20, this.y + 60);
            ctx.fill();
        }
    }

    checkCollision(player) {
        return this.active && player.y < this.y + 60;
    }

    reset() {
        this.y = this.initialY;
        this.active = false;
    }
}

class FallingDebris extends Entity {
    constructor(x, startY = -50) {
        super(x, startY, 30, 30, '#8B0000');
        this.fallSpeed = 2 + Math.random() * 3;
        this.rotation = Math.random() * Math.PI * 2;
    }

    update() {
        if (!this.active) return;
        this.y += this.fallSpeed;
        this.rotation += 0.1;
        if (this.y > canvas.height + 50) this.active = false;
    }

    draw(camera) {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x - camera.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }
}


class Player {
    constructor() {
        this.width = 24;  // Smaller character
        this.height = 36; // Smaller character
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
            sounds.playJump(); // Play jump sound

            // If you jump at the same spot too often, it becomes a trap
            if (maliceState.jumpsAtX[gridX] > 5 && Math.random() > 0.5) {
                this.velocityY = 10; // Forced fall!
                sounds.playMalice(); // Play malice sound
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
                    sounds.playMalice(); // Play malice sound when trap activates
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
        coins.forEach(c => {
            if (c.active && this.collidesWith(c)) {
                c.active = false;
                this.coins++;
                sounds.playCoin(); // Play coin sound
                document.getElementById('score').innerText = `Coins: ${this.coins}`;
            }
        });

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
                    sounds.playDeath(); // Play death sound
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
            sounds.playWin(); // Play win sound
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
            sounds.playDeath(); // Play death sound
            showGameOver();
        }
    }

    draw(camera) {
        // GLOW EFFECT for visibility
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#FF4500"; // Lava Glow

        ctx.fillStyle = "#FF4500"; // Lava Red Character
        const drawX = this.x - camera.x;
        const drawY = this.y;

        // Blocky Body
        ctx.fillRect(drawX + 5, drawY + 10, 20, 25);
        // Head
        ctx.fillRect(drawX + 8, drawY, 14, 12);

        // White eyes (Sharp contrast)
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowBlur = 0; // No blur for eyes
        ctx.fillRect(drawX + (this.facingRight ? 15 : 9), drawY + 4, 3, 3);

        // Legs 
        ctx.fillStyle = "#FF6347"; // Lighter orange for legs
        const walk = Math.sin(Date.now() * 0.015) * 5;
        ctx.fillRect(drawX + 5, drawY + 35, 8, 10 + (this.velocityX !== 0 ? walk : 0));
        ctx.fillRect(drawX + 17, drawY + 35, 8, 10 - (this.velocityX !== 0 ? walk : 0));

        ctx.restore();
    }
}

// --- Level Data & Management ---
const levels = [
    // LEVELS 1-5: Tutorial/Easy
    {
        name: "Level 1: First Steps",
        platforms: [
            new Entity(0, 560, 800, 40),
            new Entity(900, 500, 150, 20),
            new Entity(1150, 560, 1000, 40),
        ],
        goal: { x: 2000, y: 490, width: 40, height: 70, initialX: 2000 },
        coins: [new Coin(950, 460)],
        enemies: [],
        spikes: [],
        triggers: [],
        fallingCeiling: null,
        debris: []
    },
    {
        name: "Level 2: Small Jumps",
        platforms: [
            new Entity(0, 560, 400, 40),
            new Entity(500, 490, 120, 20),
            new Entity(700, 420, 120, 20),
            new Entity(900, 490, 120, 20),
            new Entity(1100, 560, 1200, 40),
        ],
        goal: { x: 2100, y: 490, width: 40, height: 70, initialX: 2100 },
        coins: [new Coin(550, 450), new Coin(750, 380)],
        enemies: [],
        spikes: [],
        triggers: [],
        fallingCeiling: null,
        debris: []
    },
    {
        name: "Level 3: First Enemy",
        platforms: [
            new Entity(0, 560, 600, 40),
            new Entity(700, 480, 150, 20),
            new Entity(950, 420, 150, 20),
            new Entity(1200, 560, 1300, 40),
        ],
        goal: { x: 2300, y: 490, width: 40, height: 70, initialX: 2300 },
        coins: [new Coin(750, 440), new Coin(1000, 380)],
        enemies: [new Enemy(1400, 530)],
        spikes: [],
        triggers: [],
        fallingCeiling: null,
        debris: []
    },
    {
        name: "Level 4: Hidden Danger",
        platforms: [
            new Entity(0, 560, 500, 40),
            new Entity(600, 480, 100, 20),
            new Entity(800, 400, 100, 20),
            new Entity(1000, 560, 1400, 40),
        ],
        goal: { x: 2200, y: 490, width: 40, height: 70, initialX: 2200 },
        coins: [new Coin(650, 440), new Coin(850, 360)],
        enemies: [new Enemy(1300, 530)],
        spikes: [new Spikes(1500, 540, 100)],
        triggers: [{
            triggerX: 1200, activated: false, action: () => {
                levels[3].spikes[0].hidden = false;
                sounds.playMalice();
            }
        }],
        fallingCeiling: null,
        debris: []
    },
    {
        name: "Level 5: The Gap",
        platforms: [
            new Entity(0, 560, 400, 40),
            new Entity(600, 460, 120, 20),
            new Entity(900, 460, 120, 20),
            new Entity(1200, 560, 1200, 40),
        ],
        goal: { x: 2200, y: 490, width: 40, height: 70, initialX: 2200 },
        coins: [new Coin(650, 420), new Coin(950, 420), new Coin(1400, 520)],
        enemies: [new Enemy(1500, 530), new Enemy(1900, 530)],
        spikes: [],
        triggers: [],
        fallingCeiling: null,
        debris: []
    },

    // LEVELS 6-10: Easy-Medium
    {
        name: "Level 6: Rising Challenge",
        platforms: [
            new Entity(0, 560, 350, 40),
            new Entity(450, 480, 100, 20),
            new Entity(650, 400, 100, 20),
            new Entity(850, 480, 100, 20),
            new Entity(1050, 560, 1300, 40),
        ],
        goal: { x: 2200, y: 490, width: 40, height: 70, initialX: 2200 },
        coins: [new Coin(500, 440), new Coin(700, 360)],
        enemies: [new Enemy(1200, 530), new Enemy(1600, 530)],
        spikes: [new Spikes(1400, 540, 80)],
        triggers: [],
        fallingCeiling: null,
        debris: []
    },
    {
        name: "Level 7: Double Trouble",
        platforms: [
            new Entity(0, 560, 400, 40),
            new Entity(500, 490, 100, 20),
            new Entity(700, 420, 100, 20),
            new Entity(900, 350, 100, 20),
            new Entity(1100, 420, 100, 20),
            new Entity(1300, 560, 1100, 40),
        ],
        goal: { x: 2200, y: 490, width: 40, height: 70, initialX: 2200 },
        coins: [new Coin(550, 450), new Coin(750, 380), new Coin(950, 310)],
        enemies: [new Enemy(1450, 530), new Enemy(1750, 530)],
        spikes: [new Spikes(1550, 540, 80), new Spikes(1850, 540, 80)],
        triggers: [],
        fallingCeiling: null,
        debris: []
    },
    {
        name: "Level 8: Spike Maze",
        platforms: [
            new Entity(0, 560, 500, 40),
            new Entity(650, 480, 120, 20),
            new Entity(900, 480, 120, 20),
            new Entity(1150, 560, 1250, 40),
        ],
        goal: { x: 2200, y: 490, width: 40, height: 70, initialX: 2200 },
        coins: [new Coin(700, 440), new Coin(950, 440)],
        enemies: [new Enemy(1400, 530)],
        spikes: [new Spikes(1300, 540, 60), new Spikes(1500, 540, 100), new Spikes(1700, 540, 80)],
        triggers: [],
        fallingCeiling: null,
        debris: []
    },
    {
        name: "Level 9: Zigzag Path",
        platforms: [
            new Entity(0, 560, 350, 40),
            new Entity(450, 480, 100, 20),
            new Entity(650, 400, 100, 20),
            new Entity(850, 320, 100, 20),
            new Entity(1050, 400, 100, 20),
            new Entity(1250, 480, 100, 20),
            new Entity(1450, 560, 1000, 40),
        ],
        goal: { x: 2250, y: 490, width: 40, height: 70, initialX: 2250 },
        coins: [new Coin(500, 440), new Coin(700, 360), new Coin(900, 280), new Coin(1100, 360)],
        enemies: [new Enemy(1600, 530), new Enemy(1900, 530)],
        spikes: [],
        triggers: [],
        fallingCeiling: null,
        debris: []
    },
    {
        name: "Level 10: Precision Jumps",
        platforms: [
            new Entity(0, 560, 400, 40),
            new Entity(520, 460, 80, 20),
            new Entity(720, 360, 80, 20),
            new Entity(920, 460, 80, 20),
            new Entity(1120, 560, 1300, 40),
        ],
        goal: { x: 2250, y: 490, width: 40, height: 70, initialX: 2250 },
        coins: [new Coin(560, 420), new Coin(760, 320), new Coin(960, 420)],
        enemies: [new Enemy(1300, 530), new Enemy(1700, 530), new Enemy(2000, 530)],
        spikes: [new Spikes(1500, 540, 100)],
        triggers: [],
        fallingCeiling: null,
        debris: []
    },

    // LEVELS 11-15: Medium
    {
        name: "Level 11: Narrow Escape",
        platforms: [
            new Entity(0, 560, 350, 40),
            new Entity(470, 470, 80, 20),
            new Entity(650, 380, 80, 20),
            new Entity(830, 290, 80, 20),
            new Entity(1010, 380, 80, 20),
            new Entity(1190, 470, 80, 20),
            new Entity(1370, 560, 1080, 40),
        ],
        goal: { x: 2250, y: 490, width: 40, height: 70, initialX: 2250 },
        coins: [new Coin(510, 430), new Coin(690, 340), new Coin(870, 250)],
        enemies: [new Enemy(1500, 530), new Enemy(1750, 530), new Enemy(2000, 530)],
        spikes: [new Spikes(1600, 540, 80), new Spikes(1850, 540, 80)],
        triggers: [],
        fallingCeiling: null,
        debris: []
    },
    {
        name: "Level 12: Gauntlet Run",
        platforms: [
            new Entity(0, 560, 400, 40),
            new Entity(550, 480, 100, 20),
            new Entity(750, 400, 100, 20),
            new Entity(950, 480, 100, 20),
            new Entity(1200, 560, 1250, 40),
        ],
        goal: { x: 2300, y: 490, width: 40, height: 70, initialX: 2300 },
        coins: [new Coin(600, 440), new Coin(800, 360), new Coin(1000, 440)],
        enemies: [new Enemy(1350, 530), new Enemy(1500, 530), new Enemy(1650, 530), new Enemy(1800, 530)],
        spikes: [new Spikes(1450, 540, 60), new Spikes(1750, 540, 60)],
        triggers: [],
        fallingCeiling: null,
        debris: []
    },
    {
        name: "Level 13: The Chasm",
        platforms: [
            new Entity(0, 560, 300, 40),
            new Entity(500, 440, 100, 20),
            new Entity(800, 440, 100, 20),
            new Entity(1100, 440, 100, 20),
            new Entity(1400, 560, 1050, 40),
        ],
        goal: { x: 2250, y: 490, width: 40, height: 70, initialX: 2250 },
        coins: [new Coin(550, 400), new Coin(850, 400), new Coin(1150, 400)],
        enemies: [new Enemy(1600, 530), new Enemy(1900, 530)],
        spikes: [new Spikes(1500, 540, 100), new Spikes(1750, 540, 100)],
        triggers: [],
        fallingCeiling: null,
        debris: []
    },
    {
        name: "Level 14: Tower Climb",
        platforms: [
            new Entity(0, 560, 350, 40),
            new Entity(450, 490, 100, 20),
            new Entity(650, 420, 100, 20),
            new Entity(850, 350, 100, 20),
            new Entity(1050, 280, 100, 20),
            new Entity(1250, 350, 100, 20),
            new Entity(1450, 420, 100, 20),
            new Entity(1650, 560, 800, 40),
        ],
        goal: { x: 2300, y: 490, width: 40, height: 70, initialX: 2300 },
        coins: [new Coin(500, 450), new Coin(700, 380), new Coin(900, 310), new Coin(1100, 240)],
        enemies: [new Enemy(1800, 530), new Enemy(2050, 530)],
        spikes: [new Spikes(1900, 540, 100)],
        triggers: [],
        fallingCeiling: null,
        debris: []
    },
    {
        name: "Level 15: Malice Awakens",
        platforms: [
            new Entity(0, 560, 400, 40),
            new Entity(550, 470, 120, 20),
            new Entity(800, 390, 120, 20),
            new Entity(1050, 470, 120, 20),
            new Entity(1300, 560, 1150, 40),
        ],
        goal: { x: 2300, y: 490, width: 40, height: 70, initialX: 2300 },
        coins: [new Coin(600, 430), new Coin(850, 350), new Coin(1100, 430)],
        enemies: [new Enemy(1450, 530), new Enemy(1750, 530), new Enemy(2050, 530)],
        spikes: [new Spikes(1550, 540, 100), new Spikes(1850, 540, 100)],
        triggers: [{
            triggerX: 1200, activated: false, action: () => {
                levels[14].spikes.forEach(s => s.hidden = false);
                sounds.playMalice();
            }
        }],
        fallingCeiling: null,
        debris: []
    },

    // LEVELS 16-20: Medium-Hard
    {
        name: "Level 16: Speed Trial",
        platforms: [
            new Entity(0, 560, 300, 40),
            new Entity(450, 460, 80, 20),
            new Entity(630, 360, 80, 20),
            new Entity(810, 260, 80, 20),
            new Entity(990, 360, 80, 20),
            new Entity(1170, 460, 80, 20),
            new Entity(1350, 560, 1100, 40),
        ],
        goal: { x: 2300, y: 490, width: 40, height: 70, initialX: 2300 },
        coins: [new Coin(490, 420), new Coin(670, 320), new Coin(850, 220), new Coin(1030, 320)],
        enemies: [new Enemy(1500, 530), new Enemy(1700, 530), new Enemy(1900, 530), new Enemy(2100, 530)],
        spikes: [new Spikes(1600, 540, 80), new Spikes(1800, 540, 80), new Spikes(2000, 540, 80)],
        triggers: [],
        fallingCeiling: null,
        debris: []
    },
    {
        name: "Level 17: Deadly Passage",
        platforms: [
            new Entity(0, 560, 350, 40),
            new Entity(500, 480, 100, 20),
            new Entity(700, 400, 100, 20),
            new Entity(900, 320, 100, 20),
            new Entity(1100, 400, 100, 20),
            new Entity(1300, 480, 100, 20),
            new Entity(1500, 560, 950, 40),
        ],
        goal: { x: 2300, y: 490, width: 40, height: 70, initialX: 2300 },
        coins: [new Coin(550, 440), new Coin(750, 360), new Coin(950, 280)],
        enemies: [new Enemy(1650, 530), new Enemy(1850, 530), new Enemy(2050, 530)],
        spikes: [new Spikes(1600, 540, 60), new Spikes(1750, 540, 80), new Spikes(1950, 540, 100)],
        triggers: [],
        fallingCeiling: null,
        debris: []
    },
    {
        name: "Level 18: No Mercy",
        platforms: [
            new Entity(0, 560, 300, 40),
            new Entity(450, 450, 90, 20),
            new Entity(640, 350, 90, 20),
            new Entity(830, 450, 90, 20),
            new Entity(1020, 350, 90, 20),
            new Entity(1210, 450, 90, 20),
            new Entity(1400, 560, 1050, 40),
        ],
        goal: { x: 2300, y: 490, width: 40, height: 70, initialX: 2300 },
        coins: [new Coin(490, 410), new Coin(680, 310), new Coin(870, 410)],
        enemies: [new Enemy(1550, 530), new Enemy(1700, 530), new Enemy(1850, 530), new Enemy(2000, 530), new Enemy(2150, 530)],
        spikes: [new Spikes(1650, 540, 80), new Spikes(1800, 540, 80), new Spikes(1950, 540, 80)],
        triggers: [],
        fallingCeiling: null,
        debris: []
    },
    {
        name: "Level 19: Precision Hell",
        platforms: [
            new Entity(0, 560, 280, 40),
            new Entity(420, 440, 70, 20),
            new Entity(590, 330, 70, 20),
            new Entity(760, 220, 70, 20),
            new Entity(930, 330, 70, 20),
            new Entity(1100, 440, 70, 20),
            new Entity(1270, 560, 1180, 40),
        ],
        goal: { x: 2300, y: 490, width: 40, height: 70, initialX: 2300 },
        coins: [new Coin(455, 400), new Coin(625, 290), new Coin(795, 180)],
        enemies: [new Enemy(1400, 530), new Enemy(1600, 530), new Enemy(1800, 530), new Enemy(2000, 530)],
        spikes: [new Spikes(1500, 540, 80), new Spikes(1700, 540, 80), new Spikes(1900, 540, 80), new Spikes(2100, 540, 80)],
        triggers: [{
            triggerX: 1150, activated: false, action: () => {
                levels[18].spikes.forEach(s => s.hidden = false);
                sounds.playMalice();
            }
        }],
        fallingCeiling: null,
        debris: []
    },
    {
        name: "Level 20: Midpoint Crisis",
        platforms: [
            new Entity(0, 560, 350, 40),
            new Entity(500, 470, 100, 20),
            new Entity(700, 380, 100, 20),
            new Entity(900, 290, 100, 20),
            new Entity(1100, 380, 100, 20),
            new Entity(1300, 470, 100, 20),
            new Entity(1500, 560, 950, 40),
        ],
        goal: { x: 2300, y: 490, width: 40, height: 70, initialX: 2300 },
        coins: [new Coin(550, 430), new Coin(750, 340), new Coin(950, 250), new Coin(1150, 340)],
        enemies: [new Enemy(1650, 530), new Enemy(1800, 530), new Enemy(1950, 530), new Enemy(2100, 530)],
        spikes: [new Spikes(1600, 540, 70), new Spikes(1750, 540, 90), new Spikes(1900, 540, 70), new Spikes(2050, 540, 90)],
        triggers: [],
        fallingCeiling: null,
        debris: []
    },

    // LEVELS 21-25: Hard
    {
        name: "Level 21: Expert Territory",
        platforms: [
            new Entity(0, 560, 300, 40),
            new Entity(450, 450, 80, 20),
            new Entity(630, 340, 80, 20),
            new Entity(810, 230, 80, 20),
            new Entity(990, 340, 80, 20),
            new Entity(1170, 450, 80, 20),
            new Entity(1350, 560, 1100, 40),
        ],
        goal: { x: 2300, y: 490, width: 40, height: 70, initialX: 2300 },
        coins: [new Coin(490, 410), new Coin(670, 300), new Coin(850, 190)],
        enemies: [new Enemy(1500, 530), new Enemy(1650, 530), new Enemy(1800, 530), new Enemy(1950, 530), new Enemy(2100, 530)],
        spikes: [new Spikes(1550, 540, 70), new Spikes(1700, 540, 70), new Spikes(1850, 540, 70), new Spikes(2000, 540, 70), new Spikes(2150, 540, 70)],
        triggers: [],
        fallingCeiling: null,
        debris: []
    },
    {
        name: "Level 22: No Mistakes",
        platforms: [
            new Entity(0, 560, 280, 40),
            new Entity(430, 430, 70, 20),
            new Entity(600, 310, 70, 20),
            new Entity(770, 430, 70, 20),
            new Entity(940, 310, 70, 20),
            new Entity(1110, 430, 70, 20),
            new Entity(1280, 560, 1170, 40),
        ],
        goal: { x: 2300, y: 490, width: 40, height: 70, initialX: 2300 },
        coins: [new Coin(465, 390), new Coin(635, 270), new Coin(805, 390)],
        enemies: [new Enemy(1450, 530), new Enemy(1600, 530), new Enemy(1750, 530), new Enemy(1900, 530), new Enemy(2050, 530), new Enemy(2200, 530)],
        spikes: [new Spikes(1500, 540, 60), new Spikes(1650, 540, 80), new Spikes(1800, 540, 60), new Spikes(1950, 540, 80), new Spikes(2100, 540, 60)],
        triggers: [{
            triggerX: 1150, activated: false, action: () => {
                levels[21].spikes.forEach(s => s.hidden = false);
                sounds.playMalice();
            }
        }],
        fallingCeiling: null,
        debris: []
    },
    {
        name: "Level 23: Tightrope Walk",
        platforms: [
            new Entity(0, 560, 250, 40),
            new Entity(400, 420, 60, 20),
            new Entity(560, 300, 60, 20),
            new Entity(720, 420, 60, 20),
            new Entity(880, 300, 60, 20),
            new Entity(1040, 420, 60, 20),
            new Entity(1200, 560, 1250, 40),
        ],
        goal: { x: 2300, y: 490, width: 40, height: 70, initialX: 2300 },
        coins: [new Coin(430, 380), new Coin(590, 260), new Coin(750, 380)],
        enemies: [new Enemy(1400, 530), new Enemy(1550, 530), new Enemy(1700, 530), new Enemy(1850, 530), new Enemy(2000, 530), new Enemy(2150, 530)],
        spikes: [new Spikes(1450, 540, 70), new Spikes(1600, 540, 70), new Spikes(1750, 540, 70), new Spikes(1900, 540, 70), new Spikes(2050, 540, 70)],
        triggers: [],
        fallingCeiling: null,
        debris: []
    },
    {
        name: "Level 24: Devil's Playground",
        platforms: [
            new Entity(0, 560, 300, 40),
            new Entity(450, 440, 75, 20),
            new Entity(625, 330, 75, 20),
            new Entity(800, 220, 75, 20),
            new Entity(975, 330, 75, 20),
            new Entity(1150, 440, 75, 20),
            new Entity(1325, 560, 1125, 40),
        ],
        goal: { x: 2300, y: 490, width: 40, height: 70, initialX: 2300 },
        coins: [new Coin(485, 400), new Coin(660, 290), new Coin(835, 180)],
        enemies: [new Enemy(1475, 530), new Enemy(1625, 530), new Enemy(1775, 530), new Enemy(1925, 530), new Enemy(2075, 530)],
        spikes: [new Spikes(1425, 540, 60), new Spikes(1550, 540, 80), new Spikes(1700, 540, 60), new Spikes(1850, 540, 80), new Spikes(2000, 540, 60), new Spikes(2150, 540, 80)],
        triggers: [{
            triggerX: 1200, activated: false, action: () => {
                levels[23].spikes.forEach(s => s.hidden = false);
                sounds.playMalice();
            }
        }],
        fallingCeiling: null,
        debris: []
    },
    {
        name: "Level 25: Near the End",
        platforms: [
            new Entity(0, 560, 280, 40),
            new Entity(430, 430, 70, 20),
            new Entity(600, 310, 70, 20),
            new Entity(770, 200, 70, 20),
            new Entity(940, 310, 70, 20),
            new Entity(1110, 430, 70, 20),
            new Entity(1280, 560, 1170, 40),
        ],
        goal: { x: 2300, y: 490, width: 40, height: 70, initialX: 2300 },
        coins: [new Coin(465, 390), new Coin(635, 270), new Coin(805, 160)],
        enemies: [new Enemy(1425, 530), new Enemy(1550, 530), new Enemy(1675, 530), new Enemy(1800, 530), new Enemy(1925, 530), new Enemy(2050, 530), new Enemy(2175, 530)],
        spikes: [new Spikes(1480, 540, 70), new Spikes(1620, 540, 70), new Spikes(1740, 540, 70), new Spikes(1870, 540, 70), new Spikes(1990, 540, 70), new Spikes(2120, 540, 70)],
        triggers: [],
        fallingCeiling: null,
        debris: []
    },

    // LEVELS 26-30: Expert - Sky Falling Escape Rooms
    {
        name: "Level 26: Sky Falls - Escape Begins",
        platforms: [
            new Entity(0, 560, 350, 40),
            new Entity(500, 460, 100, 20),
            new Entity(700, 360, 100, 20),
            new Entity(900, 460, 100, 20),
            new Entity(1100, 360, 100, 20),
            new Entity(1300, 460, 100, 20),
            new Entity(1500, 560, 950, 40),
        ],
        goal: { x: 2300, y: 490, width: 40, height: 70, initialX: 2300 },
        coins: [new Coin(550, 420), new Coin(750, 320), new Coin(950, 420)],
        enemies: [new Enemy(1650, 530), new Enemy(1900, 530), new Enemy(2150, 530)],
        spikes: [new Spikes(1750, 540, 80), new Spikes(2000, 540, 80)],
        triggers: [{
            triggerX: 100, activated: false, action: () => {
                levels[25].fallingCeiling.active = true;
                sounds.playMalice();
            }
        }],
        fallingCeiling: new FallingCeiling(-100, 0.3),
        debris: [new FallingDebris(200), new FallingDebris(500), new FallingDebris(800), new FallingDebris(1100)]
    },
    {
        name: "Level 27: Falling Faster",
        platforms: [
            new Entity(0, 560, 300, 40),
            new Entity(450, 440, 90, 20),
            new Entity(640, 330, 90, 20),
            new Entity(830, 440, 90, 20),
            new Entity(1020, 330, 90, 20),
            new Entity(1210, 440, 90, 20),
            new Entity(1400, 560, 1050, 40),
        ],
        goal: { x: 2300, y: 490, width: 40, height: 70, initialX: 2300 },
        coins: [new Coin(490, 400), new Coin(680, 290), new Coin(870, 400)],
        enemies: [new Enemy(1550, 530), new Enemy(1750, 530), new Enemy(1950, 530), new Enemy(2150, 530)],
        spikes: [new Spikes(1650, 540, 80), new Spikes(1850, 540, 80), new Spikes(2050, 540, 80)],
        triggers: [{
            triggerX: 100, activated: false, action: () => {
                levels[26].fallingCeiling.active = true;
                sounds.playMalice();
            }
        }],
        fallingCeiling: new FallingCeiling(-100, 0.4),
        debris: [new FallingDebris(300), new FallingDebris(550), new FallingDebris(800), new FallingDebris(1050), new FallingDebris(1300)]
    },
    {
        name: "Level 28: Debris Storm",
        platforms: [
            new Entity(0, 560, 280, 40),
            new Entity(430, 420, 80, 20),
            new Entity(610, 300, 80, 20),
            new Entity(790, 420, 80, 20),
            new Entity(970, 300, 80, 20),
            new Entity(1150, 420, 80, 20),
            new Entity(1330, 560, 1120, 40),
        ],
        goal: { x: 2300, y: 490, width: 40, height: 70, initialX: 2300 },
        coins: [new Coin(470, 380), new Coin(650, 260), new Coin(830, 380)],
        enemies: [new Enemy(1500, 530), new Enemy(1650, 530), new Enemy(1800, 530), new Enemy(1950, 530), new Enemy(2100, 530)],
        spikes: [new Spikes(1550, 540, 70), new Spikes(1700, 540, 70), new Spikes(1850, 540, 70), new Spikes(2000, 540, 70)],
        triggers: [{
            triggerX: 100, activated: false, action: () => {
                levels[27].fallingCeiling.active = true;
                levels[27].debris.forEach(d => d.active = true);
                sounds.playMalice();
            }
        }],
        fallingCeiling: new FallingCeiling(-100, 0.5),
        debris: [new FallingDebris(250), new FallingDebris(450), new FallingDebris(650), new FallingDebris(850), new FallingDebris(1050), new FallingDebris(1250)]
    },
    {
        name: "Level 29: Devil's Escape Room",
        platforms: [
            new Entity(0, 560, 250, 40),
            new Entity(400, 400, 70, 20),
            new Entity(570, 260, 70, 20),
            new Entity(740, 400, 70, 20),
            new Entity(910, 260, 70, 20),
            new Entity(1080, 400, 70, 20),
            new Entity(1250, 560, 1200, 40),
        ],
        goal: { x: 2300, y: 490, width: 40, height: 70, initialX: 2300 },
        coins: [new Coin(435, 360), new Coin(605, 220), new Coin(775, 360)],
        enemies: [new Enemy(1400, 530), new Enemy(1550, 530), new Enemy(1700, 530), new Enemy(1850, 530), new Enemy(2000, 530), new Enemy(2150, 530)],
        spikes: [new Spikes(1475, 540, 70), new Spikes(1625, 540, 70), new Spikes(1775, 540, 70), new Spikes(1925, 540, 70), new Spikes(2075, 540, 70)],
        triggers: [{
            triggerX: 100, activated: false, action: () => {
                levels[28].fallingCeiling.active = true;
                levels[28].debris.forEach(d => d.active = true);
                sounds.playMalice();
            }
        }],
        fallingCeiling: new FallingCeiling(-100, 0.6),
        debris: [new FallingDebris(200), new FallingDebris(400), new FallingDebris(600), new FallingDebris(800), new FallingDebris(1000), new FallingDebris(1200), new FallingDebris(1400)]
    },
    {
        name: "Level 30: FINAL ESCAPE",
        platforms: [
            new Entity(0, 560, 300, 40),
            new Entity(450, 430, 75, 20),
            new Entity(625, 310, 75, 20),
            new Entity(800, 200, 75, 20),
            new Entity(975, 310, 75, 20),
            new Entity(1150, 430, 75, 20),
            new Entity(1325, 560, 1125, 40),
        ],
        goal: { x: 2300, y: 490, width: 40, height: 70, initialX: 2300 },
        coins: [new Coin(485, 390), new Coin(660, 270), new Coin(835, 160)],
        enemies: [new Enemy(1475, 530), new Enemy(1600, 530), new Enemy(1725, 530), new Enemy(1850, 530), new Enemy(1975, 530), new Enemy(2100, 530), new Enemy(2225, 530)],
        spikes: [new Spikes(1425, 540, 60), new Spikes(1550, 540, 70), new Spikes(1675, 540, 60), new Spikes(1800, 540, 70), new Spikes(1925, 540, 60), new Spikes(2050, 540, 70), new Spikes(2175, 540, 60)],
        triggers: [{
            triggerX: 100, activated: false, action: () => {
                levels[29].fallingCeiling.active = true;
                levels[29].debris.forEach(d => d.active = true);
                sounds.playMalice();
            }
        }],
        fallingCeiling: new FallingCeiling(-100, 0.7),
        debris: [new FallingDebris(150), new FallingDebris(350), new FallingDebris(550), new FallingDebris(750), new FallingDebris(950), new FallingDebris(1150), new FallingDebris(1350), new FallingDebris(1550)]
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
    if (currentLevel.fallingCeiling) currentLevel.fallingCeiling.reset();
    if (currentLevel.debris) currentLevel.debris.forEach(d => d.active = false);

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

    // Update text without wiping theme selector buttons
    const title = overlay.querySelector('h1');
    const subtitle = overlay.querySelector('p');
    if (title) title.innerText = `LEVEL ${index + 1}`;
    if (subtitle) subtitle.innerText = "LEVEL DEVIL";

    overlay.classList.remove('hidden');

    const startBtn = document.getElementById('start-btn');
    if (startBtn) startBtn.onclick = () => {
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

// Game Over Dialog
function showGameOver() {
    const gameoverOverlay = document.getElementById('gameover-overlay');
    const gameoverMessage = document.getElementById('gameover-message');

    gameoverMessage.textContent = `THE GAME REMEMBERS YOUR ${maliceState.deaths.length} FAILURES`;
    gameoverOverlay.classList.remove('hidden');

    // Pause game
    gameStarted = false;
}

function restartGame() {
    const gameoverOverlay = document.getElementById('gameover-overlay');
    gameoverOverlay.classList.add('hidden');

    // Keep current level - don't reset to 0
    player.lives = 3;
    player.coins = 0;
    maliceState.uiDecay = 0;
    maliceState.deaths = [];

    // Update UI
    document.getElementById('lives').innerText = `${player.lives} HEARTS`;
    document.getElementById('score').innerText = player.coins;

    // Reload current level (not level 0!)
    loadLevel(currentLevelIndex);
    gameStarted = true;
}

// Restart button
const restartBtn = document.getElementById('restart-btn');
if (restartBtn) {
    restartBtn.onclick = () => restartGame();
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

    // Sky Falling Mechanics
    if (currentLevel.fallingCeiling && currentLevel.fallingCeiling.active) {
        currentLevel.fallingCeiling.update();
        currentLevel.fallingCeiling.draw();
        if (currentLevel.fallingCeiling.checkCollision(player)) player.respawn();
    }

    // Falling Debris
    if (currentLevel.debris) {
        currentLevel.debris.forEach(d => {
            d.update();
            d.draw(camera);
        });
    }

    // Pass debris as extra hazards for collision consistency
    const combinedHazards = [...(currentLevel.spikes || []), ...(currentLevel.debris || [])];

    player.update(currentLevel.platforms, currentLevel.coins, currentLevel.enemies, [], currentLevel.goal, combinedHazards, currentLevel.triggers);
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

// Procedural Extension for Progressive Difficulty
function expandLevels() {
    levels.forEach((level, index) => {
        if (index > 4) { // Start extending from Level 6
            // More segments for higher levels (Level 30 = ~13 segments)
            const segmentCount = Math.floor((index - 4) / 2) + 1;

            if (level.platforms.length > 0) {
                const lastPlat = level.platforms[level.platforms.length - 1];
                let currentX = lastPlat.x + lastPlat.width + 120;

                // Define Segment Types for Variety
                const SEGMENT_TYPES = ['BRIDGE', 'STONES', 'TOWER', 'GAP'];

                for (let i = 0; i < segmentCount; i++) {
                    // Randomize View: Verticality changes per segment (Reduced Range)
                    const baseHeight = 400 + (Math.random() * 80 - 40); // Was 100-50, too jagged

                    // Pick random segment type (Randomized Pattern)
                    const type = SEGMENT_TYPES[Math.floor(Math.random() * SEGMENT_TYPES.length)];

                    if (type === 'BRIDGE') {
                        // Long flat run with spikes (High Risk)
                        const width = 300 + Math.random() * 200;
                        level.platforms.push(new Entity(currentX, baseHeight, width, 20, '#8B0000'));
                        // Add spike patch in middle
                        if (Math.random() > 0.3) {
                            if (!level.spikes) level.spikes = [];
                            level.spikes.push(new Spikes(currentX + 100, baseHeight - 20, 60));
                        }
                        currentX += width + 100 + (Math.min(index * 1.5, 60)); // Reduced gap from 80->60
                    }
                    else if (type === 'STONES') {
                        // Series of small blocks (Precision)
                        const count = 3 + Math.floor(Math.random() * 3);
                        for (let j = 0; j < count; j++) {
                            // Reduced vertical delta
                            level.platforms.push(new Entity(currentX, baseHeight + (Math.random() * 30 - 15), 70, 20, '#555'));
                            currentX += 70 + 120; // 120 Gap is safe
                        }
                    }
                    else if (type === 'TOWER') {
                        // High block
                        level.platforms.push(new Entity(currentX, baseHeight - 50, 80, 20, '#444')); // -60 was too high
                        currentX += 80 + 100;
                    }
                    else if (type === 'GAP') {
                        // Long gap challenge
                        level.platforms.push(new Entity(currentX, baseHeight, 100, 20, '#660000'));
                        // MAJOR NERF: Cap gap at 150px (was 180 + index*3 -> 240+)
                        // Max safe jump is ~220. 150 is challenging but fair.
                        const gapSize = 130 + (Math.min(index * 2, 40));
                        currentX += 100 + gapSize;
                    }

                    // Occasional Enemy on platforms
                    if (Math.random() > 0.65) {
                        if (!level.enemies) level.enemies = [];
                        const plat = level.platforms[level.platforms.length - 1];
                        if (plat.width > 100) { // Only on big platforms
                            level.enemies.push(new Enemy(plat.x + 20, plat.y - 30));
                        }
                    }
                }

                // Final Landing Pad
                level.platforms.push(new Entity(currentX, 490, 200, 40));

                // Update goal to end of new extension
                level.goal.x = currentX + 100;
                level.goal.initialX = level.goal.x;
                level.goal.y = 420; // Goal reachable on pad
            }
        }
    });
}

// Initial Load
expandLevels(); // Apply procedural extension
loadLevel(0);

// Mobile Touch Controls Binding
const btnJump = document.getElementById('btn-jump');
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');

const bindTouch = (btn, keyCode) => {
    if (!btn) return;
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys[keyCode] = true;
    }, { passive: false });
    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys[keyCode] = false;
    }, { passive: false });
    btn.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        keys[keyCode] = false;
    }, { passive: false });
};

bindTouch(btnJump, 'Space');
bindTouch(btnLeft, 'ArrowLeft');
bindTouch(btnRight, 'ArrowRight');
