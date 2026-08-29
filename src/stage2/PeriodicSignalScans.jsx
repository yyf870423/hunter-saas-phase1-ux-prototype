import { useEffect, useMemo, useState } from "react";
import { Icon } from "../components/Icon";
import {
  Button,
  Modal,
  SearchField,
  StatusBadge,
  useToast,
} from "../stage1/ui";
import { SelectMenu } from "../stage4/asset-ui";
import { periodicSignalScans as initialScans } from "./data";

const statusTabs = ["全部", "运行中", "已暂停", "异常"];
const detailTabs = [
  ["config", "扫描配置"],
  ["runs", "执行记录"],
  ["signals", "产生的信号"],
];

const emptyDraft = {
  title: "",
  description: "",
  frequency: "每周一 09:00",
  industries: [],
  regions: [],
  stages: [],
  keywords: "",
  exclusions: "",
  limit: "80",
};

function ScanForm({ value, onChange }) {
  const update = (key, next) => onChange({ ...value, [key]: next });
  return (
    <div className="s2-scan-form">
      <label className="s2-scan-field s2-scan-field-wide">
        <span>扫描名称</span>
        <input
          value={value.title}
          onChange={(event) => update("title", event.target.value)}
          placeholder="例如：具身智能新公司与融资动态"
        />
      </label>
      <label className="s2-scan-field s2-scan-field-wide">
        <span>希望持续发现什么</span>
        <textarea
          value={value.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="用自然语言说明目标、重点变化和需要忽略的内容"
        />
      </label>
      <div className="s2-scan-field">
        <span>运行频率</span>
        <SelectMenu
          label="选择运行频率"
          value={value.frequency}
          options={[
            "每天 09:00",
            "每 3 天 10:00",
            "每周一 09:00",
            "每两周周五 17:00",
            "每月 1 日 09:00",
          ]}
          onChange={(next) => update("frequency", next)}
        />
      </div>
      <label className="s2-scan-field">
        <span>每轮核验上限</span>
        <span className="s2-scan-number-input">
          <input
            type="number"
            min="10"
            max="500"
            value={value.limit}
            onChange={(event) => update("limit", event.target.value)}
          />
          <em>条</em>
        </span>
      </label>
      <div className="s2-scan-field">
        <span>关注行业</span>
        <SelectMenu
          label="选择行业"
          value={value.industries}
          options={["人工智能", "具身智能", "机器人", "自动驾驶", "企业服务"]}
          multiple
          searchable
          onChange={(next) => update("industries", next)}
        />
      </div>
      <div className="s2-scan-field">
        <span>关注地区</span>
        <SelectMenu
          label="选择地区"
          value={value.regions}
          options={["不限", "中国大陆", "北京", "上海", "深圳", "杭州", "苏州"]}
          multiple
          searchable
          onChange={(next) => update("regions", next)}
        />
      </div>
      <label className="s2-scan-field s2-scan-field-wide">
        <span>重点词</span>
        <input
          value={value.keywords}
          onChange={(event) => update("keywords", event.target.value)}
          placeholder="使用逗号分隔，例如：VLA，灵巧手，机器人学习"
        />
      </label>
      <label className="s2-scan-field s2-scan-field-wide">
        <span>忽略范围</span>
        <input
          value={value.exclusions}
          onChange={(event) => update("exclusions", event.target.value)}
          placeholder="例如：实习岗位，工业设备经销商"
        />
      </label>
    </div>
  );
}

function ScanConfig({ scan }) {
  return (
    <div className="s2-scan-config">
      <section>
        <h3>扫描目标</h3>
        <p>{scan.description}</p>
      </section>
      <section>
        <h3>覆盖范围</h3>
        <dl>
          <div>
            <dt>行业方向</dt>
            <dd>{scan.industries.join("、")}</dd>
          </div>
          <div>
            <dt>地区范围</dt>
            <dd>{scan.regions.join("、")}</dd>
          </div>
          <div>
            <dt>阶段或对象</dt>
            <dd>{scan.stages.join("、")}</dd>
          </div>
          <div>
            <dt>重点词</dt>
            <dd>{scan.keywords.join("、")}</dd>
          </div>
          <div>
            <dt>忽略范围</dt>
            <dd>{scan.exclusions.join("、")}</dd>
          </div>
        </dl>
      </section>
      <section>
        <h3>调度与结果</h3>
        <dl>
          <div>
            <dt>运行频率</dt>
            <dd>{scan.frequency}</dd>
          </div>
          <div>
            <dt>核验上限</dt>
            <dd>{scan.limit}</dd>
          </div>
          <div>
            <dt>结果处理</dt>
            <dd>与已有信号查重合并后进入信号中心，不自动启动任务</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function ScanRuns({ scan, onShowSignals }) {
  return (
    <div className="s2-scan-runs">
      {scan.runs.map((run) => (
        <article key={run.id}>
          <i className={run.status === "完成" ? "is-success" : "is-warning"} />
          <div>
            <header>
              <span>
                <b>{run.startedAt}</b>
                <small>{run.duration}</small>
              </span>
              <StatusBadge tone={run.status === "完成" ? "success" : "warning"}>
                {run.status}
              </StatusBadge>
            </header>
            <p>{run.scope}</p>
            <button type="button" onClick={onShowSignals}>
              {run.result}
              <Icon name="chevronRight" />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function GeneratedSignals({ scan, onOpenSignal }) {
  return (
    <div className="s2-scan-generated">
      {scan.generatedSignals.map((signal) => (
        <button type="button" key={signal.title} onClick={onOpenSignal}>
          <i className={`tone-${signal.tone}`}>
            <Icon name="signal" />
          </i>
          <span>
            <b>{signal.title}</b>
            <small>
              {signal.object} · {signal.time}
            </small>
          </span>
          <StatusBadge tone={signal.tone}>{signal.status}</StatusBadge>
          <Icon name="chevronRight" />
        </button>
      ))}
    </div>
  );
}

export function PeriodicSignalScans({ createRequest, onOpenSignals }) {
  const notify = useToast();
  const [scans, setScans] = useState(initialScans);
  const [tab, setTab] = useState("全部");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(initialScans[0].id);
  const [detailTab, setDetailTab] = useState("config");
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [runningId, setRunningId] = useState(null);
  const selected = scans.find((scan) => scan.id === selectedId) || scans[0];
  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return scans.filter(
      (scan) =>
        (tab === "全部" || scan.status === tab) &&
        (!keyword ||
          `${scan.title} ${scan.scope} ${scan.description}`
            .toLowerCase()
            .includes(keyword)),
    );
  }, [query, scans, tab]);

  useEffect(() => {
    if (!createRequest) return;
    setEditing(null);
    setDraft(emptyDraft);
    setFormOpen(true);
  }, [createRequest]);
  const openEdit = () => {
    setEditing(selected.id);
    setDraft({
      title: selected.title,
      description: selected.description,
      frequency: selected.frequency,
      industries: selected.industries,
      regions: selected.regions,
      stages: selected.stages,
      keywords: selected.keywords.join("，"),
      exclusions: selected.exclusions.join("，"),
      limit: selected.limit.match(/\d+/)?.[0] || "80",
    });
    setFormOpen(true);
  };
  const saveDraft = () => {
    if (!draft.title.trim() || !draft.description.trim()) {
      notify("请填写扫描名称和扫描目标", "error");
      return;
    }
    const normalize = (value) =>
      value
        .split(/[，,]/)
        .map((item) => item.trim())
        .filter(Boolean);
    if (editing) {
      setScans((items) =>
        items.map((item) =>
          item.id === editing
            ? {
                ...item,
                title: draft.title.trim(),
                description: draft.description.trim(),
                frequency: draft.frequency,
                industries: draft.industries,
                regions: draft.regions,
                keywords: normalize(draft.keywords),
                exclusions: normalize(draft.exclusions),
                scope: `${draft.regions.join("、") || "不限地区"} · ${draft.industries.join("、") || "不限行业"}`,
                limit: `每轮最多核验 ${draft.limit || 80} 条线索`,
              }
            : item,
        ),
      );
      notify("周期扫描配置已更新", "success");
    } else {
      const id = `scan-${Date.now()}`;
      const newScan = {
        ...initialScans[0],
        id,
        title: draft.title.trim(),
        description: draft.description.trim(),
        frequency: draft.frequency,
        industries: draft.industries,
        regions: draft.regions,
        stages: draft.stages.length ? draft.stages : ["待发现"],
        keywords: normalize(draft.keywords),
        exclusions: normalize(draft.exclusions),
        scope: `${draft.regions.join("、") || "不限地区"} · ${draft.industries.join("、") || "不限行业"}`,
        limit: `每轮最多核验 ${draft.limit || 80} 条线索`,
        status: "运行中",
        tone: "success",
        nextRun: draft.frequency,
        lastRun: "尚未运行",
        lastDuration: "—",
        newSignals: 0,
        pendingSignals: 0,
        runs: [],
        generatedSignals: [],
      };
      setScans((items) => [newScan, ...items]);
      setSelectedId(id);
      notify("周期扫描已创建，将按计划开始首轮运行", "success");
    }
    setFormOpen(false);
  };
  const togglePaused = () => {
    const pause = selected.status !== "已暂停";
    setScans((items) =>
      items.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              status: pause ? "已暂停" : "运行中",
              tone: pause ? "neutral" : "success",
              nextRun: pause ? "已暂停" : item.frequency,
            }
          : item,
      ),
    );
    notify(pause ? "周期扫描已暂停" : "周期扫描已继续", "success");
  };
  const runNow = () => {
    setRunningId(selected.id);
    notify("已开始本轮扫描，可留在当前页面查看状态", "info");
    window.setTimeout(() => {
      setScans((items) =>
        items.map((item) =>
          item.id === selected.id
            ? {
                ...item,
                lastRun: "刚刚",
                lastDuration: "1 分 18 秒",
                newSignals: item.newSignals + 2,
                pendingSignals: item.pendingSignals + 2,
                runs: [
                  {
                    id: `run-${Date.now()}`,
                    startedAt: "刚刚",
                    duration: "1 分 18 秒",
                    status: "完成",
                    scope: "完成本轮增量核验并合并重复线索",
                    result: "产生 2 条新信号，均待处理",
                  },
                  ...item.runs,
                ],
              }
            : item,
        ),
      );
      setRunningId(null);
      notify("本轮扫描完成，产生 2 条待处理信号", "success");
    }, 1400);
  };

  if (!selected) return null;
  return (
    <>
      <section className="s2-signal-shell s2-scan-shell">
        <div className="s2-signal-list-pane">
          <div className="s2-signal-toolbar">
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="搜索周期扫描名称或范围"
            />
            <div
              className="s2-signal-tabs app-tabs"
              role="tablist"
              aria-label="周期扫描状态"
            >
              {statusTabs.map((item) => (
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
                      ? scans.length
                      : scans.filter((scan) => scan.status === item).length}
                  </em>
                </button>
              ))}
            </div>
          </div>
          <div className="s2-signal-list-label">
            <b>周期扫描</b>
            <span>{visible.length} 项</span>
          </div>
          <div className="s2-scan-list">
            {visible.map((scan) => (
              <button
                type="button"
                className={selected.id === scan.id ? "is-active" : ""}
                key={scan.id}
                onClick={() => {
                  setSelectedId(scan.id);
                  setDetailTab("config");
                  setMobileDetailOpen(true);
                }}
              >
                <i className={scan.status === "已暂停" ? "is-paused" : ""}>
                  <Icon name="refresh" />
                </i>
                <span>
                  <small>{scan.frequency}</small>
                  <b>{scan.title}</b>
                  <p>{scan.scope}</p>
                  <em>
                    {scan.status === "已暂停"
                      ? "当前暂停"
                      : `下次 ${scan.nextRun}`}{" "}
                    · 上轮新增 {scan.newSignals} 条
                  </em>
                </span>
                <span className="s2-signal-row-trailing">
                  <StatusBadge tone={scan.tone}>{scan.status}</StatusBadge>
                  <Icon name="chevronRight" />
                </span>
              </button>
            ))}
            {!visible.length ? (
              <div className="s2-empty">
                <Icon name="refresh" />
                <h2>没有符合条件的周期扫描</h2>
                <p>可以清空搜索或切换状态。</p>
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
        <aside
          className={`s2-signal-detail s2-scan-detail ${mobileDetailOpen ? "is-mobile-open" : ""}`}
        >
          <button
            type="button"
            className="s2-signal-mobile-back"
            onClick={() => setMobileDetailOpen(false)}
          >
            <Icon name="chevronLeft" />
            返回周期扫描列表
          </button>
          <header>
            <span>
              <small>周期扫描</small>
              <h2>{selected.title}</h2>
              <p>{selected.scope}</p>
            </span>
            <StatusBadge tone={selected.tone}>{selected.status}</StatusBadge>
          </header>
          <div className="s2-scan-summary">
            <div>
              <small>下次运行</small>
              <b>{selected.nextRun}</b>
            </div>
            <div>
              <small>上次运行</small>
              <b>{selected.lastRun}</b>
            </div>
            <div>
              <small>上轮新增</small>
              <b>{selected.newSignals} 条</b>
            </div>
            <div>
              <small>待处理</small>
              <b>{selected.pendingSignals} 条</b>
            </div>
          </div>
          <div className="s2-scan-detail-actions">
            <Button
              tone="primary"
              icon={runningId === selected.id ? "activity" : "play"}
              disabled={runningId === selected.id}
              onClick={runNow}
            >
              {runningId === selected.id ? "正在运行" : "立即运行"}
            </Button>
            <Button
              tone="secondary"
              icon={selected.status === "已暂停" ? "play" : "pause"}
              onClick={togglePaused}
            >
              {selected.status === "已暂停" ? "继续" : "暂停"}
            </Button>
            <Button tone="secondary" icon="edit" onClick={openEdit}>
              编辑
            </Button>
            <Button
              tone="ghost"
              icon="trash"
              onClick={() => setDeleteOpen(true)}
            >
              删除
            </Button>
          </div>
          <div
            className="s2-scan-detail-tabs app-tabs"
            role="tablist"
            aria-label="周期扫描详情"
          >
            {detailTabs.map(([value, label]) => (
              <button
                type="button"
                role="tab"
                aria-selected={detailTab === value}
                className={detailTab === value ? "is-active" : ""}
                key={value}
                onClick={() => setDetailTab(value)}
              >
                {label}
                {value === "runs" ? (
                  <em>{selected.runs.length}</em>
                ) : value === "signals" ? (
                  <em>{selected.generatedSignals.length}</em>
                ) : null}
              </button>
            ))}
          </div>
          <div className="s2-scan-detail-body">
            {detailTab === "config" ? <ScanConfig scan={selected} /> : null}
            {detailTab === "runs" ? (
              <ScanRuns
                scan={selected}
                onShowSignals={() => setDetailTab("signals")}
              />
            ) : null}
            {detailTab === "signals" ? (
              <GeneratedSignals scan={selected} onOpenSignal={onOpenSignals} />
            ) : null}
          </div>
        </aside>
      </section>
      <Modal
        open={formOpen}
        close={() => setFormOpen(false)}
        size="lg"
        title={editing ? "编辑周期扫描" : "新建周期扫描"}
        description="Hunter 按计划持续发现变化；新结果查重合并后进入信号中心。"
        footer={
          <>
            <Button tone="secondary" onClick={() => setFormOpen(false)}>
              取消
            </Button>
            <Button tone="primary" onClick={saveDraft}>
              {editing ? "保存修改" : "创建周期扫描"}
            </Button>
          </>
        }
      >
        <ScanForm value={draft} onChange={setDraft} />
      </Modal>
      <Modal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        title="删除周期扫描"
        description="删除后停止后续扫描；已经产生的信号和已转化任务不会被删除。"
        footer={
          <>
            <Button tone="secondary" onClick={() => setDeleteOpen(false)}>
              取消
            </Button>
            <Button
              tone="danger"
              onClick={() => {
                const remaining = scans.filter(
                  (item) => item.id !== selected.id,
                );
                setScans(remaining);
                setSelectedId(remaining[0]?.id || "");
                setDeleteOpen(false);
                notify("周期扫描已删除", "success");
              }}
            >
              确认删除
            </Button>
          </>
        }
      >
        <p className="s1-modal-copy">
          将删除“{selected.title}”。历史执行记录会随配置移除。
        </p>
      </Modal>
    </>
  );
}
