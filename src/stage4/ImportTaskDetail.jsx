import { Fragment, useEffect, useId, useState } from "react";
import { Icon } from "../components/Icon";
import { EmptyState, SearchField } from "../stage1/ui";
import {
  Button,
  Modal,
  Pagination,
  ProgressBar,
  StateBanner,
  StatusBadge,
  Tabs,
} from "./asset-ui";
import {
  filterImportItems,
  importCounts,
  importFailureCsv,
  importItemStates,
} from "./import-task-details";
import "./import-task-detail.css";

function ItemDetail({ item }) {
  return (
    <div className="s4-import-item-detail">
      <dl>
        <div>
          <dt>原始位置</dt>
          <dd>{item.source}</dd>
        </div>
        <div>
          <dt>
            {item.status === "failed"
              ? "失败原因"
              : item.status === "processing" || item.status === "queued"
                ? "当前步骤"
                : "处理说明"}
          </dt>
          <dd>{item.reason}</dd>
        </div>
        <div>
          <dt>下一步</dt>
          <dd>{item.suggestion}</dd>
        </div>
        <div>
          <dt>最近更新</dt>
          <dd>{item.updatedAt}</dd>
        </div>
      </dl>
      {item.asset ? (
        <a
          className="s4-import-asset-link"
          href={`${import.meta.env.BASE_URL}#${item.asset.path}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          查看资产：{item.asset.label}
          <Icon name="external" />
        </a>
      ) : null}
    </div>
  );
}

export function ImportTaskDetail({
  task,
  taskId,
  close,
  onRefresh,
  onRetry,
  onOpenTask,
  view = "ready",
}) {
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [readState, setReadState] = useState(
    ["loading", "error", "restricted"].includes(view) ? view : "ready",
  );
  const [retryConfirm, setRetryConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const regionId = useId();
  useEffect(() => {
    if (readState !== "loading") return undefined;
    const timer = window.setTimeout(() => setReadState("ready"), 600);
    return () => window.clearTimeout(timer);
  }, [readState]);
  useEffect(() => {
    setPage(1);
    setExpanded(null);
  }, [query, status]);
  const counts = task ? importCounts(task) : null;
  const filtered = task ? filterImportItems(task.items, status, query) : [];
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, pages);
  const rows = filtered.slice((currentPage - 1) * 10, currentPage * 10);
  const retryable =
    task?.items.filter((item) => item.status === "failed" && item.retryable)
      .length || 0;
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([importFailureCsv(task)], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${task.id}-失败明细.csv`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const refresh = () => {
    setBusy(true);
    window.setTimeout(() => {
      onRefresh(task);
      setBusy(false);
    }, 450);
  };
  const accessible = readState === "ready" && Boolean(task);
  return (
    <Modal
      open
      close={close}
      size="xl"
      title={accessible ? task.name : "导入任务详情"}
      description={accessible ? task.file : undefined}
      footer={<Button onClick={close}>关闭</Button>}
    >
      <div className="s4-import-task-detail">
        {readState === "loading" ? (
          <div className="s4-import-read-state" role="status">
            <span className="s1-spinner" />
            <p>正在读取导入明细…</p>
          </div>
        ) : readState === "error" ? (
          <StateBanner
            tone="danger"
            icon="warning"
            title="导入明细读取失败"
            description="暂时无法获取状态。任务不会因此停止，请稍后重新加载。"
            action={
              <Button icon="refresh" onClick={() => setReadState("loading")}>
                重新加载
              </Button>
            }
          />
        ) : readState === "restricted" ? (
          <StateBanner
            tone="warning"
            icon="lock"
            title="无权查看此导入任务"
            description="请联系工作空间管理员确认访问权限。"
          />
        ) : !task ? (
          <StateBanner
            tone="warning"
            title="找不到导入任务"
            description={`此任务不存在或已不可访问（${taskId}）。请返回导入记录选择其他任务。`}
          />
        ) : (
          <>
            <p className="s4-import-prototype-note">
              【原型说明，正式实现不展示】本地虚构数据；刷新模拟进度，不上传文件或写入业务库。
            </p>
            <div className="s4-import-task-meta">
              <StatusBadge
              tone={
                task.fileError ? "danger" : counts.active
                    ? "info"
                    : counts.failed || counts.pending || task.fileError
                      ? "warning"
                      : "success"
                }
              >
                {task.status}
              </StatusBadge>
              <span>
                {task.type} · 按{task.unit}计数
              </span>
              <span>创建：{task.createdAt}</span>
              <span>更新：{task.updatedAt}</span>
            </div>
            {task.parentId ? (
              <p className="s4-import-task-parent">
                本任务只重试可恢复的失败项。
                <Button size="sm" onClick={() => onOpenTask(task.parentId)}>
                  查看原任务
                </Button>
              </p>
            ) : null}
            {task.fileError ? (
              <>
                <StateBanner
                  tone="danger"
                  icon="warning"
                  title={task.fileError.reason}
                  description={`${task.fileError.location}；${task.fileError.suggestion}`}
                />
                <p className="s4-import-muted">
                  校验未通过，未进入逐项导入；总条目数尚未确认，没有可展示的逐项处理结果。
                </p>
                <Button icon="download" onClick={download}>
                  下载错误报告
                </Button>
              </>
            ) : (
              <>
                <section
                  className="s4-import-task-progress"
                  aria-label="任务处理进度"
                >
                  <ProgressBar
                    value={task.progress}
                    label={`已处理 ${counts.handled} / ${counts.all} ${task.unit}`}
                  />
                  <p>
                    {counts.processing} 项正在处理 · {counts.queued} 项排队 ·
                    成功 {counts.success} · 失败 {counts.failed} · 待确认{" "}
                    {counts.pending} · 已跳过 {counts.skipped}
                  </p>
                </section>
                <div className="s4-import-items-toolbar">
                  <SearchField
                    value={query}
                    onChange={setQuery}
                    placeholder="搜索名称、文件名、行号或原因"
                  />
                  <div className="s4-import-items-actions">
                    <Button
                      icon="refresh"
                      size="sm"
                      loading={busy}
                      onClick={refresh}
                    >
                      刷新状态
                    </Button>
                    {counts.failed ? (
                      <Button icon="download" size="sm" onClick={download}>
                        下载失败明细
                      </Button>
                    ) : null}
                    {retryable && !task.retryTaskId ? (
                      <Button
                        icon="refresh"
                        size="sm"
                        onClick={() => setRetryConfirm(true)}
                      >
                        重试可恢复项（{retryable}）
                      </Button>
                    ) : null}
                  </div>
                </div>
                {retryConfirm && !task.retryTaskId ? (
                  <StateBanner
                    tone="warning"
                    title={`仅重试 ${retryable} 项临时错误？`}
                    description="生成新任务，保留本次结果。需修正原文件的失败项、成功项和待确认项不会被重复导入。"
                    action={
                      <div className="s4-import-items-actions">
                        <Button
                          size="sm"
                          onClick={() => setRetryConfirm(false)}
                        >
                          取消
                        </Button>
                        <Button
                          size="sm"
                          tone="primary"
                          onClick={() => {
                            onRetry(task);
                            setRetryConfirm(false);
                          }}
                        >
                          确认重试
                        </Button>
                      </div>
                    }
                  />
                ) : null}
                {task.retryTaskId ? (
                  <StateBanner
                    title="已创建失败项重试任务"
                    description="原失败记录保留，请在新任务中查看重试进度。"
                    action={
                      <Button
                        size="sm"
                        onClick={() => onOpenTask(task.retryTaskId)}
                      >
                        查看重试任务
                      </Button>
                    }
                  />
                ) : null}
                <div className="s4-import-status-tabs">
                  <Tabs
                    label="导入明细状态"
                    value={status}
                    onChange={setStatus}
                    items={[
                      { value: "all", label: "全部", count: counts.all },
                      {
                        value: "active",
                        label: "处理中",
                        count: counts.active,
                      },
                      {
                        value: "success",
                        label: "成功",
                        count: counts.success,
                      },
                      { value: "failed", label: "失败", count: counts.failed },
                      {
                        value: "pending",
                        label: "待确认",
                        count: counts.pending,
                      },
                      {
                        value: "skipped",
                        label: "已跳过",
                        count: counts.skipped,
                      },
                    ]}
                  />
                </div>
                {rows.length ? (
                  <div className="s4-import-items-scroll">
                    <table className="s4-data-table s4-import-items-table">
                      <thead>
                        <tr>
                          <th scope="col">导入条目</th>
                          <th scope="col">原始位置</th>
                          <th scope="col">状态</th>
                          <th scope="col">当前步骤 / 处理结果</th>
                          <th scope="col">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((item) => {
                          const state = importItemStates[item.status];
                          const isOpen = expanded === item.id;
                          return (
                            <Fragment key={item.id}>
                              <tr
                                data-import-item={item.id}
                                className={isOpen ? "is-expanded" : ""}
                              >
                                <td data-label="导入条目">
                                  <strong>{item.name}</strong>
                                </td>
                                <td data-label="原始位置">{item.source}</td>
                                <td data-label="状态">
                                  <StatusBadge tone={state.tone}>
                                    {state.label}
                                  </StatusBadge>
                                </td>
                                <td data-label="当前步骤 / 处理结果">
                                  <span>{item.reason}</span>
                                  {item.retryable ? (
                                    <small>可直接重试</small>
                                  ) : null}
                                </td>
                                <td data-label="操作">
                                  <Button
                                    size="sm"
                                    icon={isOpen ? "chevronUp" : "chevronDown"}
                                    aria-label={`${isOpen ? "收起" : "查看"}${item.name}的明细`}
                                    aria-expanded={isOpen}
                                    aria-controls={`${regionId}-${item.id}`}
                                    onClick={() =>
                                      setExpanded(isOpen ? null : item.id)
                                    }
                                  >
                                    详情
                                  </Button>
                                </td>
                              </tr>
                              {isOpen ? (
                                <tr className="s4-import-expanded-row">
                                  <td colSpan={5}>
                                    <section
                                      id={`${regionId}-${item.id}`}
                                      aria-label={`${item.name}的处理明细`}
                                    >
                                      <ItemDetail item={item} />
                                    </section>
                                  </td>
                                </tr>
                              ) : null}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    icon="search"
                    title="没有符合条件的导入条目"
                    description="调整状态或搜索词后再试。"
                    action={
                      <Button
                        onClick={() => {
                          setQuery("");
                          setStatus("all");
                        }}
                      >
                        清除筛选
                      </Button>
                    }
                  />
                )}
                <Pagination
                  page={currentPage}
                  pages={pages}
                  pageSize={10}
                  total={filtered.length}
                  onChange={(next) => {
                    setPage(next);
                    setExpanded(null);
                  }}
                />
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
