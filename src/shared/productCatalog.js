// Pricing follows the pricing doc (2026-09-28): tiered subscription + one unit for running, Credits,
// + storage that can be expanded on its own. Billing is by measured resources converted to Credits, not
// by the number of Agent runs. Every number here is an example for discussion, not a final price.
// Three tiers, renamed on 2026-10-28 (product owner): 基础版 / 标准版 / 专业版 — all for a single headhunter (the
// top tier is no longer “团队版”; team members and sharing stay in phase 2). A subscription can only move up a
// tier, never down: the page offers “升级套餐” and nothing once the top tier is reached. Re-subscribing after the
// subscription has ended is a new subscription and can pick any tier.
export const subscriptionPlans = {
  basic: {
    name: "基础版",
    monthlyName: "基础版月付",
    monthlyPrice: 199,
    monthlyCredits: 10000,
    storageGb: 5,
    description: "单人工作空间",
  },
  standard: {
    name: "标准版",
    monthlyName: "标准版月付",
    monthlyPrice: 399,
    monthlyCredits: 25000,
    storageGb: 30,
    description: "更高用量与容量",
  },
  professional: {
    name: "专业版",
    monthlyName: "专业版月付",
    monthlyPrice: 899,
    monthlyCredits: 60000,
    storageGb: 100,
    description: "最高用量与容量",
  },
};

// Lowest to highest; upgrades only go to the right.
export const planOrder = ["basic", "standard", "professional"];
export const planRank = (key) => planOrder.indexOf(key);
export const planKeyByName = (name) => planOrder.find((key) => subscriptionPlans[key].name === name);
export const isTopPlan = (key) => planRank(key) === planOrder.length - 1;

// Add-ons are bought separately: Credits by topping up an amount, storage blocks monthly.
export const addOns = {
  storage: { gb: 10, monthlyPrice: 20 },
};

// Top-up (decision 2026-10-28, replaces the Credits pack): pay an amount, converted to Credits at the rate
// in force when the payment succeeds; the Credits then follow 12 §11.5 (valid 12 months from arrival).
// The rate is not decided yet — ¥1 = 100 Credits is an example (same as the old 10,000 / ¥100 pack).
// Phase 1 top-up only supports WeChat Pay: a QR code on desktop, a jump to WeChat on phones.
export const recharge = {
  rate: 100,
  presets: [50, 100, 200, 500],
  min: 10,
  max: 5000,
  qrMinutes: 15,
  methods: ["微信支付"],
};

export const rechargeCredits = (amount) => Math.floor(Number(amount) * recharge.rate);

// Trial (decision 2026-10-27): 30 days, one-time experience Credits with a hard cap, high-cost external
// data off by default, stops when used up; storage as the basic plan.
export const trialGrant = { days: 30, credits: 1000, storageGb: 5 };

export const formatCredits = (value) => Number(value).toLocaleString("zh-CN");

const planChoice = (key) => ({
  key,
  title: subscriptionPlans[key].name,
  price: `¥${subscriptionPlans[key].monthlyPrice} / 月`,
  description: `每月 ${formatCredits(subscriptionPlans[key].monthlyCredits)} Credits，基础空间 ${subscriptionPlans[key].storageGb} GB，${subscriptionPlans[key].description}`,
});

export const subscriptionPlanChoices = planOrder.map(planChoice);

export function formatCny(amount) {
  return `¥ ${Number(amount).toFixed(2)}`;
}
