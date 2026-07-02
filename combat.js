// combat.js - Player 3 (The Tactician Engine) - Advanced Production Engine V4.0

// Grade Multipliers dictate enemy power scaling and reward scaling
const GRADE_BALANCING = {
    "Fly Head":       { powerMod: 0.5, expReward: 10,   cashReward: 5,   dropChance: 0.12 },
    "Grade 4":        { powerMod: 1.0, expReward: 30,   cashReward: 20,  dropChance: 0.25 },
    "Grade 3":        { powerMod: 1.5, expReward: 100, cashReward: 50,  dropChance: 0.40 },
    "Grade 2":        { powerMod: 2.5, expReward: 350, cashReward: 150, dropChance: 0.55 },
    "Grade 1":        { powerMod: 4.0, expReward: 1200, cashReward: 500, dropChance: 0.80 },
    "Special Grade":  { powerMod: 6.5, expReward: 5000, cashReward: 2000, dropChance: 1.00 }
};

// Rare loot rewards passed back to the global state inventory upon victory
const LOOT_TABLE = [
    { name: "Low-Grade Cursed Charm", type: "trinket", value: 50 },
    { name: "Grade 2 Slaughter Demon", type: "weapon", value: 300 },
    { name: "Cursed Energy Elixir", type: "consumable", value: 100 },
    { name: "Special Grade Tool: Playful Cloud", type: "weapon", value: 2500 },
    { name: "Sukuna Finger Fragment", type: "artifact", value: 10000 }
];

// Environmental Conditions initialized dynamically at the start of a fight
const ENVIRONMENTAL_TRAITS = [
    { name: "Clear Skies", desc: "Standard baseline operational parameters.", ceRegenBonus: 0, damageMod: 1.0 },
    { name: "Midnight Veil", desc: "Dense cursed energy residue ambient humidity. +5 Cursed Energy regen per turn.", ceRegenBonus: 5, damageMod: 1.0 },
    { name: "Dilapidated Domain", desc: "Structural integrity compromised. Danger high. All damage increased by 20%.", ceRegenBonus: 0, damageMod: 1.2 },
    { name: "Heavy Downpour", desc: "Restricts physical maneuverability vectors. Basic attack damage reduced by 10%.", ceRegenBonus: 2, damageMod: 0.9 }
];

export class CombatEngine {
    /**
     * @param {Object} globalState - Directly passes Player 1's state object from state.js
     * @param {Object} enemyData - Generated enemy data from the game world
     */
    constructor(globalState, enemyData) {
        this.state = globalState; 
        
        // Structural validation fallback injection
        if (this.state.maxHp === undefined) this.state.maxHp = 100;
        if (this.state.attackPower === undefined) this.state.attackPower = 20;
        if (this.state.maxCursedEnergy === undefined) this.state.maxCursedEnergy = 100;
        if (this.state.exp === undefined) this.state.exp = 0;
        if (this.state.money === undefined) this.state.money = 0;
        if (this.state.inventory === undefined) this.state.inventory = [];

        // Tracking temporary localized combat pools
        this.playerCombatHP = globalState.maxHp;
        this.playerCombatCE = globalState.cursedEnergy || 50;

        this.enemy = {
            name: enemyData.name,
            grade: enemyData.grade,
            hp: enemyData.maxHp,
            maxHp: enemyData.maxHp,
            rawPower: enemyData.rawPower,
            statusEffects: [],
            stance: "NEUTRAL" // Dynamically alters AI scripts based on HP parameters
        };
        
        this.playerStatusEffects = []; 
        this.isDomainActive = false;
        this.domainOwner = null;
        this.turnCounter = 1;
        
        // Tactical Combat Flow Accumulators
        this.blackFlashStreak = 0;
        this.divergentFistCharge = 0; // Tracks residual delayed kinetic impacts
        
        // Dynamic Environment Selector Initialization
        const traitIndex = Math.floor(Math.random() * ENVIRONMENTAL_TRAITS.length);
        this.activeEnvironment = ENVIRONMENTAL_TRAITS[traitIndex];
    }

    /**
     * Processes a single combat execution matrix frame
     * @param {string} playerChoice - 'basic', 'technique', 'domain', 'heal', or 'flee'
     * @returns {Object} Deep telemetry round summary object package for Player 6 UI tracking
     */
    processTurn(playerChoice) {
        let playerDamage = 0;
        let enemyDamage = 0;
        let logMessages = [];
        let hitResult = "HIT"; 
        
        const gradeConfig = GRADE_BALANCING[this.enemy.grade] || GRADE_BALANCING["Grade 4"];
        const prestigeMod = this.state.prestigeMultiplier || 1.0;
        const heavenlyRestrictionMultiplier = this.state.prestigeMultipliers?.heavenlyRestriction || prestigeMod;
        const techniqueRefinementMultiplier = this.state.prestigeMultipliers?.techniqueRefinement || prestigeMod;

        // --- 0. BACKGROUND SYSTEM FRAME INITS ---
        if (this.turnCounter === 1) {
            logMessages.push(`🌐 Battlefield Condition: **${this.activeEnvironment.name}** (${this.activeEnvironment.desc})`);
        }

        // Apply pre-turn environmental and status modifications
        this.applyStatusTicks(logMessages);
        
        if (this.hasStatus(this.playerStatusEffects, "Stunned")) {
            logMessages.push(`❌ Your movement vectors are completely paralyzed! Action phase skipped.`);
            playerChoice = "skipped";
        }

        // --- 1. USER ACTION RESOLUTION LAYER ---
        if (playerChoice === "basic") {
            const ceRegen = 15 + this.activeEnvironment.ceRegenBonus;
            this.playerCombatCE = Math.min(this.state.maxCursedEnergy, this.playerCombatCE + ceRegen);
            
            // Apply environmental base adjustment scales
            playerDamage = this.state.attackPower * heavenlyRestrictionMultiplier * this.activeEnvironment.damageMod;
            
            // Evaluate Divergent Fist kinetic delay accumulation
            if (this.divergentFistCharge > 0) {
                const bonusKinetic = playerDamage * 0.5 * this.divergentFistCharge;
                playerDamage += bonusKinetic;
                logMessages.push(`💥 Divergent Fist Burst! Delayed cursed energy snapped shut, adding +${Math.floor(bonusKinetic)} damage!`);
                this.divergentFistCharge = 0; 
            }

            // Core Black Flash Formula Evaluation (Base 5% scale modified by streak factors)
            const flashRngChance = 0.05 + (this.blackFlashStreak * 0.02);
            if (Math.random() < flashRngChance) {
                this.blackFlashStreak++;
                hitResult = "BLACK_FLASH";
                playerDamage = Math.pow(playerDamage, 1.25) * 2.5; 
                this.playerCombatCE = Math.min(this.state.maxCursedEnergy, this.playerCombatCE + 40);
                
                logMessages.push(`⚡ BLACK FLASH! The spatial framework distorts in black lightning! Your core focus deepens.`);
                this.inflictStatus(this.enemy.statusEffects, "Stunned", 1);
            } else {
                this.blackFlashStreak = 0;
                if (Math.random() < 0.12) {
                    hitResult = "CRITICAL";
                    playerDamage *= 1.5;
                    logMessages.push(`🎯 Precision Strike! Hit a vulnerable node in the core matrix.`);
                } else {
                    logMessages.push(`${this.state.sorcererName || 'You'} executed a precise martial combo.`);
                    // Charge Divergent Fist framework if standard hits connect cleanly
                    this.divergentFistCharge = Math.min(3, this.divergentFistCharge + 1);
                }
            }
        } 
        else if (playerChoice === "technique") {
            this.blackFlashStreak = 0;
            if (this.playerCombatCE >= 40) {
                this.playerCombatCE -= 40;
                playerDamage = this.state.attackPower * 3 * techniqueRefinementMultiplier * this.activeEnvironment.damageMod; 
                playerDamage *= (0.85 + Math.random() * 0.3); // High variance output range

                logMessages.push(`${this.state.sorcererName || 'You'} channel concentrated energy into an active Cursed Technique!`);
                
                if (Math.random() < 0.45) {
                    this.inflictStatus(this.enemy.statusEffects, "Poisoned", 2);
                    logMessages.push(`🧪 Corrosive residue clinging to target entity! Inflicted Poison status trait.`);
                }
            } else {
                logMessages.push(`⚠️ Execution Failed: Insufficient Cursed Energy reserves! Delivered a low-output punch.`);
                playerDamage = this.state.attackPower * 0.35;
            }
        }
        else if (playerChoice === "domain") {
            this.blackFlashStreak = 0;
            const domainCost = window.playerAbilitiesState?.domainCeCost || 100;
            const isBrainFried = window.playerAbilitiesState?.brainFryTurns > 0;

            if (isBrainFried) {
                logMessages.push(`❌ Domain Command Refused: Core neurological pathing is short-circuited.`);
            } else if (this.playerCombatCE >= domainCost && !this.isDomainActive) {
                this.playerCombatCE -= domainCost;
                this.isDomainActive = true;
                this.domainOwner = "player";
                hitResult = "DOMAIN_EXPANSION";
                
                logMessages.push(`🌌 "DOMAIN EXPANSION!" Spatial construct deployed successfully. Ultimate secure hit rate established.`);
                this.inflictStatus(this.enemy.statusEffects, "Enraged", 2); 
                
                if (typeof window.triggerDomainVisuals === "function") {
                    window.triggerDomainVisuals("Domain Unbound");
                }
            } else {
                logMessages.push(`⚠️ Construct Conflict: Domain mechanics already established inside this layer.`);
            }
        }
        else if (playerChoice === "heal") {
            this.blackFlashStreak = 0;
            if (this.playerCombatCE >= 30) {
                this.playerCombatCE -= 30;
                const healAmount = Math.floor(this.state.maxHp * 0.40); // 40% Scale recovery efficiency
                this.playerCombatHP = Math.min(this.state.maxHp, this.playerCombatHP + healAmount);
                logMessages.push(`✨ Reverse Cursed Technique! Cellular tissue array structures forced into complete reconstruction (+${healAmount} HP).`);
            } else {
                logMessages.push(`❌ Execution Error: CE density threshold insufficient to compute cell conversion.`);
            }
        }
        else if (playerChoice === "flee") {
            const escapeChance = this.enemy.grade === "Special Grade" ? 0.15 : 0.60;
            if (Math.random() < escapeChance) {
                logMessages.push(`🏃‍♂️ Safety Perimeter Breached: Successfully escaped current encounter frame context.`);
                return this.compileSummary(logMessages, "FLED", "FLEE");
            } else {
                logMessages.push(`⚠️ Escape Vector Denied: Target intercept speed blocked extraction pathing.`);
            }
        }

        // Apply active global modifications
        if (this.domainOwner === "player") playerDamage *= 1.5; 
        if (this.hasStatus(this.playerStatusEffects, "Enraged")) playerDamage *= 1.25;

        // Enemy Dodge Evasion Sub-Routine
        const enemyDodgeChance = this.enemy.grade === "Special Grade" ? 0.18 : (this.enemy.grade === "Grade 1" ? 0.08 : 0.02);
        if (Math.random() < enemyDodgeChance && !["domain", "heal", "flee"].includes(playerChoice) && this.domainOwner !== "player") {
            playerDamage = 0;
            hitResult = "MISS";
            logMessages.push(`💨 Target evasion sweep complete: The ${this.enemy.name} slipped out of engagement frame lines.`);
        }

        // Deduct target metrics safety allocation
        this.enemy.hp = Math.max(0, this.enemy.hp - Math.floor(playerDamage));

        // Evaluate Ultimate Victory Condition
        if (this.enemy.hp <= 0) {
            this.state.exp += gradeConfig.expReward;
            this.state.money += gradeConfig.cashReward;
            
            let dropItem = null;
            if (Math.random() < gradeConfig.dropChance) {
                const randomIdx = Math.floor(Math.random() * LOOT_TABLE.length);
                dropItem = LOOT_TABLE[randomIdx];
                this.state.inventory.push(dropItem);
            }

            if (typeof this.state.checkForLevelUp === "function") this.state.checkForLevelUp();

            logMessages.push(`💀 TARGET EXORCISED: Allocation tracking cleared. Gained +${gradeConfig.expReward} EXP.`);
            if (dropItem) logMessages.push(`🎁 [PREROGATIVE DROP SECURED] Registered artifact token: **${dropItem.name}**.`);
            
            this.cleanupCombatContext();
            return this.compileSummary(logMessages, "VICTORY", hitResult);
        }

        // --- 2. DYNAMIC ENEMY INTEL PHASE (AI STANCES) ---
        if ((this.enemy.hp / this.enemy.maxHp) <= 0.35 && this.enemy.stance !== "DESPERATION") {
            this.enemy.stance = "DESPERATION";
            logMessages.push(`🚨 Threat Alert: ${this.enemy.name} core fluctuates wildly! It enters a hyper-aggressive Desperation Stance!`);
        }

        if (!this.hasStatus(this.enemy.statusEffects, "Stunned")) {
            enemyDamage = this.enemy.rawPower * gradeConfig.powerMod * this.activeEnvironment.damageMod;
            
            // Stance modification behaviors
            if (this.enemy.stance === "DESPERATION") {
                enemyDamage *= 1.45; // Extreme damage output spike
            }
            if (this.domainOwner === "player") {
                enemyDamage *= 0.60; 
            }
            if (this.hasStatus(this.enemy.statusEffects, "Enraged")) {
                enemyDamage *= 1.20;
            }

            // Route through defense filtering hooks
            if (typeof window.processInfinityDefense === "function") {
                enemyDamage = window.processInfinityDefense(this, enemyDamage);
            }

            this.playerCombatHP = Math.max(0, this.playerCombatHP - Math.floor(enemyDamage));
            
            if (enemyDamage > 0) {
                logMessages.push(`💥 Offensive Impact: Taken ${Math.floor(enemyDamage)} damage from ${this.enemy.name}.`);
                if (Math.random() < 0.15 && this.enemy.stance === "DESPERATION") {
                    this.inflictStatus(this.playerStatusEffects, "Stunned", 1);
                    logMessages.push(`💫 Heavy concussive impact! You are Stunned for 1 turn frame.`);
                }
            } else {
                logMessages.push(`🛡️ Defensive Intercept: Active shielding variables dropped damage to zero.`);
            }
        } else {
            logMessages.push(`💤 Stun lock verified: Target frame skipping active. No attack executed.`);
        }

        // Evaluate Defeat Verification Condition
        if (this.playerCombatHP <= 0) {
            logMessages.push(`❌ Defeat Framework Triggered: Vital signs flatlining. Extraction protocol offline.`);
            this.cleanupCombatContext();
            return this.compileSummary(logMessages, "DEFEAT", hitResult);
        }

        // --- 3. RECOVERY SYSTEM CLEANUP TICK ---
        this.decrementStatusDurations();
        if (typeof window.tickAbilitiesCooldowns === "function") window.tickAbilitiesCooldowns();

        this.turnCounter++;
        return this.compileSummary(logMessages, "CONTINUE", hitResult);
    }

    // --- CORE FRAME UTILITY ENGINE METHODS ---
    inflictStatus(targetArray, statusName, duration) {
        const existing = targetArray.find(e => e.name === statusName);
        if (existing) {
            existing.duration = Math.max(existing.duration, duration);
        } else {
            targetArray.push({ name: statusName, duration: duration });
        }
    }

    hasStatus(targetArray, statusName) {
        return targetArray.some(e => e.name === statusName && e.duration > 0);
    }

    applyStatusTicks(logMessages) {
        if (this.hasStatus(this.playerStatusEffects, "Poisoned")) {
            const poisonDmg = Math.floor(this.state.maxHp * 0.05);
            this.playerCombatHP = Math.max(1, this.playerCombatHP - poisonDmg);
            logMessages.push(`🤢 System Alert: Poison decay active. Incurred -${poisonDmg} damage tick.`);
        }
        if (this.hasStatus(this.enemy.statusEffects, "Poisoned")) {
            const poisonDmg = Math.floor(this.enemy.maxHp * 0.05);
            this.enemy.hp = Math.max(0, this.enemy.hp - poisonDmg);
            logMessages.push(`🧪 System Report: Target biological decay active. Inflicted -${poisonDmg} status damage.`);
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
        this.blackFlashStreak = 0;
        this.divergentFistCharge = 0;
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
            environment: this.activeEnvironment.name,
            divergentStacks: this.divergentFistCharge,
            activePlayerStatuses: [...this.playerStatusEffects],
            activeEnemyStatuses: [...this.enemy.statusEffects]
        };
    }
}