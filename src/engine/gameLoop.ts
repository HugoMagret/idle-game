import { useGameStore } from "../store/useGameStore";

const MIN_FRAME_MS = 1000 / 60;
const MAX_DELTA_SECONDS = 0.25;

export function startGameLoop() {
  let frameId = 0;
  let previousTime = performance.now();

  const loop = (currentTime: number) => {
    const elapsedMs = currentTime - previousTime;

    if (elapsedMs >= MIN_FRAME_MS) {
      const deltaSeconds = Math.min(elapsedMs / 1000, MAX_DELTA_SECONDS);
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
