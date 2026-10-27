// Candidate ↔ position relations as the product shows them (design review 2026-10-28).
// The opportunity store seeds each position's pipeline from `candidatePositionRelations`, and every move —
// a drag on the board or a move Hunter makes after the user confirms it in a task conversation — is written
// back to that pipeline. The board, the candidate list’s 流程 column, the candidate page and the position
// talent map all read from there, so one person never shows two different stages.
import { candidatePositionRelations, positions } from "./data.js";
import { PIPELINE_STAGES } from "./opportunity-domain.js";

export const stageIdByName = Object.fromEntries(PIPELINE_STAGES.map((stage) => [stage.name, stage.id]));
export const stageNameById = Object.fromEntries(PIPELINE_STAGES.map((stage) => [stage.id, stage.name]));
export const activeStageIds = ["recommended", "interview-1", "interview-2", "offer"];
export const failureStageIds = ["withdrawn", "rejected", "unsuitable"];

// Actor written on moves Hunter makes from a conversation (02 §7.14 rule 6).
export const dialogueActor = "Hunter · 按对话要求执行";

export const seedRelationsFor = (positionId) =>
  candidatePositionRelations.filter((relation) => relation.positionId === positionId);

export const hasSeededPipeline = (positionId) => seedRelationsFor(positionId).length > 0;

export function seedPipeline(positionId, at) {
  return seedRelationsFor(positionId).map((relation) => ({
    candidateId: relation.candidateId,
    stage: stageIdByName[relation.stage],
    at,
    seeded: true,
    history: [{ stage: stageIdByName[relation.stage], at }],
  }));
}

export function seedRelation(candidateId, positionId) {
  return candidatePositionRelations.find(
    (relation) => relation.candidateId === candidateId && relation.positionId === positionId,
  );
}

// Last move recorded after the seed (drag on the board or a confirmed move in a conversation).
export function lastMove(entry) {
  const history = entry?.history || [];
  return history.length > 1 ? history[history.length - 1] : null;
}

// Relations of one candidate, read from the store when it has the position, otherwise from the seed.
export function candidateRelations(state, candidateId) {
  const fromStore = (state?.positions || [])
    .filter((position) => !position.deletedAt)
    .flatMap((position) =>
      (position.pipeline || [])
        .filter((entry) => entry.candidateId === candidateId)
        .map((entry) => ({ position, entry })),
    );
  const rows = fromStore.length
    ? fromStore
    : candidatePositionRelations
        .filter((relation) => relation.candidateId === candidateId)
        .map((relation) => ({
          position: positions.find((item) => item.id === relation.positionId),
          entry: { candidateId, stage: stageIdByName[relation.stage], history: [] },
        }));
  return rows.map(({ position, entry }) => {
    const seed = seedRelation(candidateId, position?.id);
    const move = lastMove(entry);
    const stage = stageNameById[entry.stage] || entry.stage;
    return {
      positionId: position?.id,
      positionName: position?.name || "已删除的岗位",
      company: position?.company || "",
      stage,
      stageId: entry.stage,
      active: activeStageIds.includes(entry.stage),
      note: move ? move.note || "" : seed?.note || "",
      summary: move
        ? `今天从${stageNameById[move.from] || "上一阶段"}进入${stage}${move.note ? ` · ${move.note}` : ""}`
        : seed?.summary || (seed?.note ? `${stage} · ${seed.note}` : stage),
      actor: move?.actor || "",
      taskRoute: move?.taskId ? `/tasks/${move.taskId}` : "",
    };
  });
}

// Stage label for the candidate list’s 流程 column.
export function candidatePipelineLabel(state, candidateId, fallback) {
  const relation = candidateRelations(state, candidateId)[0];
  return relation
    ? { pipeline: relation.stage, pipelineActive: relation.active }
    : { pipeline: fallback?.pipeline || "未进入流程", pipelineActive: Boolean(fallback?.pipelineActive) };
}
