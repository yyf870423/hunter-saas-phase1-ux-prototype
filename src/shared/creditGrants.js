// Credits outside the monthly plan, one record per grant (design 12 §11.5, 13 §8.4).
// Rules:
// - Bought Credits are valid for 12 months from the day they arrive; whatever is left at expiry is taken
//   back automatically and not refunded. Gifted or compensation Credits keep the validity stated when they
//   were granted (12 months when nothing was stated).
// - Spending order: this month's plan Credits first, then these grants by expiry date, earliest first.
// - A grant expiring within 30 days is marked “即将到期”; reminders go out 30 and 7 days before.
// - Expiry never changes the order and creates no refund; the take-back is kept as its own record.
//
// Example (the prototype's “today” on subscription pages is 2026-08-24):
//   the 10,000 Credits pack bought on 6 月 5 日 has 2,500 left and expires on 2027-06-05 (有效);
//   the 500 compensation Credits granted on 7 月 25 日 expire on 9 月 23 日 (即将到期) and are used first;
//   300 compensation Credits from 6 月 20 日 expired on 7 月 20 日 with 200 unused, taken back.
export const creditsToday = "2026-08-24";

export const creditGrants = [
  {
    id: "grant-pack-0605",
    workspace: "深蓝猎头工作室",
    kind: "purchase",
    label: "Credits 包",
    credits: 10000,
    used: 7500,
    arrivedOn: "2026-06-05",
    expiresOn: "2027-06-05",
    validity: "到账后 12 个月",
    order: "ORD-20260605-0031",
  },
  {
    id: "grant-comp-0725",
    workspace: "深蓝猎头工作室",
    kind: "compensation",
    label: "补偿 Credits",
    credits: 500,
    used: 0,
    arrivedOn: "2026-07-25",
    expiresOn: "2026-09-23",
    validity: "发放时说明 60 天",
    reason: "7 月 24 日学术检索服务中断",
  },
  {
    id: "grant-comp-0620",
    workspace: "深蓝猎头工作室",
    kind: "compensation",
    label: "补偿 Credits",
    credits: 300,
    used: 100,
    arrivedOn: "2026-06-20",
    expiresOn: "2026-07-20",
    validity: "发放时说明 30 天",
    reason: "6 月 18 日模型服务中断",
  },
];

const day = (value) => new Date(`${value}T00:00:00+08:00`).getTime();

export function grantStatus(grant, today = creditsToday) {
  if (day(grant.expiresOn) <= day(today)) return "已失效";
  if (day(grant.expiresOn) - day(today) <= 30 * 24 * 3600 * 1000) return "即将到期";
  return "有效";
}

// Left to use (0 once expired) and what expiry took back.
export function grantBalance(grant, today = creditsToday) {
  const unused = grant.credits - grant.used;
  const expired = grantStatus(grant, today) === "已失效";
  return { left: expired ? 0 : unused, recovered: expired ? unused : 0 };
}

export const grantsFor = (workspace) =>
  creditGrants
    .filter((grant) => grant.workspace === workspace)
    .sort((a, b) => a.expiresOn.localeCompare(b.expiresOn));

export const displayDate = (value) => {
  const [year, month, date] = value.split("-").map(Number);
  return `${year} 年 ${month} 月 ${date} 日`;
};
