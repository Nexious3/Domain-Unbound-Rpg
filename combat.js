// combat.js - Player 3 (The Tactician Engine) - Advanced Game Version

// Grade Multipliers dictate enemy power scaling and reward scaling
const GRADE_BALANCING = {
    "Fly Head":       { powerMod: 0.5, expReward: 10,   cashReward: 5   },
    "Grade 4":        { powerMod: 1.0, expReward: 30,   cashReward: 20  },
    "Grade 3":        { powerMod: 1.5, expReward: 100, cashReward: 50  },
    "Grade 2":        { powerMod: 2.5, expReward: 350, cashReward: 150 },
    "Grade 1":        { powerMod: 4.0, expReward: 1200, cashReward: 500},
    "Special Grade":  { powerMod: 6.5, expReward: 5000, cashReward: 2000}
};

export class CombatEngine {
    /**
     * @param {Object} globalState - Directly passes Player 1's state object from state.js
     * @param {Object} enemyData - Generated enemy data from the game world
     */
    constructor(globalState, enemyData) {
        this.state = globalState; // Reference to the core game state
        
        // Structural fallbacks for safety execution
        if (this.state.maxHp === undefined) this.state.maxHp = 100;
        if (this.state.attackPower === undefined) this.state.attackPower = 20;
        if (this.state.maxCursedEnergy === undefined) this.state.maxCursedEnergy = 100;
        if (this.state.exp === undefined) this.state.exp = 0;
        if (this.state.money === undefined) this.state.money = 0;

        // Tracking temporary combat pools
        this.playerCombatHP = globalState.maxHp;
        this.playerCombatCE = globalState.cursedEnergy || 50;

        this.enemy = {
            name: enemyData.name,
            grade: enemyData.grade,
            hp: enemyData.maxHp,
            maxHp: enemyData.maxHp,
            rawPower: enemyData.rawPower
        };
        
        this.isDomainActive = false;
        this.domainOwner = null;
        this.turnCounter = 1;
        this.blackFlashStreak = 0; // Tracks consecutive black flashes for high-tier gameplay logs
    }

    /**
     * Processes a single combat round with advanced game mechanics
     * @param {string} playerChoice - 'basic', 'technique', or 'domain'
     * @returns {Object} Immersive turn summary for Player 6 (app.js UI wrapper)
     */
    processTurn(playerChoice) {
        let playerDamage = 0;
        let logMessages = [];
        let hitResult = "HIT"; // Can become "CRITICAL", "BLACK_FLASH", or "MISS"
        
        const gradeConfig = GRADE_BALANCING[this.enemy.grade] || GRADE_BALANCING["Grade 4"];

        // Pull prestige multipliers from Player 1's state
        const prestigeMod = this.state.prestigeMultiplier || 1.0;
        const heavenlyRestrictionMultiplier = this.state.prestigeMultipliers?.heavenlyRestriction || prestigeMod;
        const techniqueRefinementMultiplier = this.state.prestigeMultipliers?.techniqueRefinement || prestigeMod;

        // --- 1. PLAYER ACTION PHASE ---
        if (playerChoice === "basic") {
            // Replenish CE in combat pool
            this.playerCombatCE = Math.min(this.state.maxCursedEnergy, this.playerCombatCE + 15);
            
            // Base Damage Calculation
            playerDamage = this.state.attackPower * heavenlyRestrictionMultiplier;
            
            // ADVANCED MECHANIC: Lore-accurate Black Flash RNG calculation (5% base chance)
            const isBlackFlash = Math.random() < 0.05;
            
            if (isBlackFlash) {
                this.blackFlashStreak++;
                hitResult = "BLACK_FLASH";
                // In JJK lore, a Black Flash is applied to the power of 2.5! 
                // To keep balance smooth, we calculate Math.pow(damage, 1.5) or standard multiplier scaling
                playerDamage = Math.pow(playerDamage, 1.25) * 2.5; 
                
                // Entering the zone rewards the player by flashing CE pool back to max cap
                this.playerCombatCE = Math.min(this.state.maxCursedEnergy, this.playerCombatCE + 30);
                
                logMessages.push(`⚡ BLACK FLASH! Sparks of black space distort! Your strike expands exponentially!`);
                if (this.blackFlashStreak > 1) {
                    logMessages.push(`🔥 In incredible flow state! ${this.blackFlashStreak} consecutive Black Flashes!`);
                }
            } else {
                this.blackFlashStreak = 0; // Reset streak if regular hit
                // Standard Critical strike chance (10%)
                if (Math.random() < 0.10) {
                    hitResult = "CRITICAL";
                    playerDamage *= 1.5;
                    logMessages.push(`🎯 Critical Strike! Targeted a weak point in the curse's core structure.`);
                } else {
                    logMessages.push(`${this.state.sorcererName || 'You'} landed a heavy physical punch.`);
                }
            }
        } 
        else if (playerChoice === "technique") {
            this.blackFlashStreak = 0;
            if (this.playerCombatCE >= 40) {
                this.playerCombatCE -= 40;
                playerDamage = this.state.attackPower * 3 * techniqueRefinementMultiplier; 
                
                // Small variance factor to make damage outputs feel like a genuine RPG engine
                const variance = 0.9 + Math.random() * 0.2; // 90% to 110% random variance
                playerDamage *= variance;

                logMessages.push(`${this.state.sorcererName || 'You'} unleashed a devastating Cursed Technique!`);
            } else {
                logMessages.push(`❌ Not enough Cursed Energy! Dealt a weak, un-infused desperate strike.`);
                playerDamage = this.state.attackPower * 0.4;
            }
        }
        else if (playerChoice === "domain") {
            this.blackFlashStreak = 0;
            const domainCost = window.playerAbilitiesState?.domainCeCost || 100;
            const isBrainFried = window.playerAbilitiesState?.brainFryTurns > 0;

            if (isBrainFried) {
                logMessages.push(`❌ Domain Expansion failed! Your brain's cursed technique area is completely short-circuited!`);
            } else if (this.playerCombatCE >= domainCost && !this.isDomainActive) {
                this.playerCombatCE -= domainCost;
                this.isDomainActive = true;
                this.domainOwner = "player";
                hitResult = "DOMAIN_EXPANSION";
                
                logMessages.push(`🌌 "DOMAIN EXPANSION!" The surrounding space breaks down into your inner world.`);
                
                if (typeof window.triggerDomainVisuals === "function") {
                    window.triggerDomainVisuals("Domain Unbound");
                }
            } else {
                logMessages.push(`⚠️ Domain Expansion failed or an environment layout is already active.`);
            }
        }

        // Apply domain offensive guarantees
        if (this.domainOwner === "player") {
            playerDamage *= 1.5; 
        }

        // ADVANCED MECHANIC: Enemy evasion logic based on Grade difficulty
        const enemyDodgeChance = this.enemy.grade === "Special Grade" ? 0.15 : (this.enemy.grade === "Grade 1" ? 0.08 : 0.02);
        if (Math.random() < enemyDodgeChance && playerChoice !== "domain" && this.domainOwner !== "player") {
            playerDamage = 0;
            hitResult = "MISS";
            logMessages = [`💨 The ${this.enemy.name} perceived the flow of energy and completely evaded your attack!`];
        }

        // Apply Damage Allocation safely
        this.enemy.hp = Math.max(0, this.enemy.hp - Math.floor(playerDamage));

        // Evaluate Victory Condition
        if (this.enemy.hp <= 0) {
            this.state.exp += gradeConfig.expReward;
            this.state.money += gradeConfig.cashReward;
            
            if (typeof this.state.checkForLevelUp === "function") {
                this.state.checkForLevelUp();
            }

            logMessages.push(`💀 Target Exorcised! Gained ${gradeConfig.expReward} EXP and ¥${gradeConfig.cashReward}.`);
            if (typeof window.tickAbilitiesCooldowns === "function") window.tickAbilitiesCooldowns();
            
            return this.compileSummary(logMessages, "VICTORY", hitResult);
        }

        // --- 2. ENEMY ACTION PHASE ---
        let enemyDamage = this.enemy.rawPower * gradeConfig.powerMod;
        
        // Apply Domain environmental defensive advantages
        if (this.domainOwner === "player") {
            enemyDamage *= 0.65; // High domain environment suppression protection
        }

        // Pass calculated damage through Player 4's defensive filters if available
        if (typeof window.processInfinityDefense === "function") {
            enemyDamage = window.processInfinityDefense(this, enemyDamage);
        }

        // Apply damage to user
        this.playerCombatHP = Math.max(0, this.playerCombatHP - Math.floor(enemyDamage));
        
        if (enemyDamage > 0) {
            logMessages.push(`💥 ${this.enemy.name} retaliates violently, hitting you for ${Math.floor(enemyDamage)} damage.`);
        } else if (enemyDamage === 0 && playerChoice !== "domain") {
            logMessages.push(`🛡️ Your active defenses completely mitigated incoming curse force damage.`);
        }

        // Evaluate Defeat Condition
        if (this.playerCombatHP <= 0) {
            logMessages.push(`❌ Reality fades... You were brutally overwhelmed by the cursed spirit.`);
            if (typeof window.tickAbilitiesCooldowns === "function") window.tickAbilitiesCooldowns();
            return this.compileSummary(logMessages, "DEFEAT", hitResult);
        }

        // End-of-turn cooldown increments
        if (typeof window.tickAbilitiesCooldowns === "function") {
            window.tickAbilitiesCooldowns();
        }

        this.turnCounter++;
        return this.compileSummary(logMessages, "CONTINUE", hitResult);
    }

    compileSummary(messages, status, hitResult) {
        return {
            logs: messages,
            status: status,
            hitResult: hitResult, // Tells app.js exact type of execution hit for custom visual filters
            playerHp: this.playerCombatHP,
            enemyHp: this.enemy.hp,
            playerCE: this.playerCombatCE
        };
    }
}