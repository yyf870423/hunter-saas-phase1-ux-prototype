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
  Drawer,
  EmptyState,
  IconButton,
  Modal,
  SearchField,
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

export function CustomCheckbox({
  checked,
  onChange,
  label,
  ariaLabel,
  disabled = false,
}) {
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
      aria-label={ariaLabel || label || "切换选择"}
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
  role,
  ariaLabel,
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
      role={role}
      aria-label={ariaLabel}
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
  disabled = false,
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
        disabled={disabled}
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

export function PostWriteMatchingOptions({
  entityType,
  enabled,
  onEnabledChange,
  scope = "all",
  onScopeChange,
  selectedPositions = [],
  onSelectedPositionsChange,
  error = "",
}) {
  const isCandidate = entityType === "candidate";
  const positionOptions = [
    "具身智能 VLA 算法负责人 · 星澜机器人",
    "机器人数据平台负责人 · 拓界机器人",
    "强化学习算法专家 · 灵跃科技",
    "具身算法平台总监 · 穹顶智能",
  ];
  return (
    <section
      className={`s4-post-write-matching ${enabled ? "is-enabled" : ""}`}
    >
      <div className="s4-post-write-matching-switch">
        <CustomCheckbox
          checked={enabled}
          onChange={onEnabledChange}
          label={isCandidate ? "写入后立即人岗匹配" : "创建后立即人岗匹配"}
        />
        <p>
          {isCandidate
            ? "完成身份判断、查重和正式写入后，再对成功写入的候选人运行匹配。"
            : "岗位创建成功后，使用确认版本与系统内可用候选人运行一次匹配。"}
        </p>
      </div>
      {enabled && isCandidate ? (
        <div className="s4-post-write-matching-options">
          <span>匹配范围</span>
          <div role="radiogroup" aria-label="候选人匹配岗位范围">
            <CustomRadio
              checked={scope === "all"}
              onChange={() => onScopeChange?.("all")}
              label="全部招聘中岗位"
              description="对当前工作空间中 8 个招聘中岗位运行匹配。"
            />
            <CustomRadio
              checked={scope === "selected"}
              onChange={() => onScopeChange?.("selected")}
              label="指定岗位"
              description="只匹配本次选择的一个或多个岗位。"
            />
          </div>
          {scope === "selected" ? (
            <div className="s4-post-write-position-select">
              <SelectMenu
                label="选择岗位"
                value={selectedPositions}
                options={positionOptions}
                multiple
                searchable
                onChange={onSelectedPositionsChange}
              />
              {error ? <b role="alert">{error}</b> : null}
            </div>
          ) : null}
        </div>
      ) : null}
      {enabled && !isCandidate ? (
        <div className="s4-post-write-matching-summary">
          <Icon name="users" />
          <span>
            <b>匹配系统内可用候选人</b>
            <small>
              不匹配人物线索、已删除候选人或资料不足以完成判断的人选。
            </small>
          </span>
        </div>
      ) : null}
    </section>
  );
}

const monthLabels = [
  "1 月",
  "2 月",
  "3 月",
  "4 月",
  "5 月",
  "6 月",
  "7 月",
  "8 月",
  "9 月",
  "10 月",
  "11 月",
  "12 月",
];
const weekLabels = ["一", "二", "三", "四", "五", "六", "日"];
const padDatePart = (value) => String(value).padStart(2, "0");
const parseYear = (value, fallback = 2026) =>
  Number(String(value || "").match(/\d{4}/)?.[0] || fallback);
const parseMonthParts = (value) => {
  const parts = [...String(value || "").matchAll(/(\d{4})[.-](\d{1,2})/g)].map(
    (match) => ({ year: Number(match[1]), month: Number(match[2]) }),
  );
  return {
    start: parts[0] || null,
    end: parts[1] || null,
    ongoing: String(value || "").includes("至今"),
  };
};

export function DatePicker({
  label = "选择时间",
  value,
  onChange,
  mode = "date",
  yearOptions = [],
  allowOngoing = false,
  initialYear = 2026,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const panelRef = useRef(null);
  const initialRange = parseMonthParts(value);
  const [draftValue, setDraftValue] = useState(
    value || (mode === "years" ? [] : ""),
  );
  const [selectedYears, setSelectedYears] = useState(
    Array.isArray(value) ? value : [],
  );
  const [viewYear, setViewYear] = useState(
    initialRange.start?.year || parseYear(value, initialYear),
  );
  const [viewMonth, setViewMonth] = useState(
    Math.max(
      0,
      Number(String(value || "").match(/\d{4}-(\d{2})/)?.[1] || 8) - 1,
    ),
  );
  const [selectedDate, setSelectedDate] = useState(
    String(value || "").match(/\d{4}-\d{2}-\d{2}/)?.[0] ||
      `${initialYear}-08-21`,
  );
  const [rangeStep, setRangeStep] = useState("start");
  const [rangeStart, setRangeStart] = useState(initialRange.start);
  const [rangeEnd, setRangeEnd] = useState(initialRange.end);
  const [rangeOngoing, setRangeOngoing] = useState(initialRange.ongoing);
  const valueKey = JSON.stringify(value || "");
  useEffect(() => {
    setDraftValue(value || (mode === "years" ? [] : ""));
    if (mode === "years") setSelectedYears(Array.isArray(value) ? value : []);
    if (mode === "month-range") {
      const next = parseMonthParts(value);
      setRangeStart(next.start);
      setRangeEnd(next.end);
      setRangeOngoing(next.ongoing);
      setViewYear(next.start?.year || initialYear);
      setRangeStep("start");
    }
  }, [initialYear, mode, valueKey]);
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
      if (event.key === "Escape") {
        event.stopImmediatePropagation();
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape, true);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape, true);
    };
  }, [open]);
  const commit = (next) => {
    setDraftValue(next);
    onChange?.(next);
  };
  const shiftMonth = (step) => {
    const date = new Date(viewYear, viewMonth + step, 1);
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth());
  };
  const chooseMonth = (month) => {
    const next = { year: viewYear, month };
    if (rangeStep === "start") {
      setRangeStart(next);
      setRangeEnd(null);
      setRangeOngoing(false);
      setRangeStep("end");
      return;
    }
    const startNumber =
      (rangeStart?.year || viewYear) * 12 + (rangeStart?.month || month);
    const endNumber = viewYear * 12 + month;
    if (endNumber < startNumber) {
      setRangeStart(next);
      setRangeEnd(null);
      setRangeStep("end");
      return;
    }
    setRangeEnd(next);
    setRangeOngoing(false);
  };
  const confirmMonthRange = () => {
    if (!rangeStart || (!rangeEnd && !rangeOngoing)) return;
    const start = `${rangeStart.year}.${padDatePart(rangeStart.month)}`;
    const end = rangeOngoing
      ? "至今"
      : `${rangeEnd.year}.${padDatePart(rangeEnd.month)}`;
    commit(`${start} - ${end}`);
    setOpen(false);
  };
  const resolvedYearOptions = yearOptions.length
    ? yearOptions.map(String)
    : Array.from({ length: 12 }, (_, index) => String(viewYear - 5 + index));
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const leadingDays = (firstDay + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const display = Array.isArray(draftValue)
    ? draftValue.length
      ? `${label} · ${draftValue.length}`
      : label
    : draftValue || label;
  const accessibleLabel = display === label ? label : `${label}：${display}`;
  return (
    <div
      className={`s4-date-picker ${open ? "is-open" : ""} ${className}`}
      ref={ref}
    >
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={accessibleLabel}
        onClick={() => setOpen((current) => !current)}
      >
        <Icon name="calendar" />
        <span>{display}</span>
        <Icon name={open ? "chevronUp" : "chevronDown"} />
      </button>
      <FloatingPanel
        open={open}
        anchorRef={ref}
        panelRef={panelRef}
        className="s4-date-picker-panel"
        width={mode === "month-range" ? 344 : 320}
        role="dialog"
        ariaLabel={`${label}时间选择器`}
      >
        <header>
          <span>
            <b>{label}</b>
            <small>
              {mode === "month-range"
                ? "在同一面板中依次选择开始和结束时间"
                : mode === "years"
                  ? "可以选择多个年份"
                  : "选择后立即更新当前字段"}
            </small>
          </span>
          <IconButton
            icon="close"
            label="关闭时间选择器"
            onClick={() => setOpen(false)}
          />
        </header>
        {mode === "month-range" ? (
          <>
            <div className="s4-date-range-steps">
              <button
                type="button"
                className={rangeStep === "start" ? "is-active" : ""}
                onClick={() => {
                  setRangeStep("start");
                  if (rangeStart) setViewYear(rangeStart.year);
                }}
              >
                <small>开始</small>
                <b>
                  {rangeStart
                    ? `${rangeStart.year}.${padDatePart(rangeStart.month)}`
                    : "请选择"}
                </b>
              </button>
              <Icon name="chevronRight" />
              <button
                type="button"
                className={rangeStep === "end" ? "is-active" : ""}
                onClick={() => {
                  setRangeStep("end");
                  if (rangeEnd) setViewYear(rangeEnd.year);
                }}
              >
                <small>结束</small>
                <b>
                  {rangeOngoing
                    ? "至今"
                    : rangeEnd
                      ? `${rangeEnd.year}.${padDatePart(rangeEnd.month)}`
                      : "请选择"}
                </b>
              </button>
            </div>
            <div className="s4-date-picker-nav">
              <IconButton
                icon="chevronLeft"
                label="上一年"
                onClick={() => setViewYear((year) => year - 1)}
              />
              <b>{viewYear} 年</b>
              <IconButton
                icon="chevronRight"
                label="下一年"
                onClick={() => setViewYear((year) => year + 1)}
              />
            </div>
            <div className="s4-month-grid">
              {monthLabels.map((monthLabel, index) => {
                const month = index + 1;
                const selected =
                  (rangeStart?.year === viewYear &&
                    rangeStart.month === month) ||
                  (rangeEnd?.year === viewYear && rangeEnd.month === month);
                return (
                  <button
                    type="button"
                    className={selected ? "is-selected" : ""}
                    key={monthLabel}
                    onClick={() => chooseMonth(month)}
                  >
                    {monthLabel}
                  </button>
                );
              })}
            </div>
            <footer>
              {allowOngoing && rangeStep === "end" ? (
                <button
                  type="button"
                  onClick={() => {
                    setRangeOngoing(true);
                    setRangeEnd(null);
                  }}
                >
                  设为至今
                </button>
              ) : (
                <span />
              )}
              <Button
                size="sm"
                tone="primary"
                disabled={!rangeStart || (!rangeEnd && !rangeOngoing)}
                onClick={confirmMonthRange}
              >
                确定
              </Button>
            </footer>
          </>
        ) : mode === "year" || mode === "years" ? (
          <>
            {mode === "year" ? (
              <div className="s4-date-picker-nav">
                <IconButton
                  icon="chevronLeft"
                  label="上一组年份"
                  onClick={() => setViewYear((year) => year - 12)}
                />
                <b>
                  {viewYear - 5} - {viewYear + 6}
                </b>
                <IconButton
                  icon="chevronRight"
                  label="下一组年份"
                  onClick={() => setViewYear((year) => year + 12)}
                />
              </div>
            ) : null}
            <div className="s4-year-grid">
              {resolvedYearOptions.map((year) => {
                const selected =
                  mode === "years"
                    ? selectedYears.includes(year)
                    : String(draftValue) === year;
                return (
                  <button
                    type="button"
                    className={selected ? "is-selected" : ""}
                    key={year}
                    onClick={() => {
                      if (mode === "years") {
                        setSelectedYears((current) =>
                          current.includes(year)
                            ? current.filter((item) => item !== year)
                            : [...current, year],
                        );
                        return;
                      }
                      commit(year);
                      setOpen(false);
                    }}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
            {mode === "years" ? (
              <footer>
                <button type="button" onClick={() => setSelectedYears([])}>
                  清空
                </button>
                <Button
                  size="sm"
                  tone="primary"
                  onClick={() => {
                    commit(selectedYears);
                    setOpen(false);
                  }}
                >
                  确定
                </Button>
              </footer>
            ) : null}
          </>
        ) : (
          <>
            <div className="s4-date-picker-nav">
              <IconButton
                icon="chevronLeft"
                label="上个月"
                onClick={() => shiftMonth(-1)}
              />
              <b>
                {viewYear} 年 {monthLabels[viewMonth]}
              </b>
              <IconButton
                icon="chevronRight"
                label="下个月"
                onClick={() => shiftMonth(1)}
              />
            </div>
            <div className="s4-week-grid">
              {weekLabels.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="s4-day-grid">
              {Array.from({ length: leadingDays }, (_, index) => (
                <i key={`blank-${index}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, index) => {
                const day = index + 1;
                const date = `${viewYear}-${padDatePart(viewMonth + 1)}-${padDatePart(day)}`;
                return (
                  <button
                    type="button"
                    className={selectedDate === date ? "is-selected" : ""}
                    key={date}
                    onClick={() => {
                      setSelectedDate(date);
                      if (mode === "date") {
                        commit(date);
                        setOpen(false);
                      }
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            {mode === "datetime" ? (
              <div className="s4-time-grid">
                <small>选择时间</small>
                <div>
                  {["09:00", "10:30", "14:30", "16:00", "18:30"].map((time) => (
                    <button
                      type="button"
                      className={
                        String(draftValue).endsWith(time) ? "is-selected" : ""
                      }
                      key={time}
                      onClick={() => {
                        commit(`${selectedDate} ${time}`);
                        setOpen(false);
                      }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
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
                <CustomCheckbox
                  checked={allChecked}
                  onChange={toggleAll}
                  ariaLabel="选择当前页全部数据"
                />
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
                    ariaLabel={`选择${row.name || row.title || row.label || row.id}`}
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

export function Pagination({ page, pages, onChange, pageSize = 20 }) {
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
      <span>每页 {pageSize} 条</span>
    </nav>
  );
}

export function AssetListState({ state, label, onRetry, children }) {
  if (state === "loading") {
    return (
      <div className="s4-list-loading" aria-label={`${label}正在加载`}>
        <header>
          <span />
          <span />
          <span />
          <span />
        </header>
        {[0, 1, 2, 3, 4].map((row) => (
          <article key={row}>
            <i />
            <span />
            <span />
            <span />
            <b />
          </article>
        ))}
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

export function TextInput({
  value,
  onChange,
  placeholder,
  disabled = false,
  ariaLabel,
}) {
  const [draftValue, setDraftValue] = useState(value || "");
  useEffect(() => setDraftValue(value || ""), [value]);
  return (
    <input
      className="s4-input"
      value={draftValue}
      disabled={disabled}
      aria-label={ariaLabel}
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

export function ActivityTimeline({ items, onEdit, onDelete }) {
  return (
    <ol className="s4-timeline">
      {items.map(([time, type, content, source], index) => (
        <li key={`${time}-${content}`}>
          <time>{time}</time>
          <i />
          <div>
            <span>
              <b>{type}</b>
              <em>{source}</em>
              {onEdit || onDelete ? (
                <span className="s4-timeline-actions">
                  {onEdit ? (
                    <button type="button" onClick={() => onEdit(index)}>
                      <Icon name="edit" />
                      编辑
                    </button>
                  ) : null}
                  {onDelete ? (
                    <button
                      type="button"
                      className="is-danger"
                      onClick={() => onDelete(index)}
                    >
                      <Icon name="trash" />
                      删除
                    </button>
                  ) : null}
                </span>
              ) : null}
            </span>
            <p>{content}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function SourceList({ items, onOpen }) {
  return (
    <div className="s4-source-list">
      {items.map((item) => {
        const href = item.href || null;
        const open = item.onClick || (onOpen ? () => onOpen(item) : null);
        const content = (
          <>
            <i>
              <Icon name={item.icon || "link"} />
            </i>
            <span>
              <b>{item.title}</b>
              <p>{item.description}</p>
              <small>{item.meta}</small>
            </span>
            <StatusBadge tone={item.tone || "success"}>
              {item.status}
            </StatusBadge>
            {href || open ? (
              <Icon
                className="s4-source-open-icon"
                name={href ? "external" : "chevronRight"}
              />
            ) : null}
          </>
        );
        return href ? (
          <a href={href} key={item.title} target="_blank" rel="noreferrer">
            {content}
          </a>
        ) : open ? (
          <button type="button" key={item.title} onClick={open}>
            {content}
          </button>
        ) : (
          <article key={item.title}>{content}</article>
        );
      })}
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
  const showTimerRef = useRef(null);
  const tooltipId = useId();
  const [eligible, setEligible] = useState(
    trigger === "hidden-tags" || trigger === "always",
  );
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
        trigger === "hidden-tags" ||
          trigger === "always" ||
          Boolean(tip && isTruncated(element)),
      );
    update();
    if (
      trigger === "hidden-tags" ||
      trigger === "always" ||
      !window.ResizeObserver
    )
      return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [clampLines, tip, trigger]);
  useEffect(() => {
    if (!eligible) setTooltip(null);
  }, [eligible]);
  useEffect(
    () => () => {
      if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
    },
    [],
  );
  const show = () => {
    const element = anchorRef.current;
    if (!element || !tip) return;
    const canShow =
      trigger === "hidden-tags" || trigger === "always" || isTruncated(element);
    if (!canShow) {
      if (eligible) setEligible(false);
      return;
    }
    if (!eligible) setEligible(true);
    const rect = element.getBoundingClientRect();
    const width = Math.min(
      Math.max(96, Array.from(String(tip)).length * 12 + 20),
      320,
      window.innerWidth - 24,
    );
    const left = Math.min(
      Math.max(12, rect.left),
      window.innerWidth - width - 12,
    );
    const openAbove = window.innerHeight - rect.bottom < 96 && rect.top > 96;
    setTooltip({
      left,
      top: openAbove ? "auto" : rect.bottom + 6,
      bottom: openAbove ? window.innerHeight - rect.top + 6 : "auto",
      width,
      placement: openAbove ? "above" : "below",
      theme:
        document.querySelector(".s1-app")?.getAttribute("data-theme") ||
        "light",
    });
  };
  const showWithDelay = () => {
    if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
    showTimerRef.current = window.setTimeout(show, 150);
  };
  const hide = () => {
    if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
    showTimerRef.current = null;
    setTooltip(null);
  };
  return (
    <span
      ref={anchorRef}
      className={`s4-tooltip ${clampLines ? "is-line-clamped" : ""} ${className}`}
      style={clampLines ? { "--s4-tooltip-lines": clampLines } : undefined}
      tabIndex={eligible && trigger !== "always" ? 0 : undefined}
      aria-describedby={tooltip ? tooltipId : undefined}
      onMouseEnter={showWithDelay}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={(event) => {
        if (event.key === "Escape") hide();
      }}
    >
      {children}
      {tooltip
        ? createPortal(
            <span
              id={tooltipId}
              className={`s4-floating-tooltip is-${tooltip.placement} is-${tooltip.theme}`}
              role="tooltip"
              style={{
                left: tooltip.left,
                top: tooltip.top,
                bottom: tooltip.bottom,
                width: tooltip.width,
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

export function HorizontalScrollControl({ scrollRef, label = "横向滚动表格" }) {
  const [metrics, setMetrics] = useState({ value: 0, max: 0 });

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return undefined;
    const update = () =>
      setMetrics({
        value: Math.round(element.scrollLeft),
        max: Math.max(0, Math.round(element.scrollWidth - element.clientWidth)),
      });
    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    return () => {
      element.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [scrollRef]);

  if (!metrics.max) return null;
  return (
    <div className="s4-horizontal-scroll-control">
      <Icon name="chevronLeft" />
      <input
        type="range"
        min="0"
        max={metrics.max}
        value={metrics.value}
        aria-label={label}
        onChange={(event) => {
          const value = Number(event.target.value);
          scrollRef.current?.scrollTo({ left: value, behavior: "auto" });
          setMetrics((current) => ({ ...current, value }));
        }}
      />
      <Icon name="chevronRight" />
    </div>
  );
}

function hierarchyLevelCell(rows, rowIndex, level) {
  const path = rows[rowIndex].path || [];
  const node = path[level];
  if (!node) return { node: null, rowSpan: 1 };
  const key = path
    .slice(0, level + 1)
    .map((item) => item.id || item.label)
    .join("/");
  if (rowIndex > 0) {
    const previousKey = (rows[rowIndex - 1].path || [])
      .slice(0, level + 1)
      .map((item) => item.id || item.label)
      .join("/");
    if (previousKey === key && rows[rowIndex - 1].path?.[level]) return null;
  }
  let rowSpan = 1;
  for (let index = rowIndex + 1; index < rows.length; index += 1) {
    const nextKey = (rows[index].path || [])
      .slice(0, level + 1)
      .map((item) => item.id || item.label)
      .join("/");
    if (nextKey !== key || !rows[index].path?.[level]) break;
    rowSpan += 1;
  }
  return { node, rowSpan };
}

export function HierarchyTable({
  rows,
  columns,
  page,
  pages,
  pageSize = 5,
  totalLabel,
  onPageChange,
  renderLevel,
  rowClassName,
  scrollLabel = "横向滚动层级表格",
  testId,
}) {
  const scrollRef = useRef(null);
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return undefined;
    const handleWheel = (event) => {
      if (!event.shiftKey || !event.deltaY) return;
      event.preventDefault();
      element.scrollLeft += event.deltaY;
    };
    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => element.removeEventListener("wheel", handleWheel);
  }, []);
  return (
    <div className="tg-table-view s4-hierarchy-table">
      <div
        className="tg-table-scroll"
        data-testid={testId}
        ref={scrollRef}
        role="region"
        aria-label={scrollLabel}
        tabIndex="0"
      >
        <table>
          <thead>
            <tr aria-label="层级表格列">
              <th>一级节点</th>
              <th>二级节点</th>
              <th>三级节点</th>
              <th>四级及更深</th>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.id} className={rowClassName?.(row) || ""}>
                {[0, 1, 2, 3].map((level) => {
                  const cell = hierarchyLevelCell(rows, rowIndex, level);
                  if (!cell) return null;
                  return (
                    <td
                      key={level}
                      rowSpan={cell.rowSpan}
                      className={`tg-level-cell ${cell.node ? "" : "is-empty"}`}
                    >
                      {cell.node ? renderLevel(cell.node, level, row) : "—"}
                    </td>
                  );
                })}
                {columns.map((column) => (
                  <td key={column.key}>{column.render(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="tg-table-pagination">
        <span>{totalLabel}</span>
        <Pagination
          page={page}
          pages={pages}
          pageSize={pageSize}
          onChange={onPageChange}
        />
      </div>
    </div>
  );
}

export function RelationshipAiEmptyState({
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="s4-relationship-empty">
      <span>
        <Icon name="route" />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      <Button tone="primary" icon="sparkles" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}

export function RelationshipAiProcessingState({
  title,
  description,
  prompt,
  steps = ["读取已有关联资产", "整理可核验关系", "生成可查看结果"],
  activeStep = 1,
}) {
  return (
    <section className="s4-relationship-processing" aria-live="polite">
      <header>
        <span className="s4-relationship-processing-icon">
          <Icon name="sparkles" />
        </span>
        <span>
          <small>AI 正在处理</small>
          <h3>{title}</h3>
          <p>{description}</p>
        </span>
        <StatusBadge tone="info">运行中</StatusBadge>
      </header>
      {prompt ? (
        <div className="s4-relationship-processing-prompt">
          <small>本次要求</small>
          <p>{prompt}</p>
        </div>
      ) : null}
      <ol>
        {steps.map((step, index) => {
          const state =
            index < activeStep
              ? "complete"
              : index === activeStep
                ? "running"
                : "pending";
          return (
            <li className={`is-${state}`} key={step}>
              <i>{state === "complete" ? <Icon name="check" /> : <span />}</i>
              <span>
                <b>{step}</b>
                <small>
                  {state === "complete"
                    ? "已完成"
                    : state === "running"
                      ? "正在处理"
                      : "等待处理"}
                </small>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function RelationshipAiDialog({
  open,
  close,
  title,
  description,
  initialPrompt,
  submitLabel,
  onSubmit,
}) {
  const [prompt, setPrompt] = useState(initialPrompt || "");
  useEffect(() => {
    if (open) setPrompt(initialPrompt || "");
  }, [initialPrompt, open]);
  return (
    <Modal
      open={open}
      close={close}
      size="lg"
      title={title}
      description={description}
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button
            tone="primary"
            disabled={!prompt.trim()}
            onClick={() => onSubmit(prompt.trim())}
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      <FormField label="告诉 Hunter 需要如何整理" required>
        <TextArea
          value={prompt}
          onChange={setPrompt}
          rows={6}
          placeholder="说明目标、关注范围、需要优先展示的关系，以及不应纳入的内容。"
        />
      </FormField>
      <p className="s4-relationship-ai-hint">
        Hunter
        会结合当前资产、已核验证据和可用的公开资料生成或更新关系图；证据不足的关系会标记为待确认。
      </p>
    </Modal>
  );
}

export { Button, Drawer, Modal, StatusBadge, Tabs, useToast };
