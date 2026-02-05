// This file contains the 30-level array for Devil-dev game
// Copy this to replace the levels array in main.js (around line 535-588)

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
