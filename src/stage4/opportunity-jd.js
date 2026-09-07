export const legacyLearningJd = "岗位职责\n负责机器人学习策略研发、训练评测与真机部署，推进操作任务从实验验证到稳定交付。\n\n任职要求\n有机器人学习、强化学习或模仿学习经验，具备真实机器人项目交付经历。";

export function directionJdInfo(direction, opportunity, position) {
  if (!direction?.jd && position?.jd) return {
    text: position.jd, raw: position.jd, source: null, positionId: position.id,
    label: position.managed ? "已关联岗位 JD · v" + position.version : "原型已有岗位资料",
  };
  const raw = direction?.jd || "";
  const source = opportunity?.sources?.find((item) => item.id === direction?.jdSourceId);
  const legacy = !direction?.jdSourceId && ["direction-learning", "direction-tuojie-learning"].includes(direction?.id) && raw === legacyLearningJd;
  const label = legacy ? "历史原型样例，未取得客户 JD" : !raw ? "尚未取得 JD" : source ? source.label :
    direction.jdSourceId === "manual" ? "用户录入" : direction.id === "direction-vla" && !direction.jdSourceId ? "原型已有岗位资料" : "历史录入，来源未记录";
  return { text: legacy ? "" : raw, raw, source, legacy, label };
}

export function directionJdSource(direction, opportunity, jd) {
  const info = directionJdInfo(direction, opportunity);
  if (!jd) return { id: "source-jd-" + crypto.randomUUID(), kind: "manual", label: "尚未取得 JD", content: "" };
  if (jd === info.text && info.source) return info.source;
  return { id: "source-jd-" + crypto.randomUUID(), kind: "manual",
    label: jd === info.text && info.text ? info.label : "本次用户输入 JD", content: jd };
}
