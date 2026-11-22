// 实务文章的正文：scripts/articles/<slug>.mjs（每篇一个文件，字段说明见 scripts/articles/README.md）。
// 2026-10-25 起文章并进“使用场景”，页面由 scripts/build-redesign-pages.mjs 生成在改版首页下
// （public/landing-redesign/use-cases/<slug>/），这个文件只负责读正文和检查规矩。
// 单独运行 node scripts/build-articles.mjs 只做检查：中文分号、禁用词、平台名只在对比那一篇、标题格式、常见问题条数。
import { readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HUB = "ai-assistant-for-headhunters";
export const PUBLISHED = "2026-10-25";
// the last content update: 2026-11-21 the product is HunterBuddy again (高阶技术人才寻访的 AI 工作台), and six of the
// articles became capability pages (scripts/capabilities/)
export const MODIFIED = "2026-11-21";

export async function loadArticles() {
  const dir = resolve(root, "scripts/articles");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".mjs"));
  const list = [];
  for (const file of files) list.push((await import(pathToFileURL(resolve(dir, file)).href)).default);
  return list.sort((a, b) => a.order - b.order);
}

// the English pages: scripts/articles-en/<slug>.mjs, one per use-case page (business-development included),
// translated from the Chinese ones (terms in docs/en-glossary.md)
export async function loadArticlesEn() {
  const dir = resolve(root, "scripts/articles-en");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".mjs"));
  const list = [];
  for (const file of files) list.push((await import(pathToFileURL(resolve(dir, file)).href)).default);
  return list;
}

export function checkArticleEn(a) {
  const problems = [];
  const all = JSON.stringify(a);
  if (/[\u4e00-\u9fff]/.test(all)) problems.push("Chinese characters");
  if (all.includes("；")) problems.push("Chinese semicolon");
  for (const word of ["seamless", "revolutionary", "game-changer", "cutting-edge", "unlock", "empower"])
    if (all.toLowerCase().includes(word)) problems.push(`filler word "${word}"`);
  if (/background check/i.test(all) && a.slug !== "same-name-candidates") problems.push(`"background check" only in same-name-candidates`);
  if (a.slug !== "ai-tools-compared")
    for (const name of ["Doubao", "DeepSeek", "ChatGPT", "Liepin", "LinkedIn", "Maimai", "BOSS Zhipin"])
      if (all.includes(name)) problems.push(`platform "${name}" only in ai-tools-compared`);
  if (!/ \| HunterBuddy$/.test(a.title)) problems.push('title must end with " | HunterBuddy"');
  if (a.description.length < 120 || a.description.length > 170) problems.push(`description is ${a.description.length} characters`);
  if (a.faq.length < 3) problems.push("fewer than 3 FAQs");
  return problems;
}

export function checkArticle(a) {
  const problems = [];
  const all = JSON.stringify(a);
  if (all.includes("；")) problems.push("中文分号");
  for (const word of ["猎头 BD", "猎头BD", "猎头软件", "猎头系统", "演示数据", "背调", "据统计", "研究表明"])
    if (
      all.includes(word) &&
      !(word === "猎头软件" && a.slug === HUB) &&
      !(word === "猎头系统" && a.slug === "ai-tools-compared") &&
      !(word === "背调" && a.slug === "same-name-candidates") // 只用来划边界：“不做背调”
    )
      problems.push(`用了“${word}”`);
  if (a.slug !== "ai-tools-compared")
    for (const name of ["豆包", "DeepSeek", "ChatGPT", "猎聘", "领英", "脉脉", "BOSS直聘"])
      if (all.includes(name)) problems.push(`平台名“${name}”只能出现在对比那一篇`);
  if (!/｜HunterBuddy$/.test(a.title)) problems.push("title 要以“｜HunterBuddy”结尾");
  if (a.faq.length < 3) problems.push("常见问题少于 3 条");
  return problems;
}

// 核心能力的八篇（2026-11-21 起替换六篇旧文章、新增两篇）：scripts/capabilities/<slug>.mjs，英文在 scripts/capabilities-en/。
// 正文照产品方定稿的文案，规矩只查结构和格式（平台名等措辞以定稿为准）。
async function loadDir(name) {
  const dir = resolve(root, `scripts/${name}`);
  let files = [];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".mjs"));
  } catch {
    return [];
  }
  const list = [];
  for (const file of files) list.push({ ...(await import(pathToFileURL(resolve(dir, file)).href)).default, cap: true });
  return list.sort((a, b) => a.no.localeCompare(b.no));
}
export const loadCapabilities = () => loadDir("capabilities");
export const loadCapabilitiesEn = () => loadDir("capabilities-en");
export function checkCapability(a, en = false) {
  const problems = [];
  const all = JSON.stringify(a);
  if (all.includes("；")) problems.push(en ? "Chinese semicolon" : "中文分号");
  if (all.includes("**")) problems.push(en ? "leftover **" : "残留 **");
  if (en && /[\u4e00-\u9fff]/.test(all)) problems.push("Chinese characters");
  if (!(en ? / \| HunterBuddy$/ : /｜HunterBuddy$/).test(a.title)) problems.push(en ? 'title must end with " | HunterBuddy"' : "title 要以“｜HunterBuddy”结尾");
  for (const key of ["pains", "how"])
    if (!a[key] || a[key].items.length < 5 || a[key].items.some(([t, b]) => !t || !b)) problems.push(`${key} 不完整`);
  if (!a.definition || !a.boundary) problems.push(en ? "missing definition or boundary" : "缺定义句或边界");
  return problems;
}

const isMain = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  let failed = false;
  for (const a of await loadArticles()) {
    const problems = checkArticle(a);
    if (problems.length) {
      failed = true;
      console.error(`${a.slug}: ${problems.join("，")}`);
    } else console.log(`ok ${a.slug}`);
  }
  if (failed) process.exit(1);
}
