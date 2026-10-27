// Client assessment on the company (design 07 §4.2): 付费潜力 and 合作风险, three levels + basis + update time, no scores.

export const assessmentLevels = ["有依据", "待确认", "有风险"];
export const assessmentTone = { 有依据: "success", 待确认: "warning", 有风险: "danger" };

const seeds = {
  "company-xinglan": {
    payment: {
      level: "有依据",
      basis: "2025 年 11 月完成数亿元 A 轮融资；招聘的是负责人级算法岗位；此前和两家猎头合作过。",
      source: "融资新闻稿 · 招聘页面 · 猎头补充",
      updatedAt: "9 月 1 日",
    },
    risk: {
      level: "待确认",
      basis: "公开经营和司法信息未见异常；是否已有独家合作猎头、账期多长查不到，等你补充。",
      source: "公开经营信息",
      updatedAt: "9 月 1 日",
    },
  },
};

const empty = {
  level: "待确认",
  basis: "还没有研判。可以在“公司调研”或客户开发任务里让 Hunter 研判，也可以自己填写。",
  source: "",
  updatedAt: "—",
};

export function companyAssessment(company) {
  const value = company?.assessment || seeds[company?.id] || {};
  return { payment: value.payment || empty, risk: value.risk || empty };
}

export function assessmentSummary(company) {
  const value = companyAssessment(company);
  return `付费潜力 ${value.payment.level} · 合作风险 ${value.risk.level}`;
}

// Delete impact for a company (design 04 §14.2, 07 §11.1): contacts go to the recycle bin together;
// opportunities and positions stay and show “公司已删除”.
export function companyDeleteImpact(companyIds, { contacts = [], opportunities = [], positions = [] }) {
  const ids = new Set(companyIds);
  const contactCount = contacts.filter((item) => ids.has(item.companyId) && !item.deletedAt).length;
  const opportunityCount = opportunities.filter(
    (item) => ids.has(item.companyId) && !item.deletedAt && item.status === "跟进中",
  ).length;
  const positionCount = positions.filter((item) => ids.has(item.companyId) && !item.deletedAt).length;
  const subject = ids.size > 1 ? `这 ${ids.size} 家公司` : "这家公司";
  return `${subject}有 ${contactCount} 位联系人会一起进回收站；还有 ${opportunityCount} 条跟进中的机会、${positionCount} 个岗位不会删除，会显示“公司已删除”。候选人和任务也不会删除。`;
}
