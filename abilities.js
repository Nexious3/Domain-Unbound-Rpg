import GAME_ASSETS from "./assets.js";

const abilityState = { brainFryTurns: 0, domainActive: false, domainTurnsLeft: 0, regenPassiveHeal: 0 };

function getEquippedCT() {
  const state = window.globalGameState;
  if (!state) return null;
  return GAME_ASSETS.cursedTechniques.find((ct) => ct.id === state.equippedCT) || null;
}

const PASSIVE_HANDLERS = {
  none: (dmg) => ({ finalDamage: dmg, logMessage: null }),
  damage_reduction: (dmg, ct, state) => {
    const cost = ct.ceCostPerUse || 10;
    if (state.spendCursedEnergy(cost)) {
      const reduced = Math.max(0, Math.round(dmg * (1 - ct.passiveValue)));
      return { finalDamage: reduced, logMessage: `Infinity filters the strike — damage cut to ${reduced} (-${cost} CE).` };
    }
    return { finalDamage: dmg, logMessage: "Not enough CE to sustain Infinity." };
  }
};

function processCTDefense(incomingDamage) {
  const state = window.globalGameState;
  const ct = getEquippedCT();
  if (!state || !ct) return incomingDamage;
  const handler = PASSIVE_HANDLERS[ct.passiveType] || PASSIVE_HANDLERS.none;
  const result = handler(incomingDamage, ct, state);
  if (result.logMessage && typeof window.appendCombatLog === "function") window.appendCombatLog(result.logMessage, "ability");
  return result.finalDamage;
}

function activateDomainExpansion() {
  const state = window.globalGameState;
  const ct = getEquippedCT();
  if (!state || !ct || !ct.domain) { window.appendCombatLog("This technique has no Domain Expansion.", "system"); return null; }
  if (abilityState.brainFryTurns > 0) { window.appendCombatLog(`Brain fry! ${abilityState.brainFryTurns} turns remaining.`, "system"); return null; }
  if (!state.spendCursedEnergy(ct.domain.cost)) { window.appendCombatLog(`Not enough CE to expand ${ct.domain.name}.`, "system"); return null; }

  abilityState.domainActive = true;
  abilityState.domainTurnsLeft = 1;
  abilityState.brainFryTurns = ct.domain.brainFryTurns || 2;

  window.appendCombatLog(`${ct.domain.name} expands!`, "domain");
  if (typeof window.triggerDomainVisuals === "function") window.triggerDomainVisuals(ct.domain.name);
  return { damageMultiplier: ct.domain.multiplier, message: "Domain active." };
}

function tickAbilitiesCooldowns() {
  if (abilityState.brainFryTurns > 0) abilityState.brainFryTurns -= 1;
}

window.processCTDefense = processCTDefense;
window.activateDomainExpansion = activateDomainExpansion;
window.tickAbilitiesCooldowns = tickAbilitiesCooldowns;
export { processCTDefense, activateDomainExpansion, tickAbilitiesCooldowns };