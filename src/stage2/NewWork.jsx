import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import {
  Composer,
  DecisionRequest,
  HunterReply,
  UserMessage,
  WorkHistory,
} from "./automation-ui";
import { workItems } from "./data";
import { TaskAreaNav } from "./TaskAreaNav";
import { StateBanner } from "../stage4/asset-ui";
import { createOpportunityTask } from "../stage4/opportunity-task-adapter";
import { singleAssetDecision } from "../stage4/single-asset-confirmation";
import { markdownText } from "../stage4/opportunity-task-markdown";
import { periodicDraftKey, periodicGoal, periodicSchedule, readPeriodicDrafts } from "./periodic-draft";
import { organizationScope } from "../stage3/organization-mapping-data";

const organizationTargets = (prompt) => organizationScope.filter((company) => prompt.includes(company.name.slice(0, 2)));

const starterPrompts = [
  "为星澜机器人的 VLA 算法负责人岗位持续寻找合适候选人",
  "核验知识图谱中的两位周明远是不是同一个人",
  "把这三条面试反馈整理为候选人跟进摘要",
  "帮我看看云脉芯能",
  "每周一检查具身智能创业公司和招聘变化，有重要发现时提醒我",
];

const forcedPrompts = {
  classifying: starterPrompts[0],
  mainline: starterPrompts[0],
  task: starterPrompts[1],
  direct: starterPrompts[2],
  clarify: starterPrompts[3],
  periodic: starterPrompts[4],
};

function classifyWork(prompt) {
  if (/每(天|周|月|季度)|每\s*(?:\d+|两|二)\s*(天|周|月)|定期|周期|工作日/.test(prompt))
    return "periodic";
  if (/组织架构|人才地图|组织梳理/.test(prompt)) return "organization";
  if (/核验|消歧|是不是同一个人|是否为同一人/.test(prompt)) return "task";
  if (/整理|归纳|改写|总结/.test(prompt)) return "direct";
  if (/帮我看看|了解一下|查一下/.test(prompt) && prompt.length < 20)
    return "clarify";
  return "mainline";
}

function OutcomeReply({ outcome, prompt, periodicPlan }) {
  if (outcome === "organization") return <HunterReply markdown={organizationTargets(prompt).length
    ? "本轮整理“" + organizationTargets(prompt).map((company) => company.name).join("、") + "”的组织、团队、关键岗位与任职人，交付人才地图。未知项保留待核实，不针对招聘岗位找人。\n\n正在创建公司组织梳理任务。"
    : "请补充明确的目标公司名称。\n\n【原型说明，正式实现不展示】当前可交互样例包含星澜机器人、拓界机器人、穹顶智能和灵跃科技，可指定一家或多家公司。"} />;
  if (outcome === "mainline") {
    return (
      <HunterReply
        markdown={`我会先制定执行计划，再持续汇总系统候选人、知识图谱、公开资料和用户主动上传的简历；遇到审核、邮件联系和等待回复时，会保留上下文并在条件满足后继续推进。新资料上传后会先经过身份判断、查重和匹配，再进入审核。

> 正在创建任务，并保留当前输入、附件和授权方式。`}
      />
    );
  }
  if (outcome === "task") {
    return (
      <HunterReply
        markdown={`我会直接核验这两条人物记录并交付结论；核验完成后，结果会回到对应的知识图谱，不会自动合并人物。

> 正在创建任务，并保留当前输入、附件和授权方式。`}
      />
    );
  }
  if (outcome === "direct") {
    const isCompanySummary = /云脉芯能|公司/.test(prompt);
    const details = isCompanySummary
      ? [
          "公司聚焦边缘侧机器人芯片，近期公开信息出现团队扩张信号。",
          "目前证据只能支持一次性判断，尚不足以确认正式招聘需求。",
          "如需持续寻找负责人和招聘机会，可以继续新建客户开发任务。",
        ]
      : [
          "技术能力满足岗位要求，系统设计和跨团队协作评价较好。",
          "候选人希望进一步确认汇报对象、团队规模和年度奖金结构。",
          "建议两天内补充岗位信息，再确认下一轮面试时间。",
        ];
    return (
      <HunterReply
        markdown={`## ${isCompanySummary ? "云脉芯能公开信息摘要" : "候选人跟进摘要"}

${details.map((item) => `- ${item}`).join("\n")}

可以继续补充信息，或直接提出下一项任务。`}
      />
    );
  }
  if (outcome === "periodic") {
    return (
      <HunterReply
        markdown={`## 周期性任务草案

- **任务目标：** ${markdownText(periodicPlan?.prompt || prompt)}
- **执行周期：** ${markdownText(periodicPlan?.schedule || "每周一 09:00")}。
- **结果去向：** 高价值变化进入洞察中心；公司、联系人和招聘机会草稿按当前授权等待确认。
- **连续记忆：** 每轮读取上次成功水位、用户修正规则和最新正式资产，不重复处理没有变化的资料。
- **异常处理：** 非阻塞来源失败会记录后继续；只有写入冲突或需要外部发送时才等待确认。

后续每次运行使用独立会话，但会继承以上已确认结论。`}
      />
    );
  }
  return null;
}

export function NewWork() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const forcedState = params.get("state");
  const editingPeriodic = params.get("edit");
  const signalPrompt = sessionStorage.getItem("hunter-new-work-signal") || "";
  const initialStatus = forcedPrompts[forcedState] ? forcedState : "idle";
  const [value, setValue] = useState(
    signalPrompt ||
      params.get("prompt") ||
      (editingPeriodic
        ? "把这个任务改为每周三 10:00 运行，并继续保留原有去重规则。"
        : ""),
  );
  const [authMode, setAuthMode] = useState("confirm");
  const [attachments, setAttachments] = useState([]);
  const [submittedPrompt, setSubmittedPrompt] = useState(
    forcedPrompts[forcedState] || "",
  );
  const [status, setStatus] = useState(initialStatus);
  const [historyCollapsed, setHistoryCollapsed] = useState(false);
  const [lifecycleBusy, setLifecycleBusy] = useState(false);
  const [lifecycleError, setLifecycleError] = useState("");
  const [periodicPlan, setPeriodicPlan] = useState(() => ({ prompt: periodicGoal(params.get("originalPrompt") || forcedPrompts[forcedState] || ""), schedule: params.get("schedule") || "每周一 09:00" }));
  const [periodicReplies, setPeriodicReplies] = useState([]);
  const [periodicDeclined, setPeriodicDeclined] = useState(false);

  useEffect(() => {
    if (signalPrompt) sessionStorage.removeItem("hunter-new-work-signal");
  }, [signalPrompt]);

  useEffect(() => {
    if (params.get("mode") !== "periodic") return;
    const next = new URLSearchParams(params);
    next.delete("mode");
    setParams(next, { replace: true });
  }, [params, setParams]);

  useEffect(() => {
    if (!forcedPrompts[forcedState]) return;
    setSubmittedPrompt(forcedPrompts[forcedState]);
    setStatus(forcedState);
  }, [forcedState]);

  useEffect(() => {
    if (forcedState !== "direct") return;
    sessionStorage.setItem("hunter-new-task-prompt", forcedPrompts.direct);
    navigate("/tasks/task-interview-summary", { replace: true });
  }, [forcedState, navigate]);

  useEffect(() => {
    if (status !== "classifying" || forcedState === "classifying")
      return undefined;
    const timer = window.setTimeout(
      () =>
        setStatus(
          editingPeriodic
            ? "periodic"
            : classifyWork(submittedPrompt),
        ),
      850,
    );
    return () => window.clearTimeout(timer);
  }, [editingPeriodic, forcedState, status, submittedPrompt]);

  useEffect(() => {
    if (forcedState || !["mainline", "task", "direct", "organization"].includes(status) || status === "organization" && !organizationTargets(submittedPrompt).length)
      return undefined;
    const timer = window.setTimeout(() => {
      if (status === "organization") {
        const scope = organizationTargets(submittedPrompt).map((company) => company.id).join(",");
        sessionStorage.setItem("hunter-organization-prompt-" + scope, submittedPrompt);
        sessionStorage.setItem("hunter-organization-auth-" + scope, authMode);
        navigate("/tasks/mapping-embodied?companies=" + scope);
      } else if (status === "mainline") {
        sessionStorage.setItem("hunter-new-workstream-prompt", submittedPrompt);
        navigate("/tasks/position-vla");
      } else if (status === "task") {
        sessionStorage.setItem("hunter-new-task-prompt", submittedPrompt);
        navigate("/tasks/task-hand-team");
      } else {
        sessionStorage.setItem("hunter-new-task-prompt", submittedPrompt);
        navigate("/tasks/task-interview-summary");
      }
    }, 1_250);
    return () => window.clearTimeout(timer);
  }, [forcedState, navigate, status, submittedPrompt]);

  const begin = async (text, files = []) => {
    const fileNames = files.map((file) => file.name).join("、");
    const prompt = status === "organization" && !organizationTargets(submittedPrompt).length
      ? submittedPrompt + "\n目标公司：" + text.trim() : text.trim() || `请处理附件：${fileNames}`;
    if (!prompt) return;
    if (status === "periodic") {
      const decision = singleAssetDecision(text);
      const schedule = periodicSchedule(text);
      const goal = text.match(/^(?:任务目标|目标)[：:]\s*(.+)$/m)?.[1];
      let result = "";
      if (files.length) result = "尚未执行。周期计划的附件解析尚未接入，请在文字中明确任务目标或执行周期。";
      else if (decision === "decline") { setPeriodicDeclined(true); result = "暂不执行，周期计划草稿已保留。"; }
      else if (decision === "confirm") {
        if (authMode === "analysis") result = "当前任务仅分析，尚未创建或修改周期计划。";
        else {
          const id = editingPeriodic || "periodic-" + crypto.randomUUID();
          const item = { id, prompt: periodicPlan.prompt || submittedPrompt, schedule: periodicPlan.schedule };
          try {
            sessionStorage.setItem(periodicDraftKey, JSON.stringify([...readPeriodicDrafts().filter((entry) => entry.id !== id), item]));
            navigate("/tasks/periodic?selected=" + encodeURIComponent(id) + (editingPeriodic ? "&updated=1" : "&created=1"));
            return;
          } catch { result = "保存失败，计划草稿仍保留，尚未创建或修改。请重试。"; }
        }
      } else if (schedule || goal) {
        setPeriodicPlan((plan) => ({ prompt: periodicGoal(goal || plan.prompt || submittedPrompt), schedule: schedule || plan.schedule }));
        setPeriodicDeclined(false);
        result = "已更新下方周期计划草稿，尚未执行。是否按更新后的计划创建或保存？";
      } else result = "尚未修改。当前原型无法可靠解析这条建议，请明确任务目标或执行周期，例如“执行周期：每周三 10:00”，再核对摘要。";
      setPeriodicReplies((items) => [...items, { text, result }]);
      setValue(""); setAttachments([]);
      return;
    }
    const kind = params.get("kind") || (params.get("positionId") ? "recruiting" :
      /招聘机会|招聘需求|客户开发|团队扩建|团队扩张/.test(prompt) ? "opportunity" :
      /创建岗位|解析.*JD|整理.*岗位资料/.test(prompt) ? "position-create" : "");
    const periodicRequest = Boolean(editingPeriodic) || classifyWork(prompt) === "periodic";
    if (["opportunity", "position-create", "recruiting"].includes(kind) && !periodicRequest && !(classifyWork(prompt) === "organization" && !params.get("positionId"))) {
      if (lifecycleBusy) return;
      setLifecycleBusy(true); setLifecycleError("");
      try {
        const result = await createOpportunityTask({ kind, prompt, files, authMode,
          opportunityId: params.get("opportunityId") || "", positionId: params.get("positionId") || "",
          source: params.get("signalId") ? { kind: "signal", id: params.get("signalId"), material: prompt } : undefined });
        navigate("/tasks/" + result.taskId);
      } catch (error) { setLifecycleError(error.message); }
      finally { setLifecycleBusy(false); }
      return;
    }
    if (forcedState) setParams({}, { replace: true });
    setSubmittedPrompt(prompt);
    setPeriodicPlan((plan) => ({ prompt: periodicGoal(editingPeriodic ? plan.prompt || prompt : prompt), schedule: periodicSchedule(prompt, "09:00") || plan.schedule }));
    setPeriodicReplies([]); setPeriodicDeclined(false);
    setValue("");
    setAttachments([]);
    setStatus("classifying");
  };

  const chooseOutcome = (outcome) => {
    if (forcedState) setParams({}, { replace: true });
    setStatus(outcome);
  };

  const reset = () => {
    if (forcedState) setParams({}, { replace: true });
    setSubmittedPrompt("");
    setStatus("idle");
  };

  const isLimited = forcedState === "limited";
  const hasConversation = status !== "idle" && !isLimited;

  return (
    <div className="s2-page s2-workspace s2-task-create-workspace">
      <WorkHistory
        items={workItems}
        collapsed={historyCollapsed}
        currentId=""
        onToggle={() => setHistoryCollapsed((current) => !current)}
        onCreate={() => {
          setValue("");
          setSubmittedPrompt("");
          setStatus("idle");
          navigate("/tasks");
        }}
        onSelect={(item) => navigate(`/tasks/${item.id}`)}
      />
      <section className="s2-task-create-main">
        <TaskAreaNav value="tasks" />
        <div className="s2-new-work">
          <section
            className={`s2-new-work-inner ${hasConversation ? "has-conversation" : ""}`}
          >
            <header>
              <span>
                <Icon name="sparkles" />
              </span>
              <h1>
                {editingPeriodic ? "调整周期性任务" : "新建任务"}
              </h1>
              <p>
                描述你希望 Hunter
                完成的猎头工作，也可以要求它按指定周期自动执行。
              </p>
            </header>

            {lifecycleError ? <StateBanner tone="danger" title={lifecycleError} /> : null}
            {lifecycleBusy ? <StateBanner icon="refresh" title="正在保存输入和附件" /> : null}
            {isLimited ? (
              <div className="s2-new-work-limited" role="alert">
                <Icon name="warning" />
                <span>
                  <b>当前工作空间不能创建新任务</b>
                  <small>
                    你仍可查看已有任务；请联系工作空间管理员处理权限。
                  </small>
                </span>
              </div>
            ) : null}

            {hasConversation ? (
              <div className="s2-new-work-conversation" aria-live="polite">
                <UserMessage time="刚刚">{submittedPrompt}</UserMessage>
                {status === "classifying" ? (
                  <HunterReply
                    streaming
                    markdown="我正在判断这项任务的范围、持续时间，以及是否需要等待外部反馈或组织多步处理。"
                  />
                ) : null}
                {periodicReplies.map((reply, index) => <div key={index}><UserMessage>{reply.text}</UserMessage><HunterReply markdown={reply.result} /></div>)}
                <OutcomeReply outcome={status} prompt={submittedPrompt} periodicPlan={periodicPlan} />
                {status === "periodic" ? (
                  <HunterReply markdown={(periodicDeclined ? "计划暂未执行。\n\n" : "") + "### 是否" + (editingPeriodic ? "保存这次周期计划调整" : "按此计划创建周期性任务") + "？\n\n请回复“是”“否”，或提出修改建议。"} />
                ) : null}
                {status === "clarify" ? (
                  <HunterReply>
                    <DecisionRequest
                      title="需要补充任务目标"
                      description="不同目标会影响信息范围、后续跟踪和结束条件。"
                      options={[
                        {
                          value: "direct",
                          label: "只整理当前公开信息",
                          description:
                            "完成本次公开信息分析后保留结果，仍可继续对话。",
                        },
                        {
                          value: "mainline",
                          label: "持续跟踪招聘需求并寻找联系人",
                          description:
                            "保留任务上下文，后续接收公开变化和邮件回复。",
                        },
                        {
                          value: "custom",
                          label: "我来补充其他目标",
                          description:
                            "在下方输入具体范围、判断标准或希望交付的结果。",
                        },
                      ]}
                      onSelect={(option) => {
                        if (option.value === "custom") {
                          setValue("我的具体目标是：");
                          return;
                        }
                        chooseOutcome(option.value);
                      }}
                    />
                  </HunterReply>
                ) : null}
              </div>
            ) : null}

            <Composer
              value={value}
              onChange={setValue}
              onSend={begin}
              authMode={authMode}
              onAuthChange={setAuthMode}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              placeholder="例如：为星澜机器人的 VLA 算法负责人岗位持续寻找合适候选人"
              streaming={status === "classifying"}
              onStop={reset}
              disabled={
                isLimited || lifecycleBusy || ["mainline", "task", "direct"].includes(status)
              }
            />

            {!hasConversation && !isLimited ? (
              <div className="s2-starter-prompts">
                <small>可以从这些真实目标开始</small>
                <div>
                  {starterPrompts.map((suggestion) => (
                    <button
                      type="button"
                      key={suggestion}
                      onClick={() => setValue(suggestion)}
                    >
                      {suggestion}
                      <Icon name="chevronRight" />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <footer>
              <Icon name="info" />
              示例只会填入输入框。Hunter
              会说明执行计划、等待点和结束条件；如不符合预期，可以直接在对话中纠正。
            </footer>
          </section>
        </div>
      </section>
    </div>
  );
}
