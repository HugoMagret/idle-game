import { useEffect } from "react";
import ResourceDisplay from "./components/ResourceDisplay";
import { startGameLoop } from "./engine/gameLoop";
import { useGameStore } from "./store/useGameStore";

const AUTO_SAVE_MS = 5000;

export default function App() {
  const load = useGameStore((state) => state.load);
  const save = useGameStore((state) => state.save);

  useEffect(() => {
    load();

    const stopLoop = startGameLoop();
    const saveInterval = window.setInterval(save, AUTO_SAVE_MS);

    const onBeforeUnload = () => {
      save();
    };

    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      stopLoop();
      window.clearInterval(saveInterval);
      window.removeEventListener("beforeunload", onBeforeUnload);
      save();
    };
  }, [load, save]);

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.2),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(249,115,22,0.25),transparent_30%),linear-gradient(150deg,#04070f_0%,#0d1530_50%,#0b1022_100%)] font-text">
      <header className="mx-auto max-w-5xl px-4 pb-2 pt-10 sm:px-6 lg:px-8">
        <p className="text-sm uppercase tracking-[0.2em] text-white/60">idle game nouvelle generation</p>
        <h1 className="mt-3 font-display text-4xl text-white sm:text-6xl">
          Chroniques <span className="text-ember-300">Astrales</span>
        </h1>
      </header>

      <ResourceDisplay />

      <footer className="mx-auto max-w-5xl px-4 pb-10 text-sm text-white/50 sm:px-6 lg:px-8">
        Sauvegarde automatique active. Progression hors-ligne limitee a 8 heures.
      </footer>
    </main>
  );
}
