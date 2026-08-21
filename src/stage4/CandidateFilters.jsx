import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../components/Icon";
import { SearchField } from "../stage1/ui";
import { Button, CustomCheckbox, Modal, SelectMenu } from "./asset-ui";
import { candidateFavoriteTree, candidateIndustryTree } from "./data";

function useDismiss(open, close, ref) {
  useEffect(() => {
    if (!open) return undefined;
    const pointer = (event) => {
      if (!ref.current?.contains(event.target)) close();
    };
    const keyboard = (event) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", pointer);
    document.addEventListener("keydown", keyboard);
    return () => {
      document.removeEventListener("pointerdown", pointer);
      document.removeEventListener("keydown", keyboard);
    };
  }, [close, open, ref]);
}

function toggleArray(values, value) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function IndustryCascade({ value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [primary, setPrimary] = useState(Object.keys(candidateIndustryTree)[0]);
  const ref = useRef(null);
  useDismiss(open, () => setOpen(false), ref);
  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return Object.entries(candidateIndustryTree).flatMap(([group, items]) =>
      items
        .filter((item) => `${group}${item}`.toLowerCase().includes(normalized))
        .map((item) => ({ group, item })),
    );
  }, [query]);
  const selectedByPrimary = (group) =>
    candidateIndustryTree[group].filter((item) => value.includes(item)).length;
  return (
    <div className={`s4-select s4-cascade ${open ? "is-open" : ""}`} ref={ref}>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>{value.length ? `已选 ${value.length} 个行业` : "行业"}</span>
        <Icon name={open ? "chevronUp" : "chevronDown"} />
      </button>
      {open ? (
        <div className="s4-cascade-panel">
          <label className="s4-cascade-search">
            <Icon name="search" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索行业（跨一级）"
              autoFocus
            />
          </label>
          {query.trim() ? (
            <div className="s4-cascade-results">
              {searchResults.length ? (
                searchResults.map(({ group, item }) => (
                  <CustomCheckbox
                    key={`${group}-${item}`}
                    checked={value.includes(item)}
                    label={item}
                    onChange={() => onChange(toggleArray(value, item))}
                  />
                ))
              ) : (
                <p>没有匹配的行业</p>
              )}
            </div>
          ) : (
            <div className="s4-cascade-body">
              <div className="s4-cascade-primary">
                {Object.keys(candidateIndustryTree).map((group) => (
                  <button
                    type="button"
                    className={primary === group ? "is-active" : ""}
                    key={group}
                    onClick={() => setPrimary(group)}
                  >
                    <span>{group}</span>
                    {selectedByPrimary(group) ? (
                      <em>{selectedByPrimary(group)}</em>
                    ) : null}
                  </button>
                ))}
              </div>
              <div className="s4-cascade-secondary">
                {candidateIndustryTree[primary].map((item) => (
                  <CustomCheckbox
                    key={item}
                    checked={value.includes(item)}
                    label={item}
                    onChange={() => onChange(toggleArray(value, item))}
                  />
                ))}
              </div>
            </div>
          )}
          <footer>
            <span>
              已选 <b>{value.length}</b> 个行业
            </span>
            <button
              type="button"
              disabled={!value.length}
              onClick={() => onChange([])}
            >
              清空
            </button>
          </footer>
        </div>
      ) : null}
    </div>
  );
}

function flattenFolders(nodes, parentPath = "", depth = 0) {
  return nodes.flatMap((node) => {
    const path = parentPath ? `${parentPath}/${node.name}` : node.name;
    return [
      { ...node, path, depth },
      ...flattenFolders(node.children || [], path, depth + 1),
    ];
  });
}

const folderRows = flattenFolders(candidateFavoriteTree);

function FolderTree({ value, onChange, multiple = false, query = "" }) {
  const [expanded, setExpanded] = useState(
    () => new Set(candidateFavoriteTree.map((item) => item.id)),
  );
  const normalized = query.trim().toLowerCase();
  const visible = normalized
    ? folderRows.filter((item) => item.path.toLowerCase().includes(normalized))
    : folderRows.filter((item) => {
        const parentPaths = item.path.split("/").slice(0, -1);
        let nodes = candidateFavoriteTree;
        for (const parentName of parentPaths) {
          const parent = nodes.find((node) => node.name === parentName);
          if (!parent || !expanded.has(parent.id)) return false;
          nodes = parent.children || [];
        }
        return true;
      });
  const choose = (path) =>
    onChange(multiple ? toggleArray(value, path) : `folder:${path}`);
  return (
    <div className="s4-folder-tree" role={multiple ? "group" : "radiogroup"}>
      {visible.map((item) => {
        const checked = multiple
          ? value.includes(item.path)
          : value === `folder:${item.path}`;
        return (
          <div
            className={`s4-folder-row ${checked ? "is-selected" : ""}`}
            style={{ "--folder-depth": normalized ? 0 : item.depth }}
            key={item.id}
          >
            {item.children?.length && !normalized ? (
              <button
                type="button"
                className="s4-folder-expand"
                aria-label={`${expanded.has(item.id) ? "收起" : "展开"}${item.name}`}
                onClick={() =>
                  setExpanded((current) => {
                    const next = new Set(current);
                    if (next.has(item.id)) next.delete(item.id);
                    else next.add(item.id);
                    return next;
                  })
                }
              >
                <Icon
                  name={expanded.has(item.id) ? "chevronDown" : "chevronRight"}
                />
              </button>
            ) : (
              <i className="s4-folder-spacer" />
            )}
            <button
              type="button"
              role={multiple ? "checkbox" : "radio"}
              aria-checked={checked}
              onClick={() => choose(item.path)}
            >
              <span className="s4-folder-check">
                {checked ? <Icon name="check" /> : null}
              </span>
              <Icon name="folder" />
              <span>
                <b>{item.name}</b>
                {normalized ? <small>{item.path}</small> : null}
              </span>
              <em>{item.count} 人</em>
            </button>
          </div>
        );
      })}
      {!visible.length ? (
        <p className="s4-folder-empty">没有匹配的收藏夹</p>
      ) : null}
    </div>
  );
}

export function FavoriteFilter({ value = "all", onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  useDismiss(open, () => setOpen(false), ref);
  const selectedFolder = value.startsWith("folder:")
    ? value.slice("folder:".length).split("/").at(-1)
    : "";
  const label =
    value === "favorited"
      ? "全部收藏夹"
      : value === "unfiled"
        ? "未收藏"
        : selectedFolder || "收藏夹";
  const choose = (nextValue) => {
    onChange(nextValue);
    setOpen(false);
  };
  return (
    <div
      className={`s4-select s4-favorite-filter ${open ? "is-open" : ""}`}
      ref={ref}
    >
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>{label}</span>
        <Icon name={open ? "chevronUp" : "chevronDown"} />
      </button>
      {open ? (
        <div className="s4-favorite-panel">
          <div
            className="s4-favorite-scope"
            role="radiogroup"
            aria-label="收藏夹范围"
          >
            {[
              ["all", "全部候选人"],
              ["favorited", "全部收藏夹"],
              ["unfiled", "未收藏"],
            ].map(([key, text]) => (
              <button
                type="button"
                role="radio"
                aria-checked={value === key}
                className={value === key ? "is-selected" : ""}
                key={key}
                onClick={() => choose(key)}
              >
                <span>{value === key ? <Icon name="check" /> : null}</span>
                {text}
              </button>
            ))}
          </div>
          <label className="s4-cascade-search">
            <Icon name="search" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索收藏夹"
            />
          </label>
          <FolderTree value={value} onChange={choose} query={query} />
          <footer>选择上级目录时包含其全部子目录</footer>
        </div>
      ) : null}
    </div>
  );
}

export function FavoritePickerModal({ open, count, close, onConfirm }) {
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (open) {
      setSelected([]);
      setQuery("");
    }
  }, [open]);
  if (!open) return null;
  return createPortal(
    <Modal
      open={open}
      close={close}
      size="lg"
      title="加入收藏夹"
      description={`已选择 ${count} 位候选人；可以同时加入多个收藏夹。`}
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button
            tone="primary"
            disabled={!selected.length}
            onClick={() => onConfirm(selected)}
          >
            确认加入
          </Button>
        </>
      }
    >
      <div className="s4-favorite-picker">
        <label className="s4-cascade-search">
          <Icon name="search" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索收藏夹"
            autoFocus
          />
        </label>
        <FolderTree
          value={selected}
          onChange={setSelected}
          multiple
          query={query}
        />
        <footer>
          {selected.length ? (
            <span>将加入 {selected.length} 个收藏夹</span>
          ) : (
            <span>请选择至少一个收藏夹</span>
          )}
          <small>原有收藏夹归属不会被移除</small>
        </footer>
      </div>
    </Modal>,
    document.body,
  );
}

function NumericFilters({ values, update }) {
  return (
    <div className="s4-candidate-number-filters">
      <label>
        <span>年限 ≥</span>
        <input
          type="number"
          min="0"
          step="1"
          value={values.yearsMin}
          onChange={(event) => update("yearsMin", event.target.value)}
          aria-label="最低工作年限"
        />
        <span>年</span>
      </label>
      <label>
        <span>年龄</span>
        <input
          type="number"
          min="18"
          max="80"
          value={values.ageMin}
          onChange={(event) => update("ageMin", event.target.value)}
          placeholder="下限"
          aria-label="最低年龄"
        />
        <span>至</span>
        <input
          type="number"
          min="18"
          max="80"
          value={values.ageMax}
          onChange={(event) => update("ageMax", event.target.value)}
          placeholder="上限"
          aria-label="最高年龄"
        />
        <span>岁</span>
      </label>
    </div>
  );
}

export const candidateFilterDefaults = {
  companies: [],
  industries: [],
  education: [],
  locations: [],
  opportunity: [],
  pipeline: "",
  title: "",
  favorite: "all",
  yearsMin: "",
  ageMin: "",
  ageMax: "",
};

export function CandidateFilterBar({
  query,
  setQuery,
  values,
  setValues,
  columnMenu,
}) {
  const [expanded, setExpanded] = useState(true);
  const update = (key, value) =>
    setValues((current) => ({ ...current, [key]: value }));
  const active = [
    values.companies.length,
    values.industries.length,
    values.education.length,
    values.locations.length,
    values.opportunity.length,
    values.pipeline && values.pipeline !== "全部" ? 1 : 0,
    values.title ? 1 : 0,
    values.favorite !== "all" ? 1 : 0,
    values.yearsMin ? 1 : 0,
    values.ageMin || values.ageMax ? 1 : 0,
  ].reduce((sum, item) => sum + Number(item || 0), 0);
  const chips = [
    values.companies.length
      ? ["公司", values.companies.length, "companies"]
      : null,
    values.industries.length
      ? ["行业", values.industries.length, "industries"]
      : null,
    values.education.length
      ? ["学历", values.education.length, "education"]
      : null,
    values.locations.length
      ? ["地点", values.locations.length, "locations"]
      : null,
    values.opportunity.length
      ? ["机会情况", values.opportunity.length, "opportunity"]
      : null,
    values.pipeline && values.pipeline !== "全部"
      ? [values.pipeline, "", "pipeline"]
      : null,
    values.title ? [`职位：${values.title}`, "", "title"] : null,
    values.favorite !== "all"
      ? [
          values.favorite === "favorited"
            ? "收藏夹：全部"
            : values.favorite === "unfiled"
              ? "收藏夹：未收藏"
              : `收藏夹：${values.favorite
                  .replace(/^folder:/, "")
                  .split("/")
                  .at(-1)}`,
          "",
          "favorite",
        ]
      : null,
    values.yearsMin ? [`年限 ≥ ${values.yearsMin} 年`, "", "yearsMin"] : null,
    values.ageMin || values.ageMax
      ? [`年龄 ${values.ageMin || 18}–${values.ageMax || 80} 岁`, "", "age"]
      : null,
  ].filter(Boolean);
  const clearKey = (key) => {
    if (
      [
        "companies",
        "industries",
        "education",
        "locations",
        "opportunity",
      ].includes(key)
    )
      update(key, []);
    else if (key === "favorite") update(key, "all");
    else if (key === "age")
      setValues((current) => ({ ...current, ageMin: "", ageMax: "" }));
    else update(key, "");
  };
  return (
    <section className="s4-candidate-filter-shell">
      <div className="s4-candidate-search-row">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="搜索姓名、公司、职位、技能、经历或原始简历内容"
        />
        <button
          type="button"
          className={`s4-candidate-filter-toggle ${expanded ? "is-open" : ""}`}
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          <Icon name="filter" />
          <span>筛选</span>
          {active ? <em>{active}</em> : null}
          <Icon name={expanded ? "chevronUp" : "chevronDown"} />
        </button>
        <div className="s4-candidate-column-menu">{columnMenu}</div>
      </div>
      {chips.length ? (
        <div className="s4-candidate-filter-chips">
          {chips.map(([label, count, key]) => (
            <button type="button" key={key} onClick={() => clearKey(key)}>
              <span>
                {label}
                {count ? ` · ${count}` : ""}
              </span>
              <Icon name="close" />
            </button>
          ))}
          <button
            type="button"
            className="is-clear"
            onClick={() => setValues(candidateFilterDefaults)}
          >
            清空全部
          </button>
        </div>
      ) : null}
      {expanded ? (
        <div className="s4-candidate-filter-area">
          <div>
            <SelectMenu
              label="公司"
              value={values.companies}
              options={[
                "星澜机器人",
                "拓界机器人",
                "灵跃科技",
                "穹顶智能",
                "上海人工智能实验室",
                "智源研究院",
                "达摩院",
                "腾讯 Robotics X",
              ]}
              multiple
              searchable
              creatable
              onChange={(value) => update("companies", value)}
            />
            <IndustryCascade
              value={values.industries}
              onChange={(value) => update("industries", value)}
            />
            <SelectMenu
              label="学历"
              value={values.education}
              options={["专科", "本科", "硕士", "博士"]}
              multiple
              onChange={(value) => update("education", value)}
            />
            <SelectMenu
              label="地点"
              value={values.locations}
              options={["北京", "上海", "深圳", "杭州", "广州"]}
              multiple
              searchable
              creatable
              onChange={(value) => update("locations", value)}
            />
            <SelectMenu
              label="机会情况"
              value={values.opportunity}
              options={[
                "是 · 处于跳槽意愿中",
                "否 · 暂无跳槽意愿",
                "固定看 · 长期关注",
                "未标注",
              ]}
              multiple
              onChange={(value) => update("opportunity", value)}
            />
          </div>
          <div>
            <SelectMenu
              label="流程状态"
              value={values.pipeline}
              options={["全部", "在流程中", "不在流程中"]}
              onChange={(value) => update("pipeline", value)}
            />
            <label className="s4-candidate-title-filter">
              <input
                value={values.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="职位（如：算法工程师 / 产品经理）"
                aria-label="职位筛选"
              />
            </label>
            <FavoriteFilter
              value={values.favorite}
              onChange={(value) => update("favorite", value)}
            />
            <NumericFilters values={values} update={update} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
