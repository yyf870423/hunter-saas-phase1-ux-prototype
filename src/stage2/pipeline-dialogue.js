// Moving candidates through a position's stages from a task conversation (design 06 §7.5, 02 §7.14).
// Example: “陈楚宁约了一面，梁辰二面过了、进谈薪，周明远客户没通过” →
//   Hunter lists every person with current → target stage and the user's words as the note, then asks
//   “是否执行？请回复“是”“否”，或单独调整某一位。”; “周明远先不动，其他是” writes only the other two.
// Nothing is written before the user confirms; each move records that Hunter made it at the user's request.
import { candidates } from "../stage4/data.js";
import { stageNameById } from "../stage4/pipeline-relations.js";

// Later words win when a sentence names two stages (“二面过了、进谈薪” → 谈薪).
const stageWords = [
  [/没通过|未通过|没过|落选|淘汰/g, "rejected"],
  [/候选人不合适|不合适/g, "unsuitable"],
  [/放弃|不考虑了/g, "withdrawn"],
  [/入职/g, "joined"],
  [/谈薪|谈 ?offer/gi, "offer"],
  [/二面/g, "interview-2"],
  [/一面/g, "interview-1"],
  [/已推荐|推荐给客户|推给客户/g, "recommended"],
  [/储备/g, "reserve"],
];

const confirmAll = /^(是|是的|好|好的|确认|可以|执行|没问题)[。！!，, ]*$/;
const declineAll = /^(否|不用|不了|取消|算了|先不改)[。！!，, ]*$/;
const holdWords = /先不动|不动|不改|不用改|先别|除外|保持/;
const restWords = /其他|其余|别的|剩下/;

function lastStage(text) {
  let found = null;
  for (const [pattern, stage] of stageWords) {
    for (const match of text.matchAll(pattern)) {
      if (!found || match.index >= found.index) found = { index: match.index, stage };
    }
  }
  return found?.stage || "";
}

const namesIn = (text, people) =>
  people
    .map((person) => ({ person, index: text.indexOf(person.name) }))
    .filter((item) => item.index >= 0)
    .sort((a, b) => a.index - b.index)
    .map((item) => item.person);

const cleanNote = (text, people) =>
  people
    .reduce((value, person) => value.split(person.name).join(""), text)
    .replace(/^[\s和、及与都也，,；;]+/, "")
    .replace(/[。；;，,\s]+$/, "")
    .trim();

// Parse a message into moves for the position's pipeline. Returns [] when the message names no stage.
export function parsePipelineMessage(text, position) {
  const pipeline = position?.pipeline || [];
  const people = candidates;
  const clauses = text.split(/[，,；;。\n]/).map((part) => part.trim()).filter(Boolean);
  const groups = [];
  for (const clause of clauses) {
    const names = namesIn(clause, people);
    if (names.length || !groups.length) groups.push({ names, text: clause });
    else groups[groups.length - 1].text += "，" + clause;
  }
  const items = [];
  for (const group of groups) {
    const target = lastStage(group.text);
    if (!target || !group.names.length) continue;
    for (const person of group.names) {
      const entry = pipeline.find((item) => item.candidateId === person.id);
      items.push({
        candidateId: person.id,
        name: person.name,
        from: entry?.stage || "",
        stage: target,
        add: !entry,
        note: cleanNote(group.text, group.names),
      });
    }
  }
  return items;
}

const stageName = (id) => stageNameById[id] || id;

export function draftMarkdown(draft, positionName) {
  const lines = draft.items.map((item) =>
    item.add
      ? `- ${item.name}：加入岗位储备，并推进到${stageName(item.stage)}，备注“${item.note}”`
      : item.from === item.stage
        ? `- ${item.name}：已在${stageName(item.stage)}，不用改`
        : `- ${item.name}：${stageName(item.from)} → ${stageName(item.stage)}，备注“${item.note}”`,
  );
  const heldText = draft.held?.length
    ? `\n\n${draft.held.map((item) => `${item.name}保持${stageName(item.from)}`).join("，")}，不改。`
    : "";
  return `将更新「${positionName}」的流程：\n\n${lines.join("\n")}${heldText}\n\n是否执行？请回复“是”“否”，或单独调整某一位。`;
}

// The user's reply to a pending draft: confirm all, decline, hold some people, or change someone's target.
export function replyToDraft(text, draft) {
  const trimmed = text.trim();
  if (confirmAll.test(trimmed)) return { action: "apply", items: draft.items, held: draft.held };
  if (declineAll.test(trimmed)) return { action: "decline" };
  const named = namesIn(trimmed, draft.items.map((item) => ({ id: item.candidateId, name: item.name })));
  if (named.length && holdWords.test(trimmed)) {
    const heldIds = new Set(named.map((person) => person.id));
    const items = draft.items.filter((item) => !heldIds.has(item.candidateId));
    const heldItems = draft.items.filter((item) => heldIds.has(item.candidateId));
    const held = [...(draft.held || []), ...heldItems];
    if (restWords.test(trimmed) && /是|确认|执行|可以|好/.test(trimmed.replace(holdWords, "")))
      return { action: "apply", items, held };
    return { action: "redraft", draft: { ...draft, items, held } };
  }
  const stage = lastStage(trimmed);
  if (named.length && stage) {
    const ids = new Set(named.map((person) => person.id));
    return {
      action: "redraft",
      draft: {
        ...draft,
        items: draft.items.map((item) =>
          ids.has(item.candidateId) ? { ...item, stage, note: cleanNote(trimmed, named) || item.note } : item,
        ),
      },
    };
  }
  return { action: "ask" };
}

export function resultMarkdown(applied, held, positionId, positionName) {
  const moved = applied.filter((item) => item.from !== item.stage || item.add);
  const lines = moved.map((item) =>
    item.add
      ? `- ${item.name}：加入岗位储备 → ${stageName(item.stage)}`
      : `- ${item.name}：${stageName(item.from)} → ${stageName(item.stage)}`,
  );
  const heldText = held?.length
    ? `\n\n${held.map((item) => `${item.name}保持${stageName(item.from)}`).join("，")}，没有改动。`
    : "";
  const links = [
    `[查看岗位泳道](#/positions/${positionId}?tab=pipeline)`,
    ...moved.map((item) => `[${item.name}](#/candidates/${item.candidateId}?tab=matching)`),
  ].join(" · ");
  return `已更新「${positionName}」的流程，写入 ${moved.length} 条推进记录，记录里写明由 Hunter 按对话要求执行：\n\n${lines.join("\n")}${heldText}\n\n岗位泳道、候选人页的岗位推进和岗位人才梳理已同步。\n\n${links}`;
}
