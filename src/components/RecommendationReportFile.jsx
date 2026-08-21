import { useMemo, useState } from "react";
import { Icon } from "./Icon";
import { Button, Modal, useToast } from "../stage1/ui";

export function buildRecommendationReportVersions(candidateName = "林昊") {
  return [
    {
      version: "v2",
      createdAt: "今天 10:28",
      fileName: `${candidateName}-具身智能VLA算法负责人-推荐报告-v2.md`,
      summary: `${candidateName}具备机器人学习、VLA 与真机部署经验，当前能力结构与岗位目标高度一致，建议进入客户沟通。`,
      evidence: [
        "负责多任务机器人操作策略和真机数据闭环，经历覆盖训练、评测与部署。",
        "当前管理 12 人算法团队，具备跨硬件、数据和产品团队的交付经验。",
        "最近两项项目均有量产或真实场景部署记录，不属于纯研究型履历。",
      ],
      risks: [
        "当前总包可能高于岗位区间，需要提前确认薪资弹性。",
        "公开资料没有明确说明到岗时间，建议首次沟通时核实。",
      ],
      suggestion:
        "重点讨论真机数据闭环中的个人决策范围、团队规模，以及是否接受北京为主的工作安排。",
    },
    {
      version: "v1",
      createdAt: "今天 10:16",
      fileName: `${candidateName}-具身智能VLA算法负责人-推荐报告-v1.md`,
      summary: `${candidateName}的机器人学习与真机部署经历符合岗位核心要求，建议进一步核实管理范围后推荐。`,
      evidence: [
        "具备 VLA、强化学习和机器人操作策略经验。",
        "有真实机器人场景的数据闭环与部署经历。",
      ],
      risks: ["团队管理规模尚未在公开资料中核实。", "到岗时间待确认。"],
      suggestion: "首次沟通重点核实团队管理范围、薪资预期和到岗时间。",
    },
  ];
}

export function buildRevisedRecommendationReport(candidateName = "林昊") {
  const [latest] = buildRecommendationReportVersions(candidateName);
  return {
    ...latest,
    version: "v3",
    createdAt: "刚刚",
    fileName: `${candidateName}-具身智能VLA算法负责人-推荐报告-v3.md`,
    summary: `${candidateName}具备机器人学习、VLA、真机部署及 12 人团队管理经验，并有真实场景量产交付记录，与岗位目标高度一致。建议由客户技术负责人优先安排岗位沟通。`,
  };
}

function reportMarkdown(report) {
  return `# 候选人推荐报告\n\n## 推荐结论\n\n${report.summary}\n\n## 核心匹配证据\n\n${report.evidence
    .map((item) => `- ${item}`)
    .join("\n")}\n\n## 风险与待核实项\n\n${report.risks
    .map((item) => `- ${item}`)
    .join("\n")}\n\n## 推荐沟通重点\n\n${report.suggestion}\n`;
}

function downloadReport(report) {
  const blob = new Blob([reportMarkdown(report)], {
    type: "text/markdown;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = report.fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function ReportDocument({ report }) {
  return (
    <article className="recommendation-report-document">
      <header>
        <small>Hunter 候选人推荐报告</small>
        <h2>{report.fileName.replace(/-v\d+\.md$/, "")}</h2>
        <span>
          {report.version} · {report.createdAt}
        </span>
      </header>
      <section>
        <h3>推荐结论</h3>
        <p>{report.summary}</p>
      </section>
      <section>
        <h3>核心匹配证据</h3>
        <ul>
          {report.evidence.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>风险与待核实项</h3>
        <ul>
          {report.risks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>推荐沟通重点</h3>
        <p>{report.suggestion}</p>
      </section>
    </article>
  );
}

export function RecommendationReportFile({
  candidateName = "林昊",
  report,
  versions,
  onRegenerate,
}) {
  const notify = useToast();
  const availableVersions = useMemo(
    () => versions || buildRecommendationReportVersions(candidateName),
    [candidateName, versions],
  );
  const latest = report || availableVersions[0];
  const [preview, setPreview] = useState(null);

  return (
    <>
      <div className="recommendation-report-file">
        <i>
          <Icon name="file" />
        </i>
        <span>
          <b>{latest.fileName}</b>
          <small>
            Markdown 文件 · {latest.version} · {latest.createdAt}
          </small>
        </span>
        <div>
          <Button size="sm" onClick={() => setPreview(latest)}>
            在线查看
          </Button>
          <Button
            size="sm"
            icon="download"
            onClick={() => {
              downloadReport(latest);
              notify("推荐报告已开始下载", "success");
            }}
          >
            下载
          </Button>
          {onRegenerate ? (
            <Button size="sm" icon="refresh" onClick={onRegenerate}>
              重新生成
            </Button>
          ) : null}
        </div>
      </div>
      <Modal
        open={Boolean(preview)}
        close={() => setPreview(null)}
        size="xl"
        title="在线查看推荐报告"
        description={preview?.fileName}
        footer={
          <>
            <Button onClick={() => setPreview(null)}>关闭</Button>
            <Button
              tone="primary"
              icon="download"
              onClick={() => {
                downloadReport(preview);
                notify("推荐报告已开始下载", "success");
              }}
            >
              下载文件
            </Button>
          </>
        }
      >
        {preview ? <ReportDocument report={preview} /> : null}
      </Modal>
    </>
  );
}
