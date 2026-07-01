// app.js - Player 6 (UI Render Engine) - Integrated with Players 1, 2, 3, and 4

// Local snapshot memory to decouple tick updates from DOM layout engines
let cachedGameState = null;
let currentCombatInstance = null; // Track active Player 3 CombatEngine references

document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    startRenderLoop();
    initCombatButtonListeners();
    window.appendCombatLog("System execution stable. Ready for data transmission.", "system");
});

// UX State Memory: Ensures users don't drop tabs on standard layout updates
function initNavigation() {
    const navButtons = document.querySelectorAll(".nav-btn");
    const panels = document.querySelectorAll(".panel");

    const activeTab = localStorage.getItem("activeTab") || "training-panel";
    switchTab(activeTab);

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-target");
            switchTab(target);
        });
    });

    function switchTab(targetId) {
        navButtons.forEach(b => b.classList.remove("active"));
        panels.forEach(p => p.classList.remove("active"));

        const matchedBtn = document.querySelector(`[data-target="${targetId}"]`);
        if (matchedBtn) matchedBtn.classList.add("active");
        
        const matchedPanel = document.getElementById(targetId);
        if (matchedPanel) matchedPanel.classList.add("active");

        localStorage.setItem("activeTab", targetId);
    }
}

// Player 1 Hook: Sets data frame snapshot without causing layout engine thrashing
window.updateUIHUD = function(stateData) {
    cachedGameState = stateData;
};

// Continuous Animation Engine (Optimized High-Frequency FPS Frame Loop)
function startRenderLoop() {
    function render() {
        if (cachedGameState) {
            document.getElementById("hud-grade").innerText = cachedGameState.grade || "4th Grade";
            document.getElementById("hud-ce").innerText = Math.floor(cachedGameState.cursedEnergy || 0).toLocaleString();
            document.getElementById("hud-level").innerText = cachedGameState.sorcererLevel || cachedGameState.level || 1;
            
            // Dynamic Button State Toggles based on available resources
            const cePool = currentCombatInstance ? currentCombatInstance.playerCombatCE : cachedGameState.cursedEnergy;
            
            const techBtn = document.getElementById("btn-technique");
            if (techBtn) techBtn.disabled = cePool < 40;

            const domainBtn = document.getElementById("domain-expansion-btn");
            if (domainBtn) {
                const domainCost = window.playerAbilitiesState?.domainCeCost || 100;
                const isFried = window.playerAbilitiesState?.brainFryTurns > 0;
                domainBtn.disabled = cePool < domainCost || isFried || (currentCombatInstance && currentCombatInstance.isDomainActive);
            }
        }
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

// Wire up Combat Screen Button Listeners
function initCombatButtonListeners() {
    const handleAction = (choice) => {
        if (!currentCombatInstance) {
            window.appendCombatLog("❌ No active mission tracking initialized. Choose a mission first!", "system");
            return;
        }
        
        // Execute Player 3 Combat Logic Turn loop execution
        const summary = currentCombatInstance.processTurn(choice);
        
        // Display logs returned by the execution loop
        summary.logs.forEach(msg => {
            let logType = "system";
            if (msg.includes("punch") || msg.includes("Technique") || msg.includes("DOMAIN")) logType = "player";
            if (msg.includes("counters") || msg.includes("overwhelmed")) logType = "enemy";
            window.appendCombatLog(msg, logType);
        });

        // Add a visual hit shake impact animation to the layout viewport
        const combatScreen = document.getElementById("combat-screen");
        combatScreen.style.transform = "scale(0.98)";
        setTimeout(() => combatScreen.style.transform = "scale(1)", 100);

        // Resolve End-of-Battle States
        if (summary.status === "VICTORY" || summary.status === "DEFEAT") {
            document.getElementById("btn-attack").disabled = true;
            document.getElementById("btn-technique").disabled = true;
            document.getElementById("domain-expansion-btn").disabled = true;
            currentCombatInstance = null; // Wipe combat instances reference pointers
        }
    };

    document.getElementById("btn-attack").addEventListener("click", () => handleAction("basic"));
    document.getElementById("btn-technique").addEventListener("click", () => handleAction("technique"));
    document.getElementById("domain-expansion-btn").addEventListener("click", () => handleAction("domain"));
}

/**
 * EXTERNAL MISSION HOOK: Triggered when selecting an enemy target module configuration array
 * @param {CombatEngine} combatEngineInstance - An initialized instance of Player 3's CombatEngine
 */
window.startActiveCombatEngineSession = function(combatEngineInstance) {
    currentCombatInstance = combatEngineInstance;
    document.getElementById("btn-attack").disabled = false;
    window.appendCombatLog(`⚠️ Combat Engagement Initiated: ${combatEngineInstance.enemy.name} detected!`, "enemy");
};

// Dynamic Template Engine: Generates Upgrades dynamically for Player 2
window.renderTrainingNodes = function(nodesArray) {
    const list = document.getElementById("training-list");
    list.innerHTML = ""; 
    
    nodesArray.forEach(node => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <h3>${node.name}</h3>
            <p>Gain +${node.yield} ${node.statType}/sec</p>
            <button class="action-btn" id="train-btn-${node.id}">
                Train (Cost: ${node.cost} CE)
            </button>
        `;
        card.querySelector("button").addEventListener("click", () => {
            if (typeof window.buyTraining === "function") window.buyTraining(node.id);
        });
        list.appendChild(card);
    });
};

// Dynamic Template Engine: Generates Techniques dynamically for Player 4
window.renderAbilitiesNodes = function(abilitiesArray) {
    const list = document.getElementById("abilities-list");
    list.innerHTML = "";

    abilitiesArray.forEach(ability => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <h3>${ability.name}</h3>
            <p>${ability.description}</p>
            <button class="action-btn" id="ability-btn-${ability.id}">
                Unlocked Passively
            </button>
        `;
        list.appendChild(card);
    });
};

// Scrolling Feed Logic
window.appendCombatLog = function(message, type = "system") {
    const logBox = document.getElementById("combat-log");
    if (!logBox) return;
    
    const logEntry = document.createElement("p");
    logEntry.className = `log-${type}`;
    logEntry.innerText = `[${new Date().toLocaleTimeString()}] ${message}`;
    
    logBox.appendChild(logEntry);
    logBox.scrollTop = logBox.scrollHeight;
};

// Visual FX Trigger Hook: Used by Player 4 & 3 when Domain triggers
window.triggerDomainVisuals = function(domainName) {
    const overlay = document.getElementById("domain-overlay");
    if (!overlay) return;
    
    const title = overlay.querySelector(".domain-title");
    
    title.innerText = domainName.toUpperCase();
    overlay.classList.remove("hidden");
    overlay.classList.add("animate");
    
    setTimeout(() => {
        overlay.classList.remove("animate");
        overlay.classList.add("hidden");
    }, 3000);
};