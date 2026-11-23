import { candidates, importTasks, papers } from "./data.js";

export const importItemStates = {
  queued: { label: "排队中", tone: "neutral" },
  processing: { label: "处理中", tone: "info" },
  created: { label: "成功 · 新建", tone: "success" },
  updated: { label: "成功 · 更新", tone: "success" },
  failed: { label: "失败", tone: "danger" },
  pending: { label: "待确认", tone: "warning" },
  skipped: { label: "已跳过", tone: "neutral" },
};

export function importCounts(task) {
  const counts = {
    all: task.items.length,
    active: 0,
    success: 0,
    failed: 0,
    pending: 0,
    skipped: 0,
    queued: 0,
    processing: 0,
  };
  for (const item of task.items) {
    if (item.status === "created" || item.status === "updated")
      counts.success++;
    else counts[item.status]++;
  }
  counts.active = counts.queued + counts.processing;
  counts.handled = counts.all - counts.active;
  return counts;
}

export function importTaskSummary(task) {
  const counts = importCounts(task);
  const status = task.fileError
    ? "失败"
    : counts.active
      ? "处理中"
      : counts.failed || counts.pending
        ? "需要处理"
        : "已完成";
  return {
    ...task,
    status,
    progress: counts.all ? Math.round((counts.handled / counts.all) * 100) : 0,
    result:
      task.fileError?.reason ||
      `已处理 ${counts.handled} / ${counts.all} · 成功 ${counts.success} · 失败 ${counts.failed} · 待确认 ${counts.pending} · 跳过 ${counts.skipped}`,
  };
}

export function filterImportItems(items, status = "all", query = "") {
  const needle = query.trim().toLocaleLowerCase();
  return items.filter((item) => {
    const matches =
      status === "all" ||
      (status === "active"
        ? ["queued", "processing"].includes(item.status)
        : status === "success"
          ? ["created", "updated"].includes(item.status)
          : item.status === status);
    return (
      matches &&
      [item.name, item.source, item.reason, item.stage, item.suggestion]
        .join(" ")
        .toLocaleLowerCase()
        .includes(needle)
    );
  });
}

const paperTopics = [
  "多模态模型的机器人动作规划",
  "基于示范学习的灵巧操作",
  "机器人视觉表征与迁移学习",
  "分布式训练系统的资源调度",
  "大模型推理服务的缓存管理",
  "复杂环境下的移动机器人定位",
  "强化学习策略的安全评估",
  "具身智能系统的数据合成",
];
const candidateNames = [
  ...candidates.map((item) => item.name),
  "许知遥",
  "何明川",
  "程亦舟",
  "梁书宁",
  "顾远航",
  "杜景行",
  "陈时安",
  "苏清和",
  "周以宁",
  "陆知行",
  "余星河",
  "沈泽宇",
  "姜云舒",
  "唐予安",
  "谢闻溪",
];

function resumeItems() {
  return Array.from({ length: 28 }, (_, index) => {
    const person = candidates[index];
    const name = candidateNames[index];
    const status =
      index < 18
        ? "created"
        : index < 25
          ? "updated"
          : index < 27
            ? "pending"
            : "failed";
    return {
      id: `resume-${index + 1}`,
      name,
      source: `${name}_简历.pdf`,
      status,
      stage: "处理结束",
      updatedAt: "09:42:18",
      reason:
        status === "created"
          ? "候选人已新建"
          : status === "updated"
            ? "已补充已有候选人的经历，原资料保留"
            : status === "pending"
              ? "发现同名资料，任职时间存在冲突，尚未写入"
              : "PDF 文件已加密，无法读取正文",
      suggestion:
        status === "pending"
          ? "核对身份与任职经历后，再决定是否合并；本次尚未写入。"
          : status === "failed"
            ? "解除文件密码或导出为可读取的 PDF 后，重新上传此文件。"
            : "可打开资产查看导入结果。",
      ...(person && ["created", "updated"].includes(status)
        ? { asset: { label: person.name, path: `/candidates/${person.id}` } }
        : {}),
    };
  });
}

function paperItems() {
  return Array.from({ length: 500 }, (_, index) => {
    const paper = papers[index];
    // Put a representative of every outcome on the first page without changing totals.
    const swaps = {
      1: 340,
      2: 342,
      3: 332,
      4: 336,
      5: 338,
      6: 324,
      340: 1,
      342: 2,
      332: 3,
      336: 4,
      338: 5,
      324: 6,
    };
    const slot = swaps[index] ?? index;
    const status =
      slot < 324
        ? "created"
        : slot < 332
          ? "updated"
          : slot < 336
            ? "failed"
            : slot < 338
              ? "pending"
              : slot < 340
                ? "skipped"
                : slot < 342
                  ? "processing"
                  : "queued";
    const retryable = status === "failed" && slot % 2 === 0;
    const reason =
      status === "created"
        ? "论文已新建"
        : status === "updated"
          ? "相同 DOI，已补充原记录的摘要"
          : status === "failed"
            ? retryable
              ? "写入服务暂时不可用，本条尚未写入"
              : "标题字段为空，无法建立论文记录"
            : status === "pending"
              ? "DOI 对应标题与本行标题不一致，尚未写入"
              : status === "skipped"
                ? "与已有记录内容一致，无需重复写入"
                : status === "processing"
                  ? "正在查重，尚未写入"
                  : "等待处理，尚未读取本行内容";
    return {
      id: `paper-row-${index + 2}`,
      name:
        status === "failed" && !retryable
          ? "未提供标题"
          : paper?.title ||
            `${paperTopics[index % paperTopics.length]} · 样例 ${String(index + 1).padStart(3, "0")}`,
      source: `论文清单 · 第 ${index + 2} 行`,
      status,
      stage:
        status === "processing"
          ? "身份查重"
          : status === "queued"
            ? "等待解析"
            : "处理结束",
      reason,
      retryable,
      updatedAt: ["queued", "processing"].includes(status)
        ? "10:18:32"
        : "10:18:20",
      suggestion:
        status === "failed"
          ? retryable
            ? "可重试此条；已成功、待确认和其他失败记录不受影响。"
            : "补齐原表格的标题字段后，重新导入修正记录。"
          : status === "pending"
            ? "核实 DOI 和标题后，重新导入修正记录；不要直接覆盖已有论文。"
            : status === "skipped"
              ? "原记录保持不变，无需处理。"
              : status === "queued"
                ? "任务继续运行后将依次处理。"
                : status === "processing"
                  ? "等待当前步骤完成，关闭详情不影响后台任务。"
                  : "可打开资产查看导入结果。",
      ...(paper && ["created", "updated", "skipped"].includes(status)
        ? { asset: { label: paper.title, path: `/papers/${paper.id}` } }
        : {}),
    };
  });
}

export function createImportDetailSamples() {
  return importTasks.map((task) =>
    importTaskSummary({
      ...task,
      unit: task.type === "候选人" ? "份文件" : "行记录",
      createdAt: task.id === "import-resumes" ? "今天 09:40:02" : task.time,
      updatedAt:
        task.id === "import-resumes" ? "今天 09:42:18" : "今天 10:18:32",
      items:
        task.id === "import-resumes"
          ? resumeItems()
          : task.id === "import-papers"
            ? paperItems()
            : [],
      ...(task.id === "import-mapping"
        ? {
            fileError: {
              reason: "组织层级不连续，整份文件未导入",
              location: "知识图谱 · 第 3 行 · C3",
              suggestion:
                "三级节点缺少对应的二级节点。补齐上级节点后重新上传；未创建任何节点或连线。",
            },
          }
        : {}),
    }),
  );
}

export function advanceImportSample(task) {
  let remaining = 8;
  const items = task.items.map((item) => {
    if (!["queued", "processing"].includes(item.status) || remaining <= 0)
      return item;
    remaining--;
    return {
      ...item,
      status: "created",
      stage: "处理结束",
      reason: "导入成功，已新建记录",
      suggestion: "本地样例结果，未写入业务库。",
      updatedAt: "刚刚",
    };
  });
  const nextQueued = items.findIndex((item) => item.status === "queued");
  if (nextQueued >= 0)
    items[nextQueued] = {
      ...items[nextQueued],
      status: "processing",
      stage: "解析与标准化",
      reason: "正在解析，尚未写入",
      updatedAt: "刚刚",
    };
  return importTaskSummary({ ...task, items, updatedAt: "刚刚（本地模拟）" });
}

export function retryImportSample(task) {
  const items = task.items
    .filter((item) => item.status === "failed" && item.retryable)
    .map((item) => ({
      ...item,
      id: `retry-${item.id}`,
      status: "queued",
      stage: "等待处理",
      reason: "等待重试，原任务记录保留",
      suggestion: "本次只重试临时错误，不包含需修正原文件的条目。",
      retryable: false,
      updatedAt: "刚刚",
    }));
  if (!items.length) return null;
  return importTaskSummary({
    ...task,
    id: `${task.id}-retry`,
    name: `${task.name} · 失败项重试`,
    parentId: task.id,
    retryTaskId: undefined,
    time: "刚刚",
    createdAt: "刚刚",
    updatedAt: "刚刚",
    items,
  });
}

export function createUploadedImportSample(type, files) {
  const id = `import-local-${crypto.randomUUID()}`;
  const items = files.map((file, index) => ({
    id: `${id}-${index}`,
    name: file.name,
    source: file.name,
    status: index ? "queued" : "processing",
    stage: index ? "等待解析" : "文件格式校验",
    reason: index ? "等待处理" : "正在读取文件结构",
    suggestion: "仅模拟文件级处理，条目清单需实际解析后获取。",
    updatedAt: "刚刚",
  }));
  return importTaskSummary({
    id,
    name: `${type}文件导入`,
    type,
    file: files.map((file) => file.name).join("、"),
    unit: "份文件",
    time: "刚刚",
    createdAt: "刚刚",
    updatedAt: "刚刚",
    items,
  });
}

export function importFailureCsv(task) {
  const escapeCell = (value) =>
    `"${String(value ?? "")
      .replace(/^[\s]*[=+@-]/u, (match) => `'${match}`)
      .replaceAll('"', '""')}"`;
  const rows = [
    ["来源", "名称", "状态", "原因", "处理建议", "可直接重试"],
    ...task.items
      .filter((item) => item.status === "failed")
      .map((item) => [
        item.source,
        item.name,
        "失败",
        item.reason,
        item.suggestion,
        item.retryable ? "是" : "否",
      ]),
  ];
  if (task.fileError)
    rows.push([
      task.fileError.location,
      task.file,
      "校验失败",
      task.fileError.reason,
      task.fileError.suggestion,
      "否",
    ]);
  return (
    "\uFEFF" + rows.map((row) => row.map(escapeCell).join(",")).join("\r\n")
  );
}
