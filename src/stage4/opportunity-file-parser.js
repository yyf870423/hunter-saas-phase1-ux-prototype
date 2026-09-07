export async function parseOpportunityTable(file) {
  if (/\.csv$/i.test(file.name)) {
    const { default: Papa } = await import("papaparse");
    const parsed = Papa.parse(await file.text(), { skipEmptyLines: "greedy" });
    if (parsed.errors.length) throw new Error("CSV 解析失败：" + parsed.errors.map((error) => "第 " + (Number(error.row || 0) + 1) + " 行 " + error.message).join("；"));
    if (parsed.data.length < 2) throw new Error("表格至少需要表头和一行资料。");
    if (parsed.data.length > 1001) throw new Error("单批最多导入 1000 行，请拆分文件后重试。");
    return { headers: parsed.data[0].map(String), rows: parsed.data.slice(1), sheet: "CSV" };
  }
  if (/\.xlsx$/i.test(file.name)) {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: false });
    const sheet = workbook.SheetNames[0];
    if (!sheet) throw new Error("Excel 文件没有工作表。");
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { header: 1, defval: "", raw: false, blankrows: false });
    if (data.length < 2) throw new Error("工作表至少需要表头和一行资料。");
    if (data.length > 1001) throw new Error("单批最多导入 1000 行，请拆分文件后重试。");
    return { headers: data[0].map(String), rows: data.slice(1), sheet, otherSheets: workbook.SheetNames.slice(1) };
  }
  throw new Error("批量导入只支持 CSV 或 XLSX，请选择正确文件。");
}

export async function extractOpportunityText(file) {
  if (/\.(txt|md|csv)$/i.test(file.name)) return { text: await file.text(), warnings: [] };
  if (/\.docx$/i.test(file.name)) {
    const mammoth = await import("mammoth");
    const result = await (mammoth.default || mammoth).extractRawText({ arrayBuffer: await file.arrayBuffer() });
    if (!result.value.trim()) throw new Error("DOCX 没有可读取正文，请核对文件或补充文字。");
    return { text: result.value, warnings: result.messages.map((item) => item.message) };
  }
  if (/\.pdf$/i.test(file.name)) {
    const pdfjs = await import("pdfjs-dist");
    const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const loadingTask = pdfjs.getDocument({ data: await file.arrayBuffer(), isEvalSupported: false });
    const document = await loadingTask.promise;
    try {
      const pages = [];
      for (let index = 1; index <= document.numPages; index += 1) {
        const page = await document.getPage(index);
        const content = await page.getTextContent();
        pages.push("第 " + index + " 页\n" + content.items.map((item) => item.str + (item.hasEOL ? "\n" : " ")).join(""));
      }
      const text = pages.join("\n\n");
      if (!text.replace(/第 \d+ 页/g, "").trim())
        return { text: "", warnings: ["PDF 是扫描件或没有可读取正文，请预览后补充文字，不能直接确认提取结果。"] };
      return { text, warnings: [] };
    } finally { await loadingTask.destroy(); }
  }
  if (/\.xlsx$/i.test(file.name)) {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    return { text: workbook.SheetNames.map((name) => "工作表：" + name + "\n" +
      XLSX.utils.sheet_to_csv(workbook.Sheets[name])).join("\n\n"), warnings: [] };
  }
  if (/\.(png|jpe?g|webp)$/i.test(file.name))
    return { text: "", warnings: ["图片原件已保留，请预览并确认招聘需求文字。当前原型不模拟未实际完成的 OCR。"] };
  throw new Error("该文件格式暂不支持解析，请转换为 PDF、DOCX、TXT、CSV 或 XLSX。");
}
