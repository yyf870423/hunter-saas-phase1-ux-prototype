import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import {
  Button,
  EmptyState,
  IconButton,
  Modal,
  SearchField,
  Skeleton,
  StatusBadge,
  Tabs,
  useToast,
} from "../stage1/ui";

export function AssetPageHeader({
  eyebrow = "业务资产",
  title,
  description,
  count,
  primaryLabel,
  primaryIcon = "plus",
  onPrimary,
  actions,
}) {
  return (
    <header className="s4-page-header">
      <div>
        <small>{eyebrow}</small>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="s4-page-actions">
        {count !== undefined ? (
          <span className="s4-result-count">{count} 条</span>
        ) : null}
        {actions}
        {primaryLabel ? (
          <Button tone="primary" icon={primaryIcon} onClick={onPrimary}>
            {primaryLabel}
          </Button>
        ) : null}
      </div>
    </header>
  );
}

export function CustomCheckbox({ checked, onChange, label, disabled = false }) {
  const [draftChecked, setDraftChecked] = useState(Boolean(checked));
  useEffect(() => setDraftChecked(Boolean(checked)), [checked]);
  const toggle = () => {
    const next = !draftChecked;
    setDraftChecked(next);
    onChange?.(next);
  };
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={draftChecked}
      className={`s4-checkbox ${draftChecked ? "is-checked" : ""}`}
      disabled={disabled}
      onClick={toggle}
    >
      <i>{draftChecked ? <Icon name="check" /> : null}</i>
      {label ? <span>{label}</span> : null}
    </button>
  );
}

export function CustomRadio({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) {
  const [draftChecked, setDraftChecked] = useState(Boolean(checked));
  useEffect(() => setDraftChecked(Boolean(checked)), [checked]);
  return (
    <button
      type="button"
      role="radio"
      aria-checked={draftChecked}
      className={`s4-radio ${draftChecked ? "is-checked" : ""}`}
      disabled={disabled}
      onClick={() => {
        setDraftChecked(true);
        onChange?.();
      }}
    >
      <i>
        <span />
      </i>
      <span>
        <b>{label}</b>
        {description ? <small>{description}</small> : null}
      </span>
    </button>
  );
}

export function FloatingPanel({
  open,
  anchorRef,
  panelRef,
  className,
  width = 240,
  align = "start",
  children,
}) {
  const [style, setStyle] = useState(null);
  useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      setStyle(null);
      return undefined;
    }
    const update = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      const viewportPadding = 8;
      const gap = 6;
      const resolvedWidth = Math.min(
        Math.max(width, rect.width),
        window.innerWidth - viewportPadding * 2,
      );
      const preferredLeft =
        align === "end" ? rect.right - resolvedWidth : rect.left;
      const left = Math.min(
        Math.max(viewportPadding, preferredLeft),
        window.innerWidth - resolvedWidth - viewportPadding,
      );
      const below = window.innerHeight - rect.bottom - viewportPadding;
      const above = rect.top - viewportPadding;
      const openUpward = below < 260 && above > below;
      const maxHeight = Math.max(180, (openUpward ? above : below) - gap);
      setStyle({
        position: "fixed",
        left,
        right: "auto",
        top: openUpward ? "auto" : rect.bottom + gap,
        bottom: openUpward ? window.innerHeight - rect.top + gap : "auto",
        width: resolvedWidth,
        maxHeight,
        zIndex: 220,
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [align, anchorRef, open, width]);
  if (!open || !style) return null;
  return createPortal(
    <div
      ref={panelRef}
      className={`${className} s4-floating-panel`}
      style={style}
    >
      {children}
    </div>,
    document.body,
  );
}

export function SelectMenu({
  label,
  value,
  options,
  onChange,
  multiple = false,
  searchable = false,
  creatable = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draftValue, setDraftValue] = useState(value ?? (multiple ? [] : ""));
  const ref = useRef(null);
  const panelRef = useRef(null);
  const valueKey = JSON.stringify(value ?? (multiple ? [] : ""));
  useEffect(
    () => setDraftValue(value ?? (multiple ? [] : "")),
    [multiple, valueKey],
  );
  const values = multiple ? draftValue || [] : draftValue ? [draftValue] : [];
  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (
        !ref.current?.contains(event.target) &&
        !panelRef.current?.contains(event.target)
      )
        setOpen(false);
    };
    const escape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  const visible = options.filter((option) =>
    option.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const display = values.length
    ? multiple
      ? `${label} · ${values.length}`
      : values[0]
    : label;
  const choose = (option) => {
    if (multiple) {
      const next = values.includes(option)
        ? values.filter((item) => item !== option)
        : [...values, option];
      setDraftValue(next);
      onChange?.(next);
      return;
    }
    setDraftValue(option);
    onChange?.(option);
    setOpen(false);
  };
  return (
    <div
      className={`s4-select ${open ? "is-open" : ""} ${className}`}
      ref={ref}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{display}</span>
        <Icon name={open ? "chevronUp" : "chevronDown"} />
      </button>
      <FloatingPanel
        open={open}
        anchorRef={ref}
        panelRef={panelRef}
        className="s4-select-panel"
        width={260}
      >
        {searchable ? (
          <label className="s4-select-search">
            <Icon name="search" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  creatable &&
                  query.trim() &&
                  !values.includes(query.trim())
                ) {
                  event.preventDefault();
                  choose(query.trim());
                  setQuery("");
                }
              }}
              placeholder={
                creatable ? `输入${label}后按 Enter 添加` : `搜索${label}`
              }
              autoFocus
            />
          </label>
        ) : null}
        {creatable && query.trim() && !visible.includes(query.trim()) ? (
          <div className="s4-select-create-hint">
            按 Enter 添加“{query.trim()}”
          </div>
        ) : null}
        <div className="s4-select-options">
          {visible.map((option) => (
            <button
              type="button"
              className={values.includes(option) ? "is-selected" : ""}
              key={option}
              onClick={() => choose(option)}
            >
              {multiple ? (
                <span className="s4-option-check">
                  {values.includes(option) ? <Icon name="check" /> : null}
                </span>
              ) : null}
              <span>{option}</span>
              {!multiple && values.includes(option) ? (
                <Icon name="check" />
              ) : null}
            </button>
          ))}
        </div>
        {multiple ? (
          <footer>
            <span>已选 {values.length} 项</span>
            <button
              type="button"
              disabled={!values.length}
              onClick={() => {
                setDraftValue([]);
                onChange?.([]);
              }}
            >
              清空
            </button>
          </footer>
        ) : null}
      </FloatingPanel>
    </div>
  );
}

export function FilterBar({
  query,
  setQuery,
  placeholder,
  filters = [],
  trailing,
}) {
  return (
    <section className="s4-filter-bar">
      <SearchField
        value={query}
        onChange={setQuery}
        placeholder={placeholder}
      />
      <div className="s4-filter-controls">
        {filters.map((filter) =>
          filter.render ? (
            <span className="s4-filter-custom" key={filter.key || filter.label}>
              {filter.render}
            </span>
          ) : (
            <SelectMenu key={filter.label} {...filter} />
          ),
        )}
      </div>
      {trailing ? <div className="s4-filter-trailing">{trailing}</div> : null}
    </section>
  );
}

export function ColumnMenu({ columns, visible, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const panelRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (event) =>
      !ref.current?.contains(event.target) &&
      !panelRef.current?.contains(event.target) &&
      setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  return (
    <div className="s4-column-menu" ref={ref}>
      <IconButton
        icon="settings"
        label="设置显示列"
        onClick={() => setOpen((current) => !current)}
      />
      <FloatingPanel
        open={open}
        anchorRef={ref}
        panelRef={panelRef}
        className="s4-column-panel"
        width={280}
        align="end"
      >
        <header>
          <b>显示列</b>
          <small>拖拽顺序将在正式产品中保留</small>
        </header>
        {columns.map((column) => (
          <div key={column.key}>
            <CustomCheckbox
              checked={column.required || visible.includes(column.key)}
              disabled={column.required}
              onChange={(checked) =>
                onChange(
                  checked
                    ? [...visible, column.key]
                    : visible.filter((item) => item !== column.key),
                )
              }
              label={column.label}
            />
            {column.required ? <em>固定</em> : <Icon name="menu" />}
          </div>
        ))}
      </FloatingPanel>
    </div>
  );
}

export function DataTable({
  columns,
  rows,
  visibleColumns,
  selected,
  onSelect,
  onRow,
  rowActions,
  stickyEdges = false,
  minWidth,
  empty,
}) {
  const shown = columns.filter(
    (column) =>
      !visibleColumns || column.required || visibleColumns.includes(column.key),
  );
  const allChecked =
    rows.length > 0 && rows.every((row) => selected?.has(row.id));
  const toggleAll = (checked) =>
    onSelect?.(checked ? new Set(rows.map((row) => row.id)) : new Set());
  if (!rows.length)
    return (
      empty || (
        <EmptyState
          icon="search"
          title="没有符合条件的数据"
          description="调整搜索词或筛选条件后再试。"
        />
      )
    );
  return (
    <div
      className={`s4-table-wrap ${stickyEdges ? "s4-table-scroll s4-table-sticky-edges" : ""}`}
      data-sticky-edges={stickyEdges ? "true" : undefined}
    >
      <table
        className="s4-data-table"
        style={
          minWidth ? { "--s4-table-min-width": `${minWidth}px` } : undefined
        }
      >
        <colgroup>
          {onSelect ? <col style={{ width: 42 }} /> : null}
          {shown.map((column) => (
            <col
              key={column.key}
              style={column.width ? { width: column.width } : undefined}
            />
          ))}
          {rowActions ? <col style={{ width: 72 }} /> : null}
        </colgroup>
        <thead>
          <tr>
            {onSelect ? (
              <th className="s4-select-cell">
                <CustomCheckbox checked={allChecked} onChange={toggleAll} />
              </th>
            ) : null}
            {shown.map((column, columnIndex) => (
              <th
                key={column.key}
                className={`s4-data-col-${column.key} ${stickyEdges && columnIndex === 0 ? "is-sticky-first" : ""}`}
              >
                {column.label}
              </th>
            ))}
            {rowActions ? <th className="s4-actions-cell">操作</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={selected?.has(row.id) ? "is-selected" : ""}
            >
              {onSelect ? (
                <td className="s4-select-cell">
                  <CustomCheckbox
                    checked={selected.has(row.id)}
                    onChange={(checked) => {
                      const next = new Set(selected);
                      if (checked) next.add(row.id);
                      else next.delete(row.id);
                      onSelect(next);
                    }}
                  />
                </td>
              ) : null}
              {shown.map((column, columnIndex) => (
                <td
                  key={column.key}
                  data-label={column.label}
                  className={`s4-data-col-${column.key} ${stickyEdges && columnIndex === 0 ? "is-sticky-first" : ""}`}
                >
                  <button
                    type="button"
                    className={`s4-table-value ${columnIndex === 0 ? "is-primary" : ""}`}
                    onClick={() => onRow?.(row)}
                  >
                    {column.render ? (
                      column.render(row)
                    ) : (
                      <TooltipText tip={String(row[column.key] || "—")}>
                        {row[column.key] || "—"}
                      </TooltipText>
                    )}
                  </button>
                </td>
              ))}
              {rowActions ? (
                <td className="s4-actions-cell">{rowActions(row)}</td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ page, pages, onChange }) {
  return (
    <nav className="s4-pagination" aria-label="分页">
      <span>
        第 {page} / {pages} 页
      </span>
      <div>
        <IconButton
          icon="chevronLeft"
          label="上一页"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
        />
        {Array.from(
          { length: Math.min(pages, 5) },
          (_, index) => index + 1,
        ).map((item) => (
          <button
            type="button"
            className={page === item ? "is-active" : ""}
            key={item}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        ))}
        <IconButton
          icon="chevronRight"
          label="下一页"
          disabled={page === pages}
          onClick={() => onChange(page + 1)}
        />
      </div>
      <span>每页 20 条</span>
    </nav>
  );
}

export function AssetListState({ state, label, onRetry, children }) {
  if (state === "loading") {
    return (
      <div className="s4-list-loading">
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    );
  }
  if (state === "error") {
    return (
      <EmptyState
        icon="warning"
        title={`${label}加载失败`}
        description="网络连接中断，已保留当前筛选条件。"
        action={
          <Button tone="primary" icon="refresh" onClick={onRetry}>
            重新加载
          </Button>
        }
      />
    );
  }
  if (state === "limited") {
    return (
      <EmptyState
        icon="warning"
        title="当前账号只能查看摘要"
        description={`你没有查看${label}详细资料的权限，可以联系工作空间管理员。`}
        action={<Button disabled>新建{label}</Button>}
      />
    );
  }
  return children;
}

export function DetailHeader({
  icon,
  title,
  subtitle,
  badges = [],
  onBack,
  onEdit,
  onDelete,
  children,
}) {
  return (
    <header className="s4-detail-header">
      <button type="button" className="s4-back-button" onClick={onBack}>
        <Icon name="chevronLeft" />
        返回列表
      </button>
      <div className="s4-detail-title-row">
        <i>
          <Icon name={icon} />
        </i>
        <span>
          <small>{subtitle}</small>
          <h1>{title}</h1>
          <div>
            {badges.map((badge) => (
              <StatusBadge key={badge.label} tone={badge.tone || "neutral"}>
                {badge.label}
              </StatusBadge>
            ))}
          </div>
        </span>
        <div className="s4-detail-actions">
          {children}
          {onEdit ? (
            <Button icon="edit" onClick={onEdit}>
              编辑
            </Button>
          ) : null}
          {onDelete ? (
            <Button tone="danger-outline" icon="trash" onClick={onDelete}>
              删除
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function DetailTabs({ tabs, value, onChange }) {
  return (
    <div className="s4-detail-tabs">
      <Tabs label="详情内容" items={tabs} value={value} onChange={onChange} />
    </div>
  );
}

export function FieldGroup({
  title,
  description,
  action,
  children,
  className = "",
}) {
  return (
    <section className={`s4-field-group ${className}`}>
      <header>
        <span>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </span>
        {action}
      </header>
      <div className="s4-field-group-body">{children}</div>
    </section>
  );
}

export function DefinitionGrid({ items, columns = 3 }) {
  return (
    <dl className={`s4-definition-grid s4-definition-grid-${columns}`}>
      {items.map(([label, value, content]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{content || value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function TagList({
  items = [],
  tone = "neutral",
  removable = false,
  onRemove,
  maxVisible,
}) {
  const visibleItems =
    typeof maxVisible === "number" ? items.slice(0, maxVisible) : items;
  const hiddenItems = items.slice(visibleItems.length);
  return (
    <span className={`s4-tag-list ${hiddenItems.length ? "has-overflow" : ""}`}>
      {visibleItems.map((item) => (
        <span className={`s4-tag s4-tag-${tone}`} key={item}>
          {item}
          {removable ? (
            <button
              type="button"
              aria-label={`移除${item}`}
              onClick={() => onRemove(item)}
            >
              <Icon name="close" />
            </button>
          ) : null}
        </span>
      ))}
      {hiddenItems.length ? (
        <TooltipText tip={hiddenItems.join("、")} trigger="hidden-tags">
          <span className="s4-tag s4-tag-overflow">+{hiddenItems.length}</span>
        </TooltipText>
      ) : null}
    </span>
  );
}

export function FormField({
  label,
  required,
  help,
  error,
  children,
  span = 1,
}) {
  return (
    <label
      className={`s4-form-field s4-form-span-${span} ${error ? "has-error" : ""}`}
    >
      <span>
        {label}
        {required ? <em>*</em> : null}
      </span>
      {children}
      {help ? <small>{help}</small> : null}
      {error ? <b>{error}</b> : null}
    </label>
  );
}

export function TextInput({ value, onChange, placeholder, disabled = false }) {
  const [draftValue, setDraftValue] = useState(value || "");
  useEffect(() => setDraftValue(value || ""), [value]);
  return (
    <input
      className="s4-input"
      value={draftValue}
      disabled={disabled}
      onChange={(event) => {
        setDraftValue(event.target.value);
        onChange?.(event.target.value);
      }}
      placeholder={placeholder}
    />
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled = false,
}) {
  const [draftValue, setDraftValue] = useState(value || "");
  useEffect(() => setDraftValue(value || ""), [value]);
  return (
    <textarea
      className="s4-textarea"
      value={draftValue}
      disabled={disabled}
      onChange={(event) => {
        setDraftValue(event.target.value);
        onChange?.(event.target.value);
      }}
      placeholder={placeholder}
      rows={rows}
    />
  );
}

export function FileDrop({
  files = [],
  onFiles,
  accept = "PDF、DOCX、XLSX",
  multiple = true,
  error,
}) {
  const inputRef = useRef(null);
  return (
    <div className="s4-file-drop-wrap">
      <button
        type="button"
        className={`s4-file-drop ${error ? "has-error" : ""}`}
        onClick={() => inputRef.current?.click()}
      >
        <i>
          <Icon name="upload" />
        </i>
        <b>选择文件或拖到这里</b>
        <span>支持 {accept}，单个文件不超过 50 MB</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        hidden
        onChange={(event) => onFiles(Array.from(event.target.files || []))}
      />
      {error ? <p className="s4-file-error">{error}</p> : null}
      {files.length ? (
        <div className="s4-uploaded-files">
          {files.map((file) => (
            <span key={file.name || file}>
              <Icon name="file" />
              <b>{file.name || file}</b>
              <small>准备上传</small>
              <button
                type="button"
                onClick={() => onFiles(files.filter((item) => item !== file))}
              >
                <Icon name="close" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function DeleteAssetModal({
  open,
  close,
  assetLabel,
  assetName,
  impact,
  onConfirm,
}) {
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!open) setBusy(false);
  }, [open]);
  return (
    <Modal
      open={open}
      close={close}
      closeDisabled={busy}
      title={`删除${assetLabel}`}
      description={`“${assetName}”将进入回收站 30 天`}
      footer={
        <>
          <Button disabled={busy} onClick={close}>
            取消
          </Button>
          <Button
            tone="danger"
            loading={busy}
            onClick={() => {
              setBusy(true);
              window.setTimeout(() => {
                onConfirm();
                setBusy(false);
              }, 550);
            }}
          >
            删除并进入回收站
          </Button>
        </>
      }
    >
      <div className="s4-delete-impact">
        <Icon name="warning" />
        <span>
          <b>不会级联删除独立资产</b>
          <p>{impact}</p>
        </span>
      </div>
    </Modal>
  );
}

export function ActivityTimeline({ items }) {
  return (
    <ol className="s4-timeline">
      {items.map(([time, type, content, source]) => (
        <li key={`${time}-${content}`}>
          <i />
          <time>{time}</time>
          <div>
            <span>
              <b>{type}</b>
              <em>{source}</em>
            </span>
            <p>{content}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function SourceList({ items }) {
  return (
    <div className="s4-source-list">
      {items.map((item) => (
        <article key={item.title}>
          <i>
            <Icon name={item.icon || "link"} />
          </i>
          <span>
            <b>{item.title}</b>
            <p>{item.description}</p>
            <small>{item.meta}</small>
          </span>
          <StatusBadge tone={item.tone || "success"}>{item.status}</StatusBadge>
        </article>
      ))}
    </div>
  );
}

export function EntityLink({ icon, title, meta, onClick }) {
  return (
    <button type="button" className="s4-entity-link" onClick={onClick}>
      <i>
        <Icon name={icon} />
      </i>
      <span>
        <b>{title}</b>
        <small>{meta}</small>
      </span>
      <Icon name="chevronRight" />
    </button>
  );
}

export function useAssetNavigation() {
  const navigate = useNavigate();
  const detail = (type, id) => navigate(`/${type}/${id}`);
  return { navigate, detail };
}

export function useListController(items, searchKeys, pageSize = 6) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const normalized = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      !normalized
        ? items
        : items.filter((item) =>
            searchKeys.some((key) =>
              String(item[key] || "")
                .toLowerCase()
                .includes(normalized),
            ),
          ),
    [items, normalized, searchKeys],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [query]);
  return {
    query,
    setQuery,
    page,
    setPage,
    pages,
    rows,
    filtered,
    selected,
    setSelected,
  };
}

export function BulkBar({ count, children, onClear }) {
  if (!count) return null;
  return (
    <div className="s4-bulk-bar">
      <span>
        已选 <b>{count}</b> 项
      </span>
      <div>{children}</div>
      <button type="button" onClick={onClear}>
        取消选择
      </button>
    </div>
  );
}

export function StateBanner({
  tone = "info",
  icon = "info",
  title,
  description,
  action,
}) {
  return (
    <section className={`s4-state-banner s4-state-banner-${tone}`}>
      <Icon name={icon} />
      <span>
        <b>{title}</b>
        <p>{description}</p>
      </span>
      {action}
    </section>
  );
}

export function ProgressBar({ value, label }) {
  return (
    <div className="s4-progress">
      <span>
        <b>{label}</b>
        <em>{value}%</em>
      </span>
      <i>
        <b style={{ width: `${value}%` }} />
      </i>
    </div>
  );
}

export function TooltipText({
  children,
  tip,
  className = "",
  trigger = "truncated",
  clampLines,
}) {
  const anchorRef = useRef(null);
  const tooltipId = useId();
  const [eligible, setEligible] = useState(trigger === "hidden-tags");
  const [tooltip, setTooltip] = useState(null);
  const isTruncated = (element) => {
    return (
      element.scrollWidth > element.clientWidth + 1 ||
      element.scrollHeight > element.clientHeight + 1
    );
  };
  useLayoutEffect(() => {
    const element = anchorRef.current;
    if (!element) return undefined;
    const update = () =>
      setEligible(
        trigger === "hidden-tags" || Boolean(tip && isTruncated(element)),
      );
    update();
    if (trigger === "hidden-tags" || !window.ResizeObserver) return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [clampLines, tip, trigger]);
  useEffect(() => {
    if (!eligible) setTooltip(null);
  }, [eligible]);
  const show = () => {
    const element = anchorRef.current;
    if (!element || !tip || !eligible) return;
    const rect = element.getBoundingClientRect();
    const width = Math.min(
      Math.max(120, Array.from(String(tip)).length * 12 + 30),
      360,
      window.innerWidth - 24,
    );
    const left = Math.min(
      Math.max(12, rect.left),
      window.innerWidth - width - 12,
    );
    const openAbove = window.innerHeight - rect.bottom < 120 && rect.top > 120;
    const arrowLeft = Math.min(
      Math.max(16, rect.left + rect.width / 2 - left),
      width - 16,
    );
    setTooltip({
      left,
      top: openAbove ? "auto" : rect.bottom + 7,
      bottom: openAbove ? window.innerHeight - rect.top + 7 : "auto",
      width,
      placement: openAbove ? "above" : "below",
      arrowLeft,
    });
  };
  return (
    <span
      ref={anchorRef}
      className={`s4-tooltip ${clampLines ? "is-line-clamped" : ""} ${className}`}
      style={clampLines ? { "--s4-tooltip-lines": clampLines } : undefined}
      tabIndex={eligible ? 0 : undefined}
      aria-describedby={tooltip ? tooltipId : undefined}
      onMouseEnter={show}
      onMouseLeave={() => setTooltip(null)}
      onFocus={show}
      onBlur={() => setTooltip(null)}
    >
      {children}
      {tooltip
        ? createPortal(
            <span
              id={tooltipId}
              className={`s4-floating-tooltip is-${tooltip.placement}`}
              role="tooltip"
              style={{
                left: tooltip.left,
                top: tooltip.top,
                bottom: tooltip.bottom,
                width: tooltip.width,
                "--s4-tooltip-arrow-left": `${tooltip.arrowLeft}px`,
              }}
            >
              {tip}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}

export function StatusFromText({ value }) {
  const tone = [
    "招聘中",
    "跟进中",
    "已完成",
    "已入职",
    "已关联",
    "可下载",
    "已完成",
  ].includes(value)
    ? "success"
    : ["已暂停", "待核实", "需要处理", "处理中", "生成中", "有条件"].includes(
          value,
        )
      ? "warning"
      : ["已关闭", "失败", "拒绝"].includes(value)
        ? "danger"
        : "info";
  return <StatusBadge tone={tone}>{value}</StatusBadge>;
}

export function PageStateSwitcher({ state }) {
  if (!state || state === "normal") return null;
  return <span className="s4-prototype-state">原型状态：{state}</span>;
}

export function FilePreview({ name, type = "PDF", close }) {
  const [selectedPage, setSelectedPage] = useState(1);
  return (
    <div className="s4-file-preview">
      <header>
        <span>
          <Icon name="file" />
          <b>{name}</b>
          <small>{type} · 预览</small>
        </span>
        <IconButton icon="close" label="关闭预览" onClick={close} />
      </header>
      <div>
        <aside>
          {[1, 2, 3].map((page) => (
            <button
              type="button"
              className={page === selectedPage ? "is-active" : ""}
              key={page}
              onClick={() => setSelectedPage(page)}
            >
              <span>{page}</span>
              <small>第 {page} 页</small>
            </button>
          ))}
        </aside>
        <article>
          <div className="s4-document-sheet">
            <small className="s4-document-page-number">
              第 {selectedPage} 页
            </small>
            <h2>林昊</h2>
            <p>机器人学习负责人 · 上海</p>
            <h3>职业概览</h3>
            <p>
              具备 12
              年机器人学习、强化学习与真机部署经验，长期负责算法团队与数据闭环建设。
            </p>
            <h3>工作经历</h3>
            <b>拓界机器人 · 机器人学习负责人</b>
            <p>负责多任务操作策略、数据闭环和团队管理。</p>
            <h3>代表项目</h3>
            <p>多任务机器人操作策略平台、Sim2Real 数据闭环。</p>
          </div>
        </article>
      </div>
    </div>
  );
}

export function NotFoundState({ label, onBack }) {
  return (
    <EmptyState
      icon="search"
      title={`没有找到${label}`}
      description="该记录可能已被删除，或当前链接已经失效。"
      action={<Button onClick={onBack}>返回列表</Button>}
    />
  );
}

export { Button, Modal, StatusBadge, Tabs, useToast };
