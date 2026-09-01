import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { SearchField } from "../stage1/ui";
import {
  Button,
  DatePicker,
  Drawer,
  FieldGroup,
  FileDrop,
  FormField,
  Modal,
  RelationshipAiProcessingState,
  SelectMenu,
  StatusBadge,
  Tabs,
  TextArea,
  useToast,
} from "./asset-ui";

const initialRecords = [
  {
    id: "record-1",
    title: "技术二面重点追问真机数据闭环",
    content:
      "面试官会沿着数据采集、失败样本回流、策略迭代和真机验证继续追问，不能只讲模型指标。建议候选人准备一个完整闭环案例，并明确个人负责的决策。",
    round: "技术二面",
    candidate: "林昊",
    candidateId: "candidate-linhao",
    date: "2026-08-29",
    source: "候选人推进记录 · 面试后回访",
    status: "仍适用",
    included: true,
    files: ["林昊-技术二面回访.md"],
  },
  {
    id: "record-2",
    title: "一面包含 20 分钟项目深挖",
    content:
      "一面总时长约 60 分钟，其中约 20 分钟围绕最近一个机器人项目展开。面试官重点区分候选人本人完成的工作、团队已有基础和最终量产结果。",
    round: "技术一面",
    candidate: "赵星羽",
    candidateId: "candidate-zhaoxingyu",
    date: "2026-08-25",
    source: "候选人推进记录 · 人工备注",
    status: "仍适用",
    included: true,
    files: [],
  },
  {
    id: "record-3",
    title: "团队管理问题需要准备具体数字",
    content:
      "管理岗位候选人会被追问团队规模、直接汇报人数、招聘与绩效责任，以及本人仍然参与技术决策的比例。只有“带过团队”的描述不够。",
    round: "终面",
    candidate: "陈楚宁",
    candidateId: "candidate-chenchuning",
    date: "2026-08-21",
    source: "猎头手动记录",
    status: "仍适用",
    included: true,
    files: [],
  },
  {
    id: "record-4",
    title: "系统设计题更关注取舍依据",
    content:
      "白板题不是要求唯一正确答案。面试官会连续改变算力、数据和上线周期条件，观察候选人是否能解释方案变化与取舍依据。",
    round: "技术二面",
    candidate: "周明远",
    candidateId: "candidate-zhoumingyuan",
    date: "2026-08-18",
    source: "候选人推进记录 · 面试后回访",
    status: "仍适用",
    included: true,
    files: ["系统设计题回忆.pdf"],
  },
  {
    id: "record-5",
    title: "原三轮技术面安排已停止使用",
    content:
      "早期流程为三轮技术面，客户在 8 月调整为两轮技术面加负责人终面。此记录仅保留历史依据，不应继续写入候选人指南。",
    round: "综合记录",
    candidate: "",
    candidateId: "",
    date: "2026-07-12",
    source: "客户沟通记录",
    status: "已失效",
    included: false,
    files: [],
  },
  {
    id: "record-6",
    title: "英文交流比例可能随面试官变化",
    content:
      "两位候选人反馈不同：一位全程中文，另一位有约 10 分钟英文项目交流。当前证据不足以判断是否为固定环节，发送指南时应标记为可能发生。",
    round: "技术一面",
    candidate: "",
    candidateId: "",
    date: "2026-08-27",
    source: "两条候选人回访合并",
    status: "待核实",
    included: false,
    files: [],
  },
  {
    id: "record-7",
    title: "新增机器人数据质量追问",
    content:
      "技术二面新增了数据质量追问，重点包括脏数据比例、失败样本定义和人工标注成本。候选人应准备真实项目中的数据治理方法与成本取舍。",
    round: "技术二面",
    candidate: "赵星羽",
    candidateId: "candidate-zhaoxingyu",
    date: "2026-08-31",
    source: "候选人推进记录 · 面试后回访",
    status: "仍适用",
    included: false,
    files: [],
  },
  {
    id: "record-8",
    title: "负责人终面关注跨团队推动",
    content:
      "负责人终面会重点考察跨团队推动能力。候选人应准备一个涉及硬件、数据和算法团队协作的交付案例，说明冲突处理和最终结果。",
    round: "终面",
    candidate: "林昊",
    candidateId: "candidate-linhao",
    date: "2026-08-30",
    source: "候选人推进记录 · 面试后回访",
    status: "仍适用",
    included: false,
    files: [],
  },
];

const guideVersions = [
  {
    version: "v3",
    createdAt: "2026-08-29 17:40",
    fileName: "具身智能VLA算法负责人-面试指南-v3.md",
    sourceCount: 4,
  },
  {
    version: "v2",
    createdAt: "2026-08-22 11:16",
    fileName: "具身智能VLA算法负责人-面试指南-v2.md",
    sourceCount: 3,
  },
  {
    version: "v1",
    createdAt: "2026-08-15 16:08",
    fileName: "具身智能VLA算法负责人-面试指南-v1.md",
    sourceCount: 2,
  },
];

const guideContent = {
  process: [
    "技术一面约 60 分钟，通常包含项目介绍、项目深挖和基础技术判断。",
    "技术二面重点讨论真机数据闭环、系统方案取舍和复杂问题定位。",
    "负责人终面关注团队管理、跨团队协作和技术路线判断。",
  ],
  focus: [
    "准备一个完整的真机项目案例，说明数据来源、失败样本回流和最终效果。",
    "明确个人决策、团队已有基础和协作方贡献，不要只描述团队整体成果。",
    "管理经历请准备团队规模、直接汇报人数和本人仍参与技术决策的比例。",
  ],
  advice: [
    "系统设计题会动态改变算力、数据和上线周期条件，重点说明取舍依据。",
    "可能出现短时间英文项目交流，但尚未确认是否为固定环节。",
  ],
};

function guideMarkdown(version, content = guideContent) {
  return `# 具身智能 VLA 算法负责人 · 面试准备指南\n\n> 根据历史面试记录整理，实际安排以客户最新通知为准。\n\n## 面试流程\n\n${content.process
    .map((item) => `- ${item}`)
    .join("\n")}\n\n## 重点准备内容\n\n${content.focus
    .map((item) => `- ${item}`)
    .join("\n")}\n\n## 面试建议\n\n${content.advice
    .map((item) => `- ${item}`)
    .join("\n")}\n\n---\n\nHunter 整理版本：${version}`;
}

function downloadGuide(version) {
  const blob = new Blob([guideMarkdown(version.version)], {
    type: "text/markdown;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = version.fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function GuideDocument({ version }) {
  const expanded = version.version === "v4";
  return (
    <article className="s4-interview-guide-document">
      <header>
        <small>Hunter 岗位面试指南</small>
        <h2>具身智能 VLA 算法负责人</h2>
        <span>
          {version.version} · {version.createdAt}
        </span>
      </header>
      <blockquote>
        根据历史面试记录整理，实际安排以客户最新通知为准。
      </blockquote>
      <section>
        <h3>面试流程</h3>
        <ul>
          {guideContent.process.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>重点准备内容</h3>
        <ul>
          {guideContent.focus.map((item) => (
            <li key={item}>{item}</li>
          ))}
          {expanded ? (
            <li>
              准备数据质量治理案例，说明脏数据比例、失败样本定义、标注成本和最终取舍。
            </li>
          ) : null}
        </ul>
      </section>
      <section>
        <h3>面试建议</h3>
        <ul>
          {guideContent.advice.map((item) => (
            <li key={item}>{item}</li>
          ))}
          {expanded ? (
            <li>
              负责人终面准备跨团队交付案例，重点说明如何协调硬件、数据和算法团队。
            </li>
          ) : null}
        </ul>
      </section>
    </article>
  );
}

function GuideFile({ version, onPreview, onCopy, onDownload }) {
  return (
    <div className="s4-interview-guide-file">
      <i>
        <Icon name="file" />
      </i>
      <span>
        <b>{version.fileName}</b>
        <small>
          Markdown 文件 · {version.version} · 已使用 {version.sourceCount}{" "}
          条沟通记录
        </small>
      </span>
      <div>
        <Button size="sm" onClick={onPreview}>
          在线查看
        </Button>
        <Button size="sm" icon="copy" onClick={onCopy}>
          复制文案
        </Button>
        <Button size="sm" icon="download" onClick={onDownload}>
          下载
        </Button>
      </div>
    </div>
  );
}

export function buildInterviewGuideRecord() {
  return {
    id: "position-interview-guide-v3",
    type: "面试指南整理",
    title: "岗位面试指南 · v3",
    target: "具身智能 VLA 算法负责人",
    source: "岗位详情 · 面试资料",
    state: "complete",
    startedAt: "8 月 29 日 17:38",
    updatedAt: "8 月 29 日 17:40",
    summary: "已使用 6 条有效沟通记录生成候选人版面试指南。",
    plan: [
      {
        title: "读取沟通记录",
        detail: "读取 6 条仍适用记录和 1 条待核实记录。",
        state: "complete",
        label: "已完成",
      },
      {
        title: "清理敏感信息",
        detail: "移除候选人身份、薪资和内部评价。",
        state: "complete",
        label: "已完成",
      },
      {
        title: "生成并保存指南",
        detail: "生成新版本并保存为当前岗位面试指南，原版本继续保留。",
        state: "complete",
        label: "已完成",
      },
    ],
    runs: [
      {
        id: "run-interview-guide-v3",
        label: "运行 #3",
        time: "8 月 29 日 17:38 · 2 分 06 秒",
        detail: "生成候选人版指南并通过敏感信息检查。",
        status: "完成",
        tone: "success",
      },
    ],
  };
}

export function PositionInterviewMaterials() {
  const navigate = useNavigate();
  const notify = useToast();
  const [params, setParams] = useSearchParams();
  const section = params.get("section") || "records";
  const [records, setRecords] = useState(initialRecords);
  const [activeRecord, setActiveRecord] = useState(null);
  const [newRecordOpen, setNewRecordOpen] = useState(false);
  const [recordSubmitted, setRecordSubmitted] = useState(false);
  const [recordDraft, setRecordDraft] = useState({
    content: "",
    round: "",
    candidate: "",
    date: "",
    files: [],
  });
  const [query, setQuery] = useState("");
  const [roundFilter, setRoundFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [preview, setPreview] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState(
    "把最近新增的面试反馈整理进指南，优先补充数据质量和跨团队协作问题；不确定的英文面试环节继续标记为可能发生。",
  );
  const [guideState, setGuideState] = useState("idle");
  const [guideHistory, setGuideHistory] = useState(guideVersions);
  const guideTimerRef = useRef(null);

  useEffect(
    () => () => {
      if (guideTimerRef.current) window.clearTimeout(guideTimerRef.current);
    },
    [],
  );

  const setSection = (value) => {
    const next = new URLSearchParams(params);
    if (value === "records") next.delete("section");
    else next.set("section", value);
    setParams(next);
  };
  const filteredRecords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return records.filter((record) => {
      const matchesQuery =
        !normalized ||
        [record.title, record.content, record.candidate, record.source].some(
          (value) =>
            String(value || "")
              .toLowerCase()
              .includes(normalized),
        );
      const matchesRound = !roundFilter || record.round === roundFilter;
      const matchesStatus = !statusFilter || record.status === statusFilter;
      return matchesQuery && matchesRound && matchesStatus;
    });
  }, [query, records, roundFilter, statusFilter]);
  const currentVersion = guideHistory[0];
  const nextVersionNumber = Number(currentVersion.version.slice(1)) + 1;
  const nextVersion = {
    version: `v${nextVersionNumber}`,
    createdAt: "刚刚",
    fileName: `具身智能VLA算法负责人-面试指南-v${nextVersionNumber}.md`,
    sourceCount: records.filter((item) => item.status !== "已失效").length,
  };

  const saveNewRecord = () => {
    setRecordSubmitted(true);
    if (!recordDraft.content.trim()) return;
    const title =
      recordDraft.content
        .trim()
        .split(/[。！？\n]/)[0]
        .slice(0, 24) || "新增沟通记录";
    const candidateMap = {
      林昊: "candidate-linhao",
      赵星羽: "candidate-zhaoxingyu",
      陈楚宁: "candidate-chenchuning",
    };
    setRecords((current) => [
      {
        id: `record-${Date.now()}`,
        title,
        content: recordDraft.content.trim(),
        round: recordDraft.round || "综合记录",
        candidate: recordDraft.candidate,
        candidateId: candidateMap[recordDraft.candidate] || "",
        date: recordDraft.date || "2026-09-01",
        source: "猎头手动记录",
        status: "仍适用",
        included: false,
        files: recordDraft.files.map((file) => file.name || file),
      },
      ...current,
    ]);
    setRecordDraft({
      content: "",
      round: "",
      candidate: "",
      date: "",
      files: [],
    });
    setRecordSubmitted(false);
    setNewRecordOpen(false);
    notify("沟通记录已保存", "success");
  };

  const startGuideUpdate = () => {
    if (guideTimerRef.current) window.clearTimeout(guideTimerRef.current);
    setAiDialogOpen(false);
    setGuideState("running");
    guideTimerRef.current = window.setTimeout(() => {
      setGuideHistory((current) => [nextVersion, ...current]);
      setGuideState("idle");
      notify(`面试指南已更新为 ${nextVersion.version}`, "success");
    }, 2400);
  };

  const copyGuide = async () => {
    try {
      await navigator.clipboard.writeText(
        guideMarkdown(currentVersion.version),
      );
      notify("面试指南文案已复制", "success");
    } catch {
      notify("浏览器未允许复制，请在在线预览中手动复制", "error");
    }
  };

  return (
    <div className="s4-detail-stack s4-interview-materials">
      <section className="s4-interview-summary" aria-label="面试资料概览">
        <span>
          <i>
            <Icon name="message" />
          </i>
          <span>
            <small>当前面试指南</small>
            <b>
              {currentVersion.version} · {currentVersion.createdAt}
            </b>
          </span>
        </span>
        <dl>
          <div>
            <dt>沟通记录</dt>
            <dd>{records.length}</dd>
          </div>
          <div>
            <dt>仍适用</dt>
            <dd>{records.filter((item) => item.status === "仍适用").length}</dd>
          </div>
          <div>
            <dt>历史指南</dt>
            <dd>{guideHistory.length}</dd>
          </div>
        </dl>
      </section>

      <Tabs
        label="面试资料内容"
        items={[
          { value: "records", label: "沟通记录", count: records.length },
          { value: "guide", label: "面试指南" },
        ]}
        value={section}
        onChange={setSection}
      />

      {section === "records" ? (
        <FieldGroup
          title="沟通记录"
          description="记录候选人回访、客户沟通和猎头获得的面试信息；已失效内容保留历史，但不会用于整理新指南。"
          action={
            <Button
              tone="primary"
              icon="plus"
              onClick={() => setNewRecordOpen(true)}
            >
              新增记录
            </Button>
          }
        >
          <div className="s4-interview-record-toolbar">
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="搜索沟通内容、候选人或来源"
            />
            <div className="s4-interview-record-filters">
              <SelectMenu
                label="面试轮次"
                value={roundFilter}
                options={["技术一面", "技术二面", "终面", "综合记录"]}
                onChange={setRoundFilter}
              />
              <SelectMenu
                label="有效状态"
                value={statusFilter}
                options={["仍适用", "待核实", "已失效"]}
                onChange={setStatusFilter}
              />
            </div>
            {(roundFilter || statusFilter) && (
              <Button
                size="sm"
                onClick={() => {
                  setRoundFilter("");
                  setStatusFilter("");
                }}
              >
                清空筛选
              </Button>
            )}
          </div>
          {filteredRecords.length ? (
            <div className="s4-interview-record-list">
              {filteredRecords.map((record) => (
                <button
                  type="button"
                  key={record.id}
                  onClick={() => setActiveRecord(record)}
                >
                  <time>{record.date}</time>
                  <span>
                    <b>{record.title}</b>
                    <p>{record.content}</p>
                    <small>
                      {record.round} · {record.source}
                      {record.candidate ? ` · ${record.candidate}` : ""}
                    </small>
                  </span>
                  <span className="s4-interview-record-status">
                    <StatusBadge
                      tone={
                        record.status === "仍适用"
                          ? "success"
                          : record.status === "待核实"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {record.status}
                    </StatusBadge>
                  </span>
                  <Icon name="chevronRight" />
                </button>
              ))}
            </div>
          ) : (
            <div className="s4-interview-empty">
              <Icon name="search" />
              <b>没有符合当前条件的沟通记录</b>
              <p>调整搜索词或清空筛选后再试。</p>
            </div>
          )}
        </FieldGroup>
      ) : (
        <>
          {guideState === "running" ? (
            <RelationshipAiProcessingState
              title={`正在整理面试指南 ${nextVersion.version}`}
              description="当前版本保持可用；生成完成后直接保存为最新版本，历史版本不会被覆盖。"
              prompt={aiPrompt}
              steps={[
                "读取有效沟通记录",
                "排除身份、薪资和内部评价",
                "合并矛盾信息并标记不确定项",
                "生成并保存候选人版指南",
              ]}
              activeStep={2}
            />
          ) : null}
          <FieldGroup
            title="当前面试指南"
            description="候选人版内容不包含其他候选人的身份、薪资、内部评价或客户保密信息。"
            action={
              <div className="s4-interview-guide-actions">
                <Button size="sm" onClick={() => setHistoryOpen(true)}>
                  历史版本
                </Button>
                <Button
                  size="sm"
                  tone="primary"
                  icon="sparkles"
                  onClick={() => setAiDialogOpen(true)}
                >
                  整理与更新
                </Button>
              </div>
            }
          >
            <GuideFile
              version={currentVersion}
              onPreview={() => setPreview(currentVersion)}
              onCopy={copyGuide}
              onDownload={() => downloadGuide(currentVersion)}
            />
            <div className="s4-interview-guide-outline">
              <section>
                <small>面试流程</small>
                <b>技术一面 → 技术二面 → 负责人终面</b>
                <p>三轮安排，实际轮次以客户通知为准。</p>
              </section>
              <section>
                <small>重点准备</small>
                <b>{currentVersion.version === "v4" ? "5" : "3"} 项</b>
                <p>真机数据闭环、方案取舍、团队管理等。</p>
              </section>
              <section>
                <small>待核实提示</small>
                <b>1 项</b>
                <p>是否包含英文项目交流仍需确认。</p>
              </section>
            </div>
          </FieldGroup>
        </>
      )}

      <Drawer
        open={Boolean(activeRecord)}
        close={() => setActiveRecord(null)}
        title="沟通记录详情"
        className="s4-interview-record-drawer"
      >
        {activeRecord ? (
          <div className="s4-interview-record-detail">
            <header>
              <span>
                <small>
                  {activeRecord.round} · {activeRecord.date}
                </small>
                <h3>{activeRecord.title}</h3>
              </span>
              <StatusBadge
                tone={
                  activeRecord.status === "仍适用"
                    ? "success"
                    : activeRecord.status === "待核实"
                      ? "warning"
                      : "neutral"
                }
              >
                {activeRecord.status}
              </StatusBadge>
            </header>
            <section>
              <h4>记录内容</h4>
              <p>{activeRecord.content}</p>
            </section>
            <dl>
              <div>
                <dt>信息来源</dt>
                <dd>{activeRecord.source}</dd>
              </div>
              <div>
                <dt>关联候选人</dt>
                <dd>
                  {activeRecord.candidate ? (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/candidates/${activeRecord.candidateId}`)
                      }
                    >
                      {activeRecord.candidate}
                      <Icon name="external" />
                    </button>
                  ) : (
                    "未关联"
                  )}
                </dd>
              </div>
            </dl>
            {activeRecord.files.length ? (
              <section>
                <h4>相关文件</h4>
                <div className="s4-interview-attachment-list">
                  {activeRecord.files.map((file) => (
                    <button
                      type="button"
                      key={file}
                      onClick={() => notify(`正在打开 ${file}`, "info")}
                    >
                      <Icon name="file" />
                      <span>{file}</span>
                      <Icon name="external" />
                    </button>
                  ))}
                </div>
              </section>
            ) : null}
            <footer>
              <Button
                onClick={() => {
                  const nextStatus =
                    activeRecord.status === "已失效" ? "仍适用" : "已失效";
                  setRecords((current) =>
                    current.map((record) =>
                      record.id === activeRecord.id
                        ? { ...record, status: nextStatus, included: false }
                        : record,
                    ),
                  );
                  setActiveRecord((current) => ({
                    ...current,
                    status: nextStatus,
                    included: false,
                  }));
                  notify(
                    nextStatus === "已失效"
                      ? "记录已标记为失效，不再用于整理指南"
                      : "记录已恢复为仍适用",
                    "success",
                  );
                }}
              >
                {activeRecord.status === "已失效"
                  ? "恢复为仍适用"
                  : "标记为已失效"}
              </Button>
            </footer>
          </div>
        ) : null}
      </Drawer>

      <Modal
        open={newRecordOpen}
        close={() => setNewRecordOpen(false)}
        size="lg"
        title="新增沟通记录"
        description="记录候选人回访、客户沟通或猎头获得的面试信息。"
        footer={
          <>
            <Button onClick={() => setNewRecordOpen(false)}>取消</Button>
            <Button tone="primary" onClick={saveNewRecord}>
              保存记录
            </Button>
          </>
        }
      >
        <div className="s4-interview-record-form">
          <FormField
            label="记录内容"
            required
            span={2}
            error={
              recordSubmitted && !recordDraft.content.trim()
                ? "请填写需要保存的沟通内容"
                : ""
            }
            help="可以直接粘贴文字或链接；Hunter 会在保存后提炼记录标题。"
          >
            <TextArea
              value={recordDraft.content}
              onChange={(content) =>
                setRecordDraft((current) => ({ ...current, content }))
              }
              rows={6}
              placeholder="例如：二面新增了数据质量追问，重点问失败样本定义、标注成本和数据治理取舍……"
            />
          </FormField>
          <FormField label="面试轮次">
            <SelectMenu
              label="选择面试轮次"
              value={recordDraft.round}
              options={["技术一面", "技术二面", "终面", "综合记录"]}
              onChange={(round) =>
                setRecordDraft((current) => ({ ...current, round }))
              }
            />
          </FormField>
          <FormField label="关联候选人">
            <SelectMenu
              label="可选关联候选人"
              value={recordDraft.candidate}
              options={["林昊", "赵星羽", "陈楚宁"]}
              searchable
              onChange={(candidate) =>
                setRecordDraft((current) => ({ ...current, candidate }))
              }
            />
          </FormField>
          <FormField label="获知时间">
            <DatePicker
              label="选择获知时间"
              value={recordDraft.date}
              onChange={(date) =>
                setRecordDraft((current) => ({ ...current, date }))
              }
              mode="date"
              initialYear={2026}
            />
          </FormField>
          <FormField label="相关文件" span={2}>
            <FileDrop
              files={recordDraft.files}
              onFiles={(files) =>
                setRecordDraft((current) => ({ ...current, files }))
              }
              accept="PDF、DOCX、图片"
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        open={aiDialogOpen}
        close={() => setAiDialogOpen(false)}
        size="lg"
        title="整理面试指南"
        description="Hunter 会读取有效沟通记录并直接生成最新版本；原有版本会完整保留在历史记录中。"
        footer={
          <>
            <Button onClick={() => setAiDialogOpen(false)}>取消</Button>
            <Button
              tone="primary"
              disabled={!aiPrompt.trim()}
              onClick={startGuideUpdate}
            >
              开始整理
            </Button>
          </>
        }
      >
        <FormField label="告诉 Hunter 如何整理" required>
          <TextArea
            value={aiPrompt}
            onChange={setAiPrompt}
            rows={7}
            placeholder="例如：纳入最近的面试反馈，重点补充数据治理问题，过时流程不要写入……"
          />
        </FormField>
        <div className="s4-interview-privacy-note">
          <Icon name="shield" />
          <span>
            <b>候选人版内容检查</b>
            <p>
              Hunter
              会排除其他候选人的姓名、联系方式、薪资、内部评价和客户保密信息；不确定内容会明确标记，不会改写为确定事实。
            </p>
          </span>
        </div>
      </Modal>

      <Modal
        open={Boolean(preview)}
        close={() => setPreview(null)}
        size="xl"
        title="在线查看面试指南"
        description={preview?.fileName}
        footer={
          <>
            <Button onClick={() => setPreview(null)}>关闭</Button>
            <Button
              icon="download"
              tone="primary"
              onClick={() => preview && downloadGuide(preview)}
            >
              下载文件
            </Button>
          </>
        }
      >
        {preview ? <GuideDocument version={preview} /> : null}
      </Modal>

      <Drawer
        open={historyOpen}
        close={() => setHistoryOpen(false)}
        title="面试指南历史版本"
        className="s4-interview-history-drawer"
      >
        <div className="s4-interview-history-list">
          {guideHistory.map((version, index) => (
            <button
              type="button"
              key={version.version}
              onClick={() => setPreview(version)}
            >
              <i>
                <Icon name="file" />
              </i>
              <span>
                <b>{version.fileName}</b>
                <small>
                  {version.createdAt} · 使用 {version.sourceCount} 条沟通记录
                </small>
              </span>
              {index === 0 ? (
                <StatusBadge tone="success">当前版本</StatusBadge>
              ) : null}
              <Icon name="chevronRight" />
            </button>
          ))}
        </div>
      </Drawer>
    </div>
  );
}
