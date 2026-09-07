import { opportunityDemoInput } from "./opportunity-seed";

export const opportunityDemoCases = [
  { id: "chengyue", ...opportunityDemoInput, directionName: "机器人学习工程师", secondDirectionName: "仿真平台工程师" },
  { id: "linchuan", company: "临川自动化", title: "临川自动化视觉团队补强",
    summary: "客户确认补充工业视觉算法和测试平台两个方向，具体人数、薪酬与到岗日期待确认。",
    evidence: "2026-09-08 招聘负责人电话确认需求存在。",
    directionName: "工业视觉算法工程师", secondDirectionName: "视觉测试平台工程师",
    algorithmJd: "岗位职责\n负责工业零件视觉检测算法、数据分析与产线部署。\n\n任职要求\n掌握计算机视觉与 Python，有真实产线视觉项目交付经验。",
    simulationJd: "岗位职责\n建设工业视觉模型的自动化测试和回归评测平台，管理缺陷样本与部署质量。\n\n任职要求\n熟悉 Python、测试开发和图像数据处理，具有工程工具开发经验。" },
];

export function demoOpportunityPrompt(example) {
  return "请核对以下已确认招聘需求，形成招聘机会，暂不创建岗位或开始找人。\n\n公司：" + example.company +
    "\n机会名称：" + example.title + "\n招聘需求摘要：" + example.summary + "\n需求依据：" + example.evidence +
    "\n待确认事项：薪资、人数、汇报关系、到岗时间；猎头合作预算与候选人薪酬分别确认。" +
    "\n招聘方向 JSON：" + JSON.stringify([{ name: example.directionName, requirement: "客户确认本轮计划招聘" }, { name: example.secondDirectionName, requirement: "客户确认本轮计划招聘" }]);
}
