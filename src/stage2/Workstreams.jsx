import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Button, IconButton, Modal, StatusBadge, useToast } from "../stage1/ui";
import {
  Composer,
  createMarkdownTable,
  DecisionRequest,
  EmailDraftReview,
  HunterReply,
  IdentityConflictReview,
  RuntimeBar,
  UserMessage,
  WorkHistory,
} from "./automation-ui";
import {
  candidates,
  evidenceRows,
  internalTasks,
  planSteps,
  workItems,
} from "./data";
import { CandidateReviewWorkspace, InspectionPanel } from "./ReviewWorkspace";

const defaultPrompt =
  "为星澜机器人“具身智能 VLA 算法负责人”岗位做多渠道找人。优先北京，候选人要有机器人学习或多模态策略经验，也要真正做过产品落地和团队管理。本轮先给我 20 位以内值得判断的人选，不要直接联系。";

function CandidateReviewEntry({ onOpen }) {
  return (
    <div className="s2-markdown-action-row">
      <Button tone="primary" icon="users" onClick={onOpen}>
        打开候选人审核（18）
      </Button>
      <small>
        也可以直接输入筛选规则，例如“将 85
        分以上的人加入岗位储备，但不选赵星羽”。
      </small>
    </div>
  );
}

export function WorkstreamHeader({
  type = "岗位招聘",
  title = "具身智能 VLA 算法负责人",
  object = "星澜机器人 · 北京",
  status,
  statusTone,
  paused,
  terminated,
  onPause,
  onReset,
  onTerminate,
  onDelete,
}) {
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
    <header className="s2-workstream-header">
      <div>
        <span>{type}</span>
        <h1>{title}</h1>
        <small>{object}</small>
      </div>
      <div>
        <StatusBadge
          tone={
            terminated ? "danger" : paused ? "neutral" : statusTone || "warning"
          }
        >
          {terminated ? "已终止" : paused ? "已暂停" : status || "等待用户"}
        </StatusBadge>
        {!terminated ? (
          <Button
            tone="secondary"
            icon={paused ? "play" : "pause"}
            onClick={onPause}
          >
            {paused ? "继续" : "暂停"}
          </Button>
        ) : null}
        <div className="s2-more-wrap" ref={menuRef}>
          <IconButton
            icon="more"
            label="更多任务操作"
            onClick={() => setMenuOpen((open) => !open)}
          />
          {menuOpen ? (
            <div className="s2-more-menu">
              <button
                type="button"
                onClick={() => {
                  onReset();
                  setMenuOpen(false);
                }}
              >
                <Icon name="refresh" />
                重新演示本轮流程
              </button>
              <button
                type="button"
                disabled={terminated}
                onClick={() => {
                  onTerminate();
                  setMenuOpen(false);
                }}
              >
                <Icon name="logout" />
                终止任务
              </button>
              <button
                type="button"
                className="is-danger"
                onClick={() => {
                  onDelete();
                  setMenuOpen(false);
                }}
              >
                <Icon name="trash" />
                删除任务
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function AutomationWorkspace() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const notify = useToast();
  const forcedState = params.get("state");
  const [historyCollapsed, setHistoryCollapsed] = useState(false);
  const [phase, setPhase] = useState(() => {
    if (forcedState === "stream-error") return 1;
    if (forcedState === "limited") return 2;
    if (forcedState === "local-waiting" || forcedState === "stale-task")
      return 3;
    if (forcedState === "merge-conflict") return 4;
    if (forcedState === "review") return 4;
    if (forcedState === "no-candidate") return 4;
    if (forcedState === "waiting" || forcedState === "candidate-reply")
      return 5;
    const restored = Number(sessionStorage.getItem("hunter-workstream-phase"));
    return Number.isFinite(restored) ? restored : 0;
  });
  const [paused, setPaused] = useState(
    () =>
      !forcedState &&
      sessionStorage.getItem("hunter-workstream-paused") === "1",
  );
  const [terminated, setTerminated] = useState(false);
  const [runtimeOpen, setRuntimeOpen] = useState(
    () => sessionStorage.getItem("hunter-runtime-open") === "1",
  );
  const [inspection, setInspection] = useState(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("hunter-workstream-inspection") || "null",
      );
    } catch {
      return null;
    }
  });
  const [reviewOpen, setReviewOpen] = useState(
    () => sessionStorage.getItem("hunter-review-open") === "1",
  );
  const [authMode, setAuthMode] = useState(
    () => sessionStorage.getItem("hunter-workstream-auth") || "confirm",
  );
  const [composer, setComposer] = useState(
    () => sessionStorage.getItem("hunter-workstream-draft") || "",
  );
  const [attachments, setAttachments] = useState([]);
  const [userDecisions, setUserDecisions] = useState([]);
  const [planAdjusted, setPlanAdjusted] = useState(
    () =>
      !forcedState &&
      sessionStorage.getItem("hunter-workstream-plan-adjusted") === "1",
  );
  const [latestPlanRequirement, setLatestPlanRequirement] = useState(
    () =>
      (!forcedState &&
        sessionStorage.getItem("hunter-workstream-plan-requirement")) ||
      "",
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [terminateOpen, setTerminateOpen] = useState(false);
  const [streamStopped, setStreamStopped] = useState(false);
  const [streamError, setStreamError] = useState(
    forcedState === "stream-error",
  );
  const [contactStage, setContactStage] = useState(() => {
    if (forcedState === "waiting") return "waiting";
    if (forcedState === "candidate-reply") return "reply";
    return sessionStorage.getItem("hunter-workstream-contact-stage") || "idle";
  });
  const [localError, setLocalError] = useState(forcedState === "error");
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [handoffComplete, setHandoffComplete] = useState(
    () =>
      [
        "local-waiting",
        "stale-task",
        "merge-conflict",
        "review",
        "waiting",
        "candidate-reply",
      ].includes(forcedState) ||
      sessionStorage.getItem("hunter-workstream-handoff") === "1",
  );
  const scrollRef = useRef(null);
  const prompt =
    sessionStorage.getItem("hunter-new-workstream-prompt") || defaultPrompt;

  useEffect(() => {
    if (forcedState === "stream-error") {
      setPhase(1);
      setPaused(false);
      setStreamError(true);
      setStreamStopped(false);
    } else if (forcedState === "limited") {
      setPhase(2);
      setPaused(false);
      setStreamError(false);
      setStreamStopped(false);
      setHandoffComplete(false);
    } else if (
      forcedState === "local-waiting" ||
      forcedState === "stale-task"
    ) {
      setPhase(3);
      setHandoffComplete(true);
    } else if (forcedState === "merge-conflict") {
      setPhase(4);
      setHandoffComplete(true);
    } else if (forcedState === "review") {
      setPhase(4);
    } else if (forcedState === "waiting") {
      setPhase(5);
      setContactStage("waiting");
    } else if (forcedState === "candidate-reply") {
      setPhase(5);
      setContactStage("reply");
    } else if (forcedState === "error") {
      setPhase(3);
      setLocalError(true);
    }
  }, [forcedState]);

  useEffect(() => {
    if (forcedState && forcedState !== "stream-error") return undefined;
    if (
      paused ||
      terminated ||
      streamStopped ||
      streamError ||
      phase >= 4 ||
      (phase === 2 && !handoffComplete)
    )
      return undefined;
    const delays = [700, 1200, 1450, 1750];
    const timer = window.setTimeout(
      () => setPhase((current) => current + 1),
      delays[phase] || 1200,
    );
    return () => window.clearTimeout(timer);
  }, [
    forcedState,
    handoffComplete,
    paused,
    phase,
    streamError,
    streamStopped,
    terminated,
  ]);

  useEffect(() => {
    sessionStorage.setItem(
      "hunter-workstream-handoff",
      handoffComplete ? "1" : "0",
    );
  }, [handoffComplete]);

  useEffect(() => {
    if (!forcedState)
      sessionStorage.setItem("hunter-workstream-phase", String(phase));
  }, [forcedState, phase]);

  useEffect(() => {
    sessionStorage.setItem("hunter-runtime-open", runtimeOpen ? "1" : "0");
  }, [runtimeOpen]);

  useEffect(() => {
    sessionStorage.setItem("hunter-workstream-draft", composer);
  }, [composer]);

  useEffect(() => {
    sessionStorage.setItem(
      "hunter-workstream-inspection",
      JSON.stringify(inspection),
    );
  }, [inspection]);

  useEffect(() => {
    sessionStorage.setItem("hunter-review-open", reviewOpen ? "1" : "0");
  }, [reviewOpen]);

  useEffect(() => {
    sessionStorage.setItem("hunter-workstream-auth", authMode);
  }, [authMode]);

  useEffect(() => {
    sessionStorage.setItem("hunter-workstream-contact-stage", contactStage);
  }, [contactStage]);

  useEffect(() => {
    if (!forcedState) {
      sessionStorage.setItem("hunter-workstream-paused", paused ? "1" : "0");
      sessionStorage.setItem(
        "hunter-workstream-plan-adjusted",
        planAdjusted ? "1" : "0",
      );
      sessionStorage.setItem(
        "hunter-workstream-plan-requirement",
        latestPlanRequirement,
      );
    }
  }, [forcedState, latestPlanRequirement, paused, planAdjusted]);

  useEffect(() => {
    if (phase > 0)
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: forcedState ? "auto" : "smooth",
      });
  }, [contactStage, forcedState, phase, userDecisions]);

  const resetDemo = () => {
    setPhase(0);
    setPaused(false);
    setTerminated(false);
    setRuntimeOpen(false);
    setInspection(null);
    setReviewOpen(false);
    setUserDecisions([]);
    setPlanAdjusted(false);
    setLatestPlanRequirement("");
    setStreamStopped(false);
    setStreamError(false);
    setContactStage("idle");
    setLocalError(false);
    setHandoffOpen(false);
    setHandoffComplete(false);
    sessionStorage.removeItem("hunter-workstream-phase");
    sessionStorage.removeItem("hunter-workstream-draft");
    sessionStorage.removeItem("hunter-workstream-inspection");
    sessionStorage.removeItem("hunter-review-open");
    sessionStorage.removeItem("hunter-workstream-paused");
    sessionStorage.removeItem("hunter-workstream-plan-adjusted");
    sessionStorage.removeItem("hunter-workstream-plan-requirement");
    sessionStorage.removeItem("hunter-workstream-contact-stage");
    sessionStorage.removeItem("hunter-workstream-handoff");
    notify("已从第一条输入重新演示", "info");
  };

  const completeDecision = (text, result) => {
    setUserDecisions((items) => [...items, { text, result }]);
    setPhase(5);
    setReviewOpen(false);
    setInspection(null);
    setPlanAdjusted(false);
    setLatestPlanRequirement("");
    setPaused(false);
    setContactStage("scope");
  };

  const send = (text, files) => {
    const attachmentText = files.length
      ? `；附带 ${files.map((file) => file.name).join("、")}`
      : "";
    if (phase < 4) {
      setUserDecisions((items) => [
        ...items,
        {
          text: `${text}${attachmentText}`,
          result:
            "已记录新信息，并暂停受影响的候选人匹配步骤。Hunter 将先说明影响范围，再局部重做。",
        },
      ]);
      setPaused(true);
      setPlanAdjusted(true);
      setLatestPlanRequirement(`${text}${attachmentText}`);
    } else if (/85|八十五/.test(text)) {
      const omitted = /赵星羽/.test(text);
      completeDecision(
        `${text}${attachmentText}`,
        `已按同一审核规则处理：${omitted ? "未选择赵星羽，" : ""}4 位候选人已加入岗位储备；其余候选人继续保留在本轮审核结果中。下一步可以继续指定需要联系的人选。`,
      );
    } else if (contactStage === "waiting") {
      setUserDecisions((items) => [
        ...items,
        {
          text: `${text}${attachmentText}`,
          result:
            "已收到候选人回复或新资料。我会先展示档案变化与合并结果，再只重做受影响的身份检查和岗位匹配。",
        },
      ]);
      setContactStage("reply");
    } else if (/联系|沟通|邮件/.test(text)) {
      setUserDecisions((items) => [
        ...items,
        {
          text: `${text}${attachmentText}`,
          result:
            "已整理联系范围并生成邮件草稿。邮件不会自动发送，请先确认收件人、主题和正文。",
        },
      ]);
      setContactStage("authorization");
    } else {
      setUserDecisions((items) => [
        ...items,
        {
          text: `${text}${attachmentText}`,
          result:
            "我已记录这项决定。当前描述仍涉及多个候选人范围，我会保留审核结果，并在执行前明确列出将受影响的人选和动作。",
        },
      ]);
    }
    setComposer("");
    setAttachments([]);
  };

  const plan = planSteps.map((step, index) => {
    let status = "pending";
    if (phase >= 5) status = "done";
    else if (phase >= 4) status = index < 4 ? "done" : "waiting-user";
    else if (phase === 3)
      status = index < 2 ? "done" : index === 2 ? "running" : "pending";
    else if (phase === 2)
      status = index < 1 ? "done" : index === 1 ? "running" : "pending";
    else if (phase === 1) status = index === 0 ? "running" : "pending";

    if (paused && status === "running") {
      status = planAdjusted ? "adjusted" : "paused";
    }

    return {
      ...step,
      status,
      statusDetail:
        status === "adjusted"
          ? "新增信息只影响当前步骤；已完成步骤和已有结果继续保留。"
          : status === "paused"
            ? "当前检查点和已有结果已保留，继续后从该步骤恢复。"
            : status === "waiting-user"
              ? "等待审核决定后再检查后续动作和授权。"
              : undefined,
    };
  });

  const planUpdate = planAdjusted
    ? {
        title: "计划已根据新信息调整",
        detail:
          "保留已经完成的步骤，只暂停并重做受影响的当前步骤；继续后从此检查点推进。",
        requirement: latestPlanRequirement,
        changes: [
          {
            title: "候选人召回范围",
            detail: "按补充要求增量查找受影响的人选，不重复已经完成的检索。",
          },
          {
            title: "补全、查重与匹配门禁",
            detail: "只对新增或受影响的人选重新处理，并重新合并审核结果。",
          },
        ],
        unchanged: "本轮最多 20 位、北京优先、先审核且不直接联系。",
        time: "刚刚",
        tone: "warning",
      }
    : paused
      ? {
          title: "计划已暂停",
          detail:
            "当前步骤、检查点和已有结果均已保留，继续后不会重复已完成步骤。",
          time: "刚刚",
          tone: "warning",
        }
      : phase >= 5
        ? {
            title: "用户决定已应用",
            detail: "候选人处理结果已保留，外部联系继续停在授权检查点。",
            time: "刚刚",
            tone: "info",
          }
        : phase >= 4
          ? {
              title: "计划进入候选人审核节点",
              detail: "召回、补全、查重和门禁已完成，等待用户决定处理范围。",
              time: "09:08",
              tone: "info",
            }
          : phase >= 3
            ? {
                title: "并行召回已完成",
                detail: "计划继续执行候选人补全、身份查重和匹配门禁。",
                time: "09:05",
                tone: "info",
              }
            : phase >= 2
              ? {
                  title: "岗位边界已确认",
                  detail:
                    "云端候选人和公开资料检索已经开始；本机处理由用户选择设备后继续。",
                  time: "09:02",
                  tone: "info",
                }
              : null;

  if (reviewOpen) {
    return (
      <div className="s2-page s2-review-page-shell">
        <CandidateReviewWorkspace
          candidates={candidates}
          onClose={() => setReviewOpen(false)}
          onApply={({ selected }) => {
            completeDecision(
              `将已选择的 ${selected.length} 位候选人加入岗位储备。`,
              `已应用审核决定：${selected.length} 位候选人已加入岗位储备。未选择的人选继续保留在本轮审核结果中；下一步可以继续指定需要联系的人选。`,
            );
          }}
        />
      </div>
    );
  }

  if (forcedState === "loading") {
    return (
      <div className="s2-page s2-workspace-loading">
        <aside>
          <span />
          <span />
          <span />
          <span />
        </aside>
        <section>
          <header>
            <span />
            <i />
          </header>
          <main>
            <span />
            <span />
            <span />
          </main>
          <footer>
            <span />
          </footer>
        </section>
      </div>
    );
  }

  return (
    <div
      className={`s2-page s2-workspace ${inspection ? "has-inspector" : ""}`}
    >
      <WorkHistory
        items={workItems}
        collapsed={historyCollapsed}
        currentId="position-vla"
        onToggle={() => setHistoryCollapsed((value) => !value)}
        onCreate={() => navigate("/new")}
        onSelect={(item) => navigate(`/tasks/${item.id}`)}
      />
      <section className="s2-workstream-main">
        <WorkstreamHeader
          status={
            contactStage === "waiting"
              ? "等待外部"
              : phase < 4
                ? "推进中"
                : "等待用户"
          }
          statusTone={
            contactStage === "waiting"
              ? "neutral"
              : phase < 4
                ? "info"
                : "warning"
          }
          paused={paused}
          terminated={terminated}
          onPause={() => {
            if (paused) {
              setPlanAdjusted(false);
              setLatestPlanRequirement("");
            }
            setPaused(!paused);
            setStreamStopped(false);
          }}
          onReset={resetDemo}
          onTerminate={() => setTerminateOpen(true)}
          onDelete={() => setDeleteOpen(true)}
        />
        <div className="s2-conversation" ref={scrollRef}>
          <div className="s2-timeline">
            <UserMessage>{prompt}</UserMessage>
            {phase >= 1 ? (
              <HunterReply
                streaming={phase === 1 && !streamStopped}
                markdown={`我会复用已确认的岗位资料，先检查硬要求与可放宽条件，再并行处理系统候选人、公开资料和需要在本机继续的渠道。${
                  phase >= 2
                    ? `

本轮按以下边界处理：

- 最多交付 20 位经过补全、查重和角色门禁的候选人。
- 北京优先；异地候选人保留地点意愿风险。
- 只形成审核结果，不执行对外联系。`
                    : ""
                }`}
              />
            ) : null}
            {streamError ? (
              <div className="s2-local-error" role="alert">
                <Icon name="warning" />
                <span>
                  <b>回复生成中断</b>
                  <small>
                    已经生成的内容和输入已保留，可以从当前检查点继续。
                  </small>
                </span>
                <Button
                  tone="secondary"
                  size="sm"
                  icon="refresh"
                  onClick={() => setStreamError(false)}
                >
                  继续生成
                </Button>
              </div>
            ) : null}
            {streamStopped ? (
              <div className="s2-system-state">
                <Icon name="pause" />
                <span>
                  <b>已停止本次生成</b>
                  <small>
                    已经生成的内容不会丢失，可以继续生成或补充新的要求。
                  </small>
                </span>
                <Button
                  tone="secondary"
                  size="sm"
                  onClick={() => setStreamStopped(false)}
                >
                  继续生成
                </Button>
              </div>
            ) : null}
            {forcedState === "limited" ? (
              <div className="s2-permission-state s2-permission-state--handoff">
                <Icon name="warning" />
                <span>
                  <b>本机协作暂不可用</b>
                  <small>
                    云端检索和已有结果继续保留。可以稍后在本机继续，或下载处理包。
                  </small>
                </span>
                <Button
                  tone="secondary"
                  size="sm"
                  onClick={() => setHandoffOpen(true)}
                >
                  查看处理方式
                </Button>
              </div>
            ) : null}
            {localError ? (
              <div className="s2-local-error" role="alert">
                <Icon name="warning" />
                <span>
                  <b>论文与专利人物线索处理失败</b>
                  <small>
                    系统候选人、公开资料和本机返回结果已经保留。可以只重试失败来源，不重新执行整轮任务。
                  </small>
                </span>
                <Button
                  tone="secondary"
                  size="sm"
                  icon="refresh"
                  onClick={() => setLocalError(false)}
                >
                  重试失败来源
                </Button>
              </div>
            ) : null}
            {phase >= 2 ? (
              <HunterReply
                markdown={`## 云端检索已开始

Hunter 正在检查系统候选人、论文、专利和公开网络资料。需要在本机处理的渠道不会在云端运行，也不会阻塞云端结果。`}
              >
                <div className="s2-markdown-action-row">
                  <Button
                    tone={handoffComplete ? "secondary" : "primary"}
                    icon={handoffComplete ? "check" : "download"}
                    onClick={() => setHandoffOpen(true)}
                  >
                    {handoffComplete ? "本机处理已准备" : "在本机继续"}
                  </Button>
                  <small>
                    {handoffComplete
                      ? "本机结果返回后会自动进入身份检查、去重、合并和匹配。"
                      : "可以选择已连接设备，也可以下载任务后在本机处理。"}
                  </small>
                </div>
              </HunterReply>
            ) : null}
            {forcedState === "local-waiting" ? (
              <div className="s2-system-state">
                <Icon name="clock" />
                <span>
                  <b>等待本机结果</b>
                  <small>
                    云端已经形成 9
                    位候选人，尚未收到本机结果。本机处理可能仍在进行，也可能尚未启动；新结果返回后会随时合并，不需要等待全部来源结束。
                  </small>
                </span>
              </div>
            ) : null}
            {forcedState === "stale-task" ? (
              <div className="s2-permission-state">
                <Icon name="warning" />
                <span>
                  <b>岗位信息已更新，本机处理使用的是上一版本</b>
                  <small>
                    已返回候选人仍会接收，但会按照最新岗位重新匹配；后续本机处理将使用新版本。
                  </small>
                </span>
              </div>
            ) : null}
            {phase >= 3 ? (
              <HunterReply
                markdown={`## 候选人结果正在持续合并

云端和本机结果不需要同时完成。每批结果到达后，Hunter 都会立即执行身份检查、去重、资料合并和最新岗位匹配，再把新增或变化的人选交给你审核。

| 来源 | 本批结果 | 合并后变化 |
| --- | --- | --- |
| 系统候选人 | 8 位 | 新增 5 位，更新 2 位，合并重复 1 位 |
| 论文、专利与公开网络 | 14 位人物线索 | 转为候选人 4 位，保留线索 10 位 |
| 本机结果 | 12 位 | 新增 9 位，更新 2 位，合并重复 1 位 |

> 原始简历附件不会随候选人批次自动上传。来源资料仅保留来源平台和本地批次，不在云端保存认证页面链接。`}
              >
                <button
                  type="button"
                  className="s2-markdown-link"
                  onClick={() =>
                    setInspection({
                      title: "候选人来源与合并记录",
                      rows: evidenceRows,
                      kind: "evidence",
                    })
                  }
                >
                  查看完整来源证据 <Icon name="chevronRight" />
                </button>
                {phase === 3 ? (
                  <p className="s2-progress-line">
                    <span />
                    正在处理新到达批次，并更新候选人审核结果…
                  </p>
                ) : null}
              </HunterReply>
            ) : null}
            {phase >= 4 && forcedState !== "no-candidate" ? (
              <HunterReply
                markdown={`## 首批候选人已经可以审核

共召回 34 位人物，合并重复身份后保留 21 位，其中 3 位因明确不满足角色硬门槛被跳过，18 位进入本轮审核。

| 审核分组 | 人数 |
| --- | --- |
| 建议优先联系 | 5 |
| 储备与观察 | 8 |
| 谨慎或不建议 | 5 |

> 已完成身份检查、重复合并、角色门禁和匹配评分。被硬门槛跳过的 3 位候选人不进入本轮审核。`}
              >
                <CandidateReviewEntry onOpen={() => setReviewOpen(true)} />
              </HunterReply>
            ) : null}
            {forcedState === "merge-conflict" ? (
              <HunterReply>
                <IdentityConflictReview
                  title="合并前资料对比"
                  description="以下两份资料可能属于同一位候选人，但有两项内容不能自动确认。"
                  records={[
                    {
                      label: "系统候选人记录",
                      name: "林昊",
                      organization: "拓界机器人",
                      role: "机器人学习负责人",
                      source: "候选人库",
                      updatedAt: "2026-08-14 更新",
                    },
                    {
                      label: "本机返回资料",
                      name: "林昊",
                      organization: "拓界机器人 · 具身智能中心",
                      role: "VLA 算法负责人",
                      source: "猎聘简历",
                      updatedAt: "2026-08-21 获取",
                    },
                  ]}
                  differences={[
                    {
                      field: "手机号后四位",
                      current: "2816",
                      incoming: "2816",
                      assessment: "一致",
                      tone: "same",
                    },
                    {
                      field: "当前公司与部门",
                      current: "拓界机器人",
                      incoming: "拓界机器人 · 具身智能中心",
                      assessment: "可能是部门补充",
                      tone: "supplement",
                    },
                    {
                      field: "当前职位",
                      current: "机器人学习负责人",
                      incoming: "VLA 算法负责人",
                      assessment: "可能是职务更新",
                      tone: "supplement",
                    },
                    {
                      field: "最近项目时间",
                      current: "2024.03–2025.12",
                      incoming: "2024.05–2025.12",
                      assessment: "开始时间相差 2 个月",
                      tone: "conflict",
                    },
                    {
                      field: "教育经历",
                      current: "清华大学 · 自动化 · 硕士",
                      incoming: "清华大学 · 自动化 · 硕士",
                      assessment: "一致",
                      tone: "same",
                    },
                  ]}
                  note="如果确认合并，Hunter 会保留两个原始来源；一致字段直接复用，补充字段按较新资料更新，项目时间冲突保留在变化记录中。"
                />
                <DecisionRequest
                  title="林昊的资料存在冲突，确认后才能合并"
                  description="请根据上方资料来源和字段差异，确认这两份记录是否属于同一人。"
                  options={[
                    {
                      value: "merge",
                      label: "确认为同一人并合并",
                      description: "保留两个来源和冲突字段，按较新资料更新。",
                    },
                    {
                      value: "separate",
                      label: "保留为两个人",
                      description: "不合并档案，并记录本次判断避免重复询问。",
                    },
                  ]}
                  onSelect={(option) =>
                    notify(
                      option.value === "merge"
                        ? "已合并林昊的资料，并保留来源与变化记录"
                        : "已保留为两个人，并记录本次身份判断",
                      "success",
                    )
                  }
                />
              </HunterReply>
            ) : null}
            {phase >= 4 && forcedState === "no-candidate" ? (
              <HunterReply
                markdown={`## 本轮没有候选人通过岗位门禁

四个渠道共召回 16 位人物，合并重复身份后保留 11 位；其中 7 位角色层级不匹配，4 位缺少真机产品落地经历，因此没有进入候选人审核。

| 未进入审核原因 | 人数 |
| --- | --- |
| 角色层级明显不匹配 | 7 |
| 缺少真机产品落地经历 | 4 |

> 可以补充新的渠道或调整岗位边界后重做受影响步骤；Hunter 不会为了凑数量放宽已经确认的硬门槛。`}
              />
            ) : null}
            {userDecisions.map((decision, index) => (
              <div
                className="s2-decision-thread"
                key={`${decision.text}-${index}`}
              >
                <UserMessage time="刚刚">{decision.text}</UserMessage>
                <HunterReply markdown={decision.result} />
              </div>
            ))}
            {phase >= 5 ? (
              <HunterReply
                markdown={`## 已从当前检查点继续

审核结果和岗位储备关系已经保存，执行计划已更新。下一步可以直接告诉我需要给哪些候选人发邮件；发送前仍会逐项确认收件人、主题、正文和附件。`}
              />
            ) : null}
            {contactStage === "authorization" ? (
              <HunterReply>
                <EmailDraftReview
                  sender="沈岚 <shenlan@hunter-mail.cn>"
                  initialRecipients="linhao@tuojie-robotics.com, mingyuan.zhou@qiongding.ai, chuning.chen@lingyue-robotics.com"
                  initialSubject="北京具身智能 VLA 算法负责人机会"
                  initialBody={`你好，\n\n我正在协助星澜机器人寻找具身智能 VLA 算法负责人。岗位重点关注机器人学习、多模态策略、真机产品落地和团队管理经验。\n\n你的经历与岗位方向有较高匹配度。如果你愿意了解，我可以先介绍团队范围、汇报关系和岗位目标，再由你判断是否继续。\n\n沈岚`}
                  onCancel={() => {
                    setContactStage("idle");
                    notify("邮件草稿已保留，本次没有发送", "info");
                  }}
                  onSend={() => {
                    setContactStage("waiting");
                    notify("邮件已发送，后续回复会回到当前任务", "success");
                  }}
                />
              </HunterReply>
            ) : null}
            {contactStage === "waiting" ? (
              <section className="s3-external-wait">
                <div className="s3-wait-icon">
                  <Icon name="clock" />
                </div>
                <span>
                  <small>等待外部</small>
                  <b>等待 3 位候选人回复邮件</b>
                  <p>
                    邮件已发送，岗位储备关系没有变化。收到邮件回复后会回到当前任务；猎头在系统外获得的新信息也可以作为普通跟进记录补充。
                  </p>
                  <em>
                    最近检查：刚刚 · 下次检查：6 小时后 · 3 个工作日后建议跟进 ·
                    7 天后标记长期未回复
                  </em>
                </span>
                <Button
                  tone="secondary"
                  size="sm"
                  onClick={() =>
                    notify("可以在下方输入回复内容或上传新简历", "info")
                  }
                >
                  补充跟进结果
                </Button>
              </section>
            ) : null}
            {contactStage === "reply" ? (
              <HunterReply
                markdown={`## 林昊的新简历已合并并完成局部重匹配

新简历补充了最近 8 个月的团队扩张和真机数据闭环项目，没有创建重复候选人档案。原始简历版本继续保留。

| 变化 | 影响 |
| --- | --- |
| 团队规模从 8 人更新为 15 人 | 团队管理分项提高 |
| 新增量产双臂机器人项目 | 产品落地风险降低 |
| 明确只考虑北京或远程 | 地点风险已更新 |

> 正式推荐、面试安排、薪资承诺、Offer 和推进阶段仍由猎头手动处理。`}
              />
            ) : null}
            {terminated ? (
              <div className="s2-system-state is-danger">
                <Icon name="warning" />
                <span>
                  <b>任务已终止</b>
                  <small>
                    对话、任务、审核结果和正式资产引用已保留。需要新目标时请新建任务。
                  </small>
                </span>
              </div>
            ) : null}
          </div>
        </div>
        <div className="s2-composer-wrap">
          {phase >= 1 ? (
            <RuntimeBar
              open={runtimeOpen}
              onToggle={() => setRuntimeOpen((value) => !value)}
              plan={plan}
              planUpdate={planUpdate}
              tasks={internalTasks}
              paused={paused}
              docked
              onInspectTask={(task) => setInspection({ ...task, kind: "task" })}
            />
          ) : null}
          <Composer
            value={composer}
            onChange={setComposer}
            onSend={send}
            authMode={authMode}
            onAuthChange={(mode) => {
              setAuthMode(mode);
              notify(
                `授权模式已切换为“${mode === "analysis" ? "仅分析" : mode === "auto" ? "自动执行" : "执行前确认"}”，只影响尚未执行的动作`,
                "info",
              );
            }}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            streaming={phase === 1 && !streamStopped}
            onStop={() => setStreamStopped(true)}
            disabled={terminated}
          />
        </div>
      </section>
      <InspectionPanel item={inspection} onClose={() => setInspection(null)} />
      <Modal
        open={handoffOpen}
        close={() => setHandoffOpen(false)}
        title="在本机继续"
        description="选择已连接设备继续本机处理；云端处理会继续运行。"
        size="lg"
      >
        <div className="s2-handoff-options">
          <section
            className={forcedState === "limited" ? "is-unavailable" : ""}
          >
            <i>
              <Icon name="database" />
            </i>
            <span>
              <b>Eric 的 MacBook Pro</b>
              <small>
                {forcedState === "limited"
                  ? "设备当前不可用 · 上次连接于 18 分钟前"
                  : "设备在线 · 任务仅在这台电脑中处理"}
              </small>
            </span>
            <Button
              tone="primary"
              size="sm"
              disabled={forcedState === "limited"}
              onClick={() => {
                setHandoffComplete(true);
                setPhase((current) => Math.max(current, 3));
                setHandoffOpen(false);
                notify("本机处理已准备，云端将继续接收返回结果", "success");
              }}
            >
              在此设备继续
            </Button>
          </section>
          <section>
            <i>
              <Icon name="download" />
            </i>
            <span>
              <b>下载处理包</b>
              <small>
                适用于当前设备不可用时；处理完成后可将结果导回 Hunter。
              </small>
            </span>
            <Button
              tone="secondary"
              size="sm"
              onClick={() => {
                setHandoffComplete(true);
                setPhase((current) => Math.max(current, 3));
                setHandoffOpen(false);
                notify("处理包已下载，云端处理继续运行", "success");
              }}
            >
              下载任务
            </Button>
          </section>
          <p>
            处理包包含岗位信息和已确认的筛选范围，不包含云端账号凭据。云端不会登录或控制需要认证的人才网站。
          </p>
        </div>
      </Modal>
      <Modal
        open={terminateOpen}
        close={() => setTerminateOpen(false)}
        title="终止任务"
        description="终止表示这项业务不再继续，不会删除历史和已确认成果。"
        footer={
          <>
            <Button tone="secondary" onClick={() => setTerminateOpen(false)}>
              取消
            </Button>
            <Button
              tone="danger"
              onClick={() => {
                setTerminated(true);
                setPaused(false);
                setTerminateOpen(false);
              }}
            >
              终止任务
            </Button>
          </>
        }
      >
        <div className="s2-confirm-copy">
          <p>
            将停止 1 个等待审核的内部处理；18
            位候选人审核结果、已写入的正式资产和来源证据继续保留。
          </p>
          <p>本轮没有已经发生且无法撤销的外部动作。</p>
        </div>
      </Modal>
      <Modal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        title="删除任务"
        description="删除只适用于误建或不希望保留的内容。"
        footer={
          <>
            <Button tone="secondary" onClick={() => setDeleteOpen(false)}>
              取消
            </Button>
            <Button
              tone="danger"
              onClick={() => {
                setDeleteOpen(false);
                navigate("/home");
                notify("任务已移入回收站，30 天内可以恢复", "success");
              }}
            >
              删除并移入回收站
            </Button>
          </>
        }
      >
        <div className="s2-confirm-copy">
          <p>
            当前内部处理将安全停止；尚未写入正式资产的对话、计划和专属文件随任务进入回收站。
          </p>
          <p>已确认写入的候选人、岗位和其他正式业务资产不会删除。</p>
        </div>
      </Modal>
    </div>
  );
}
