# Domain-Unbound-Rpg
# 🌌 Domain Unbound RPG & Simulator

Welcome to **Domain Unbound**, a turn-based, text-and-visual hybrid incremental RPG built from scratch using vanilla web technologies (HTML5, CSS3, and JavaScript). 

In this world, players train their physical and spiritual metrics, master complex cursed techniques, balance defensive barriers like **Infinity**, and expand domains to exorcise high-tier cursed spirits.

---

## 👥 The Jujutsu Sorcerer Team & Roles

This repository is managed across 6 distinct architectural branches to ensure zero code overwrites and high collaboration efficiency:

| Role | Developer | Branch Name | Primary Code Sandbox |
| :--- | :--- | :--- | :--- |
| **Owner / Core Automation** | [Player 1 Name] | `js-core-state` | `state.js` |
| **The Training Idler** | [Player 2 Name] | `js-training` | `training.js` |
| **The Combat Tactician** | [Player 3 Name] | `js-combat-mechanics` | `combat.js` |
| **The FX / Ability Specialist** | [Your Name / Player 4] | `js-cursed-techniques` | `abilities.js` |
| **The Art & Asset Curator** | [Player 5 Name] | `js-visual-assets` | `assets.js` |
| **The Interface Weaver** | [Player 6 Name] | `js-ui-render` | `app.js`, `index.html`, `style.css` |

---

## 🛠️ System Architecture

The codebase is split into modular execution layers that interact through a singular global state context (`window.gameState`). This ensures that combat engines, visual layers, and passive multiplier modules can read and execute numbers concurrently without structural conflicts.

### Execution Dependency Load Order:
1. `state.js` — Establishes variables, save files, and core timeline ticks.
2. `assets.js` — Maps entity names to graphic sprite elements and backgrounds.
3. `training.js` — Automates passive attribute increments (CE control, Strength).
4. `abilities.js` — Houses defensive barriers (Infinity mechanics) and Domain Expansions.
5. `combat.js` — Powers turn loops, win-states, and counter-attacks.
6. `app.js` — Binds calculations to DOM animations and handles layout states.

---

## 🎯 Development Guidelines
* **Branch Isolation:** No developer may push code directly to `main`.
* **The Pull Request Checkpoint:** All functional implementations require an independent code review and approval from at least 1 teammate before merging.
* **Incremental Design Rule:** Keep state logic independent from UI rendering to allow both backend math and frontend CSS animations to evolve smoothly.
