import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import {
  Button,
  Modal,
  SearchField,
  StatusBadge,
  useToast,
} from "../stage1/ui";
import { signals as initialSignals } from "./data";
import { PeriodicSignalScans } from "./PeriodicSignalScans";

const signalTabs = ["全部", "待处理", "观察中", "已转化", "已忽略", "已失效"];

export function SignalsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const notify = useToast();
  const view = searchParams.get("view") === "periodic" ? "periodic" : "signals";
  const [signals, setSignals] = useState(initialSignals);
  const [tab, setTab] = useState("全部");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(initialSignals[0].id);
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
          <small>尚待判断的业务变化</small>
          <h1>信号中心</h1>
          <p>
            {view === "signals"
              ? "重复信号合并来源和变化；信号不是任务，也不是未经确认的正式业务事实。"
              : "集中管理持续发现业务变化的周期扫描，并查看每次执行产生的信号。"}
          </p>
        </div>
      </header>
      <div
        className="s2-signal-view-tabs app-tabs"
        role="tablist"
        aria-label="信号中心视图"
      >
        {[
          ["signals", "信号"],
          ["periodic", "周期扫描"],
        ].map(([value, label]) => (
          <button
            type="button"
            role="tab"
            aria-selected={view === value}
            className={view === value ? "is-active" : ""}
            key={value}
            onClick={() =>
              setSearchParams(value === "signals" ? {} : { view: "periodic" })
            }
          >
            {label}
          </button>
        ))}
      </div>
      {view === "periodic" ? (
        <PeriodicSignalScans onOpenSignals={() => setSearchParams({})} />
      ) : (
        <>
          <section className="s2-signal-shell">
            <div className="s2-signal-list-pane">
              <div className="s2-signal-toolbar">
                <SearchField
                  value={query}
                  onChange={setQuery}
                  placeholder="搜索公司、人物或信号内容"
                />
                <div
                  className="s2-signal-tabs app-tabs"
                  role="tablist"
                  aria-label="信号状态"
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
                <b>信号列表</b>
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
                            : signal.type === "公司变化"
                              ? "building"
                              : "signal"
                        }
                      />
                    </i>
                    <span>
                      <small>
                        {signal.type} · {signal.object}
                      </small>
                      <b>{signal.title}</b>
                      <p>{signal.summary}</p>
                      <em>
                        {signal.evidence} 个来源 · {signal.time}
                      </em>
                    </span>
                    <span className="s2-signal-row-trailing">
                      <StatusBadge tone={signal.tone}>
                        {signal.status}
                      </StatusBadge>
                      <Icon name="chevronRight" />
                    </span>
                  </button>
                ))}
                {!visible.length ? (
                  <div className="s2-empty">
                    <Icon name="signal" />
                    <h2>没有符合条件的信号</h2>
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
                  返回信号列表
                </button>
                <header>
                  <span>
                    <small>所选信号 · {selected.type}</small>
                    <h2>{selected.title}</h2>
                    <p>
                      {selected.object} · {selected.time}
                    </p>
                  </span>
                  <StatusBadge tone={selected.tone}>
                    {selected.status}
                  </StatusBadge>
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
                            {index === 0 ? "直接证据" : "交叉印证"} ·{" "}
                            {index + 1} 天内
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
                    {selected.status === "已转化"
                      ? "该信号已经转化并保留去向，可以查看关联工作。"
                      : "建议先核验公司当前招聘需求和关键联系人，再决定是否启动客户开发工作。"}
                  </p>
                </section>
                <footer>
                  {selected.status === "已转化" ? (
                    <Button
                      tone="primary"
                      onClick={() => navigate("/works/position-vla")}
                    >
                      查看关联工作
                    </Button>
                  ) : (
                    <Button tone="primary" onClick={() => setConvertOpen(true)}>
                      转化或启动工作
                    </Button>
                  )}
                  {selected.status !== "观察中" &&
                  selected.status !== "已转化" ? (
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
            title="转化信号"
            description="信号会保留来源和实际去向，不会因转化而删除。"
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
                        ? "信号已作为新工作的已知信息"
                        : "信号已关联现有工作",
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
                  "启动新工作",
                  "Hunter 根据目标制定执行计划，直接处理或持续推进。",
                ],
                [
                  "existing",
                  "关联现有工作",
                  "把证据补充到已经存在的工作，不创建重复记录。",
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
        </>
      )}
    </div>
  );
}
