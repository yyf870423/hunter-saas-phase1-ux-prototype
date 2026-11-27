export const candidateBatchFileLimit = 100;
export const candidateBatchByteLimit = 20 * 1024 * 1024;
export const candidateBatchFormats = ["pdf", "docx", "zip", "xlsx"];
export const candidateTemplateHeaders = ["姓名", "当前公司", "职位", "手机", "邮箱", "工作年限", "出生年份", "技能", "工作经历", "备注"];

export function candidateBatchFileErrors(files) {
  if (!files.length) return ["请先选择需要导入的文件"];
  if (files.length > candidateBatchFileLimit) return [`单次最多上传 ${candidateBatchFileLimit} 份，请分批上传。`];
  return files.flatMap(file => {
    const extension = file.name.split(".").pop().toLowerCase();
    if (!candidateBatchFormats.includes(extension)) return [`${file.name}：不支持此格式，请使用 PDF、DOCX、ZIP 或 XLSX。`];
    if (!file.size) return [`${file.name}：文件为空，请检查后重新选择。`];
    if (file.size > candidateBatchByteLimit) return [`${file.name}：超过单个文件 20 MB 的限制。`];
    return [];
  });
}

export async function downloadCandidateTemplate() {
  const { utils, write } = await import("xlsx");
  const book = utils.book_new();
  const sheet = utils.aoa_to_sheet([candidateTemplateHeaders]);
  sheet["!cols"] = candidateTemplateHeaders.map(header => ({ wch: header === "工作经历" || header === "备注" ? 40 : 20 }));
  utils.book_append_sheet(book, sheet, "候选人");
  const bytes = write(book, { type: "array", bookType: "xlsx" });
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "候选人导入示例.xlsx";
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
