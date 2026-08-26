import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Button } from "../stage1/ui";
import { Composer, HunterReply, UserMessage } from "./automation-ui";

const starterPrompts = [
  "为星澜机器人的 VLA 算法负责人岗位持续寻找合适候选人",
  "核验人才版图中的两位周明远是不是同一个人",
  "把这三条面试反馈整理为候选人跟进摘要",
  "帮我看看云脉芯能",
];

const forcedPrompts = {
  classifying: starterPrompts[0],
  mainline: starterPrompts[0],
  task: starterPrompts[1],
  direct: starterPrompts[2],
  clarify: starterPrompts[3],
  error: starterPrompts[0],
};

function classifyWork(prompt) {
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
        markdown={`这项工作需要持续汇总系统候选人、公开资料和本机返回结果，并在审核、邮件联系和等待回复后继续推进。我会保留完整工作上下文并持续更新计划：云端工作立即开始，需要本机处理的部分会生成相关任务，由你选择何时继续。

> 正在创建工作，并保留当前输入、附件和授权方式。`}
      />
    );
  }
  if (outcome === "task") {
    return (
      <HunterReply
        markdown={`这是一项范围有限、交付明确的核验工作。我会直接执行并交付结论；核验完成后，结果会回到对应的人才版图，不会自动合并人物。

> 正在创建工作，并保留当前输入、附件和授权方式。`}
      />
    );
  }
  if (outcome === "direct") {
    const isCompanySummary = /云脉芯能|公司/.test(prompt);
    const details = isCompanySummary
      ? [
          "公司聚焦边缘侧机器人芯片，近期公开信息出现团队扩张信号。",
          "目前证据只能支持一次性判断，尚不足以确认正式招聘需求。",
          "如需持续寻找负责人和招聘机会，可以继续新建客户开发工作。",
        ]
      : [
          "技术能力满足岗位要求，系统设计和跨团队协作评价较好。",
          "候选人希望进一步确认汇报对象、团队规模和年度奖金结构。",
          "建议两天内补充岗位信息，再确认下一轮面试时间。",
        ];
    return (
      <HunterReply
        markdown={`这项工作可以在当前对话中直接完成，不需要建立单独的工作记录。

## ${isCompanySummary ? "云脉芯能公开信息摘要" : "候选人跟进摘要"}

${details.map((item) => `- ${item}`).join("\n")}

可以继续补充信息，或直接提出下一项工作。`}
      />
    );
  }
  return null;
}

export function NewWork() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const forcedState = params.get("state");
  const signalPrompt = sessionStorage.getItem("hunter-new-work-signal") || "";
  const initialStatus = forcedPrompts[forcedState] ? forcedState : "idle";
  const [value, setValue] = useState(signalPrompt);
  const [authMode, setAuthMode] = useState("confirm");
  const [attachments, setAttachments] = useState([]);
  const [submittedPrompt, setSubmittedPrompt] = useState(
    forcedPrompts[forcedState] || "",
  );
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    if (signalPrompt) sessionStorage.removeItem("hunter-new-work-signal");
  }, [signalPrompt]);

  useEffect(() => {
    if (!forcedPrompts[forcedState]) return;
    setSubmittedPrompt(forcedPrompts[forcedState]);
    setStatus(forcedState);
  }, [forcedState]);

  useEffect(() => {
    if (status !== "classifying" || forcedState === "classifying")
      return undefined;
    const timer = window.setTimeout(
      () => setStatus(classifyWork(submittedPrompt)),
      850,
    );
    return () => window.clearTimeout(timer);
  }, [forcedState, status, submittedPrompt]);

  useEffect(() => {
    if (forcedState || !["mainline", "task"].includes(status)) return undefined;
    const timer = window.setTimeout(() => {
      if (status === "mainline") {
        sessionStorage.setItem("hunter-new-workstream-prompt", submittedPrompt);
        navigate("/works/position-vla");
      } else {
        sessionStorage.setItem("hunter-new-task-prompt", submittedPrompt);
        navigate("/works/task-hand-team");
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
    <div className="s2-page s2-new-work">
      <section
        className={`s2-new-work-inner ${hasConversation ? "has-conversation" : ""}`}
      >
        <header>
          <span>
            <Icon name="sparkles" />
          </span>
          <h1>新建工作</h1>
          <p>
            直接说明想完成什么。Hunter
            会根据目标复杂度制定计划，直接处理或持续推进；你不需要选择工作类型。
          </p>
        </header>

        {isLimited ? (
          <div className="s2-new-work-limited" role="alert">
            <Icon name="warning" />
            <span>
              <b>当前工作空间不能创建新工作</b>
              <small>你仍可查看已有工作；请联系工作空间管理员处理权限。</small>
            </span>
          </div>
        ) : null}

        {hasConversation ? (
          <div className="s2-new-work-conversation" aria-live="polite">
            <UserMessage time="刚刚">{submittedPrompt}</UserMessage>
            {status === "classifying" ? (
              <HunterReply
                streaming
                markdown="我正在判断这项工作的范围、持续时间，以及是否需要等待外部反馈或拆分任务。"
              />
            ) : null}
            <OutcomeReply outcome={status} prompt={submittedPrompt} />
            {status === "clarify" ? (
              <HunterReply
                markdown={`这个目标还缺少一个会改变推进方式的信息：你希望只整理当前公开信息，还是持续跟踪这家公司的招聘需求并寻找联系人？

也可以直接在输入框中说明其他目标。`}
              >
                <div className="s2-new-work-choices">
                  <button type="button" onClick={() => chooseOutcome("direct")}>
                    <b>只整理当前信息</b>
                    <small>完成本次分析后结束，不建立持续工作。</small>
                  </button>
                  <button
                    type="button"
                    onClick={() => chooseOutcome("mainline")}
                  >
                    <b>持续跟踪并寻找联系人</b>
                    <small>保留客户开发上下文，后续继续接收变化和回复。</small>
                  </button>
                </div>
              </HunterReply>
            ) : null}
            {status === "error" ? (
              <div className="s2-local-error" role="alert">
                <Icon name="warning" />
                <span>
                  <b>暂时无法判断推进方式</b>
                  <small>
                    你的输入和附件已经保留，可以重新判断或继续补充目标。
                  </small>
                </span>
                <Button
                  size="sm"
                  icon="refresh"
                  onClick={() => {
                    if (forcedState) setParams({}, { replace: true });
                    setStatus("classifying");
                  }}
                >
                  重新判断
                </Button>
              </div>
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
          disabled={isLimited || ["mainline", "task"].includes(status)}
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
          无需预先选择工作类型。Hunter
          会说明执行计划、等待点和结束条件；如不符合预期，可以直接在对话中纠正。
        </footer>
      </section>
    </div>
  );
}
