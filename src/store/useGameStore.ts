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
  buildPym: number;
  buildAvengers: number;
  buildXandar: number;
  buildRavagers: number;
  buildTva: number;
  buildTalo: number;
  buildSorcieres: number;
  buildKang: number;
  buildWundagore: number;
  buildLe_vide: number;

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
  shield: { name: "Agents du S.H.I.E.L.D.", desc: "Espionnage de base.", baseCost: 15, baseProd: 0.1 },
  kamar: { name: "Kamar-Taj", desc: "Magie de bas niveau.", baseCost: 100, baseProd: 1 },
  stark: { name: "Stark Industries", desc: "Technologie de pointe.", baseCost: 1100, baseProd: 8 },
  asgard: { name: "Guerriers d'Asgard", desc: "Force mythologique.", baseCost: 12000, baseProd: 47 },
  wakanda: { name: "Armée du Wakanda", desc: "Vibranium brut.", baseCost: 130000, baseProd: 260 },
  xmansion: { name: "Mutants (X-Men)", desc: "Gène X actif.", baseCost: 1500000, baseProd: 1400 },
  baxter: { name: "Quatre Fantastiques", desc: "Science cosmique.", baseCost: 18000000, baseProd: 8500 },
  knowhere: { name: "Gardiens (Knowhere)", desc: "Réseau galactique.", baseCost: 250000000, baseProd: 55000 },
  sakaar: { name: "Gladiateurs de Sakaar", desc: "Combats d'arène.", baseCost: 3500000000, baseProd: 400000 },
  nidavellir: { name: "Nains de Nidavellir", desc: "Forge d'étoiles.", baseCost: 50000000000, baseProd: 3500000 },
  pym: { name: "Pym Technologies", desc: "Royaume Quantique.", baseCost: 750000000000, baseProd: 28000000 },
  avengers: { name: "Tour Avengers", desc: "Force de frappe globale.", baseCost: 12000000000000, baseProd: 350000000 },
  xandar: { name: "Nova Corps", desc: "Police galactique.", baseCost: 250000000000000, baseProd: 4200000000 },
  ravagers: { name: "Les Ravageurs", desc: "Contrebande spatiale.", baseCost: 4000000000000000, baseProd: 55000000000 },
  tva: { name: "Agents de la T.V.A.", desc: "Contrôle du temps.", baseCost: 85000000000000000, baseProd: 750000000000 },
  talo: { name: "Guerriers de Ta Lo", desc: "Magie ancienne.", baseCost: 1500000000000000000, baseProd: 9000000000000 },
  sorcieres: { name: "Sorcières de Salem", desc: "Magie noire.", baseCost: 30000000000000000000, baseProd: 120000000000000 },
  kang: { name: "Conseil des Kangs", desc: "Dominance multiverselle.", baseCost: 500000000000000000000, baseProd: 2500000000000000 },
  wundagore: { name: "Mont Wundagore", desc: "Le Darkhold.", baseCost: 8000000000000000000000, baseProd: 45000000000000000 },
  le_vide: { name: "Survivants du Vide", desc: "Alioth.", baseCost: 150000000000000000000000, baseProd: 800000000000000000 },
};

export const UPGRADES_DATA = [
  { id: "click_1", name: "Matraque S.H.I.E.L.D.", desc: "Clic x2.", cost: 100, type: "click", multiplier: 2, reqBuild: "shield", reqCount: 1 },
  { id: "click_2", name: "Arc de Hawkeye", desc: "Clic x3.", cost: 1500, type: "click", multiplier: 3, reqBuild: "shield", reqCount: 10 },
  { id: "click_3", name: "Bouclier Vibranium", desc: "Clic x4.", cost: 25000, type: "click", multiplier: 4, reqBuild: "wakanda", reqCount: 1 },
  { id: "click_4", name: "Répulseurs Mark 3", desc: "Clic x5.", cost: 500000, type: "click", multiplier: 5, reqBuild: "stark", reqCount: 10 },
  { id: "click_5", name: "Mjolnir", desc: "Clic x10.", cost: 10000000, type: "click", multiplier: 10, reqBuild: "asgard", reqCount: 10 },
  { id: "click_6", name: "Griffes Adamantium", desc: "Clic x15.", cost: 250000000, type: "click", multiplier: 15, reqBuild: "xmansion", reqCount: 10 },
  { id: "click_7", name: "Dix Anneaux", desc: "Clic x25.", cost: 5000000000, type: "click", multiplier: 25, reqBuild: "talo", reqCount: 1 },
  { id: "click_8", name: "Stormbreaker", desc: "Clic x50.", cost: 150000000000, type: "click", multiplier: 50, reqBuild: "nidavellir", reqCount: 10 },
  { id: "click_9", name: "Œil d'Agamotto", desc: "Clic x100.", cost: 5000000000000, type: "click", multiplier: 100, reqBuild: "kamar", reqCount: 25 },
  { id: "click_10", name: "Gant de l'Infini", desc: "Clic x500.", cost: 1000000000000000, type: "click", multiplier: 500, reqBuild: "knowhere", reqCount: 25 },

  { id: "b_shield1", name: "Héliporteur", desc: "S.H.I.E.L.D. x2.", cost: 500, type: "building", target: "shield", multiplier: 2, reqBuild: "shield", reqCount: 15 },
  { id: "b_kamar1", name: "Cape de Lévitation", desc: "Kamar-Taj x2.", cost: 5000, type: "building", target: "kamar", multiplier: 2, reqBuild: "kamar", reqCount: 15 },
  { id: "b_stark1", name: "Réacteur Arc", desc: "Stark Ind. x2.", cost: 50000, type: "building", target: "stark", multiplier: 2, reqBuild: "stark", reqCount: 15 },
  { id: "b_asgard1", name: "Bifrost", desc: "Asgard x2.", cost: 500000, type: "building", target: "asgard", multiplier: 2, reqBuild: "asgard", reqCount: 15 },
  { id: "b_wakanda1", name: "Herbe Cœur", desc: "Wakanda x2.", cost: 5000000, type: "building", target: "wakanda", multiplier: 2, reqBuild: "wakanda", reqCount: 15 },
  { id: "b_xmansion1", name: "Cerebro", desc: "X-Men x2.", cost: 50000000, type: "building", target: "xmansion", multiplier: 2, reqBuild: "xmansion", reqCount: 15 },
  { id: "b_baxter1", name: "Zone Négative", desc: "4 Fantastiques x2.", cost: 500000000, type: "building", target: "baxter", multiplier: 2, reqBuild: "baxter", reqCount: 15 },
  { id: "b_knowhere1", name: "Marché Noir", desc: "Knowhere x2.", cost: 5000000000, type: "building", target: "knowhere", multiplier: 2, reqBuild: "knowhere", reqCount: 15 },
  { id: "b_sakaar1", name: "Disques d'obéissance", desc: "Sakaar x2.", cost: 50000000000, type: "building", target: "sakaar", multiplier: 2, reqBuild: "sakaar", reqCount: 15 },
  { id: "b_nidavellir1", name: "Moule d'Étoile", desc: "Nidavellir x2.", cost: 500000000000, type: "building", target: "nidavellir", multiplier: 2, reqBuild: "nidavellir", reqCount: 15 },
  { id: "b_pym1", name: "Particules Pym", desc: "Pym Tech x2.", cost: 5000000000000, type: "building", target: "pym", multiplier: 2, reqBuild: "pym", reqCount: 15 },
  { id: "b_avengers1", name: "Quinjet", desc: "Tour Avengers x2.", cost: 50000000000000, type: "building", target: "avengers", multiplier: 2, reqBuild: "avengers", reqCount: 15 },
  { id: "b_xandar1", name: "Worldmind", desc: "Nova Corps x2.", cost: 500000000000000, type: "building", target: "xandar", multiplier: 2, reqBuild: "xandar", reqCount: 15 },
  { id: "b_ravagers1", name: "Vaisseaux Eclector", desc: "Ravageurs x2.", cost: 5000000000000000, type: "building", target: "ravagers", multiplier: 2, reqBuild: "ravagers", reqCount: 15 },
  { id: "b_tva1", name: "Bâtons d'Élagage", desc: "T.V.A. x2.", cost: 50000000000000000, type: "building", target: "tva", multiplier: 2, reqBuild: "tva", reqCount: 15 },

  { id: "g_space", name: "Pierre de l'Espace", desc: "Toutes productions x2.", cost: 1000000000, type: "global", multiplier: 2, reqBuild: "asgard", reqCount: 20 },
  { id: "g_mind", name: "Pierre de l'Esprit", desc: "Toutes productions x2.", cost: 50000000000, type: "global", multiplier: 2, reqBuild: "avengers", reqCount: 5 },
  { id: "g_reality", name: "Pierre de la Réalité", desc: "Toutes productions x2.", cost: 1000000000000, type: "global", multiplier: 2, reqBuild: "knowhere", reqCount: 20 },
  { id: "g_power", name: "Pierre du Pouvoir", desc: "Toutes productions x2.", cost: 50000000000000, type: "global", multiplier: 2, reqBuild: "xandar", reqCount: 20 },
  { id: "g_time", name: "Pierre du Temps", desc: "Toutes productions x2.", cost: 1000000000000000, type: "global", multiplier: 2, reqBuild: "kamar", reqCount: 50 },
  { id: "g_soul", name: "Pierre de l'Âme", desc: "Toutes productions x3.", cost: 50000000000000000, type: "global", multiplier: 3, reqBuild: "wundagore", reqCount: 5 },
];

export const HEROES_DATA = [
  { id: "hawkeye", name: "Hawkeye", desc: "Précision. Puissance: 1", cost: 100, power: 1 },
  { id: "daredevil", name: "Daredevil", desc: "Sens radar. Puissance: 2", cost: 250, power: 2 },
  { id: "falcon", name: "Le Faucon", desc: "Aérien. Puissance: 4", cost: 500, power: 4 },
  { id: "cap", name: "Captain America", desc: "Stratège. Puissance: 8", cost: 1000, power: 8 },
  { id: "ws", name: "Soldat de l'Hiver", desc: "Assassin. Puissance: 12", cost: 2000, power: 12 },
  { id: "bw", name: "Black Widow", desc: "Infiltration. Puissance: 15", cost: 3500, power: 15 },
  { id: "antman", name: "Ant-Man", desc: "Miniaturisation. Puissance: 25", cost: 7000, power: 25 },
  { id: "wolverine", name: "Wolverine", desc: "Régénération. Puissance: 35", cost: 12000, power: 35 },
  { id: "im", name: "Iron Man", desc: "Artillerie lourde. Puissance: 80", cost: 45000, power: 80 },
  { id: "spidey", name: "Spider-Man", desc: "Agilité. Puissance: 150", cost: 150000, power: 150 },
  { id: "bp", name: "Black Panther", desc: "Vibranium. Puissance: 300", cost: 400000, power: 300 },
  { id: "shangchi", name: "Shang-Chi", desc: "Arts Martiaux. Puissance: 500", cost: 800000, power: 500 },
  { id: "hulk", name: "Hulk", desc: "Force brute. Puissance: 750", cost: 1200000, power: 750 },
  { id: "vision", name: "Vision", desc: "Synthézoïde. Puissance: 1200", cost: 2500000, power: 1200 },
  { id: "thor", name: "Thor", desc: "Dieu du tonnerre. Puissance: 2000", cost: 4500000, power: 2000 },
  { id: "strange", name: "Dr. Strange", desc: "Arts mystiques. Puissance: 5000", cost: 15000000, power: 5000 },
  { id: "wanda", name: "Scarlet Witch", desc: "Magie du chaos. Puissance: 12000", cost: 50000000, power: 12000 },
  { id: "starlord", name: "Star-Lord", desc: "Tacticien galactique. Puissance: 25000", cost: 150000000, power: 25000 },
  { id: "groot", name: "Groot", desc: "Régénération végétale. Puissance: 35000", cost: 250000000, power: 35000 },
  { id: "rocket", name: "Rocket Raccoon", desc: "Expert en armes. Puissance: 45000", cost: 350000000, power: 45000 },
  { id: "captainmarvel", name: "Captain Marvel", desc: "Énergie cosmique. Puissance: 60000", cost: 500000000, power: 60000 },
  { id: "silver", name: "Silver Surfer", desc: "Pouvoir cosmique. Puissance: 150000", cost: 2000000000, power: 150000 },
  { id: "namor", name: "Namor", desc: "Mutant atlante. Puissance: 300000", cost: 5000000000, power: 300000 },
  { id: "ghostrider", name: "Ghost Rider", desc: "Esprit de vengeance. Puissance: 800000", cost: 15000000000, power: 800000 },
  { id: "blade", name: "Blade", desc: "Chasseur de vampires. Puissance: 1500000", cost: 40000000000, power: 1500000 },
  { id: "deadpool", name: "Deadpool", desc: "Immortel. Puissance: 5000000", cost: 150000000000, power: 5000000 },
  { id: "cable", name: "Cable", desc: "Mutant futuriste. Puissance: 12000000", cost: 500000000000, power: 12000000 },
  { id: "jeangrey", name: "Jean Grey", desc: "Force Phénix. Puissance: 50000000", cost: 2500000000000, power: 50000000 },
  { id: "cyclops", name: "Cyclope", desc: "Rafale optique. Puissance: 100000000", cost: 6000000000000, power: 100000000 },
  { id: "storm", name: "Tornade", desc: "Contrôle météo. Puissance: 250000000", cost: 15000000000000, power: 250000000 },
];

export const VILLAINS_LIST = [
  "Batroc", "Crossbones", "Zemo", "Vautour", "Mysterio", "Taskmaster",
  "Kingpin", "Kraven", "Lézard", "Homme-Sable", "Electro", "Rhino",
  "Red Skull", "Killmonger", "Loki", "Green Goblin", "Doc Ock",
  "Abomination", "Le Leader", "Whiplash", "Le Mandarin", "Venom", "Carnage",
  "Ronan l'Accusateur", "Malekith", "Kurse", "Hela", "Surtur",
  "Ultron", "Sentinelles", "Bastion", "Magneto", "Mystique", "Dents-de-Sabre", "Le Fléau",
  "Mr. Sinistre", "Apocalypse", "Ego la Planète Vivante", "Maître de l'Évolution",
  "Gorr le Boucher des Dieux", "Dormammu", "Kang le Conquérant", "Alioth", "Thanos", "Galactus",
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
  buildPym: 0,
  buildAvengers: 0,
  buildXandar: 0,
  buildRavagers: 0,
  buildTva: 0,
  buildTalo: 0,
  buildSorcieres: 0,
  buildKang: 0,
  buildWundagore: 0,
  buildLe_vide: 0,
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
    get().herosRecrutes.forEach((hId) => {
      const hero = HEROES_DATA.find((h) => h.id === hId);
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
      state.upgradesOwned.forEach((upId) => {
        const upData = UPGRADES_DATA.find((u) => u.id === upId);
        if (upData && upData.type === "building" && upData.target === key) bMultiplier *= upData.multiplier;
      });
      newRawProduction += bData.baseProd * count * bMultiplier;
    });

    set((s) => ({
      energie: s.energie - currentCost,
      [countKey]: currentCount + 1,
      rawPerSecond: newRawProduction,
    }));
  },

  buyUpgrade: (upgradeId) => {
    const data = UPGRADES_DATA.find((u) => u.id === upgradeId);
    const state = get();
    if (!data || state.energie < data.cost || state.upgradesOwned.includes(upgradeId)) return;

    const newUpgradesOwned = [...state.upgradesOwned, upgradeId];
    let newRawPerSecond = 0;
    let newClickMultiplier = 1;
    let newGlobalMultiplier = 1;

    newUpgradesOwned.forEach((upId) => {
      const up = UPGRADES_DATA.find((u) => u.id === upId);
      if (!up) return;
      if (up.type === "click") newClickMultiplier *= up.multiplier;
      if (up.type === "global") newGlobalMultiplier *= up.multiplier;
    });

    Object.keys(BUILDINGS_DATA).forEach((key) => {
      const bData = BUILDINGS_DATA[key];
      const count = (get() as any)[`build${key.charAt(0).toUpperCase() + key.slice(1)}`];
      let bMultiplier = 1;
      newUpgradesOwned.forEach((upId) => {
        const up = UPGRADES_DATA.find((u) => u.id === upId);
        if (up && up.type === "building" && up.target === key) bMultiplier *= up.multiplier;
      });
      newRawPerSecond += bData.baseProd * count * bMultiplier;
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
    const hero = HEROES_DATA.find((h) => h.id === heroId);
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

    if (newPv <= 0) {
      newPv = nextMaxPv;
    }

    set({
      energie: currentEnergie,
      energieTotale: currentTotale,
      bossPv: newPv,
      bossNiveau: nextLevel,
      bossPvMax: nextMaxPv,
    });
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
      buyHero,
      attackBoss,
      performPrestige,
      getFinalClickPower,
      getFinalPerSecond,
      getCombatPower,
      ...snapshot
    } = state;
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