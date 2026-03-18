import { create } from "zustand";
import type { GameSnapshot } from "../types/game";

const SAVE_KEY = "chroniques-astrales-save-v1";
const OFFLINE_CAP_SECONDS = 8 * 60 * 60;

interface GameState extends GameSnapshot {
  gatherByHand: () => void;
  buyWorker: () => void;
  buyRitual: () => void;
  tick: (deltaSeconds: number) => void;
  save: () => void;
  load: () => void;
  hardReset: () => void;
}

const initialState: GameSnapshot = {
  essence: 15,
  totalEssence: 15,
  perSecond: 0,
  clickPower: 1,
  clickLevel: 1,
  workerCount: 0,
  workerCost: 18,
  ritualLevel: 0,
  ritualCost: 140,
  lastSavedAt: Date.now(),
};

function toFixed2(value: number) {
  return Math.round(value * 100) / 100;
}

function safeParseSave(raw: string | null): Partial<GameSnapshot> | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<GameSnapshot>;
    return parsed;
  } catch {
    return null;
  }
}

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  gatherByHand: () => {
    const { clickPower } = get();
    set((state) => ({
      essence: toFixed2(state.essence + clickPower),
      totalEssence: toFixed2(state.totalEssence + clickPower),
    }));
  },

  buyWorker: () => {
    const { essence, workerCost, workerCount } = get();

    if (essence < workerCost) {
      return;
    }

    const newWorkerCount = workerCount + 1;
    const newPerSecond = toFixed2(newWorkerCount * 0.75);
    const newCost = toFixed2(workerCost * 1.19);

    set((state) => ({
      essence: toFixed2(state.essence - workerCost),
      workerCount: newWorkerCount,
      perSecond: newPerSecond,
      workerCost: newCost,
    }));
  },

  buyRitual: () => {
    const { essence, ritualCost, ritualLevel } = get();

    if (essence < ritualCost) {
      return;
    }

    const nextLevel = ritualLevel + 1;
    const multiplier = 1 + nextLevel * 0.08;
    const baseProduction = get().workerCount * 0.75;

    set((state) => ({
      essence: toFixed2(state.essence - ritualCost),
      ritualLevel: nextLevel,
      perSecond: toFixed2(baseProduction * multiplier),
      clickPower: toFixed2(1 + nextLevel * 0.35),
      ritualCost: toFixed2(ritualCost * 1.85),
    }));
  },

  tick: (deltaSeconds) => {
    const { perSecond } = get();

    if (perSecond <= 0) {
      return;
    }

    const gain = perSecond * deltaSeconds;

    set((state) => ({
      essence: toFixed2(state.essence + gain),
      totalEssence: toFixed2(state.totalEssence + gain),
    }));
  },

  save: () => {
    const {
      essence,
      totalEssence,
      perSecond,
      clickPower,
      clickLevel,
      workerCount,
      workerCost,
      ritualLevel,
      ritualCost,
    } = get();

    const payload: GameSnapshot = {
      essence,
      totalEssence,
      perSecond,
      clickPower,
      clickLevel,
      workerCount,
      workerCost,
      ritualLevel,
      ritualCost,
      lastSavedAt: Date.now(),
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    set({ lastSavedAt: payload.lastSavedAt });
  },

  load: () => {
    const parsed = safeParseSave(localStorage.getItem(SAVE_KEY));

    if (!parsed) {
      return;
    }

    const merged: GameSnapshot = {
      ...initialState,
      ...parsed,
      lastSavedAt: parsed.lastSavedAt ?? Date.now(),
    };

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
  },

  hardReset: () => {
    localStorage.removeItem(SAVE_KEY);
    set({ ...initialState, lastSavedAt: Date.now() });
  },
}));
