// Pricing follows the pricing doc (2026-09-28): tiered subscription + one unit for running, Credits,
// + storage that can be expanded on its own. Billing is by measured resources converted to Credits, not
// by the number of Agent runs. Every number here is an example for discussion, not a final price.
export const subscriptionPlans = {
  personal: {
    name: "个人版",
    monthlyName: "个人版月付",
    monthlyPrice: 199,
    monthlyCredits: 10000,
    storageGb: 5,
    description: "单人工作空间",
  },
  professional: {
    name: "专业版",
    monthlyName: "专业版月付",
    monthlyPrice: 399,
    monthlyCredits: 25000,
    storageGb: 30,
    description: "更高用量与容量",
  },
  team: {
    name: "团队版",
    monthlyName: "团队版月付",
    monthlyPrice: 899,
    monthlyCredits: 60000,
    storageGb: 100,
    description: "多人协作，阶段二提供",
    later: true,
  },
};

// Add-ons are bought separately: Credits packs once, storage blocks monthly.
export const addOns = {
  creditsPack: { credits: 10000, price: 100 },
  storage: { gb: 10, monthlyPrice: 20 },
};

// Trial (decision 2026-10-27): 30 days, one-time experience Credits with a hard cap, high-cost external
// data off by default, stops when used up; storage as the personal plan.
export const trialGrant = { days: 30, credits: 1000, storageGb: 5 };

export const formatCredits = (value) => Number(value).toLocaleString("zh-CN");

const planChoice = (plan) => ({
  title: plan.name,
  price: `¥${plan.monthlyPrice} / 月`,
  description: `每月 ${formatCredits(plan.monthlyCredits)} Credits，基础空间 ${plan.storageGb} GB，${plan.description}`,
  disabled: Boolean(plan.later),
});

export const subscriptionPlanChoices = [
  planChoice(subscriptionPlans.personal),
  planChoice(subscriptionPlans.professional),
  planChoice(subscriptionPlans.team),
];

export function formatCny(amount) {
  return `¥ ${Number(amount).toFixed(2)}`;
}
