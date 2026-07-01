// missions.js
// Пълната база данни с мисии за JJK Incremental RPG

const missionsData = [
    // --- ARC 1: FEARSOME WOMB ---
    {
        id: "bounty_1",
        type: "mini",
        arc: "Fearsome Womb",
        name: "Exorcise Fly Heads",
        description: "Clear out low-level curses at Sugisawa High.",
        requiredGrade: 4,
        requiredStats: { cursedEnergy: 50 },
        rewards: { exp: 100, currency: 50 },
        duration: 5000 // 5 секунди таймер
    },
    {
        id: "story_1",
        type: "main",
        arc: "Fearsome Womb",
        name: "Eishu Detention Center",
        description: "A Cursed Womb has appeared. Rescue the inmates.",
        requiredGrade: 4,
        requiredStats: { strength: 100, cursedEnergy: 500 },
        rewards: { exp: 1000, rankUp: 3, item: "Sukuna's Finger" },
        triggerBoss: "FingerBearer"
    },

    // --- ARC 2: KYOTO GOODWILL EVENT ---
    {
        id: "bounty_2",
        type: "mini",
        arc: "Kyoto Goodwill",
        name: "Spar with Panda",
        description: "Train your close-quarters combat with a cursed corpse.",
        requiredGrade: 3,
        requiredStats: { strength: 500 },
        rewards: { exp: 500, currency: 200, statBoost: "strength" },
        duration: 10000
    },
    {
        id: "story_2",
        type: "main",
        arc: "Kyoto Goodwill",
        name: "Survive Hanami",
        description: "A Special Grade has invaded the event. Protect the students.",
        requiredGrade: 3,
        requiredStats: { agility: 800, cursedEnergy: 2000 },
        rewards: { exp: 3000, rankUp: 2, unlock: "Black Flash" },
        triggerBoss: "Hanami"
    },

    // --- ARC 3: DEATH PAINTING (Origin of Obedience) ---
    {
        id: "story_3",
        type: "main",
        arc: "Death Painting",
        name: "Yasohachi Bridge",
        description: "Defeat Eso and Kechizu. High endurance needed to survive Rot Technique.",
        requiredGrade: 2,
        requiredStats: { endurance: 3000, cursedEnergy: 5000 },
        rewards: { exp: 8000, item: "Poison Resistance" },
        triggerBoss: "EsoAndKechizu"
    },

    // --- ARC 4: HIDDEN INVENTORY (Flashback Event) ---
    {
        id: "story_4",
        type: "main",
        arc: "Hidden Inventory",
        name: "The Sorcerer Killer",
        description: "Survive the ambush by Toji Fushiguro. Warning: Physical stats must be extremely high.",
        requiredGrade: 1,
        requiredStats: { strength: 8000, agility: 7500 },
        rewards: { exp: 25000, item: "Inverted Spear of Heaven", unlock: "Reversed Cursed Technique" },
        triggerBoss: "TojiFushiguro"
    },

    // --- ARC 5: SHIBUYA INCIDENT (Mid-Game) ---
    {
        id: "story_5_1",
        type: "main",
        arc: "Shibuya Incident",
        name: "Disaster Tides",
        description: "Defeat Dagon. Domain Expansion required to counter his guaranteed hit.",
        requiredGrade: 1,
        requiredStats: { domainUnlocked: true, cursedEnergy: 20000 },
        rewards: { exp: 50000, currency: 10000 },
        triggerBoss: "Dagon"
    },
    {
        id: "story_5_2",
        type: "main",
        arc: "Shibuya Incident",
        name: "Idle Transfiguration",
        description: "Defeat Mahito's True Form. Soul damage is essential.",
        requiredGrade: 1,
        requiredStats: { strength: 15000, soulDamageUnlocked: true },
        rewards: { exp: 100000, rankUp: "Special Grade 1" },
        triggerBoss: "MahitoTrueForm"
    },

    // --- ARC 6: CULLING GAME ---
    {
        id: "cg_tokyo_1",
        type: "main",
        arc: "Culling Game",
        name: "Tokyo No. 1 Colony: The Deadly Lawyer",
        description: "Face Hiromi Higuruma. His Domain confiscates Cursed Techniques.",
        requiredGrade: "Special Grade 1",
        requiredStats: { strength: 25000, agility: 20000 },
        rewards: { cullingPoints: 100, exp: 150000, unlock: "Domain Amplification" },
        triggerBoss: "HiromiHiguruma",
        specialRule: "disableCursedTechniques"
    },
    {
        id: "cg_sendai",
        type: "main",
        arc: "Culling Game",
        name: "Sendai Colony: Three-Way Deadlock",
        description: "Survive against Uro, Ryu, and Kuro. High AoE damage required.",
        requiredGrade: "Special Grade 1",
        requiredStats: { cursedEnergy: 50000, endurance: 30000 },
        rewards: { cullingPoints: 200, exp: 250000, item: "Ryu's Cursed Energy Trait" },
        triggerBoss: "SendaiTrio"
    },
    {
        id: "cg_tokyo_2",
        type: "main",
        arc: "Culling Game",
        name: "Tokyo No. 2 Colony: God of Lightning",
        description: "Defeat Hajime Kashimo. Massive health regeneration needed.",
        requiredGrade: "Special Grade 1",
        requiredStats: { health: 100000, rctLevel: 5 },
        rewards: { cullingPoints: 200, exp: 300000 },
        triggerBoss: "HajimeKashimo"
    },

    // --- ARC 7: PERFECT PREPARATION ---
    {
        id: "prep_unseal_gojo",
        type: "milestone",
        arc: "Perfect Preparation",
        name: "Unseal the Strongest",
        description: "Gather Culling Points and locate Angel to open the Prison Realm.",
        requiredGrade: "Special Grade 1",
        cost: { cullingPoints: 1000 },
        rewards: { globalMultiplier: 5.0, unlock: "Shinjuku Showdown" }
    },

    // --- ARC 8: SHINJUKU SHOWDOWN (BOSS RUSH) ---
    {
        id: "shinjuku_phase_1",
        type: "main",
        arc: "Shinjuku Showdown",
        name: "The Strongest vs The Strongest",
        description: "Clash of Domains. You must have a fully upgraded Domain Expansion.",
        requiredGrade: "Special Grade",
        requiredStats: { domainLevel: "Max", allStats: 100000 },
        rewards: { exp: 1000000 },
        triggerBoss: "Sukuna_MegumiForm"
    },
    {
        id: "shinjuku_phase_2",
        type: "main",
        arc: "Shinjuku Showdown",
        name: "Authentic Mutual Love",
        description: "Fight Sukuna's True Form. Dodge the World Cutting Slash.",
        requiredGrade: "Special Grade",
        requiredStats: { agility: 150000, endurance: 200000 },
        rewards: { exp: 2000000 },
        triggerBoss: "Sukuna_TrueForm"
    },
    {
        id: "shinjuku_phase_3",
        type: "main",
        arc: "Shinjuku Showdown",
        name: "Soul Strikes",
        description: "The Final Stand. Lower his max HP permanently.",
        requiredGrade: "Special Grade",
        requiredStats: { strength: 300000, soulDamageUnlocked: true },
        rewards: { exp: 5000000, title: "The Strongest Sorcerer" },
        triggerBoss: "Sukuna_FinalStand"
    },

    // --- ARC 9: EPILOGUE ---
    {
        id: "epilogue_prestige",
        type: "milestone",
        arc: "Epilogue",
        name: "A New Generation (Prestige)",
        description: "Reset your progress to Grade 4, but gain a permanent Heavenly Restriction multiplier.",
        requiredGrade: "Special Grade",
        cost: { allProgress: true },
        rewards: { prestigeToken: 1, permanentMultiplier: 2.0 },
        specialRule: "triggerRebirth"
    }
];

export { missionsData };