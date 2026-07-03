import GAME_ASSETS from "./assets.js";

class CoreState {
  constructor() {
    this.grade = "Grade 4";
    this.level = 1;
    this.exp = 0;
    this.expToNext = 100;
    this.money = 5000;
    this.cursedEnergy = 0;
    this.baseMaxCursedEnergy = 100;
    this.baseAttackPower = 10;
    this.baseMaxHp = 100;
    this.hp = 100;
    this.playtime = 0;
    this.kills = 0;
    this.clanRolls = 10;
    this.ctRolls = 10;
    this.traitRolls = 10;
    this.equippedClan = "none";
    this.equippedCT = "none";
    this.equippedTrait = "none";
    this.ownedTraining = [];
    this.loadState();
  }

  _findById(list, id) { return list.find((entry) => entry.id === id) || null; }

  get equippedClanData() { return this._findById(GAME_ASSETS.clans, this.equippedClan); }
  get equippedCTData() { return this._findById(GAME_ASSETS.cursedTechniques, this.equippedCT); }
  get equippedTraitData() { return this._findById(GAME_ASSETS.traits, this.equippedTrait); }

  get stats() {
    let ce = 1, hp = 1, str = 1, crit = 0.10, def = 1.0, tech = 1.0, stun = 0;
    let disableBf = false;
    const loadout = [this.equippedTraitData, this.equippedClanData, this.equippedCTData];
    
    loadout.forEach(item => {
      if (!item) return;
      if (item.ceMulti !== undefined) ce *= item.ceMulti;
      if (item.hpMulti !== undefined) hp *= item.hpMulti;
      if (item.strengthMulti !== undefined) str *= item.strengthMulti;
      if (item.critChance !== undefined) crit += item.critChance;
      if (item.defenseMulti !== undefined) def *= item.defenseMulti;
      if (item.techMulti !== undefined) tech *= item.techMulti;
      if (item.stunChance !== undefined) stun += item.stunChance;
      if (item.disableBlackFlash) disableBf = true;
    });

    if (ce === 0) ce = 0;
    return { ce, hp, str, crit, def, tech, stun, disableBf };
  }

  get attackPower() { return Math.max(1, Math.round(this.baseAttackPower * this.stats.str * this.level)); }
  get maxCursedEnergy() { return Math.round(this.baseMaxCursedEnergy * this.stats.ce * (1 + (this.level - 1) * 0.08)); }
  get maxHp() { return Math.round(this.baseMaxHp * this.stats.hp * (1 + (this.level - 1) * 0.10)); }

  addExp(amount) {
    this.exp += amount;
    while (this.exp >= this.expToNext) {
      this.exp -= this.expToNext;
      this.level += 1;
      this.expToNext = Math.round(this.expToNext * 1.35);
      this.hp = this.maxHp;
    }
  }

  spendMoney(amount) { if (this.money < amount) return false; this.money -= amount; return true; }
  spendCursedEnergy(amount) { if (this.cursedEnergy < amount) return false; this.cursedEnergy -= amount; return true; }
  addKill() { this.kills += 1; }
  addPlaytime() { this.playtime += 1; }

  saveState() {
    const data = {
      grade: this.grade, level: this.level, exp: this.exp, money: this.money, hp: this.hp,
      kills: this.kills, playtime: this.playtime,
      clanRolls: this.clanRolls, ctRolls: this.ctRolls, traitRolls: this.traitRolls,
      equippedClan: this.equippedClan, equippedCT: this.equippedCT, equippedTrait: this.equippedTrait
    };
    localStorage.setItem("jujutsu_save", JSON.stringify(data));
  }

  loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem("jujutsu_save"));
      if (saved) {
        this.level = saved.level || 1; this.money = saved.money || 0; this.kills = saved.kills || 0;
        this.clanRolls = saved.clanRolls || 0; this.ctRolls = saved.ctRolls || 0; this.traitRolls = saved.traitRolls || 0;
        this.equippedClan = saved.equippedClan || "none";
        this.equippedCT = saved.equippedCT || "none";
        this.equippedTrait = saved.equippedTrait || "none";
      }
    } catch(e) {}
  }
}

window.globalGameState = new CoreState();
export default window.globalGameState;