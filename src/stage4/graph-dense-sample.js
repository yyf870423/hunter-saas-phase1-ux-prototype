export function createDenseGraphPage() {
  const nodes = [{ id: "org-xinglan", label: "星澜机器人", kind: "company", x: 48, y: 160, subtitle: "虚构密集样例", sourceType: "local", status: "normal", sources: [] }];
  const specialIds = ["org-zhao", "org-wang", "org-linhao", "org-hejing", "org-sun"];
  const people = [];
  for (let department = 0; department < 4; department++) {
    const departmentId = department === 0 ? "org-center" : `dense-department-${department}`;
    nodes.push({ id: departmentId, label: ["具身智能中心", "平台工程中心", "芯片研发中心", "机器人研发中心"][department], kind: "organization", parentId: "org-xinglan", x: 320, y: 80 + department * 130, subtitle: "研发组织", sourceType: "local", status: "normal", sources: [] });
    for (let team = 0; team < 4; team++) {
      const teamIndex = department * 4 + team;
      const teamId = teamIndex === 0 ? "org-vla" : `dense-team-${teamIndex}`;
      nodes.push({ id: teamId, label: `${["模型算法", "基础设施", "硬件系统", "控制工程"][team]}组 ${department + 1}`, kind: "organization", parentId: departmentId, x: 590, y: 72 + teamIndex * 35, subtitle: "技术团队", sourceType: "local", status: "normal", sources: [] });
      for (let person = 0; person < 4; person++) {
        const index = teamIndex * 4 + person;
        const node = { id: specialIds[index] || `dense-person-${index}`, label: ["赵星羽", "王奕", "林昊", "何静", "孙若凡"][index] || `研发成员 ${String(index + 1).padStart(2, "0")}`, kind: "person", parentId: teamId, x: 860 + (index % 2) * 12, y: 72 + index * 12, subtitle: "虚构研究员", sourceType: "local", status: index === 1 ? "review" : "normal", sources: [] };
        nodes.push(node);
        people.push(node);
      }
    }
  }
  const edges = nodes.filter(node => node.parentId).map(node => ({ id: `dense-edge-${node.id}`, source: node.parentId, target: node.id, label: node.kind === "person" ? "研发任职" : "下属组织", kind: "local", status: "normal", evidence: [] }));
  for (let index = 0; index < 16; index++) edges.push({ id: `dense-cross-${index}`, source: people[index * 4].id, target: people[(index * 4 + 13) % people.length].id, label: "跨组协作", kind: "derived", status: "normal", evidence: [] });
  return { id: "organization", name: "密集组织关系样例", description: "虚构验收样例", nodes, edges };
}
