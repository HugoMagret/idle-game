import { useGameStore } from "../store/useGameStore";

const MIN_FRAME_MS = 1000 / 60;

export function startGameLoop() {
  let frameId = 0;
  let previousTime = performance.now();

  const loop = (currentTime: number) => {
    const elapsedMs = currentTime - previousTime;

    if (elapsedMs >= MIN_FRAME_MS) {
      // Calcul du delta réel, sans plafond, pour traiter les périodes d'inactivité de l'onglet
      const deltaSeconds = elapsedMs / 1000;
      
      useGameStore.getState().tick(deltaSeconds);
      previousTime = currentTime;
    }

    frameId = requestAnimationFrame(loop);
  };

  frameId = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(frameId);
  };
}