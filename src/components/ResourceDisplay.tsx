import { useMemo } from "react";
import { useGameStore, BUILDINGS_DATA, ASCENSION_THRESHOLD } from "../store/useGameStore";
import type { GameState } from "../store/useGameStore";

function formatLargeNumber(value: number) {
  if (value === 0) return "0";
  const suffixes = ["", "k", " Million", " Milliard", " Trillion", " Quadrillion"];
  const tier = Math.floor(Math.log10(Math.abs(value)) / 3);
  if (tier <= 0) return value.toFixed(value >= 10 ? 0 : 2);
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

function BuildingCard({ id, name, desc, cost, prod, count }: { id: string; name: string; desc: string; cost: number; prod: number; count: number }) {
  const essence = useGameStore((state) => state.essence);
  const buyBuilding = useGameStore((state) => state.buyBuilding);
  const canAfford = essence >= cost;

  return (
    <button
      onClick={() => buyBuilding(id)}
      disabled={!canAfford}
      className="group relative flex w-full flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-ember-500/30 hover:bg-ember-950/20 disabled:opacity-40"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-2xl font-bold text-white group-hover:border-ember-300 group-hover:bg-ember-500">
        {count}
      </div>

      <div className="flex-1">
        <p className="font-display text-xl text-white group-hover:text-ember-100">{name}</p>
        <p className="mt-1 text-sm text-white/70">{desc}</p>
        <p className="mt-3 text-sm font-semibold text-ember-300">
          Cout: {formatLargeNumber(cost)} <span className="text-white/60">• Prod: +{formatLargeNumber(prod)}/s</span>
        </p>
      </div>

      {!canAfford && (
        <div className="absolute inset-0 flex items-center justify-center bg-abyss-900/60 backdrop-blur-[1px]">
          <span className="text-sm font-semibold text-white/50">Essence insuffisante</span>
        </div>
      )}
    </button>
  );
}

export default function ResourceDisplay() {
  const store = useGameStore();

  const grade = useMemo(() => {
    if (store.totalEssence < 100_000) return "Initie stellaire";
    if (store.totalEssence < 1_000_000) return "Eveilleur cosmique";
    if (store.totalEssence < ASCENSION_THRESHOLD) return "Architecte stellaire";
    return "Souverain du vide";
  }, [store.totalEssence]);

  const larmesAGagner = Math.floor(Math.sqrt(store.totalEssence / 1_000_000_000_000)) - store.larmesHorizon;
  const canPrestige = store.totalEssence >= ASCENSION_THRESHOLD && larmesAGagner > 0;

  return (
    <section className="relative mx-auto max-w-[1700px] px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-ember-500/20 blur-[128px]" />
      <div className="pointer-events-none absolute -right-40 top-40 h-96 w-96 rounded-full bg-cyan-400/15 blur-[128px]" />

      <header className="mb-10 text-center">
        <div className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-cyan-200">
          Grade: {grade}
        </div>
        <h1 className="mt-4 font-display text-5xl font-extrabold text-white sm:text-7xl">
          Chroniques <span className="text-ember-300 shadow-glow-text">Astrales</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-xl text-white/80">
          Canalisez l'energie des etoiles pour reconstruire le cosmos dechu.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_2.2fr_1.2fr]">
        <aside className="space-y-8">
          <div className="rounded-3xl border border-white/10 bg-abyss-800/60 p-6 backdrop-blur-xl">
            <StatItem
              title="Essence Astrale"
              value={formatLargeNumber(store.essence)}
              unit="E"
              color="text-ember-200"
            />
            <div className="mt-4 space-y-3">
              <StatItem title="Production Totale" value={formatLargeNumber(store.perSecond)} unit="/s" />
              <StatItem title="Puissance du clic" value={formatLargeNumber(store.clickPower)} unit="/c" />
            </div>

            <div className="mt-8">
              <button
                onClick={store.gatherByHand}
                className="w-full rounded-2xl bg-ember-500 py-6 text-xl font-bold text-white shadow-glow transition hover:-translate-y-1 hover:bg-ember-400"
              >
                Canaliser la main (+{formatLargeNumber(store.clickPower)})
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-500/20 bg-cyan-950/30 p-6 backdrop-blur-xl">
            <StatItem
              title="Multiplicateur d'Ascension"
              value={`${(store.perSecondMultiplier * 100).toFixed(0)}%`}
              color="text-cyan-200"
            />
            <div className="mt-3">
              <StatItem
                title="Larmes d'Horizon detenues"
                value={store.larmesHorizon.toLocaleString()}
              />
            </div>

            <div className="mt-6">
              <button
                onClick={store.prestigeAscension}
                disabled={!canPrestige}
                className="w-full rounded-2xl border border-cyan-400/40 bg-cyan-800/50 py-4 text-lg font-semibold text-white transition enabled:hover:bg-cyan-700 disabled:opacity-40"
              >
                {canPrestige ? `Ascension (+${larmesAGagner.toLocaleString()} Larmes)` : `Necessite ${formatLargeNumber(ASCENSION_THRESHOLD)} Essence Totale`}
              </button>
              <p className="mt-3 text-center text-xs text-white/60">
                L'Ascension reinitialise tout sauf les larmes. Chaque larme donne +1% de production.
              </p>
            </div>
          </div>
        </aside>

        <main className="rounded-3xl border border-white/10 bg-abyss-800/40 p-6 backdrop-blur-lg">
          <h2 className="mb-6 font-display text-3xl font-bold text-white">Structures de Canalisation</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.keys(BUILDINGS_DATA).map((id) => {
              const data = BUILDINGS_DATA[id];
              const countKey = `building${id.charAt(0).toUpperCase() + id.slice(1)}` as keyof GameState;
              const count = store[countKey] as number;
              const cost = getBuildingCost(data.baseCost, count);

              return (
                <BuildingCard
                  key={id}
                  id={id}
                  name={data.name}
                  desc={data.desc}
                  cost={cost}
                  prod={data.baseProd * store.perSecondMultiplier}
                  count={count}
                />
              );
            })}
          </div>
        </main>

        <aside className="rounded-3xl border border-white/10 bg-abyss-800/40 p-6 backdrop-blur-lg">
          <h2 className="mb-6 font-display text-3xl font-bold text-white">Ameliorations</h2>
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-white/50">
              <p className="font-semibold">Bientot disponible</p>
              <p className="mt-2 text-sm">Collectez plus d'essence pour debloquer les secrets stellaires.</p>
            </div>
          </div>
        </aside>
      </div>

      <footer className="mt-12 text-center text-sm text-white/40">
        Progression totale: {formatLargeNumber(store.totalEssence)} Essence • Sauvegarde v2 active.
      </footer>
    </section>
  );
}
