import { initialResearchResult, personById, personLabel, researchPeople } from "./candidate-research-data.js";

export function createResearchState() {
  return { results: [initialResearchResult], lastTargets: [], pending: null, job: null, failedIds: [], stopped: null, nextJob: 1 };
}

const unique = ids => [...new Set(ids)];
const countOf = value => ({ 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 })[value] || Number(value);
const names = ids => ids.map(personLabel).join("、");
const reply = (state, body, extra = {}) => ({ state, body, ...extra });

function targetPeople(text, snapshot, pending) {
  let ids = [];
  const problems = [];
  const distinctNames = unique(researchPeople.map(person => person.name));
  const fragments = text.split(/[、，,；;\n]|\s+和\s+/);
  for (const name of distinctNames.filter(name => text.includes(name))) {
    if (new RegExp(`(?:不要|排除|别|不选)(?:调研)?\\s*${name}`).test(text)) continue;
    const matches = researchPeople.filter(person => person.name === name);
    // A company qualifier applies only to the nearby name, not to all named people.
    const fragment = fragments.find(part => part.includes(name)) || text;
    const qualified = matches.filter(person => fragment.includes(person.company) || fragment.includes(person.company.slice(0, 2)));
    if (matches.length === 1) ids.push(matches[0].id);
    else if (qualified.length === 1) ids.push(qualified[0].id);
    else problems.push({ name, options: matches.map(person => person.id) });
  }
  if (pending) {
    ids.push(...pending.knownIds);
    for (const problem of pending.problems) {
      const hits = problem.options.filter(id => {
        const person = personById(id);
        return text.includes(person.company) || text.includes(person.company.slice(0, 2));
      });
      const ordinal = text.match(/(?:第)?([一二两三四五六七八九十\d]+)(?:位|个)/);
      if (hits.length === 1) ids.push(hits[0]);
      else if (ordinal && pending.problems.length === 1 && problem.options[countOf(ordinal[1]) - 1]) ids.push(problem.options[countOf(ordinal[1]) - 1]);
      else if (!ids.some(id => problem.options.includes(id))) problems.push(problem);
    }
  }
  const first = text.match(/前([一二两三四五六七八九十\d]+)(?:位|名|个)/);
  const ordinal = text.match(/第([一二两三四五六七八九十\d]+)(?:位|名|个)/);
  if (!pending && first) {
    const count = countOf(first[1]);
    if (count > snapshot.ids.length) return { error: `这份结果只有${snapshot.ids.length}位人选。请说明实际要处理的范围，我还没有开始调研。` };
    ids.push(...snapshot.ids.slice(0, count));
  } else if (!pending && ordinal) {
    const id = snapshot.ids[countOf(ordinal[1]) - 1];
    if (!id) return { error: `这份结果中没有第${countOf(ordinal[1])}位。请补充姓名或正确序号。` };
    ids.push(id);
  }
  const cities = ["北京", "上海", "深圳", "杭州", "苏州", "广州", "南京"].filter(city => text.includes(city));
  const score = text.match(/(\d{2})\s*分(?:以上|及以上)/);
  if (!ids.length && !problems.length && (cities.length || score)) {
    ids = snapshot.ids.filter(id => {
      const person = personById(id);
      return (!cities.length || cities.includes(person.city)) && (!score || person.score >= Number(score[1]));
    });
  }
  if (/所有|全部/.test(text) && !ids.length && !problems.length) {
    if (!/当前|这份|本轮|名单/.test(text)) return { error: "你说的“全部”是当前打开结果里的所有人，还是本轮最初的18位？请明确范围，我不会默认处理全部人。" };
    ids = snapshot.ids;
  }
  // Unknown names must not be silently dropped while known names are processed.
  const cleaned = text.replace(/^(请|帮我|继续|再|先|重点|对|给)+/g, "");
  const namedList = cleaned.match(/(?:调研|核实|研究|比较|对比)(.+?)(?:[，,；;。]|的|是否|重点|$)/)?.[1];
  const unknown = namedList?.split(/[、和与]/).map(part => part.trim()).filter(part => /^[\u4e00-\u9fff]{2,4}$/.test(part) && !["他们", "这些人", "这三人", "前三位", "前三名", "第二位", "预训练", "训练经历", "任职经历", "失败人选"].includes(part) && !distinctNames.includes(part));
  if (unknown?.length) return { error: `当前示例名单中无法明确找到“${unknown.join("、")}”。请补充公司或使用名单中的姓名；本次尚未开始处理，已识别的人选也不会被悄悄单独执行。` };
  return { ids: unique(ids), problems, hasCondition: Boolean(cities.length || score) };
}

export function researchCommand(state, raw, snapshot) {
  const text = raw.trim();
  if (!text) return reply(state, "请说明要查看的人选或下一步要求。");
  if (/^(停止|停下|先停|暂停|取消)(一下|吧|调研|当前调研|这次调研)?[。！!]*$/.test(text)) {
    return reply({ ...state, job: null, pending: null, stopped: state.job || state.stopped }, state.job ? "已停止本次模拟调研，原结果保留。可以在对话里说“继续刚才的调研”，或提出新的要求。" : "当前没有正在进行的调研，原结果未改变。");
  }
  if (state.job) return reply(state, "当前模拟调研尚在进行。可以说“停止”后修改范围；本条要求已留在对话中，没有覆盖正在执行的任务。");
  const noContactText = text.replace(/不要联系|不联系|不对外联系|先别联系|不发邮件|不要发邮件/g, "");
  if (/加入.{0,8}储备|入库|保存.{0,6}候选人|删除.{0,6}候选人|合并.{0,6}候选人|发邮件|发送邮件|联系本人|联系他们/.test(noContactText)) return reply({ ...state, pending: null }, "本轮只验证候选人调研的交互，还没有接入入库、岗位储备或对外联系工具。这条要求已保留，但不会产生业务写入或发送动作。");
  if (/重试|重跑/.test(text)) {
    if (!state.failedIds.length) return reply(state, "当前没有待重试的失败人选，不会重复调研已完成的人。");
    return startJob(state, state.failedIds, state.results.at(-1).requirement, snapshot, true);
  }
  if (/继续刚才|恢复调研|继续调研/.test(text) && state.stopped && !researchPeople.some(person => text.includes(person.name))) return startJob(state, state.stopped.ids, state.stopped.requirement, snapshot, false);
  if (/恢复.*(完整|最初|全部)|查看.*(完整|最初)名单|显示.*18/.test(text)) return addResult(state, initialResearchResult.ids, "list", "完整候选名单", "本轮18位人选", text);
  if (/升序|降序/.test(text)) {
    const ids = [...snapshot.ids].sort((a, b) => /升序/.test(text) ? personById(a).score - personById(b).score : personById(b).score - personById(a).score);
    return addResult(state, ids, snapshot.kind, snapshot.title, snapshot.scope, text, "已按你的要求调整展示顺序，没有改变候选人资料。后续序号按这份结果计算。");
  }
  const pending = state.pending;
  const resolved = targetPeople(text, pending?.snapshot || snapshot, pending);
  if (resolved.error) return reply(state, resolved.error);
  if (resolved.problems.length) {
    const problems = resolved.problems.map(problem => `${problem.name}有${problem.options.length}位：\n${problem.options.map((id, i) => `${i + 1}. ${personLabel(id)}`).join("\n")}`).join("\n\n");
    return reply({ ...state, pending: { text: pending?.text || text, knownIds: resolved.ids, problems: resolved.problems, snapshot: pending?.snapshot || snapshot } }, `需要先确认人选，尚未开始调研。\n\n${problems}\n\n请直接补充公司，或说明这里的第几位。我会保留你原先的调研要求。`);
  }
  let ids = resolved.ids;
  const request = pending ? pending.text : text;
  if (!ids.length && /他们|这三位|刚才那几位|这几位|继续核实|重点|再查/.test(text)) ids = state.lastTargets;
  if (!ids.length) return reply(state, resolved.hasCondition ? "当前结果没有符合这个条件的人选。你可以调整条件或要求恢复完整名单；原结果没有被清空。" : "还不能确定要处理谁或具体做什么。请直接说明姓名、公司、当前结果的序号或筛选条件；当前结果保持不变。此原型只模拟文档中列出的调研、比较、排序及澄清情形，不会假装完成未支持的要求。");
  if (/只看|只保留|筛选|列出|展示/.test(request) && !/调研|核实|补查|研究/.test(request)) return addResult({ ...state, pending: null }, ids, "list", "按要求整理的人选", `符合要求的${ids.length}位人选`, request);
  if (/对比|比较|解释|为什么|匹配分|匹配理由|评分依据/.test(request) && !/调研|补查/.test(request)) return addResult({ ...state, pending: null, lastTargets: ids }, ids, "comparison", "候选人证据比较", `明确指定的${ids.length}位人选`, request, `已按现有示例资料整理${names(ids)}的初筛匹配分、理由和缺口。没有开展新搜索或重新评分；资料未说明的部分仍标为待核实。`);
  if (!/调研|核实|研究|补查|再查|重点|预训练|任职经历|个人贡献/.test(request)) return reply(state, "已识别人选，但还不确定要做哪项处理。请直接说明要核实的经历、比较维度或其他要求；尚未执行任何动作。");
  return startJob({ ...state, pending: null }, ids, request, pending?.snapshot || snapshot, false);
}

function startJob(state, ids, requirement, snapshot, retry) {
  const job = { id: state.nextJob, ids: [...ids], requirement, snapshotId: snapshot.id, retry };
  return reply({ ...state, job, nextJob: state.nextJob + 1, lastTargets: [...ids], stopped: null }, `本次针对${names(ids)}。\n\n要求：${requirement}\n\n正在模拟证据核实；不联系本人，不写入正式资产。`, { running: true });
}

function addResult(state, ids, kind, title, scope, requirement, body) {
  const result = { id: `research-result-${state.results.length + 1}`, version: state.results.length + 1, ids: [...ids], kind, title, scope, requirement, failedIds: [] };
  return reply({ ...state, results: [...state.results, result], pending: null }, body || `已整理${ids.length}位人选，生成结果 v${result.version}。这是本轮展示结果，没有修改正式资产。`, { result });
}

export function finishResearch(state, jobId, failOnce = false) {
  if (!state.job || state.job.id !== jobId) return null;
  const job = state.job;
  const failedIds = failOnce && !job.retry ? job.ids.slice(-1) : [];
  const previous = job.retry ? state.results.at(-1).ids : [];
  const ids = unique([...previous, ...job.ids]);
  const result = { id: `research-result-${state.results.length + 1}`, version: state.results.length + 1, ids, kind: "comparison", title: "进一步调研结果", scope: `${ids.length}位人选 · ${failedIds.length ? "部分待重试" : "模拟完成"}`, requirement: job.requirement, failedIds };
  return reply({ ...state, job: null, failedIds, results: [...state.results, result] }, failedIds.length ? `本次模拟${job.ids.length - failedIds.length}位完成，${names(failedIds)}暂时失败。已完成的结果保留；可以在对话中说“重试失败的”，不会重复处理已完成部分。` : `已完成${job.ids.length}位人选的模拟核实。相关研究记录与个人贡献分开列出，未证实的经历仍保留为未知。结果 v${result.version}已更新；没有联系本人或写入正式资料。`, { result });
}
