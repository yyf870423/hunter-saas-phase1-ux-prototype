import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { GraphCanvas } from "../components/TopicGraphCanvas";
import { GraphCameraControls } from "../components/GraphCameraControls";
import { useCanvasFullscreen } from "../components/useCanvasFullscreen";
import {
  Button,
  DetailTabs,
  FormField,
  Modal,
  SelectMenu,
  StateBanner,
  StatusBadge,
  TextArea,
  TextInput,
} from "./asset-ui";
import {
  changeAction,
  editReview,
  projectReview,
  rebaseReview,
  reviewCondition,
  reviewDeltaLabel,
  reviewRows,
  reviewStateLabel,
  validateReview,
} from "./graph-review-model";
import "./graph-review.css";

function ReviewCanvas({
  pages,
  item,
  session,
  cameraApi,
  expanded,
  setExpanded,
  fullscreen,
  onFullscreen,
}) {
  const previous = session.current.views[item.id] || {};
  const [positions, setPositions] = useState(previous.positions || {});
  const [zoom, setZoom] = useState(previous.camera?.zoom || 0.72);
  const [selectedIds, setSelectedIds] = useState([item.nodeId]);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [collapsed, setCollapsed] = useState(new Set());
  const projection = useMemo(
    () => projectReview(pages, item, expanded, positions),
    [pages, item, expanded, positions],
  );
  const remember = (value) => {
    session.current.views[item.id] = {
      ...(session.current.views[item.id] || {}),
      ...value,
    };
  };
  return (
    <div className="tg-review-canvas">
      <header>
        <span>
          <small>审核预览 · 不改正式布局</small>
          <b>
            {pages.find((page) => page.id === item.pageId)?.name ||
              "图页已不存在"}
          </b>
        </span>
        <GraphCameraControls
          zoom={zoom}
          onZoom={setZoom}
          onFit={() => cameraApi.current?.fit()}
          isFullscreen={fullscreen}
          onFullscreen={onFullscreen}
          labels={{
            out: "缩小审核画布",
            in: "放大审核画布",
            fit: "自适应审核画布",
            enter: "进入审核画布全屏",
            exit: "退出审核画布全屏",
          }}
        />
      </header>
      <div className="tg-review-legend">
        <span>拟新增</span>
        <span>拟修改</span>
        <span>拟移除</span>
        <Button
          onClick={() => {
            setExpanded(!expanded);
            remember({ expanded: !expanded });
            requestAnimationFrame(() => cameraApi.current?.fit());
          }}
        >
          {expanded ? "仅看相关上下文" : "展开相关上下文"}
        </Button>
      </div>
      <GraphCanvas
        pageKey={`review:${item.id}`}
        nodes={projection.nodes}
        edges={projection.edges}
        readingOnly
        previewNodeDrag
        initialView={previous.camera}
        apiRef={cameraApi}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        selectedEdgeId={selectedEdgeId}
        setSelectedEdgeId={setSelectedEdgeId}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        zoom={zoom}
        onZoom={setZoom}
        onNodesChange={(update) => {
          const next =
            typeof update === "function" ? update(projection.nodes) : update;
          const value = Object.fromEntries(
            next.map((node) => [node.id, { x: node.x, y: node.y }]),
          );
          setPositions(value);
          remember({ positions: value });
        }}
        onViewChange={(camera) => remember({ camera })}
        onMoveCommit={() => {}}
        onContextMenu={() => {}}
      />
    </div>
  );
}

function ReviewNodeSelect({
  nodes,
  value,
  onChange,
  label,
  exclude,
  optional,
}) {
  const choices = nodes
    .filter((node) => node.id !== exclude)
    .map((node, index) => ({
      id: node.id,
      label: `${node.label}${nodes.filter((other) => other.label === node.label).length > 1 ? ` · ${index + 1}` : ""}`,
    }));
  if (optional) choices.unshift({ id: "", label: "无上级" });
  return (
    <SelectMenu
      ariaLabel={label}
      label="请选择节点"
      value={choices.find((choice) => choice.id === (value || ""))?.label || ""}
      options={choices.map((choice) => choice.label)}
      onChange={(selected) =>
        onChange(
          choices.find((choice) => choice.label === selected)?.id || null,
        )
      }
    />
  );
}

function ReviewEditor({ item, pages, onChange, close, save, error }) {
  const nodes = [
    ...(pages.find((page) => page.id === item.pageId)?.nodes || []),
    ...item.changes
      .filter((c) => c.kind === "node" && !c.before && c.after)
      .map((c) => ({ id: c.id, ...c.after })),
  ];
  const labels = {
    label: "名称",
    subtitle: "副标题",
    summary: "本图备注",
    parentId: "上级节点",
    source: "起点节点",
    target: "终点节点",
  };
  return (
    <Modal
      open
      close={close}
      title="修改审核建议"
      size="lg"
      description="只修改本项建议并更新预览；确认采纳后才改变正式图页。"
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button tone="primary" onClick={save}>
            更新建议预览
          </Button>
        </>
      }
    >
      <div className="s4-form-grid">
        {item.changes
          .filter((c) => c.after)
          .flatMap((c) =>
            c.keys
              .filter((key) => Object.hasOwn(labels, key))
              .map((key) => (
                <FormField
                  key={`${c.id}:${key}`}
                  span={2}
                  label={`${c.after.label || nodes.find((node) => node.id === c.id)?.label || "当前关系"} · ${labels[key]}`}
                >
                  {["parentId", "source", "target"].includes(key) ? (
                    <ReviewNodeSelect
                      label={labels[key]}
                      value={c.after[key]}
                      nodes={nodes}
                      exclude={c.id}
                      optional={key === "parentId"}
                      onChange={(value) =>
                        onChange(
                          editReview(item, {
                            id: c.id,
                            field: key,
                            value: value || null,
                          }),
                        )
                      }
                    />
                  ) : key === "summary" ? (
                    <TextArea
                      value={c.after[key]}
                      onChange={(value) =>
                        onChange(
                          editReview(item, { id: c.id, field: key, value }),
                        )
                      }
                    />
                  ) : (
                    <TextInput
                      value={c.after[key]}
                      maxLength={120}
                      onChange={(value) =>
                        onChange(
                          editReview(item, { id: c.id, field: key, value }),
                        )
                      }
                    />
                  )}
                </FormField>
              )),
          )}
        {!item.changes.some((c) => c.after) ? (
          <p>
            本项建议仅移除显示的本图关系，不修改原始资产。若不希望移除，请取消修改并拒绝建议。
          </p>
        ) : null}
      </div>
      {error ? (
        <StateBanner tone="danger" title="建议尚未更新" description={error} />
      ) : null}
    </Modal>
  );
}

export function GraphReviewWorkspace({
  pages,
  reviewItems,
  session,
  onLocate,
  onResolve,
  onSaveSuggestion,
  EvidencePreview,
  limited = false,
  scenario = "",
}) {
  const [filter, setFilter] = useState(session.current.filter || "pending");
  const [selectedId, setSelectedId] = useState(session.current.selectedId);
  const [evidence, setEvidence] = useState(null);
  const [editing, setEditing] = useState(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const timer = useRef(null),
    working = useRef(false),
    failed = useRef(new Set()),
    cameraApi = useRef(null);
  const { isFullscreen, toggleFullscreen } = useCanvasFullscreen();
  const pending = reviewItems.filter((item) => item.state === "pending");
  const visibleItems =
    filter === "pending"
      ? pending
      : reviewItems.filter((item) => item.state !== "pending");
  const selected =
    visibleItems.find((item) => item.id === selectedId) || visibleItems[0];
  const displayed = editing || selected;
  const condition = selected ? reviewCondition(pages, selected) : null;
  const rows = displayed ? reviewRows(pages, displayed) : [];
  useEffect(() => {
    session.current.selectedId = selected?.id;
    setError("");
    setExpanded(Boolean(session.current.views[selected?.id]?.expanded));
  }, [selected?.id]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!editing || JSON.stringify(editing) === JSON.stringify(selected))
      return;
    const preventLoss = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", preventLoss);
    return () => window.removeEventListener("beforeunload", preventLoss);
  }, [editing, selected]);
  const closeEditor = () => {
    if (JSON.stringify(editing) !== JSON.stringify(selected))
      setDiscardOpen(true);
    else {
      setEditing(null);
      setError("");
    }
  };
  const saveEditor = () => {
    try {
      validateReview(pages, editing);
      onSaveSuggestion(editing);
      setEditing(null);
      setError("");
    } catch (failure) {
      setError(failure.message);
    }
  };
  const resolve = (action) => {
    if (working.current || limited) return;
    working.current = true;
    setBusy(true);
    setError("");
    const id = selected.id;
    timer.current = setTimeout(() => {
      try {
        if (scenario === "fail" && !failed.current.has(id)) {
          failed.current.add(id);
          throw new Error("本次模拟保存失败，建议和正式内容均保留，请重试。");
        }
        onResolve(id, action);
      } catch (failure) {
        setError(failure.message);
      } finally {
        working.current = false;
        setBusy(false);
      }
    }, 300);
  };
  const recheck = () => {
    try {
      onSaveSuggestion(rebaseReview(pages, selected));
      setError("");
    } catch (failure) {
      setError(failure.message);
    }
  };
  return (
    <>
      <p className="s2-research-prototype-note">
        【原型说明，正式实现不展示】本地虚构审核样例；采纳和处理记录仅保存在本浏览器，不请求后端，不修改真实资产。
        {scenario
          ? ` 当前验收场景：${{ fail: "保存失败后重试", conflict: "相关内容已变化", unrelated: "无关布局已变化", already: "建议已实现", missing: "目标已移除" }[scenario] || scenario}。`
          : ""}
      </p>
      <section
        className={`tg-review-workspace ${isFullscreen ? "is-fullscreen" : ""}`}
        aria-label="图谱变更审核"
      >
        <aside className="tg-review-list">
          <header>
            <h2>待处理事项</h2>
            <StatusBadge tone="warning">{pending.length}</StatusBadge>
          </header>
          <DetailTabs
            tabs={[
              { value: "pending", label: "待审核", count: pending.length },
              {
                value: "processed",
                label: "已处理",
                count: reviewItems.length - pending.length,
              },
            ]}
            value={filter}
            onChange={(value) => {
              setFilter(value);
              session.current.filter = value;
              setSelectedId(null);
            }}
          />
          {visibleItems.map((item) => (
            <button
              type="button"
              key={item.id}
              className={selected?.id === item.id ? "is-active" : ""}
              disabled={busy}
              onClick={() => setSelectedId(item.id)}
            >
              <span>
                <small>
                  {item.type} ·{" "}
                  {pages.find((page) => page.id === item.pageId)?.name ||
                    "图页已移除"}
                </small>
                <b>{item.title}</b>
                <p>{item.summary}</p>
                {filter === "processed" ? (
                  <StatusBadge>{reviewStateLabel[item.state]}</StatusBadge>
                ) : null}
              </span>
              <Icon name="chevronRight" />
            </button>
          ))}
        </aside>
        {selected ? (
          <>
            <ReviewCanvas
              key={selected.id}
              pages={pages}
              item={displayed}
              session={session}
              cameraApi={cameraApi}
              expanded={expanded}
              setExpanded={setExpanded}
              fullscreen={isFullscreen}
              onFullscreen={toggleFullscreen}
            />
            <aside className="tg-review-detail">
              <header>
                <StatusBadge
                  tone={selected.state === "pending" ? "warning" : "neutral"}
                >
                  {reviewStateLabel[selected.state]}
                </StatusBadge>
                <h2>{selected.title}</h2>
                <p>{selected.summary}</p>
              </header>
              <section>
                <h3>AI 建议</h3>
                <p>{displayed.suggestion}</p>
              </section>
              <section>
                <h3>本项变化</h3>
                <div className="tg-review-diff">
                  {rows.map((row, i) => (
                    <div key={i}>
                      <StatusBadge
                        tone={
                          changeAction(row.change) === "remove"
                            ? "warning"
                            : "info"
                        }
                      >
                        {reviewDeltaLabel[changeAction(row.change)]}
                      </StatusBadge>
                      <b>
                        {row.label} · {row.field}
                      </b>
                      <dl>
                        <div>
                          <dt>{selected.state === "pending" ? "当前内容" : "建议原依据"}</dt>
                          <dd>{row.current}</dd>
                        </div>
                        <div>
                          <dt>{selected.state === "accepted" ? "采纳内容" : "建议内容"}</dt>
                          <dd>{row.proposed}</dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h3>影响范围</h3>
                <p>
                  仅当前图页的本项变化及列出的必要依赖。不修改候选人或公司等原始资产，不保存审核预览的节点位置。
                </p>
                <div className="tg-review-original-action">
                  <Button
                    icon="external"
                    onClick={() => onLocate(selected.pageId, selected.nodeId)}
                  >
                    查看原图
                  </Button>
                </div>
              </section>
              {selected.foundBy ? (
                <section>
                  <h3>发现于</h3>
                  <a
                    href={`#${selected.foundBy.route}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {selected.foundBy.label}
                  </a>
                </section>
              ) : null}
              <section>
                <h3>来源证据</h3>
                {selected.evidence.length ? (
                  selected.evidence.map((name) => (
                    <button
                      type="button"
                      key={name}
                      onClick={() => setEvidence(name)}
                    >
                      {name}
                      <Icon name="chevronRight" />
                    </button>
                  ))
                ) : (
                  <p>未提供来源证据，不能据此确认身份或任职。</p>
                )}
              </section>
              {selected.state === "pending" && condition.state !== "ready" ? (
                <StateBanner
                  tone="warning"
                  title={
                    condition.state === "already"
                      ? "无需重复处理"
                      : "需要重新核对"
                  }
                  description={condition.message}
                />
              ) : null}
              {selected.state !== "pending" ? (
                <section>
                  <h3>处理记录</h3>
                  <p>{selected.result}</p>
                  <p>
                    {new Date(selected.processedAt).toLocaleString("zh-CN", {
                      timeZone: "Asia/Shanghai",
                    })}
                  </p>
                </section>
              ) : null}
              {error && !editing ? (
                <StateBanner
                  tone="danger"
                  title="本项尚未处理成功"
                  description={error}
                />
              ) : null}
              {limited ? (
                <StateBanner
                  tone="warning"
                  title="暂无权限处理审核项"
                  description="可查看建议与证据，不能修改或采纳。"
                />
              ) : null}
              {selected.state === "pending" ? (
                <footer>
                  <Button
                    disabled={busy || limited}
                    onClick={() => resolve("reject")}
                  >
                    拒绝建议
                  </Button>
                  <Button
                    disabled={busy || limited}
                    onClick={() => {
                      setError("");
                      setEditing(structuredClone(selected));
                    }}
                  >
                    修改建议
                  </Button>
                  {condition.state === "conflict" ? (
                    <Button disabled={busy || limited} onClick={recheck}>
                      已核对最新内容
                    </Button>
                  ) : null}
                  <Button
                    tone="primary"
                    disabled={
                      busy ||
                      limited ||
                      !["ready", "already"].includes(condition.state)
                    }
                    onClick={() =>
                      resolve(
                        condition.state === "already" ? "already" : "accept",
                      )
                    }
                  >
                    {busy
                      ? "正在保存…"
                      : condition.state === "already"
                        ? "记录为无需重复处理"
                        : selected.actionLabel}
                  </Button>
                </footer>
              ) : null}
            </aside>
          </>
        ) : (
          <div className="tg-review-empty">
            <Icon name="check" />
            <h2>
              {filter === "pending" ? "当前没有待审核事项" : "暂无处理记录"}
            </h2>
            <p>
              {filter === "pending"
                ? "已处理的建议可以在左侧“已处理”中查看。"
                : "采纳或拒绝建议后，处理记录会保留在这里。"}
            </p>
          </div>
        )}
      </section>
      {editing ? (
        <ReviewEditor
          item={editing}
          pages={pages}
          onChange={setEditing}
          close={closeEditor}
          save={saveEditor}
          error={error}
        />
      ) : null}
      <Modal
        open={discardOpen}
        close={() => setDiscardOpen(false)}
        title="放弃未保存的修改？"
        description="正式图页未改变。继续编辑可保留当前输入，放弃则恢复原建议。"
        footer={
          <>
            <Button onClick={() => setDiscardOpen(false)}>继续编辑</Button>
            <Button
              tone="primary"
              onClick={() => {
                setDiscardOpen(false);
                setEditing(null);
                setError("");
              }}
            >
              放弃修改
            </Button>
          </>
        }
      />
      <EvidencePreview evidence={evidence} close={() => setEvidence(null)} />
    </>
  );
}
