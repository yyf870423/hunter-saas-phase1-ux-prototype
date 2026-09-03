import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import {
  Button,
  Modal,
  SearchField,
  StatusBadge,
  useToast,
} from "../stage1/ui";
import { signals as initialSignals } from "./data";

const signalTabs = ["全部", "待处理", "观察中", "已转化", "已忽略", "已失效"];

export function SignalsPage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [signals, setSignals] = useState(initialSignals);
  const [tab, setTab] = useState("全部");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(
    initialSignals.find((signal) => signal.id === "signal-cloudchip")?.id ||
      initialSignals[0].id,
  );
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertType, setConvertType] = useState("new");
  const selected =
    signals.find((signal) => signal.id === selectedId) || signals[0];
  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return signals.filter(
      (signal) =>
        (tab === "全部" || signal.status === tab) &&
        (!keyword ||
          `${signal.title} ${signal.object} ${signal.type}`
            .toLowerCase()
            .includes(keyword)),
    );
  }, [query, signals, tab]);
  const updateStatus = (status, message) => {
    setSignals((items) =>
      items.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              status,
              tone:
                status === "已转化"
                  ? "success"
                  : status === "已失效" || status === "已忽略"
                    ? "neutral"
                    : "info",
            }
          : item,
      ),
    );
    notify(message, "success");
  };
  return (
    <div className="s2-page s2-signals-page">
      <header className="s2-page-heading">
        <div>
          <small>Hunter 主动发现、值得关注的业务变化</small>
          <h1>洞察中心</h1>
          <p>
            集中查看 Hunter
            在执行或探索中发现的信号与洞察；用户主动提供的信息直接用于当前任务，不会在这里重复提醒。
          </p>
        </div>
      </header>
      <section className="s2-signal-shell">
        <div className="s2-signal-list-pane">
          <div className="s2-signal-toolbar">
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="搜索公司、人物、信号或洞察"
            />
            <div
              className="s2-signal-tabs app-tabs"
              role="tablist"
              aria-label="洞察状态"
            >
              {signalTabs.map((item) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === item}
                  className={tab === item ? "is-active" : ""}
                  key={item}
                  onClick={() => setTab(item)}
                >
                  {item}
                  <em>
                    {item === "全部"
                      ? signals.length
                      : signals.filter((signal) => signal.status === item)
                          .length}
                  </em>
                </button>
              ))}
            </div>
          </div>
          <div className="s2-signal-list-label">
            <b>洞察与信号</b>
            <span>{visible.length} 条</span>
          </div>
          <div className="s2-signal-feed">
            {visible.map((signal) => (
              <button
                type="button"
                className={selected.id === signal.id ? "is-active" : ""}
                key={signal.id}
                aria-pressed={selected.id === signal.id}
                aria-controls="selected-signal-detail"
                onClick={() => {
                  setSelectedId(signal.id);
                  setMobileDetailOpen(true);
                }}
              >
                <i className={`tone-${signal.tone}`}>
                  <Icon
                    name={
                      signal.type === "候选人动向"
                        ? "user"
                        : signal.type === "关系变化"
                          ? "route"
                          : signal.type === "公司变化"
                            ? "building"
                            : "signal"
                    }
                  />
                </i>
                <span>
                  <small>
                    {signal.kind || "信号"} · {signal.type} · {signal.object}
                  </small>
                  <b>{signal.title}</b>
                  <p>{signal.summary}</p>
                  <em>
                    {signal.evidence} 个来源 · {signal.time}
                  </em>
                </span>
                <span className="s2-signal-row-trailing">
                  <StatusBadge tone={signal.tone}>{signal.status}</StatusBadge>
                  <Icon name="chevronRight" />
                </span>
              </button>
            ))}
            {!visible.length ? (
              <div className="s2-empty">
                <Icon name="signal" />
                <h2>没有符合条件的洞察或信号</h2>
                <p>可以清空搜索或切换状态分类。</p>
                <Button
                  tone="secondary"
                  onClick={() => {
                    setQuery("");
                    setTab("全部");
                  }}
                >
                  清空条件
                </Button>
              </div>
            ) : null}
          </div>
        </div>
        {selected ? (
          <aside
            id="selected-signal-detail"
            key={selected.id}
            className={`s2-signal-detail ${mobileDetailOpen ? "is-mobile-open" : ""}`}
          >
            <button
              type="button"
              className="s2-signal-mobile-back"
              onClick={() => setMobileDetailOpen(false)}
            >
              <Icon name="chevronLeft" />
              返回洞察列表
            </button>
            <header>
              <span>
                <small>
                  {selected.kind || "信号"} · {selected.type}
                </small>
                <h2>{selected.title}</h2>
                <p>
                  {selected.object} · {selected.time}
                </p>
              </span>
              <StatusBadge tone={selected.tone}>{selected.status}</StatusBadge>
            </header>
            <section className="s2-signal-priority">
              <Icon name="warning" />
              <span>
                <b>{selected.priority}</b>
                <p>{selected.summary}</p>
              </span>
            </section>
            <section>
              <h3>本次变化</h3>
              <ul>
                {selected.changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3>合并来源</h3>
              <div className="s2-signal-sources">
                {selected.sources.map((source, index) => (
                  <button
                    type="button"
                    key={source}
                    onClick={() =>
                      notify(`已打开来源“${source}”的摘要`, "info")
                    }
                  >
                    <span>
                      <b>{source}</b>
                      <small>
                        {index === 0 ? "直接证据" : "交叉印证"} · {index + 1}{" "}
                        天内
                      </small>
                    </span>
                    <Icon name="chevronRight" />
                  </button>
                ))}
              </div>
            </section>
            <section>
              <h3>建议行动</h3>
              <p>
                {selected.graphPath
                  ? "可靠变化已经更新；请查看图谱中的待确认关系，确认后再成为可复用结果。"
                  : selected.status === "已转化"
                    ? "该信号已经转化并保留去向，可以查看关联任务。"
                    : "建议先核验公司当前招聘需求和关键联系人，再决定是否启动客户开发任务。"}
              </p>
            </section>
            <footer>
              {selected.graphPath ? (
                <Button
                  tone="primary"
                  onClick={() => navigate(selected.graphPath)}
                >
                  查看图谱审核
                </Button>
              ) : selected.status === "已转化" ? (
                <Button
                  tone="primary"
                  onClick={() => navigate("/tasks/position-vla")}
                >
                  查看关联任务
                </Button>
              ) : (
                <Button tone="primary" onClick={() => setConvertOpen(true)}>
                  转化或启动任务
                </Button>
              )}
              {selected.status !== "观察中" && selected.status !== "已转化" ? (
                <Button
                  tone="secondary"
                  onClick={() =>
                    updateStatus(
                      "观察中",
                      "信号已加入观察，出现实质变化时会再次提醒",
                    )
                  }
                >
                  加入观察
                </Button>
              ) : null}
              {!["已忽略", "已失效", "已转化"].includes(selected.status) ? (
                <Button
                  tone="ghost"
                  onClick={() =>
                    updateStatus(
                      "已忽略",
                      "信号已忽略，重复来源将继续合并但不再主动提醒",
                    )
                  }
                >
                  忽略
                </Button>
              ) : null}
              {!["已失效", "已转化"].includes(selected.status) ? (
                <Button
                  tone="ghost"
                  onClick={() => updateStatus("已失效", "信号已标记为失效")}
                >
                  标记失效
                </Button>
              ) : null}
            </footer>
          </aside>
        ) : null}
      </section>
      <Modal
        open={convertOpen}
        close={() => setConvertOpen(false)}
        title="处理洞察"
        description="洞察与信号会保留来源和实际去向，不会因处理而删除。"
        footer={
          <>
            <Button tone="secondary" onClick={() => setConvertOpen(false)}>
              取消
            </Button>
            <Button
              tone="primary"
              onClick={() => {
                setConvertOpen(false);
                updateStatus(
                  "已转化",
                  convertType === "new"
                    ? "信号已作为新任务的已知信息"
                    : "信号已关联现有任务",
                );
                if (convertType === "new") {
                  sessionStorage.setItem(
                    "hunter-new-work-signal",
                    `根据信号“${selected.title}”继续处理，先判断最合适的推进方式。`,
                  );
                  navigate("/new");
                }
              }}
            >
              继续
            </Button>
          </>
        }
      >
        <div
          className="s2-convert-options"
          role="radiogroup"
          aria-label="信号转化方式"
        >
          {[
            [
              "new",
              "启动新任务",
              "Hunter 根据目标制定执行计划，直接处理或持续推进。",
            ],
            [
              "existing",
              "关联现有任务",
              "把证据补充到已经存在的任务，不创建重复记录。",
            ],
          ].map(([value, title, description]) => (
            <button
              type="button"
              role="radio"
              aria-checked={convertType === value}
              className={convertType === value ? "is-active" : ""}
              key={value}
              onClick={() => setConvertType(value)}
            >
              <i>{convertType === value ? <span /> : null}</i>
              <span>
                <b>{title}</b>
                <small>{description}</small>
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
