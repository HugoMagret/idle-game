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
      <ResourceDisplay />
    </main>
  );
}
