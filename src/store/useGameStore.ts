import { create } from "zustand";

const SAVE_KEY = "multiverse-crisis-save-v1";
const OFFLINE_CAP_SECONDS = 12 * 60 * 60;

export const PRESTIGE_THRESHOLD = 1_000_000_000_000;
export const toFixed2 = (v: number) => Math.round(v * 100) / 100;

export type BuildingId = "street" | "mutants" | "vanguard" | "rangers" | "cosmic" | "titans";
type UpgradeType = "click" | "building" | "global";

export interface GameState {
  iso8: number;
  totalIso8: number;
  crystauxRealite: number;

  rawPerSecond: number;
  rawClickPower: number;

  globalMultiplier: number;
  clickMultiplier: number;
  prestigeMultiplier: number;

  buildStreet: number;
  buildMutants: number;
  buildVanguard: number;
  buildRangers: number;
  buildCosmic: number;
  buildTitans: number;

  upgradesOwned: string[];

  lastSavedAt: number;

  generateByClick: () => void;
  buyBuilding: (buildingId: string) => void;
  buyUpgrade: (upgradeId: string) => void;
  performPrestige: () => void;
  tick: (deltaSeconds: number) => void;
  save: () => void;
  load: () => void;
  hardReset: () => void;

  getFinalPerSecond: () => number;
  getFinalClickPower: () => number;
}

export const BUILDINGS_DATA: Record<BuildingId, { name: string; desc: string; baseCost: number; baseProd: number }> = {
  street: { name: "Escouades Urbaines", desc: "Interviennent dans les zones denses.", baseCost: 15, baseProd: 0.1 },
  mutants: { name: "Cellules Mutantes", desc: "Talents rares, impact strategique.", baseCost: 100, baseProd: 1 },
  vanguard: { name: "Force Vanguard", desc: "Equipe de frappe polyvalente.", baseCost: 1100, baseProd: 8 },
  rangers: { name: "Rangers Stellaires", desc: "Operations inter-secteurs.", baseCost: 12000, baseProd: 47 },
  cosmic: { name: "Noyaux Cosmiques", desc: "Canalisent la pression du vide.", baseCost: 130000, baseProd: 260 },
  titans: { name: "Titans Primordiaux", desc: "Production a echelle civilisationnelle.", baseCost: 1400000, baseProd: 1400 },
};

export interface UpgradeData {
  id: string;
  name: string;
  desc: string;
  cost: number;
  type: UpgradeType;
  targetBuildingId?: BuildingId;
  multiplier: number;
  requiredBuildingId?: BuildingId;
  requiredBuildingCount?: number;
}

export const UPGRADES_DATA: UpgradeData[] = [
  { id: "click_1", name: "Gants Kinetiques", desc: "Le clic est double.", cost: 100, type: "click", multiplier: 2, requiredBuildingId: "street", requiredBuildingCount: 1 },
  { id: "click_2", name: "Interface Neuro", desc: "Le clic est double.", cost: 1000, type: "click", multiplier: 2, requiredBuildingId: "street", requiredBuildingCount: 10 },
  { id: "click_3", name: "Matrice Synapse", desc: "Le clic est triple.", cost: 25000, type: "click", multiplier: 3, requiredBuildingId: "mutants", requiredBuildingCount: 10 },
  { id: "click_4", name: "Pulse Reactor", desc: "Le clic est triple.", cost: 750000, type: "click", multiplier: 3, requiredBuildingId: "vanguard", requiredBuildingCount: 10 },
  { id: "click_5", name: "Exo-Nexus", desc: "Le clic est x4.", cost: 5000000, type: "click", multiplier: 4, requiredBuildingId: "vanguard", requiredBuildingCount: 20 },
  { id: "click_6", name: "Main du Vide", desc: "Le clic est x5.", cost: 50000000, type: "click", multiplier: 5, requiredBuildingId: "cosmic", requiredBuildingCount: 15 },

  { id: "street_1", name: "Protocole Sentinel", desc: "Escouades Urbaines x2.", cost: 500, type: "building", targetBuildingId: "street", multiplier: 2, requiredBuildingId: "street", requiredBuildingCount: 5 },
  { id: "street_2", name: "Drone Echo", desc: "Escouades Urbaines x2.", cost: 10000, type: "building", targetBuildingId: "street", multiplier: 2, requiredBuildingId: "street", requiredBuildingCount: 20 },
  { id: "street_3", name: "Relais Aegis", desc: "Escouades Urbaines x3.", cost: 250000, type: "building", targetBuildingId: "street", multiplier: 3, requiredBuildingId: "street", requiredBuildingCount: 50 },
  { id: "street_4", name: "Réseau Noctis", desc: "Escouades Urbaines x4.", cost: 2500000, type: "building", targetBuildingId: "street", multiplier: 4, requiredBuildingId: "street", requiredBuildingCount: 100 },

  { id: "mutants_1", name: "Institut Prisma", desc: "Cellules Mutantes x2.", cost: 5000, type: "building", targetBuildingId: "mutants", multiplier: 2, requiredBuildingId: "mutants", requiredBuildingCount: 5 },
  { id: "mutants_2", name: "Gene Forge", desc: "Cellules Mutantes x2.", cost: 75000, type: "building", targetBuildingId: "mutants", multiplier: 2, requiredBuildingId: "mutants", requiredBuildingCount: 15 },
  { id: "mutants_3", name: "Nexus Chroma", desc: "Cellules Mutantes x3.", cost: 1500000, type: "building", targetBuildingId: "mutants", multiplier: 3, requiredBuildingId: "mutants", requiredBuildingCount: 40 },
  { id: "mutants_4", name: "Champ Helix", desc: "Cellules Mutantes x4.", cost: 25000000, type: "building", targetBuildingId: "mutants", multiplier: 4, requiredBuildingId: "mutants", requiredBuildingCount: 80 },

  { id: "vanguard_1", name: "Coeur Photon", desc: "Force Vanguard x2.", cost: 50000, type: "building", targetBuildingId: "vanguard", multiplier: 2, requiredBuildingId: "vanguard", requiredBuildingCount: 5 },
  { id: "vanguard_2", name: "Alliage Apex", desc: "Force Vanguard x2.", cost: 1000000, type: "building", targetBuildingId: "vanguard", multiplier: 2, requiredBuildingId: "vanguard", requiredBuildingCount: 15 },
  { id: "vanguard_3", name: "Cohesion Omega", desc: "Force Vanguard x4.", cost: 100000000, type: "building", targetBuildingId: "vanguard", multiplier: 4, requiredBuildingId: "vanguard", requiredBuildingCount: 50 },
  { id: "vanguard_4", name: "Doctrine Helios", desc: "Force Vanguard x5.", cost: 2000000000, type: "building", targetBuildingId: "vanguard", multiplier: 5, requiredBuildingId: "vanguard", requiredBuildingCount: 90 },

  { id: "rangers_1", name: "Frégate Aurora", desc: "Rangers Stellaires x2.", cost: 250000, type: "building", targetBuildingId: "rangers", multiplier: 2, requiredBuildingId: "rangers", requiredBuildingCount: 5 },
  { id: "rangers_2", name: "Balise Orion", desc: "Rangers Stellaires x2.", cost: 5000000, type: "building", targetBuildingId: "rangers", multiplier: 2, requiredBuildingId: "rangers", requiredBuildingCount: 15 },
  { id: "rangers_3", name: "Chantier Nebula", desc: "Rangers Stellaires x3.", cost: 125000000, type: "building", targetBuildingId: "rangers", multiplier: 3, requiredBuildingId: "rangers", requiredBuildingCount: 35 },
  { id: "rangers_4", name: "Portail Quasar", desc: "Rangers Stellaires x4.", cost: 2500000000, type: "building", targetBuildingId: "rangers", multiplier: 4, requiredBuildingId: "rangers", requiredBuildingCount: 70 },

  { id: "cosmic_1", name: "Canal Bifrost", desc: "Noyaux Cosmiques x2.", cost: 5000000, type: "building", targetBuildingId: "cosmic", multiplier: 2, requiredBuildingId: "cosmic", requiredBuildingCount: 5 },
  { id: "cosmic_2", name: "Particules Delta", desc: "Noyaux Cosmiques x2.", cost: 150000000, type: "building", targetBuildingId: "cosmic", multiplier: 2, requiredBuildingId: "cosmic", requiredBuildingCount: 15 },
  { id: "cosmic_3", name: "Miroir du Void", desc: "Noyaux Cosmiques x3.", cost: 3000000000, type: "building", targetBuildingId: "cosmic", multiplier: 3, requiredBuildingId: "cosmic", requiredBuildingCount: 30 },
  { id: "cosmic_4", name: "Singularite Core", desc: "Noyaux Cosmiques x5.", cost: 65000000000, type: "building", targetBuildingId: "cosmic", multiplier: 5, requiredBuildingId: "cosmic", requiredBuildingCount: 60 },

  { id: "titans_1", name: "Sceau Ancestral", desc: "Titans Primordiaux x2.", cost: 75000000, type: "building", targetBuildingId: "titans", multiplier: 2, requiredBuildingId: "titans", requiredBuildingCount: 3 },
  { id: "titans_2", name: "Creuset Absolu", desc: "Titans Primordiaux x2.", cost: 2000000000, type: "building", targetBuildingId: "titans", multiplier: 2, requiredBuildingId: "titans", requiredBuildingCount: 10 },
  { id: "titans_3", name: "Foudre Primale", desc: "Titans Primordiaux x3.", cost: 50000000000, type: "building", targetBuildingId: "titans", multiplier: 3, requiredBuildingId: "titans", requiredBuildingCount: 25 },
  { id: "titans_4", name: "Couronne Eternelle", desc: "Titans Primordiaux x5.", cost: 900000000000, type: "building", targetBuildingId: "titans", multiplier: 5, requiredBuildingId: "titans", requiredBuildingCount: 50 },

  { id: "global_1", name: "Relique Mentale", desc: "Production globale +10%.", cost: 1000000, type: "global", multiplier: 1.1 },
  { id: "global_2", name: "Noyau de Puissance", desc: "Production globale x2.", cost: 100000000, type: "global", multiplier: 2, requiredBuildingId: "vanguard", requiredBuildingCount: 20 },
  { id: "global_3", name: "Ancre Spatiale", desc: "Production globale x2.", cost: 10000000000, type: "global", multiplier: 2, requiredBuildingId: "cosmic", requiredBuildingCount: 20 },
  { id: "global_4", name: "Clef du Temps", desc: "Production globale x2.", cost: 500000000000, type: "global", multiplier: 2, requiredBuildingId: "titans", requiredBuildingCount: 20 },
  { id: "global_5", name: "Prisme de Realite", desc: "Production globale x2.", cost: 4000000000000, type: "global", multiplier: 2, requiredBuildingId: "titans", requiredBuildingCount: 40 },
  { id: "global_6", name: "Concordat Multiversel", desc: "Production globale x3.", cost: 25000000000000, type: "global", multiplier: 3, requiredBuildingId: "titans", requiredBuildingCount: 75 },
];

const UPGRADES_BY_ID: Record<string, UpgradeData> = Object.fromEntries(
  UPGRADES_DATA.map((u) => [u.id, u])
) as Record<string, UpgradeData>;

type BuildingCountKey =
  | "buildStreet"
  | "buildMutants"
  | "buildVanguard"
  | "buildRangers"
  | "buildCosmic"
  | "buildTitans";

export const BUILDING_STATE_KEYS: Record<BuildingId, BuildingCountKey> = {
  street: "buildStreet",
  mutants: "buildMutants",
  vanguard: "buildVanguard",
  rangers: "buildRangers",
  cosmic: "buildCosmic",
  titans: "buildTitans",
};

const getBuildingCost = (baseCost: number, count: number) => Math.ceil(baseCost * Math.pow(1.15, count));

type GameSnapshot = {
  iso8: number;
  totalIso8: number;
  crystauxRealite: number;
  rawPerSecond: number;
  rawClickPower: number;
  globalMultiplier: number;
  clickMultiplier: number;
  prestigeMultiplier: number;
  buildStreet: number;
  buildMutants: number;
  buildVanguard: number;
  buildRangers: number;
  buildCosmic: number;
  buildTitans: number;
  upgradesOwned: string[];
  lastSavedAt: number;
};

const initialState: GameSnapshot = {
  iso8: 0,
  totalIso8: 0,
  crystauxRealite: 0,
  rawPerSecond: 0,
  rawClickPower: 1,
  globalMultiplier: 1,
  clickMultiplier: 1,
  prestigeMultiplier: 1,
  buildStreet: 0,
  buildMutants: 0,
  buildVanguard: 0,
  buildRangers: 0,
  buildCosmic: 0,
  buildTitans: 0,
  upgradesOwned: [],
  lastSavedAt: Date.now(),
};

function getCountMap(state: GameState | GameSnapshot): Record<BuildingId, number> {
  return {
    street: state.buildStreet,
    mutants: state.buildMutants,
    vanguard: state.buildVanguard,
    rangers: state.buildRangers,
    cosmic: state.buildCosmic,
    titans: state.buildTitans,
  };
}

function isBuildingUnlocked(state: GameState | GameSnapshot, upgrade: UpgradeData): boolean {
  if (!upgrade.requiredBuildingId) return true;
  const key = BUILDING_STATE_KEYS[upgrade.requiredBuildingId];
  const count = state[key] as number;
  return count >= (upgrade.requiredBuildingCount ?? 1);
}

function getUpgradeMultipliers(ownedIds: string[]) {
  let click = 1;
  let global = 1;
  const building: Record<BuildingId, number> = {
    street: 1,
    mutants: 1,
    vanguard: 1,
    rangers: 1,
    cosmic: 1,
    titans: 1,
  };

  ownedIds.forEach((id) => {
    const up = UPGRADES_BY_ID[id];
    if (!up) return;
    if (up.type === "click") click *= up.multiplier;
    if (up.type === "global") global *= up.multiplier;
    if (up.type === "building" && up.targetBuildingId) {
      building[up.targetBuildingId] *= up.multiplier;
    }
  });

  return { click, global, building };
}

function computeRawPerSecond(counts: Record<BuildingId, number>, buildingMultipliers: Record<BuildingId, number>) {
  let raw = 0;
  (Object.keys(BUILDINGS_DATA) as BuildingId[]).forEach((id) => {
    raw += BUILDINGS_DATA[id].baseProd * counts[id] * buildingMultipliers[id];
  });
  return toFixed2(raw);
}

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  getFinalPerSecond: () => {
    const { rawPerSecond, globalMultiplier, prestigeMultiplier } = get();
    return toFixed2(rawPerSecond * globalMultiplier * prestigeMultiplier);
  },

  getFinalClickPower: () => {
    const { rawClickPower, clickMultiplier, prestigeMultiplier } = get();
    return toFixed2(rawClickPower * clickMultiplier * prestigeMultiplier);
  },

  generateByClick: () => {
    const power = get().getFinalClickPower();
    set((state) => ({
      iso8: toFixed2(state.iso8 + power),
      totalIso8: toFixed2(state.totalIso8 + power),
    }));
  },

  buyBuilding: (buildingId) => {
    if (!(buildingId in BUILDINGS_DATA)) return;
    const id = buildingId as BuildingId;

    const state = get();
    const key = BUILDING_STATE_KEYS[id];
    const currentCount = state[key] as number;
    const currentCost = getBuildingCost(BUILDINGS_DATA[id].baseCost, currentCount);

    if (state.iso8 < currentCost) return;

    const nextCounts = getCountMap(state);
    nextCounts[id] += 1;

    const multipliers = getUpgradeMultipliers(state.upgradesOwned);
    const newRawProduction = computeRawPerSecond(nextCounts, multipliers.building);

    set((prev) => ({
      iso8: toFixed2(prev.iso8 - currentCost),
      [key]: currentCount + 1,
      rawPerSecond: newRawProduction,
    }) as Partial<GameState>);
  },

  buyUpgrade: (upgradeId) => {
    const data = UPGRADES_BY_ID[upgradeId];
    if (!data) return;

    const state = get();
    if (state.upgradesOwned.includes(upgradeId)) return;
    if (!isBuildingUnlocked(state, data)) return;
    if (state.iso8 < data.cost) return;

    const newOwned = [...state.upgradesOwned, upgradeId];
    const multipliers = getUpgradeMultipliers(newOwned);
    const counts = getCountMap(state);
    const newRawProduction = computeRawPerSecond(counts, multipliers.building);

    set((prev) => ({
      iso8: toFixed2(prev.iso8 - data.cost),
      upgradesOwned: newOwned,
      rawPerSecond: newRawProduction,
      clickMultiplier: toFixed2(multipliers.click),
      globalMultiplier: toFixed2(multipliers.global),
    }));
  },

  performPrestige: () => {
    const { totalIso8, crystauxRealite } = get();
    if (totalIso8 < PRESTIGE_THRESHOLD) return;

    const totalCrystauxToGet = Math.floor(Math.sqrt(totalIso8 / 1_000_000_000_000));
    const newCrystauxWon = totalCrystauxToGet - crystauxRealite;

    if (newCrystauxWon <= 0) return;

    const finalCrystaux = crystauxRealite + newCrystauxWon;
    const newPrestigeMultiplier = 1 + finalCrystaux * 0.01;

    set({
      ...initialState,
      crystauxRealite: finalCrystaux,
      prestigeMultiplier: toFixed2(newPrestigeMultiplier),
      totalIso8: finalCrystaux * 1_000_000,
      iso8: finalCrystaux * 1_000_000,
    });

    get().save();
  },

  tick: (deltaSeconds) => {
    const finalPs = get().getFinalPerSecond();
    if (finalPs <= 0) return;
    const gain = finalPs * deltaSeconds;
    set((state) => ({
      iso8: toFixed2(state.iso8 + gain),
      totalIso8: toFixed2(state.totalIso8 + gain),
    }));
  },

  save: () => {
    const state = get();
    const {
      save,
      load,
      tick,
      hardReset,
      generateByClick,
      buyBuilding,
      buyUpgrade,
      performPrestige,
      getFinalPerSecond,
      getFinalClickPower,
      ...snapshot
    } = state;

    const payload: GameSnapshot = {
      ...(snapshot as GameSnapshot),
      lastSavedAt: Date.now(),
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  },

  load: () => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<GameSnapshot>;

      const merged: GameSnapshot = {
        ...initialState,
        ...parsed,
        upgradesOwned: Array.isArray(parsed.upgradesOwned) ? parsed.upgradesOwned : [],
        lastSavedAt: parsed.lastSavedAt ?? Date.now(),
      };

      const elapsedSeconds = Math.min(
        OFFLINE_CAP_SECONDS,
        Math.max(0, (Date.now() - merged.lastSavedAt) / 1000)
      );

      const finalPs = merged.rawPerSecond * merged.globalMultiplier * merged.prestigeMultiplier;
      const offlineGain = finalPs * elapsedSeconds;

      set({
        ...merged,
        iso8: toFixed2(merged.iso8 + offlineGain),
        totalIso8: toFixed2(merged.totalIso8 + offlineGain),
        lastSavedAt: Date.now(),
      });
    } catch (e) {
      console.error("Load fail", e);
    }
  },

  hardReset: () => {
    localStorage.removeItem(SAVE_KEY);
    set({ ...initialState, lastSavedAt: Date.now() });
  },
}));
