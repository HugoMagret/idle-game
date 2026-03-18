import { useMemo } from "react";
import { useGameStore } from "../store/useGameStore";

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function StatCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.16em] text-white/55">{title}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm text-white/60">{hint}</p>
    </article>
  );
}

export default function ResourceDisplay() {
  const {
    essence,
    totalEssence,
    perSecond,
    clickPower,
    workerCount,
    workerCost,
    ritualLevel,
    ritualCost,
    gatherByHand,
    buyWorker,
    buyRitual,
    hardReset,
  } = useGameStore();

  const canBuyWorker = essence >= workerCost;
  const canBuyRitual = essence >= ritualCost;

  const grade = useMemo(() => {
    if (totalEssence < 1_000) {
      return "Initié";
    }
    if (totalEssence < 10_000) {
      return "Eveilleur";
    }
    if (totalEssence < 100_000) {
      return "Architecte stellaire";
    }
    return "Souverain du vide";
  }, [totalEssence]);

  return (
    <section className="relative mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-20 top-10 h-52 w-52 rounded-full bg-ember-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-60 w-60 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-abyss-900/95 to-abyss-700/90 p-6 shadow-glow sm:p-8">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.15em] text-white/80">
              Rang: {grade}
            </p>
            <h2 className="mt-3 font-display text-4xl text-white sm:text-5xl">
              {formatNumber(essence)}
              <span className="ml-3 text-lg text-ember-200">essence astrale</span>
            </h2>
            <p className="mt-3 max-w-xl text-white/75">
              Modele idle premium en francais: progression rapide, interface lisible et sensations fortes sans UI plate.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={gatherByHand}
                className="rounded-2xl bg-ember-500 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ember-400"
              >
                Canaliser a la main (+{formatNumber(clickPower)})
              </button>
              <button
                onClick={hardReset}
                className="rounded-2xl border border-white/20 bg-white/5 px-5 py-3 font-semibold text-white/85 transition hover:bg-white/10"
              >
                Reinitialiser la partie
              </button>
            </div>
          </div>

          <div className="grid gap-3">
            <StatCard
              title="Production"
              value={`${formatNumber(perSecond)}/s`}
              hint="Production passive totale"
            />
            <StatCard
              title="Essence totale"
              value={formatNumber(totalEssence)}
              hint="Depuis le debut de cette run"
            />
            <StatCard
              title="Echos ouvriers"
              value={formatNumber(workerCount)}
              hint="Collecteurs automatiques"
            />
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <button
            onClick={buyWorker}
            disabled={!canBuyWorker}
            className="rounded-2xl border border-white/20 bg-white/5 p-4 text-left transition enabled:hover:-translate-y-0.5 enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <p className="font-display text-xl text-white">Recruter un Echo ouvrier</p>
            <p className="mt-1 text-sm text-white/70">+0,75 essence / sec</p>
            <p className="mt-3 text-sm font-semibold text-ember-200">Cout: {formatNumber(workerCost)} essence</p>
          </button>

          <button
            onClick={buyRitual}
            disabled={!canBuyRitual}
            className="rounded-2xl border border-cyan-200/30 bg-cyan-300/10 p-4 text-left transition enabled:hover:-translate-y-0.5 enabled:hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <p className="font-display text-xl text-white">Rituel prismatique (Niv. {ritualLevel})</p>
            <p className="mt-1 text-sm text-white/75">Augmente click et production globale</p>
            <p className="mt-3 text-sm font-semibold text-cyan-100">Cout: {formatNumber(ritualCost)} essence</p>
          </button>
        </div>
      </div>
    </section>
  );
}
