import { useMemo, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { Button, SearchField, StatusBadge } from "../stage1/ui";
import { RelationshipCanvas } from "./RelationshipCanvas";

function ReviewHeader({ eyebrow, title, summary, onClose }) {
  return (
    <header className="s3-review-header">
      <div>
        <button type="button" onClick={onClose}>
          <Icon name="chevronLeft" />
          返回对话
        </button>
        <span>
          <small>{eyebrow}</small>
          <h1>{title}</h1>
        </span>
      </div>
      <p>{summary}</p>
    </header>
  );
}

function ContextReviewPanel({
  eyebrow,
  title,
  items,
  selectedId,
  onSelect,
  relationshipViews,
  decisions,
  onDecision,
}) {
  const resolveDecisionState = (item) => {
    const decision = item.decisionKey ? decisions[item.decisionKey] : null;
    if (decision === "write") {
      return { ...item, status: "已确认写入", tone: "success" };
    }
    if (decision === "skip") {
      return { ...item, status: "本批次不写入", tone: "neutral" };
    }
    return item;
  };
  const resolvedItems = items.map(resolveDecisionState);
  const selected =
    resolvedItems.find((item) => item.id === selectedId) || resolvedItems[0];
  const sourceView = relationshipViews.find(
    (view) => view.id === selected.viewId,
  );
  const contextualView = {
    ...sourceView,
    defaultSelection: selected.selection || sourceView.defaultSelection,
  };
  return (
    <div className="s3-context-review">
      <aside className="s3-context-change-list" aria-label={title}>
        <div className="s3-master-list-title">
          <span>
            <b>{title}</b>
            <small>{eyebrow}</small>
          </span>
          <small>{items.length} 条重点变化</small>
        </div>
        <div className="s3-context-change-items">
          {resolvedItems.map((item) => (
            <button
              type="button"
              className={item.id === selected.id ? "is-active" : ""}
              aria-selected={item.id === selected.id}
              key={item.id}
              onClick={() => onSelect(item.id)}
            >
              <span>
                <b>{item.title}</b>
                <small>{item.summary}</small>
                <em>{item.meta}</em>
              </span>
              <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
              <Icon name="chevronRight" />
            </button>
          ))}
        </div>
      </aside>
      <section
        className="s3-context-graph"
        aria-label={`${selected.title}关系影响`}
      >
        <header className="s3-context-impact-header">
          <span>
            <small className="s3-detail-kicker">本批次变化影响</small>
            <h2>{selected.title}</h2>
            <p>{selected.impact}</p>
          </span>
          <StatusBadge tone={selected.tone}>{selected.status}</StatusBadge>
        </header>
        <RelationshipCanvas
          key={`${selected.id}-${selected.viewId}`}
          views={[contextualView]}
          decisions={decisions}
          onDecision={onDecision}
        />
      </section>
    </div>
  );
}

export function ContactReviewWorkspace({ contacts, onClose, onApply }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(
    () =>
      new Set(
        contacts
          .filter((item) => item.name !== "人力资源副总裁线索")
          .map((item) => item.id),
      ),
  );
  const [focusedId, setFocusedId] = useState(contacts[0]?.id);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return contacts;
    return contacts.filter((item) =>
      `${item.name} ${item.role} ${item.company} ${item.category} ${item.phone} ${item.email}`
        .toLowerCase()
        .includes(keyword),
    );
  }, [contacts, query]);
  const focused = contacts.find((item) => item.id === focusedId) || contacts[0];
  const toggle = (id) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  return (
    <section className="s3-review-workspace" aria-label="联系人审核工作区">
      <ReviewHeader
        eyebrow="客户开发 · 公司与联系人审核"
        title="星澜机器人招聘合作"
        summary={`已选 ${selected.size} 项结果`}
        onClose={onClose}
      />
      <div className="s3-review-toolbar">
        <div>
          <b>2 位联系人具备手机或邮箱</b>
          <small>陈雨是首选联系对象；刘健可作为已有关系引荐。</small>
        </div>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="搜索姓名、角色、公司、手机或邮箱"
        />
      </div>
      <div className="s3-review-body">
        <div className="s3-contact-list">
          <div className="s3-contact-head">
            <span />
            <span>联系人或线索</span>
            <span>公司与角色</span>
            <span>手机 / 邮箱</span>
            <span>身份判断</span>
            <span />
          </div>
          {visible.map((contact) => (
            <button
              type="button"
              className={focused.id === contact.id ? "is-active" : ""}
              aria-selected={focused.id === contact.id}
              key={contact.id}
              onClick={() => {
                setFocusedId(contact.id);
                setMobileDetailOpen(true);
              }}
            >
              <span onClick={(event) => event.stopPropagation()}>
                <input
                  type="checkbox"
                  aria-label={`选择 ${contact.name}`}
                  checked={selected.has(contact.id)}
                  onChange={() => toggle(contact.id)}
                />
              </span>
              <span>
                <b>{contact.name}</b>
                <small>{contact.category}</small>
              </span>
              <span>
                <b>{contact.company}</b>
                <small>{contact.role}</small>
              </span>
              <span>
                <b>{contact.phone || contact.email || "尚未找到"}</b>
                <small>
                  {contact.phone && contact.email ? contact.email : ""}
                </small>
              </span>
              <span>
                <StatusBadge tone={contact.tone}>
                  {contact.confidence}
                </StatusBadge>
              </span>
              <Icon name="chevronRight" />
            </button>
          ))}
          {!visible.length ? (
            <div className="s3-review-empty">
              <Icon name="search" />
              <b>没有符合当前搜索条件的联系人</b>
              <span>清空搜索可以查看全部联系人和线索。</span>
            </div>
          ) : null}
        </div>
        <aside
          className={`s3-review-detail ${mobileDetailOpen ? "is-mobile-open" : ""}`}
        >
          <button
            type="button"
            className="s3-mobile-back"
            onClick={() => setMobileDetailOpen(false)}
          >
            <Icon name="chevronLeft" />
            返回列表
          </button>
          <header>
            <span>
              <small className="s3-detail-kicker">
                联系人详情 · {focused.category}
              </small>
              <h2>{focused.name}</h2>
              <p>
                {focused.company} · {focused.role}
              </p>
            </span>
            {focused.preferred ? (
              <StatusBadge tone="success">首选联系对象</StatusBadge>
            ) : null}
          </header>
          <section>
            <h3>联系方式</h3>
            <dl className="s3-detail-list">
              <div>
                <dt>手机</dt>
                <dd>{focused.phone || "尚未找到"}</dd>
              </div>
              <div>
                <dt>邮箱</dt>
                <dd>{focused.email || "尚未找到"}</dd>
              </div>
            </dl>
          </section>
          <section>
            <h3>身份与来源</h3>
            <p>{focused.source}</p>
            <StatusBadge tone={focused.tone}>{focused.confidence}</StatusBadge>
          </section>
          <section className="is-note">
            <h3>本次审核的影响</h3>
            <p>
              选中只表示确认保存公司、联系人或联系人线索，不会发送消息，也不会把线索自动变成正式联系人。
            </p>
          </section>
        </aside>
      </div>
      <footer className="s3-review-footer">
        <span>
          <b>确认保存 {selected.size} 项结果</b>
          <small>
            对外联系将在返回当前任务后单独确认对象、渠道和消息内容。
          </small>
        </span>
        <Button
          tone="primary"
          disabled={!selected.size}
          onClick={() => onApply(Array.from(selected))}
        >
          保存审核结果
        </Button>
      </footer>
    </section>
  );
}

export function LandscapeReviewWorkspace({
  companies,
  people,
  relationshipViews,
  onClose,
  onApply,
}) {
  const [tab, setTab] = useState("organizations");
  const [focusedOrganizationChange, setFocusedOrganizationChange] = useState(
    "organization-structure",
  );
  const [focusedPersonChange, setFocusedPersonChange] = useState("map-linhao");
  const [focusedGap, setFocusedGap] = useState("gap-wangyi");
  const reviewBodyRef = useRef(null);
  const [pendingDecisions, setPendingDecisions] = useState({
    wangyi: "pending",
    qiongding: "pending",
  });
  const confirmedPendingCount = Object.values(pendingDecisions).filter(
    (value) => value === "write",
  ).length;
  const unresolvedPendingCount = Object.values(pendingDecisions).filter(
    (value) => value === "pending",
  ).length;
  const decidePending = (key, value) =>
    setPendingDecisions((current) => ({ ...current, [key]: value }));
  const switchTab = (nextTab) => {
    setTab(nextTab);
    requestAnimationFrame(() => reviewBodyRef.current?.scrollTo({ top: 0 }));
  };
  const organizationChanges = useMemo(
    () => [
      {
        id: "organization-structure",
        title: "星澜机器人组织层级补充",
        summary: "新增具身智能中心下 2 个方向团队，并关联 3 位人物。",
        meta: "新增 5 个对象 · 6 条关系",
        impact:
          "变化涉及星澜机器人、具身智能中心、VLA 算法组、机器人学习组和三位人物。点击图中节点或连线可查看本批次证据与关系方向。",
        status: "已核验",
        tone: "success",
        viewId: "organization",
        selection: { kind: "node", id: "org-vla-team" },
      },
      {
        id: "organization-ecosystem",
        title: "目标公司生态关系更新",
        summary: "新增星澜与灵跃的竞争关系；穹顶相关关系仍待确认。",
        meta: "新增 2 条 · 待确认 1 条",
        impact:
          "变化影响星澜、灵跃、穹顶与上海人工智能实验室之间的竞争、合作和人才来源关系。",
        status: "有待确认项",
        tone: "warning",
        viewId: "ecosystem",
        selection: { kind: "edge", id: "eco-e2" },
      },
      {
        id: "organization-role",
        title: "方向与关键角色覆盖更新",
        summary: "补充 VLA、操作策略与灵巧操作覆盖，发现 2 个角色缺口。",
        meta: "4 个方向 · 3 类角色",
        impact:
          "变化用于比较不同公司的方向覆盖和关键角色缺口，拓界技术负责人和数据闭环负责人仍需补充。",
        status: "存在缺口",
        tone: "warning",
        viewId: "direction-role",
        selection: { kind: "node", id: "matrix-head" },
      },
      {
        id: "organization-flow",
        title: "近 24 个月人才流动更新",
        summary: "核验 18 条履历，形成 4 条主要人才流向。",
        meta: "18 条记录 · 4 条主要流向",
        impact:
          "变化显示上海人工智能实验室、拓界和高校实验室向星澜、灵跃与穹顶的人才流动。",
        status: "已核验",
        tone: "success",
        viewId: "talent-flow",
        selection: { kind: "edge", id: "flow-e1" },
      },
    ],
    [],
  );
  const personChanges = useMemo(() => {
    const personById = Object.fromEntries(
      people.map((person) => [person.id, person]),
    );
    return [
      {
        id: "map-linhao",
        title: "林昊的人物关系补充",
        summary: "新增与周明远的共同论文和前同事关系。",
        meta: `${personById["map-linhao"]?.company || "拓界机器人"} · 已关联候选人`,
        impact:
          "变化补充林昊与周明远、陈楚宁等人的合作和任职关系，可继续沿直接关系查看证据。",
        status: "已核验",
        tone: "success",
        viewId: "people",
        selection: { kind: "node", id: "people-linhao" },
      },
      {
        id: "map-zhaoxingyu",
        title: "赵星羽的可联系路径补充",
        summary: "找到 2 条可解释联系路径，最短路径为 2 段。",
        meta: "星澜机器人 · VLA 算法负责人",
        impact:
          "变化补充刘健、陈雨与赵星羽之间的可解释联系路径，不会自动发起联系。",
        status: "路径可用",
        tone: "success",
        viewId: "contact-path",
        selection: { kind: "node", id: "path-zhao" },
      },
      {
        id: "map-zhoumingyuan",
        title: "周明远的成果关系补充",
        summary: "新增专利发明人与学术合作关系，当前仍为人物线索。",
        meta: `${personById["map-zhoumingyuan"]?.company || "穹顶智能"} · 人物线索`,
        impact:
          "变化把周明远与机器人策略迁移专利及共同发明人关联，尚未自动转为正式候选人。",
        status: "较高可信",
        tone: "info",
        viewId: "academic",
        selection: { kind: "node", id: "academic-zhou" },
      },
      {
        id: "map-chenchuning",
        title: "陈楚宁的合作关系补充",
        summary: "确认灵巧操作方向合作关系和已有邮箱线索。",
        meta: `${personById["map-chenchuning"]?.company || "灵跃科技"} · 已关联候选人`,
        impact: "变化补充陈楚宁在灵巧操作方向的人物合作网络，并保留来源证据。",
        status: "已核验",
        tone: "success",
        viewId: "people",
        selection: { kind: "node", id: "people-chen" },
      },
      {
        id: "map-wangyi",
        title: "王奕的身份与成果关系",
        summary: "同名作者、专利发明人与公开职位的单位时间线存在冲突。",
        meta: "星澜机器人 · 身份待确认",
        impact:
          "变化可能把王奕与专利、论文和星澜机器人关联；确认前不会自动写入该身份关系。",
        status: "待确认",
        tone: "warning",
        decisionKey: "wangyi",
        viewId: "academic",
        selection: { kind: "node", id: "academic-wang" },
      },
    ];
  }, [people]);
  const gapChanges = useMemo(
    () => [
      {
        id: "gap-wangyi",
        title: "王奕身份关系冲突",
        summary:
          "论文作者与公开活动名单可能属于同一人，但单位时间线不能完全对应。",
        meta: "2 组证据冲突 · 等待用户确认",
        impact:
          "冲突影响王奕与专利、论文及星澜机器人的身份关系。可以查看完整关系上下文后决定是否写入。",
        status: "待确认",
        tone: "warning",
        decisionKey: "wangyi",
        viewId: "academic",
        selection: { kind: "node", id: "academic-wang" },
      },
      {
        id: "gap-tuojie-head",
        title: "拓界机器人技术负责人仍缺失",
        summary: "已确认方向和团队，但未找到可稳定核验的技术负责人。",
        meta: "1 个关键角色缺口",
        impact:
          "缺口位于操作策略方向的负责人角色，后续可围绕论文通讯作者、专利发明人和公开会议讲者继续探索。",
        status: "待补充",
        tone: "info",
        viewId: "direction-role",
        selection: { kind: "node", id: "matrix-head" },
      },
      {
        id: "gap-qiongding",
        title: "穹顶智能组织关系",
        summary: "已确认具身算法平台和技术方向，具体汇报及生态关系仍不明确。",
        meta: "1 条关系待确认",
        impact:
          "不确定项影响穹顶与星澜的技术路线关系，以及后续组织上下级判断。确认前保留原始证据和冲突说明。",
        status: "待确认",
        tone: "warning",
        decisionKey: "qiongding",
        viewId: "ecosystem",
        selection: { kind: "edge", id: "eco-e3" },
      },
    ],
    [],
  );
  return (
    <section className="s3-review-workspace" aria-label="知识图谱更新审核">
      <ReviewHeader
        eyebrow="人才摸排 · 变更批次审核"
        title="3 个独立知识图谱的本批次变化"
        summary="本批次 4 家公司 · 30 位人物 · 10 条关系"
        onClose={onClose}
      />
      <div className="s3-review-toolbar is-tabbed">
        <div
          className="s3-review-tabs app-tabs"
          role="tablist"
          aria-label="知识图谱审核内容"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "organizations"}
            className={tab === "organizations" ? "is-active" : ""}
            onClick={() => switchTab("organizations")}
          >
            公司与组织 <em>4</em>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "people"}
            className={tab === "people" ? "is-active" : ""}
            onClick={() => switchTab("people")}
          >
            人物与关系 <em>30</em>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "gaps"}
            className={tab === "gaps" ? "is-active" : ""}
            onClick={() => switchTab("gaps")}
          >
            冲突与待补充 <em>3</em>
          </button>
        </div>
        <p>待确认内容不会自动写入；用户明确确认后可以写入，并保留确认记录。</p>
      </div>
      <div className="s3-landscape-review-body" ref={reviewBodyRef}>
        {tab === "organizations" ? (
          <ContextReviewPanel
            eyebrow={`${companies.length} 家公司`}
            title="公司与组织变化"
            items={organizationChanges}
            selectedId={focusedOrganizationChange}
            onSelect={setFocusedOrganizationChange}
            relationshipViews={relationshipViews}
            decisions={pendingDecisions}
            onDecision={decidePending}
          />
        ) : null}
        {tab === "people" ? (
          <ContextReviewPanel
            eyebrow="本批次重点人物"
            title="人物与关系变化"
            items={personChanges}
            selectedId={focusedPersonChange}
            onSelect={setFocusedPersonChange}
            relationshipViews={relationshipViews}
            decisions={pendingDecisions}
            onDecision={decidePending}
          />
        ) : null}
        {tab === "gaps" ? (
          <ContextReviewPanel
            eyebrow="影响本批次写入"
            title="冲突与待补充"
            items={gapChanges}
            selectedId={focusedGap}
            onSelect={setFocusedGap}
            relationshipViews={relationshipViews}
            decisions={pendingDecisions}
            onDecision={decidePending}
          />
        ) : null}
      </div>
      <footer className="s3-review-footer s3-landscape-review-complete">
        <div className="s3-landscape-destination-copy">
          <b>
            {unresolvedPendingCount
              ? `还有 ${unresolvedPendingCount} 项待确认内容必须处理`
              : `本批次内容已处理完毕${
                  confirmedPendingCount
                    ? `，含 ${confirmedPendingCount} 项用户确认内容`
                    : ""
                }`}
          </b>
          <small>
            完成审核后返回任务对话，再决定按主题保存为多个新图谱、更新对应已有图谱或只保留报告。
          </small>
        </div>
        <Button
          tone="primary"
          disabled={unresolvedPendingCount > 0}
          onClick={() => onApply(pendingDecisions)}
        >
          完成审核并返回对话
        </Button>
      </footer>
    </section>
  );
}

export function PositionMatchReviewWorkspace({ matches, onClose, onContinue }) {
  const [focusedId, setFocusedId] = useState(matches[0]?.id);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const focused = matches.find((item) => item.id === focusedId) || matches[0];
  return (
    <section className="s3-review-workspace" aria-label="候选人岗位匹配审核">
      <ReviewHeader
        eyebrow="候选人求职 · 系统内岗位匹配"
        title="林昊的岗位建议"
        summary="7 个有效岗位 · 3 个值得查看"
        onClose={onClose}
      />
      <div className="s3-review-toolbar">
        <div>
          <b>只匹配 Hunter 中的有效岗位</b>
          <small>没有搜索公开市场职位，也不会自动联系林昊。</small>
        </div>
      </div>
      <div className="s3-match-review-body">
        <div className="s3-match-list">
          <div className="s3-master-list-title">
            <b>岗位列表</b>
            <small>{matches.length} 个结果</small>
          </div>
          {matches.map((match) => (
            <button
              type="button"
              className={focused.id === match.id ? "is-active" : ""}
              aria-selected={focused.id === match.id}
              key={match.id}
              onClick={() => {
                setFocusedId(match.id);
                setMobileDetailOpen(true);
              }}
            >
              <span>
                <b>{match.title}</b>
                <small>
                  {match.company} · {match.location} · {match.status}
                </small>
              </span>
              <strong>
                {match.score}
                <small>匹配分</small>
              </strong>
              <StatusBadge tone={match.tone}>
                {match.recommendation}
              </StatusBadge>
              <Icon name="chevronRight" />
            </button>
          ))}
        </div>
        <aside
          className={`s3-match-detail ${mobileDetailOpen ? "is-mobile-open" : ""}`}
        >
          <button
            type="button"
            className="s3-mobile-back"
            onClick={() => setMobileDetailOpen(false)}
          >
            <Icon name="chevronLeft" />
            返回岗位列表
          </button>
          <header>
            <span>
              <small className="s3-detail-kicker">岗位详情</small>
              <h2>{focused.title}</h2>
              <p>
                {focused.company} · {focused.location}
              </p>
            </span>
            <strong>
              {focused.score}
              <small>/ 100</small>
            </strong>
          </header>
          <section>
            <h3>推荐理由</h3>
            <p>{focused.reason}</p>
          </section>
          <section className="is-risk">
            <h3>风险提示</h3>
            <p>{focused.risk}</p>
          </section>
          <section>
            <h3>仍需确认</h3>
            <p>{focused.gaps}</p>
          </section>
          <section className="is-note">
            <h3>建议沟通要点</h3>
            <p>{focused.talkingPoint}</p>
          </section>
        </aside>
      </div>
      <footer className="s3-review-footer">
        <span>
          <b>完成岗位结果查看</b>
          <small>
            返回后可以用自然语言说明优先询问哪些岗位；Hunter 不代替猎头联系。
          </small>
        </span>
        <Button tone="primary" onClick={onContinue}>
          返回任务并继续
        </Button>
      </footer>
    </section>
  );
}
