import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import {
  ActivityTimeline,
  AssetPageHeader,
  Button,
  CustomCheckbox,
  DefinitionGrid,
  DeleteAssetModal,
  DetailHeader,
  DetailTabs,
  EntityLink,
  FieldGroup,
  FileDrop,
  FormField,
  Modal,
  NotFoundState,
  SelectMenu,
  SourceList,
  StateBanner,
  StatusBadge,
  StatusFromText,
  TagList,
  TextArea,
  TextInput,
  useToast,
} from "./asset-ui";
import {
  candidates,
  companies,
  companyDetail,
  contacts,
  opportunities,
  positions,
} from "./data";

function CompactRelationTable({ type, rows, onOpen }) {
  const columns =
    type === "contacts"
      ? ["联系人", "类别", "角色", "手机 / 邮箱"]
      : type === "positions"
        ? ["岗位", "状态", "候选人进展", "更新时间"]
        : ["候选人", "当前职位", "工作经历", "资料状态"];
  return (
    <div className="s4-relation-table">
      <header>
        {columns.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </header>
      {rows.map((row) => (
        <button type="button" key={row.id} onClick={() => onOpen(row)}>
          {type === "contacts" ? (
            <>
              <b>
                {row.name}
                <small>{row.company}</small>
              </b>
              <TagList items={row.categories.slice(0, 2)} />
              <span>{row.role}</span>
              <span>{row.phone || row.email}</span>
            </>
          ) : type === "positions" ? (
            <>
              <b>
                {row.name}
                <small>{row.location}</small>
              </b>
              <StatusFromText value={row.status} />
              <span className="s4-progress-counts">
                <em>储备 {row.reserve}</em>
                <em>推进 {row.progress}</em>
                <em>入职 {row.hired}</em>
                <em>失败 {row.failed}</em>
              </span>
              <span>{row.updatedAt}</span>
            </>
          ) : (
            <>
              <b>
                {row.name}
                <small>{row.location}</small>
              </b>
              <span>{row.title}</span>
              <span>拓界机器人 · 当前</span>
              <StatusBadge tone="success">已确认</StatusBadge>
            </>
          )}
        </button>
      ))}
    </div>
  );
}

function CompanyProfile({ onEdit }) {
  return (
    <div className="s4-detail-stack">
      <FieldGroup
        title="公司基本资料"
        action={
          <Button size="sm" icon="edit" onClick={onEdit}>
            编辑资料
          </Button>
        }
      >
        <DefinitionGrid
          items={[
            ["公司名称", companyDetail.name],
            ["官网", companyDetail.website],
            ["总部与主要地点", companyDetail.location],
            ["行业", <TagList items={companyDetail.industries} />],
            [
              "已确认名称变体",
              <TagList items={companyDetail.aliases} tone="info" />,
            ],
            ["最近更新", "今天 · 用户确认"],
          ]}
        />
      </FieldGroup>
      {[
        ["公司简介", companyDetail.intro],
        ["融资、上市与市值", companyDetail.financing],
        ["公司优势与人才吸引点", companyDetail.advantages],
        ["一般薪资与福利", companyDetail.benefits],
        ["一般面试流程", companyDetail.interview],
        ["Base 地点与业务", companyDetail.bases],
        ["其他招聘要求", companyDetail.requirements],
        ["用户备注", companyDetail.note],
      ].map(([title, value]) => (
        <FieldGroup key={title} title={title}>
          <div className="s4-rich-company-copy">
            {value.split("\n").map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </FieldGroup>
      ))}
    </div>
  );
}

function CompanyRecruiting() {
  const navigate = useNavigate();
  return (
    <div className="s4-detail-stack">
      <div className="s4-metric-grid">
        {[
          ["招聘机会", 2, "1 条跟进中"],
          ["招聘岗位", 3, "2 个招聘中"],
          ["候选人推进", 8, "5 人在面试"],
          ["已入职", 1, "过去 90 天"],
        ].map(([label, value, meta]) => (
          <article key={label}>
            <small>{label}</small>
            <b>{value}</b>
            <span>{meta}</span>
          </article>
        ))}
      </div>
      <FieldGroup title="招聘机会">
        <div className="s4-entity-grid">
          {opportunities
            .filter((item) => item.company === "星澜机器人")
            .map((item) => (
              <EntityLink
                key={item.id}
                icon="signal"
                title={item.title}
                meta={`${item.status} · ${item.positions} 个岗位`}
                onClick={() => navigate(`/opportunities/${item.id}`)}
              />
            ))}
        </div>
      </FieldGroup>
      <FieldGroup
        title="关联岗位"
        description="岗位公司关系是唯一事实来源；此处不单独编辑。"
      >
        <CompactRelationTable
          type="positions"
          rows={positions.filter((item) => item.company === "星澜机器人")}
          onOpen={(item) => navigate(`/positions/${item.id}`)}
        />
      </FieldGroup>
    </div>
  );
}

function CompanyContacts() {
  const navigate = useNavigate();
  const [contactModal, setContactModal] = useState(false);
  return (
    <div className="s4-detail-stack">
      <FieldGroup
        title="联系人"
        description="联系人可属于多家公司；公司关系在联系人档案中维护。"
        action={
          <Button size="sm" icon="plus" onClick={() => setContactModal(true)}>
            添加联系人
          </Button>
        }
      >
        <CompactRelationTable
          type="contacts"
          rows={contacts.filter((item) => item.company === "星澜机器人")}
          onOpen={(item) => navigate(`/contacts/${item.id}`)}
        />
      </FieldGroup>
      <ContactEditor
        open={contactModal}
        close={() => setContactModal(false)}
        company="星澜机器人"
      />
    </div>
  );
}

function CompanyTalents() {
  const navigate = useNavigate();
  return (
    <div className="s4-detail-stack">
      <StateBanner
        title="任职人才来自候选人工作经历"
        description="这里是反向视图；纠错时会修改对应候选人的具体工作经历，不创建公司侧手动关联。"
      />
      <FieldGroup title="当前与历史任职人才">
        <CompactRelationTable
          type="candidates"
          rows={candidates.filter((_, index) => index < 6)}
          onOpen={(item) => navigate(`/candidates/${item.id}`)}
        />
      </FieldGroup>
    </div>
  );
}

function CompanyMappings() {
  const navigate = useNavigate();
  return (
    <div className="s4-detail-stack">
      <FieldGroup title="关联人才版图">
        <div className="s4-landscape-summary-card">
          <span>
            <small>重点版图</small>
            <h3>具身智能 VLA 核心人才版图</h3>
            <p>
              星澜机器人被标记为核心目标公司，当前包含 3 个组织单元、7 位人物和
              12 条关系。
            </p>
          </span>
          <dl>
            <div>
              <dt>组织</dt>
              <dd>3</dd>
            </div>
            <div>
              <dt>人物</dt>
              <dd>7</dd>
            </div>
            <div>
              <dt>关系</dt>
              <dd>12</dd>
            </div>
          </dl>
          <Button onClick={() => navigate("/mappings/mapping-embodied")}>
            打开版图
          </Button>
        </div>
      </FieldGroup>
    </div>
  );
}

function CompanyRelated() {
  const navigate = useNavigate();
  return (
    <div className="s4-detail-stack">
      <FieldGroup title="业务主线">
        <div className="s4-entity-grid">
          <EntityLink
            icon="route"
            title="星澜机器人客户开发"
            meta="等待联系人确认"
            onClick={() => navigate("/workstreams/client-xinglan")}
          />
          <EntityLink
            icon="route"
            title="星澜机器人具身智能团队招聘"
            meta="候选人审核中"
            onClick={() => navigate("/workstreams/position-vla")}
          />
        </div>
      </FieldGroup>
      <FieldGroup title="来源与变化">
        <SourceList
          items={[
            {
              title: "公司调研",
              description: "官网、融资公告与公开招聘资料",
              meta: "今天 09:32 · Agent",
              status: "已确认",
            },
            {
              title: "用户维护",
              description: "补充客户偏好与推荐注意事项",
              meta: "今天 10:14 · 沈岚",
              status: "已确认",
            },
          ]}
        />
      </FieldGroup>
    </div>
  );
}

function CompanyEditor({ open, close }) {
  const notify = useToast();
  const [name, setName] = useState(companyDetail.name);
  const [intro, setIntro] = useState(companyDetail.intro);
  return (
    <Modal
      open={open}
      close={close}
      size="xl"
      title="编辑公司资料"
      description="用户备注不会被 Agent 或文件建议覆盖"
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button
            tone="primary"
            onClick={() => {
              close();
              notify("公司资料已保存");
            }}
          >
            保存修改
          </Button>
        </>
      }
    >
      <div className="s4-form-grid">
        <FormField label="公司名称" required>
          <TextInput value={name} onChange={setName} />
        </FormField>
        <FormField label="行业标签">
          <SelectMenu
            label="选择行业"
            value={["机器人", "人工智能"]}
            options={["机器人", "人工智能", "智能制造", "企业服务"]}
            onChange={() => {}}
            multiple
          />
        </FormField>
        <FormField label="公司简介" span={2}>
          <TextArea value={intro} onChange={setIntro} rows={5} />
        </FormField>
        <FormField label="融资、上市与市值" span={2}>
          <TextArea
            value={companyDetail.financing}
            onChange={() => {}}
            rows={4}
          />
        </FormField>
        <FormField label="公司优势与人才吸引点" span={2}>
          <TextArea
            value={companyDetail.advantages}
            onChange={() => {}}
            rows={4}
          />
        </FormField>
        <FormField label="一般薪资与福利" span={2}>
          <TextArea
            value={companyDetail.benefits}
            onChange={() => {}}
            rows={4}
          />
        </FormField>
        <FormField label="一般面试流程" span={2}>
          <TextArea
            value={companyDetail.interview}
            onChange={() => {}}
            rows={4}
          />
        </FormField>
        <FormField label="Base 地点与业务" span={2}>
          <TextArea value={companyDetail.bases} onChange={() => {}} rows={5} />
        </FormField>
        <FormField label="其他招聘要求" span={2}>
          <TextArea
            value={companyDetail.requirements}
            onChange={() => {}}
            rows={4}
          />
        </FormField>
        <FormField label="用户备注" span={2}>
          <TextArea value={companyDetail.note} onChange={() => {}} rows={4} />
        </FormField>
      </div>
    </Modal>
  );
}

export function CompanyDetailPage() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "profile";
  const isDraft = params.get("state") === "draft";
  const item = companies.find((company) => company.id === companyId);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  if (!item)
    return <NotFoundState label="公司" onBack={() => navigate("/companies")} />;
  const detail = { ...companyDetail, ...item };
  const detailTabs = [
    { value: "profile", label: "公司资料" },
    { value: "recruiting", label: "招聘业务" },
    { value: "contacts", label: "联系人", count: detail.contacts },
    { value: "talents", label: "任职人才", count: detail.talents },
    { value: "mappings", label: "人才版图" },
    { value: "work", label: "相关工作" },
  ];
  return (
    <div className="s4-detail-page">
      <DetailHeader
        icon="building"
        title={detail.name}
        subtitle={`${detail.location} · ${detail.industries.join(" / ")}`}
        badges={
          isDraft
            ? [
                { label: "解析草稿", tone: "warning" },
                { label: "尚未写入", tone: "neutral" },
              ]
            : [
                { label: "资料已确认", tone: "success" },
                { label: "2 个招聘机会", tone: "info" },
              ]
        }
        onBack={() => navigate("/companies")}
        onEdit={tab === "profile" ? () => setEditOpen(true) : undefined}
        onDelete={isDraft ? undefined : () => setDeleteOpen(true)}
      >
        {isDraft ? (
          <Button
            tone="primary"
            icon="check"
            onClick={() => {
              notify("公司草稿已确认并写入");
              setParams({ tab: "profile" });
            }}
          >
            确认创建公司
          </Button>
        ) : tab === "profile" ? (
          <Button
            icon="sparkles"
            onClick={() => navigate("/new?prompt=调研并更新星澜机器人公司资料")}
          >
            更新调研
          </Button>
        ) : null}
      </DetailHeader>
      {isDraft ? (
        <StateBanner
          tone="warning"
          icon="warning"
          title="文件解析结果等待确认"
          description="检查并编辑每个字段后再创建公司；当前草稿不会出现在正式公司列表和关联关系中。"
          action={
            <Button size="sm" icon="edit" onClick={() => setEditOpen(true)}>
              编辑草稿
            </Button>
          }
        />
      ) : (
        <DetailTabs
          tabs={detailTabs}
          value={tab}
          onChange={(value) => setParams({ tab: value })}
        />
      )}
      {tab === "profile" ? (
        <CompanyProfile onEdit={() => setEditOpen(true)} />
      ) : null}
      {tab === "recruiting" ? <CompanyRecruiting /> : null}
      {tab === "contacts" ? <CompanyContacts /> : null}
      {tab === "talents" ? <CompanyTalents /> : null}
      {tab === "mappings" ? <CompanyMappings /> : null}
      {tab === "work" ? <CompanyRelated /> : null}
      <CompanyEditor open={editOpen} close={() => setEditOpen(false)} />
      <DeleteAssetModal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        assetLabel="公司"
        assetName={detail.name}
        impact="联系人、招聘机会、岗位、候选人和人才版图不会删除；原始公司文本继续保留。"
        onConfirm={() => {
          setDeleteOpen(false);
          notify("公司已进入回收站");
          navigate("/companies");
        }}
      />
    </div>
  );
}

function ContactEditor({ open, close, company = "" }) {
  const notify = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [categories, setCategories] = useState(["客户 HR"]);
  const [submitted, setSubmitted] = useState(false);
  const save = () => {
    setSubmitted(true);
    if (!name.trim() || (!phone.trim() && !email.trim() && !company)) return;
    close();
    notify("联系人已保存");
  };
  return (
    <Modal
      open={open}
      close={close}
      size="xl"
      title={name ? "编辑联系人" : "添加联系人"}
      description="联系人可以属于多家公司；只有姓名不能形成正式联系人"
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button tone="primary" onClick={save}>
            保存联系人
          </Button>
        </>
      }
    >
      <div className="s4-form-grid">
        <FormField
          label="姓名或明确称呼"
          required
          error={submitted && !name.trim() ? "请输入姓名或明确称呼" : ""}
        >
          <TextInput value={name} onChange={setName} placeholder="例如：陈雨" />
        </FormField>
        <FormField label="类别" required>
          <SelectMenu
            label="选择类别"
            value={categories}
            options={[
              "客户 HR",
              "招聘负责人",
              "投资人",
              "顾问",
              "中间介绍人",
              "行业关系人",
            ]}
            onChange={setCategories}
            multiple
          />
        </FormField>
        <FormField label="手机">
          <TextInput value={phone} onChange={setPhone} />
        </FormField>
        <FormField label="邮箱">
          <TextInput value={email} onChange={setEmail} />
        </FormField>
        <FormField label="所在地区">
          <TextInput value="" onChange={() => {}} />
        </FormField>
        <FormField label="用户备注">
          <TextInput value="" onChange={() => {}} />
        </FormField>
      </div>
      <section className="s4-subform">
        <header>
          <span>
            <h3>公司关系</h3>
            <p>可添加多条当前或历史关系，并设置一个主要归属。</p>
          </span>
          <Button
            size="sm"
            icon="plus"
            onClick={() => notify("已增加一条空公司关系")}
          >
            添加关系
          </Button>
        </header>
        <div className="s4-company-relation-row">
          <SelectMenu
            label="选择公司"
            value={company}
            options={["星澜机器人", "拓界机器人", "启程资本"]}
            onChange={() => {}}
            searchable
          />
          <TextInput
            value="招聘负责人"
            onChange={() => {}}
            placeholder="职位或角色"
          />
          <SelectMenu
            label="关系状态"
            value="当前"
            options={["当前", "历史"]}
            onChange={() => {}}
          />
          <CustomCheckbox checked onChange={() => {}} label="主要归属" />
        </div>
      </section>
      {submitted && !phone.trim() && !email.trim() && !company ? (
        <StateBanner
          tone="danger"
          icon="warning"
          title="身份信息不足"
          description="请补充手机、邮箱、已确认公司关系或其他足以区分身份的信息。"
        />
      ) : null}
    </Modal>
  );
}

export function ContactDetailPage() {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "profile";
  const item = contacts.find((contact) => contact.id === contactId);
  const [editOpen, setEditOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  if (!item)
    return (
      <NotFoundState label="联系人" onBack={() => navigate("/contacts")} />
    );
  const contactTabs = [
    { value: "profile", label: "联系人资料" },
    { value: "timeline", label: "跟进与沟通" },
    { value: "business", label: "相关业务" },
  ];
  return (
    <div className="s4-detail-page">
      <DetailHeader
        icon="user"
        title={item.name}
        subtitle={`${item.company} · ${item.role}`}
        badges={item.categories.map((label) => ({ label, tone: "info" }))}
        onBack={() => navigate("/contacts")}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      >
        {tab === "timeline" ? (
          <Button icon="plus" onClick={() => setNoteOpen(true)}>
            添加沟通记录
          </Button>
        ) : null}
      </DetailHeader>
      <DetailTabs
        tabs={contactTabs}
        value={tab}
        onChange={(value) => setParams({ tab: value })}
      />
      {tab === "profile" ? (
        <div className="s4-detail-stack">
          <FieldGroup title="基本资料">
            <DefinitionGrid
              items={[
                ["姓名", item.name],
                ["地区", item.region],
                ["类别", <TagList items={item.categories} />],
                ["手机", item.phone || "—"],
                ["邮箱", item.email || "—"],
                ["最近沟通", item.lastContact],
              ]}
            />
          </FieldGroup>
          <FieldGroup title="公司关系">
            <div className="s4-contact-company-relations">
              <article>
                <span>
                  <b>{item.company}</b>
                  <small>{item.role} · 当前</small>
                </span>
                <StatusBadge tone="success">主要归属</StatusBadge>
                <button
                  type="button"
                  onClick={() => navigate("/companies/company-xinglan")}
                >
                  查看公司
                </button>
              </article>
              {item.id === "contact-liujian" ? (
                <article>
                  <span>
                    <b>远望创投</b>
                    <small>投资经理 · 历史</small>
                  </span>
                  <StatusBadge tone="neutral">历史关系</StatusBadge>
                  <button
                    type="button"
                    onClick={() => notify("远望创投公司资料尚未建立")}
                  >
                    查看公司
                  </button>
                </article>
              ) : null}
            </div>
          </FieldGroup>
          <FieldGroup title="候选人身份关系">
            <StateBanner
              title="当前未关联候选人档案"
              description="联系人身份和候选人业务档案彼此独立；确认是同一自然人后只建立身份关系。"
              action={
                <Button
                  size="sm"
                  onClick={() => notify("已打开候选人身份查找")}
                >
                  查找候选人
                </Button>
              }
            />
          </FieldGroup>
        </div>
      ) : null}
      {tab === "timeline" ? (
        <div className="s4-detail-stack">
          <FieldGroup title="跟进与沟通">
            <ActivityTimeline
              items={[
                [
                  "昨天 18:20",
                  "邮件回复",
                  "确认 VLA 负责人岗位仍在招聘，希望先看 3 位高匹配候选人。",
                  item.email || item.name,
                ],
                [
                  "08-19 10:30",
                  "电话沟通",
                  "客户更关注真机数据闭环，纯研究背景优先级较低。",
                  "沈岚",
                ],
                [
                  "08-12 14:10",
                  "人工备注",
                  "由启程资本刘健引荐，已完成首次沟通。",
                  "沈岚",
                ],
              ]}
            />
          </FieldGroup>
        </div>
      ) : null}
      {tab === "business" ? (
        <div className="s4-detail-stack">
          <FieldGroup title="招聘机会">
            <EntityLink
              icon="signal"
              title="星澜机器人具身智能团队扩张"
              meta="跟进中 · 4 个方向"
              onClick={() => navigate("/opportunities/opportunity-xinglan")}
            />
          </FieldGroup>
          <FieldGroup title="业务主线">
            <EntityLink
              icon="route"
              title="星澜机器人客户开发"
              meta="等待联系人确认"
              onClick={() => navigate("/workstreams/client-xinglan")}
            />
          </FieldGroup>
        </div>
      ) : null}
      <ContactEditor
        open={editOpen}
        close={() => setEditOpen(false)}
        company={item.company}
      />
      <Modal
        open={noteOpen}
        close={() => setNoteOpen(false)}
        title="添加沟通记录"
        description="电话、线下和其他人工结果由猎头补录"
        footer={
          <>
            <Button onClick={() => setNoteOpen(false)}>取消</Button>
            <Button
              tone="primary"
              onClick={() => {
                setNoteOpen(false);
                notify("沟通记录已添加");
              }}
            >
              保存
            </Button>
          </>
        }
      >
        <div className="s4-form-grid">
          <FormField label="沟通方式">
            <SelectMenu
              label="选择方式"
              value="电话"
              options={["电话", "线下", "微信", "其他"]}
              onChange={() => {}}
            />
          </FormField>
          <FormField label="发生时间">
            <TextInput value="2026-08-21 14:30" onChange={() => {}} />
          </FormField>
          <FormField label="沟通内容" span={2}>
            <TextArea value="" onChange={() => {}} rows={5} />
          </FormField>
        </div>
      </Modal>
      <DeleteAssetModal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        assetLabel="联系人"
        assetName={item.name}
        impact="公司、招聘机会和业务主线不会删除；真实沟通作为历史引用保留。"
        onConfirm={() => {
          setDeleteOpen(false);
          notify("联系人已进入回收站");
          navigate("/contacts");
        }}
      />
    </div>
  );
}

export function ContactCreatePage() {
  const navigate = useNavigate();
  return (
    <div className="s4-page">
      <AssetPageHeader
        eyebrow="联系人"
        title="新建联系人"
        description="联系人可以属于多家公司，也可以在确认后与候选人建立同一自然人关系。"
        actions={
          <Button onClick={() => navigate("/contacts")}>返回列表</Button>
        }
      />
      <div className="s4-inline-form-shell">
        <ContactEditor open close={() => navigate("/contacts")} />
      </div>
    </div>
  );
}

function OpportunityDirections({ opportunity }) {
  const navigate = useNavigate();
  const notify = useToast();
  const [convert, setConvert] = useState(null);
  const directions = [
    {
      name: "VLA 算法负责人",
      requirement: "VLA、真机部署、团队管理",
      status: "已形成岗位",
      position: "具身智能 VLA 算法负责人",
    },
    {
      name: "机器人学习工程师",
      requirement: "模仿学习、强化学习、数据闭环",
      status: "待处理",
    },
    {
      name: "数据平台负责人",
      requirement: "机器人数据、MLOps、团队管理",
      status: "已关联岗位",
      position: "机器人数据平台负责人",
    },
    {
      name: "仿真平台工程师",
      requirement: "Isaac Sim、Sim2Real、Python",
      status: "待处理",
    },
  ];
  return (
    <div className="s4-detail-stack">
      <StateBanner
        title="拆分方向不会自动完成招聘机会"
        description="一个招聘机会可以形成多个岗位；每个方向需要单独确认创建或关联已有岗位。"
      />
      <FieldGroup
        title="招聘方向"
        action={
          <Button
            size="sm"
            icon="plus"
            onClick={() => notify("已添加一个空招聘方向")}
          >
            添加方向
          </Button>
        }
      >
        <div className="s4-direction-list">
          {directions.map((item) => (
            <article key={item.name}>
              <span>
                <b>{item.name}</b>
                <p>{item.requirement}</p>
              </span>
              <StatusBadge
                tone={item.status === "待处理" ? "warning" : "success"}
              >
                {item.status}
              </StatusBadge>
              {item.position ? (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      item.position.includes("VLA")
                        ? "/positions/position-vla"
                        : "/positions/position-platform",
                    )
                  }
                >
                  {item.position}
                  <Icon name="chevronRight" />
                </button>
              ) : (
                <Button
                  size="sm"
                  tone="primary"
                  onClick={() => setConvert(item)}
                >
                  形成岗位
                </Button>
              )}
            </article>
          ))}
        </div>
      </FieldGroup>
      <Modal
        open={Boolean(convert)}
        close={() => setConvert(null)}
        size="lg"
        title={`将“${convert?.name || "招聘方向"}”形成岗位`}
        description="可以创建新岗位，也可以关联尚无来源机会的已有岗位"
        footer={
          <>
            <Button onClick={() => setConvert(null)}>取消</Button>
            <Button
              tone="primary"
              onClick={() => {
                setConvert(null);
                notify("岗位已创建并关联到招聘机会");
              }}
            >
              确认创建岗位
            </Button>
          </>
        }
      >
        <div className="s4-choice-stack">
          <CustomCheckbox
            checked
            onChange={() => {}}
            label="创建新的正式岗位"
          />
          <DefinitionGrid
            columns={2}
            items={[
              ["岗位名称", convert?.name],
              ["招聘公司", opportunity.company],
              ["基本要求", convert?.requirement],
              ["来源机会", opportunity.title],
            ]}
          />
          <button
            type="button"
            className="s4-alternate-action"
            onClick={() => notify("已打开已有岗位选择")}
          >
            改为关联已有岗位
          </button>
        </div>
      </Modal>
    </div>
  );
}

export function OpportunityDetailPage() {
  const { opportunityId } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "profile";
  const item = opportunities.find(
    (opportunity) => opportunity.id === opportunityId,
  );
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  if (!item)
    return (
      <NotFoundState
        label="招聘机会"
        onBack={() => navigate("/opportunities")}
      />
    );
  const opportunityTabs = [
    { value: "profile", label: "机会资料" },
    { value: "directions", label: "招聘方向", count: item.directions },
    { value: "work", label: "相关工作" },
  ];
  return (
    <div className="s4-detail-page">
      <DetailHeader
        icon="signal"
        title={item.title}
        subtitle={item.company}
        badges={[
          {
            label: item.status,
            tone: item.status === "跟进中" ? "success" : "neutral",
          },
          { label: `${item.directions} 个招聘方向`, tone: "info" },
        ]}
        onBack={() => navigate("/opportunities")}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      />
      <DetailTabs
        tabs={opportunityTabs}
        value={tab}
        onChange={(value) => setParams({ tab: value })}
      />
      {tab === "profile" ? (
        <div className="s4-detail-stack">
          <FieldGroup title="机会资料">
            <DefinitionGrid
              items={[
                [
                  "所属公司",
                  <button
                    type="button"
                    className="s4-inline-link"
                    onClick={() => navigate("/companies/company-xinglan")}
                  >
                    {item.company}
                  </button>,
                ],
                ["状态", <StatusFromText value={item.status} />],
                ["预计人数", "20 - 25 人"],
                ["预计时间", "2026 年下半年"],
                [
                  "相关联系人",
                  <button
                    type="button"
                    className="s4-inline-link"
                    onClick={() => navigate("/contacts/contact-chenyu")}
                  >
                    陈雨 · 招聘负责人
                  </button>,
                ],
                ["创建方式", "客户开发主线"],
              ]}
            />
          </FieldGroup>
          <FieldGroup title="招聘需求摘要">
            <p className="s4-long-copy">{item.summary}</p>
          </FieldGroup>
          <FieldGroup title="已确认依据">
            <p className="s4-long-copy">
              {item.evidence}。客户明确表示 VLA
              算法负责人和数据平台负责人优先，其他方向可以分批推进。
            </p>
            <SourceList
              items={[
                {
                  title: "客户邮件确认",
                  description: "陈雨确认招聘方向与优先级",
                  meta: "2026-08-20 18:20",
                  status: "已确认",
                },
                {
                  title: "公开招聘页面",
                  description: "新增 9 个机器人算法和平台研发岗位",
                  meta: "2026-08-21 09:12",
                  status: "已验证",
                },
              ]}
            />
          </FieldGroup>
        </div>
      ) : null}
      {tab === "directions" ? (
        <OpportunityDirections opportunity={item} />
      ) : null}
      {tab === "work" ? (
        <div className="s4-detail-stack">
          <FieldGroup title="业务主线">
            <EntityLink
              icon="route"
              title="星澜机器人客户开发"
              meta="已确认招聘需求"
              onClick={() => navigate("/workstreams/client-xinglan")}
            />
          </FieldGroup>
          <FieldGroup title="活动记录">
            <ActivityTimeline
              items={[
                ["今天 10:04", "方向更新", "新增仿真平台工程师方向。", "沈岚"],
                [
                  "昨天 18:20",
                  "客户确认",
                  "确认 VLA 与数据平台方向优先。",
                  "陈雨",
                ],
                [
                  "08-18 09:30",
                  "创建机会",
                  "从客户开发主线写入正式招聘机会。",
                  "Hunter",
                ],
              ]}
            />
          </FieldGroup>
        </div>
      ) : null}
      <OpportunityEditor
        open={editOpen}
        close={() => setEditOpen(false)}
        item={item}
      />
      <DeleteAssetModal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        assetLabel="招聘机会"
        assetName={item.title}
        impact="已经形成的岗位、公司、联系人和业务主线不会删除，岗位保留来源机会的历史名称。"
        onConfirm={() => {
          setDeleteOpen(false);
          notify("招聘机会已进入回收站");
          navigate("/opportunities");
        }}
      />
    </div>
  );
}

function OpportunityEditor({ open, close, item = null }) {
  const notify = useToast();
  const [title, setTitle] = useState(item?.title || "");
  const [summary, setSummary] = useState(item?.summary || "");
  const [evidence, setEvidence] = useState(item?.evidence || "");
  const [submitted, setSubmitted] = useState(false);
  const save = () => {
    setSubmitted(true);
    if (!title.trim() || !summary.trim() || !evidence.trim()) return;
    close();
    notify(item ? "招聘机会已保存" : "招聘机会已创建");
  };
  return (
    <Modal
      open={open}
      close={close}
      size="xl"
      title={item ? "编辑招聘机会" : "新建招聘机会"}
      description="只有已确认存在招聘需求时才形成正式招聘机会"
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button tone="primary" onClick={save}>
            {item ? "保存修改" : "创建机会"}
          </Button>
        </>
      }
    >
      <div className="s4-form-grid">
        <FormField
          label="机会名称"
          required
          error={submitted && !title.trim() ? "请输入机会名称" : ""}
        >
          <TextInput value={title} onChange={setTitle} />
        </FormField>
        <FormField label="所属公司" required>
          <SelectMenu
            label="选择公司"
            value={item?.company || "星澜机器人"}
            options={companies.map((company) => company.name)}
            onChange={() => {}}
            searchable
          />
        </FormField>
        <FormField
          label="招聘需求摘要"
          required
          span={2}
          error={submitted && !summary.trim() ? "请输入招聘需求摘要" : ""}
        >
          <TextArea value={summary} onChange={setSummary} rows={5} />
        </FormField>
        <FormField
          label="已确认存在需求的依据"
          required
          span={2}
          error={submitted && !evidence.trim() ? "请说明需求确认依据" : ""}
        >
          <TextArea value={evidence} onChange={setEvidence} rows={4} />
        </FormField>
        <FormField label="预计人数">
          <TextInput value="20 - 25" onChange={() => {}} />
        </FormField>
        <FormField label="预计时间">
          <TextInput value="2026 年下半年" onChange={() => {}} />
        </FormField>
        <FormField label="相关联系人">
          <SelectMenu
            label="选择联系人"
            value="陈雨"
            options={contacts.map((contact) => contact.name)}
            onChange={() => {}}
            searchable
          />
        </FormField>
        <FormField label="状态">
          <SelectMenu
            label="状态"
            value={item?.status || "跟进中"}
            options={["跟进中", "已完成", "已关闭"]}
            onChange={() => {}}
          />
        </FormField>
      </div>
    </Modal>
  );
}

export function OpportunityCreatePage() {
  const navigate = useNavigate();
  return (
    <div className="s4-page">
      <AssetPageHeader
        eyebrow="招聘机会"
        title="新建招聘机会"
        description="把已经确认存在的招聘需求沉淀为正式机会，再逐步拆分岗位。"
        actions={
          <Button onClick={() => navigate("/opportunities")}>返回列表</Button>
        }
      />
      <div className="s4-inline-form-shell">
        <OpportunityEditor open close={() => navigate("/opportunities")} />
      </div>
    </div>
  );
}

export function CompanyCreatePage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [mode, setMode] = useState("manual");
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [intro, setIntro] = useState("");
  const create = () => {
    if (!name.trim()) {
      notify("请输入公司名称", "error");
      return;
    }
    notify("公司已创建");
    navigate("/companies/company-xinglan");
  };
  return (
    <div className="s4-create-page">
      <AssetPageHeader
        eyebrow="公司"
        title="新建公司"
        description="支持手动填写、文件解析和公开网络调研，写入前都需要确认。"
        actions={<Button onClick={() => navigate("/companies")}>取消</Button>}
      />
      <div className="s4-create-layout">
        <aside className="s4-create-modes">
          {[
            ["manual", "edit", "手动新建", "填写公司资料"],
            ["file", "upload", "文件解析", "PDF 或 DOCX"],
            ["agent", "sparkles", "公司调研", "只输入公司名"],
          ].map(([id, icon, label, meta]) => (
            <button
              type="button"
              className={mode === id ? "is-active" : ""}
              key={id}
              onClick={() => setMode(id)}
            >
              <Icon name={icon} />
              <span>
                <b>{label}</b>
                <small>{meta}</small>
              </span>
            </button>
          ))}
        </aside>
        <section className="s4-create-workspace">
          {mode === "manual" ? (
            <>
              <header>
                <h2>公司资料</h2>
                <p>除公司名称外均可稍后补充。</p>
              </header>
              <div className="s4-form-grid">
                <FormField label="公司名称" required>
                  <TextInput
                    value={name}
                    onChange={setName}
                    placeholder="例如：星澜机器人"
                  />
                </FormField>
                <FormField label="行业标签">
                  <SelectMenu
                    label="选择行业"
                    value={[]}
                    options={["机器人", "人工智能", "智能制造", "企业服务"]}
                    onChange={() => {}}
                    multiple
                  />
                </FormField>
                <FormField label="公司简介" span={2}>
                  <TextArea value={intro} onChange={setIntro} rows={4} />
                </FormField>
                <FormField label="融资、上市与市值" span={2}>
                  <TextArea value="" onChange={() => {}} rows={3} />
                </FormField>
                <FormField label="公司优势与人才吸引点" span={2}>
                  <TextArea value="" onChange={() => {}} rows={3} />
                </FormField>
                <FormField label="一般薪资与福利" span={2}>
                  <TextArea value="" onChange={() => {}} rows={3} />
                </FormField>
                <FormField label="一般面试流程" span={2}>
                  <TextArea value="" onChange={() => {}} rows={3} />
                </FormField>
                <FormField label="Base 地点与业务" span={2}>
                  <TextArea value="" onChange={() => {}} rows={4} />
                </FormField>
                <FormField label="其他招聘要求" span={2}>
                  <TextArea value="" onChange={() => {}} rows={3} />
                </FormField>
                <FormField label="用户备注" span={2}>
                  <TextArea value="" onChange={() => {}} rows={3} />
                </FormField>
              </div>
              <footer>
                <Button tone="primary" onClick={create}>
                  创建公司
                </Button>
              </footer>
            </>
          ) : mode === "file" ? (
            <>
              <header>
                <h2>从文件解析公司资料</h2>
                <p>解析后进入可编辑草稿，确认前不会写入公司资产。</p>
              </header>
              <FileDrop
                files={files}
                onFiles={setFiles}
                accept="PDF、DOCX"
                multiple={false}
              />
              <footer>
                <Button
                  tone="primary"
                  disabled={!files.length}
                  onClick={() => {
                    notify("文件已上传并进入解析", "info");
                    navigate("/companies/company-xinglan?state=draft");
                  }}
                >
                  开始解析
                </Button>
              </footer>
            </>
          ) : (
            <div className="s4-agent-create-entry">
              <i>
                <Icon name="sparkles" />
              </i>
              <h2>调研并创建公司</h2>
              <p>
                输入公司名称和必要背景，Hunter
                将使用公开网络资料形成完整公司草稿。
              </p>
              <div className="s4-inline-agent-input">
                <TextArea
                  value={name}
                  onChange={setName}
                  placeholder="例如：调研星澜机器人，重点了解公司业务、融资、核心团队、岗位吸引力和招聘流程。"
                  rows={5}
                />
                <Button
                  tone="primary"
                  icon="send"
                  disabled={!name.trim()}
                  onClick={() =>
                    navigate(`/new?prompt=${encodeURIComponent(name)}`)
                  }
                >
                  开始调研
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
