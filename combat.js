// combat.js - Player 3 (The Tactician Engine)

// Grade Multipliers dictate enemy power scaling and reward scaling
const GRADE_BALANCING = {
    "Fly Head":       { powerMod: 0.5, expReward: 10,  cashReward: 5   },
    "Grade 4":        { powerMod: 1.0, expReward: 30,  cashReward: 20  },
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
        
        // Tracking temporary combat pools so we don't permanently destroy their stats during a fight
        this.playerCombatHP = globalState.maxHp || 100;
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
        const heavenlyRestrictionMultiplier = this.state.prestigeMultipliers?.heavenlyRestriction || 1.0;
        const techniqueRefinementMultiplier = this.state.prestigeMultipliers?.techniqueRefinement || 1.0;

        // 1. Player Action Phase
        if (playerChoice === "basic") {
            // Replenish CE in combat pool
            this.playerCombatCE = Math.min(this.state.maxCursedEnergy || 100, this.playerCombatCE + 12);
            
            // Physical attacks scale with Heavenly Restriction prestige!
            playerDamage = (this.state.attackPower || 20) * heavenlyRestrictionMultiplier; 
            logMessages.push(`${this.state.sorcererName || 'You'} landed a physical punch!`);
        } 
        else if (playerChoice === "technique") {
            if (this.playerCombatCE >= 40) {
                this.playerCombatCE -= 40;
                
                // Cursed techniques scale with Technique Refinement prestige!
                playerDamage = (this.state.attackPower || 20) * 3 * techniqueRefinementMultiplier; 
                logMessages.push(`${this.state.sorcererName || 'You'} unleashed a refined Cursed Technique!`);
            } else {
                logMessages.push(`Not enough Cursed Energy! Dealt a desperate strike.`);
                playerDamage = (this.state.attackPower || 20) * 0.5;
            }
        }
        else if (playerChoice === "domain") {
            if (this.playerCombatCE >= 100 && !this.isDomainActive) {
                this.playerCombatCE -= 100;
                this.isDomainActive = true;
                this.domainOwner = "player";
                logMessages.push(`${this.state.sorcererName || 'You'} declared: DOMAIN EXPANSION!`);
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
            return this.compileSummary(logMessages, "VICTORY");
        }

        // 2. Enemy Action Phase
        let enemyDamage = this.enemy.rawPower * gradeConfig.powerMod;
        if (this.domainOwner === "player") enemyDamage *= 0.7; // Domain defense reduction

        this.playerCombatHP = Math.max(0, this.playerCombatHP - Math.floor(enemyDamage));
        logMessages.push(`${this.enemy.name} counters, dealing ${Math.floor(enemyDamage)} damage.`);

        // Evaluate Defeat Condition
        if (this.playerCombatHP <= 0) {
            logMessages.push(`You were overwhelmed by the cursed spirit...`);
            return this.compileSummary(logMessages, "DEFEAT");
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