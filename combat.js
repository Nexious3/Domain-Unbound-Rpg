class CombatEngine {
  constructor(enemyId) {
    const state = window.globalGameState;
    const enemyTemplate = GAME_ASSETS.enemies.find((e) => e.id === enemyId);
    this.state = state;
    this.enemy = { ...enemyTemplate, hp: enemyTemplate.maxHp };
    this.playerHp = state.hp > 0 ? state.hp : state.maxHp;
    this.pendingDamageMultiplier = 1;
    this.finished = false;
    window.appendCombatLog(`Encounter start: ${this.enemy.name}`, "system");
  }

  playerBasicAttack() {
    if (this.finished) return null;
    let dmg = Math.round(this.state.attackPower * this.pendingDamageMultiplier);
    if(Math.random() < this.state.stats.crit && !this.state.stats.disableBf) {
        dmg = Math.floor(dmg * 2.5);
        window.triggerBlackFlashVisuals();
        window.appendCombatLog(`⚡ BLACK FLASH! ⚡ Dealt ${dmg} damage!`, "blackflash");
    } else {
        window.appendCombatLog(`Basic strike deals ${dmg} damage.`, "player");
    }
    
    this.pendingDamageMultiplier = 1;
    this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
    this.state.cursedEnergy = Math.min(this.state.maxCursedEnergy, this.state.cursedEnergy + 4);
    return this._afterPlayerAction();
  }

  playerTechnique() {
    if (this.finished) return null;
    if (this.state.stats.ce === 0) return window.appendCombatLog("You have 0 CE capability.", "system");
    if (!this.state.spendCursedEnergy(15)) return window.appendCombatLog("Not enough CE.", "system");
    
    let dmg = Math.round(this.state.attackPower * 1.8 * this.pendingDamageMultiplier * this.state.stats.tech);
    this.pendingDamageMultiplier = 1;
    this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
    window.appendCombatLog(`Cursed technique deals ${dmg} damage (-15 CE).`, "player");
    return this._afterPlayerAction();
  }

  playerDomainExpansion() {
    if (this.finished) return null;
    if (this.state.stats.ce === 0) return window.appendCombatLog("You have 0 CE capability.", "system");
    const result = window.activateDomainExpansion();
    if (!result) return null;
    this.pendingDamageMultiplier = result.damageMultiplier || 1;
    return this._checkOutcome();
  }

  _afterPlayerAction() {
    const outcome = this._checkOutcome();
    if (outcome) return outcome;
    return this._enemyPhase();
  }

  _enemyPhase() {
    if (this.finished) return null;
    if (Math.random() < this.state.stats.stun) {
        window.appendCombatLog(`${this.enemy.name} was stunned by your attack!`);
        return this._checkOutcome();
    }

    const rawDamage = this.enemy.rawPower + Math.round(this.enemy.rawPower * (Math.random() * 0.3));
    const filteredDamage = window.processCTDefense ? window.processCTDefense(rawDamage) : rawDamage;
    const finalDmg = Math.floor(filteredDamage * this.state.stats.def);
    
    this.playerHp = Math.max(0, this.playerHp - finalDmg);
    this.state.hp = this.playerHp;
    window.appendCombatLog(`${this.enemy.name} strikes for ${finalDmg} damage.`, "enemy");
    window.tickAbilitiesCooldowns();
    return this._checkOutcome();
  }

  _checkOutcome() {
    if (this.enemy.hp <= 0) {
      this.finished = true;
      const moneyReward = Math.round(this.enemy.maxHp * 1.2);
      this.state.addExp(this.enemy.expYield);
      this.state.money += moneyReward;
      window.appendCombatLog(`Victory! +${this.enemy.expYield} EXP, +${moneyReward} Yen.`, "system");
      return { result: "victory" };
    }
    if (this.playerHp <= 0) {
      this.finished = true;
      this.state.hp = this.state.maxHp;
      this.state.cursedEnergy = 0;
      window.appendCombatLog(`You were defeated... Penalty applied: All Cursed Energy lost.`, "defeat");
      return { result: "defeat" };
    }
    return null;
  }
}

window.startEncounter = (enemyId) => new CombatEngine(enemyId);
export default CombatEngine;