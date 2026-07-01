// combat.js - Player 3 (The Tactician Engine) - Integrated with Player 4

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
        
        // FIX: Inject structural fallbacks if Player 1's state hasn't initialized them yet
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
    }

    /**
     * Processes a single combat round
     * @param {string} playerChoice - 'basic', 'technique', or 'domain'
     * @returns {Object} Turn summary for Player 6 (app.js) to read and display
     */
    processTurn(playerChoice) {
        let playerDamage = 0;
        let logMessages = [];
        const gradeConfig = GRADE_BALANCING[this.enemy.grade] || GRADE_BALANCING["Grade 4"];

        // Pull prestige multipliers from Player 1's state.js (defaulting to 1 if not set yet)
        const prestigeMod = this.state.prestigeMultiplier || 1.0;
        const heavenlyRestrictionMultiplier = this.state.prestigeMultipliers?.heavenlyRestriction || prestigeMod;
        const techniqueRefinementMultiplier = this.state.prestigeMultipliers?.techniqueRefinement || prestigeMod;

        // 1. Player Action Phase
        if (playerChoice === "basic") {
            // Replenish CE in combat pool
            this.playerCombatCE = Math.min(this.state.maxCursedEnergy, this.playerCombatCE + 12);
            
            // Physical attacks scale with Heavenly Restriction prestige!
            playerDamage = this.state.attackPower * heavenlyRestrictionMultiplier; 
            logMessages.push(`${this.state.sorcererName || 'You'} landed a physical punch!`);
        } 
        else if (playerChoice === "technique") {
            if (this.playerCombatCE >= 40) {
                this.playerCombatCE -= 40;
                
                // Cursed techniques scale with Technique Refinement prestige!
                playerDamage = this.state.attackPower * 3 * techniqueRefinementMultiplier; 
                logMessages.push(`${this.state.sorcererName || 'You'} unleashed a refined Cursed Technique!`);
            } else {
                logMessages.push(`Not enough Cursed Energy! Dealt a desperate strike.`);
                playerDamage = this.state.attackPower * 0.5;
            }
        }
        else if (playerChoice === "domain") {
            // INTEGRATION: Verify Player 4's custom Domain costs and state criteria
            const domainCost = window.playerAbilitiesState?.domainCeCost || 100;
            const isBrainFried = window.playerAbilitiesState?.brainFryTurns > 0;

            if (isBrainFried) {
                logMessages.push(`❌ Domain Expansion failed! Your brain is fried for ${window.playerAbilitiesState.brainFryTurns} more turns!`);
            } else if (this.playerCombatCE >= domainCost && !this.isDomainActive) {
                this.playerCombatCE -= domainCost;
                this.isDomainActive = true;
                this.domainOwner = "player";
                
                // Trigger Player 6 UI Flash Animation Hook
                if (typeof window.triggerDomainVisuals === "function") {
                    window.triggerDomainVisuals("Domain Unbound");
                }
            } else {
                logMessages.push(`Domain Expansion failed or already active.`);
            }
        }

        // Apply domain factors
        if (this.domainOwner === "player") playerDamage *= 1.5;

        // Deal damage to enemy
        this.enemy.hp = Math.max(0, this.enemy.hp - Math.floor(playerDamage));

        // Evaluate Victory Condition
        if (this.enemy.hp <= 0) {
            // Directly reward Player 1's state counters
            this.state.exp += gradeConfig.expReward;
            this.state.money += gradeConfig.cashReward;
            
            // Trigger Player 1's level up check if they wrote one
            if (typeof this.state.checkForLevelUp === "function") {
                this.state.checkForLevelUp();
            }

            logMessages.push(`Exorcism Complete! Gained ${gradeConfig.expReward} EXP.`);
            
            // Post-combat cooldown cleanup
            if (typeof window.tickAbilitiesCooldowns === "function") window.tickAbilitiesCooldowns();
            
            return this.compileSummary(logMessages, "VICTORY");
        }

        // 2. Enemy Action Phase
        let enemyDamage = this.enemy.rawPower * gradeConfig.powerMod;
        if (this.domainOwner === "player") enemyDamage *= 0.7; // Domain defense reduction

        // INTEGRATION: Pass attack calculations through Player 4's Infinity defensive filter
        if (typeof window.processInfinityDefense === "function") {
            enemyDamage = window.processInfinityDefense(this, enemyDamage);
        }

        this.playerCombatHP = Math.max(0, this.playerCombatHP - Math.floor(enemyDamage));
        
        if (enemyDamage > 0) {
            logMessages.push(`${this.enemy.name} counters, dealing ${Math.floor(enemyDamage)} damage.`);
        }

        // Evaluate Defeat Condition
        if (this.playerCombatHP <= 0) {
            logMessages.push(`You were overwhelmed by the cursed spirit...`);
            if (typeof window.tickAbilitiesCooldowns === "function") window.tickAbilitiesCooldowns();
            return this.compileSummary(logMessages, "DEFEAT");
        }

        // Maintenance phase at end of active turn
        if (typeof window.tickAbilitiesCooldowns === "function") {
            window.tickAbilitiesCooldowns();
        }

        this.turnCounter++;
        return this.compileSummary(logMessages, "CONTINUE");
    }

    compileSummary(messages, status) {
        return {
            logs: messages,
            status: status,
            playerHp: this.playerCombatHP,
            enemyHp: this.enemy.hp,
            playerCE: this.playerCombatCE
        };
    }
}