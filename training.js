// =========================
// Training Nodes Definition
// =========================

const trainingNodes = {
    shadowBoxing: {
        id: "shadowBoxing",
        type: "physical",
        level: 0,
        baseGain: 0.5,
        gainScaling: 1.15,
        baseCost: 10,
        costScaling: 1.25
    },

    meditation: {
        id: "meditation",
        type: "spiritual",
        level: 0,
        baseGain: 0.3,
        gainScaling: 1.20,
        baseCost: 15,
        costScaling: 1.30
    }
};

// =========================
// Passive Gain Engine
// =========================

function calculatePassiveGains() {
    let strengthGain = 0;
    let cursedEnergyGain = 0;

    for (const key in trainingNodes) {
        const node = trainingNodes[key];
        const gain = node.baseGain * Math.pow(node.gainScaling, node.level);

        if (node.type === "physical") strengthGain += gain;
        if (node.type === "spiritual") cursedEnergyGain += gain;
    }

    return {
        strengthGain,
        cursedEnergyGain
    };
}

// =========================
// Upgrade Logic
// =========================

function upgradeNode(nodeId, player) {
    const node = trainingNodes[nodeId];
    const cost = node.baseCost * Math.pow(node.costScaling, node.level);

    if (player.currency >= cost) {
        player.currency -= cost;
        node.level++;
    }
}
