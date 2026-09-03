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
  if (/每(天|周|月|季度)|每\s*\d+\s*(天|周|月)|定期|周期|工作日/.test(prompt))
    return "periodic";
  if (/核验|消歧|是不是同一个人|是否为同一人/.test(prompt)) return "task";
  if (/整理|归纳|改写|总结/.test(prompt)) return "direct";
  if (/帮我看看|了解一下|查一下/.test(prompt) && prompt.length < 20)
    return "clarify";
  return "mainline";
}

function OutcomeReply({ outcome, prompt }) {
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

- **任务目标：** 每周核验具身智能创业公司、融资和核心团队招聘变化。
- **执行周期：** 每周一 09:00。
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
  const periodicMode = params.get("mode") === "periodic";
  const editingPeriodic = params.get("edit");
  const signalPrompt = sessionStorage.getItem("hunter-new-work-signal") || "";
  const initialStatus = forcedPrompts[forcedState] ? forcedState : "idle";
  const [value, setValue] = useState(
    signalPrompt ||
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

  useEffect(() => {
    if (signalPrompt) sessionStorage.removeItem("hunter-new-work-signal");
  }, [signalPrompt]);

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
          periodicMode || editingPeriodic
            ? "periodic"
            : classifyWork(submittedPrompt),
        ),
      850,
    );
    return () => window.clearTimeout(timer);
  }, [editingPeriodic, forcedState, periodicMode, status, submittedPrompt]);

  useEffect(() => {
    if (forcedState || !["mainline", "task", "direct"].includes(status))
      return undefined;
    const timer = window.setTimeout(() => {
      if (status === "mainline") {
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

  const begin = (text, files = []) => {
    const fileNames = files.map((file) => file.name).join("、");
    const prompt = text.trim() || `请处理附件：${fileNames}`;
    if (!prompt) return;
    if (forcedState) setParams({}, { replace: true });
    setSubmittedPrompt(prompt);
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
                {editingPeriodic
                  ? "调整周期性任务"
                  : periodicMode
                    ? "新建周期性任务"
                    : "新建任务"}
              </h1>
              <p>
                描述你希望 Hunter
                完成的猎头工作，也可以要求它按指定周期自动执行。
              </p>
            </header>

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
                <OutcomeReply outcome={status} prompt={submittedPrompt} />
                {status === "periodic" ? (
                  <HunterReply>
                    <DecisionRequest
                      title="确认周期性任务"
                      description="确认后开始按计划运行；每轮结果和需要处理的问题都保留在运行记录中。"
                      options={[
                        {
                          value: "create",
                          label: editingPeriodic ? "保存调整" : "按此计划创建",
                          description: "使用当前周期、结果去向和连续记忆规则。",
                        },
                        {
                          value: "custom",
                          label: "补充或修改要求",
                          description:
                            "继续用自然语言修改周期、范围、授权或结果去向。",
                        },
                      ]}
                      onSelect={(option) => {
                        if (option.value === "custom") {
                          setValue("请调整为：");
                          return;
                        }
                        navigate(
                          "/tasks/periodic?selected=periodic-startups&created=1",
                        );
                      }}
                    />
                  </HunterReply>
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
                isLimited || ["mainline", "task", "direct"].includes(status)
              }
            />

            {!hasConversation && !isLimited ? (
              <div className="s2-starter-prompts">
                <small>可以从这些真实目标开始</small>
                <div>
                  {(periodicMode
                    ? [starterPrompts[4], starterPrompts[0], starterPrompts[2]]
                    : starterPrompts
                  ).map((suggestion) => (
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
