export const TASK_DEMO_TURN_MS = 12000;
export const TASK_DEMO_STAGE_MS = 6000;
export const TASK_DEMO_RESEARCH_MS = 12000;

export function taskInitialStepMs(phase) {
  return phase === 0 ? 0 : TASK_DEMO_TURN_MS;
}

export function taskElapsedMs(startedAt, completedAt = performance.now()) {
  return Math.max(0, completedAt - startedAt);
}
