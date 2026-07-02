class CoreState {
    constructor() {
        
        this.grade = 4;                 
        this.level = 1;
        this.exp = 0;

      
        this.attackPower = 5;
        this.maxHp = 100;
        this.currentHp = this.maxHp;

        
        this.cursedEnergy = 0;
        this.maxCursedEnergy = 100;

        
        this.money = 0;

        
        this.rebirthCount = 0;
        this.prestigeMultiplier = 1;

        
        this.lastTick = Date.now();

        // Auto-load saved data
        this.load();
    }

    
    tick() {
        const now = Date.now();
        const seconds = (now - this.lastTick) / 1000;

        if (seconds >= 1) {
            this.generateCursedEnergy(seconds);
            this.lastTick = now;
            this.save();
        }
    }

   
    generateCursedEnergy(seconds) {
        const gain =
            seconds *
            (this.level * 2 + this.grade) *
            this.prestigeMultiplier;

        this.cursedEnergy = Math.min(
            this.cursedEnergy + gain,
            this.maxCursedEnergy
        );
    }

    
    save() {
        const data = {
            grade: this.grade,
            level: this.level,
            exp: this.exp,
            attackPower: this.attackPower,
            maxHp: this.maxHp,
            currentHp: this.currentHp,
            cursedEnergy: this.cursedEnergy,
            maxCursedEnergy: this.maxCursedEnergy,
            money: this.money,
            rebirthCount: this.rebirthCount,
            prestigeMultiplier: this.prestigeMultiplier
        };

        localStorage.setItem("globalGameState", JSON.stringify(data));
    }

    load() {
        const saved = localStorage.getItem("globalGameState");
        if (!saved) return;

        const data = JSON.parse(saved);

        this.grade = data.grade;
        this.level = data.level;
        this.exp = data.exp;
        this.attackPower = data.attackPower;
        this.maxHp = data.maxHp;
        this.currentHp = data.currentHp;
        this.cursedEnergy = data.cursedEnergy;
        this.maxCursedEnergy = data.maxCursedEnergy;
        this.money = data.money;
        this.rebirthCount = data.rebirthCount;
        this.prestigeMultiplier = data.prestigeMultiplier;
    }
}

// Create global game state
window.globalGameState = new CoreState();

// Export class for other modules
export { CoreState };
