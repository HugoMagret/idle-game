import { useState } from "react";
import { useGameStore, BUILDINGS_DATA, UPGRADES_DATA, HEROES_DATA, VILLAINS_LIST, PRESTIGE_THRESHOLD } from "../store/useGameStore";

function formatXX(value: number) {
  if (value === 0) return "0.00";
  const suffixes = ["", "k", " Million", " Milliard", " Trill", " Quad", " Quint"];
  const tier = (Math.log10(Math.abs(value)) / 3) | 0;
  if (tier <= 0) return value.toFixed(2);
  const scale = Math.pow(10, tier * 3);
  return (value / scale).toFixed(2) + suffixes[tier];
}

const getBuildingCost = (baseCost: number, count: number) => Math.ceil(baseCost * Math.pow(1.15, count));

function StatItem({ title, value, unit, color, animatePulse = false }: any) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:border-white/20">
      <p className="text-xs uppercase tracking-[0.15em] text-white/50">{title}</p>
      <p className={`mt-2 text-3xl font-bold ${color ?? "text-white"} ${animatePulse ? "animate-pulse" : ""}`}>
        {value}<span className="ml-1 text-lg text-white/60">{unit}</span>
      </p>
    </article>
  );
}

export default function ResourceDisplay() {
  const store = useGameStore();
  const [bossHitAnim, setBossHitAnim] = useState(false);

  const gemmesGagnables = Math.floor(Math.sqrt(store.energieTotale / 1_000_000_000_000)) - store.gemmesTemporelles;
  const canPrestige = store.energieTotale >= PRESTIGE_THRESHOLD && gemmesGagnables > 0;

  const visibleUpgrades = UPGRADES_DATA.filter(up => {
    if (store.upgradesOwned.includes(up.id)) return false;
    if (!up.reqBuild) return true;
    const countKey = `build${up.reqBuild.charAt(0).toUpperCase() + up.reqBuild.slice(1)}` as keyof typeof store;
    return (store[countKey] as number) >= up.reqCount;
  });

  const availableHeroes = HEROES_DATA.filter(h => !store.herosRecrutes.includes(h.id));

  const bossIndex = (store.bossNiveau - 1) % VILLAINS_LIST.length;
  const loopCount = Math.floor((store.bossNiveau - 1) / VILLAINS_LIST.length);
  const villainId = VILLAINS_LIST[bossIndex].toLowerCase().replace(/ /g, "_");
  const bossName = loopCount > 0 ? `${VILLAINS_LIST[bossIndex]} C-${loopCount + 1}` : VILLAINS_LIST[bossIndex];
  const bossReward = 250 * Math.pow(1.8, store.bossNiveau - 1);

  const handleAttackBoss = () => {
    store.attackBoss();
    setBossHitAnim(true);
    setTimeout(() => setBossHitAnim(false), 200);
  };

  return (
    <section className="mx-auto max-w-[1750px] px-4 pb-16 pt-4 font-text text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#04070f] to-[#04070f]"></div>

      <header className="mb-10 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-blue-200 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
          <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400"></div>
          Protocole de Défense Multiverselle ACTIVE
        </div>
        <h1 className="mt-5 font-display text-5xl font-extrabold uppercase tracking-tighter text-white sm:text-7xl">
          Marvel <span className="bg-gradient-to-b from-red-400 to-red-600 bg-clip-text text-transparent shadow-red-500/30 [text-shadow:0_0_20px_var(--tw-shadow-color)]">Crisis</span>
        </h1>
      </header>

      <div className={`mb-10 overflow-hidden rounded-3xl border border-red-500/30 bg-slate-950/50 p-6 shadow-2xl backdrop-blur-sm transition-all ${bossHitAnim ? "animate-boss-hit border-red-500" : ""}`}>
        <div className="flex flex-col items-center gap-6 lg:flex-row">
          
          <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-2 border-red-700 bg-black shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-float overflow-hidden">
            <img 
              src={`/assets/villains/${villainId}.webp`} 
              alt={bossName}
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bossName)}&background=450a0a&color=f87171&size=128&bold=true`;
              }}
            />
            <div className="absolute bottom-0 w-full bg-red-600/90 py-0.5 text-center text-xs font-bold uppercase backdrop-blur-sm">Cible</div>
          </div>

          <div className="flex-1 text-center lg:text-left">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white">{bossName} <span className="text-red-400 text-xl">(Niv. {store.bossNiveau})</span></h2>
            <p className="mt-1 text-slate-300">Dégâts de l'équipe : <span className="font-bold text-red-300 animate-pulse">{formatXX(store.getCombatPower())} /s</span></p>
            <p className="text-sm text-yellow-400">Récompense de victoire : +{formatXX(bossReward)} Énergie</p>
          </div>
          
          <div className="flex-1 px-4 w-full max-w-xl">
            <div className="mb-1.5 flex justify-between text-sm font-medium">
              <span className="text-slate-200">Points de Vie (PV)</span>
              <span className="text-red-200">{formatXX(Math.max(0, store.bossPv))} / {formatXX(store.bossPvMax)}</span>
            </div>
            <div className="h-5 w-full overflow-hidden rounded-full bg-slate-800 border border-slate-700 p-0.5 shadow-inner">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                style={{ width: `${Math.max(0, (store.bossPv / store.bossPvMax) * 100)}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleAttackBoss}
            className="rounded-xl bg-red-600 px-10 py-5 text-xl font-bold text-white shadow-[0_5px_0_#b91c1c] transition-all hover:bg-red-500 hover:shadow-[0_3px_0_#b91c1c] hover:translate-y-0.5 active:translate-y-1 active:shadow-none"
          >
            ATTAQUER
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_2fr_1.1fr]">
        
        <aside className="space-y-8 animate-fade-in [animation-delay:100ms]">
          <div className="rounded-3xl border border-blue-500/20 bg-slate-950/40 p-6 backdrop-blur-sm shadow-xl">
            <StatItem title="Énergie Cosmique" value={formatXX(store.energie)} unit="E" color="text-blue-300" animatePulse />
            <div className="mt-5 space-y-4">
              <StatItem title="Génération Passive" value={formatXX(store.getFinalPerSecond())} unit="/s" color="text-green-300" />
              <StatItem title="Collecte Manuelle (Clic)" value={formatXX(store.getFinalClickPower())} unit="/clic" color="text-yellow-300" />
            </div>
            <button
              onClick={store.generateByClick}
              className="mt-8 w-full rounded-2xl bg-gradient-to-b from-blue-500 to-blue-700 py-6 text-xl font-extrabold uppercase tracking-tight text-white shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all hover:from-blue-400 hover:to-blue-600 hover:scale-[1.02] active:scale-[0.98]"
            >
              Collecter Énergie
            </button>
          </div>

          <div className="rounded-3xl border border-purple-500/20 bg-slate-950/40 p-6 backdrop-blur-sm shadow-xl">
            <StatItem title="Gemmes Temporelles" value={store.gemmesTemporelles.toString()} unit="" color="text-purple-300" />
            <p className="mt-3 text-sm text-slate-300">Boost multiversel actuel : <span className="font-bold text-purple-200">+{((store.prestigeMultiplier - 1) * 100).toFixed(0)}%</span> à tout.</p>
            <button
              onClick={store.performPrestige}
              disabled={!canPrestige}
              className="mt-5 w-full rounded-xl border border-purple-500/50 bg-purple-900/30 py-4 text-lg font-bold transition-all enabled:hover:bg-purple-800 enabled:hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {canPrestige ? `S'élever (+${gemmesGagnables} Gemmes)` : `Requis: ${formatXX(PRESTIGE_THRESHOLD)} Énergie Totale`}
            </button>
            <p className="mt-3 text-center text-xs text-slate-500">L'élévation réinitialise tout sauf les Gemmes.</p>
          </div>
        </aside>

        <main className="rounded-3xl border border-slate-700 bg-slate-950/40 p-6 backdrop-blur-sm shadow-xl animate-fade-in [animation-delay:200ms]">
          <h2 className="mb-6 font-display text-3xl font-bold text-white tracking-tight">Factions Alliées <span className="text-sm text-slate-400 font-normal">({Object.keys(BUILDINGS_DATA).length})</span></h2>
          <div className="grid gap-4 sm:grid-cols-2 max-h-[800px] overflow-y-auto pr-3 custom-scrollbar">
            {Object.keys(BUILDINGS_DATA).map((id) => {
              const data = BUILDINGS_DATA[id];
              const countKey = `build${id.charAt(0).toUpperCase() + id.slice(1)}` as keyof typeof store;
              const count = (store[countKey] as number) || 0; 
              const cost = getBuildingCost(data.baseCost, count);
              const canAfford = store.energie >= cost;

              let bMultiplier = 1;
              store.upgradesOwned.forEach(upId => {
                const upData = UPGRADES_DATA.find(u => u.id === upId);
                if (upData && upData.type === "building" && upData.target === id) bMultiplier *= upData.multiplier;
              });
              const prodTotale = (data.baseProd * count) * bMultiplier * store.globalMultiplier * store.prestigeMultiplier;

              return (
                <button
                  key={id}
                  onClick={() => store.buyBuilding(id)}
                  disabled={!canAfford}
                  className="group flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-800/80 p-4 text-left transition-all enabled:hover:border-blue-400 enabled:hover:bg-slate-700/50 enabled:hover:scale-[1.01] disabled:opacity-50"
                >
                  <div className="h-16 w-16 shrink-0 rounded-lg bg-black/30 border border-slate-600 p-1 group-enabled:group-hover:border-blue-500 transition-colors flex items-center justify-center overflow-hidden">
                    <img 
                      src={`/assets/factions/${id}.webp`} 
                      alt={data.name} 
                      className="h-full w-full object-cover rounded-md" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=0f172a&color=38bdf8&size=64&bold=true`;
                      }}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-white group-enabled:group-hover:text-blue-200">{data.name}</span>
                      <span className="rounded-md bg-slate-700 px-2.5 py-1 text-sm font-extrabold text-blue-100">{count}</span>
                    </div>
                    <span className="mt-1 block text-xs text-slate-400 line-clamp-1">{data.desc}</span>
                    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs border-t border-slate-700 pt-2">
                      <span className="font-semibold text-blue-300">Coût: {formatXX(cost)}</span>
                      <span className="font-semibold text-green-400">Total: +{formatXX(prodTotale)} /s</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </main>

        <aside className="space-y-8 animate-fade-in [animation-delay:300ms]">
          <div className="rounded-3xl border border-green-500/20 bg-slate-950/40 p-6 backdrop-blur-sm shadow-xl">
            <h2 className="mb-5 font-display text-2xl font-bold text-green-400 tracking-tight">Laboratoire Stark</h2>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
              {visibleUpgrades.length === 0 && <p className="text-sm text-slate-500 italic text-center py-4">Aucune technologie disponible.</p>}
              {visibleUpgrades.map(up => (
                <button
                  key={up.id}
                  onClick={() => store.buyUpgrade(up.id)}
                  disabled={store.energie < up.cost}
                  className="w-full rounded-xl border border-green-900 bg-green-950/20 p-4 text-left transition-all enabled:hover:border-green-500 enabled:hover:bg-green-950/40 disabled:opacity-50"
                >
                  <p className="font-bold text-green-100">{up.name}</p>
                  <p className="text-xs text-green-300/80 mt-0.5">{up.desc} (<span className="font-bold">x{up.multiplier}</span> {up.type === 'click' ? 'Clic' : up.type === 'global' ? 'Global' : 'Faction'})</p>
                  <p className="mt-2.5 text-sm font-bold text-green-400 border-t border-green-800/50 pt-1.5">Coût: {formatXX(up.cost)}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-orange-500/20 bg-slate-950/40 p-6 backdrop-blur-sm shadow-xl">
            <h2 className="mb-5 font-display text-2xl font-bold text-orange-400 tracking-tight">Protocoles Avengers</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {availableHeroes.length === 0 && <p className="text-sm text-slate-500 italic text-center py-4">Tous les héros sont mobilisés.</p>}
              {availableHeroes.map(hero => (
                <button
                  key={hero.id}
                  onClick={() => store.buyHero(hero.id)}
                  disabled={store.energie < hero.cost}
                  className="group w-full rounded-xl border border-orange-900 bg-orange-950/20 p-4 text-left transition-all enabled:hover:border-orange-500 enabled:hover:bg-orange-950/40 disabled:opacity-50 flex gap-3 items-center"
                >
                  <img 
                    src={`/assets/heroes/${hero.id}.webp`} 
                    alt={hero.name} 
                    className="h-12 w-12 rounded-full object-cover border border-orange-800 group-enabled:group-hover:border-orange-400"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(hero.name)}&background=431407&color=fb923c&size=64&bold=true`;
                    }}
                  />
                  
                  <div className="flex-1">
                    <p className="font-bold text-orange-100">{hero.name}</p>
                    <p className="text-xs text-orange-300/80 mt-0.5">{hero.desc}</p>
                    <div className="mt-2.5 flex justify-between items-center text-sm font-bold text-orange-400 border-t border-orange-800/50 pt-1.5">
                      <span>Coût: {formatXX(hero.cost)}</span>
                      <span className="bg-red-950 text-red-200 px-2 py-0.5 rounded text-xs">Pui: +{formatXX(hero.power)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

      </div>
      
      <footer className="mt-16 text-center text-xs text-slate-600 border-t border-slate-800 pt-8">
        Énergie totale accumulée dans cette réalité : {formatXX(store.energieTotale)} • Version Multivers Crisis v1.2.
      </footer>
    </section>
  );
}
