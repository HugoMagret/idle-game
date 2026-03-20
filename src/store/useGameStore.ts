import { create } from "zustand";

const SAVE_KEY = "marvel-idle-v4";
const OFFLINE_CAP_SECONDS = 12 * 60 * 60;
export const PRESTIGE_THRESHOLD = 1_000_000_000_000;

interface GameState {
  energie: number;
  energieTotale: number;
  gemmesTemporelles: number;

  rawPerSecond: number;
  rawClickPower: number;
  globalMultiplier: number;
  clickMultiplier: number;
  prestigeMultiplier: number;

  buildShield: number;
  buildKamar: number;
  buildStark: number;
  buildAsgard: number;
  buildWakanda: number;
  buildXmansion: number;
  buildBaxter: number;
  buildKnowhere: number;
  buildSakaar: number;
  buildNidavellir: number;

  upgradesOwned: string[];
  herosRecrutes: string[];

  bossNiveau: number;
  bossPv: number;
  bossPvMax: number;

  lastSavedAt: number;

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
  xmansion: { name: "Institut Xavier", desc: "Amplification télépathique.", baseCost: 1500000, baseProd: 1400 },
  baxter: { name: "Baxter Building", desc: "Recherche interdimensionnelle.", baseCost: 18000000, baseProd: 8500 },
  knowhere: { name: "Station Knowhere", desc: "Réseau commercial galactique.", baseCost: 250000000, baseProd: 55000 },
  sakaar: { name: "Arènes de Sakaar", desc: "Énergie de combat brute.", baseCost: 3500000000, baseProd: 400000 },
  nidavellir: { name: "Étoile de Nidavellir", desc: "Fusion cosmique absolue.", baseCost: 50000000000, baseProd: 3500000 },
};

export const UPGRADES_DATA = [
  { id: "eco_1", name: "Gants Renforcés", desc: "Le clic produit x2.", cost: 100, type: "click", multiplier: 2, reqBuild: "shield", reqCount: 1 },
  { id: "eco_2", name: "Communication S.H.I.E.L.D.", desc: "Agents x2.", cost: 500, type: "building", target: "shield", multiplier: 2, reqBuild: "shield", reqCount: 10 },
  { id: "eco_3", name: "Anneau de Fronde", desc: "Sorciers x2.", cost: 5000, type: "building", target: "kamar", multiplier: 2, reqBuild: "kamar", reqCount: 5 },
  { id: "eco_4", name: "I.A. J.A.R.V.I.S.", desc: "Réacteurs x2.", cost: 50000, type: "building", target: "stark", multiplier: 2, reqBuild: "stark", reqCount: 5 },
  { id: "eco_5", name: "Uru Raffiné", desc: "Forges x2.", cost: 250000, type: "building", target: "asgard", multiplier: 2, reqBuild: "asgard", reqCount: 5 },
  { id: "eco_6", name: "Sceptre de Loki", desc: "Production globale +10%.", cost: 1000000, type: "global", multiplier: 1.1, reqBuild: "asgard", reqCount: 10 },
  { id: "eco_7", name: "Armure Mark V", desc: "Le clic produit x3.", cost: 2500000, type: "click", multiplier: 3, reqBuild: "stark", reqCount: 15 },
  { id: "eco_8", name: "Herbe Cœur", desc: "Mines x2.", cost: 5000000, type: "building", target: "wakanda", multiplier: 2, reqBuild: "wakanda", reqCount: 5 },
  { id: "eco_9", name: "Cerebro", desc: "Institut x2.", cost: 45000000, type: "building", target: "xmansion", multiplier: 2, reqBuild: "xmansion", reqCount: 5 },
  { id: "eco_10", name: "Portail Fantastique", desc: "Baxter x2.", cost: 300000000, type: "building", target: "baxter", multiplier: 2, reqBuild: "baxter", reqCount: 5 },
  { id: "eco_11", name: "Marché Noir", desc: "Knowhere x2.", cost: 2000000000, type: "building", target: "knowhere", multiplier: 2, reqBuild: "knowhere", reqCount: 5 },
  { id: "eco_12", name: "Champion de Sakaar", desc: "Arènes x2.", cost: 15000000000, type: "building", target: "sakaar", multiplier: 2, reqBuild: "sakaar", reqCount: 5 },
  { id: "eco_13", name: "Moule d'Uru", desc: "Nidavellir x2.", cost: 250000000000, type: "building", target: "nidavellir", multiplier: 2, reqBuild: "nidavellir", reqCount: 5 },
  { id: "eco_14", name: "Tesseract", desc: "Production globale x2.", cost: 500000000, type: "global", multiplier: 2, reqBuild: "xmansion", reqCount: 15 },
  { id: "eco_15", name: "Aether", desc: "Production globale x2.", cost: 10000000000, type: "global", multiplier: 2, reqBuild: "knowhere", reqCount: 10 },
];

export const HEROES_DATA = [
  { id: "daredevil", name: "Daredevil", desc: "Sens radar. Puissance: 2", cost: 250, power: 2 },
  { id: "cap", name: "Captain America", desc: "Stratège. Puissance: 8", cost: 1000, power: 8 },
  { id: "bw", name: "Black Widow", desc: "Infiltration. Puissance: 15", cost: 3500, power: 15 },
  { id: "wolverine", name: "Wolverine", desc: "Régénération. Puissance: 35", cost: 12000, power: 35 },
  { id: "im", name: "Iron Man", desc: "Artillerie lourde. Puissance: 80", cost: 45000, power: 80 },
  { id: "spidey", name: "Spider-Man", desc: "Agilité. Puissance: 150", cost: 150000, power: 150 },
  { id: "bp", name: "Black Panther", desc: "Technologie Wakandaise. Puissance: 300", cost: 400000, power: 300 },
  { id: "hulk", name: "Hulk", desc: "Force brute. Puissance: 750", cost: 1200000, power: 750 },
  { id: "thor", name: "Thor", desc: "Dieu du tonnerre. Puissance: 2000", cost: 4500000, power: 2000 },
  { id: "strange", name: "Dr. Strange", desc: "Arts mystiques. Puissance: 5000", cost: 15000000, power: 5000 },
  { id: "wanda", name: "Scarlet Witch", desc: "Magie du chaos. Puissance: 12000", cost: 50000000, power: 12000 },
  { id: "starlord", name: "Star-Lord", desc: "Tacticien galactique. Puissance: 25000", cost: 150000000, power: 25000 },
  { id: "captainmarvel", name: "Captain Marvel", desc: "Énergie cosmique. Puissance: 60000", cost: 500000000, power: 60000 },
  { id: "silver", name: "Silver Surfer", desc: "Pouvoir cosmique. Puissance: 150000", cost: 2000000000, power: 150000 },
];

export const VILLAINS_LIST = [
  "Kingpin", "Red Skull", "Killmonger", "Loki", "Green Goblin", 
  "Doc Ock", "Ronan", "Hela", "Ultron", "Magneto", 
  "Apocalypse", "Kang le Conquérant", "Dormammu", "Thanos", "Galactus"
];

const getBuildingCost = (baseCost: number, count: number) => Math.ceil(baseCost * Math.pow(1.15, count));
const getBossMaxPv = (level: number) => Math.floor(1000 * Math.pow(1.6, level - 1));

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
  buildXmansion: 0,
  buildBaxter: 0,
  buildKnowhere: 0,
  buildSakaar: 0,
  buildNidavellir: 0,
  upgradesOwned: [],
  herosRecrutes: [],
  bossNiveau: 1,
  bossPv: 1000,
  bossPvMax: 1000,
  lastSavedAt: Date.now(),
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  getFinalPerSecond: () => get().rawPerSecond * get().globalMultiplier * get().prestigeMultiplier,
  getFinalClickPower: () => get().rawClickPower * get().clickMultiplier * get().prestigeMultiplier,
  
  getCombatPower: () => {
    let power = 1;
    get().herosRecrutes.forEach(hId => {
      const hero = HEROES_DATA.find(h => h.id === hId);
      if (hero) power += hero.power;
    });
    return power;
  },

  generateByClick: () => {
    const power = get().getFinalClickPower();
    set((state) => ({
      energie: state.energie + power,
      energieTotale: state.energieTotale + power,
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
      energie: state.energie - currentCost,
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
      energie: state.energie - data.cost,
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
      energie: state.energie - hero.cost,
      herosRecrutes: [...state.herosRecrutes, heroId],
    });
  },

  attackBoss: () => {
    const state = get();
    const power = state.getCombatPower();
    let newPv = state.bossPv - power;

    if (newPv <= 0) {
      const nextLevel = state.bossNiveau + 1;
      const nextMaxPv = getBossMaxPv(nextLevel);
      const reward = 250 * Math.pow(1.8, state.bossNiveau - 1);
      
      set({
        bossNiveau: nextLevel,
        bossPv: nextMaxPv,
        bossPvMax: nextMaxPv,
        energie: state.energie + reward,
        energieTotale: state.energieTotale + reward,
      });
    } else {
      set({ bossPv: newPv });
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
      prestigeMultiplier: 1 + finalGemmes * 0.01,
      energieTotale: finalGemmes * 1_000_000,
      energie: finalGemmes * 1_000_000,
    });
    get().save();
  },

  tick: (deltaSeconds) => {
    const state = get();
    const gain = state.getFinalPerSecond() * deltaSeconds;
    const combatDegats = state.getCombatPower() * deltaSeconds;
    
    let newPv = state.bossPv - combatDegats;
    let nextLevel = state.bossNiveau;
    let nextMaxPv = state.bossPvMax;
    let currentEnergie = state.energie + gain;
    let currentTotale = state.energieTotale + gain;

    // Résolution itérative des niveaux passés en arrière-plan
    let maxIterations = 500;
    while (newPv <= 0 && maxIterations > 0) {
      nextLevel += 1;
      nextMaxPv = getBossMaxPv(nextLevel);
      newPv += nextMaxPv;
      
      const reward = 250 * Math.pow(1.8, nextLevel - 2);
      currentEnergie += reward;
      currentTotale += reward;
      
      maxIterations--;
    }

    // Sécurité anticrash en cas d'absence prolongée avec DPS très élevé
    if (newPv <= 0) {
      newPv = nextMaxPv;
    }

    set({
      energie: currentEnergie,
      energieTotale: currentTotale,
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
    
    // Le calcul hors-ligne est désormais supporté par l'absence de plafond dans requestAnimationFrame. 
    // On conserve un calcul de base si le navigateur a vidé le cache mémoire de l'onglet.
    const elapsed = Math.min(OFFLINE_CAP_SECONDS, Math.max(0, (Date.now() - merged.lastSavedAt) / 1000));
    const offlineGain = merged.rawPerSecond * merged.globalMultiplier * merged.prestigeMultiplier * elapsed;
    
    set({
      ...merged,
      energie: merged.energie + offlineGain,
      energieTotale: merged.energieTotale + offlineGain,
      lastSavedAt: Date.now(),
    });
  },

  hardReset: () => {
    localStorage.removeItem(SAVE_KEY);
    set(initialState);
  },
}));