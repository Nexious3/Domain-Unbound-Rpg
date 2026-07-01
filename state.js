class CoreState{
    constructor(){
        this.grade = 1;// ранга на играча
        this.CursedEnergy = 0; //ресурсът, който се генерира всяка секунда
        this.sorcererLevel = 1; // нивото на играча

        this.rebirthCount = 0; // колко пъти е правен Prestige (Rebirth)
        this.prestigeMultiplier = 1; // постоянен бонус, който се увеличава след Prestige

        this.lastTick = Date.now(); // времето на последния tick (за да знаем колко секунди са минали)

        this.load();
    }

     tick() { // Взима текущото време
        const now = Date.now();
        const seconds = (now - this.lastTick) / 1000; // Изчислява колко секунди са минали

        if (seconds >= 1) {
            this.generateEnergy(seconds);
            this.lastTick = now; // Обновява времето на последния tick
        }
    }

    generateEnergy(seconds) { // Generira resursi i drugi nechta 
        const gain = seconds * (this.sorcererLevel * 2 + this.grade) * this.prestigeMultiplier;
        this.cursedEnergy += gain;
    }

    save() {
    const data = {
        grade: this.grade,
        cursedEnergy: this.cursedEnergy,
        sorcererLevel: this.sorcererLevel,
        rebirthCount: this.rebirthCount,
        prestigeMultiplier: this.prestigeMultiplier
    };

    localStorage.setItem("coreState", JSON.stringify(data));
    }

 load() {
    const saved = localStorage.getItem("coreState");
    if (!saved) return; // няма запис

    const data = JSON.parse(saved);

    this.grade = data.grade;
    this.cursedEnergy = data.cursedEnergy;
    this.sorcererLevel = data.sorcererLevel;
    this.rebirthCount = data.rebirthCount;
    this.prestigeMultiplier = data.prestigeMultiplier;
}

    
}

class PrestigeManager {
    static canPrestige(state) {
        return state.cursedEnergy >= 100000;
    }

    static doPrestige(state) {
        state.rebirthCount++;
        state.prestigeMultiplier += 0.25;

        state.cursedEnergy = 0;
        state.grade = 1;
        state.sorcererLevel = 1;
    }
}

class TickManager {
    constructor(state) {
        this.state = state;
    }

    start() {
        setInterval(() => {
            this.state.tick();
        }, 100);
    }
}

export { CoreState, PrestigeManager, TickManager };