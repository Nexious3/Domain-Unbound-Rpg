
window.playerAbilitiesState = {
    hasInfinityActive: true,
    brainFryTurns: 0,
    domainUnlocked: true, 
    
    infinityCeCost: 15,   
    domainCeCost: 100     
};


function patchGlobalStateFallbacks(state) {
    if (!state) return;
    if (state.maxHp === undefined) state.maxHp = 100;
    if (state.attackPower === undefined) state.attackPower = 20;
    if (state.level === undefined) state.level = state.sorcererLevel || 1;
    if (state.money === undefined) state.money = 0;
    if (state.exp === undefined) state.exp = 0;
    if (state.prestigeMultipliers === undefined) {
        state.prestigeMultipliers = {
            heavenlyRestriction: state.prestigeMultiplier || 1.0,
            techniqueRefinement: state.prestigeMultiplier || 1.0
        };
    }
}

/**
  
  @param {Object} combatInstance 
 @param {number} rawIncomingDamage 
  @returns {number} 
 */
window.processInfinityDefense = function(combatInstance, rawIncomingDamage) {
    const abilities = window.playerAbilitiesState;


    if (abilities.brainFryTurns > 0) {
        return rawIncomingDamage;
    }

    if (abilities.hasInfinityActive) {
        if (combatInstance.playerCombatCE >= abilities.infinityCeCost) {
            combatInstance.playerCombatCE -= abilities.infinityCeCost;
            
            if (typeof window.appendCombatLog === "function") {
                window.appendCombatLog(`🛡️ Infinity neutralized the impact vector! (Spent ${abilities.infinityCeCost} CE)`, "player");
            }
            return 0; 
        } else {
            abilities.hasInfinityActive = false;
            abilities.brainFryTurns = 2; 
            if (typeof window.appendCombatLog === "function") {
                window.appendCombatLog("⚠️ CRITICAL: Cursed energy dry! Your Infinity barrier shattered!", "enemy");
            }
            return rawIncomingDamage;
        }
    }

    return rawIncomingDamage;
};

window.tickAbilitiesCooldowns = function() {
    const abilities = window.playerAbilitiesState;
    if (abilities.brainFryTurns > 0) {
        abilities.brainFryTurns--;
        if (abilities.brainFryTurns === 0) {
            abilities.hasInfinityActive = true;
            if (typeof window.appendCombatLog === "function") {
                window.appendCombatLog("🧠 Your neural networks recovered. Infinity barrier re-established.", "system");
            }
        }
    }
};

window.initAbilitiesPanelDisplay = function() {
    if (typeof window.renderAbilitiesNodes === "function") {
        window.renderAbilitiesNodes([
            {
                id: "infinity_barrier",
                name: "Limitless Boundary: Infinity",
                description: "Passively expends 15 CE in combat to fully nullify incoming standard attack patterns.",
                cost: 0
            },
            {
                id: "domain_unbound",
                name: "Domain Expansion: Domain Unbound",
                description: "Manifest your raw innate domain canvas. Multiplies combat dealing damage by 1.5x.",
                cost: 100
            }
        ]);
    }
};

setTimeout(() => {
    window.initAbilitiesPanelDisplay();
}, 500);