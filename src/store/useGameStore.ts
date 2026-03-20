import { create } from "zustand";

const SAVE_KEY = "marvel-idle-v3";
const OFFLINE_CAP_SECONDS = 12 * 60 * 60;
export const PRESTIGE_THRESHOLD = 1_000_000_000_000;
export const toFixed2 = (v: number) => Math.round(v * 100) / 100;

interface GameState {
  // Économie
  energie: number;
  energieTotale: number;
  gemmesTemporelles: number;

  rawPerSecond: number;
  rawClickPower: number;
  globalMultiplier: number;
  clickMultiplier: number;
  prestigeMultiplier: number;

  // Bâtiments (Infrastructures)
  buildShield: number;
  buildKamar: number;
  buildStark: number;
  buildAsgard: number;
  buildWakanda: number;

  // Tableaux de déblocages
  upgradesOwned: string[];
  herosRecrutes: string[]; // Nouveauté : Héros uniques pour le combat

  // Combat (Boss)
  bossNiveau: number;
  bossPv: number;
  bossPvMax: number;

  lastSavedAt: number;

  // Actions
  generateByClick: () => void;
  buyBuilding: (buildingId: string) => void;
  buyUpgrade: (upgradeId: string) => void;
  buyHero: (heroId: string) => void;
  attackBoss: () => void;
  performPrestige: () => void;
  tick: (deltaSeconds: number) => void;
  save: () => void;
  load: () => void;
  hardReset: () => void;

  getFinalPerSecond: () => number;
  getFinalClickPower: () => number;
  getCombatPower: () => number;
}

export const BUILDINGS_DATA: Record<string, { name: string; desc: string; baseCost: number; baseProd: number }> = {
  shield: { name: "Agents du S.H.I.E.L.D.", desc: "Collecte de base sur le terrain.", baseCost: 15, baseProd: 0.1 },
  kamar: { name: "Sorciers de Kamar-Taj", desc: "Canalisent l'énergie mystique.", baseCost: 100, baseProd: 1 },
  stark: { name: "Réacteurs Stark", desc: "Génération d'énergie propre.", baseCost: 1100, baseProd: 8 },
  asgard: { name: "Forges d'Asgard", desc: "Utilisent la puissance stellaire.", baseCost: 12000, baseProd: 47 },
  wakanda: { name: "Mines de Vibranium", desc: "Extraction à haut rendement.", baseCost: 130000, baseProd: 260 },
};

// Améliorations économiques plus compréhensibles
export const UPGRADES_DATA = [
  { id: "eco_1", name: "Gants Renforcés", desc: "Le clic produit x2.", cost: 100, type: "click", multiplier: 2, reqBuild: "shield", reqCount: 1 },
  { id: "eco_2", name: "Communication S.H.I.E.L.D.", desc: "Agents x2.", cost: 500, type: "building", target: "shield", multiplier: 2, reqBuild: "shield", reqCount: 10 },
  { id: "eco_3", name: "Anneau de Fronde", desc: "Sorciers x2.", cost: 5000, type: "building", target: "kamar", multiplier: 2, reqBuild: "kamar", reqCount: 5 },
  { id: "eco_4", name: "I.A. J.A.R.V.I.S.", desc: "Réacteurs x2.", cost: 50000, type: "building", target: "stark", multiplier: 2, reqBuild: "stark", reqCount: 5 },
  { id: "eco_5", name: "Uru Raffiné", desc: "Forges x2.", cost: 250000, type: "building", target: "asgard", multiplier: 2, reqBuild: "asgard", reqCount: 5 },
  { id: "eco_6", name: "Sceptre de Loki", desc: "Production globale +10%.", cost: 1000000, type: "global", multiplier: 1.1, reqBuild: "asgard", reqCount: 10 },
];

// Héros pour le système de Boss (Achat unique)
export const HEROES_DATA = [
  { id: "cap", name: "Captain America", desc: "Stratège. Puissance: 5", cost: 500, power: 5 },
  { id: "bw", name: "Black Widow", desc: "Infiltration. Puissance: 15", cost: 2500, power: 15 },
  { id: "im", name: "Iron Man", desc: "Artillerie lourde. Puissance: 50", cost: 10000, power: 50 },
  { id: "spidey", name: "Spider-Man", desc: "Agilité. Puissance: 120", cost: 45000, power: 120 },
  { id: "hulk", name: "Hulk", desc: "Force brute. Puissance: 400", cost: 200000, power: 400 },
  { id: "thor", name: "Thor", desc: "Dieu du tonnerre. Puissance: 1500", cost: 1000000, power: 1500 },
];

const getBuildingCost = (baseCost: number, count: number) => Math.ceil(baseCost * Math.pow(1.15, count));
const getBossMaxPv = (level: number) => Math.floor(100 * Math.pow(1.4, level - 1));

const initialState = {
  energie: 0,
  energieTotale: 0,
  gemmesTemporelles: 0,
  rawPerSecond: 0,
  rawClickPower: 1,
  globalMultiplier: 1,
  clickMultiplier: 1,
  prestigeMultiplier: 1,
  buildShield: 0,
  buildKamar: 0,
  buildStark: 0,
  buildAsgard: 0,
  buildWakanda: 0,
  upgradesOwned: [],
  herosRecrutes: [],
  bossNiveau: 1,
  bossPv: 100,
  bossPvMax: 100,
  lastSavedAt: Date.now(),
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  getFinalPerSecond: () => toFixed2(get().rawPerSecond * get().globalMultiplier * get().prestigeMultiplier),
  getFinalClickPower: () => toFixed2(get().rawClickPower * get().clickMultiplier * get().prestigeMultiplier),
  
  getCombatPower: () => {
    let power = 1; // Base de 1
    get().herosRecrutes.forEach(hId => {
      const hero = HEROES_DATA.find(h => h.id === hId);
      if (hero) power += hero.power;
    });
    return power;
  },

  generateByClick: () => {
    const power = get().getFinalClickPower();
    set((state) => ({
      energie: toFixed2(state.energie + power),
      energieTotale: toFixed2(state.energieTotale + power),
    }));
  },

  buyBuilding: (buildingId) => {
    const data = BUILDINGS_DATA[buildingId];
    if (!data) return;
    const state = get();
    const countKey = `build${buildingId.charAt(0).toUpperCase() + buildingId.slice(1)}` as keyof GameState;
    const currentCount = state[countKey] as number;
    const currentCost = getBuildingCost(data.baseCost, currentCount);

    if (state.energie < currentCost) return;

    let newRawProduction = 0;
    Object.keys(BUILDINGS_DATA).forEach((key) => {
      const bData = BUILDINGS_DATA[key];
      const count = (get() as any)[`build${key.charAt(0).toUpperCase() + key.slice(1)}`] + (key === buildingId ? 1 : 0);
      let bMultiplier = 1;
      state.upgradesOwned.forEach(upId => {
        const upData = UPGRADES_DATA.find(u => u.id === upId);
        if (upData && upData.type === "building" && upData.target === key) bMultiplier *= upData.multiplier;
      });
      newRawProduction += (bData.baseProd * count) * bMultiplier;
    });

    set((state) => ({
      energie: toFixed2(state.energie - currentCost),
      [countKey]: currentCount + 1,
      rawPerSecond: newRawProduction,
    }));
  },

  buyUpgrade: (upgradeId) => {
    const data = UPGRADES_DATA.find(u => u.id === upgradeId);
    const state = get();
    if (!data || state.energie < data.cost || state.upgradesOwned.includes(upgradeId)) return;

    const newUpgradesOwned = [...state.upgradesOwned, upgradeId];
    let newRawPerSecond = 0;
    let newClickMultiplier = 1;
    let newGlobalMultiplier = 1;

    newUpgradesOwned.forEach(upId => {
      const up = UPGRADES_DATA.find(u => u.id === upId);
      if (!up) return;
      if (up.type === "click") newClickMultiplier *= up.multiplier;
      if (up.type === "global") newGlobalMultiplier *= up.multiplier;
    });

    Object.keys(BUILDINGS_DATA).forEach((key) => {
      const bData = BUILDINGS_DATA[key];
      const count = (get() as any)[`build${key.charAt(0).toUpperCase() + key.slice(1)}`];
      let bMultiplier = 1;
      newUpgradesOwned.forEach(upId => {
        const up = UPGRADES_DATA.find(u => u.id === upId);
        if (up && up.type === "building" && up.target === key) bMultiplier *= up.multiplier;
      });
      newRawPerSecond += (bData.baseProd * count) * bMultiplier;
    });

    set({
      energie: toFixed2(state.energie - data.cost),
      upgradesOwned: newUpgradesOwned,
      rawPerSecond: newRawPerSecond,
      clickMultiplier: newClickMultiplier,
      globalMultiplier: newGlobalMultiplier,
    });
  },

  buyHero: (heroId) => {
    const hero = HEROES_DATA.find(h => h.id === heroId);
    const state = get();
    if (!hero || state.energie < hero.cost || state.herosRecrutes.includes(heroId)) return;

    set({
      energie: toFixed2(state.energie - hero.cost),
      herosRecrutes: [...state.herosRecrutes, heroId],
    });
  },

  attackBoss: () => {
    const state = get();
    const power = state.getCombatPower();
    let newPv = state.bossPv - power;

    if (newPv <= 0) {
      // Boss vaincu : récompense en énergie + niveau suivant
      const nextLevel = state.bossNiveau + 1;
      const nextMaxPv = getBossMaxPv(nextLevel);
      const reward = toFixed2(50 * Math.pow(1.5, state.bossNiveau - 1));
      
      set({
        bossNiveau: nextLevel,
        bossPv: nextMaxPv,
        bossPvMax: nextMaxPv,
        energie: toFixed2(state.energie + reward),
        energieTotale: toFixed2(state.energieTotale + reward),
      });
    } else {
      set({ bossPv: toFixed2(newPv) });
    }
  },

  performPrestige: () => {
    const state = get();
    if (state.energieTotale < PRESTIGE_THRESHOLD) return;

    const totalGemmesToGet = Math.floor(Math.sqrt(state.energieTotale / 1_000_000_000_000));
    const newGemmes = totalGemmesToGet - state.gemmesTemporelles;
    if (newGemmes <= 0) return;

    const finalGemmes = state.gemmesTemporelles + newGemmes;
    set({
      ...initialState,
      gemmesTemporelles: finalGemmes,
      prestigeMultiplier: toFixed2(1 + finalGemmes * 0.01),
      energieTotale: finalGemmes * 1_000_000,
      energie: finalGemmes * 1_000_000,
    });
    get().save();
  },

  tick: (deltaSeconds) => {
    const state = get();
    const gain = state.getFinalPerSecond() * deltaSeconds;
    
    // Le boss subit des dégâts automatiques par seconde basés sur la puissance de combat
    let newPv = state.bossPv - (state.getCombatPower() * deltaSeconds);
    let nextLevel = state.bossNiveau;
    let nextMaxPv = state.bossPvMax;
    let currentEnergie = state.energie + gain;
    let currentTotale = state.energieTotale + gain;

    if (newPv <= 0) {
      nextLevel += 1;
      nextMaxPv = getBossMaxPv(nextLevel);
      newPv = nextMaxPv;
      const reward = 50 * Math.pow(1.5, state.bossNiveau - 1);
      currentEnergie += reward;
      currentTotale += reward;
    }

    set({
      energie: toFixed2(currentEnergie),
      energieTotale: toFixed2(currentTotale),
      bossPv: newPv,
      bossNiveau: nextLevel,
      bossPvMax: nextMaxPv
    });
  },

  save: () => {
    const state = get();
    const { save, load, tick, hardReset, generateByClick, buyBuilding, buyUpgrade, buyHero, attackBoss, performPrestige, getFinalClickPower, getFinalPerSecond, getCombatPower, ...snapshot } = state;
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...snapshot, lastSavedAt: Date.now() }));
  },

  load: () => {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const merged = { ...initialState, ...parsed };
    const elapsed = Math.min(OFFLINE_CAP_SECONDS, Math.max(0, (Date.now() - merged.lastSavedAt) / 1000));
    const offlineGain = merged.rawPerSecond * merged.globalMultiplier * merged.prestigeMultiplier * elapsed;
    
    set({
      ...merged,
      energie: toFixed2(merged.energie + offlineGain),
      energieTotale: toFixed2(merged.energieTotale + offlineGain),
      lastSavedAt: Date.now(),
    });
  },

  hardReset: () => {
    localStorage.removeItem(SAVE_KEY);
    set(initialState);
  },
}));