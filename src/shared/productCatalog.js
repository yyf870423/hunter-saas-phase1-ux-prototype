export const subscriptionPlans = {
  basic: {
    name: "基础版",
    monthlyName: "基础版月付",
    monthlyPrice: 199,
    agentTaskQuota: 20,
    description: "适合轻量使用",
  },
  professional: {
    name: "专业版",
    monthlyName: "专业版月付",
    monthlyPrice: 399,
    yearlyName: "专业版年付",
    yearlyPrice: 3990,
    agentTaskQuota: 50,
    description: "提供完整自动化能力",
  },
};

export const subscriptionPlanChoices = [
  {
    title: subscriptionPlans.basic.name,
    price: `¥${subscriptionPlans.basic.monthlyPrice} / 月`,
    description: `${subscriptionPlans.basic.agentTaskQuota} 次 Agent 用量，${subscriptionPlans.basic.description}`,
  },
  {
    title: subscriptionPlans.professional.name,
    price: `¥${subscriptionPlans.professional.monthlyPrice} / 月`,
    description: `${subscriptionPlans.professional.agentTaskQuota} 次 Agent 用量和${subscriptionPlans.professional.description}`,
  },
  {
    title: subscriptionPlans.professional.yearlyName,
    price: `¥${subscriptionPlans.professional.yearlyPrice.toLocaleString("zh-CN")} / 年`,
    description: "相当于免费使用两个月",
  },
];

export function formatCny(amount) {
  return `¥ ${Number(amount).toFixed(2)}`;
}
