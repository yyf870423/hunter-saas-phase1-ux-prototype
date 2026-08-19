import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import {
  Button,
  IconButton,
  Modal,
  SearchField,
  StatusBadge,
  useToast,
} from "../stage1/ui";
import {
  Composer,
  HunterReply,
  PlanList,
  PlanUpdate,
  UserMessage,
} from "./automation-ui";
import { sideTasks } from "./data";

const tabs = [
  ["all", "全部"],
  ["running", "运行中"],
  ["waiting", "等待处理"],
  ["finished", "已结束"],
];

function taskInTab(task, tab) {
  if (tab === "running")
    return ["运行中", "重试中", "排队中"].includes(task.status);
  if (tab === "waiting")
    return ["等待用户", "等待外部", "已暂停", "失败"].includes(task.status);
  if (tab === "finished") return ["完成", "已取消"].includes(task.status);
  return true;
}

export function SideTasksPage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTask, setDeleteTask] = useState(null);
  const [rows, setRows] = useState(sideTasks);
  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return rows.filter(
      (task) =>
        taskInTab(task, tab) &&
        (!keyword ||
          `${task.title} ${task.type} ${task.object}`
            .toLowerCase()
            .includes(keyword)),
    );
  }, [query, rows, tab]);
  return (
    <div className="s2-page s2-module-page">
      <header className="s2-page-heading">
        <div>
          <small>独立、有边界的探索工作</small>
          <h1>支线任务</h1>
          <p>
            主线内部任务只在所属主线中查看，这里仅显示能够独立运行和交付结果的任务。
          </p>
        </div>
        <Button
          tone="primary"
          icon="plus"
          onClick={() => navigate("/tasks/new")}
        >
          新建支线任务
        </Button>
      </header>
      <section className="s2-list-panel">
        <div className="s2-list-toolbar">
          <div className="s2-module-tabs" role="tablist" aria-label="任务状态">
            {tabs.map(([value, label]) => (
              <button
                type="button"
                role="tab"
                aria-selected={tab === value}
                className={tab === value ? "is-active" : ""}
                key={value}
                onClick={() => {
                  setTab(value);
                  setPage(1);
                }}
              >
                {label}
                <em>{rows.filter((task) => taskInTab(task, value)).length}</em>
              </button>
            ))}
          </div>
          <SearchField
            value={query}
            onChange={(next) => {
              setQuery(next);
              setPage(1);
            }}
            placeholder="搜索任务、类型或关联对象"
          />
        </div>
        {visible.length ? (
          <div className="s2-task-table">
            <div className="s2-task-table-head">
              <span>任务</span>
              <span>任务类型</span>
              <span>关联对象</span>
              <span>状态</span>
              <span>最近活动</span>
              <span>操作</span>
            </div>
            {visible.slice((page - 1) * 5, page * 5).map((task) => (
              <div
                className="s2-task-row"
                role="link"
                tabIndex={0}
                key={task.id}
                onClick={() => navigate(`/tasks/${task.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`/tasks/${task.id}`);
                  }
                }}
              >
                <span>
                  <b>{task.title}</b>
                  <small>{task.summary}</small>
                </span>
                <span>{task.type}</span>
                <span>{task.object}</span>
                <span>
                  <StatusBadge tone={task.tone}>{task.status}</StatusBadge>
                </span>
                <time>{task.time}</time>
                <span
                  className="s2-row-actions"
                  onClick={(event) => event.stopPropagation()}
                >
                  <IconButton
                    icon="chevronRight"
                    label={`查看 ${task.title}`}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  />
                  <IconButton
                    icon="trash"
                    label={`删除 ${task.title}`}
                    onClick={() => setDeleteTask(task)}
                  />
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="s2-empty">
            <Icon name="task" />
            <h2>没有符合条件的支线任务</h2>
            <p>可以调整状态或搜索条件，也可以新建一项独立探索任务。</p>
            <Button
              tone="secondary"
              onClick={() => {
                setTab("all");
                setQuery("");
              }}
            >
              清空条件
            </Button>
          </div>
        )}
        <footer className="s2-pagination">
          <span>共 {visible.length} 项</span>
          <div>
            <IconButton
              icon="chevronLeft"
              label="上一页"
              disabled={page === 1}
              onClick={() => setPage((value) => value - 1)}
            />
            <b>{page}</b>
            <IconButton
              icon="chevronRight"
              label="下一页"
              disabled={page * 5 >= visible.length}
              onClick={() => setPage((value) => value + 1)}
            />
          </div>
        </footer>
      </section>
      <Modal
        open={Boolean(deleteTask)}
        close={() => setDeleteTask(null)}
        title="删除支线任务"
        description="任务将进入回收站，30 天内可以恢复。"
        footer={
          <>
            <Button tone="secondary" onClick={() => setDeleteTask(null)}>
              取消
            </Button>
            <Button
              tone="danger"
              onClick={() => {
                setRows((items) =>
                  items.filter((item) => item.id !== deleteTask.id),
                );
                setDeleteTask(null);
                notify("支线任务已移入回收站", "success");
              }}
            >
              删除并移入回收站
            </Button>
          </>
        }
      >
        <div className="s2-confirm-copy">
          <p>
            排队、运行、等待和重试中的执行会先安全停止；已写入的正式资产不会删除。
          </p>
          <p>该任务没有已经发生且无法撤销的外部动作。</p>
        </div>
      </Modal>
    </div>
  );
}

const taskPlan = [
  {
    id: "collect",
    title: "汇总现有人物与来源",
    detail: "读取人才版图和公开来源中已经存在的两组人物记录。",
    requirement: "核验两位“周明远”是否为同一个人。",
  },
  {
    id: "compare",
    title: "比较身份与任职证据",
    detail: "对比姓名、教育、任职时间和团队关系。",
    requirement: "只形成身份建议，不自动合并人物。",
  },
  {
    id: "decide",
    title: "交付消歧建议",
    detail: "无法安全判断时等待用户补充或选择。",
    requirement: "证据不足时必须停下来等待用户决定。",
  },
];

export function SideTaskDetail() {
  const navigate = useNavigate();
  const notify = useToast();
  const [paused, setPaused] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [composer, setComposer] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [authMode, setAuthMode] = useState("confirm");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const send = (text, files) => {
    setResolved(true);
    setComposer("");
    setAttachments([]);
    notify(
      files.length
        ? "补充资料已保存并从当前检查点继续"
        : "处理意见已保存并从当前检查点继续",
      "success",
    );
  };
  const visiblePlan = taskPlan.map((step, index) => ({
    ...step,
    status: resolved
      ? "done"
      : index < 2
        ? "done"
        : paused
          ? "paused"
          : "waiting-user",
    statusDetail:
      !resolved && index === 2
        ? paused
          ? "身份建议和已有证据已保留，继续后仍从当前决定节点恢复。"
          : "公开证据不足，等待用户补充最新任职信息或给出决定。"
        : undefined,
  }));
  const planUpdate = resolved
    ? {
        title: "计划已完成",
        detail: "用户补充最新任职信息后，身份建议已回流人才版图审核区。",
        time: "刚刚",
        tone: "info",
      }
    : paused
      ? {
          title: "计划已暂停",
          detail: "身份建议、证据和等待节点均已保留，继续后从当前检查点恢复。",
          time: "刚刚",
          tone: "warning",
        }
      : {
          title: "计划已调整为等待用户",
          detail: "公开证据不足以安全合并人物，自动判断已停止并保留现有结果。",
          time: "08:58",
          tone: "warning",
        };
  return (
    <div className="s2-page s2-task-detail-page">
      <header className="s2-detail-header">
        <button type="button" onClick={() => navigate("/tasks")}>
          <Icon name="chevronLeft" />
          返回支线任务
        </button>
        <div>
          <small>人物身份核验</small>
          <h1>核验灵巧手团队负责人</h1>
          <p>关联：星澜机器人人才版图 · 创建人：沈岚</p>
        </div>
        <div>
          <StatusBadge
            tone={resolved ? "success" : paused ? "neutral" : "warning"}
          >
            {resolved ? "完成" : paused ? "已暂停" : "等待用户"}
          </StatusBadge>
          <Button
            tone="secondary"
            icon={paused ? "play" : "pause"}
            disabled={resolved}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? "继续" : "暂停"}
          </Button>
          <IconButton
            icon="trash"
            label="删除任务"
            onClick={() => setDeleteOpen(true)}
          />
        </div>
      </header>
      <div className="s2-task-detail-layout">
        <aside className="s2-task-context">
          <h2>任务上下文</h2>
          <dl>
            <div>
              <dt>任务目标</dt>
              <dd>确认两组公开记录是否对应同一位灵巧手团队负责人。</dd>
            </div>
            <div>
              <dt>交付去向</dt>
              <dd>星澜机器人人才版图 · 人物与关系</dd>
            </div>
            <div>
              <dt>执行边界</dt>
              <dd>只分析和给出身份建议，不自动合并人物。</dd>
            </div>
            <div>
              <dt>最近检查点</dt>
              <dd>
                {resolved ? "身份建议已写回审核结果" : "三项证据已完成比较"}
              </dd>
            </div>
          </dl>
        </aside>
        <section className="s2-task-conversation">
          <div className="s2-task-timeline">
            <UserMessage time="今天 08:54">
              核验人才版图中两位“周明远”是不是同一个人，只给身份建议，不要自动合并。
            </UserMessage>
            <HunterReply>
              <p>
                我已经比较公开履历、任职时间、教育经历和团队关系。两组记录有较强重合，但目前仍存在一项无法自动消除的冲突。
              </p>
              <h2>当前判断</h2>
              <ul>
                <li>姓名、教育经历和早期任职一致。</li>
                <li>一组资料显示 2025 年加入穹顶智能，另一组仍显示原公司。</li>
                <li>两项来源都没有足够新鲜的直接联系方式。</li>
              </ul>
              <h2>待确认的两条记录</h2>
              <table className="s2-markdown-table">
                <thead>
                  <tr>
                    <th>记录</th>
                    <th>人物</th>
                    <th>当前任职</th>
                    <th>来源更新</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>A</td>
                    <td>周明远</td>
                    <td>穹顶智能 · 具身智能算法总监</td>
                    <td>2026-08-17</td>
                  </tr>
                  <tr>
                    <td>B</td>
                    <td>周明远</td>
                    <td>矩阵机器人 · 机器人学习负责人</td>
                    <td>2025-11-08</td>
                  </tr>
                </tbody>
              </table>
              <blockquote className="s2-markdown-note">
                建议暂时标记为“疑似同一人”，补充最新任职证据后再合并。系统不会在证据不足时自动合并人物。
              </blockquote>
              <p>可以直接在下方输入你掌握的任职信息，或上传相关文件。</p>
            </HunterReply>
            {resolved ? (
              <>
                <UserMessage time="刚刚">
                  补充：这是同一个人，2025 年 12 月加入穹顶智能。
                </UserMessage>
                <HunterReply>
                  <p>
                    已记录你补充的任职事实，并将两组记录标记为同一人物的合并建议。该建议已回流“星澜机器人人才版图”的更新与审核区，仍需按当前写入规则完成审核。
                  </p>
                </HunterReply>
              </>
            ) : null}
          </div>
          <div className="s2-task-composer-dock">
            <div className="s2-task-plan">
              <button
                type="button"
                aria-expanded={planOpen}
                onClick={() => setPlanOpen((value) => !value)}
              >
                <Icon name="task" />
                <span>
                  <b>执行计划</b>
                  <small>
                    {resolved
                      ? "3 / 3 项完成"
                      : paused
                        ? "2 / 3 项完成，当前已暂停"
                        : "2 / 3 项完成，等待身份决定"}
                  </small>
                </span>
                <Icon name={planOpen ? "chevronDown" : "chevronUp"} />
              </button>
              {planOpen ? (
                <div className="s2-task-plan-body">
                  <PlanUpdate update={planUpdate} />
                  <PlanList steps={visiblePlan} />
                </div>
              ) : null}
            </div>
            <Composer
              value={composer}
              onChange={setComposer}
              onSend={send}
              authMode={authMode}
              onAuthChange={setAuthMode}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              placeholder="输入你掌握的信息，或上传能够帮助核验的文件"
              disabled={paused || resolved}
            />
          </div>
        </section>
      </div>
      <Modal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        title="删除支线任务"
        description="任务将进入回收站，30 天内可以恢复。"
        footer={
          <>
            <Button tone="secondary" onClick={() => setDeleteOpen(false)}>
              取消
            </Button>
            <Button
              tone="danger"
              onClick={() => {
                setDeleteOpen(false);
                navigate("/tasks");
                notify("支线任务已移入回收站", "success");
              }}
            >
              删除并移入回收站
            </Button>
          </>
        }
      >
        <div className="s2-confirm-copy">
          <p>任务对话、计划和尚未写入正式资产的专属文件会一起进入回收站。</p>
          <p>人才版图中已经确认的正式人物记录不会删除。</p>
        </div>
      </Modal>
    </div>
  );
}

export function NewSideTask() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [authMode, setAuthMode] = useState("confirm");
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  return (
    <div className="s2-page s2-new-workstream">
      <section className="s2-new-workstream-inner">
        <header>
          <span>
            <Icon name="task" />
          </span>
          <h1>新建支线任务</h1>
          <p>
            支线任务用于目标独立、范围有限且有明确交付的探索工作；长期业务推进应新建业务主线。
          </p>
        </header>
        <Composer
          value={value}
          onChange={setValue}
          onSend={(text) => {
            setSending(true);
            window.setTimeout(() => navigate("/tasks/task-hand-team"), 600);
          }}
          authMode={authMode}
          onAuthChange={setAuthMode}
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          placeholder="例如：核验人才版图中两位同名负责人是否为同一个人"
          streaming={sending}
          onStop={() => setSending(false)}
          disabled={sending}
        />
        <div className="s2-side-task-boundary">
          <Icon name="info" />
          <span>
            <b>什么时候使用支线任务</b>
            <p>
              一次身份核验、公开资料调研、联系人探索或论文作者消歧适合作为支线任务；持续招聘、客户开发和长期人才摸排应使用业务主线。
            </p>
          </span>
        </div>
      </section>
    </div>
  );
}
