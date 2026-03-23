import { useGameStore, BUILDINGS_DATA, UPGRADES_DATA, HEROES_DATA, VILLAINS_LIST, PRESTIGE_THRESHOLD } from "../store/useGameStore";

function formatXX(value: number) {
  if (value === 0) return "0.00";
  const suffixes = ["", "k", " Million", " Milliard", " Trill", " Quad", " Quint"];
  const tier = (Math.log10(Math.abs(value)) / 3) | 0;
  if (tier <= 0) return value.toFixed(2);
  const scale = Math.pow(10, tier * 3);
  return (value / scale).toFixed(2) + " " + suffixes[tier];
}

const getBuildingCost = (baseCost: number, count: number) => Math.ceil(baseCost * Math.pow(1.15, count));

function StatItem({ title, value, unit, color }: { title: string; value: string; unit?: string; color?: string }) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.1em] text-white/50">{title}</p>
      <p className={`mt-2 text-2xl font-bold ${color ?? "text-white"}`}>
        {value} {unit && <span className="ml-1 text-base text-white/70">{unit}</span>}
      </p>
    </article>
  );
}

export default function ResourceDisplay() {
  const store = useGameStore();

  const gemmesGagnables = Math.floor(Math.sqrt(store.energieTotale / 1_000_000_000_000)) - store.gemmesTemporelles;
  const canPrestige = store.energieTotale >= PRESTIGE_THRESHOLD && gemmesGagnables > 0;

  const visibleUpgrades = UPGRADES_DATA.filter(up => {
    if (store.upgradesOwned.includes(up.id)) return false;
    if (!up.reqBuild) return true;
    const countKey = `build${up.reqBuild.charAt(0).toUpperCase() + up.reqBuild.slice(1)}` as keyof typeof store;
    return (store[countKey] as number) >= up.reqCount;
  });

  const availableHeroes = HEROES_DATA.filter(h => !store.herosRecrutes.includes(h.id));

  // Détermination du nom du boss
  const bossIndex = (store.bossNiveau - 1) % VILLAINS_LIST.length;
  const loopCount = Math.floor((store.bossNiveau - 1) / VILLAINS_LIST.length);
  const bossName = loopCount > 0 ? `${VILLAINS_LIST[bossIndex]} (Clone ${loopCount + 1})` : VILLAINS_LIST[bossIndex];
  const bossReward = 250 * Math.pow(1.8, store.bossNiveau - 1);

  return (
    <section className="mx-auto max-w-[1700px] px-4 pb-16 pt-6 font-text text-white">
      <header className="mb-8 text-center">
        <h1 className="font-display text-4xl font-bold uppercase tracking-wider text-blue-400">Initiative Multivers</h1>
      </header>

      {/* ZONE DE COMBAT */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/80 to-slate-900/80 p-6 shadow-lg">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="min-w-[200px]">
            <h2 className="text-xl font-bold text-red-400">Menace : {bossName} (Niv. {store.bossNiveau})</h2>
            <p className="text-sm text-slate-300">Dégâts infligés : {formatXX(store.getCombatPower())} /s</p>
            <p className="text-xs text-yellow-400">Prime de défaite : +{formatXX(bossReward)}</p>
          </div>
          
          <div className="flex-1 px-4 w-full max-w-2xl">
            <div className="mb-1 flex justify-between text-sm">
              <span>Points de Vie (PV)</span>
              <span>{formatXX(Math.max(0, store.bossPv))} / {formatXX(store.bossPvMax)}</span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-slate-800">
              <div 
                className="h-full bg-red-500 transition-all duration-200"
                style={{ width: `${Math.max(0, (store.bossPv / store.bossPvMax) * 100)}%` }}
              />
            </div>
          </div>

          <button
            onClick={store.attackBoss}
            className="rounded-lg bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-500 active:scale-95"
          >
            Frapper ({formatXX(store.getCombatPower())})
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr_1fr]">
        
        {/* COLONNE 1 : Economie */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-blue-500/20 bg-slate-900/60 p-5">
            <StatItem title="Énergie Cosmique" value={formatXX(store.energie)} color="text-blue-300" />
            <div className="mt-4 space-y-3">
              <StatItem title="Génération" value={formatXX(store.getFinalPerSecond())} unit="/s" />
              <StatItem title="Clic Manuel" value={formatXX(store.getFinalClickPower())} unit="/c" />
            </div>
            <button
              onClick={store.generateByClick}
              className="mt-6 w-full rounded-xl bg-blue-600 py-4 font-bold transition hover:bg-blue-500"
            >
              Collecter Manuellement
            </button>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-slate-900/60 p-5">
            <StatItem title="Gemmes Temporelles" value={store.gemmesTemporelles.toString()} color="text-purple-300" />
            <p className="mt-2 text-sm text-slate-400">Bonus actuel : +{((store.prestigeMultiplier - 1) * 100).toFixed(0)}%</p>
            <button
              onClick={store.performPrestige}
              disabled={!canPrestige}
              className="mt-4 w-full rounded-xl border border-purple-500/50 bg-purple-900/40 py-3 text-sm font-semibold transition enabled:hover:bg-purple-800 disabled:opacity-50"
            >
              {canPrestige ? `Réinitialiser (+${gemmesGagnables} Gemmes)` : `Requis: ${formatXX(PRESTIGE_THRESHOLD)} Total`}
            </button>
          </div>
        </aside>

        {/* COLONNE 2 : Factions Alliées */}
        <main className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
          <h2 className="mb-4 text-2xl font-bold">Factions Alliées</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.keys(BUILDINGS_DATA).map((id) => {
              const data = BUILDINGS_DATA[id];
              const countKey = `build${id.charAt(0).toUpperCase() + id.slice(1)}` as keyof typeof store;

              const count = (store[countKey] as number) || 0;
              const cost = getBuildingCost(data.baseCost, count);
              const canAfford = store.energie >= cost;

              let bMultiplier = 1;
              store.upgradesOwned.forEach((upId) => {
                const upData = UPGRADES_DATA.find((u) => u.id === upId);
                if (upData && upData.type === "building" && upData.target === id) {
                  bMultiplier *= upData.multiplier;
                }
              });
              const productionTotaleBatiment = data.baseProd * count * bMultiplier * store.globalMultiplier * store.prestigeMultiplier;

              return (
                <button
                  key={id}
                  onClick={() => store.buyBuilding(id)}
                  disabled={!canAfford}
                  className="flex flex-col rounded-xl border border-slate-600 bg-slate-800 p-4 text-left transition enabled:hover:border-blue-400 disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{data.name}</span>
                    <span className="rounded bg-slate-700 px-2 py-1 text-sm font-bold">{count}</span>
                  </div>
                  <span className="mt-1 text-xs text-slate-400">{data.desc}</span>
                  <div className="mt-3 flex flex-col gap-1 text-xs">
                    <span className="text-blue-300">Coût: {formatXX(cost)}</span>
                    <span className="text-green-400">Prod. totale: {formatXX(productionTotaleBatiment)} /s</span>
                  </div>
                </button>
              );
            })}
          </div>
        </main>

        {/* COLONNE 3 : Améliorations & Héros */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-green-500/20 bg-slate-900/60 p-5">
            <h2 className="mb-4 text-xl font-bold text-green-400">Technologie</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {visibleUpgrades.length === 0 && <p className="text-sm text-slate-500">Aucune technologie disponible.</p>}
              {visibleUpgrades.map(up => (
                <button
                  key={up.id}
                  onClick={() => store.buyUpgrade(up.id)}
                  disabled={store.energie < up.cost}
                  className="w-full rounded-lg border border-green-900 bg-green-950/30 p-3 text-left transition enabled:hover:border-green-500 disabled:opacity-50"
                >
                  <p className="font-bold text-green-100">{up.name}</p>
                  <p className="text-xs text-green-300/70">{up.desc}</p>
                  <p className="mt-1 text-xs font-bold text-green-400">Coût: {formatXX(up.cost)}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-orange-500/20 bg-slate-900/60 p-5">
            <h2 className="mb-4 text-xl font-bold text-orange-400">Recrutement Unique</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {availableHeroes.length === 0 && <p className="text-sm text-slate-500">Tous les héros ont été recrutés.</p>}
              {availableHeroes.map(hero => (
                <button
                  key={hero.id}
                  onClick={() => store.buyHero(hero.id)}
                  disabled={store.energie < hero.cost}
                  className="w-full rounded-lg border border-orange-900 bg-orange-950/30 p-3 text-left transition enabled:hover:border-orange-500 disabled:opacity-50"
                >
                  <p className="font-bold text-orange-100">{hero.name}</p>
                  <p className="text-xs text-orange-300/70">{hero.desc}</p>
                  <p className="mt-1 text-xs font-bold text-orange-400">Coût: {formatXX(hero.cost)}</p>
                </button>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </section>
  );
}