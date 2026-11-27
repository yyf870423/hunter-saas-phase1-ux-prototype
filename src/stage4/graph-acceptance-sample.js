export const stressGraphSample = {
    id: "mapping-stress",
    name: "1201 节点压力测试图谱",
    description: "【原型说明，正式实现不展示】1201 个节点、1280 条连线的虚构测试数据。",
    typeId: "talent-map",
    pageIds: ["stress-1201"],
    pageCount: 1,
    nodeCount: 1201,
    linkedAssets: 0,
    pending: 0,
    updatedAt: "今天",
    pages: [{ id: "stress-1201", name: "压力测试", type: "人才地图", description: "虚构压力测试数据", ...createGraphStressSample() }],
};

export function createGraphInteractionSample() {
    const rows = [
        ["org-xinglan", "星澜机器人（样例）", "company", null, 60, 220],
        ["preview-algorithm", "模型算法团队", "organization", "org-xinglan", 340, 130],
        ["preview-hardware", "硬件研发团队", "organization", "org-xinglan", 340, 370],
        ["preview-chen", "陈砚（样例）", "person", "preview-algorithm", 640, 70],
        ["preview-lin", "林望（样例）", "person", "preview-algorithm", 640, 190],
        ["preview-zhou", "周澄（样例）", "person", "preview-hardware", 640, 320],
        ["preview-xu", "许知（样例）", "person", "preview-hardware", 640, 440],
    ];
    const nodes = rows.map(([id, label, kind, parentId, x, y], order) => ({ id, label, kind, parentId, x, y, order, page: 0, status: "normal", sourceType: "local", width: 180, userMoved: false, hidden: false, mentions: [] }));
    const edges = nodes.filter(n => n.parentId).map(n => ({ id: `preview-edge-${n.id}`, source: n.parentId, target: n.id, label: n.kind === "person" ? "研发任职" : "下属团队", kind: "local", status: "normal", evidence: [], origin: "hierarchy", editable: false, hidden: false }));
    return { nodes, edges };
}
export function createGraphStressSample() {
    const nodes = [], people = [];
    const add = (id, label, kind, parentId, x, y) => {
        nodes.push({ id, label, kind, parentId, x, y, page: 0, order: nodes.length, status: "normal", sourceType: "local", width: 180, userMoved: false, hidden: false, mentions: [] });
    };
    add("org-xinglan", "压力测试组织（虚构）", "company", null, -240, 2320);
    for (let team = 0; team < 40; team++) {
        const id = `stress-team-${team}`, x = 60 + team % 8 * 1250, y = 80 + Math.floor(team / 8) * 1030;
        add(id, `研发团队 ${team + 1}（样例）`, "organization", "org-xinglan", x, y);
        people[team] = [];
        for (let person = 0; person < 29; person++) {
            const personId = `stress-person-${team}-${person}`;
            add(personId, `研究成员 ${team * 29 + person + 1}（样例）`, "person", id, x + 230 + person % 5 * 190, y + 150 + Math.floor(person / 5) * 130);
            people[team].push(personId);
        }
    }
    const edges = nodes.filter(node => node.parentId).map(node => ({ id: `stress-edge-${node.id}`, source: node.parentId, target: node.id, label: node.kind === "person" ? "研发任职" : "下属团队", kind: "local", status: "normal", evidence: [], origin: "hierarchy", editable: false, hidden: false }));
    for (let team = 0; team < 40; team++)
        for (let link = 0; link < 2; link++)
            edges.push({ id: `stress-cross-${team}-${link}`, source: people[team][link * 7], target: people[(team + 1) % 40][link * 7 + 3], label: "跨组协作", kind: "derived", status: "normal", evidence: [], origin: "derived", editable: false, hidden: false });
    return { nodes, edges };
}
