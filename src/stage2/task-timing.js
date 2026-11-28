export const TASK_DEMO_TURN_MS = 6000;
export const TASK_DEMO_STAGE_MS = 2500;
export const TASK_DEMO_RESEARCH_MS = 6000;

export function taskInitialStepMs(phase, lastPhase) {
  return phase === 0 ? 0 : TASK_DEMO_TURN_MS / Math.max(1, lastPhase - 1);
}

export function taskElapsedMs(startedAt, completedAt = performance.now()) {
  return Math.max(0, completedAt - startedAt);
}
