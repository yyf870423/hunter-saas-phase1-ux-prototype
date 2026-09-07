import { companies, opportunities, positions, positionDetail } from "./data.js";
import { PIPELINE_STAGES } from "./opportunity-domain.js";
import { legacyLearningJd as learningJd } from "./opportunity-jd.js";

const createdAt = "2026-08-20T01:00:00.000Z";
const seedDirections = {
  "opportunity-xinglan": [
    { id: "direction-vla", name: "VLA 算法负责人", requirement: "负责 VLA 技术路线与团队交付", jd: positionDetail.jd, positionId: "position-vla" },
    { id: "direction-learning", name: "机器人学习负责人", requirement: "负责操作策略研发与真机交付", missing: "完整 JD、薪酬、人数、汇报关系待确认" },
    { id: "direction-data", name: "数据闭环工程师", requirement: "负责采集、清洗与训练数据质量", missing: "职责边界、任职要求待补充" },
    { id: "direction-simulation", name: "仿真平台工程师", requirement: "负责机器人仿真平台", positionId: "position-simulation" },
  ],
  "opportunity-tuojie": [
    { id: "direction-tuojie-platform", name: "数据平台负责人", requirement: "负责机器人数据平台与工程团队", positionId: "position-platform" },
    { id: "direction-tuojie-learning", name: "机器人学习负责人", requirement: "补强机器人操作策略", missing: "完整 JD 待补充" },
  ],
  "opportunity-lingyue": [
    { id: "direction-hand", name: "灵巧手结构工程师", requirement: "负责结构设计与量产", positionId: "position-hand" },
    { id: "direction-drive", name: "驱动工程师", requirement: "负责驱动系统", status: "不再推进", closeReason: "客户已内部补齐" },
    { id: "direction-manufacturing", name: "量产工程师", requirement: "负责量产工艺", status: "不再推进", closeReason: "本轮需求取消" },
  ],
  "opportunity-qiongding": [
    { id: "direction-decision", name: "多模态决策算法", requirement: "产品线决策模块", missing: "HC、职责和任职要求待确认" },
    { id: "direction-product", name: "机器人产品经理", requirement: "新产品线需求管理", missing: "预算与到岗周期待确认" },
  ],
};

export function createOpportunitySeed() {
  const opportunityRecords = opportunities.map((item) => ({
    ...item, companyId: companies.find((company) => company.name === item.company)?.id || "",
    contactId: ({ "opportunity-xinglan": "contact-chenyu", "opportunity-tuojie": "contact-zhangmin" })[item.id] || "",
    priority: "普通", people: item.id === "opportunity-xinglan" ? "20 - 25 人" : "",
    period: item.id === "opportunity-xinglan" ? "2026.07 - 2026.12" : "", requirements: "", missing: "",
    evidence: item.id === "opportunity-xinglan" ? item.evidence + "。客户明确表示 VLA 算法负责人和数据平台负责人优先，其他方向可以分批推进。" : item.evidence,
    directions: seedDirections[item.id].map((direction) => ({
      ...direction, positionId: direction.positionId || "",
      status: direction.positionId ? "已形成或关联岗位" : direction.status || "待处理", createdAt,
    })),
    records: [], history: [{ id: "history-" + item.id, at: createdAt, content: "创建招聘机会" }],
    sources: item.id === "opportunity-xinglan" ? [
      { id: "source-xinglan-mail", kind: "reply", label: "客户邮件确认", content: "陈雨确认招聘方向与优先级", at: "2026-08-20T10:20:00.000Z" },
      { id: "source-xinglan-recruiting", kind: "link", label: "公开招聘页面", content: "新增 9 个机器人算法和平台研发岗位", at: "2026-08-21T01:12:00.000Z" },
    ] : [{ id: "source-" + item.id, kind: "manual", label: "原型初始需求依据", content: item.evidence, at: createdAt }],
    version: 1, createdAt, updatedAt: createdAt, deletedAt: null,
  }));
  const positionRecords = positions.map((item) => {
    const opportunity = opportunityRecords.find((entry) => entry.directions.some((direction) => direction.positionId === item.id));
    const direction = opportunity?.directions.find((entry) => entry.positionId === item.id);
    return {
      ...item, companyId: companies.find((company) => company.name === item.company)?.id || "",
      jd: item.id === "position-vla" ? positionDetail.jd :
        "岗位职责\n负责" + item.name + "相关研发与项目交付。\n\n任职要求\n具有" + item.skills.join("、") + "相关项目经验，能够独立完成设计、验证和工程协作。",
      salary: item.id === "position-vla" ? positionDetail.salary : "",
      experience: item.id === "position-vla" ? positionDetail.experience : "",
      education: item.id === "position-vla" ? positionDetail.education : "",
      legacyCounts: { matches: item.matches, reserve: item.reserve, progress: item.progress, hired: item.hired, failed: item.failed },
      managed: false, matches: [], pipeline: [], stages: structuredClone(PIPELINE_STAGES),
      processing: [], versions: [], sources: [], version: 1, createdAt, updatedAt: createdAt, deletedAt: null,
      origin: { opportunityId: opportunity?.id || "", directionId: direction?.id || "", taskId: "", label: opportunity?.title || "用户创建" },
    };
  });
  return { schemaVersion: 1, revision: 0, clock: null, opportunities: opportunityRecords,
    positions: positionRecords, tasks: [], followups: [], notifications: [], tombstones: [],
    commands: {}, imports: [], files: [] };
}

export const opportunityDemoInput = {
  company: "澄岳机器人",
  title: "澄岳机器人操作团队扩建",
  summary: "客户确认新一轮机器人操作团队扩建，需要机器人学习与仿真平台两个方向，人数和薪酬等待后续确认。",
  evidence: "2026-09-08 与招聘负责人电话沟通，确认两个方向有实际招聘需求。",
  prompt: "整理澄岳机器人这轮招聘需求。客户确认需要机器人学习工程师与仿真平台工程师，暂未确认薪酬。先形成招聘机会并保留待确认事项，不要启动找人。",
  algorithmJd: learningJd,
  simulationJd: "岗位职责\n建设机器人仿真环境与自动化评测流程，维护场景、传感器和操作任务的数据一致性。\n\n任职要求\n掌握 Python 或 C++，有机器人仿真平台和工程工具开发经历，能够与算法团队共同定位仿真到真机差异。",
};
