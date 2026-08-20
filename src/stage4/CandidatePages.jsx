import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import {
  ActivityTimeline,
  AssetPageHeader,
  Button,
  CustomRadio,
  DefinitionGrid,
  DeleteAssetModal,
  DetailHeader,
  DetailTabs,
  EntityLink,
  FieldGroup,
  FileDrop,
  FilePreview,
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
  candidateDetail,
  candidates,
  matchResults,
  positionDetail,
} from "./data";

const candidateTabs = [
  { value: "profile", label: "候选人资料" },
  { value: "experience", label: "工作与教育" },
  { value: "files", label: "简历与文件" },
  { value: "timeline", label: "跟进与沟通" },
  { value: "matching", label: "匹配与推进" },
  { value: "relations", label: "关联信息" },
];

function ProfileTab({ candidate, onEdit }) {
  const navigate = useNavigate();
  return (
    <div className="s4-detail-stack">
      <FieldGroup
        title="职业概览"
        action={
          <Button
            size="sm"
            icon="sparkles"
            onClick={() => navigate("/new?prompt=补全林昊的候选人资料")}
          >
            启动信息补全
          </Button>
        }
      >
        <p className="s4-long-copy">{candidate.summary}</p>
        <small className="s4-generated-meta">
          基于资料版本 6 生成 · 昨天 18:20
        </small>
      </FieldGroup>
      <FieldGroup
        title="基本资料"
        action={
          <Button size="sm" icon="edit" onClick={onEdit}>
            编辑资料
          </Button>
        }
      >
        <DefinitionGrid
          items={[
            ["中文名", candidate.name],
            ["英文名", candidate.englishName],
            [
              "出生年份",
              `${candidate.birthYear}（${new Date().getFullYear() - Number(candidate.birthYear)} 岁）`,
            ],
            ["性别", candidate.gender],
            ["地点", candidate.location],
            ["求职状态", candidate.preference],
          ]}
        />
      </FieldGroup>
      <FieldGroup
        title="当前概览"
        description="概览不强制覆盖详细经历；存在差异时保留待核实提示。"
      >
        <DefinitionGrid
          items={[
            ["当前公司", candidate.company],
            ["当前职位", candidate.title],
            ["工作年限", candidate.experience],
            ["最高教育", candidate.education],
            ["职级", "技术总监 / 负责人"],
            [
              "信息状态",
              <StatusBadge tone="warning">当前职位待本人核实</StatusBadge>,
            ],
          ]}
        />
      </FieldGroup>
      <FieldGroup title="联系方式">
        <div className="s4-contact-methods">
          <article>
            <i>
              <Icon name="phone" />
            </i>
            <span>
              <b>{candidate.phone}</b>
              <small>主要手机 · 2026-08-18 核实</small>
            </span>
            <StatusBadge tone="success">可用</StatusBadge>
          </article>
          <article>
            <i>
              <Icon name="mail" />
            </i>
            <span>
              <b>{candidate.email}</b>
              <small>主要邮箱 · 简历提供</small>
            </span>
            <StatusBadge tone="success">已回复</StatusBadge>
          </article>
        </div>
      </FieldGroup>
      <FieldGroup title="技能与行业">
        <div className="s4-labeled-row">
          <b>关键技能</b>
          <TagList
            items={[
              "VLA",
              "强化学习",
              "机器人学习",
              "模仿学习",
              "真机部署",
              "数据闭环",
              "团队管理",
            ]}
            tone="info"
          />
        </div>
        <div className="s4-labeled-row">
          <b>行业标签</b>
          <TagList items={["机器人", "人工智能"]} />
        </div>
        <div className="s4-labeled-row">
          <b>软性能力</b>
          <p>
            能够在研究、工程和产品团队之间建立清晰的交付边界，愿意亲自解决关键技术问题。
          </p>
        </div>
      </FieldGroup>
      <FieldGroup title="公开资料链接">
        <div className="s4-link-list">
          {candidate.links.map(([type, url, status]) => (
            <button
              type="button"
              key={url}
              onClick={() => window.open(`https://${url}`, "_blank")}
            >
              <i>
                <Icon name="link" />
              </i>
              <span>
                <b>{type}</b>
                <small>{url}</small>
              </span>
              <StatusBadge tone="success">{status}</StatusBadge>
              <Icon name="chevronRight" />
            </button>
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

function ExperienceTab({ candidate }) {
  const notify = useToast();
  const [experienceModal, setExperienceModal] = useState(false);
  return (
    <div className="s4-detail-stack">
      <FieldGroup
        title="工作经历"
        action={
          <Button
            size="sm"
            icon="plus"
            onClick={() => setExperienceModal(true)}
          >
            添加经历
          </Button>
        }
      >
        <div className="s4-experience-list">
          {candidate.experiences.map((item, index) => (
            <article key={item.company}>
              <span className="s4-experience-time">{item.period}</span>
              <div>
                <header>
                  <span>
                    <h3>{item.company}</h3>
                    <p>
                      {item.title} · {item.department}
                    </p>
                  </span>
                  <button
                    type="button"
                    onClick={() => setExperienceModal(true)}
                  >
                    <Icon name="edit" />
                    编辑
                  </button>
                </header>
                <p>{item.detail}</p>
                <footer>
                  <StatusBadge tone="success">已关联正式公司</StatusBadge>
                  <small>{index === 0 ? "简历与用户确认" : "历史简历"}</small>
                </footer>
              </div>
            </article>
          ))}
        </div>
      </FieldGroup>
      <FieldGroup
        title="教育经历"
        action={
          <Button
            size="sm"
            icon="plus"
            onClick={() => notify("已打开教育经历编辑")}
          >
            添加教育
          </Button>
        }
      >
        <div className="s4-simple-records">
          {candidate.educationHistory.map(([school, degree, period]) => (
            <article key={school}>
              <i>
                <Icon name="database" />
              </i>
              <span>
                <b>{school}</b>
                <p>{degree}</p>
              </span>
              <time>{period}</time>
              <button
                type="button"
                onClick={() => notify(`已打开“${school}”教育经历`)}
              >
                <Icon name="edit" />
              </button>
            </article>
          ))}
        </div>
      </FieldGroup>
      <FieldGroup
        title="项目经历"
        action={
          <Button
            size="sm"
            icon="plus"
            onClick={() => notify("已打开项目经历编辑")}
          >
            添加项目
          </Button>
        }
      >
        <div className="s4-project-list">
          {candidate.projects.map(([name, role, period, detail]) => (
            <article key={name}>
              <header>
                <span>
                  <b>{name}</b>
                  <small>
                    {role} · {period}
                  </small>
                </span>
                <button
                  type="button"
                  onClick={() => notify(`已打开“${name}”项目经历`)}
                >
                  <Icon name="edit" />
                </button>
              </header>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </FieldGroup>
      <ExperienceModal
        open={experienceModal}
        close={() => setExperienceModal(false)}
        onSave={() => {
          setExperienceModal(false);
          notify("工作经历已保存");
        }}
      />
    </div>
  );
}

function ExperienceModal({ open, close, onSave }) {
  const [company, setCompany] = useState("拓界机器人");
  const [title, setTitle] = useState("机器人学习负责人");
  const [detail, setDetail] = useState(
    "负责机器人学习团队、操作策略平台和真机数据闭环。\n主导多任务策略上线并推动跨团队交付。",
  );
  return (
    <Modal
      open={open}
      close={close}
      size="xl"
      title="编辑工作经历"
      description="公司原文和正式公司关系分别保存"
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button tone="primary" onClick={onSave}>
            保存经历
          </Button>
        </>
      }
    >
      <div className="s4-form-grid">
        <FormField label="公司原文" required>
          <TextInput value={company} onChange={setCompany} />
        </FormField>
        <FormField label="正式公司关联">
          <SelectMenu
            label="选择公司"
            value={company}
            options={["拓界机器人", "星澜机器人", "上海人工智能实验室"]}
            onChange={setCompany}
            searchable
          />
        </FormField>
        <FormField label="职位" required>
          <TextInput value={title} onChange={setTitle} />
        </FormField>
        <FormField label="部门">
          <TextInput value="智能操作部 / 机器人学习团队" onChange={() => {}} />
        </FormField>
        <FormField label="起止时间">
          <TextInput value="2022.03 - 至今" onChange={() => {}} />
        </FormField>
        <FormField label="团队规模">
          <TextInput value="14 人" onChange={() => {}} />
        </FormField>
        <FormField label="职责与亮点" required span={2}>
          <TextArea value={detail} onChange={setDetail} rows={6} />
        </FormField>
      </div>
    </Modal>
  );
}

function FilesTab({ candidate }) {
  const notify = useToast();
  const [preview, setPreview] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  return (
    <div className="s4-detail-stack">
      <StateBanner
        tone="warning"
        icon="warning"
        title="新简历不会直接覆盖候选人档案"
        description="系统会先比较新增、更新和冲突字段，再由用户确认或按当前授权处理。"
        action={
          <Button size="sm" onClick={() => notify("已打开资料版本变化")}>
            查看变化
          </Button>
        }
      />
      <FieldGroup
        title="简历版本"
        action={
          <Button size="sm" icon="upload" onClick={() => setUploadOpen(true)}>
            上传新简历
          </Button>
        }
      >
        <div className="s4-file-list">
          {candidate.resumes.map(
            ([name, version, time, status, size], index) => (
              <article key={name}>
                <i>
                  <Icon name="file" />
                </i>
                <span>
                  <b>{name}</b>
                  <small>
                    {version} · {time} · {size}
                  </small>
                </span>
                <StatusBadge tone="success">{status}</StatusBadge>
                <div>
                  <button type="button" onClick={() => setPreview(name)}>
                    预览
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      notify(
                        index
                          ? "该版本已恢复为当前简历，并形成新的变化记录"
                          : "已经是当前简历",
                      )
                    }
                  >
                    {index ? "恢复" : "当前"}
                  </button>
                </div>
              </article>
            ),
          )}
        </div>
      </FieldGroup>
      <FieldGroup
        title="其他文件"
        description="作品集、证明、推荐材料和沟通附件与简历版本分开。"
        action={
          <Button size="sm" icon="plus" onClick={() => setUploadOpen(true)}>
            添加文件
          </Button>
        }
      >
        <div className="s4-file-list">
          {candidate.files.map(([name, type, time, size]) => (
            <article key={name}>
              <i>
                <Icon name="file" />
              </i>
              <span>
                <b>{name}</b>
                <small>
                  {type} · {time} · {size}
                </small>
              </span>
              <StatusBadge tone="neutral">已保存</StatusBadge>
              <div>
                <button type="button" onClick={() => setPreview(name)}>
                  预览
                </button>
                <button
                  type="button"
                  className="is-danger"
                  onClick={() => notify(`“${name}”已移至回收站`)}
                >
                  删除
                </button>
              </div>
            </article>
          ))}
        </div>
      </FieldGroup>
      <Modal
        open={uploadOpen}
        close={() => setUploadOpen(false)}
        size="lg"
        title="上传候选人文件"
        description="系统会先判断文件类型，再决定是否进入简历解析"
        footer={
          <>
            <Button onClick={() => setUploadOpen(false)}>取消</Button>
            <Button
              tone="primary"
              onClick={() => {
                setUploadOpen(false);
                notify("文件已上传，正在解析并比较变化", "info");
              }}
            >
              上传并处理
            </Button>
          </>
        }
      >
        <FileDrop files={[]} onFiles={() => {}} accept="PDF、DOCX、PNG、JPG" />
      </Modal>
      {preview ? (
        <FilePreview name={preview} close={() => setPreview(null)} />
      ) : null}
    </div>
  );
}

function TimelineTab({ candidate }) {
  const notify = useToast();
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  return (
    <div className="s4-detail-stack">
      <FieldGroup
        title="跟进与沟通"
        description="真实消息只保存一次；岗位业务事件通过引用显示。"
        action={
          <Button size="sm" icon="plus" onClick={() => setNoteOpen(true)}>
            添加记录
          </Button>
        }
      >
        <ActivityTimeline items={candidate.timeline} />
      </FieldGroup>
      <Modal
        open={noteOpen}
        close={() => setNoteOpen(false)}
        title="添加跟进记录"
        description="可以记录电话、微信、线下沟通或其他人工信息"
        footer={
          <>
            <Button onClick={() => setNoteOpen(false)}>取消</Button>
            <Button
              tone="primary"
              disabled={!note.trim()}
              onClick={() => {
                setNoteOpen(false);
                setNote("");
                notify("跟进记录已添加");
              }}
            >
              保存记录
            </Button>
          </>
        }
      >
        <div className="s4-form-grid">
          <FormField label="记录类型">
            <SelectMenu
              label="选择类型"
              value="人工备注"
              options={["人工备注", "电话沟通", "线下沟通", "其他"]}
              onChange={() => {}}
            />
          </FormField>
          <FormField label="关联业务">
            <SelectMenu
              label="可选"
              value="具身智能 VLA 算法负责人"
              options={["具身智能 VLA 算法负责人", "星澜机器人客户开发"]}
              onChange={() => {}}
            />
          </FormField>
          <FormField label="内容" required span={2}>
            <TextArea
              value={note}
              onChange={setNote}
              placeholder="记录本次沟通内容和下一步"
              rows={6}
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}

function MatchingTab() {
  const navigate = useNavigate();
  const notify = useToast();
  return (
    <div className="s4-detail-stack">
      <StateBanner
        tone="warning"
        icon="warning"
        title="1 条匹配结果需要更新"
        description="候选人资料版本已变化，历史结果继续保留，但不再作为当前判断。"
        action={
          <Button
            size="sm"
            icon="refresh"
            onClick={() => notify("已创建重新匹配任务", "info")}
          >
            重新匹配
          </Button>
        }
      />
      <FieldGroup
        title="岗位匹配"
        action={
          <Button
            size="sm"
            icon="sparkles"
            onClick={() => notify("已创建候选人全量匹配任务", "info")}
          >
            匹配岗位
          </Button>
        }
      >
        <div className="s4-match-list">
          <article
            onClick={() => navigate("/positions/position-vla?tab=matching")}
          >
            <strong>91</strong>
            <span>
              <b>具身智能 VLA 算法负责人</b>
              <small>星澜机器人 · 当前结果</small>
              <p>
                技术方向、真机部署和团队规模高度匹配；需要确认北京工作安排。
              </p>
            </span>
            <StatusBadge tone="success">推荐</StatusBadge>
            <Icon name="chevronRight" />
          </article>
          <article>
            <strong>83</strong>
            <span>
              <b>机器人数据平台负责人</b>
              <small>拓界机器人 · 需要更新</small>
              <p>
                数据闭环经历匹配，但候选人近期管理职责变化后需要重算角色适配。
              </p>
            </span>
            <StatusBadge tone="warning">需更新</StatusBadge>
            <Icon name="chevronRight" />
          </article>
        </div>
      </FieldGroup>
      <FieldGroup title="岗位推进">
        <div className="s4-pipeline-relations">
          <article>
            <span>
              <b>具身智能 VLA 算法负责人</b>
              <small>星澜机器人</small>
            </span>
            <StatusBadge tone="warning">一面</StatusBadge>
            <p>昨天 16:20 从推荐进入一面 · 下一步：确认技术面时间</p>
            <button
              type="button"
              onClick={() => navigate("/positions/position-vla?tab=pipeline")}
            >
              查看推进
            </button>
          </article>
        </div>
      </FieldGroup>
    </div>
  );
}

function RelationsTab() {
  const navigate = useNavigate();
  return (
    <div className="s4-detail-stack">
      <FieldGroup title="关联公司">
        <div className="s4-entity-grid">
          <EntityLink
            icon="building"
            title="拓界机器人"
            meta="当前工作经历 · 正式关联"
            onClick={() => navigate("/companies/company-tuojie")}
          />
          <EntityLink
            icon="building"
            title="上海人工智能实验室"
            meta="历史工作经历 · 正式关联"
            onClick={() => navigate("/companies/company-ailab")}
          />
        </div>
      </FieldGroup>
      <FieldGroup title="学术成果">
        <div className="s4-entity-grid">
          <EntityLink
            icon="paper"
            title="Vision-Language-Action Models for Robotics: A Survey"
            meta="第一作者 · 稳定作者身份已确认"
            onClick={() => navigate("/papers/paper-vla-survey")}
          />
          <EntityLink
            icon="patent"
            title="机器人训练数据的自动筛选与回流系统"
            meta="第一发明人 · 申请号已确认"
            onClick={() => navigate("/patents/patent-data")}
          />
        </div>
      </FieldGroup>
      <FieldGroup title="人才版图">
        <div className="s4-entity-grid">
          <EntityLink
            icon="route"
            title="具身智能 VLA 核心人才版图"
            meta="目标人才 · 优先级高"
            onClick={() => navigate("/mappings/mapping-embodied")}
          />
        </div>
      </FieldGroup>
      <FieldGroup title="来源与证据">
        <SourceList
          items={[
            {
              title: "当前简历",
              description: "林昊_机器人学习负责人_2026.pdf",
              meta: "2026-08-18 · 用户上传",
              status: "可访问",
            },
            {
              title: "公开职业资料",
              description: "LinkedIn 公开履历和 GitHub 主页",
              meta: "2026-08-19 · 信息补全任务",
              status: "已验证",
            },
            {
              title: "用户确认",
              description: "电话核实当前职位与求职偏好",
              meta: "2026-08-20 · 沈岚",
              status: "已确认",
            },
          ]}
        />
      </FieldGroup>
    </div>
  );
}

function EditCandidateModal({ open, close, candidate }) {
  const notify = useToast();
  const [name, setName] = useState(candidate.name);
  const [company, setCompany] = useState(candidate.company);
  const [title, setTitle] = useState(candidate.title);
  const [year, setYear] = useState(candidate.birthYear);
  return (
    <Modal
      open={open}
      close={close}
      size="xl"
      title="编辑候选人资料"
      description="修改基础资料不会覆盖简历原文和历史版本"
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button
            tone="primary"
            disabled={!name.trim()}
            onClick={() => {
              close();
              notify("候选人资料已保存");
            }}
          >
            保存修改
          </Button>
        </>
      }
    >
      <div className="s4-form-grid">
        <FormField label="姓名" required>
          <TextInput value={name} onChange={setName} />
        </FormField>
        <FormField label="英文名">
          <TextInput value={candidate.englishName} onChange={() => {}} />
        </FormField>
        <FormField label="当前公司原文">
          <TextInput value={company} onChange={setCompany} />
        </FormField>
        <FormField label="正式公司关联">
          <SelectMenu
            label="选择公司"
            value={company}
            options={["拓界机器人", "星澜机器人", "上海人工智能实验室"]}
            onChange={setCompany}
            searchable
          />
        </FormField>
        <FormField label="当前职位">
          <TextInput value={title} onChange={setTitle} />
        </FormField>
        <FormField label="地点">
          <TextInput value={candidate.location} onChange={() => {}} />
        </FormField>
        <FormField label="出生年份" help="年龄将根据出生年份动态计算">
          <TextInput value={year} onChange={setYear} />
        </FormField>
        <FormField label="求职状态">
          <SelectMenu
            label="选择状态"
            value={candidate.preference}
            options={["正在求职", "愿意了解机会", "暂不考虑", "未知"]}
            onChange={() => {}}
          />
        </FormField>
        <FormField label="用户备注" span={2}>
          <TextArea
            value=""
            onChange={() => {}}
            placeholder="用户维护的备注不会被 Agent 覆盖"
          />
        </FormField>
      </div>
    </Modal>
  );
}

export function CandidateDetailPage() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "profile";
  const state = params.get("state") || "normal";
  const candidate =
    candidateId === candidateDetail.id || candidateId === "candidate-linhao"
      ? candidateDetail
      : candidates.find((item) => item.id === candidateId);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  if (!candidate)
    return (
      <NotFoundState label="候选人" onBack={() => navigate("/candidates")} />
    );
  if (state === "loading")
    return (
      <div className="s4-detail-loading">
        <span />
        <span />
        <span />
      </div>
    );
  if (state === "error")
    return (
      <div className="s4-detail-error">
        <Icon name="warning" />
        <h1>候选人资料加载失败</h1>
        <p>已经保留列表搜索上下文，可以重新加载或返回列表。</p>
        <Button
          tone="primary"
          icon="refresh"
          onClick={() => setParams({ tab })}
        >
          重新加载
        </Button>
      </div>
    );
  return (
    <div className="s4-detail-page">
      {state === "limited" ? (
        <StateBanner
          tone="warning"
          icon="warning"
          title="部分敏感资料已隐藏"
          description="当前账号可以查看候选人业务摘要，但不能查看联系方式、简历原文和沟通记录。"
        />
      ) : null}
      <DetailHeader
        icon="users"
        title={candidate.name}
        subtitle={`${candidate.company} · ${candidate.title}`}
        badges={[
          { label: candidate.preference || "资料已确认", tone: "success" },
          { label: "资料版本 6", tone: "info" },
        ]}
        onBack={() => navigate("/candidates")}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      >
        <Button
          icon="copy"
          onClick={() => navigate("/reviews/identity/candidate-linhao")}
        >
          身份与合并
        </Button>
      </DetailHeader>
      <DetailTabs
        tabs={candidateTabs}
        value={tab}
        onChange={(value) => setParams({ tab: value })}
      />
      {tab === "profile" ? (
        <ProfileTab
          candidate={{ ...candidateDetail, ...candidate }}
          onEdit={() => setEditOpen(true)}
        />
      ) : null}
      {tab === "experience" ? (
        <ExperienceTab candidate={candidateDetail} />
      ) : null}
      {tab === "files" ? <FilesTab candidate={candidateDetail} /> : null}
      {tab === "timeline" ? <TimelineTab candidate={candidateDetail} /> : null}
      {tab === "matching" ? <MatchingTab /> : null}
      {tab === "relations" ? <RelationsTab /> : null}
      <EditCandidateModal
        open={editOpen}
        close={() => setEditOpen(false)}
        candidate={candidateDetail}
      />
      <DeleteAssetModal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        assetLabel="候选人"
        assetName={candidate.name}
        impact="岗位推进、匹配历史和业务主线会保留已删除引用；公司、岗位、论文和专利不会被删除。"
        onConfirm={() => {
          setDeleteOpen(false);
          notify("候选人已进入回收站");
          navigate("/candidates");
        }}
      />
    </div>
  );
}

export function CandidateCreatePage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get("mode") || "manual");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [files, setFiles] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const create = () => {
    setSubmitted(true);
    if (
      !name.trim() ||
      (!company.trim() && !title.trim() && !phone.trim() && !email.trim())
    )
      return;
    if (name.includes("林昊")) {
      setDuplicate(true);
      return;
    }
    notify("候选人已创建");
    navigate("/candidates/candidate-linhao");
  };
  return (
    <div className="s4-create-page">
      <AssetPageHeader
        eyebrow="候选人"
        title="新建候选人"
        description="手动录入身份资料，或上传简历后审核新增与变化。"
        actions={<Button onClick={() => navigate("/candidates")}>取消</Button>}
      />
      <div className="s4-create-layout">
        <aside className="s4-create-modes">
          <button
            type="button"
            className={mode === "manual" ? "is-active" : ""}
            onClick={() => setMode("manual")}
          >
            <Icon name="edit" />
            <span>
              <b>手动新建</b>
              <small>填写已知资料</small>
            </span>
          </button>
          <button
            type="button"
            className={mode === "upload" ? "is-active" : ""}
            onClick={() => setMode("upload")}
          >
            <Icon name="upload" />
            <span>
              <b>上传简历</b>
              <small>解析后确认写入</small>
            </span>
          </button>
        </aside>
        <section className="s4-create-workspace">
          {mode === "manual" ? (
            <>
              <header>
                <h2>候选人身份与当前资料</h2>
                <p>只有姓名不能创建正式候选人，至少还需要一项可识别信息。</p>
              </header>
              <div className="s4-form-grid">
                <FormField
                  label="姓名"
                  required
                  error={submitted && !name.trim() ? "请输入候选人姓名" : ""}
                >
                  <TextInput
                    value={name}
                    onChange={setName}
                    placeholder="例如：林昊"
                  />
                </FormField>
                <FormField label="英文名">
                  <TextInput value="" onChange={() => {}} placeholder="可选" />
                </FormField>
                <FormField label="当前公司原文">
                  <TextInput
                    value={company}
                    onChange={setCompany}
                    placeholder="保留资料中的原始写法"
                  />
                </FormField>
                <FormField label="当前职位">
                  <TextInput value={title} onChange={setTitle} />
                </FormField>
                <FormField label="手机">
                  <TextInput value={phone} onChange={setPhone} />
                </FormField>
                <FormField label="邮箱">
                  <TextInput value={email} onChange={setEmail} />
                </FormField>
                <FormField label="地点">
                  <TextInput value="" onChange={() => {}} />
                </FormField>
                <FormField label="出生年份">
                  <TextInput
                    value=""
                    onChange={() => {}}
                    placeholder="例如：1990"
                  />
                </FormField>
                <FormField label="用户备注" span={2}>
                  <TextArea value="" onChange={() => {}} rows={5} />
                </FormField>
              </div>
              {submitted &&
              !company.trim() &&
              !title.trim() &&
              !phone.trim() &&
              !email.trim() ? (
                <StateBanner
                  tone="danger"
                  icon="warning"
                  title="资料不足，不能创建正式候选人"
                  description="请至少补充公司、职位、手机或邮箱中的一项；否则可以先保留为人物线索。"
                  action={
                    <Button
                      size="sm"
                      onClick={() => notify("已保存为人物线索")}
                    >
                      保存为人物线索
                    </Button>
                  }
                />
              ) : null}
              <footer>
                <Button tone="primary" onClick={create}>
                  创建候选人
                </Button>
              </footer>
            </>
          ) : (
            <UploadCandidate files={files} setFiles={setFiles} />
          )}
        </section>
      </div>
      <Modal
        open={duplicate}
        close={() => setDuplicate(false)}
        size="lg"
        title="可能已存在同一位候选人"
        description="Hunter 不会静默跳过，也不会直接创建重复档案"
        footer={
          <>
            <Button onClick={() => setDuplicate(false)}>返回补充资料</Button>
            <Button
              tone="primary"
              onClick={() => navigate("/reviews/identity/candidate-linhao")}
            >
              审核并合并
            </Button>
          </>
        }
      >
        <div className="s4-duplicate-compare">
          <article>
            <small>本次输入</small>
            <b>{name}</b>
            <p>
              {company || "未填写公司"} · {title || "未填写职位"}
            </p>
          </article>
          <Icon name="refresh" />
          <article>
            <small>已有候选人</small>
            <b>林昊</b>
            <p>拓界机器人 · 机器人学习负责人</p>
            <StatusBadge tone="success">手机后四位一致</StatusBadge>
          </article>
        </div>
      </Modal>
    </div>
  );
}

function UploadCandidate({ files, setFiles }) {
  const navigate = useNavigate();
  const notify = useToast();
  const [processing, setProcessing] = useState(false);
  const [failed, setFailed] = useState(false);
  const process = () => {
    if (!files.length) {
      setFailed(true);
      return;
    }
    setProcessing(true);
    window.setTimeout(() => {
      setProcessing(false);
      notify("简历解析完成，发现已有候选人和 7 项变化", "info");
      navigate("/reviews/identity/candidate-linhao?from=upload");
    }, 900);
  };
  return (
    <>
      <header>
        <h2>上传候选人简历</h2>
        <p>系统先判断是否为简历，再做解析、查重和变化审核。</p>
      </header>
      <FileDrop
        files={files}
        onFiles={(next) => {
          setFiles(next);
          setFailed(false);
        }}
        accept="PDF、DOCX"
        error={failed ? "请先选择一份 PDF 或 DOCX 简历" : ""}
      />
      <div className="s4-upload-rules">
        <span>
          <Icon name="check" />
          非简历文件会在解析前被阻止
        </span>
        <span>
          <Icon name="check" />
          发现同一候选人时进入合并审核
        </span>
        <span>
          <Icon name="check" />
          没有新内容时明确返回处理结果
        </span>
      </div>
      <footer>
        <Button tone="primary" loading={processing} onClick={process}>
          {processing ? "正在判断并解析" : "上传并解析"}
        </Button>
      </footer>
    </>
  );
}

export function IdentityMergeReviewPage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [params] = useSearchParams();
  const [section, setSection] = useState("changes");
  const [choices, setChoices] = useState({
    company: "existing",
    phone: "new",
    title: "new",
    summary: "new",
  });
  const [busy, setBusy] = useState(false);
  const items = [
    {
      key: "company",
      field: "当前公司",
      existing: "拓界机器人",
      incoming: "拓界机器人（上海）有限公司",
      source: "新简历",
      confidence: "正式公司关系不变",
    },
    {
      key: "phone",
      field: "手机",
      existing: "138 **** 6217",
      incoming: "138 1688 6217",
      source: "新简历",
      confidence: "后四位一致",
    },
    {
      key: "title",
      field: "当前职位",
      existing: "机器人学习负责人",
      incoming: "机器人学习与数据平台负责人",
      source: "新简历",
      confidence: "新资料更新",
    },
    {
      key: "summary",
      field: "职业概览",
      existing: "负责机器人学习团队与真机数据闭环。",
      incoming: "负责机器人学习、数据平台和 14 人算法团队。",
      source: "新简历",
      confidence: "新增团队规模",
    },
  ];
  return (
    <div className="s4-review-workspace">
      <header className="s4-review-header">
        <button
          type="button"
          onClick={() => navigate("/candidates/candidate-linhao?tab=files")}
        >
          <Icon name="chevronLeft" />
          返回候选人
        </button>
        <span>
          <small>身份与合并审核</small>
          <h1>林昊 · 新简历资料合并</h1>
          <p>
            稳定身份和手机后四位交叉确认，系统判断为同一人。请审核变化后写入已有档案。
          </p>
        </span>
        <StatusBadge tone="warning">等待确认</StatusBadge>
      </header>
      <div className="s4-review-summary">
        <article>
          <small>保留档案</small>
          <b>林昊</b>
          <p>拓界机器人 · 资料版本 6</p>
        </article>
        <Icon name="refresh" />
        <article>
          <small>本次资料</small>
          <b>
            {params.get("from") === "upload"
              ? "林昊_2026_更新简历.pdf"
              : "本机返回资料"}
          </b>
          <p>发现 3 项更新 · 1 项冲突</p>
        </article>
        <dl>
          <div>
            <dt>正式关系</dt>
            <dd>7 条保留</dd>
          </div>
          <div>
            <dt>业务推进</dt>
            <dd>1 条保留</dd>
          </div>
          <div>
            <dt>文件</dt>
            <dd>新增 1 份</dd>
          </div>
        </dl>
      </div>
      <div className="s4-review-tabs">
        <button
          type="button"
          className={section === "changes" ? "is-active" : ""}
          onClick={() => setSection("changes")}
        >
          字段变化 <em>4</em>
        </button>
        <button
          type="button"
          className={section === "relations" ? "is-active" : ""}
          onClick={() => setSection("relations")}
        >
          关系与文件 <em>9</em>
        </button>
        <button
          type="button"
          className={section === "sources" ? "is-active" : ""}
          onClick={() => setSection("sources")}
        >
          判断依据 <em>3</em>
        </button>
      </div>
      {section === "changes" ? (
        <div className="s4-change-review-list">
          {items.map((item) => (
            <article key={item.key}>
              <header>
                <span>
                  <b>{item.field}</b>
                  <small>
                    {item.source} · {item.confidence}
                  </small>
                </span>
                <StatusBadge
                  tone={item.key === "company" ? "warning" : "success"}
                >
                  {item.key === "company" ? "需要选择" : "建议更新"}
                </StatusBadge>
              </header>
              <div>
                <CustomRadio
                  label="保留现有内容"
                  description={item.existing}
                  checked={choices[item.key] === "existing"}
                  onChange={() =>
                    setChoices((current) => ({
                      ...current,
                      [item.key]: "existing",
                    }))
                  }
                />
                <CustomRadio
                  label="采用本次内容"
                  description={item.incoming}
                  checked={choices[item.key] === "new"}
                  onChange={() =>
                    setChoices((current) => ({ ...current, [item.key]: "new" }))
                  }
                />
              </div>
            </article>
          ))}
        </div>
      ) : null}
      {section === "relations" ? (
        <div className="s4-preserved-relations">
          <StateBanner
            title="正式关系不会因资料合并而丢失"
            description="岗位推进、匹配历史、公司经历、论文、专利、人才版图和业务主线继续关联到保留档案。"
          />
          <div className="s4-entity-grid">
            <EntityLink
              icon="briefcase"
              title="具身智能 VLA 算法负责人"
              meta="一面 · 保留"
            />
            <EntityLink
              icon="building"
              title="拓界机器人"
              meta="当前工作经历 · 保留"
            />
            <EntityLink
              icon="paper"
              title="2 篇论文"
              meta="稳定作者身份 · 保留"
            />
            <EntityLink
              icon="file"
              title="新增简历文件"
              meta="作为新版本保存"
            />
          </div>
        </div>
      ) : null}
      {section === "sources" ? (
        <SourceList
          items={[
            {
              title: "手机身份",
              description: "本次资料与已有档案手机完整号码一致",
              meta: "强身份依据",
              status: "已确认",
            },
            {
              title: "工作轨迹",
              description: "拓界机器人与上海人工智能实验室经历时间线一致",
              meta: "两段经历交叉验证",
              status: "已确认",
            },
            {
              title: "公开身份",
              description: "LinkedIn 与 Google Scholar 身份保持一致",
              meta: "公开资料",
              status: "已验证",
            },
          ]}
        />
      ) : null}
      <footer className="s4-review-footer">
        <span>
          <b>合并后形成资料版本 7</b>
          <small>当前选择：采用 3 项本次内容，保留 1 项现有内容</small>
        </span>
        <div>
          <Button onClick={() => navigate("/candidates/candidate-linhao")}>
            取消
          </Button>
          <Button
            tone="primary"
            loading={busy}
            onClick={() => {
              setBusy(true);
              window.setTimeout(() => {
                notify("资料已合并，可在变化记录中撤销");
                navigate("/candidates/candidate-linhao");
              }, 700);
            }}
          >
            确认合并
          </Button>
        </div>
      </footer>
    </div>
  );
}

export function FieldChangeReviewPage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [accepted, setAccepted] = useState(new Set(["skill", "team"]));
  const changes = [
    {
      id: "skill",
      field: "关键技能",
      before: "VLA、强化学习、真机部署",
      after: "VLA、强化学习、真机部署、数据闭环",
      source: "项目作品集第 6 页",
    },
    {
      id: "team",
      field: "团队规模",
      before: "未记录",
      after: "14 人",
      source: "新简历工作经历",
    },
    {
      id: "location",
      field: "意向地点",
      before: "上海",
      after: "上海、北京",
      source: "邮件回复",
    },
  ];
  return (
    <div className="s4-review-workspace">
      <header className="s4-review-header">
        <button type="button" onClick={() => navigate(-1)}>
          <Icon name="chevronLeft" />
          返回
        </button>
        <span>
          <small>字段变化审核</small>
          <h1>林昊 · 3 项资料建议</h1>
          <p>每项变化保留来源；未选择的建议不会写入正式档案。</p>
        </span>
      </header>
      <div className="s4-field-change-table">
        <header>
          <span>字段</span>
          <span>当前内容</span>
          <span>建议内容</span>
          <span>处理</span>
        </header>
        {changes.map((item) => (
          <article key={item.id}>
            <b>
              {item.field}
              <small>{item.source}</small>
            </b>
            <p>{item.before}</p>
            <p>{item.after}</p>
            <button
              type="button"
              className={accepted.has(item.id) ? "is-accepted" : ""}
              onClick={() => {
                const next = new Set(accepted);
                if (next.has(item.id)) next.delete(item.id);
                else next.add(item.id);
                setAccepted(next);
              }}
            >
              {accepted.has(item.id) ? (
                <>
                  <Icon name="check" />
                  采用
                </>
              ) : (
                "不采用"
              )}
            </button>
          </article>
        ))}
      </div>
      <footer className="s4-review-footer">
        <span>
          <b>将写入 {accepted.size} 项变化</b>
          <small>所有决定进入变化记录</small>
        </span>
        <div>
          <Button onClick={() => navigate(-1)}>取消</Button>
          <Button
            tone="primary"
            disabled={!accepted.size}
            onClick={() => {
              notify("字段变化已写入候选人档案");
              navigate("/candidates/candidate-linhao");
            }}
          >
            应用变化
          </Button>
        </div>
      </footer>
    </div>
  );
}

export function SourceEvidencePage() {
  const navigate = useNavigate();
  const [activeField, setActiveField] = useState("当前职位");
  const evidenceByField = {
    当前职位: {
      value: "机器人学习负责人",
      count: 2,
      sources: [
        {
          title: "林昊_机器人学习负责人_2026.pdf",
          description: "“机器人学习负责人，负责算法与数据平台团队”",
          meta: "第 1 页 · 2026-08-18 上传",
          status: "直接证据",
        },
        {
          title: "LinkedIn 公开职业资料",
          description: "Robotics Learning Lead at Tuojie Robotics",
          meta: "2026-08-19 获取 · 页面可访问",
          status: "交叉验证",
        },
      ],
    },
    团队规模: {
      value: "18 人",
      count: 1,
      sources: [
        {
          title: "候选人沟通记录",
          description: "“目前直接管理 18 人的机器人学习团队。”",
          meta: "2026-08-19 · 猎头人工记录",
          status: "用户确认",
        },
      ],
    },
    关键技能: {
      value: "VLA、强化学习、PyTorch",
      count: 1,
      sources: [
        {
          title: "林昊_机器人学习负责人_2026.pdf",
          description: "项目和工作经历中持续使用 VLA、强化学习与 PyTorch。",
          meta: "第 2-3 页 · 2026-08-18 上传",
          status: "直接证据",
        },
      ],
    },
    求职偏好: {
      value: "上海优先，可考虑北京",
      count: 1,
      sources: [
        {
          title: "候选人沟通记录",
          description: "优先考虑上海岗位，对北京的核心团队保持开放。",
          meta: "2026-08-20 · 猎头人工记录",
          status: "用户确认",
        },
      ],
    },
  };
  const activeEvidence = evidenceByField[activeField];
  return (
    <div className="s4-detail-page">
      <DetailHeader
        icon="link"
        title="来源与证据"
        subtitle="林昊 · 候选人资料"
        badges={[{ label: "3 个来源", tone: "info" }]}
        onBack={() => navigate(-1)}
      />
      <div className="s4-source-layout">
        <aside>
          <h2>资料字段</h2>
          {Object.entries(evidenceByField).map(([item, evidence]) => (
            <button
              type="button"
              className={item === activeField ? "is-active" : ""}
              key={item}
              onClick={() => setActiveField(item)}
            >
              <span>
                <b>{item}</b>
                <small>{evidence.count} 项证据</small>
              </span>
              <Icon name="chevronRight" />
            </button>
          ))}
        </aside>
        <section>
          <FieldGroup title={`${activeField}：${activeEvidence.value}`}>
            <SourceList items={activeEvidence.sources} />
          </FieldGroup>
          <FieldGroup title="证据状态">
            <DefinitionGrid
              columns={2}
              items={[
                ["最近核实", "2026-08-19"],
                ["可信状态", "已验证"],
                ["支持字段", "当前公司、当前职位"],
                ["执行任务", "候选人信息补全 · 2026-08-19"],
              ]}
            />
          </FieldGroup>
        </section>
      </div>
    </div>
  );
}
