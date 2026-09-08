export const organizationScope = [
  {
    id: "xinglan",
    name: "星澜机器人",
    organization: "具身智能中心",
    roles: [
      {
        id: "vla",
        team: "VLA 算法组",
        title: "VLA 算法负责人",
        name: "赵星羽",
        candidateId: "candidate-zhaoxingyu",
        evidence: "公开履历",
        summary: "负责 VLA 技术路线、真机部署与团队管理。",
      },
      {
        id: "learning",
        team: "机器人学习组",
        title: "机器人学习负责人",
        gap: "任职人待核实；未发现公开任职资料，不等于该职位空缺。",
      },
      {
        id: "research",
        team: "VLA 算法组",
        title: "机器人学习研究员",
        name: "王奕",
        decisionKey: "wangyi",
        evidence: "论文作者信息",
        gap: "同名作者与活动名单的单位时间线存在冲突；不自动关联候选人。",
      },
    ],
  },
  {
    id: "tuojie",
    name: "拓界机器人",
    organization: "智能操作部",
    roles: [
      {
        id: "head",
        title: "技术负责人",
        gap: "任职人及任职时间待核实；保留关键岗位位置。",
      },
      {
        id: "learning",
        team: "策略学习团队",
        title: "机器人学习负责人",
        name: "林昊",
        candidateId: "candidate-linhao",
        evidence: "Hunter 候选人档案",
        summary: "负责操作策略、真机部署与机器人学习团队。",
      },
    ],
  },
  {
    id: "qiongding",
    name: "穹顶智能",
    organization: "具身算法平台",
    roles: [
      {
        id: "head",
        title: "具身智能算法总监",
        name: "周明远",
        evidence: "公开履历",
        decisionKey: "qiongding",
        gap: "已定位任职人线索；与具身算法平台的具体汇报关系待核实。",
      },
    ],
  },
  {
    id: "lingyue",
    name: "灵跃科技",
    organization: "灵巧手算法组",
    roles: [
      {
        id: "vla",
        title: "VLA 算法负责人",
        name: "陈楚宁",
        candidateId: "candidate-chenchuning",
        evidence: "Hunter 候选人档案",
        summary: "负责灵巧操作、模仿学习与算法交付。",
      },
    ],
  },
];

export const organizationRoles = organizationScope.flatMap((company) =>
  company.roles.map((role) => ({
    ...role,
    companyId: company.id,
    company: company.name,
  })),
);

export function organizationViews(decisions = {}, scope = organizationScope) {
  return scope.map((company) => {
    const rootId = "company-" + company.id;
    const orgId = "organization-" + company.id;
    const node = (data) => ({
      status: "已核验",
      tone: "success",
      facts: [
        ["所属公司", company.name],
        ["观察时间", "2026-09-08"],
      ],
      evidence: ["公司官网", "公开招聘页"],
      ...data,
    });
    const edge = (source, target, label, extra = {}) => ({
      id: source + "--" + target,
      source,
      target,
      label,
      status: "已核验",
      tone: "success",
      observedAt: "2026-09-08",
      evidence: ["公开招聘页"],
      ...extra,
    });
    const nodes = [
      node({
        id: rootId,
        label: company.name,
        meta: "目标公司",
        kind: "company",
        x: 25,
        y: 185,
        summary: "本轮组织梳理范围",
        detailPath: "/companies/company-" + company.id,
      }),
      node({
        id: orgId,
        label: company.organization,
        meta: "部门 / 团队",
        kind: "organization",
        x: 230,
        y: 185,
        summary: "已定位组织；下属关键岗位与任职人分别核验。",
      }),
    ];
    const edges = [edge(rootId, orgId, "组织隶属")];
    const teams = [
      ...new Set(company.roles.map((role) => role.team).filter(Boolean)),
    ];
    const roleX = teams.length ? 650 : 440;
    teams.forEach((team, index) => {
      const id = company.id + "-team-" + index;
      nodes.push(
        node({
          id,
          label: team,
          meta: "方向团队",
          kind: "organization",
          x: 440,
          y: 90 + index * 200,
          summary: "已定位方向团队；岗位职责与任职人继续分别核实。",
        }),
      );
      edges.push(edge(orgId, id, "下属团队"));
    });
    company.roles.forEach((role, index) => {
      const roleId = company.id + "-role-" + role.id;
      const personId = company.id + "-person-" + role.id;
      const confirmed =
        role.decisionKey && decisions[role.decisionKey] === "write";
      const pending = Boolean(role.decisionKey && !confirmed);
      nodes.push(
        node({
          id: roleId,
          label: role.title,
          meta: role.team || "关键岗位",
          kind: "position",
          x: roleX,
          y: 45 + index * 155,
          status: role.name
            ? pending
              ? "关系待核实"
              : "已定位任职人"
            : "任职人待核实",
          tone: role.gap && !confirmed ? "warning" : "success",
          summary: role.gap || role.summary,
          facts: [
            ["所属公司", company.name],
            ["方向团队", role.team || company.organization],
            ["任职人", role.name || "待核实"],
            ["任职时间", "最近公开资料可见，起止时间待补充"],
          ],
        }),
      );
      edges.push(
        edge(
          role.team ? company.id + "-team-" + teams.indexOf(role.team) : orgId,
          roleId,
          pending && role.decisionKey === "qiongding"
            ? "汇报关系待核实"
            : "关键岗位",
          {
            status:
              pending && role.decisionKey === "qiongding" ? "待核实" : "已核验",
            tone:
              pending && role.decisionKey === "qiongding"
                ? "warning"
                : "success",
            decisionKey:
              role.decisionKey === "qiongding" ? role.decisionKey : undefined,
          },
        ),
      );
      if (!role.name) return;
      nodes.push(
        node({
          id: personId,
          label: role.name,
          meta: role.title,
          kind: "person",
          x: roleX + 230,
          y: 45 + index * 155,
          status: pending
            ? "待核实"
            : role.candidateId
              ? "已关联候选人"
              : confirmed
                ? "用户确认"
                : "人物线索",
          tone: pending ? "warning" : "success",
          summary: role.gap || role.summary,
          evidence: [role.evidence],
          decisionKey: role.decisionKey,
          detailPath: role.candidateId
            ? "/candidates/" + role.candidateId
            : undefined,
          facts: [
            ["当前公司", company.name],
            ["当前职位", role.title],
            ["任职时间", "起止时间待补充"],
            ["资料状态", role.gap || "已定位，最新任职仍需持续核验"],
          ],
        }),
      );
      edges.push(
        edge(
          roleId,
          personId,
          pending && role.decisionKey === "wangyi" ? "疑似任职" : "任职人",
          {
            status: pending ? "待核实" : "已核验",
            tone: pending ? "warning" : "success",
            evidence: [role.evidence],
            decisionKey: role.decisionKey,
          },
        ),
      );
    });
    return {
      id: "organization-" + company.id,
      label: company.name,
      title: company.name + "组织与关键岗位",
      description: "公司、组织、关键岗位与任职人；待核实项不作为已确认事实。",
      defaultSelection: { kind: "node", id: rootId },
      nodes,
      edges,
    };
  });
}

export function organizationGraphPages(
  decisions = {},
  scope = organizationScope,
) {
  return organizationViews(decisions, scope).map((view) => ({
    id: view.id,
    name: view.label,
    type: "人才地图",
    description: view.description,
    updatedAt: "刚刚",
    nodes: view.nodes.map((node) => ({
      ...node,
      subtitle: node.meta,
      sourceType: node.detailPath ? "asset" : "analysis",
      assetPath: node.detailPath,
      assetType: node.detailPath
        ? node.kind === "company"
          ? "公司"
          : "候选人"
        : undefined,
      sourceTaskId: "mapping-embodied",
      width: 180,
      status: node.tone === "warning" ? "review" : "normal",
      parentId: view.edges.find(
        (edge) => edge.target === node.id && edge.tone !== "warning",
      )?.source,
    })),
    edges: view.edges.map((edge) => ({
      ...edge,
      kind: "local",
      status: edge.tone === "warning" ? "review" : "normal",
    })),
  }));
}

export function organizationBatchId(scope = organizationScope) {
  return (
    "organization-20260908-1-" +
    scope
      .map((company) => company.id)
      .sort()
      .join("-")
  );
}

export function organizationOutcome(scope = organizationScope) {
  const roles = scope.flatMap((company) => company.roles);
  return {
    text: "将已审核组织与任职人更新到目标公司人才地图，保留待核实项。",
    result: `## 人才地图已更新\n\n已按 ${scope.length} 家公司保存组织与关键岗位图页：${roles.length} 个关键岗位、${roles.filter((role) => role.name).length} 位任职人或人物线索。任职人未知、身份冲突和汇报关系缺口均明确保留，没有加入任何岗位储备。\n\n[查看人才地图](#/mappings/mapping-embodied?page=organization-${scope[0].id}) · [查看来源任务](#/tasks/mapping-embodied)`,
  };
}

export function organizationRemainingWork(scope = organizationScope) {
  return (
    "### 待补充信息与下一步\n\n" +
    scope
      .flatMap((company) =>
        company.roles
          .filter((role) => role.gap)
          .map(
            (role) =>
              "- " + company.name + " · " + role.title + "：" + role.gap,
          ),
      )
      .join("\n") +
    "\n\n补充可核验的任职时间和组织来源，按本轮公司范围定向核实；已保存成果保留，不自动扩大范围。"
  );
}
