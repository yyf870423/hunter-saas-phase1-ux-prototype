import { useMemo, useState } from "react";
import { Icon } from "../components/Icon";
import { Button, SearchField, StatusBadge } from "../stage1/ui";

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
      `${item.name} ${item.role} ${item.company} ${item.category} ${item.email}`
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
          <b>2 位联系人具备可用联系方式</b>
          <small>陈雨是首选联系对象；刘健可作为已有关系引荐。</small>
        </div>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="搜索姓名、角色、公司或联系方式"
        />
      </div>
      <div className="s3-review-body">
        <div className="s3-contact-list">
          <div className="s3-contact-head">
            <span />
            <span>联系人或线索</span>
            <span>公司与角色</span>
            <span>可用联系方式</span>
            <span>身份判断</span>
          </div>
          {visible.map((contact) => (
            <button
              type="button"
              className={focused.id === contact.id ? "is-active" : ""}
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
              <small>{focused.category}</small>
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
                <dt>手机或关系</dt>
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
  onClose,
  onApply,
}) {
  const [tab, setTab] = useState("organizations");
  const [focusedPerson, setFocusedPerson] = useState(people[0]);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [conflictResolved, setConflictResolved] = useState(false);
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
            冲突与缺口 <em>3</em>
          </button>
        </div>
        <p>本批次只写入已经确认的增量；冲突项不会静默覆盖已有内容。</p>
      </div>
      <div className="s3-landscape-review-body">
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
              {people.map((person) => (
                <button
                  type="button"
                  className={focusedPerson.id === person.id ? "is-active" : ""}
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
              <h2>{focusedPerson.name}</h2>
              <p>
                {focusedPerson.company} · {focusedPerson.role}
              </p>
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
              <Button
                tone="secondary"
                size="sm"
                onClick={() => setConflictResolved(true)}
              >
                {conflictResolved ? "已暂不合并" : "暂不合并"}
              </Button>
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
                  现有证据只能确认平台和方向，不能确认具体汇报关系。本批次保留组织单元，不写入上下级。
                </p>
              </span>
            </article>
          </div>
        ) : null}
      </div>
      <footer className="s3-review-footer">
        <span>
          <b>写入本批次已确认结果</b>
          <small>冲突和未知项继续保留在待确认成果，不会被猜测补齐。</small>
        </span>
        <Button tone="primary" onClick={onApply}>
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
          {matches.map((match) => (
            <button
              type="button"
              className={focused.id === match.id ? "is-active" : ""}
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
              <small>
                {focused.company} · {focused.location}
              </small>
              <h2>{focused.title}</h2>
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
