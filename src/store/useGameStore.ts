import { create } from "zustand";

const SAVE_KEY = "chroniques-astrales-save-v2";
const OFFLINE_CAP_SECONDS = 12 * 60 * 60;

export const ASCENSION_THRESHOLD = 1_000_000_000_000;

export interface GameState {
  essence: number;
  totalEssence: number;
  larmesHorizon: number;

  perSecond: number;
  clickPower: number;
  perSecondMultiplier: number;

  buildingAdepts: number;
  buildingShrines: number;
  buildingCondensers: number;
  buildingAltars: number;
  buildingRifts: number;
  buildingForges: number;

  lastSavedAt: number;

  gatherByHand: () => void;
  buyBuilding: (buildingId: string) => void;
  prestigeAscension: () => void;
  tick: (deltaSeconds: number) => void;
  save: () => void;
  load: () => void;
  hardReset: () => void;
}

export const BUILDINGS_DATA: Record<string, { name: string; desc: string; baseCost: number; baseProd: number }> = {
  adepts: { name: "Adeptes Silencieux", desc: "Meditent pour canaliser l'essence.", baseCost: 15, baseProd: 0.1 },
  shrines: { name: "Sanctuaires Lumineux", desc: "Monolithes de cristal focalisant la lumiere stellaire.", baseCost: 100, baseProd: 1 },
  condensers: { name: "Condensateurs Etherees", desc: "Puisent directement dans le plan astral.", baseCost: 1100, baseProd: 8 },
  altars: { name: "Autels Sacrificiels", desc: "Convertissent la devotion en puissance pure.", baseCost: 12000, baseProd: 47 },
  rifts: { name: "Failles Cosmiques", desc: "Dechirent la realite pour laisser fuir l'essence.", baseCost: 130000, baseProd: 260 },
  forges: { name: "Forges Stellaires", desc: "Creent de la matiere astrale a partir du neant.", baseCost: 1400000, baseProd: 1400 },
};

const getBuildingCost = (baseCost: number, count: number) => Math.ceil(baseCost * Math.pow(1.15, count));
const toFixed2 = (v: number) => Math.round(v * 100) / 100;

const initialState = {
  essence: 0,
  totalEssence: 0,
  larmesHorizon: 0,
  perSecond: 0,
  clickPower: 1,
  perSecondMultiplier: 1,
  buildingAdepts: 0,
  buildingShrines: 0,
  buildingCondensers: 0,
  buildingAltars: 0,
  buildingRifts: 0,
  buildingForges: 0,
  lastSavedAt: Date.now(),
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  gatherByHand: () => {
    const { clickPower } = get();
    set((state) => ({
      essence: toFixed2(state.essence + clickPower),
      totalEssence: toFixed2(state.totalEssence + clickPower),
    }));
  },

  buyBuilding: (buildingId) => {
    const data = BUILDINGS_DATA[buildingId];
    if (!data) return;

    const state = get();
    const countKey = `building${buildingId.charAt(0).toUpperCase() + buildingId.slice(1)}` as keyof GameState;
    const currentCount = state[countKey] as number;
    const currentCost = getBuildingCost(data.baseCost, currentCount);

    if (state.essence < currentCost) return;

    let newRawProduction = 0;
    Object.keys(BUILDINGS_DATA).forEach((key) => {
      const bData = BUILDINGS_DATA[key];
      const dynamicState = get() as unknown as Record<string, number>;
      const count =
        dynamicState[`building${key.charAt(0).toUpperCase() + key.slice(1)}`] +
        (key === buildingId ? 1 : 0);
      newRawProduction += bData.baseProd * count;
    });

    set((prevState) => ({
      essence: toFixed2(prevState.essence - currentCost),
      [countKey]: currentCount + 1,
      perSecond: toFixed2(newRawProduction * prevState.perSecondMultiplier),
    }) as Partial<GameState>);
  },

  prestigeAscension: () => {
    const { totalEssence, larmesHorizon } = get();
    if (totalEssence < ASCENSION_THRESHOLD) return;

    const totalLarmesToGet = Math.floor(Math.sqrt(totalEssence / 1_000_000_000_000));
    const newLarmesWon = totalLarmesToGet - larmesHorizon;

    if (newLarmesWon <= 0) return;

    const finalLarmes = larmesHorizon + newLarmesWon;
    const newMultiplier = 1 + finalLarmes * 0.01;

    set({
      ...initialState,
      larmesHorizon: finalLarmes,
      perSecondMultiplier: toFixed2(newMultiplier),
      totalEssence: finalLarmes * 1_000_000_000,
    });

    get().save();
  },

  tick: (deltaSeconds) => {
    const { perSecond } = get();
    if (perSecond <= 0) return;
    const gain = perSecond * deltaSeconds;
    set((state) => ({
      essence: toFixed2(state.essence + gain),
      totalEssence: toFixed2(state.totalEssence + gain),
    }));
  },

  save: () => {
    const state = get();
    const { save, load, tick, hardReset, gatherByHand, buyBuilding, prestigeAscension, ...snapshot } = state;
    const payload = { ...snapshot, lastSavedAt: Date.now() };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  },

  load: () => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);

      const merged = { ...initialState, ...parsed };

      const elapsedSeconds = Math.min(
        OFFLINE_CAP_SECONDS,
        Math.max(0, (Date.now() - merged.lastSavedAt) / 1000)
      );

      const offlineGain = merged.perSecond * elapsedSeconds;

      set({
        ...merged,
        essence: toFixed2(merged.essence + offlineGain),
        totalEssence: toFixed2(merged.totalEssence + offlineGain),
        lastSavedAt: Date.now(),
      });
    } catch (e) {
      console.error("Failed to load save", e);
    }
  },

  hardReset: () => {
    localStorage.removeItem(SAVE_KEY);
    set(initialState);
  },
}));
