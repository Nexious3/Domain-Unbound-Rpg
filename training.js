
// Training Nodes Definition

const trainingNodes = {

    
    // PHYSICAL TRAINING NODES
    

    shadowBoxing: {
        id: "shadowBoxing",
        type: "physical",
        level: 0,
        baseGain: 0.5,        // Strength/sec
        gainScaling: 1.15,
        baseCost: 10,
        costScaling: 1.25
    },

    weightLift: {
        id: "weightLift",
        type: "physical",
        level: 0,
        baseGain: 1.2,        // Strength/sec
        gainScaling: 1.18,
        baseCost: 25,
        costScaling: 1.30
    },


    // SPIRITUAL TRAINING NODES


    meditation: {
        id: "meditation",
        type: "spiritual",
        level: 0,
        baseGain: 0.3,        // Cursed Energy/sec
        gainScaling: 1.20,
        baseCost: 15,
        costScaling: 1.30
    },

    emotionControl: {
        id: "emotionControl",
        type: "spiritual",
        level: 0,
        baseGain: 0.9,        // Cursed Energy/sec
        gainScaling: 1.22,
        baseCost: 40,
        costScaling: 1.35
    }
};


// Passive Gain Engine (EXTENDED)


function calculatePassiveGains() {
    let strengthGain = 0;
    let agilityGain = 0;
    let cursedEnergyGain = 0;

    for (const key in trainingNodes) {
        const node = trainingNodes[key];

        // Формула за gain
        const gain = node.baseGain * Math.pow(node.gainScaling, node.level);

        // Автоматично разпределяне по тип
        switch (node.type) {
            case "physical":
                strengthGain += gain;
                agilityGain += gain * 0.4;   // 40% от физическите тренировки дават Agility
                break;

            case "spiritual":
                cursedEnergyGain += gain;
                break;

            default:
                console.warn("Unknown training node type:", node.type);
        }
    }

    return {
        strengthGain,
        agilityGain,
        cursedEnergyGain
    };
}


// Upgrade Logic (EXTENDED)

function upgradeNode(nodeId, player) {
    const node = trainingNodes[nodeId];

    if (!node) {
        console.warn("Unknown training node:", nodeId);
        return;
    }

    // Цена на следващото ниво
    const cost = node.baseCost * Math.pow(node.costScaling, node.level);

    // Проверка дали играчът има ресурсите
    if (player.currency < cost) {
        console.warn("Not enough currency to upgrade:", nodeId);
        return;
    }

    // Плащане
    player.currency -= cost;

    // Качване на ниво
    node.level++;

    // Автоматично изчисляване на новия gain
    node.currentGain = node.baseGain * Math.pow(node.gainScaling, node.level);

    // Автоматично изчисляване на новата цена
    node.nextCost = node.baseCost * Math.pow(node.costScaling, node.level);

    console.log(`Upgraded ${nodeId} to level ${node.level}`);
}