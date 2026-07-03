import GAME_ASSETS from "./assets.js";
import "./state.js";
import "./training.js";
import "./abilities.js";
import "./combat.js";

let activeEncounter = null;
let radarTarget = null;

window.appendCombatLog = function(msg, type = "system") {
  const log = document.getElementById("combat-log");
  if (!log) return;
  const line = document.createElement("div");
  line.className = `log-line log-${type}`;
  line.textContent = msg;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
};

window.triggerDomainVisuals = function(name) {
  const overlay = document.getElementById("domain-overlay");
  if (!overlay) return;
  overlay.querySelector(".domain-name").textContent = name;
  overlay.classList.add("active");
  setTimeout(() => overlay.classList.remove("active"), 1600);
};

window.triggerBlackFlashVisuals = function() {
  document.body.classList.add("flash-active");
  setTimeout(() => { document.body.classList.remove("flash-active"); }, 200);
};

// UI Mapping Helpers
function applyRarityClass(elementId, data) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (!data) {
        el.innerText = "None";
        el.className = "rarity-common";
        return;
    }
    el.innerText = data.name;
    el.className = "";
    if (data.rarity === "S+") el.classList.add("rarity-s-plus");
    else if (data.rarity === "S") el.classList.add("rarity-s");
    else if (data.rarity === "A") el.classList.add("rarity-a");
    else if (data.rarity === "B") el.classList.add("rarity-b");
    else el.classList.add("rarity-common");
}

function renderStats() {
  const state = window.globalGameState;
  if (!state) return;
  
  document.getElementById("stat-grade").textContent = state.grade;
  document.getElementById("stat-level").textContent = state.level;
  document.getElementById("stat-money").textContent = state.money.toLocaleString();
  document.getElementById("stat-ce").textContent = `${Math.floor(state.cursedEnergy)} / ${state.maxCursedEnergy}`;
  document.getElementById("stat-atk").textContent = state.attackPower;
  document.getElementById("stat-hp").textContent = `${Math.round(state.hp)} / ${state.maxHp}`;
  document.getElementById("ce-bar-fill").style.width = `${Math.min(100, (state.cursedEnergy / state.maxCursedEnergy) * 100)}%`;

  document.getElementById("ui-playtime").textContent = state.playtime;
  document.getElementById("ui-kills").textContent = state.kills;

  applyRarityClass("profile-clan", state.equippedClanData);
  applyRarityClass("profile-ct", state.equippedCTData);
  applyRarityClass("profile-trait", state.equippedTraitData);
  
  document.getElementById("ui-clan-rolls").textContent = state.clanRolls;
  document.getElementById("ui-ct-rolls").textContent = state.ctRolls;
  document.getElementById("ui-trait-rolls").textContent = state.traitRolls;

  const shopYen = document.getElementById("shop-ui-yen");
  if(shopYen) shopYen.textContent = state.money.toLocaleString();
}

function renderTraining() {
  const state = window.globalGameState;
  const container = document.getElementById("training-grid");
  if (!container || !state) return;
  container.innerHTML = "";
  for (const node of GAME_ASSETS.trainingNodes) {
    const owned = state.ownedTraining.includes(node.id) || node.id === "meditate";
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div><h3 style="margin:0;">${node.name}</h3><p class="muted-text text-small" style="margin:0;">+${node.yield} CE/s</p></div>
      <button ${owned ? "disabled" : ""} class="action-btn" data-buy="${node.id}">${owned ? "Active" : `${node.cost} Yen`}</button>
    `;
    container.appendChild(card);
  }
  container.querySelectorAll("[data-buy]").forEach((btn) => {
    btn.addEventListener("click", () => { window.buyTraining(btn.dataset.buy); renderAll(); });
  });
}

function renderCombatScreen() {
  const state = window.globalGameState;
  const idle = document.getElementById("combat-idle-screen");
  const activeUI = document.getElementById("active-combat-ui");
  
  if (!activeEncounter || activeEncounter.finished) {
    idle.style.display = "block"; activeUI.style.display = "none";
    return;
  }

  idle.style.display = "none"; activeUI.style.display = "block";

  document.getElementById("combat-player-hp").textContent = `${Math.round(activeEncounter.playerHp)} / ${state.maxHp}`;
  document.getElementById("combat-player-ce").textContent = `${Math.round(state.cursedEnergy)} / ${state.maxCursedEnergy}`;
  document.getElementById("combat-enemy-name").textContent = activeEncounter.enemy.name;
  document.getElementById("combat-enemy-hp").textContent = `${Math.max(0, activeEncounter.enemy.hp)} / ${activeEncounter.enemy.maxHp}`;

  const pendingMult = activeEncounter.pendingDamageMultiplier || 1;
  const baseDmg = state.attackPower;
  document.getElementById("ui-dmg-basic").textContent = `~${Math.round(baseDmg * pendingMult)} DMG`;
  document.getElementById("ui-dmg-tech").textContent = `~${Math.round(baseDmg * 1.8 * pendingMult)} DMG`;
  
  const ct = state.equippedCTData;
  document.getElementById("ui-dmg-domain").textContent = (ct && ct.domain) ? `${ct.domain.multiplier}x AMP` : `Unavailable`;
}

function renderAll() {
  renderStats();
  renderTraining();
  renderCombatScreen();
}

// ---- Animated Gacha Logic ----
function showRollAnimation(category, table, finalResult, equipField) {
  const state = window.globalGameState;
  const modal = document.getElementById("roll-modal");
  const title = document.getElementById("roll-category-title");
  const animText = document.getElementById("roll-animation-text");
  const resultContainer = document.getElementById("roll-result-container");
  const resultName = document.getElementById("roll-result-name");
  const resultDesc = document.getElementById("roll-result-desc");
  const closeBtn = document.getElementById("btn-close-roll");

  title.innerText = `ROLLING ${category.toUpperCase()}...`;
  animText.style.display = "block";
  resultContainer.style.display = "none";
  modal.style.display = "flex";

  let ticks = 0;
  const shuffle = setInterval(() => {
    animText.innerText = table[Math.floor(Math.random() * table.length)].name.toUpperCase();
    ticks++;
    if (ticks > 15) {
        clearInterval(shuffle);
        animText.style.display = "none";
        resultContainer.style.display = "block";

        resultName.innerText = finalResult.name;
        resultDesc.innerText = `[${finalResult.rarity}] ${finalResult.desc || ''}`;
        
        resultName.className = "roll-result";
        if (finalResult.rarity === "S+") resultName.classList.add("rarity-s-plus");
        else if (finalResult.rarity === "S") resultName.classList.add("rarity-s");
        else if (finalResult.rarity === "A") resultName.classList.add("rarity-a");
        else if (finalResult.rarity === "B") resultName.classList.add("rarity-b");
        else resultName.classList.add("rarity-common");

        closeBtn.onclick = () => {
            state[equipField] = finalResult.id;
            state.saveState();
            window.appendCombatLog(`Gacha: Rolled [${finalResult.rarity}] ${finalResult.name}!`, "system");
            modal.style.display = "none";
            renderAll();
        };
    }
  }, 100);
}

function rollGacha(category) {
  const state = window.globalGameState;
  const table = { clan: GAME_ASSETS.clans, ct: GAME_ASSETS.cursedTechniques, trait: GAME_ASSETS.traits }[category];
  const rollField = { clan: "clanRolls", ct: "ctRolls", trait: "traitRolls" }[category];
  const equipField = { clan: "equippedClan", ct: "equippedCT", trait: "equippedTrait" }[category];

  if (!state || state[rollField] <= 0) {
    window.appendCombatLog(`No ${category} rolls remaining.`, "system");
    return;
  }

  state[rollField] -= 1;

  // FIX: Calculate total weight carefully
  const totalWeight = table.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;
  
  let result = table[table.length - 1]; // Default to last
  for (const item of table) {
    if (roll < item.weight) {
      result = item;
      break;
    }
    roll -= item.weight;
  }
  
  showRollAnimation(category, table, result, equipField);
}

function buyRoll(category) {
  const state = window.globalGameState;
  if (state.spendMoney(1000)) {
      const rollField = { clan: "clanRolls", ct: "ctRolls", trait: "traitRolls" }[category];
      state[rollField] += 1;
      window.appendCombatLog(`Purchased 1 ${category} roll.`, "system");
      renderAll();
  } else { window.appendCombatLog("Not enough Yen.", "system"); }
}

function handleAction(actionFn) {
  if (!activeEncounter) return;
  actionFn();
  if (activeEncounter.finished) {
    if(activeEncounter.enemy.hp <= 0) window.globalGameState.addKill();
    activeEncounter = null;
  }
  renderAll();
}

function switchTab(tabId) {
  document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
  document.querySelectorAll(".nav-tab").forEach((t) => t.classList.remove("active"));
  document.getElementById(`panel-${tabId}`).classList.add("active");
  document.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-tab").forEach((tab) => tab.addEventListener("click", () => switchTab(tab.dataset.tab)));

  document.getElementById("btn-radar-search").addEventListener("click", () => {
    const randomEnemy = GAME_ASSETS.enemies[Math.floor(Math.random() * GAME_ASSETS.enemies.length)];
    radarTarget = randomEnemy.id;
    document.getElementById("radar-target-name").innerText = randomEnemy.name;
    document.getElementById("radar-result").style.display = "block";
    appendCombatLog(`Radar detected signature: ${randomEnemy.name}`, "system");
  });

  document.getElementById("btn-radar-enter").addEventListener("click", () => {
    if (radarTarget) {
      activeEncounter = window.startEncounter(radarTarget);
      switchTab("combat");
      radarTarget = null;
      document.getElementById("radar-result").style.display = "none";
      renderAll();
    }
  });

  document.getElementById("btn-roll-clan")?.addEventListener("click", () => rollGacha("clan"));
  document.getElementById("btn-roll-ct")?.addEventListener("click", () => rollGacha("ct"));
  document.getElementById("btn-roll-trait")?.addEventListener("click", () => rollGacha("trait"));

  document.getElementById("btn-buy-clan-roll")?.addEventListener("click", () => buyRoll("clan"));
  document.getElementById("btn-buy-ct-roll")?.addEventListener("click", () => buyRoll("ct"));
  document.getElementById("btn-buy-trait-roll")?.addEventListener("click", () => buyRoll("trait"));

  document.getElementById("btn-basic").addEventListener("click", () => handleAction(() => activeEncounter.playerBasicAttack()));
  document.getElementById("btn-technique").addEventListener("click", () => handleAction(() => activeEncounter.playerTechnique()));
  document.getElementById("btn-domain").addEventListener("click", () => handleAction(() => activeEncounter.playerDomainExpansion()));

  setInterval(() => { if(window.globalGameState) window.globalGameState.addPlaytime(); }, 1000);
  window.startTrainingLoop();
  window.onResourceTick = () => renderStats();

 HEAD
  renderAll();
  switchTab("home");
  window.appendCombatLog("Welcome to the Jujutsu world, sorcerer.", "system");
});
    document.getElementById("btn-render-list").addEventListener("click", () => {
        renderList(sampleData);
    });


/**
 * Initializes and populates data structures dynamically into lists
 */
function initDynamicList() {
    renderList(sampleData);
}

function renderList(dataArray) {
    const listContainer = document.getElementById("dynamic-list");
    listContainer.innerHTML = ""; // Clear existing contents

    dataArray.forEach(item => {
        const li = document.createElement("li");
        li.className = "list-item";
        li.innerHTML = `<strong>${item.name}</strong> - <span class="badge">${item.type}</span> (ID: ${item.id})`;
        listContainer.appendChild(li);
    });
}

/**
 * Updates the HUD header content
 * @param {string} statusText - Text to display in the status indicator
 * @param {number} scoreValue - Numerical score value to show
 */
export function updateHUD(statusText, scoreValue) {
    document.getElementById("hud-status-text").textContent = statusText;
    document.getElementById("hud-score-text").textContent = scoreValue;
}

/**
 * Exposing appendCombatLog to the global window scope for other player modules
 * @param {string} msg - Message payload
 * @param {string} type - Style modifier key (e.g., 'info', 'damage', 'heal')
 */
window.appendCombatLog = function(msg, type = "info") {
    const logContainer = document.getElementById("combat-log-container");
    if (!logContainer) return;

    const logEntry = document.createElement("div");
    logEntry.className = `log-entry log-${type}`;
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;

    logContainer.appendChild(logEntry);
    
    // Auto-scroll to the bottom of the log container
    logContainer.scrollTop = logContainer.scrollHeight;
};
