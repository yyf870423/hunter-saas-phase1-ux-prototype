import test from "node:test";
import assert from "node:assert/strict";
import { candidateBatchFileErrors, candidateBatchByteLimit, candidateTemplateHeaders } from "../../src/stage4/candidate-batch-import.js";

const file = (name, size = 100) => ({ name, size });
test("candidate batch accepts the four existing data-import formats, case-insensitively", () => {
  assert.deepEqual(candidateBatchFileErrors([file("a.PDF"), file("b.docx"), file("c.zip"), file("d.xlsx")]), []);
});
test("empty selection is not a valid import", () => assert.equal(candidateBatchFileErrors([]).length, 1));
test("unsupported formats are reported, not silently skipped", () => {
  assert.match(candidateBatchFileErrors([file("a.pdf"), file("b.exe")])[0], /b\.exe.*不支持/);
});
test("CSV is not advertised as the XLSX import contract", () => assert.match(candidateBatchFileErrors([file("a.csv")])[0], /不支持/));
test("empty files are reported", () => assert.match(candidateBatchFileErrors([file("a.pdf", 0)])[0], /文件为空/));
test("20 MB is accepted", () => assert.deepEqual(candidateBatchFileErrors([file("a.zip", candidateBatchByteLimit)]), []));
test("files exceeding 20 MB are rejected", () => assert.match(candidateBatchFileErrors([file("a.zip", candidateBatchByteLimit + 1)])[0], /20 MB/));
test("100 files are accepted", () => assert.deepEqual(candidateBatchFileErrors(Array.from({ length: 100 }, (_, i) => file(`${i}.pdf`))), []));
test("101 files are not truncated or accepted", () => assert.match(candidateBatchFileErrors(Array.from({ length: 101 }, (_, i) => file(`${i}.pdf`)))[0], /100/));
test("all invalid files are listed", () => assert.equal(candidateBatchFileErrors([file("a.exe"), file("b.pdf", 0), file("c.zip", candidateBatchByteLimit + 1)]).length, 3));
test("template uses supported non-personal header fields only", () => {
  assert.deepEqual(candidateTemplateHeaders, ["姓名", "当前公司", "职位", "手机", "邮箱", "工作年限", "出生年份", "技能", "工作经历", "备注"]);
});
