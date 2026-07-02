// Sample data structure to demonstrate dynamic list rendering
const sampleData = [
    { id: 1, name: "Aether Thread", type: "Material" },
    { id: 2, name: "Chronos Loom", type: "Artifact" },
    { id: 3, name: "Pattern Echo", type: "Spell" }
];

document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    initActionButtons();
    initDynamicList();
    
    // Quick test/initial state for HUD
    updateHUD("System Online", 100);
});

/**
 * Handles tab navigation switching
 */
function initTabs() {
    const tabs = document.querySelectorAll(".tab-btn");
    const panels = document.querySelectorAll(".tab-panel");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const targetId = tab.getAttribute("data-target");

            // Update active tab button
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            // Update active panel view
            panels.forEach(panel => {
                if (panel.id === targetId) {
                    panel.classList.add("active");
                } else {
                    panel.classList.remove("active");
                }
            });
        });
    });
}

/**
 * Attaches event listeners to HTML interactive buttons
 */
function initActionButtons() {
    document.getElementById("btn-action-1").addEventListener("click", () => {
        window.appendCombatLog("Action 1 executed by the Weaver.", "info");
        updateHUD("Processing", Math.floor(Math.random() * 500));
    });

    document.getElementById("btn-action-2").addEventListener("click", () => {
        window.appendCombatLog("Critical strike recorded!", "damage");
    });

    document.getElementById("btn-render-list").addEventListener("click", () => {
        renderList(sampleData);
    });
}

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