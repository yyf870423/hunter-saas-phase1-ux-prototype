import { useMemo, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { Button, SearchField, StatusBadge } from "../stage1/ui";
import { RelationshipCanvas } from "./RelationshipCanvas";
import { organizationRoles, organizationScope, organizationViews } from "./organization-mapping-data";

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
          .filter(
            (item) => item.companyId && item.name !== "人力资源副总裁线索",
          )
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
                  disabled={!contact.companyId}
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
              {focused.companyId
                ? `保存位置：${focused.company} / 联系人`
                : "所属公司尚未确认，仅保留在当前任务作为人物线索。"}
            </p>
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

export function LandscapeReviewWorkspace({ companies = organizationScope, onClose, onApply }) {
  const roles = companies.flatMap((company) => company.roles.map((role) => ({ ...role, companyId: company.id, company: company.name })));
  const [tab, setTab] = useState("organizations");
  const [selected, setSelected] = useState({});
  const [decisions, setDecisions] = useState({ wangyi: "pending", qiongding: "pending" });
  const views = organizationViews({}, companies);
  const organizationItems = companies.map((company) => ({
    id: company.id, title: company.name + "组织与关键岗位", summary: company.organization,
    meta: company.roles.length + " 个关键岗位", impact: "按公司核对组织层级、岗位职责与任职人；未核实的关系不作为已确认事实。",
    status: company.roles.some((role) => role.gap) ? "有待核实项" : "已定位任职人", tone: company.roles.some((role) => role.gap) ? "warning" : "success",
    viewId: "organization-" + company.id,
  }));
  const roleItems = roles.map((role) => ({
    id: role.companyId + "-" + role.id, title: role.company + " · " + role.title, summary: role.name || "任职人待核实",
    meta: role.team || "关键岗位", impact: role.gap || role.summary, status: role.gap ? "待核实" : "已定位任职人",
    tone: role.gap ? "warning" : "success", decisionKey: role.decisionKey, viewId: "organization-" + role.companyId,
    selection: { kind: "node", id: role.companyId + (role.name ? "-person-" : "-role-") + role.id },
  }));
  const items = tab === "organizations" ? organizationItems : tab === "people" ? roleItems : roleItems.filter((item) => item.tone === "warning");
  const titles = { organizations: "公司与组织", people: "关键岗位与任职人", gaps: "冲突与待补充" };
  return <section className="s3-review-workspace" aria-label="人才地图更新审核">
    <ReviewHeader eyebrow="公司组织梳理 · 变更批次审核" title="目标公司人才地图的本批次变化" summary={companies.length + " 家公司 · " + roles.length + " 个关键岗位 · " + roles.filter((role) => role.name).length + " 位已定位任职人或线索"} onClose={onClose} />
    <div className="s3-review-toolbar is-tabbed"><div className="s3-review-tabs app-tabs" role="tablist" aria-label="人才地图审核内容">
      {Object.entries(titles).map(([value, label]) => <button type="button" role="tab" key={value} aria-selected={tab === value} className={tab === value ? "is-active" : ""} onClick={() => setTab(value)}>{label}</button>)}
    </div><p>任职人未知时保留岗位；未核实项可留待后续补充，不自动关联候选人或加入储备。</p></div>
    <div className="s3-landscape-review-body"><ContextReviewPanel eyebrow="公司组织梳理" title={titles[tab]} items={items} selectedId={selected[tab]} onSelect={(id) => setSelected((current) => ({ ...current, [tab]: id }))} relationshipViews={views} decisions={decisions} onDecision={(key, value) => setDecisions((current) => ({ ...current, [key]: value }))} /></div>
    <footer className="s3-review-footer s3-landscape-review-complete"><div className="s3-landscape-destination-copy"><b>已核验结构可先形成地图，缺口继续保留</b><small>完成审核后确认保存到人才地图；不创建公司关系或候选人关系图谱。</small></div><Button tone="primary" onClick={() => onApply(decisions)}>完成审核并返回对话</Button></footer>
  </section>;
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
