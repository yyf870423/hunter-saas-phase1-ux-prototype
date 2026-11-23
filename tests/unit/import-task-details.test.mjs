import assert from "node:assert/strict";
import test from "node:test";
import {
  advanceImportSample,
  createImportDetailSamples,
  createUploadedImportSample,
  filterImportItems,
  importCounts,
  importFailureCsv,
  retryImportSample,
} from "../../src/stage4/import-task-details.js";

test("各状态互斥，统计由完整条目派生而非当前页派生", () => {
  const [resumes, papers, fileError] = createImportDetailSamples();
  assert.deepEqual(importCounts(resumes), {
    all: 28,
    active: 0,
    success: 25,
    failed: 1,
    pending: 2,
    skipped: 0,
    queued: 0,
    processing: 0,
    handled: 28,
  });
  assert.deepEqual(importCounts(papers), {
    all: 500,
    active: 160,
    success: 332,
    failed: 4,
    pending: 2,
    skipped: 2,
    queued: 158,
    processing: 2,
    handled: 340,
  });
  assert.equal(new Set(papers.items.map((item) => item.id)).size, 500);
  assert.equal(fileError.items.length, 0);
  assert.equal(fileError.progress, 0);
});
test("状态与名称、原始位置、错误原因组合筛选", () => {
  const task = createImportDetailSamples()[1];
  assert.equal(filterImportItems(task.items, "active").length, 160);
  assert.equal(
    filterImportItems(task.items, "failed", "标题字段为空").length,
    2,
  );
  assert.equal(
    filterImportItems(task.items, "all", "第 5 行")[0].id,
    "paper-row-5",
  );
  assert.equal(
    filterImportItems(task.items, "success", "服务暂时不可用").length,
    0,
  );
});
test("刷新不改变原失败、待确认和跳过结论；最终运行可结束", () => {
  const task = createImportDetailSamples()[1];
  let next = advanceImportSample(task);
  assert.equal(importCounts(next).handled, 348);
  assert.equal(importCounts(task).handled, 340);
  for (const status of ["failed", "pending", "skipped"])
    assert.deepEqual(
      next.items.filter((row) => row.status === status),
      task.items.filter((row) => row.status === status),
    );
  for (let round = 0; round < 20; round++) next = advanceImportSample(next);
  assert.equal(importCounts(next).active, 0);
  assert.equal(next.progress, 100);
  assert.equal(next.status, "需要处理");
});
test("重试只产生可恢复失败项的新任务，不覆盖原条目", () => {
  const task = createImportDetailSamples()[1];
  const retry = retryImportSample(task);
  assert.equal(retry.items.length, 2);
  assert.equal(retry.parentId, task.id);
  assert.equal(
    retry.items.every((row) => row.status === "queued" && !row.retryable),
    true,
  );
  assert.equal(importCounts(task).failed, 4);
  assert.equal(retryImportSample(createImportDetailSamples()[0]), null);
});
test("失败报告仅含失败项并对 CSV 公式/分隔符转义", () => {
  const task = createImportDetailSamples()[1];
  const csv = importFailureCsv(task);
  assert.equal(csv.split("\r\n").length, 5);
  assert.equal(csv.includes("论文已新建"), false);
  const unsafe = importFailureCsv({
    items: [
      {
        status: "failed",
        source: '=HYPERLINK("x")',
        name: "多行\n名称",
        reason: "错误,原因",
      },
    ],
  });
  assert.match(unsafe, /'=HYPERLINK/);
  assert.match(unsafe, /"错误,原因"/);
  assert.match(importFailureCsv(createImportDetailSamples()[2]), /C3/);
});
test("新建样例仅按已选文件计数，不伪造尚未解析的行", () => {
  const task = createUploadedImportSample("论文", [
    { name: "one.pdf" },
    { name: "two.pdf" },
  ]);
  assert.equal(task.unit, "份文件");
  assert.equal(task.items.length, 2);
  assert.equal(task.progress, 0);
  assert.equal(importCounts(task).processing, 1);
});
