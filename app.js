// Local snapshot memory to decouple tick updates from DOM layout engines
let cachedGameState = null;

document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    startRenderLoop();
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
            document.getElementById("hud-level").innerText = cachedGameState.level || 1;
        }
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

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
        // Safely wire logic context directly back to Player 2 action script execution hooks
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
                Unlock (${ability.cost} CE)
            </button>
        `;
        card.querySelector("button").addEventListener("click", () => {
            if (typeof window.unlockAbility === "function") window.unlockAbility(ability.id);
        });
        list.appendChild(card);
    });
};

// Scrolling Feed Logic
window.appendCombatLog = function(message, type = "system") {
    const logBox = document.getElementById("combat-log");
    const logEntry = document.createElement("p");
    
    logEntry.className = `log-${type}`;
    logEntry.innerText = `[${new Date().toLocaleTimeString()}] ${message}`;
    
    logBox.appendChild(logEntry);
    logBox.scrollTop = logBox.scrollHeight;
};

// Visual FX Trigger Hook: Used by Player 4 when Domain triggers
window.triggerDomainVisuals = function(domainName) {
    const overlay = document.getElementById("domain-overlay");
    const title = overlay.querySelector(".domain-title");
    
    title.innerText = domainName.toUpperCase();
    overlay.classList.remove("hidden");
    overlay.classList.add("animate");
    
    window.appendCombatLog(`DOMAIN EXPANSION: ${domainName} !!`, "player");

    setTimeout(() => {
        overlay.classList.remove("animate");
        overlay.classList.add("hidden");
    }, 3000);
};