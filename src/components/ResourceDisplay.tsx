import { useMemo } from "react";
import {
  useGameStore,
  BUILDINGS_DATA,
  UPGRADES_DATA,
  PRESTIGE_THRESHOLD,
  BUILDING_STATE_KEYS,
  toFixed2,
} from "../store/useGameStore";
import type { BuildingId, UpgradeData } from "../store/useGameStore";

function formatPremium(value: number) {
  if (value === 0) return "0.00";
  const suffixes = ["", "k", " Million", " Milliard", " Trillion", " Quadrillion"];
  const tier = Math.floor(Math.log10(Math.abs(value)) / 3);
  if (tier <= 0) return value.toFixed(2);
  const safeTier = Math.min(tier, suffixes.length - 1);
  const suffix = suffixes[safeTier];
  const scale = Math.pow(10, safeTier * 3);
  const scaled = value / scale;
  return scaled.toFixed(2) + suffix;
}

const getBuildingCost = (baseCost: number, count: number) => Math.ceil(baseCost * Math.pow(1.15, count));

function StatItem({ title, value, unit, color }: { title: string; value: string; unit?: string; color?: string }) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.16em] text-white/50">{title}</p>
      <p className={`mt-2 text-2xl font-bold ${color ?? "text-white"}`}>
        {value} {unit && <span className="ml-1 text-base text-white/70">{unit}</span>}
      </p>
    </article>
  );
}

function BuildingCard({ id, name, desc, cost, prod, count }: { id: BuildingId; name: string; desc: string; cost: number; prod: number; count: number }) {
  const iso8 = useGameStore((state) => state.iso8);
  const buyBuilding = useGameStore((state) => state.buyBuilding);
  const canAfford = iso8 >= cost;

  return (
    <button
      onClick={() => buyBuilding(id)}
      disabled={!canAfford}
      className="group relative flex w-full flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-red-500/30 hover:bg-red-950/20 disabled:opacity-40"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-2xl font-bold text-white group-hover:border-red-300 group-hover:bg-red-600">
        {count}
      </div>

      <div className="flex-1">
        <p className="font-display text-xl text-white group-hover:text-red-100">{name}</p>
        <p className="mt-1 text-sm text-white/70">{desc}</p>
        <p className="mt-3 text-sm font-semibold text-red-300">
          Cout: {formatPremium(cost)} <span className="text-white/60">• Prod: +{formatPremium(prod)}/s</span>
        </p>
      </div>

      {!canAfford && (
        <div className="absolute inset-0 flex items-center justify-center bg-abyss-900/70 backdrop-blur-[1px]">
          <span className="text-sm font-semibold text-white/60">Iso-8 insuffisant</span>
        </div>
      )}
    </button>
  );
}

function UpgradeCard({ upgrade }: { upgrade: UpgradeData }) {
  const iso8 = useGameStore((state) => state.iso8);
  const buyUpgrade = useGameStore((state) => state.buyUpgrade);
  const canAfford = iso8 >= upgrade.cost;

  const badge =
    upgrade.type === "click" ? "CLIC" : upgrade.type === "global" ? "GLOBAL" : "EQUIPE";

  return (
    <button
      onClick={() => buyUpgrade(upgrade.id)}
      disabled={!canAfford}
      className="group relative flex w-full items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-cyan-500/30 hover:bg-cyan-950/20 disabled:opacity-40"
    >
      <div className="flex h-10 w-14 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-xs font-bold text-cyan-100 group-hover:bg-cyan-600">
        {badge}
      </div>
      <div className="flex-1">
        <p className="text-lg font-semibold text-white group-hover:text-cyan-100">{upgrade.name}</p>
        <p className="text-xs text-white/70">{upgrade.desc} (x{upgrade.multiplier})</p>
        <p className="mt-2 text-sm font-semibold text-cyan-300">Cout: {formatPremium(upgrade.cost)}</p>
      </div>
      {!canAfford && (
        <div className="absolute inset-0 flex items-center justify-center bg-abyss-900/70 backdrop-blur-[1px]">
          <span className="text-xs font-semibold text-white/60">Insuffisant</span>
        </div>
      )}
    </button>
  );
}

export default function ResourceDisplay() {
  const store = useGameStore();

  const clearance = useMemo(() => {
    if (store.totalIso8 < 10_000) return "Niveau 1 (Agent)";
    if (store.totalIso8 < 1_000_000) return "Niveau 4 (Specialiste)";
    if (store.totalIso8 < 100_000_000) return "Niveau 7 (Tactique)";
    if (store.totalIso8 < PRESTIGE_THRESHOLD) return "Niveau 9 (Directeur)";
    return "Niveau 10+ (Parangon)";
  }, [store.totalIso8]);

  const crystauxAGagner = Math.floor(Math.sqrt(store.totalIso8 / 1_000_000_000_000)) - store.crystauxRealite;
  const canPrestige = store.totalIso8 >= PRESTIGE_THRESHOLD && crystauxAGagner > 0;

  const visibleUpgrades = useMemo(() => {
    return UPGRADES_DATA.filter((up) => {
      if (store.upgradesOwned.includes(up.id)) return false;
      if (!up.requiredBuildingId) return true;

      const key = BUILDING_STATE_KEYS[up.requiredBuildingId];
      const count = store[key] as number;
      return count >= (up.requiredBuildingCount ?? 1);
    });
  }, [
    store.upgradesOwned,
    store.buildStreet,
    store.buildMutants,
    store.buildVanguard,
    store.buildRangers,
    store.buildCosmic,
    store.buildTitans,
  ]);

  return (
    <section className="relative mx-auto max-w-[1700px] px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-red-600/20 blur-[128px]" />
      <div className="pointer-events-none absolute -right-40 top-40 h-96 w-96 rounded-full bg-yellow-500/15 blur-[128px]" />

      <header className="mb-10 text-center">
        <div className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-red-200">
          Clearance: {clearance}
        </div>
        <h1 className="mt-4 font-display text-5xl font-extrabold text-white sm:text-7xl">
          Multiverse <span className="text-red-500 shadow-glow-text">Crisis</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-xl text-white/80">
          Recoltez l'Iso-8, recrutez des equipes d'elite et stabilisez les fractures du multivers.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_2fr_1.2fr]">
        <aside className="space-y-8">
          <div className="rounded-3xl border border-white/10 bg-abyss-800/60 p-6 backdrop-blur-xl">
            <StatItem
              title="Iso-8 Collecte"
              value={formatPremium(store.iso8)}
              unit="E"
              color="text-red-300"
            />
            <div className="mt-4 space-y-3">
              <StatItem title="Production Finale" value={formatPremium(store.getFinalPerSecond())} unit="/s" />
              <StatItem title="Puissance du clic" value={formatPremium(store.getFinalClickPower())} unit="/c" />
            </div>

            <div className="mt-8">
              <button
                onClick={store.generateByClick}
                className="w-full rounded-2xl bg-red-600 py-6 text-xl font-bold text-white shadow-glow transition hover:-translate-y-1 hover:bg-red-500"
              >
                Contrer la menace (+{formatPremium(store.getFinalClickPower())})
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-500/20 bg-cyan-950/30 p-6 backdrop-blur-xl">
            <StatItem
              title="Bonus de Realite"
              value={`${((store.prestigeMultiplier - 1) * 100).toFixed(0)}%`}
              color="text-cyan-200"
            />
            <div className="mt-3">
              <StatItem
                title="Crystaux de Realite"
                value={store.crystauxRealite.toLocaleString()}
              />
            </div>

            <div className="mt-6">
              <button
                onClick={store.performPrestige}
                disabled={!canPrestige}
                className="w-full rounded-2xl border border-cyan-400/40 bg-cyan-800/50 py-4 text-lg font-semibold text-white transition enabled:hover:bg-cyan-700 disabled:opacity-40"
              >
                {canPrestige
                  ? `Reinitialisation temporelle (+${crystauxAGagner.toLocaleString()} Crystaux)`
                  : `Necessite ${formatPremium(PRESTIGE_THRESHOLD)} Iso-8 Total`}
              </button>
              <p className="mt-3 text-center text-xs text-white/60">
                La reinitialisation conserve les crystaux. Chaque crystal apporte +1% de production.
              </p>
            </div>
          </div>
        </aside>

        <main className="rounded-3xl border border-white/10 bg-abyss-800/40 p-6 backdrop-blur-lg">
          <h2 className="mb-6 font-display text-3xl font-bold text-white">Alliances Multiverselles</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {(Object.keys(BUILDINGS_DATA) as BuildingId[]).map((id) => {
              const data = BUILDINGS_DATA[id];
              const key = BUILDING_STATE_KEYS[id];
              const count = store[key] as number;
              const cost = getBuildingCost(data.baseCost, count);

              let buildingMultiplier = 1;
              store.upgradesOwned.forEach((upId) => {
                const up = UPGRADES_DATA.find((u) => u.id === upId);
                if (up && up.type === "building" && up.targetBuildingId === id) {
                  buildingMultiplier *= up.multiplier;
                }
              });

              const finalProd = toFixed2(
                data.baseProd * buildingMultiplier * store.globalMultiplier * store.prestigeMultiplier
              );

              return (
                <BuildingCard
                  key={id}
                  id={id}
                  name={data.name}
                  desc={data.desc}
                  cost={cost}
                  prod={finalProd}
                  count={count}
                />
              );
            })}
          </div>
        </main>

        <aside className="rounded-3xl border border-white/10 bg-abyss-800/40 p-6 backdrop-blur-lg">
          <h2 className="mb-6 font-display text-3xl font-bold text-white">Ameliorations</h2>
          <div className="space-y-4">
            {visibleUpgrades.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-white/50">
                <p className="font-semibold">Aucune technologie disponible</p>
                <p className="mt-2 text-sm">Recrutez plus d'equipes pour debloquer de nouveaux protocoles.</p>
              </div>
            )}
            {visibleUpgrades.slice(0, 10).map((up) => (
              <UpgradeCard key={up.id} upgrade={up} />
            ))}
            {visibleUpgrades.length > 10 && (
              <p className="text-center text-xs text-white/50">{visibleUpgrades.length - 10} autres ameliorations masquees...</p>
            )}
          </div>
        </aside>
      </div>

      <footer className="mt-12 text-center text-sm text-white/40">
        Iso-8 total accumule: {formatPremium(store.totalIso8)} • Version multiverselle v1 active.
      </footer>
    </section>
  );
}
