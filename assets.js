// assets.js
// Player 5 (The Art Curator) - Global Game Data Configurations

const GAME_ASSETS = {
    // Dictionary of available training nodes
    trainingNodes: {
        "node_shadow_box": {
            id: "node_shadow_box",
            name: "Shadow Boxing",
            cost: 10,
            yield: 1.5,
            statType: "Strength"
        },
        "node_weight_lift": {
            id: "node_weight_lift",
            name: "Weight Lifting",
            cost: 50,
            yield: 5.0,
            statType: "Strength"
        },
        "node_meditation": {
            id: "node_meditation",
            name: "Waterfall Meditation",
            cost: 100,
            yield: 10.0,
            statType: "Cursed Energy"
        },
        "node_emotion_control": {
            id: "node_emotion_control",
            name: "Emotion Control (Movie Marathon)",
            cost: 250,
            yield: 25.0,
            statType: "Cursed Energy"
        },
        "node_agility_drills": {
            id: "node_agility_drills",
            name: "Cursed Corpse Dodging",
            cost: 150,
            yield: 12.5,
            statType: "Agility"
        }
    },

    // Array of available enemies
    enemies: [
        {
            id: "enemy_fly_head",
            name: "Fly Head",
            grade: "Grade 4",
            maxHp: 100,
            rawPower: 15
        },
        {
            id: "enemy_low_curse",
            name: "Graveyard Curse",
            grade: "Grade 3",
            maxHp: 450,
            rawPower: 45
        },
        {
            id: "enemy_finger_bearer",
            name: "Finger Bearer",
            grade: "Special Grade",
            maxHp: 15000,
            rawPower: 850
        },
        {
            id: "enemy_hanami",
            name: "Hanami",
            grade: "Disaster Curse",
            maxHp: 45000,
            rawPower: 2200
        },
        {
            id: "enemy_mahitotrue",
            name: "Mahito (ISBODK)",
            grade: "Disaster Curse",
            maxHp: 120000,
            rawPower: 6500
        }
    ]
};

// Bind the global data configurations to the window object
window.gameAssetsCache = GAME_ASSETS;