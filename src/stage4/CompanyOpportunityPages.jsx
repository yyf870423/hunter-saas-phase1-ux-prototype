import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Composer } from "../stage2/automation-ui";
import {
  ActivityTimeline,
  AssetPageHeader,
  Button,
  CustomCheckbox,
  DatePicker,
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
import { IndustryCascade } from "./CandidateFilters";
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
              <TagList items={row.categories} maxVisible={1} />
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

const companyCopySections = [
  ["intro", "公司简介"],
  ["financing", "融资、上市与市值"],
  ["advantages", "公司优势与人才吸引点"],
  ["benefits", "一般薪资与福利"],
  ["interview", "一般面试流程"],
  ["bases", "Base 地点与业务"],
  ["requirements", "其他招聘要求"],
  ["note", "用户备注"],
];

function CompanyProfile({ data, onEditSection }) {
  return (
    <div className="s4-detail-stack">
      <FieldGroup
        title="公司基本资料"
        action={
          <Button size="sm" icon="edit" onClick={() => onEditSection("basic")}>
            编辑基本资料
          </Button>
        }
      >
        <DefinitionGrid
          items={[
            ["公司名称", data.name],
            ["官网", data.website],
            ["总部与主要地点", data.location],
            ["行业", <TagList items={data.industries} />],
            ["已确认名称变体", <TagList items={data.aliases} tone="info" />],
            ["最近更新", "今天 · 用户确认"],
          ]}
        />
      </FieldGroup>
      {companyCopySections.map(([key, title]) => (
        <FieldGroup
          key={key}
          title={title}
          action={
            <Button size="sm" icon="edit" onClick={() => onEditSection(key)}>
              编辑
            </Button>
          }
        >
          <div className="s4-rich-company-copy">
            {(data[key] || "—").split("\n").map((line, index) => (
              <p key={`${key}-${index}`}>{line}</p>
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

function CompanySectionEditor({ section, data, close, onSave }) {
  const notify = useToast();
  const [name, setName] = useState(data.name);
  const [website, setWebsite] = useState(data.website);
  const [location, setLocation] = useState(data.location);
  const [industries, setIndustries] = useState(data.industries);
  const [aliases, setAliases] = useState(data.aliases);
  const [copy, setCopy] = useState("");
  const sectionTitle =
    section === "basic"
      ? "公司基本资料"
      : companyCopySections.find(([key]) => key === section)?.[1] || "公司资料";

  useEffect(() => {
    setName(data.name);
    setWebsite(data.website);
    setLocation(data.location);
    setIndustries(data.industries);
    setAliases(data.aliases);
    setCopy(section && section !== "basic" ? data[section] || "" : "");
  }, [data, section]);

  const save = () => {
    const patch =
      section === "basic"
        ? { name, website, location, industries, aliases }
        : { [section]: copy };
    onSave(patch);
    close();
    notify(`${sectionTitle}已保存`);
  };
  return (
    <Modal
      open={Boolean(section)}
      close={close}
      size={section === "basic" ? "xl" : "lg"}
      title={`编辑${sectionTitle}`}
      description={
        section === "note"
          ? "用户备注不会被 Agent 或文件建议覆盖"
          : "本次修改只影响当前资料分组"
      }
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button
            tone="primary"
            onClick={save}
            disabled={section === "basic" && !name.trim()}
          >
            保存修改
          </Button>
        </>
      }
    >
      {section === "basic" ? (
        <div className="s4-form-grid">
          <FormField label="公司名称" required>
            <TextInput value={name} onChange={setName} />
          </FormField>
          <FormField label="官网">
            <TextInput value={website} onChange={setWebsite} />
          </FormField>
          <FormField label="总部与主要地点">
            <TextInput value={location} onChange={setLocation} />
          </FormField>
          <FormField label="行业标签">
            <IndustryCascade value={industries} onChange={setIndustries} />
          </FormField>
          <FormField
            label="已确认名称变体"
            span={2}
            help="输入名称后按 Enter 添加，可删除不再使用的变体。"
          >
            <SelectMenu
              label="名称变体"
              value={aliases}
              options={aliases}
              onChange={setAliases}
              multiple
              searchable
              creatable
            />
            <div className="s4-editor-tag-preview">
              <TagList items={aliases} tone="info" />
            </div>
          </FormField>
        </div>
      ) : (
        <FormField label={sectionTitle} required={section !== "note"}>
          <TextArea value={copy} onChange={setCopy} rows={9} />
        </FormField>
      )}
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
  const [editingSection, setEditingSection] = useState(null);
  const [profileData, setProfileData] = useState(() => ({
    ...companyDetail,
    ...item,
  }));
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
        title={profileData.name}
        subtitle={`${profileData.location} · ${profileData.industries.join(" / ")}`}
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
        />
      ) : (
        <DetailTabs
          tabs={detailTabs}
          value={tab}
          onChange={(value) => setParams({ tab: value })}
        />
      )}
      {tab === "profile" ? (
        <CompanyProfile data={profileData} onEditSection={setEditingSection} />
      ) : null}
      {tab === "recruiting" ? <CompanyRecruiting /> : null}
      {tab === "contacts" ? <CompanyContacts /> : null}
      {tab === "talents" ? <CompanyTalents /> : null}
      {tab === "mappings" ? <CompanyMappings /> : null}
      {tab === "work" ? <CompanyRelated /> : null}
      <CompanySectionEditor
        section={editingSection}
        data={profileData}
        close={() => setEditingSection(null)}
        onSave={(patch) =>
          setProfileData((current) => ({ ...current, ...patch }))
        }
      />
      <DeleteAssetModal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        assetLabel="公司"
        assetName={profileData.name}
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

function ContactSectionEditor({ section, contact, close, onSave }) {
  const notify = useToast();
  const [name, setName] = useState(contact.name);
  const [region, setRegion] = useState(contact.region);
  const [categories, setCategories] = useState(contact.categories);
  const [phone, setPhone] = useState(contact.phone);
  const [email, setEmail] = useState(contact.email);
  const [company, setCompany] = useState(contact.company);
  const [role, setRole] = useState(contact.role);
  const [relationStatus, setRelationStatus] = useState("当前");
  const [primary, setPrimary] = useState(true);

  useEffect(() => {
    setName(contact.name);
    setRegion(contact.region);
    setCategories(contact.categories);
    setPhone(contact.phone);
    setEmail(contact.email);
    setCompany(contact.company);
    setRole(contact.role);
    setRelationStatus("当前");
    setPrimary(true);
  }, [contact, section]);

  const save = () => {
    onSave(
      section === "basic"
        ? { name, region, categories, phone, email }
        : { company, role },
    );
    close();
    notify(section === "basic" ? "联系人基本资料已保存" : "公司关系已保存");
  };

  return (
    <Modal
      open={Boolean(section)}
      close={close}
      size="lg"
      title={section === "basic" ? "编辑联系人资料" : "编辑公司关系"}
      description="本次修改只影响当前资料分组"
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button
            tone="primary"
            onClick={save}
            disabled={section === "basic" && !name.trim()}
          >
            保存修改
          </Button>
        </>
      }
    >
      {section === "basic" ? (
        <div className="s4-form-grid">
          <FormField label="姓名或明确称呼" required>
            <TextInput value={name} onChange={setName} />
          </FormField>
          <FormField label="所在地区">
            <TextInput value={region} onChange={setRegion} />
          </FormField>
          <FormField label="类别" span={2}>
            <SelectMenu
              label="联系人类别"
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
        </div>
      ) : (
        <div className="s4-form-grid">
          <FormField label="正式公司">
            <SelectMenu
              label="选择公司"
              value={company}
              options={companies.map((item) => item.name)}
              onChange={setCompany}
              searchable
            />
          </FormField>
          <FormField label="职位或角色">
            <TextInput value={role} onChange={setRole} />
          </FormField>
          <FormField label="关系状态">
            <SelectMenu
              label="关系状态"
              value={relationStatus}
              options={["当前", "历史"]}
              onChange={setRelationStatus}
            />
          </FormField>
          <FormField label="主要归属">
            <CustomCheckbox
              checked={primary}
              onChange={setPrimary}
              label="作为联系人默认展示的公司"
            />
          </FormField>
        </div>
      )}
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
  const [editingSection, setEditingSection] = useState(null);
  const [profile, setProfile] = useState(() => ({ ...item }));
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [deleteNote, setDeleteNote] = useState(null);
  const [timeline, setTimeline] = useState([
    [
      "昨天 18:20",
      "邮件回复",
      "确认 VLA 负责人岗位仍在招聘，希望先看 3 位高匹配候选人。",
      item?.email || item?.name,
    ],
    [
      "08-19 10:30",
      "电话沟通",
      "客户更关注真机数据闭环，纯研究背景优先级较低。",
      "沈岚",
    ],
    ["08-12 14:10", "人工备注", "由启程资本刘健引荐，已完成首次沟通。", "沈岚"],
  ]);
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
        title={profile.name}
        subtitle={`${profile.company} · ${profile.role}`}
        badges={profile.categories.map((label) => ({ label, tone: "info" }))}
        onBack={() => navigate("/contacts")}
        onDelete={() => setDeleteOpen(true)}
      />
      <DetailTabs
        tabs={contactTabs}
        value={tab}
        onChange={(value) => setParams({ tab: value })}
      />
      {tab === "profile" ? (
        <div className="s4-detail-stack">
          <FieldGroup
            title="基本资料"
            action={
              <Button
                size="sm"
                icon="edit"
                onClick={() => setEditingSection("basic")}
              >
                编辑联系方式
              </Button>
            }
          >
            <DefinitionGrid
              items={[
                ["姓名", profile.name],
                ["地区", profile.region],
                ["类别", <TagList items={profile.categories} />],
                ["手机", profile.phone || "—"],
                ["邮箱", profile.email || "—"],
                ["最近沟通", profile.lastContact],
              ]}
            />
          </FieldGroup>
          <FieldGroup
            title="公司关系"
            action={
              <Button
                size="sm"
                icon="edit"
                onClick={() => setEditingSection("company")}
              >
                编辑公司关系
              </Button>
            }
          >
            <div className="s4-contact-company-relations">
              <article>
                <span>
                  <b>{profile.company}</b>
                  <small>{profile.role} · 当前</small>
                </span>
                <StatusBadge tone="success">主要归属</StatusBadge>
                <button
                  type="button"
                  onClick={() => navigate("/companies/company-xinglan")}
                >
                  查看公司
                </button>
              </article>
              {profile.id === "contact-liujian" ? (
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
          <FieldGroup
            title="跟进与沟通"
            description="真实沟通只保存一次；公司、机会和业务主线通过引用显示。"
            action={
              <Button
                size="sm"
                icon="plus"
                onClick={() => {
                  setEditingNote(null);
                  setNote("");
                  setNoteOpen(true);
                }}
              >
                添加沟通记录
              </Button>
            }
          >
            <ActivityTimeline
              items={timeline}
              onEdit={(entry, index) => {
                setEditingNote(index);
                setNote(entry[2]);
                setNoteOpen(true);
              }}
              onDelete={(_, index) => setDeleteNote(index)}
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
      <ContactSectionEditor
        section={editingSection}
        contact={profile}
        close={() => setEditingSection(null)}
        onSave={(patch) => setProfile((current) => ({ ...current, ...patch }))}
      />
      <Modal
        open={noteOpen}
        close={() => setNoteOpen(false)}
        title={editingNote === null ? "添加沟通记录" : "编辑沟通记录"}
        description="电话、线下和其他人工结果由猎头补录"
        footer={
          <>
            <Button onClick={() => setNoteOpen(false)}>取消</Button>
            <Button
              tone="primary"
              onClick={() => {
                if (!note.trim()) return;
                setTimeline((current) =>
                  editingNote === null
                    ? [["刚刚", "人工备注", note, "沈岚"], ...current]
                    : current.map((entry, index) =>
                        index === editingNote
                          ? [entry[0], entry[1], note, entry[3]]
                          : entry,
                      ),
                );
                setNoteOpen(false);
                notify(
                  editingNote === null ? "沟通记录已添加" : "沟通记录已更新",
                );
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
            <DatePicker
              label="选择发生时间"
              mode="datetime"
              value="2026-08-21 14:30"
              onChange={() => {}}
            />
          </FormField>
          <FormField label="沟通内容" span={2}>
            <TextArea value={note} onChange={setNote} rows={5} />
          </FormField>
        </div>
      </Modal>
      <Modal
        open={deleteNote !== null}
        close={() => setDeleteNote(null)}
        title="删除沟通记录"
        description="删除后不会影响联系人资料和其他沟通记录。"
        footer={
          <>
            <Button onClick={() => setDeleteNote(null)}>取消</Button>
            <Button
              tone="danger"
              onClick={() => {
                setTimeline((current) =>
                  current.filter((_, index) => index !== deleteNote),
                );
                setDeleteNote(null);
                notify("沟通记录已删除");
              }}
            >
              确认删除
            </Button>
          </>
        }
      >
        <StateBanner
          tone="warning"
          icon="warning"
          title="这条沟通记录将被删除"
          description={deleteNote === null ? "" : timeline[deleteNote]?.[2]}
        />
      </Modal>
      <DeleteAssetModal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        assetLabel="联系人"
        assetName={profile.name}
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
  const [manage, setManage] = useState(null);
  const [unlinkTarget, setUnlinkTarget] = useState(null);
  const [mode, setMode] = useState("create");
  const [existingPositionId, setExistingPositionId] = useState("");
  const [positionName, setPositionName] = useState("");
  const [location, setLocation] = useState("北京 / 上海");
  const [experience, setExperience] = useState("5 年及以上");
  const [education, setEducation] = useState("硕士及以上，能力突出可放宽");
  const [salary, setSalary] = useState("60 - 90 万 / 年");
  const [skills, setSkills] = useState([]);
  const [jd, setJd] = useState("");
  const [note, setNote] = useState("");
  const [directions, setDirections] = useState([
    {
      id: "direction-vla",
      name: "VLA 算法负责人",
      requirement: "VLA、真机部署、团队管理",
      status: "已形成岗位",
      position: "具身智能 VLA 算法负责人",
      positionId: "position-vla",
    },
    {
      id: "direction-learning",
      name: "机器人学习工程师",
      requirement: "模仿学习、强化学习、数据闭环",
      status: "待处理",
      location: "北京 / 上海",
      experience: "5 年及以上",
      education: "硕士及以上，能力突出可放宽",
      salary: "60 - 90 万 / 年",
      skills: ["模仿学习", "强化学习", "真机部署", "数据闭环"],
      jd: `岗位职责
1. 负责机器人模仿学习、强化学习和操作策略的训练、评测与真机部署。
2. 建设从数据采集、清洗、训练到线上评测的数据闭环，并持续提升复杂操作任务成功率。
3. 与 VLA、感知、控制和硬件团队协作，推动算法在双臂机器人产品中稳定落地。
4. 参与关键技术方案评审，沉淀可复用的训练和部署工具。

任职要求
1. 计算机、自动化、机器人等相关专业硕士及以上学历，能力突出可放宽。
2. 具备 5 年以上机器人学习、强化学习或模仿学习相关经验。
3. 有真实机器人部署和数据闭环经验，能够独立定位训练与线上效果问题。
4. 具备良好的跨团队沟通能力和工程交付意识。`,
    },
    {
      id: "direction-data",
      name: "数据平台负责人",
      requirement: "机器人数据、MLOps、团队管理",
      status: "已关联岗位",
      position: "机器人数据平台负责人",
      positionId: "position-platform",
    },
    {
      id: "direction-simulation",
      name: "仿真平台工程师",
      requirement: "Isaac Sim、Sim2Real、Python",
      status: "待处理",
      location: "北京",
      experience: "3 年及以上",
      education: "本科及以上",
      salary: "45 - 70 万 / 年",
      skills: ["Isaac Sim", "Sim2Real", "Python"],
      jd: `岗位职责
1. 建设基于 Isaac Sim 的机器人仿真、数据生成和评测环境。
2. 优化 Sim2Real 流程，支持操作策略快速验证和真机迁移。
3. 与算法、数据和硬件团队协作，维护可复用的仿真资产与测试工具。

任职要求
1. 本科及以上学历，具备 3 年以上机器人仿真或相关平台经验。
2. 熟悉 Isaac Sim、Python 和常用机器人仿真工具。
3. 有仿真到真机迁移、合成数据或自动评测经验。`,
    },
  ]);
  const selectedPosition = positions.find(
    (position) => position.id === existingPositionId,
  );

  const openConvert = (direction) => {
    setConvert(direction);
    setMode("create");
    setExistingPositionId("");
    setPositionName(direction.name);
    setLocation(direction.location || "北京 / 上海");
    setExperience(direction.experience || "3 年及以上");
    setEducation(direction.education || "本科及以上");
    setSalary(direction.salary || "面议");
    setSkills(direction.skills || []);
    setJd(direction.jd || "");
    setNote("");
  };

  const completeConversion = () => {
    if (!convert) return;
    const nextPosition =
      mode === "create"
        ? { id: "position-vla", name: positionName }
        : selectedPosition;
    if (!nextPosition || (mode === "create" && !jd.trim())) return;
    setDirections((current) =>
      current.map((direction) =>
        direction.id === convert.id
          ? {
              ...direction,
              status: mode === "create" ? "已形成岗位" : "已关联岗位",
              position: nextPosition.name,
              positionId: nextPosition.id,
            }
          : direction,
      ),
    );
    notify(
      mode === "create"
        ? "新岗位已创建并关联到招聘机会"
        : "已有岗位已关联到招聘机会",
    );
    setConvert(null);
  };

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
            <article key={item.id}>
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
                <div className="s4-direction-position-actions">
                  <button
                    type="button"
                    onClick={() => navigate(`/positions/${item.positionId}`)}
                  >
                    {item.position}
                    <Icon name="chevronRight" />
                  </button>
                  <Button size="sm" onClick={() => setManage(item)}>
                    管理关联
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  tone="primary"
                  onClick={() => openConvert(item)}
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
        size="xl"
        title={`将“${convert?.name || "招聘方向"}”形成岗位`}
        description="先补齐并检查岗位资料，再创建新岗位或关联已有岗位"
        footer={
          <>
            <Button onClick={() => setConvert(null)}>取消</Button>
            <Button
              tone="primary"
              disabled={
                mode === "create"
                  ? !positionName.trim() || !jd.trim()
                  : !existingPositionId
              }
              onClick={completeConversion}
            >
              {mode === "create" ? "确认创建并关联" : "确认关联岗位"}
            </Button>
          </>
        }
      >
        <div className="s4-direction-convert-workspace">
          <div
            className="s4-convert-mode-tabs"
            role="tablist"
            aria-label="岗位形成方式"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "create"}
              className={mode === "create" ? "is-active" : ""}
              onClick={() => setMode("create")}
            >
              <Icon name="plus" />
              创建新岗位
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "existing"}
              className={mode === "existing" ? "is-active" : ""}
              onClick={() => setMode("existing")}
            >
              <Icon name="link" />
              关联已有岗位
            </button>
          </div>
          {mode === "create" ? (
            <div className="s4-direction-position-form">
              <StateBanner
                tone="info"
                title="岗位资料来自招聘方向草稿"
                description="请检查完整 JD 和招聘要求；确认后才会创建正式岗位。"
              />
              <div className="s4-form-grid">
                <FormField label="岗位名称" required>
                  <TextInput value={positionName} onChange={setPositionName} />
                </FormField>
                <FormField label="招聘公司">
                  <TextInput value={opportunity.company} disabled />
                </FormField>
                <FormField label="工作地点">
                  <TextInput value={location} onChange={setLocation} />
                </FormField>
                <FormField label="薪资范围">
                  <TextInput value={salary} onChange={setSalary} />
                </FormField>
                <FormField label="最低工作年限">
                  <TextInput value={experience} onChange={setExperience} />
                </FormField>
                <FormField label="学历要求及弹性">
                  <TextInput value={education} onChange={setEducation} />
                </FormField>
                <FormField label="关键技能" span={2}>
                  <SelectMenu
                    label="关键技能"
                    value={skills}
                    options={skills}
                    onChange={setSkills}
                    multiple
                    searchable
                    creatable
                  />
                  <div className="s4-editor-tag-preview">
                    <TagList items={skills} tone="info" />
                  </div>
                </FormField>
                <FormField
                  label="完整岗位 JD"
                  required
                  span={2}
                  help="必须能够说明岗位职责和任职要求；可直接修改招聘方向生成的内容。"
                >
                  <TextArea value={jd} onChange={setJd} rows={16} />
                </FormField>
                <FormField label="用户备注" span={2}>
                  <TextArea value={note} onChange={setNote} rows={4} />
                </FormField>
              </div>
            </div>
          ) : (
            <div className="s4-existing-position-flow">
              <FormField label="选择已有岗位" required>
                <SelectMenu
                  label="搜索岗位名称或公司"
                  value={selectedPosition?.name || ""}
                  options={positions.map((position) => position.name)}
                  onChange={(name) =>
                    setExistingPositionId(
                      positions.find((position) => position.name === name)
                        ?.id || "",
                    )
                  }
                  searchable
                />
              </FormField>
              {selectedPosition ? (
                <section className="s4-existing-position-preview">
                  <header>
                    <span>
                      <small>将要关联的岗位</small>
                      <h3>{selectedPosition.name}</h3>
                      <p>
                        {selectedPosition.company} · {selectedPosition.location}
                      </p>
                    </span>
                    <StatusFromText value={selectedPosition.status} />
                  </header>
                  <DefinitionGrid
                    columns={2}
                    items={[
                      ["关键技能", <TagList items={selectedPosition.skills} />],
                      ["匹配候选人", `${selectedPosition.matches} 位`],
                      ["岗位资料", "资料已确认 · 可继续编辑"],
                      ["当前来源机会", "尚未关联"],
                    ]}
                  />
                  <div className="s4-existing-position-jd">
                    <b>岗位要求摘要</b>
                    <p>
                      负责机器人数据、训练或仿真平台的规划与交付；具备相关平台建设、跨团队协作和工程落地经验。
                    </p>
                  </div>
                </section>
              ) : (
                <StateBanner
                  title="尚未选择岗位"
                  description="选择后会显示公司、地点、状态、技能和岗位要求，确认无误再建立关联。"
                />
              )}
            </div>
          )}
        </div>
      </Modal>
      <Modal
        open={Boolean(manage)}
        close={() => setManage(null)}
        size="lg"
        title="管理岗位关联"
        description="招聘方向和正式岗位彼此独立，解除关联不会删除岗位。"
        footer={
          <>
            <Button
              tone="danger-outline"
              onClick={() => {
                setUnlinkTarget(manage);
                setManage(null);
              }}
            >
              解除关联
            </Button>
            <Button onClick={() => setManage(null)}>关闭</Button>
            <Button
              tone="primary"
              onClick={() => navigate(`/positions/${manage?.positionId}`)}
            >
              查看岗位详情
            </Button>
          </>
        }
      >
        <DefinitionGrid
          columns={2}
          items={[
            ["招聘方向", manage?.name],
            ["关联方式", manage?.status],
            ["正式岗位", manage?.position],
            ["来源机会", opportunity.title],
          ]}
        />
      </Modal>
      <Modal
        open={Boolean(unlinkTarget)}
        close={() => setUnlinkTarget(null)}
        title="解除岗位关联"
        description="岗位会继续保留，但不再显示为当前招聘方向形成的岗位。"
        footer={
          <>
            <Button onClick={() => setUnlinkTarget(null)}>取消</Button>
            <Button
              tone="danger"
              onClick={() => {
                setDirections((current) =>
                  current.map((direction) =>
                    direction.id === unlinkTarget?.id
                      ? {
                          ...direction,
                          status: "待处理",
                          position: undefined,
                          positionId: undefined,
                        }
                      : direction,
                  ),
                );
                setUnlinkTarget(null);
                notify("岗位关联已解除");
              }}
            >
              确认解除
            </Button>
          </>
        }
      >
        <StateBanner
          tone="warning"
          icon="warning"
          title={`将解除“${unlinkTarget?.name || "招聘方向"}”与岗位的关联`}
          description="招聘方向会恢复为待处理，可以之后重新创建或关联岗位。"
        />
      </Modal>
    </div>
  );
}

function OpportunitySectionEditor({ section, opportunity, close, onSave }) {
  const notify = useToast();
  const [title, setTitle] = useState(opportunity.title);
  const [company, setCompany] = useState(opportunity.company);
  const [status, setStatus] = useState(opportunity.status);
  const [people, setPeople] = useState("20 - 25 人");
  const [period, setPeriod] = useState("2026.07 - 2026.12");
  const [contact, setContact] = useState("陈雨");
  const [copy, setCopy] = useState("");
  const titleMap = {
    basic: "机会资料",
    summary: "招聘需求摘要",
    evidence: "已确认依据",
  };

  useEffect(() => {
    setTitle(opportunity.title);
    setCompany(opportunity.company);
    setStatus(opportunity.status);
    setCopy(
      section === "summary"
        ? opportunity.summary
        : section === "evidence"
          ? opportunity.evidence
          : "",
    );
  }, [opportunity, section]);

  const save = () => {
    if (section === "basic") onSave({ title, company, status });
    if (section === "summary") onSave({ summary: copy });
    if (section === "evidence") onSave({ evidence: copy });
    close();
    notify(`${titleMap[section] || "招聘机会资料"}已保存`);
  };

  return (
    <Modal
      open={Boolean(section)}
      close={close}
      size={section === "basic" ? "xl" : "lg"}
      title={`编辑${titleMap[section] || "招聘机会资料"}`}
      description="本次修改只影响当前资料分组"
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button tone="primary" onClick={save}>
            保存修改
          </Button>
        </>
      }
    >
      {section === "basic" ? (
        <div className="s4-form-grid">
          <FormField label="机会名称" required>
            <TextInput value={title} onChange={setTitle} />
          </FormField>
          <FormField label="所属公司" required>
            <SelectMenu
              label="选择公司"
              value={company}
              options={companies.map((item) => item.name)}
              onChange={setCompany}
              searchable
            />
          </FormField>
          <FormField label="状态">
            <SelectMenu
              label="机会状态"
              value={status}
              options={["跟进中", "已完成", "已关闭"]}
              onChange={setStatus}
            />
          </FormField>
          <FormField label="预计人数">
            <TextInput value={people} onChange={setPeople} />
          </FormField>
          <FormField label="预计时间">
            <DatePicker
              label="选择预计时间"
              mode="month-range"
              value={period}
              onChange={setPeriod}
            />
          </FormField>
          <FormField label="相关联系人">
            <SelectMenu
              label="选择联系人"
              value={contact}
              options={contacts.map((item) => item.name)}
              onChange={setContact}
              searchable
            />
          </FormField>
        </div>
      ) : (
        <FormField label={titleMap[section]} required>
          <TextArea value={copy} onChange={setCopy} rows={9} />
        </FormField>
      )}
    </Modal>
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
  const [editingSection, setEditingSection] = useState(null);
  const [opportunity, setOpportunity] = useState(() => ({ ...item }));
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
        title={opportunity.title}
        subtitle={opportunity.company}
        badges={[
          {
            label: opportunity.status,
            tone: opportunity.status === "跟进中" ? "success" : "neutral",
          },
          { label: `${item.directions} 个招聘方向`, tone: "info" },
        ]}
        onBack={() => navigate("/opportunities")}
        onDelete={() => setDeleteOpen(true)}
      />
      <DetailTabs
        tabs={opportunityTabs}
        value={tab}
        onChange={(value) => setParams({ tab: value })}
      />
      {tab === "profile" ? (
        <div className="s4-detail-stack">
          <FieldGroup
            title="机会资料"
            action={
              <Button
                size="sm"
                icon="edit"
                onClick={() => setEditingSection("basic")}
              >
                编辑资料
              </Button>
            }
          >
            <DefinitionGrid
              items={[
                [
                  "所属公司",
                  <button
                    type="button"
                    className="s4-inline-link"
                    onClick={() => navigate("/companies/company-xinglan")}
                  >
                    {opportunity.company}
                  </button>,
                ],
                ["状态", <StatusFromText value={opportunity.status} />],
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
          <FieldGroup
            title="招聘需求摘要"
            action={
              <Button
                size="sm"
                icon="edit"
                onClick={() => setEditingSection("summary")}
              >
                编辑
              </Button>
            }
          >
            <p className="s4-long-copy">{opportunity.summary}</p>
          </FieldGroup>
          <FieldGroup
            title="已确认依据"
            action={
              <Button
                size="sm"
                icon="edit"
                onClick={() => setEditingSection("evidence")}
              >
                编辑
              </Button>
            }
          >
            <p className="s4-long-copy">
              {opportunity.evidence}。客户明确表示 VLA
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
        <OpportunityDirections opportunity={opportunity} />
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
      <OpportunitySectionEditor
        section={editingSection}
        opportunity={opportunity}
        close={() => setEditingSection(null)}
        onSave={(patch) =>
          setOpportunity((current) => ({ ...current, ...patch }))
        }
      />
      <DeleteAssetModal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        assetLabel="招聘机会"
        assetName={opportunity.title}
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
          <DatePicker
            label="选择预计时间"
            mode="month-range"
            value="2026.07 - 2026.12"
            onChange={() => {}}
          />
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
  const [industries, setIndustries] = useState([]);
  const [agentPrompt, setAgentPrompt] = useState("");
  const [agentAuthMode, setAgentAuthMode] = useState("confirm");
  const [agentAttachments, setAgentAttachments] = useState([]);
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
                  <IndustryCascade
                    value={industries}
                    onChange={setIndustries}
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
              <div className="s4-agent-composer-shell">
                <Composer
                  value={agentPrompt}
                  onChange={setAgentPrompt}
                  onSend={(text, attachedFiles) => {
                    const fileNames = attachedFiles
                      .map((file) => file.name)
                      .join("、");
                    const prompt =
                      text || `根据附件 ${fileNames} 调研并创建公司资料`;
                    navigate(`/new?prompt=${encodeURIComponent(prompt)}`);
                  }}
                  authMode={agentAuthMode}
                  onAuthChange={setAgentAuthMode}
                  attachments={agentAttachments}
                  onAttachmentsChange={setAgentAttachments}
                  placeholder="例如：调研星澜机器人，重点了解业务、融资、核心团队、岗位吸引力和招聘流程"
                />
              </div>
              <small className="s4-agent-create-hint">
                可直接粘贴链接，或添加文件与截图；Hunter
                会先形成草稿，再由你确认写入。
              </small>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
