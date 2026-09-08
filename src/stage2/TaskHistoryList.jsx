import { EmptyState, IconButton, StatusBadge, useToast } from "../stage1/ui";
import { TooltipText } from "../stage4/asset-ui";
import { saveTaskPin } from "./task-pin-store";

export function TaskPinButton({ item }) {
  const notify = useToast();
  const action = item.pinned ? "取消置顶" : "置顶任务";
  return (
    <TooltipText
      className={`s2-task-pin ${item.pinned ? "is-pinned" : ""}`}
      tip={action}
      trigger="always"
    >
      <IconButton
        icon="pin"
        label={`${action}：${item.title}`}
        aria-pressed={item.pinned}
        onClick={() => {
          if (saveTaskPin(item.id, !item.pinned))
            notify(item.pinned ? "已取消置顶" : "任务已置顶", "success");
          else notify("无法保存置顶设置，请重试", "error");
        }}
      />
    </TooltipText>
  );
}

export function TaskHistoryList({
  items,
  currentId,
  onSelect,
  query,
  archived,
}) {
  if (!items.length)
    return (
      <EmptyState
        compact
        icon="task"
        title={
          query.trim()
            ? "没有匹配的任务"
            : archived
              ? "暂无已归档任务"
              : "暂无任务"
        }
      />
    );
  return (
    <div className="s2-history-list">
      {items.map((item) => (
        <div className="s2-history-entry" data-task-id={item.id} key={item.id}>
          <button
            type="button"
            className={`s2-history-item ${item.id === currentId ? "is-active" : ""}`}
            onClick={() => onSelect(item)}
          >
            <span className="s2-history-copy">
              <small>
                <span className="s2-history-scenes">
                  {(item.scenarios || [item.scenario || item.type])
                    .slice(0, 2)
                    .map((scene) => (
                      <em key={scene}>{scene}</em>
                    ))}
                </span>
              </small>
              <b>{item.title}</b>
              <em>{item.object}</em>
            </span>
            {["运行中", "等待用户", "等待外部", "错误"].includes(
              item.status,
            ) ? (
              <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
            ) : null}
            <time>{item.time}</time>
          </button>
          <TaskPinButton item={item} />
        </div>
      ))}
    </div>
  );
}
