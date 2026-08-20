import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Button, IconButton, Modal, StatusBadge, useToast } from "../stage1/ui";
import {
  Composer,
  createMarkdownTable,
  DecisionRequest,
  HunterReply,
  RuntimeBar,
  UserMessage,
  WorkstreamHistory,
} from "./automation-ui";
import {
  candidates,
  evidenceRows,
  internalTasks,
  planSteps,
  workstreamHistory,
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
            label="更多主线操作"
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
                终止业务主线
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
                删除业务主线
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
    if (forcedState === "review") return 4;
    if (forcedState === "no-candidate") return 4;
    if (forcedState === "waiting" || forcedState === "candidate-reply")
      return 5;
    const restored = Number(sessionStorage.getItem("hunter-workstream-phase"));
    return Number.isFinite(restored) ? restored : 0;
  });
  const [paused, setPaused] = useState(
    () =>
      forcedState === "limited" ||
      (!forcedState &&
        sessionStorage.getItem("hunter-workstream-paused") === "1"),
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
      setPaused(true);
      setStreamError(false);
      setStreamStopped(false);
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
    if (paused || terminated || streamStopped || streamError || phase >= 4)
      return undefined;
    const delays = [700, 1200, 1450, 1750];
    const timer = window.setTimeout(
      () => setPhase((current) => current + 1),
      delays[phase] || 1200,
    );
    return () => window.clearTimeout(timer);
  }, [paused, phase, streamError, streamStopped, terminated]);

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
    sessionStorage.removeItem("hunter-workstream-phase");
    sessionStorage.removeItem("hunter-workstream-draft");
    sessionStorage.removeItem("hunter-workstream-inspection");
    sessionStorage.removeItem("hunter-review-open");
    sessionStorage.removeItem("hunter-workstream-paused");
    sessionStorage.removeItem("hunter-workstream-plan-adjusted");
    sessionStorage.removeItem("hunter-workstream-plan-requirement");
    sessionStorage.removeItem("hunter-workstream-contact-stage");
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
    } else if (/联系|沟通|微信|电话/.test(text)) {
      setUserDecisions((items) => [
        ...items,
        {
          text: `${text}${attachmentText}`,
          result:
            "已整理联系范围。产生外部影响前，需要确认本次联系对象、渠道和消息边界。",
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
          "保留已经完成的工作，只暂停并重做受影响的当前步骤；继续后从此检查点推进。",
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
            "当前步骤、检查点和已有结果均已保留，继续后不会重复已完成工作。",
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
                  detail: "已按确认后的条件启动系统、人才平台和研究来源召回。",
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
      <WorkstreamHistory
        items={workstreamHistory}
        collapsed={historyCollapsed}
        currentId="position-vla"
        onToggle={() => setHistoryCollapsed((value) => !value)}
        onCreate={() => navigate("/new")}
        onSelect={(item) => navigate(`/workstreams/${item.id}`)}
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
                markdown={`我会复用已确认的岗位资料，先检查硬要求与可放宽条件，再并行检索系统候选人、人才平台和研究来源。${
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
              <div className="s2-permission-state">
                <Icon name="warning" />
                <span>
                  <b>猎聘登录已失效，相关内部任务已暂停</b>
                  <small>
                    其他来源和已有结果不受影响。处理平台账号后可以从检查点继续。
                  </small>
                </span>
                <Button
                  tone="secondary"
                  size="sm"
                  onClick={() => notify("已打开人才平台处理入口", "info")}
                >
                  打开平台处理
                </Button>
              </div>
            ) : null}
            {localError ? (
              <div className="s2-local-error" role="alert">
                <Icon name="warning" />
                <span>
                  <b>论文与专利人物线索处理失败</b>
                  <small>
                    系统候选人和人才平台结果已经保留。可以只重试失败来源，不重新执行整轮寻访。
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
            {phase >= 3 ? (
              <HunterReply
                markdown={`## 岗位边界已经确认

我找到了三类能够相互印证的输入。没有把“纯学术经历”直接判断为不合适，而是把产品落地和团队管理作为本轮必须单独检查的风险项。

${createMarkdownTable(
  ["来源", "确认结果", "时效"],
  evidenceRows.map((row) => [row.source, row.finding, row.freshness]),
)}`}
              >
                <button
                  type="button"
                  className="s2-markdown-link"
                  onClick={() =>
                    setInspection({
                      title: "岗位边界与来源证据",
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
                    正在补全候选人资料并执行身份、重复和匹配门禁…
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

审核结果和岗位储备关系已经保存，执行计划已更新。下一步可以直接告诉我需要联系哪些候选人；联系前仍会检查对象、渠道和授权范围。`}
              />
            ) : null}
            {contactStage === "authorization" ? (
              <HunterReply>
                <DecisionRequest
                  title="是否允许联系这 3 位候选人？"
                  description="拟通过猎聘向林昊、周明远和陈楚宁发送已审核的岗位沟通消息；不会正式推荐，不会改变候选人推进阶段。"
                  options={[
                    {
                      value: "allow",
                      label: "仅允许本次联系",
                      description: "发送 3 条消息，随后分别进入等待外部。",
                    },
                    {
                      value: "edit",
                      label: "先修改对象或消息",
                      description: "保留当前范围，在下方输入修改意见。",
                    },
                    {
                      value: "deny",
                      label: "暂不联系",
                      description: "岗位储备关系继续保留，不产生外部动作。",
                    },
                  ]}
                  onSelect={(option) => {
                    if (option.value === "allow") setContactStage("waiting");
                    else
                      notify(
                        option.value === "edit"
                          ? "请在下方输入需要修改的联系人选或消息"
                          : "已保留岗位储备，本次不联系候选人",
                        "info",
                      );
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
                  <b>等待 3 位候选人回复岗位沟通</b>
                  <p>
                    消息已发送，岗位储备关系没有变化。收到回复或简历后会回到本主线；也可以手动补充电话、微信和线下结果。
                  </p>
                  <em>
                    最近检查：刚刚 · 下次检查：2 小时后 · 等待期间不消耗 Agent
                    用量
                  </em>
                </span>
                <Button
                  tone="secondary"
                  size="sm"
                  onClick={() =>
                    notify("可以在下方输入回复内容或上传新简历", "info")
                  }
                >
                  补充线下结果
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
                  <b>业务主线已终止</b>
                  <small>
                    对话、任务、审核结果和正式资产引用已保留。需要新目标时请新建主线。
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
        open={terminateOpen}
        close={() => setTerminateOpen(false)}
        title="终止业务主线"
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
              终止主线
            </Button>
          </>
        }
      >
        <div className="s2-confirm-copy">
          <p>
            将停止 1 个等待审核的内部任务；18
            位候选人审核结果、已写入的正式资产和来源证据继续保留。
          </p>
          <p>本轮没有已经发生且无法撤销的外部动作。</p>
        </div>
      </Modal>
      <Modal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        title="删除业务主线"
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
                notify("业务主线已移入回收站，30 天内可以恢复", "success");
              }}
            >
              删除并移入回收站
            </Button>
          </>
        }
      >
        <div className="s2-confirm-copy">
          <p>
            当前内部任务将安全停止；尚未写入正式资产的对话、计划和专属文件随主线进入回收站。
          </p>
          <p>已确认写入的候选人、岗位和其他正式业务资产不会删除。</p>
        </div>
      </Modal>
    </div>
  );
}
