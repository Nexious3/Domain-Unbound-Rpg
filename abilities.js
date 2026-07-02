

export class LimitlessAbilities {
    constructor() {
       
        this.infinityUnlocked = true;
        this.infinityEfficiency = 0.5;
        this.domainCeCost = 80;        
        this.brainFryTurns = 0;        
    }

    /**

     * * @param {Object} combatEngine 
     * @param {number} incomingDamage 
     * @returns {number} 
     */
    processInfinityDefense(combatEngine, incomingDamage) {
         
        if (this.infinityUnlocked && combatEngine.playerCombatCE >= 10) {
            
           
            combatEngine.playerCombatCE = Math.max(0, combatEngine.playerCombatCE - 10);
            
           
            const mitigatedDamage = incomingDamage * (1 - this.infinityEfficiency);
            
            
            if (typeof window.appendCombatLog === "function") {
                window.appendCombatLog(`🛡️ Infinity Intercepted! Damage reduced to ${Math.floor(mitigatedDamage)}.`, "player");
            }
            
            return mitigatedDamage;
        }
        
        
        return incomingDamage;
    }

   
    tickCooldowns() {
        if (this.brainFryTurns > 0) {
            this.brainFryTurns--;
            
          
            if (this.brainFryTurns === 0) {
                if (typeof window.appendCombatLog === "function") {
                    window.appendCombatLog("🧠 Your neural pathways have recovered from Domain Expansion!", "system");
                }
            }
        }
    }
}

window.playerAbilitiesState = new LimitlessAbilities();
window.processInfinityDefense = (engine, dmg) => window.playerAbilitiesState.processInfinityDefense(engine, dmg);
window.tickAbilitiesCooldowns = () => window.playerAbilitiesState.tickCooldowns();
