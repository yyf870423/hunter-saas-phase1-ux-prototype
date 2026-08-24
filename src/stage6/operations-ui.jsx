import { useMemo, useState } from "react";
import { Icon } from "../components/Icon";
import {
  Button,
  EmptyState,
  IconButton,
  Skeleton,
  StatusBadge,
} from "../stage1/ui";
import { DatePicker, SelectMenu } from "../stage4/asset-ui";

export const statusTone = (value = "") => {
  if (/正常|成功|完成|已验证|已批准|已支付|已解决|已解析|低/.test(value))
    return "success";
  if (/失败|异常|不可用|损坏|高|拒绝/.test(value)) return "danger";
  if (/关注|处理|降级|到期|耗尽|超时|调查|暂缓|中|需/.test(value))
    return "warning";
  if (/运行|等待|观察|试用/.test(value)) return "info";
  return "neutral";
};

export function OpsPageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="ops-page-header">
      <div>
        {eyebrow ? <span>{eyebrow}</span> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="ops-page-actions">{actions}</div> : null}
    </header>
  );
}

export function OpsTabs({ items, value, onChange, label = "页面内容" }) {
  return (
    <div className="ops-tabs" role="tablist" aria-label={label}>
      {items.map((item) => (
        <button
          type="button"
          role="tab"
          aria-selected={value === item.value}
          className={value === item.value ? "is-active" : ""}
          key={item.value}
          onClick={() => onChange(item.value)}
        >
          <span>{item.label}</span>
          {item.count !== undefined ? <em>{item.count}</em> : null}
        </button>
      ))}
    </div>
  );
}

export function OpsMetric({ item, onClick }) {
  const max = Math.max(...item.points);
  const min = Math.min(...item.points);
  const coordinates = item.points
    .map((point, index) => {
      const x = (index / (item.points.length - 1)) * 100;
      const y = 36 - ((point - min) / Math.max(max - min, 1)) * 28;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <button type="button" className="ops-metric" onClick={onClick}>
      <span className="ops-metric-label">
        {item.label}
        <Icon name="chevronRight" />
      </span>
      <strong>{item.value}</strong>
      <span className={`ops-metric-delta is-${item.tone}`}>{item.delta}</span>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
        <polyline points={coordinates} />
      </svg>
      <small>{item.note}</small>
    </button>
  );
}

export function OpsSection({
  title,
  description,
  action,
  children,
  className = "",
}) {
  return (
    <section className={`ops-section ${className}`.trim()}>
      <header>
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {action}
      </header>
      <div className="ops-section-body">{children}</div>
    </section>
  );
}

export function OpsFilterBar({
  query,
  onQuery,
  placeholder = "搜索",
  filters = [],
  date,
  onDate,
  children,
}) {
  return (
    <div className="ops-filter-bar">
      <label className="ops-search">
        <Icon name="search" />
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder={placeholder}
        />
        {query ? (
          <button
            type="button"
            aria-label="清空搜索"
            onClick={() => onQuery("")}
          >
            <Icon name="close" />
          </button>
        ) : null}
      </label>
      <div className="ops-filter-controls">
        {filters.map((filter) => {
          const hasValue = filter.multiple
            ? Boolean(filter.value?.length)
            : Boolean(filter.value);
          return (
            <div className="ops-filter-select" key={filter.label}>
              <SelectMenu
                label={filter.label}
                value={filter.value}
                onChange={filter.onChange}
                options={filter.options}
                multiple={filter.multiple}
                searchable={filter.searchable}
              />
              {hasValue ? (
                <IconButton
                  icon="close"
                  label={`清空${filter.label}`}
                  onClick={() => filter.onChange(filter.multiple ? [] : "")}
                />
              ) : null}
            </div>
          );
        })}
        {onDate ? (
          <DatePicker
            label="时间范围"
            value={date}
            onChange={onDate}
            mode="month-range"
            initialYear={2026}
          />
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function OpsTable({ columns, rows, onRow, emptyTitle = "暂无数据" }) {
  if (!rows.length) {
    return (
      <EmptyState
        icon="search"
        title={emptyTitle}
        description="调整搜索或筛选条件后再试。"
      />
    );
  }
  return (
    <div className="ops-table-wrap">
      <table className="ops-table">
        <colgroup>
          {columns.map((column) => (
            <col
              key={column.key}
              style={column.width ? { width: column.width } : undefined}
            />
          ))}
          {onRow ? <col style={{ width: 48 }} /> : null}
        </colgroup>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            {onRow ? <th aria-label="操作" /> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column, index) => (
                <td key={column.key} data-label={column.label}>
                  <button
                    type="button"
                    className={index === 0 ? "is-primary" : ""}
                    disabled={!onRow}
                    onClick={() => onRow?.(row)}
                  >
                    {column.render
                      ? column.render(row)
                      : row[column.key] || "—"}
                  </button>
                </td>
              ))}
              {onRow ? (
                <td className="ops-table-open">
                  <IconButton
                    icon="chevronRight"
                    label={`查看${row.name || row.id}`}
                    onClick={() => onRow(row)}
                  />
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OpsPagination({ page, pages, onChange, total }) {
  return (
    <footer className="ops-pagination">
      <span>共 {total} 条</span>
      <div>
        <IconButton
          icon="chevronLeft"
          label="上一页"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        />
        {Array.from({ length: pages }, (_, index) => index + 1).map((item) => (
          <button
            type="button"
            className={item === page ? "is-active" : ""}
            key={item}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        ))}
        <IconButton
          icon="chevronRight"
          label="下一页"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        />
      </div>
      <span>每页 20 条</span>
    </footer>
  );
}

export function OpsDefinitionList({ items, columns = 2 }) {
  return (
    <dl className={`ops-definition ops-definition-${columns}`}>
      {items.map(([label, value, content]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{content || value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function OpsTimeline({ items }) {
  return (
    <ol className="ops-timeline">
      {items.map((item, index) => (
        <li
          className={item.tone ? `is-${item.tone}` : ""}
          key={`${item.title}-${index}`}
        >
          <i />
          <div>
            <b>{item.title}</b>
            <span>{item.meta}</span>
            {item.detail ? <p>{item.detail}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function OpsState({ state, label, onRetry, children }) {
  if (!state || state === "normal") return children;
  if (state === "loading") {
    return (
      <div className="ops-loading" aria-label={`${label}正在加载`}>
        <Skeleton className="ops-loading-title" />
        <div className="ops-loading-grid">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} />
          ))}
        </div>
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton className="ops-loading-row" key={index} />
        ))}
      </div>
    );
  }
  if (state === "empty") {
    return (
      <EmptyState
        icon="check"
        title={`暂无${label}`}
        description="当前没有需要处理的内容。"
      />
    );
  }
  if (state === "error") {
    return (
      <EmptyState
        icon="warning"
        title={`${label}加载失败`}
        description="其他模块仍可使用。请检查连接后重试。"
        action={
          <Button icon="refresh" onClick={onRetry}>
            重新加载
          </Button>
        }
      />
    );
  }
  if (state === "limited") {
    return (
      <EmptyState
        icon="lock"
        title="当前角色无权执行此操作"
        description="你可以查看脱敏状态，但只有系统管理员可以修改此配置。"
      />
    );
  }
  return children;
}

export function OpsInlineState({
  tone = "info",
  icon = "info",
  title,
  description,
  action,
}) {
  return (
    <div className={`ops-inline-state is-${tone}`}>
      <i>
        <Icon name={icon} />
      </i>
      <div>
        <b>{title}</b>
        <span>{description}</span>
      </div>
      {action}
    </div>
  );
}

export function OpsStatus({ children, tone }) {
  return (
    <StatusBadge tone={tone || statusTone(children)}>{children}</StatusBadge>
  );
}

export function useOpsList(items, fields, pageSize = 20) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) =>
      fields.some((field) =>
        String(item[field] || "")
          .toLowerCase()
          .includes(normalized),
      ),
    );
  }, [fields, items, query]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  return {
    query,
    setQuery: (value) => {
      setQuery(value);
      setPage(1);
    },
    page,
    setPage,
    pages,
    filtered,
    visible,
  };
}
