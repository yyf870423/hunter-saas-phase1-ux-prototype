export function updatePositionTalentMap(position, people, taskId, now) {
  const previous = position.talentMap || { version: 0, rows: [], sources: [] };
  const rows = new Map(previous.rows.map((row) => [row.id, row]));
  for (const person of people) {
    const existing = rows.get(person.id);
    rows.set(person.id, {
      ...existing,
      ...person,
      title: person.title || person.role,
      sourceTaskId: taskId || existing?.sourceTaskId || "",
      basis:
        person.strength || existing?.basis || "已按当前岗位要求完成人选审核。",
      risk:
        person.risk ||
        existing?.risk ||
        "求职意向、可到岗时间与最新履历仍需联系核实。",
      source:
        person.source || existing?.source || "Hunter 候选人资料与岗位审核",
      updatedAt: now,
    });
  }
  const changed = [...rows.values()].some((row) => {
    const old = previous.rows.find((entry) => entry.id === row.id);
    return (
      !old ||
      Object.keys(row).some(
        (key) =>
          key !== "updatedAt" &&
          JSON.stringify(row[key]) !== JSON.stringify(old[key]),
      )
    );
  });
  if (!changed) return previous;
  position.talentMap = {
    version: previous.version + 1,
    rows: [...rows.values()],
    updatedAt: now,
    sourceTaskId: taskId || previous.sourceTaskId || "",
    sources: [...new Set([...previous.sources, taskId].filter(Boolean))],
  };
  return position.talentMap;
}

export function positionTalentRows(position) {
  return (position?.talentMap?.rows || []).map((person) => {
    const relation = position.pipeline.find(
      (entry) => entry.candidateId === person.id,
    );
    const stage =
      position.stages.find((entry) => entry.id === relation?.stage)?.name ||
      "未加入流程";
    return {
      ...person,
      stage,
      type: "正式候选人",
      detailPath: person.assetPath || "",
      hierarchyPath: [
        {
          id: "company-" + person.company,
          label: person.company,
          kind: "company",
        },
        {
          id: person.id,
          label: person.name,
          subtitle: person.title,
          kind: "person",
        },
      ],
    };
  });
}
