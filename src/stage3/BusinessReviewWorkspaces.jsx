import { useMemo, useState } from "react";
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

function PendingDecisionControl({ label, value, onChange }) {
  const confirmed = value === "write";
  return (
    <div className="s3-pending-control">
      <StatusBadge tone={confirmed ? "success" : "warning"}>
        {confirmed ? "已确认写入" : "待确认"}
      </StatusBadge>
      <Button
        tone="secondary"
        size="sm"
        aria-label={confirmed ? `撤销确认${label}` : `确认写入${label}`}
        onClick={() => onChange(confirmed ? "pending" : "write")}
      >
        {confirmed ? "撤销确认" : "确认并写入"}
      </Button>
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
          <small>对外联系将在返回主线后单独确认对象、渠道和消息内容。</small>
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
  const [tab, setTab] = useState("relationships");
  const [focusedPerson, setFocusedPerson] = useState(people[0]);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [pendingDecisions, setPendingDecisions] = useState({
    wangyi: "pending",
    qiongding: "pending",
  });
  const confirmedPendingCount = Object.values(pendingDecisions).filter(
    (value) => value === "write",
  ).length;
  const decidePending = (key, value) =>
    setPendingDecisions((current) => ({ ...current, [key]: value }));
  return (
    <section className="s3-review-workspace" aria-label="人才版图更新审核">
      <ReviewHeader
        eyebrow="人才摸排 · 变更批次审核"
        title="具身智能核心人才版图"
        summary="本批次 4 家公司 · 30 位人物 · 10 条关系"
        onClose={onClose}
      />
      <div className="s3-review-toolbar is-tabbed">
        <div
          className="s3-review-tabs"
          role="tablist"
          aria-label="人才版图审核内容"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "relationships"}
            className={tab === "relationships" ? "is-active" : ""}
            onClick={() => setTab("relationships")}
          >
            关系画布 <em>7</em>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "organizations"}
            className={tab === "organizations" ? "is-active" : ""}
            onClick={() => setTab("organizations")}
          >
            公司与组织 <em>4</em>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "people"}
            className={tab === "people" ? "is-active" : ""}
            onClick={() => setTab("people")}
          >
            人物与关系 <em>30</em>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "gaps"}
            className={tab === "gaps" ? "is-active" : ""}
            onClick={() => setTab("gaps")}
          >
            冲突与待补充 <em>3</em>
          </button>
        </div>
        <p>待确认内容不会自动写入；用户明确确认后可以写入，并保留确认记录。</p>
      </div>
      <div className="s3-landscape-review-body">
        {tab === "relationships" ? (
          <RelationshipCanvas
            views={relationshipViews}
            decisions={pendingDecisions}
            onDecision={decidePending}
          />
        ) : null}
        {tab === "organizations" ? (
          <div className="s3-landscape-grid">
            {companies.map((item) => (
              <article key={item.company}>
                <header>
                  <b>{item.company}</b>
                  <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
                </header>
                <dl>
                  <div>
                    <dt>重点方向</dt>
                    <dd>{item.direction}</dd>
                  </div>
                  <div>
                    <dt>已知组织</dt>
                    <dd>{item.organization}</dd>
                  </div>
                  <div>
                    <dt>关键人物</dt>
                    <dd>{item.people} 位</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : null}
        {tab === "people" ? (
          <div className="s3-landscape-people">
            <div className="s3-landscape-person-list">
              <div className="s3-master-list-title">
                <b>人物列表</b>
                <small>{people.length} 位</small>
              </div>
              {people.map((person) => (
                <button
                  type="button"
                  className={focusedPerson.id === person.id ? "is-active" : ""}
                  aria-selected={focusedPerson.id === person.id}
                  key={person.id}
                  onClick={() => {
                    setFocusedPerson(person);
                    setMobileDetailOpen(true);
                  }}
                >
                  <span>
                    <b>{person.name}</b>
                    <small>
                      {person.company} · {person.role}
                    </small>
                  </span>
                  <StatusBadge
                    tone={
                      person.confidence === "存在冲突" ? "warning" : "neutral"
                    }
                  >
                    {person.identity}
                  </StatusBadge>
                  <Icon name="chevronRight" />
                </button>
              ))}
            </div>
            <aside
              className={`s3-landscape-person-detail ${mobileDetailOpen ? "is-mobile-open" : ""}`}
            >
              <button
                type="button"
                className="s3-mobile-back"
                onClick={() => setMobileDetailOpen(false)}
              >
                <Icon name="chevronLeft" />
                返回人物列表
              </button>
              <header className="s3-landscape-detail-header">
                <small className="s3-detail-kicker">人物详情</small>
                <h2>{focusedPerson.name}</h2>
                <p>
                  {focusedPerson.company} · {focusedPerson.role}
                </p>
              </header>
              <dl className="s3-detail-list">
                <div>
                  <dt>身份状态</dt>
                  <dd>{focusedPerson.identity}</dd>
                </div>
                <div>
                  <dt>版图关系</dt>
                  <dd>{focusedPerson.relation}</dd>
                </div>
                <div>
                  <dt>来源</dt>
                  <dd>{focusedPerson.source}</dd>
                </div>
                <div>
                  <dt>可信度</dt>
                  <dd>{focusedPerson.confidence}</dd>
                </div>
              </dl>
              {focusedPerson.id === "map-wangyi" ? (
                <section className="s3-pending-decision">
                  <h3>本批次写入决定</h3>
                  <p>
                    单位时间线仍有冲突。可以明确确认后按当前人物关系写入，也可以继续保留为待确认内容。
                  </p>
                  <PendingDecisionControl
                    label="王奕身份关系"
                    value={pendingDecisions.wangyi}
                    onChange={(value) => decidePending("wangyi", value)}
                  />
                </section>
              ) : null}
            </aside>
          </div>
        ) : null}
        {tab === "gaps" ? (
          <div className="s3-gap-list">
            <article className="is-warning">
              <Icon name="warning" />
              <span>
                <b>王奕身份冲突</b>
                <p>
                  论文作者与星澜公开活动名单可能属于同一人，但单位时间线不能完全对应。
                </p>
              </span>
              <PendingDecisionControl
                label="王奕身份关系"
                value={pendingDecisions.wangyi}
                onChange={(value) => decidePending("wangyi", value)}
              />
            </article>
            <article>
              <Icon name="user" />
              <span>
                <b>拓界机器人技术负责人仍缺失</b>
                <p>
                  下一步可围绕团队论文通讯作者、专利发明人和公开会议讲者做有限探索，预计补充
                  1 至 3 条候选线索。
                </p>
              </span>
            </article>
            <article>
              <Icon name="route" />
              <span>
                <b>穹顶智能组织上下级待确认</b>
                <p>
                  现有证据只能确认平台和方向，具体汇报关系仍待确认。用户可以按当前证据确认写入，也可以继续保留待确认。
                </p>
              </span>
              <PendingDecisionControl
                label="穹顶智能汇报关系"
                value={pendingDecisions.qiongding}
                onChange={(value) => decidePending("qiongding", value)}
              />
            </article>
          </div>
        ) : null}
      </div>
      <footer className="s3-review-footer">
        <span>
          <b>
            写入本批次结果
            {confirmedPendingCount
              ? `，含 ${confirmedPendingCount} 项用户确认内容`
              : ""}
          </b>
          <small>
            自动流程不会写入待确认内容；用户明确确认写入的项目会记录确认人、时间和原始冲突。
          </small>
        </span>
        <Button tone="primary" onClick={() => onApply(pendingDecisions)}>
          更新人才版图
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
          返回主线并继续
        </Button>
      </footer>
    </section>
  );
}
