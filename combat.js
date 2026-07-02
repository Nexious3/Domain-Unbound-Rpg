// combat.js - Player 3 (The Tactician Engine) - Ultimate Production Edition

// Grade Multipliers dictate enemy power scaling and reward scaling
const GRADE_BALANCING = {
    "Fly Head":       { powerMod: 0.5, expReward: 10,   cashReward: 5,   dropChance: 0.10 },
    "Grade 4":        { powerMod: 1.0, expReward: 30,   cashReward: 20,  dropChance: 0.20 },
    "Grade 3":        { powerMod: 1.5, expReward: 100, cashReward: 50,  dropChance: 0.35 },
    "Grade 2":        { powerMod: 2.5, expReward: 350, cashReward: 150, dropChance: 0.50 },
    "Grade 1":        { powerMod: 4.0, expReward: 1200, cashReward: 500, dropChance: 0.75 },
    "Special Grade":  { powerMod: 6.5, expReward: 5000, cashReward: 2000, dropChance: 1.00 }
};

// Rare loot rewards passed back to the global state inventory upon victory
const LOOT_TABLE = [
    { name: "Low-Grade Cursed Charm", type: "trinket", value: 50 },
    { name: "Grade 2 Slaughter Demon", type: "weapon", value: 300 },
    { name: "Cursed Energy Elixir", type: "consumable", value: 100 },
    { name: "Special Grade Tool: Playful Cloud", type: "weapon", value: 2500 }
];

export class CombatEngine {
    /**
     * @param {Object} globalState - Directly passes Player 1's state object from state.js
     * @param {Object} enemyData - Generated enemy data from the game world
     */
    constructor(globalState, enemyData) {
        this.state = globalState; 
        
        // Structural safety fallbacks
        if (this.state.maxHp === undefined) this.state.maxHp = 100;
        if (this.state.attackPower === undefined) this.state.attackPower = 20;
        if (this.state.maxCursedEnergy === undefined) this.state.maxCursedEnergy = 100;
        if (this.state.exp === undefined) this.state.exp = 0;
        if (this.state.money === undefined) this.state.money = 0;
        if (this.state.inventory === undefined) this.state.inventory = [];

        // Tracking temporary combat pools
        this.playerCombatHP = globalState.maxHp;
        this.playerCombatCE = globalState.cursedEnergy || 50;

        this.enemy = {
            name: enemyData.name,
            grade: enemyData.grade,
            hp: enemyData.maxHp,
            maxHp: enemyData.maxHp,
            rawPower: enemyData.rawPower,
            statusEffects: [] // Dynamic array tracking enemy conditions
        };
        
        this.playerStatusEffects = []; // Array tracking player conditions
        this.isDomainActive = false;
        this.domainOwner = null;
        this.turnCounter = 1;
        this.blackFlashStreak = 0;
    }

    /**
     * Processes a single combat round with heavy RPG feature sets
     * @param {string} playerChoice - 'basic', 'technique', 'domain', 'heal', or 'flee'
     * @returns {Object} Full turn summary payload for UI engine integration
     */
    processTurn(playerChoice) {
        let playerDamage = 0;
        let logMessages = [];
        let hitResult = "HIT"; 
        
        const gradeConfig = GRADE_BALANCING[this.enemy.grade] || GRADE_BALANCING["Grade 4"];
        const prestigeMod = this.state.prestigeMultiplier || 1.0;
        const heavenlyRestrictionMultiplier = this.state.prestigeMultipliers?.heavenlyRestriction || prestigeMod;
        const techniqueRefinementMultiplier = this.state.prestigeMultipliers?.techniqueRefinement || prestigeMod;

        // --- 0. STATUS EFFECT TICK (START OF TURN) ---
        this.applyStatusTicks(logMessages);
        
        // If player is stunned by an effect, force skip their turn action phase
        if (this.hasStatus(this.playerStatusEffects, "Stunned")) {
            logMessages.push(`⚠️ You are STUNNED and cannot move this turn!`);
            playerChoice = "skipped";
        }

        // --- 1. PLAYER ACTION PHASE ---
        if (playerChoice === "basic") {
            this.playerCombatCE = Math.min(this.state.maxCursedEnergy, this.playerCombatCE + 15);
            playerDamage = this.state.attackPower * heavenlyRestrictionMultiplier;
            
            // Critical and Black Flash calculations
            if (Math.random() < 0.06) { // 6% Black Flash Chance
                this.blackFlashStreak++;
                hitResult = "BLACK_FLASH";
                playerDamage = Math.pow(playerDamage, 1.25) * 2.5; 
                this.playerCombatCE = Math.min(this.state.maxCursedEnergy, this.playerCombatCE + 35);
                
                logMessages.push(`⚡ BLACK FLASH! The environment warps under the pressure of your cursed strike!`);
                
                // 35% chance to inflict Stunned status onto the enemy due to the impact force
                this.inflictStatus(this.enemy.statusEffects, "Stunned", 1);
            } else {
                this.blackFlashStreak = 0;
                if (Math.random() < 0.12) {
                    hitResult = "CRITICAL";
                    playerDamage *= 1.5;
                    logMessages.push(`🎯 Critical Strike! You managed to slice straight into a vulnerability.`);
                } else {
                    logMessages.push(`${this.state.sorcererName || 'You'} connected a solid physical sequence.`);
                }
            }
        } 
        else if (playerChoice === "technique") {
            this.blackFlashStreak = 0;
            if (this.playerCombatCE >= 40) {
                this.playerCombatCE -= 40;
                playerDamage = this.state.attackPower * 3 * techniqueRefinementMultiplier; 
                playerDamage *= (0.9 + Math.random() * 0.2); // 90%-110% random damage variance

                logMessages.push(`${this.state.sorcererName || 'You'} cast an optimized Cursed Technique activation!`);
                
                // Tech effect: Inflict Poisoned status (cursed burn) onto the enemy for 2 turns
                if (Math.random() < 0.40) {
                    this.inflictStatus(this.enemy.statusEffects, "Poisoned", 2);
                    logMessages.push(`🧪 The curse was contaminated by residual energy! Inflicted Poisoned status.`);
                }
            } else {
                logMessages.push(`❌ Insufficient CE! Handled a weak, un-infused emergency strike.`);
                playerDamage = this.state.attackPower * 0.4;
            }
        }
        else if (playerChoice === "domain") {
            this.blackFlashStreak = 0;
            const domainCost = window.playerAbilitiesState?.domainCeCost || 100;
            const isBrainFried = window.playerAbilitiesState?.brainFryTurns > 0;

            if (isBrainFried) {
                logMessages.push(`❌ Domain Expansion failed! Your neural pathways are fried.`);
            } else if (this.playerCombatCE >= domainCost && !this.isDomainActive) {
                this.playerCombatCE -= domainCost;
                this.isDomainActive = true;
                this.domainOwner = "player";
                hitResult = "DOMAIN_EXPANSION";
                
                logMessages.push(`🌌 "DOMAIN EXPANSION!" An absolute barrier isolates the encounter layer!`);
                this.inflictStatus(this.enemy.statusEffects, "Enraged", 3); // Curses get desperate inside domains
                
                if (typeof window.triggerDomainVisuals === "function") {
                    window.triggerDomainVisuals("Domain Unbound");
                }
            } else {
                logMessages.push(`⚠️ Domain configuration parameters rejected or already active.`);
            }
        }
        else if (playerChoice === "heal") {
            this.blackFlashStreak = 0;
            if (this.playerCombatCE >= 25) {
                this.playerCombatCE -= 25;
                const healAmount = Math.floor(this.state.maxHp * 0.35); // Heals 35% Max HP
                this.playerCombatHP = Math.min(this.state.maxHp, this.playerCombatHP + healAmount);
                logMessages.push(`🧪 Reverse Cursed Technique! Regulated positive energy restored +${healAmount} HP.`);
            } else {
                logMessages.push(`❌ Not enough Cursed Energy to process organic cellular conversion! Action wasted.`);
            }
        }
        else if (playerChoice === "flee") {
            // Escape calculation check
            const escapeChance = this.enemy.grade === "Special Grade" ? 0.20 : 0.65;
            if (Math.random() < escapeChance) {
                logMessages.push(`🏃‍♂️ Tactical retreat successful! You broke engagement containment loops.`);
                return this.compileSummary(logMessages, "FLED", "FLEE");
            } else {
                logMessages.push(`⚠️ Escape failed! The ${this.enemy.name} cut off your exit routing vector.`);
            }
        }

        // Apply global modifier conditions
        if (this.domainOwner === "player") playerDamage *= 1.5; 
        if (this.hasStatus(this.playerStatusEffects, "Enraged")) playerDamage *= 1.25;

        // Enemy Evasion Logic
        const enemyDodgeChance = this.enemy.grade === "Special Grade" ? 0.15 : (this.enemy.grade === "Grade 1" ? 0.07 : 0.02);
        if (Math.random() < enemyDodgeChance && !["domain", "heal", "flee"].includes(playerChoice) && this.domainOwner !== "player") {
            playerDamage = 0;
            hitResult = "MISS";
            logMessages.push(`💨 Target tracked your output vector and fully evaded the engagement!`);
        }

        // Finalize damage deployment to target
        this.enemy.hp = Math.max(0, this.enemy.hp - Math.floor(playerDamage));

        // Evaluate Victory Matrix Condition
        if (this.enemy.hp <= 0) {
            this.state.exp += gradeConfig.expReward;
            this.state.money += gradeConfig.cashReward;
            
            // Execute automated loot matrix allocation 
            let dropItem = null;
            if (Math.random() < gradeConfig.dropChance) {
                const randomIdx = Math.floor(Math.random() * LOOT_TABLE.length);
                dropItem = LOOT_TABLE[randomIdx];
                this.state.inventory.push(dropItem);
            }

            if (typeof this.state.checkForLevelUp === "function") this.state.checkForLevelUp();

            logMessages.push(`💀 Exorcism Complete! Earned ${gradeConfig.expReward} EXP and ¥${gradeConfig.cashReward}.`);
            if (dropItem) {
                logMessages.push(`🎁 [LOOT DROP] Obtained item asset: **${dropItem.name}**!`);
            }
            
            this.cleanupCombatContext();
            return this.compileSummary(logMessages, "VICTORY", hitResult);
        }

        // --- 2. ENEMY ACTION PHASE ---
        if (!this.hasStatus(this.enemy.statusEffects, "Stunned")) {
            let enemyDamage = this.enemy.rawPower * gradeConfig.powerMod;
            if (this.domainOwner === "player") enemyDamage *= 0.65; 
            if (this.hasStatus(this.enemy.statusEffects, "Enraged")) enemyDamage *= 1.30;

            if (typeof window.processInfinityDefense === "function") {
                enemyDamage = window.processInfinityDefense(this, enemyDamage);
            }

            this.playerCombatHP = Math.max(0, this.playerCombatHP - Math.floor(enemyDamage));
            
            if (enemyDamage > 0) {
                logMessages.push(`💥 ${this.enemy.name} lunges forward, inflicting ${Math.floor(enemyDamage)} damage to you.`);
                
                // Curses have a 15% chance to infect the player with a toxic curse poison
                if (Math.random() < 0.15) {
                    this.inflictStatus(this.playerStatusEffects, "Poisoned", 2);
                    logMessages.push(`🤢 Warning: Cursed corruption is leaking into your system! You are Poisoned.`);
                }
            } else {
                logMessages.push(`🛡️ Damage completely absorbed or deflected by defensive values.`);
            }
        } else {
            logMessages.push(`💤 The enemy is completely immobilized and skipped their offensive sequence!`);
        }

        // Evaluate Defeat Matrix Condition
        if (this.playerCombatHP <= 0) {
            logMessages.push(`❌ Your vital energy signature hit absolute zero. Defeat recorded.`);
            this.cleanupCombatContext();
            return this.compileSummary(logMessages, "DEFEAT", hitResult);
        }

        // --- 3. END-OF-TURN TICK RECOVERY ---
        this.decrementStatusDurations();
        if (typeof window.tickAbilitiesCooldowns === "function") window.tickAbilitiesCooldowns();

        this.turnCounter++;
        return this.compileSummary(logMessages, "CONTINUE", hitResult);
    }

    // --- HELPER SUB-ENGINES FOR STATUS MANAGEMENT ---
    inflictStatus(targetArray, statusName, duration) {
        const existing = targetArray.find(e => e.name === statusName);
        if (existing) {
            existing.duration = Math.max(existing.duration, duration); // Refresh duration
        } else {
            targetArray.push({ name: statusName, duration: duration });
        }
    }

    hasStatus(targetArray, statusName) {
        return targetArray.some(e => e.name === statusName && e.duration > 0);
    }

    applyStatusTicks(logMessages) {
        // Player Poison damage tick (5% max health per turn)
        if (this.hasStatus(this.playerStatusEffects, "Poisoned")) {
            const poisonDmg = Math.floor(this.state.maxHp * 0.05);
            this.playerCombatHP = Math.max(1, this.playerCombatHP - poisonDmg); // Poison won't directly kill, drops to 1
            logMessages.push(`🤢 Cursed Poison burns your blood for ${poisonDmg} damage!`);
        }
        // Enemy Poison damage tick
        if (this.hasStatus(this.enemy.statusEffects, "Poisoned")) {
            const poisonDmg = Math.floor(this.enemy.maxHp * 0.05);
            this.enemy.hp = Math.max(0, this.enemy.hp - poisonDmg);
            logMessages.push(`🧪 Residual poison toxins erode ${this.enemy.name} for ${poisonDmg} internal damage!`);
        }
    }

    decrementStatusDurations() {
        this.playerStatusEffects.forEach(e => e.duration--);
        this.enemy.statusEffects.forEach(e => e.duration--);
        this.playerStatusEffects = this.playerStatusEffects.filter(e => e.duration > 0);
        this.enemy.statusEffects = this.enemy.statusEffects.filter(e => e.duration > 0);
    }

    cleanupCombatContext() {
        this.playerStatusEffects = [];
        this.enemy.statusEffects = [];
        if (typeof window.tickAbilitiesCooldowns === "function") window.tickAbilitiesCooldowns();
    }

    compileSummary(messages, status, hitResult) {
        return {
            logs: messages,
            status: status,
            hitResult: hitResult,
            playerHp: this.playerCombatHP,
            enemyHp: this.enemy.hp,
            playerCE: this.playerCombatCE,
            activePlayerStatuses: [...this.playerStatusEffects],
            activeEnemyStatuses: [...this.enemy.statusEffects]
        };
    }
}