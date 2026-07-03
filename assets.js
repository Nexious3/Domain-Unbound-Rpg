const GAME_ASSETS = {
  trainingNodes: [
    { id: "meditate", name: "Cursed Meditation", cost: 0, yield: 1 },
    { id: "shrine_run", name: "Shrine Endurance Run", cost: 250, yield: 4 },
    { id: "curse_wrestle", name: "Curse Wrestling Drills", cost: 1200, yield: 12 }
  ],
  enemies: [
    { id: "fly_head", name: "Fly Head", grade: "Grade 4", maxHp: 80, rawPower: 6, expYield: 10, yenYield: 100 },
    { id: "grade_1", name: "Grade 1 Curse", grade: "Grade 1", maxHp: 260, rawPower: 18, expYield: 50, yenYield: 500 },
    { id: "sukuna", name: "Ryomen Sukuna", grade: "Special Grade", maxHp: 5000, rawPower: 130, expYield: 5000, yenYield: 50000 }
  ],
  clans: [
    { id: "none", name: "No Clan", rarity: "Common", weight: 500, desc: "No clan bonus." },
    { id: "fushigoro", name: "Fushigoro", rarity: "B", weight: 1000, defenseMulti: 0.85, desc: "+15% Agility/Perception." },
    { id: "inumaki", name: "Inumaki", rarity: "B", weight: 1000, ceMulti: 1.2, desc: "+20% Cursed Output." },
    { id: "kugisaki", name: "Kugisaki", rarity: "A", weight: 200, critChance: 0.10, desc: "+20% Perception." },
    { id: "todo", name: "Todo", rarity: "A", weight: 200, strengthMulti: 1.3, desc: "+30% Strength." },
    { id: "kamo", name: "Kamo", rarity: "S", weight: 50, hpMulti: 1.2, defenseMulti: 0.8, desc: "+20% Vitality, +20% Endurance." },
    { id: "kinji", name: "Kinji", rarity: "S", weight: 50, ceMulti: 1.5, desc: "Increases base CE Cap." },
    { id: "nanami", name: "Nanami", rarity: "S", weight: 50, critChance: 0.25, desc: "7:3 Sorcerer: +25% Crit." },
    { id: "gojo", name: "Gojo", rarity: "S+", weight: 10, ceMulti: 1.8, desc: "Six Eyes: +50% Efficiency, +30% Output." },
    { id: "zenin", name: "Zenin", rarity: "S+", weight: 10, strengthMulti: 1.3, defenseMulti: 0.8, desc: "Heavenly Weapons: +30% STR, +20% AGI." }
  ],
  cursedTechniques: [
    { id: "none", name: "No Technique", rarity: "Common", weight: 5000, desc: "Undeveloped." },
    // A Tier
    { id: "blood_manipulation", name: "Blood Manipulation", rarity: "A", weight: 200, techMulti: 1.5, desc: "A Tier Tech." },
    { id: "cockroach", name: "Cockroach", rarity: "A", weight: 200, techMulti: 1.5, desc: "A Tier Tech." },
    { id: "judgeman", name: "Judgeman", rarity: "A", weight: 200, techMulti: 1.5, desc: "A Tier Tech." },
    { id: "ratio_technique", name: "Ratio Technique", rarity: "A", weight: 200, techMulti: 1.5, desc: "A Tier Tech." },
    { id: "contractual_recreation", name: "Contractual Re-Creation", rarity: "A", weight: 200, techMulti: 1.5, desc: "A Tier Tech." },
    { id: "copy", name: "Copy", rarity: "A", weight: 200, techMulti: 1.5, desc: "A Tier Tech." },
    { id: "disaster_plants", name: "Disaster Plants", rarity: "A", weight: 200, techMulti: 1.5, desc: "A Tier Tech." },
    // S Tier
    { id: "ten_shadows", name: "Ten Shadows", rarity: "S", weight: 50, techMulti: 3.0, desc: "S Tier Tech." },
    { id: "limitless", name: "Limitless", rarity: "S", weight: 50, techMulti: 3.0, passiveType: "damage_reduction", passiveValue: 0.5, domain: { name: "Unlimited Void", cost: 80, effect: "freeze_and_amplify", multiplier: 2.0, brainFryTurns: 3 }, desc: "S Tier Tech." },
    { id: "ce_discharge", name: "Cursed Energy Discharge", rarity: "S", weight: 50, techMulti: 3.0, desc: "S Tier Tech." },
    { id: "shrine", name: "Shrine", rarity: "S", weight: 50, techMulti: 3.0, desc: "S Tier Tech." },
    { id: "mythical_beast_amber", name: "Mythical Beast Amber", rarity: "S", weight: 50, techMulti: 3.0, desc: "S Tier Tech." },
    { id: "anti_gravity_system", name: "Anti Gravity System", rarity: "S", weight: 50, techMulti: 3.0, desc: "S Tier Tech." },
    { id: "sky_manipulation", name: "Sky Manipulation", rarity: "S", weight: 50, techMulti: 3.0, desc: "S Tier Tech." },
    // S+ Tier
    { id: "star_rage", name: "Star Rage", rarity: "S+", weight: 10, techMulti: 5.0, desc: "S+ Tier Tech." },
    { id: "idle_transfiguration", name: "Idle Transfiguration", rarity: "S+", weight: 10, techMulti: 5.0, desc: "S+ Tier Tech." },
    { id: "mastered_copy", name: "Mastered Copy", rarity: "S+", weight: 10, techMulti: 5.0, desc: "S+ Tier Tech." },
    { id: "comedian", name: "Comedian", rarity: "S+", weight: 10, techMulti: 5.0, desc: "S+ Tier Tech." },
    { id: "cursed_spirit_manipulation", name: "Cursed Spirit Manipulation", rarity: "S+", weight: 10, techMulti: 5.0, desc: "S+ Tier Tech." },
    { id: "mahoraga", name: "Divine General Mahoraga", rarity: "S+", weight: 10, techMulti: 5.0, desc: "S+ Tier Tech." }
  ],
  traits: [
    { id: "none", name: "Ordinary", rarity: "Common", weight: 5000, desc: "No special trait." },
    // A Tier
    { id: "explosive_output", name: "Explosive Output", rarity: "A", weight: 200, techMulti: 1.5, strengthMulti: 0.8, desc: "+50% Jujutsu DMG, -20% Phys DMG." },
    { id: "low_ce", name: "Low CE Reserves", rarity: "A", weight: 200, ceMulti: 0.7, strengthMulti: 1.2, desc: "-30% CE gain, +20% STR." },
    { id: "sturdy", name: "Sturdy", rarity: "A", weight: 200, defenseMulti: 0.7, desc: "30% damage reduction." },
    // S Tier
    { id: "queen_of_curses", name: "Queen of Curses", rarity: "S", weight: 50, strengthMulti: 1.5, ceMulti: 2.5, desc: "Starts combat with partial manifestation." },
    { id: "binding_vow_overtime", name: "Binding Vow: Overtime", rarity: "S", weight: 50, strengthMulti: 1.5, techMulti: 1.5, desc: "+50% STR and output." },
    { id: "black_flash_spark", name: "Black Flash Spark", rarity: "S", weight: 50, critChance: 0.10, desc: "+10% base black flash chance." },
    { id: "electricity", name: "CE Trait: Electricity", rarity: "S", weight: 50, stunChance: 0.25, desc: "Attacks have a 25% chance to stun." },
    // S+ Tier
    { id: "spiritually_gifted", name: "Spiritually Gifted", rarity: "S+", weight: 10, ceMulti: 4.0, hpMulti: 0.2, desc: "+300% CE output/efficiency, -80% endurance." },
    { id: "physically_gifted", name: "Physically Gifted", rarity: "S+", weight: 10, strengthMulti: 4.0, ceMulti: 0, disableBlackFlash: true, desc: "+300% STR/AGI, 0 CE, no black flash." },
    { id: "ryomens_vessel", name: "Ryomen's Vessel", rarity: "S+", weight: 10, strengthMulti: 2.0, ceMulti: 2.0, desc: "+100% STR, +100% CE output." },
    { id: "perfect_body", name: "Perfect Body", rarity: "S+", weight: 10, hpMulti: 2.5, strengthMulti: 2.5, desc: "+150% Endurance and Strength." }
  ]
};
window.gameAssetsCache = GAME_ASSETS;
export default GAME_ASSETS;