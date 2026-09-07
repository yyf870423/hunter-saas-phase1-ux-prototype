import test from "node:test";
import assert from "node:assert/strict";
import { singleAssetDecision, draftFailureText } from "../../src/stage4/single-asset-confirmation.js";

test("只有完整明确的肯定答复才允许确认", () => {
  for (const text of ["是", "是的。", "确认入库", "确认修改", " 可以！ "]) assert.equal(singleAssetDecision(text), "confirm");
});
test("否定和混合建议不能触发确认", () => {
  for (const text of ["否", "不要", "暂不写入", "不修改"]) assert.equal(singleAssetDecision(text), "decline");
  for (const text of ["是，但还要修改", "否\n机会名称：另一个", "是否需要入库", "建议入库", "", "确认：公司需要调整"]) assert.equal(singleAssetDecision(text), "suggest");
});
test("字段校验错误保留具体原因", () => {
  assert.match(draftFailureText({ message: "字段缺失", details: { fields: { evidence: "请说明发现依据" } } }), /尚未写入：字段缺失[\s\S]*请说明发现依据/);
});
