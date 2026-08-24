import { useEffect, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { recommendationReportMarkdown } from "../components/RecommendationReportFile";
import { Button, IconButton, useToast } from "../stage1/ui";
import { HunterMarkdown } from "./automation-ui";

const candidateRows = [
  ["项目", "结论", "证据状态"],
  ["VLA 与机器人学习", "高度匹配", "已核实"],
  ["真机数据闭环", "具备量产经验", "已核实"],
  ["团队管理", "当前管理 12 人", "候选人确认"],
  ["到岗时间", "需要进一步沟通", "待核实"],
];

export function buildRecommendationTaskArtifacts(candidateName, reports) {
  const reportArtifacts = reports.map((report) => ({
    id: `report-${report.version}`,
    name: report.fileName,
    type: "md",
    label: "Markdown",
    updatedAt: report.createdAt,
    content: recommendationReportMarkdown(report),
  }));
  return [
    ...reportArtifacts,
    {
      id: "customer-template",
      name: "星澜机器人-客户推荐模板.docx",
      type: "docx",
      label: "Word",
      updatedAt: "今天 10:12",
      title: "星澜机器人候选人推荐说明",
      sections: [
        ["推荐岗位", "具身智能 VLA 算法负责人"],
        ["候选人", candidateName],
        [
          "推荐摘要",
          "候选人兼具机器人学习、真机部署和跨团队交付经验，核心能力与岗位要求高度吻合。",
        ],
        [
          "沟通建议",
          "建议由客户技术负责人优先沟通，重点确认薪资弹性、到岗时间和团队管理边界。",
        ],
      ],
    },
    {
      id: "public-resume",
      name: `${candidateName}-公开履历.pdf`,
      type: "pdf",
      label: "PDF",
      updatedAt: "今天 10:09",
      title: `${candidateName} · 公开履历摘录`,
      paragraphs: [
        "现任穹顶智能机器人学习负责人，负责多任务操作策略、真机数据闭环和部署评测。",
        "曾在云鲸智能负责机械臂学习与强化学习项目，公开资料包含 4 篇相关论文和 2 项发明专利。",
        "本文件仅汇总公开信息，薪资、到岗时间和当前求职意愿仍需由猎头核实。",
      ],
    },
    {
      id: "evidence-workbook",
      name: `${candidateName}-匹配证据.xlsx`,
      type: "xlsx",
      label: "Excel",
      updatedAt: "今天 10:14",
      sheets: ["匹配证据", "来源索引"],
      rows: candidateRows,
    },
    {
      id: "evidence-csv",
      name: `${candidateName}-证据来源.csv`,
      type: "csv",
      label: "CSV",
      updatedAt: "今天 10:14",
      rows: [
        ["来源", "类型", "核实时间"],
        ["候选人简历 v6", "用户上传", "今天 10:08"],
        ["公开论文作者页", "公开网络", "今天 10:11"],
        ["岗位资料 v3", "Hunter 资产", "今天 10:12"],
      ],
    },
    {
      id: "customer-preview",
      name: `${candidateName}-客户预览.html`,
      type: "html",
      label: "HTML",
      updatedAt: "今天 10:18",
      title: `${candidateName} · 客户推荐预览`,
      stats: [
        ["综合匹配", "94"],
        ["硬技能", "95"],
        ["角色适配", "88"],
      ],
    },
  ];
}

function artifactText(artifact) {
  if (artifact.type === "md") return artifact.content;
  if (artifact.type === "csv")
    return artifact.rows.map((row) => row.join(",")).join("\n");
  if (artifact.type === "xlsx")
    return artifact.rows.map((row) => row.join("\t")).join("\n");
  if (artifact.type === "docx")
    return [artifact.title, ...artifact.sections.flat()].join("\n\n");
  if (artifact.type === "pdf")
    return [artifact.title, ...artifact.paragraphs].join("\n\n");
  if (artifact.type === "html") {
    return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${artifact.title}</title></head><body><h1>${artifact.title}</h1>${artifact.stats.map(([label, value]) => `<p><b>${label}</b>：${value}</p>`).join("")}</body></html>`;
  }
  return artifact.content || "";
}

function downloadArtifact(artifact) {
  const mime =
    artifact.type === "html"
      ? "text/html"
      : artifact.type === "csv"
        ? "text/csv"
        : artifact.type === "md"
          ? "text/markdown"
          : "text/plain";
  const blob = new Blob([artifactText(artifact)], {
    type: `${mime};charset=utf-8`,
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = artifact.name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function ArtifactTable({ rows }) {
  return (
    <div className="s2-artifact-grid">
      <table>
        <thead>
          <tr>
            {rows[0].map((cell) => (
              <th key={cell}>{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map((row) => (
            <tr key={row.join("-")}>
              {row.map((cell) => (
                <td key={cell}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ArtifactRenderer({ artifact }) {
  if (artifact.type === "md") {
    return (
      <article className="s2-artifact-markdown" aria-label="Markdown 预览">
        <HunterMarkdown content={artifact.content} />
      </article>
    );
  }
  if (artifact.type === "docx") {
    return (
      <article className="s2-artifact-document is-word" aria-label="Word 预览">
        <small>Hunter · 客户推荐材料</small>
        <h1>{artifact.title}</h1>
        {artifact.sections.map(([title, content]) => (
          <section key={title}>
            <h2>{title}</h2>
            <p>{content}</p>
          </section>
        ))}
      </article>
    );
  }
  if (artifact.type === "pdf") {
    return (
      <div className="s2-artifact-pdf" aria-label="PDF 预览">
        <article>
          <small>公开资料汇总 · 第 1 页 / 共 2 页</small>
          <h1>{artifact.title}</h1>
          {artifact.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <footer>Hunter 仅用于候选人评估与猎头业务沟通</footer>
        </article>
      </div>
    );
  }
  if (artifact.type === "html") {
    return (
      <div className="s2-artifact-browser" aria-label="HTML 预览">
        <header>
          <i />
          <i />
          <i />
          <span>客户预览</span>
        </header>
        <article>
          <small>Hunter 候选人推荐</small>
          <h1>{artifact.title}</h1>
          <p>具备机器人学习、VLA、真机部署与团队管理经验。</p>
          <div>
            {artifact.stats.map(([label, value]) => (
              <span key={label}>
                <b>{value}</b>
                <small>{label}</small>
              </span>
            ))}
          </div>
        </article>
      </div>
    );
  }
  return (
    <div
      className={`s2-artifact-spreadsheet is-${artifact.type}`}
      aria-label={`${artifact.label} 预览`}
    >
      <header>
        <span>A</span>
        <span>B</span>
        <span>C</span>
      </header>
      <ArtifactTable rows={artifact.rows} />
      {artifact.sheets ? (
        <footer>
          {artifact.sheets.map((sheet, index) => (
            <button
              type="button"
              className={index === 0 ? "is-active" : ""}
              key={sheet}
            >
              {sheet}
            </button>
          ))}
        </footer>
      ) : null}
    </div>
  );
}

export function TaskArtifactPreview({
  artifact,
  artifacts,
  onSelect,
  onClose,
}) {
  const notify = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [menuOpen]);
  return (
    <aside className="s2-task-artifact-preview" aria-label="文件预览">
      <header>
        <div className="s2-artifact-file-switch" ref={menuRef}>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <i>
              <Icon name="file" />
            </i>
            <span>
              <b>{artifact.name}</b>
              <small>
                {artifact.label} · {artifact.updatedAt}
              </small>
            </span>
            <Icon name="chevronDown" />
          </button>
          {menuOpen ? (
            <div role="listbox" aria-label="任务文件">
              {artifacts.map((item) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={item.id === artifact.id}
                  className={item.id === artifact.id ? "is-active" : ""}
                  key={item.id}
                  onClick={() => {
                    onSelect(item.id);
                    setMenuOpen(false);
                  }}
                >
                  <Icon name="file" />
                  <span>
                    <b>{item.name}</b>
                    <small>
                      {item.label} · {item.updatedAt}
                    </small>
                  </span>
                  {item.id === artifact.id ? <Icon name="check" /> : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <Button
          size="sm"
          icon="download"
          onClick={() => {
            downloadArtifact(artifact);
            notify("文件已开始下载", "success");
          }}
        >
          下载
        </Button>
        <IconButton icon="close" label="关闭文件预览" onClick={onClose} />
      </header>
      <div className="s2-artifact-preview-body">
        <ArtifactRenderer artifact={artifact} />
      </div>
    </aside>
  );
}
