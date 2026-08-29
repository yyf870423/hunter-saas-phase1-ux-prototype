import { useEffect, useMemo, useState } from "react";
import { Icon } from "../components/Icon";
import { Button, IconButton, SearchField, StatusBadge } from "../stage1/ui";

function recommendationTone(recommendation) {
  if (recommendation.includes("强烈") || recommendation.includes("建议联系"))
    return "success";
  if (recommendation.includes("不建议")) return "danger";
  if (recommendation.includes("谨慎")) return "warning";
  return "neutral";
}

export function InspectionPanel({ item, onClose }) {
  if (!item) return null;
  const isTask = item.kind === "task";
  const checkpoints = item.checkpoints || [
    {
      title: "数据读取完成",
      detail: "输入范围与来源权限已检查",
      done: true,
    },
    {
      title: "身份与重复检查完成",
      detail: "未生成重复候选人记录",
      done: true,
    },
    {
      title: "等待业务审核",
      detail: "用户决定后从当前检查点继续",
      done: false,
    },
  ];
  return (
    <aside className="s2-inspector" aria-label="当前检查内容">
      <header>
        <span>
          <small>{isTask ? item.kindLabel || "相关处理" : "证据集合"}</small>
          <h2>{item.title}</h2>
        </span>
        <IconButton icon="close" label="关闭检查区" onClick={onClose} />
      </header>
      {isTask ? (
        <div className="s2-inspector-content">
          <dl className="s2-key-values">
            <div>
              <dt>当前状态</dt>
              <dd>
                <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
              </dd>
            </div>
            <div>
              <dt>当前动作</dt>
              <dd>{item.action}</dd>
            </div>
            <div>
              <dt>本次耗时</dt>
              <dd>{item.duration}</dd>
            </div>
            <div>
              <dt>结果去向</dt>
              <dd>
                {item.resultDestination ||
                  "具身智能 VLA 算法负责人 · 候选人审核"}
              </dd>
            </div>
          </dl>
          <section>
            <h3>处理检查点</h3>
            <ol className="s2-checkpoints">
              {checkpoints.map((checkpoint) => (
                <li
                  className={checkpoint.done ? "is-done" : undefined}
                  key={checkpoint.title}
                >
                  <Icon name={checkpoint.done ? "check" : "clock"} />
                  <span>
                    <b>{checkpoint.title}</b>
                    <small>{checkpoint.detail}</small>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      ) : (
        <div className="s2-inspector-content">
          <p className="s2-inspector-lead">
            {item.lead ||
              "本次岗位边界由三类来源共同确认。存在冲突的内容不会进入自动筛选门槛。"}
          </p>
          <div className="s2-source-list">
            {item.rows.map((row, index) => (
              <article key={row.finding}>
                <header>
                  <b>{row.source}</b>
                  <StatusBadge tone="success">{row.confidence}</StatusBadge>
                </header>
                <p>{row.finding}</p>
                <footer>
                  <span>核验时间：{row.freshness}</span>
                  <button type="button">
                    查看来源 <Icon name="chevronRight" />
                  </button>
                </footer>
              </article>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

export function CandidateReviewWorkspace({ candidates, onClose, onApply }) {
  const [query, setQuery] = useState(
    () => sessionStorage.getItem("hunter-review-query") || "",
  );
  const [tab, setTab] = useState(
    () => sessionStorage.getItem("hunter-review-tab") || "all",
  );
  const [sortDescending, setSortDescending] = useState(
    () => sessionStorage.getItem("hunter-review-sort") !== "asc",
  );
  const [selected, setSelected] = useState(() => {
    let restored;
    try {
      restored = JSON.parse(
        sessionStorage.getItem("hunter-review-selected") || "null",
      );
    } catch {
      restored = null;
    }
    return new Set(
      restored
        ? restored
        : candidates
            .filter((candidate) => candidate.score >= 85)
            .map((candidate) => candidate.id),
    );
  });
  const [focused, setFocused] = useState(
    () => sessionStorage.getItem("hunter-review-focused") || candidates[0]?.id,
  );
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  useEffect(() => {
    sessionStorage.setItem("hunter-review-query", query);
    sessionStorage.setItem("hunter-review-tab", tab);
    sessionStorage.setItem(
      "hunter-review-sort",
      sortDescending ? "desc" : "asc",
    );
    sessionStorage.setItem(
      "hunter-review-selected",
      JSON.stringify(Array.from(selected)),
    );
    sessionStorage.setItem("hunter-review-focused", focused || "");
  }, [focused, query, selected, sortDescending, tab]);
  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return candidates
      .filter((candidate) => {
        const matchesQuery =
          !keyword ||
          `${candidate.name} ${candidate.company} ${candidate.role} ${candidate.skills.join(" ")}`
            .toLowerCase()
            .includes(keyword);
        const matchesTab =
          tab === "all" ||
          (tab === "strong"
            ? candidate.score >= 85
            : tab === "reserve"
              ? candidate.score >= 75 && candidate.score < 85
              : candidate.score < 75);
        return matchesQuery && matchesTab;
      })
      .sort((left, right) =>
        sortDescending ? right.score - left.score : left.score - right.score,
      );
  }, [candidates, query, sortDescending, tab]);
  const current =
    candidates.find((candidate) => candidate.id === focused) || candidates[0];
  const toggle = (id) => {
    setSelected((currentSet) => {
      const next = new Set(currentSet);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const selectedVisible = visible.filter((candidate) =>
    selected.has(candidate.id),
  );
  return (
    <section className="s2-review-workspace" aria-label="候选人审核工作区">
      <header className="s2-review-header">
        <div>
          <button type="button" onClick={onClose}>
            <Icon name="chevronLeft" />
            返回对话
          </button>
          <span>
            <small>岗位招聘 · 候选人审核</small>
            <h1>具身智能 VLA 算法负责人</h1>
          </span>
        </div>
        <div>
          <b>{selected.size}</b>
          <span>已选候选人</span>
        </div>
      </header>
      <div className="s2-review-toolbar">
        <div
          className="s2-review-tabs app-tabs"
          role="tablist"
          aria-label="候选人分层"
        >
          {[
            ["all", "全部", candidates.length],
            [
              "strong",
              "建议联系",
              candidates.filter((item) => item.score >= 85).length,
            ],
            [
              "reserve",
              "储备与观察",
              candidates.filter((item) => item.score >= 75 && item.score < 85)
                .length,
            ],
            [
              "low",
              "不建议",
              candidates.filter((item) => item.score < 75).length,
            ],
          ].map(([value, label, count]) => (
            <button
              type="button"
              role="tab"
              aria-selected={tab === value}
              className={tab === value ? "is-active" : ""}
              key={value}
              onClick={() => setTab(value)}
            >
              {label}
              <em>{count}</em>
            </button>
          ))}
        </div>
        <div className="s2-review-filter-actions">
          <button
            type="button"
            className="s2-review-sort"
            aria-label={`匹配分${sortDescending ? "从高到低" : "从低到高"}`}
            onClick={() => setSortDescending((current) => !current)}
          >
            <Icon name="filter" />
            匹配分{sortDescending ? "从高到低" : "从低到高"}
          </button>
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="搜索姓名、公司、职位或技能"
          />
        </div>
      </div>
      <div className="s2-review-body">
        <div className="s2-candidate-table">
          <div className="s2-candidate-head">
            <span>
              <input
                type="checkbox"
                aria-label="选择当前结果"
                checked={
                  visible.length > 0 &&
                  selectedVisible.length === visible.length
                }
                onChange={() =>
                  setSelected((currentSet) => {
                    const next = new Set(currentSet);
                    if (selectedVisible.length === visible.length)
                      visible.forEach((candidate) => next.delete(candidate.id));
                    else visible.forEach((candidate) => next.add(candidate.id));
                    return next;
                  })
                }
              />
            </span>
            <span>候选人</span>
            <span>当前任职</span>
            <span>匹配</span>
            <span>推荐建议</span>
            <span>来源</span>
          </div>
          {visible.map((candidate) => (
            <button
              type="button"
              className={candidate.id === current.id ? "is-active" : ""}
              key={candidate.id}
              onClick={() => {
                setFocused(candidate.id);
                setMobileDetailOpen(true);
              }}
            >
              <span onClick={(event) => event.stopPropagation()}>
                <input
                  type="checkbox"
                  aria-label={`选择 ${candidate.name}`}
                  checked={selected.has(candidate.id)}
                  onChange={() => toggle(candidate.id)}
                />
              </span>
              <span>
                <b>{candidate.name}</b>
                <small>
                  {candidate.city} · {candidate.years} 年 ·{" "}
                  {candidate.education}
                </small>
              </span>
              <span>
                <b>{candidate.role}</b>
                <small>{candidate.company}</small>
              </span>
              <span className="s2-score">
                <b>{candidate.score}</b>
                <small>/ 100</small>
              </span>
              <span>
                <StatusBadge
                  tone={recommendationTone(candidate.recommendation)}
                >
                  {candidate.recommendation}
                </StatusBadge>
              </span>
              <span>
                <small>{candidate.source}</small>
              </span>
            </button>
          ))}
          {!visible.length ? (
            <div className="s2-review-empty">
              <Icon name="search" />
              <b>没有符合当前条件的候选人</b>
              <span>可以清空搜索或切换候选人分层。</span>
            </div>
          ) : null}
        </div>
        <aside
          className={`s2-candidate-detail ${mobileDetailOpen ? "is-mobile-open" : ""}`}
        >
          <button
            type="button"
            className="s2-candidate-mobile-back"
            onClick={() => setMobileDetailOpen(false)}
          >
            <Icon name="chevronLeft" />
            返回候选人列表
          </button>
          <header>
            <span>
              <b>{current.name}</b>
              <small>
                {current.company} · {current.role}
              </small>
            </span>
            <strong>
              {current.score}
              <small>综合分</small>
            </strong>
          </header>
          <section>
            <h2>推荐理由</h2>
            <p>
              {current.strength}
              。其经历与岗位的技术方向、团队阶段和交付要求具有较高重合度。
            </p>
          </section>
          <section className="is-risk">
            <h2>风险提示</h2>
            <p>
              {current.risk}
              。建议在正式联系前优先核实该项，不把不确定内容视为事实。
            </p>
          </section>
          <section>
            <h2>分项匹配</h2>
            <dl className="s2-match-bars">
              {["关键技能", "角色层级", "项目落地", "团队管理"].map(
                (label, index) => {
                  const score = Math.max(
                    58,
                    current.score - index * 5 + (index % 2) * 3,
                  );
                  return (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>
                        <i style={{ width: `${score}%` }} />
                        <span>{score}</span>
                      </dd>
                    </div>
                  );
                },
              )}
            </dl>
          </section>
          <section>
            <h2>关键技能</h2>
            <div className="s2-skill-list">
              {current.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </section>
          <section>
            <h2>建议动作</h2>
            <p>
              {current.score >= 85
                ? "优先加入岗位储备，后续再决定联系范围并核实求职意愿。"
                : current.score >= 75
                  ? "加入岗位储备，补全风险项后再决定是否联系。"
                  : "本轮不建议推进，保留匹配记录供后续参考。"}
            </p>
          </section>
        </aside>
      </div>
      <footer className="s2-review-footer">
        <div className="s2-review-selection-summary">
          <span>
            批量处理已选 <b>{selected.size}</b> 位候选人
          </span>
          <small>右侧详情只用于查看；以下决定应用于左侧已勾选的人选。</small>
        </div>
        <div className="s2-review-direct-actions" aria-label="批量处理动作">
          <small>
            点击后为已勾选候选人建立岗位储备关系并返回当前任务；未勾选候选人继续保留在本轮结果中，不会自动联系候选人。
          </small>
          <div>
            <Button
              tone="primary"
              disabled={!selected.size}
              onClick={() => onApply({ selected: Array.from(selected) })}
            >
              加入岗位储备
            </Button>
          </div>
        </div>
      </footer>
    </section>
  );
}
