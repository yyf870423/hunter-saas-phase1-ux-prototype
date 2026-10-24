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

export async function loadArticles() {
  const dir = resolve(root, "scripts/articles");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".mjs"));
  const list = [];
  for (const file of files) list.push((await import(pathToFileURL(resolve(dir, file)).href)).default);
  return list.sort((a, b) => a.order - b.order);
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

const isMain = import.meta.url === pathToFileURL(process.argv[1]).href;
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
