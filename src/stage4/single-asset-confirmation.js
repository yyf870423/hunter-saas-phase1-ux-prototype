export function singleAssetDecision(value) {
  const text = String(value || "").trim().replace(/[。.!！?？]+$/, "").trim();
  if (/^(是|是的|好|好的|同意|确认|可以|入库|确认入库|确认写入|确认修改|确认更新|确认创建|是，入库)$/.test(text)) return "confirm";
  if (/^(否|不|不要|不用|不同意|取消|暂不|暂不写入|暂不入库|不入库|不修改|不更新)$/.test(text)) return "decline";
  return "suggest";
}

export function draftFailureText(error) {
  const fields = Object.values(error.details?.fields || {}).filter(Boolean);
  return ["尚未写入：" + error.message, ...fields.map((message) => "- " + message)].join("\n\n");
}

export function displayDraftConfirmation(task, message) {
  const first = task.id === "client-xinglan" && task.messages.find((item) => item.role === "user" && item.sourceKind === "decision" && singleAssetDecision(item.content) === "confirm");
  return first?.id === message.id && message.content.trim() === "是" ? "确认" : message.content;
}
