// combat.js - Advanced Tactical Math Engine (Player 3)

/**
 * Handles all feature-rich turn-based combat calculations.
 * Interacts directly with CoreState properties via window.globalGameState.
 */
export class CombatEngine {
    /**
     * @param {Object} enemyData - The enemy object provided by your spawner/assets file
     */
    constructor(enemyData) {
        // 1. Establish direct link to the core game state anchor
        this.playerState = window.globalGameState;

        // 2. Safety recovery layer if player initiates combat while KO'd
        if (this.playerState.currentHp <= 0) {
            this.playerState.currentHp = this.playerState.maxHp;
        }

        // 3. Initialize Advanced Enemy Profile
        this.enemy = {
            name: enemyData.name || "Unknown Curse",
            maxHp: enemyData.maxHp || 50,
            hp: enemyData.maxHp || 50,
            rawPower: enemyData.rawPower || 5,
            stance: "NEUTRAL", // NEUTRAL or DESPERATION
            statusEffects: []  // Track temporary debuffs like Stunned
        };

        // 4. Combat Tracking Context Matrix
        this.turnCounter = 1;
        this.isDomainActive = false;
        this.blackFlashStreak = 0;
        this.domainBurnoutTurns = 0; // Tracks neural fry after domain usage
        this.playerStatusEffects = [];
    }

    /**
     * Executes one tactical action turn step
     * @param {string} playerChoice - 'basic', 'technique', or 'domain'
     * @returns {Object} Deep telemetry summary metrics for Player 6's rendering loop
     */
    processTurn(playerChoice) {
        let playerDamage = 0;
        let enemyDamage = 0;
        let logs = [];
        let hitResult = "HIT"; // HIT, CRITICAL, BLACK_FLASH, MISS
        let combatStatus = "CONTINUE"; 

        const multiplier = this.playerState.prestigeMultiplier || 1;

        // --- 0. PRE-TURN PROCESSING & STATUS CHECK ---
        if (this.domainBurnoutTurns > 0) this.domainBurnoutTurns--;
        
        if (this.hasStatus(this.playerStatusEffects, "Stunned")) {
            logs.push(`❌ You are STUNNED and completely unable to move this turn!`);
            playerChoice = "skipped";
        }

        // Dynamic CE Volatility Factor (+/- 10% efficiency drift each turn)
        const sparkVolatility = 0.9 + (Math.random() * 0.2);

        // ==========================================
        // PHASE 1: PLAYER ACTIONS & CRITICAL SPARKS
        // ==========================================
        if (playerChoice === "basic") {
            // Basic strikes generate Cursed Energy modulated by volatility
            const ceGained = Math.floor(15 * sparkVolatility);
            this.playerState.cursedEnergy = Math.min(
                this.playerState.maxCursedEnergy,
                this.playerState.cursedEnergy + ceGained
            );
            
            playerDamage = this.playerState.attackPower * multiplier;

            // Algorithmic Black Flash Probability Check (Increases slightly with consecutive hits)
            const flashChance = 0.05 + (this.blackFlashStreak * 0.03);
            if (Math.random() < flashChance) {
                this.blackFlashStreak++;
                hitResult = "BLACK_FLASH";
                playerDamage = Math.pow(playerDamage, 1.2) * 2.5; // Exponential scale scaling
                
                // Floods the user with massive bonus energy 
                this.playerState.cursedEnergy = Math.min(this.playerState.maxCursedEnergy, this.playerState.cursedEnergy + 30);
                logs.push(`⚡ BLACK FLASH! Sparks of black spatial distortion erupt! Dealt ${Math.floor(playerDamage)} damage and completely restored combat focus!`);
                
                // Stuns the enemy for 1 turn frame due to impact shock
                this.inflictStatus(this.enemy.statusEffects, "Stunned", 1);
            } else {
                this.blackFlashStreak = 0; // Reset streak on normal hit
                logs.push(`⚔️ You strike ${this.enemy.name} for ${Math.floor(playerDamage)} damage. Gained +${ceGained} CE.`);
            }
        } 
        
        else if (playerChoice === "technique") {
            this.blackFlashStreak = 0;
            const baseTechCost = 30;
            const dynamicTechCost = Math.floor(baseTechCost * sparkVolatility);

            if (this.domainBurnoutTurns > 0) {
                logs.push(`⚠️ Tech Blocked: Your brain's technique mapping is fried from your Domain Expansion! (${this.domainBurnoutTurns} turns left)`);
                playerDamage = 0;
            } else if (this.playerState.cursedEnergy >= dynamicTechCost) {
                this.playerState.cursedEnergy -= dynamicTechCost;
                playerDamage = this.playerState.attackPower * 3.5 * multiplier;
                logs.push(`💥 Cursed Technique unleashed! Hit ${this.enemy.name} for ${Math.floor(playerDamage)} damage. (Spent ${dynamicTechCost} CE)`);
            } else {
                playerDamage = Math.floor(this.playerState.attackPower * 0.4 * multiplier);
                logs.push(`⚠️ Energy Failure: Your curse control faltered. Dealt a weak physical punch for ${playerDamage} damage.`);
            }
        } 
        
        else if (playerChoice === "domain") {
            this.blackFlashStreak = 0;
            const domainCost = 80;

            if (this.domainBurnoutTurns > 0) {
                logs.push(`❌ Failed: Your brain is too fatigued to open another Domain yet!`);
            } else if (this.playerState.cursedEnergy >= domainCost && !this.isDomainActive) {
                this.playerState.cursedEnergy -= domainCost;
                this.isDomainActive = true;
                playerDamage = this.playerState.attackPower * 6 * multiplier;
                logs.push(`🌌 "DOMAIN EXPANSION!" Spatial barriers enclose reality. You deal a massive environment initialization blow of ${Math.floor(playerDamage)} damage!`);
            } else if (this.isDomainActive) {
                playerDamage = this.playerState.attackPower * 2.5 * multiplier;
                logs.push(`👁️ Inescapable Environment: Your attacks trigger automatically within the barrier space for ${Math.floor(playerDamage)} damage.`);
            } else {
                playerDamage = this.playerState.attackPower * multiplier;
                logs.push(`⚠️ Energy insufficient for Domain Expansion! Deployed a quick standard strike for ${playerDamage} damage.`);
            }
        }

        // Apply Domain Inescapable Hit Modifier rules
        if (this.isDomainActive && playerChoice !== "domain" && playerDamage > 0) {
            playerDamage *= 1.6; // 60% standard structural domain damage amplification
        }

        // Deal core calculation results directly to the enemy target pool
        if (playerDamage > 0) {
            this.enemy.hp = Math.max(0, this.enemy.hp - Math.floor(playerDamage));
        }

        // Evaluate Instant Victory Metrics
        if (this.enemy.hp <= 0) {
            combatStatus = "VICTORY";
            
            // Scaled dynamic progression rewards tied to enemy scaling parameters
            const expGained = enemyData.expReward || (this.playerState.level * 15);
            const cashGained = enemyData.moneyReward || (this.playerState.level * 10);

            this.playerState.exp += expGained;
            this.playerState.money += cashGained;
            
            // Clean dynamic state configurations
            if (this.isDomainActive) this.domainBurnoutTurns = 3; // Trigger technique lockout upon win/exit
            
            this.playerState.save(); 

            logs.push(`💀 Threat Extinguished: ${this.enemy.name} has been systematically exorcised! Gained +${expGained} EXP and +$${cashGained}.`);
            return this.compileSummary(logs, combatStatus, hitResult);
        }

        // ==========================================
        // PHASE 2: ADVANCED ENEMY AI STANCE & OUTBOUND DEFENSE
        // ==========================================
        
        // Stance Shift Hook: Low HP forces curses to go wild
        if ((this.enemy.hp / this.enemy.maxHp) <= 0.35 && this.enemy.stance !== "DESPERATION") {
            this.enemy.stance = "DESPERATION";
            logs.push(`🚨 Threat Escalation: ${this.enemy.name}'s aura distorts wildly into a Desperation Stance! Its attack damage will spike!`);
        }

        // Process enemy strike execution if they are not stunned or dead
        if (!this.hasStatus(this.enemy.statusEffects, "Stunned") && playerChoice !== "flee") {
            enemyDamage = this.enemy.rawPower;

            // Apply stance buffs to enemy raw output
            if (this.enemy.stance === "DESPERATION") {
                enemyDamage *= 1.5; // 50% damage boost when desperate
            }
            // Domain environment suppresses enemy tracking control loops
            if (this.isDomainActive) {
                enemyDamage *= 0.70; // Enemy deals 30% less damage trapped inside your domain
            }

            // CRUCIAL EXPLICIT INTERCEPTION REQUIREMENT HOOK
            if (typeof window.processInfinityDefense === "function") {
                enemyDamage = window.processInfinityDefense(this, enemyDamage);
            }

            // Deduct from your native CoreState player health tracker
            this.playerState.currentHp = Math.max(0, this.playerState.currentHp - Math.floor(enemyDamage));
            
            if (enemyDamage > 0) {
                logs.push(`💥 ${this.enemy.name} retaliates, crushing your vitals for ${Math.floor(enemyDamage)} damage.`);
                
                // Sneak stun chance if hit with massive power in desperation mode
                if (this.enemy.stance === "DESPERATION" && Math.random() < 0.15) {
                    this.inflictStatus(this.playerStatusEffects, "Stunned", 1);
                    logs.push(`💫 Impact Overload: The curse's brutal desperation swing has STUNNED you for next turn!`);
                }
            } else {
                logs.push(`🛡️ Limitless Void: Your automated Infinity barrier stopped all incoming pressure vectors completely.`);
            }
        } else if (this.hasStatus(this.enemy.statusEffects, "Stunned")) {
            logs.push(`💤 Enemy is currently Stunned and completely skipped their combat execution window.`);
        }

        // Evaluate Defeat State Checks
        if (this.playerState.currentHp <= 0) {
            combatStatus = "DEFEAT";
            if (this.isDomainActive) this.isDomainActive = false;
            logs.push(`❌ Status Terminal: Defeated in battle. Auto-archiving local state progress metrics...`);
            this.playerState.save();
        }

        // Tick off turn durations for status effect lists
        this.tickDownStatusEffects();

        this.turnCounter++;
        return this.compileSummary(logs, combatStatus, hitResult);
    }

    // --- ENCAPSULATED SUB-UTILITIES ---

    inflictStatus(array, statusName, duration) {
        const match = array.find(s => s.name === statusName);
        if (match) {
            match.duration = Math.max(match.duration, duration);
        } else {
            array.push({ name: statusName, duration: duration });
        }
    }

    hasStatus(array, statusName) {
        return array.some(s => s.name === statusName && s.duration > 0);
    }

    tickDownStatusEffects() {
        this.playerStatusEffects.forEach(s => s.duration--);
        this.enemy.statusEffects.forEach(s => s.duration--);
        this.playerStatusEffects = this.playerStatusEffects.filter(s => s.duration > 0);
        this.enemy.statusEffects = this.enemy.statusEffects.filter(s => s.duration > 0);
    }

    /**
     * Packs complex metadata summaries down seamlessly into Player 6's interface UI components
     */
    compileSummary(messages, combatStatus, hitResult) {
        return {
            logs: messages,
            status: combatStatus,
            hitResult: hitResult,
            playerHp: this.playerState.currentHp,
            playerMaxHp: this.playerState.maxHp,
            playerCE: this.playerState.cursedEnergy,
            playerMaxCE: this.playerState.maxCursedEnergy,
            enemyHp: this.enemy.hp,
            enemyMaxHp: this.enemy.maxHp,
            enemyStance: this.enemy.stance,
            burnoutTurns: this.domainBurnoutTurns,
            turn: this.turnCounter,
            domainActive: this.isDomainActive
        };
    }
}
