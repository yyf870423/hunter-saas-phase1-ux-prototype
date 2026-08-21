import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { RelationshipCanvas } from "../stage3/RelationshipCanvas";
import { mappingRelationshipViews } from "../stage3/data";
import {
  AssetPageHeader,
  Button,
  CustomCheckbox,
  CustomRadio,
  DefinitionGrid,
  DeleteAssetModal,
  DetailHeader,
  DetailTabs,
  EntityLink,
  FieldGroup,
  FileDrop,
  FilterBar,
  FormField,
  Modal,
  NotFoundState,
  Pagination,
  SelectMenu,
  SourceList,
  StateBanner,
  StatusBadge,
  TagList,
  TextArea,
  TextInput,
  TooltipText,
  useListController,
  useToast,
} from "./asset-ui";
import { landscapes, papers, patents } from "./data";

export function MappingsListPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [openMenu, setOpenMenu] = useState(null);
  const controller = useListController(landscapes, ["name", "goal"], 6);
  return (
    <div className="s4-page">
      <AssetPageHeader
        title="人才版图"
        description="围绕一个摸排目标组织公司、组织、方向、人物和关系。"
        count={controller.filtered.length}
        primaryLabel="新建人才版图"
        onPrimary={() => navigate("/mappings/new")}
      />
      <FilterBar
        query={controller.query}
        setQuery={controller.setQuery}
        placeholder="搜索版图名称或摸排目标"
        filters={[]}
      />
      {controller.rows.length ? (
        <div className="s4-landscape-grid">
          {controller.rows.map((item) => (
            <article key={item.id}>
              <header>
                <i>
                  <Icon name="route" />
                </i>
                <span>
                  <small>人才版图</small>
                  <h2>{item.name}</h2>
                </span>
                <button
                  type="button"
                  aria-label="更多操作"
                  aria-expanded={openMenu === item.id}
                  onClick={() =>
                    setOpenMenu((current) =>
                      current === item.id ? null : item.id,
                    )
                  }
                >
                  <Icon name="more" />
                </button>
                {openMenu === item.id ? (
                  <div className="s4-landscape-menu" role="menu">
                    <button
                      type="button"
                      onClick={() => navigate(`/mappings/${item.id}`)}
                    >
                      <Icon name="edit" />
                      编辑版图
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        notify(`已将“${item.name}”移入回收站`);
                        setOpenMenu(null);
                      }}
                    >
                      <Icon name="trash" />
                      删除版图
                    </button>
                  </div>
                ) : null}
              </header>
              <TooltipText
                className="s4-landscape-goal"
                tip={item.goal}
                clampLines={3}
              >
                {item.goal}
              </TooltipText>
              <dl>
                <div>
                  <dt>公司</dt>
                  <dd>{item.companies}</dd>
                </div>
                <div>
                  <dt>组织</dt>
                  <dd>{item.organizations}</dd>
                </div>
                <div>
                  <dt>人物</dt>
                  <dd>{item.people}</dd>
                </div>
                <div>
                  <dt>关系</dt>
                  <dd>{item.relations}</dd>
                </div>
              </dl>
              <footer>
                <span>
                  <StatusBadge tone={item.gaps ? "warning" : "success"}>
                    {item.gaps ? `${item.gaps} 项缺口` : "目标已覆盖"}
                  </StatusBadge>
                  <small>{item.updatedAt}</small>
                </span>
                <Button
                  size="sm"
                  onClick={() => navigate(`/mappings/${item.id}`)}
                >
                  打开版图
                </Button>
              </footer>
            </article>
          ))}
        </div>
      ) : (
        <div className="s4-custom-empty">
          <Icon name="route" />
          <b>还没有人才版图</b>
          <p>说明一个摸排目标，或导入已有的人才地图文件。</p>
          <Button
            tone="primary"
            icon="plus"
            onClick={() => navigate("/mappings/new")}
          >
            新建人才版图
          </Button>
        </div>
      )}
      <Pagination
        page={controller.page}
        pages={controller.pages}
        onChange={controller.setPage}
      />
    </div>
  );
}

const mappingTabs = [
  { value: "overview", label: "摸排概况" },
  { value: "ecosystem", label: "公司与生态" },
  { value: "organization", label: "组织与方向" },
  { value: "people", label: "人物与关系" },
  { value: "updates", label: "更新与审核", count: 3 },
  { value: "business", label: "相关业务" },
];

function LandscapeOverview() {
  const notify = useToast();
  const targets = [
    {
      title: "确认星澜机器人 VLA 算法组负责人",
      category: "关键人物",
      priority: "高",
      status: "已完成",
      gap: "—",
      action: "已关联赵星羽",
    },
    {
      title: "补齐拓界机器人学习团队组织关系",
      category: "组织结构",
      priority: "高",
      status: "进行中",
      gap: "缺技术负责人",
      action: "继续公开资料探索",
    },
    {
      title: "核实王奕的当前单位与身份",
      category: "身份确认",
      priority: "中",
      status: "等待用户",
      gap: "两个公开来源冲突",
      action: "查看冲突证据",
    },
    {
      title: "建立 VLA 核心人才联系路径",
      category: "联系路径",
      priority: "中",
      status: "进行中",
      gap: "5 人缺可靠路径",
      action: "从共同作者和前同事继续探索",
    },
  ];
  return (
    <div className="s4-detail-stack">
      <div className="s4-mapping-progress">
        <article>
          <span>
            <small>摸排目标</small>
            <h2>具身智能 VLA 核心人才版图</h2>
            <p>
              摸清
              VLA、机器人学习与真机数据闭环团队及关键人才，为星澜机器人岗位找人提供依据。
            </p>
          </span>
          <strong>
            8<small>目标公司</small>
          </strong>
        </article>
        <dl>
          {[
            ["目标事项", "12 项"],
            ["已完成", "7 项"],
            ["进行中", "3 项"],
            ["等待用户", "2 项"],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <FieldGroup
        title="目标清单"
        description="进度只基于可理解、可行动、可预期的具体目标，不使用未知市场总人数计算覆盖率。"
        action={
          <Button
            size="sm"
            icon="plus"
            onClick={() => notify("已添加一个空目标事项")}
          >
            添加目标
          </Button>
        }
      >
        <div className="s4-target-list">
          {targets.map((item) => (
            <article key={item.title}>
              <button
                type="button"
                className={item.status === "已完成" ? "is-done" : ""}
                onClick={() =>
                  notify(
                    item.status === "已完成"
                      ? "目标已重新打开"
                      : "目标已标记完成",
                  )
                }
              >
                <Icon name={item.status === "已完成" ? "check" : "clock"} />
              </button>
              <span>
                <b>{item.title}</b>
                <small>
                  {item.category} · 优先级{item.priority}
                </small>
                <p>{item.gap}</p>
              </span>
              <StatusBadge
                tone={
                  item.status === "已完成"
                    ? "success"
                    : item.status === "等待用户"
                      ? "warning"
                      : "info"
                }
              >
                {item.status}
              </StatusBadge>
              <button type="button" onClick={() => notify(item.action)}>
                {item.action}
                <Icon name="chevronRight" />
              </button>
            </article>
          ))}
        </div>
      </FieldGroup>
      <FieldGroup title="范围与完成标准">
        <div className="s4-scope-summary">
          <article>
            <b>纳入范围</b>
            <p>
              中国具身智能创业公司与重点研究机构；VLA、机器人学习、操作策略和数据闭环方向；技术负责人和核心骨干。
            </p>
          </article>
          <article>
            <b>排除范围</b>
            <p>
              仅做人形硬件机械设计、纯视觉感知、没有机器人任务落地的多模态研究。
            </p>
          </article>
          <article>
            <b>完成标准</b>
            <p>
              完成 8
              家目标公司、核心团队结构、关键角色与人才、主要人物关系和可行联系路径的核验。
            </p>
          </article>
        </div>
      </FieldGroup>
    </div>
  );
}

function LandscapeGraphTab({ kind }) {
  const notify = useToast();
  const [decisions, setDecisions] = useState({
    wangyi: "pending",
    qiongding: "pending",
  });
  const viewIds =
    kind === "ecosystem"
      ? ["ecosystem"]
      : kind === "organization"
        ? ["organization", "direction-role", "talent-flow"]
        : ["people", "academic", "contact-path"];
  const views = mappingRelationshipViews.filter((view) =>
    viewIds.includes(view.id),
  );
  return (
    <div className="s4-landscape-canvas-shell">
      <header>
        <span>
          <small>
            {kind === "ecosystem"
              ? "公司、竞争、合作和人才来源"
              : kind === "organization"
                ? "组织、方向、角色和人才流动"
                : "人物关系、学术脉络和联系路径"}
          </small>
          <h2>
            {kind === "ecosystem"
              ? "公司与生态关系"
              : kind === "organization"
                ? "组织与方向"
                : "人物与关系"}
          </h2>
        </span>
        <div>
          <Button
            size="sm"
            icon="plus"
            onClick={() => notify("已打开关系对象选择")}
          >
            添加对象
          </Button>
          <Button
            size="sm"
            icon="edit"
            onClick={() => notify("选择节点或连线后即可编辑关系")}
          >
            编辑关系
          </Button>
        </div>
      </header>
      {views.length ? (
        <RelationshipCanvas
          views={views}
          decisions={decisions}
          onDecision={(key, value) =>
            setDecisions((current) => ({ ...current, [key]: value }))
          }
        />
      ) : (
        <div className="s4-graph-placeholder">
          <Icon name="route" />
          <b>关系视图将在当前范围内生成</b>
        </div>
      )}
    </div>
  );
}

function LandscapeUpdates() {
  const notify = useToast();
  const [selected, setSelected] = useState("batch-1");
  const [decision, setDecision] = useState("pending");
  const batches = [
    {
      id: "batch-1",
      title: "星澜 VLA 团队结构更新",
      meta: "今天 10:48",
      summary: "新增 2 个组织、3 位人物和 6 条关系",
      tone: "warning",
    },
    {
      id: "batch-2",
      title: "目标公司生态关系补充",
      meta: "昨天 17:20",
      summary: "新增 2 条竞争关系，1 条待确认",
      tone: "success",
    },
    {
      id: "batch-3",
      title: "王奕身份冲突",
      meta: "昨天 15:06",
      summary: "单位时间线与论文署名存在冲突",
      tone: "danger",
    },
  ];
  const current = batches.find((item) => item.id === selected);
  return (
    <div className="s4-context-review">
      <aside className="s4-update-batches">
        <header>
          <b>变更批次</b>
          <small>3 个待处理影响</small>
        </header>
        {batches.map((item) => (
          <button
            type="button"
            className={item.id === selected ? "is-active" : ""}
            key={item.id}
            onClick={() => setSelected(item.id)}
          >
            <span>
              <b>{item.title}</b>
              <p>{item.summary}</p>
              <small>{item.meta}</small>
            </span>
            <StatusBadge tone={item.tone}>
              {item.tone === "success"
                ? "可写入"
                : item.tone === "danger"
                  ? "冲突"
                  : "待确认"}
            </StatusBadge>
            <Icon name="chevronRight" />
          </button>
        ))}
      </aside>
      <section className="s4-update-impact">
        <header>
          <span>
            <small>本批次变化</small>
            <h2>{current.title}</h2>
            <p>{current.summary}。点击图中节点或关系可查看变化内容和证据。</p>
          </span>
        </header>
        <RelationshipCanvas
          views={mappingRelationshipViews.filter(
            (view) =>
              view.id ===
              (selected === "batch-2"
                ? "ecosystem"
                : selected === "batch-3"
                  ? "people"
                  : "organization"),
          )}
          decisions={{ wangyi: decision, qiongding: "pending" }}
          onDecision={(_, value) => setDecision(value)}
        />
        <footer>
          <span>
            <b>处理本批次</b>
            <small>冲突变化即使自动授权也必须等待用户</small>
          </span>
          <div>
            <Button onClick={() => notify("本批次已暂缓")}>暂缓</Button>
            <Button
              tone="primary"
              onClick={() => notify("已确认本批次变化并写入版图")}
            >
              确认变化
            </Button>
          </div>
        </footer>
      </section>
    </div>
  );
}

function LandscapeBusiness() {
  const navigate = useNavigate();
  return (
    <div className="s4-detail-stack">
      <FieldGroup title="关联岗位">
        <div className="s4-entity-grid">
          <EntityLink
            icon="briefcase"
            title="具身智能 VLA 算法负责人"
            meta="用于候选人范围扩展和关系路径"
            onClick={() => navigate("/positions/position-vla")}
          />
          <EntityLink
            icon="briefcase"
            title="机器人数据平台负责人"
            meta="用于数据闭环方向人才摸排"
            onClick={() => navigate("/positions/position-platform")}
          />
        </div>
      </FieldGroup>
      <FieldGroup title="业务主线">
        <EntityLink
          icon="route"
          title="具身智能 VLA 人才摸排"
          meta="运行中 · 3 项目标正在推进"
          onClick={() => navigate("/workstreams/mapping-embodied")}
        />
      </FieldGroup>
      <FieldGroup title="复用记录">
        <div className="s4-task-records">
          <article>
            <i>
              <Icon name="users" />
            </i>
            <span>
              <b>岗位找人复用</b>
              <small>今天 09:40 · 具身智能 VLA 算法负责人</small>
              <p>从 37 位人才中筛出 11 位候选范围，并结合其他渠道完成匹配。</p>
            </span>
            <StatusBadge tone="success">已使用</StatusBadge>
          </article>
        </div>
      </FieldGroup>
    </div>
  );
}

export function MappingDetailPage() {
  const { mappingId } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "overview";
  const item = landscapes.find((mapping) => mapping.id === mappingId);
  const [deleteOpen, setDeleteOpen] = useState(false);
  if (!item)
    return (
      <NotFoundState label="人才版图" onBack={() => navigate("/mappings")} />
    );
  return (
    <div className="s4-detail-page s4-mapping-detail">
      <DetailHeader
        icon="route"
        title={item.name}
        subtitle={item.goal}
        badges={[
          { label: `${item.gaps} 项缺口`, tone: "warning" },
          { label: `${item.people} 位人物`, tone: "info" },
        ]}
        onBack={() => navigate("/mappings")}
        onEdit={() => notify("已打开版图范围编辑")}
        onDelete={() => setDeleteOpen(true)}
      >
        <Button
          icon="sparkles"
          onClick={() => navigate("/workstreams/mapping-embodied")}
        >
          继续摸排
        </Button>
      </DetailHeader>
      <DetailTabs
        tabs={mappingTabs}
        value={tab}
        onChange={(value) => setParams({ tab: value })}
      />
      {tab === "overview" ? <LandscapeOverview /> : null}
      {tab === "ecosystem" ? <LandscapeGraphTab kind="ecosystem" /> : null}
      {tab === "organization" ? (
        <LandscapeGraphTab kind="organization" />
      ) : null}
      {tab === "people" ? <LandscapeGraphTab kind="people" /> : null}
      {tab === "updates" ? <LandscapeUpdates /> : null}
      {tab === "business" ? <LandscapeBusiness /> : null}
      <DeleteAssetModal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        assetLabel="人才版图"
        assetName={item.name}
        impact="版图中引用的公司、候选人、联系人、论文和专利不会删除；共享资产保留。"
        onConfirm={() => {
          setDeleteOpen(false);
          notify("人才版图已进入回收站");
          navigate("/mappings");
        }}
      />
    </div>
  );
}

export function MappingCreatePage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [mode, setMode] = useState("natural");
  const [goal, setGoal] = useState("");
  const [files, setFiles] = useState([]);
  return (
    <div className="s4-create-page">
      <AssetPageHeader
        eyebrow="人才版图"
        title="新建人才版图"
        description="说明摸排目标和已知范围，或导入现有人才地图文件。"
        actions={<Button onClick={() => navigate("/mappings")}>取消</Button>}
      />
      <div className="s4-create-layout">
        <aside className="s4-create-modes">
          {[
            ["natural", "message", "自然语言", "描述摸排目标"],
            ["file", "download", "导入文件", "Excel、FreeMind"],
            ["manual", "edit", "手工创建", "建立空版图"],
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
          {mode === "natural" ? (
            <div className="s4-agent-create-entry">
              <i>
                <Icon name="route" />
              </i>
              <h2>说明要摸排的市场或方向</h2>
              <p>
                可以补充文字、链接和文件。Hunter
                会先形成范围与目标清单，再开始探索。
              </p>
              <div className="s4-inline-agent-input">
                <TextArea
                  value={goal}
                  onChange={setGoal}
                  placeholder="例如：摸排国内具身智能 VLA 方向，重点关注有真机部署经验的算法负责人和核心骨干，优先北京、上海和深圳。"
                  rows={7}
                />
                <Button
                  tone="primary"
                  icon="send"
                  disabled={!goal.trim()}
                  onClick={() =>
                    navigate(`/new?prompt=${encodeURIComponent(goal)}`)
                  }
                >
                  开始
                </Button>
              </div>
            </div>
          ) : mode === "file" ? (
            <>
              <header>
                <h2>导入人才版图</h2>
                <p>文件先做格式校验和重名判断，不会创建新的地图容器。</p>
              </header>
              <FileDrop
                files={files}
                onFiles={setFiles}
                accept="XLSX、MM、FreeMind"
                multiple={false}
              />
              <footer>
                <Button
                  tone="primary"
                  disabled={!files.length}
                  onClick={() =>
                    notify("文件格式已通过校验，正在检查根节点重名", "info")
                  }
                >
                  解析文件
                </Button>
              </footer>
            </>
          ) : (
            <>
              <header>
                <h2>建立空版图</h2>
                <p>只创建范围和目标，后续可以手工或通过业务主线补充关系。</p>
              </header>
              <div className="s4-form-grid">
                <FormField label="版图名称" required span={2}>
                  <TextInput value={goal} onChange={setGoal} />
                </FormField>
                <FormField label="摸排目标" required span={2}>
                  <TextArea value="" onChange={() => {}} rows={6} />
                </FormField>
              </div>
              <footer>
                <Button
                  tone="primary"
                  onClick={() => {
                    notify("人才版图已创建");
                    navigate("/mappings/mapping-embodied");
                  }}
                >
                  创建版图
                </Button>
              </footer>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function AcademicCardList({ kind }) {
  const items = kind === "papers" ? papers : patents;
  const navigate = useNavigate();
  const notify = useToast();
  const controller = useListController(
    items,
    kind === "papers"
      ? ["title", "titleZh", "authors", "institutions", "tags"]
      : ["title", "applicant", "inventors", "tags"],
    4,
  );
  const [selected, setSelected] = useState(new Set());
  const [typeFilters, setTypeFilters] = useState([]);
  const [relationFilters, setRelationFilters] = useState([]);
  const label = kind === "papers" ? "论文" : "专利";
  const relationLabel = (relation) =>
    relation.includes("待确认")
      ? "存在待确认"
      : relation.includes("未")
        ? "没有人物关联"
        : "已关联候选人";
  const filteredItems = controller.filtered.filter((item) => {
    if (
      typeFilters.length &&
      !(kind === "papers"
        ? typeFilters.includes(String(item.year))
        : typeFilters.includes(item.type))
    )
      return false;
    if (
      relationFilters.length &&
      !relationFilters.includes(relationLabel(item.relation))
    )
      return false;
    return true;
  });
  const pages = Math.max(1, Math.ceil(filteredItems.length / 4));
  const rows = filteredItems.slice(
    (controller.page - 1) * 4,
    controller.page * 4,
  );
  useEffect(() => controller.setPage(1), [relationFilters, typeFilters]);
  return (
    <div className="s4-page">
      <AssetPageHeader
        title={label}
        description={
          kind === "papers"
            ? "管理论文原文、翻译、作者机构和人物身份关系。"
            : "管理专利信息、发明人、权利人和人物身份关系。"
        }
        count={filteredItems.length}
        primaryLabel="AI 搜索"
        primaryIcon="sparkles"
        onPrimary={() => navigate(`/new?prompt=搜索具身智能方向${label}`)}
      />
      <FilterBar
        query={controller.query}
        setQuery={controller.setQuery}
        placeholder={
          kind === "papers"
            ? "搜索标题、作者、机构或研究方向"
            : "搜索标题、发明人、权利人或研究方向"
        }
        filters={
          kind === "papers"
            ? [
                {
                  label: "年份",
                  value: typeFilters,
                  options: ["2026", "2025", "2024", "2023"],
                  multiple: true,
                  onChange: setTypeFilters,
                },
                {
                  label: "人物关联",
                  value: relationFilters,
                  options: ["已关联候选人", "存在待确认", "没有人物关联"],
                  multiple: true,
                  onChange: setRelationFilters,
                },
              ]
            : [
                {
                  label: "专利类型",
                  value: typeFilters,
                  options: ["发明专利", "实用新型"],
                  multiple: true,
                  onChange: setTypeFilters,
                },
                {
                  label: "人物关联",
                  value: relationFilters,
                  options: ["已关联候选人", "存在待确认", "没有人物关联"],
                  multiple: true,
                  onChange: setRelationFilters,
                },
              ]
        }
      />
      <div className="s4-academic-list">
        {rows.map((item) => (
          <article
            key={item.id}
            className={selected.has(item.id) ? "is-selected" : ""}
          >
            <CustomCheckbox
              checked={selected.has(item.id)}
              onChange={(checked) => {
                const next = new Set(selected);
                if (checked) next.add(item.id);
                else next.delete(item.id);
                setSelected(next);
              }}
            />
            <div className="s4-academic-main">
              <small>
                {kind === "papers"
                  ? `${item.year} · ${item.venue}`
                  : `${item.type} · ${item.applicationDate}`}
              </small>
              <button
                type="button"
                onClick={() => navigate(`/${kind}/${item.id}`)}
              >
                <h2>{item.title}</h2>
                {kind === "papers" ? (
                  <p className="s4-title-zh">{item.titleZh}</p>
                ) : null}
              </button>
              <p>
                {kind === "papers"
                  ? item.authors.join("、")
                  : item.inventors.join("、")}
              </p>
              <TooltipText
                className="s4-academic-summary"
                tip={item.summary}
                clampLines={3}
              >
                {item.summary}
              </TooltipText>
              <span>
                {kind === "papers"
                  ? item.institutions.join(" · ")
                  : item.applicant}
              </span>
              <TagList items={item.tags} tone="info" maxVisible={2} />
            </div>
            <aside>
              <StatusBadge
                tone={
                  item.relation.includes("待确认")
                    ? "warning"
                    : item.relation.includes("未")
                      ? "neutral"
                      : "success"
                }
              >
                {item.relation}
              </StatusBadge>
              {kind === "papers" ? (
                <strong>
                  {item.citations}
                  <small>被引</small>
                </strong>
              ) : (
                <span>
                  <small>公开号</small>
                  <b>{item.publicationNo}</b>
                </span>
              )}
              <button
                type="button"
                onClick={() => navigate(`/${kind}/${item.id}`)}
              >
                查看详情
                <Icon name="chevronRight" />
              </button>
            </aside>
          </article>
        ))}
      </div>
      {selected.size ? (
        <div className="s4-floating-bulk">
          <span>
            已选 {selected.size} 篇{label}
          </span>
          <Button size="sm" onClick={() => notify("已加入人才版图")}>
            加入人才版图
          </Button>
          <Button
            size="sm"
            tone="danger-outline"
            onClick={() => notify("已移至回收站")}
          >
            删除
          </Button>
          <button type="button" onClick={() => setSelected(new Set())}>
            取消
          </button>
        </div>
      ) : null}
      <Pagination
        page={controller.page}
        pages={pages}
        onChange={controller.setPage}
      />
    </div>
  );
}

export function PapersListPage() {
  return <AcademicCardList kind="papers" />;
}
export function PatentsListPage() {
  return <AcademicCardList kind="patents" />;
}

function PersonIdentityReview({ kind, people, close }) {
  const notify = useToast();
  const [decisions, setDecisions] = useState(() =>
    Object.fromEntries(
      people.map((person, index) => [
        person,
        index === 0 ? "candidate" : "none",
      ]),
    ),
  );
  return (
    <Modal
      open
      close={close}
      size="xl"
      title={`${kind === "paper" ? "作者" : "发明人"}人物身份审核`}
      description="同名只用于召回候选范围，不直接建立正式人物关系"
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button
            tone="primary"
            onClick={() => {
              close();
              notify("人物身份决定已保存");
            }}
          >
            保存身份关系
          </Button>
        </>
      }
    >
      <div className="s4-identity-review-list">
        {people.map((person, index) => (
          <article key={person}>
            <header>
              <span>
                <b>{person}</b>
                <small>
                  {index === 0
                    ? "稳定作者身份和工作轨迹一致"
                    : "仅姓名相似，仍需更多证据"}
                </small>
              </span>
              <StatusBadge tone={index === 0 ? "success" : "warning"}>
                {index === 0 ? "高可信" : "证据不足"}
              </StatusBadge>
            </header>
            <div>
              <CustomRadio
                label="关联已有候选人"
                description={
                  index === 0 ? "林昊 · 拓界机器人" : "当前没有可靠候选人"
                }
                checked={decisions[person] === "candidate"}
                onChange={() =>
                  setDecisions((current) => ({
                    ...current,
                    [person]: "candidate",
                  }))
                }
              />
              <CustomRadio
                label="保留为人物线索"
                description="继续探索，不进入候选人列表"
                checked={decisions[person] === "lead"}
                onChange={() =>
                  setDecisions((current) => ({ ...current, [person]: "lead" }))
                }
              />
              <CustomRadio
                label="暂不关联"
                description="只保留原始署名"
                checked={decisions[person] === "none"}
                onChange={() =>
                  setDecisions((current) => ({ ...current, [person]: "none" }))
                }
              />
            </div>
          </article>
        ))}
      </div>
    </Modal>
  );
}

export function PaperDetailPage() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const item = papers.find((paper) => paper.id === paperId);
  const [identityOpen, setIdentityOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  if (!item)
    return <NotFoundState label="论文" onBack={() => navigate("/papers")} />;
  return (
    <div className="s4-detail-page s4-academic-detail">
      <DetailHeader
        icon="paper"
        title={item.title}
        subtitle={`${item.year} · ${item.venue}`}
        badges={[
          { label: `${item.citations} 次被引`, tone: "info" },
          { label: item.relation, tone: "success" },
        ]}
        onBack={() => navigate("/papers")}
        onEdit={() => notify("已打开论文资料编辑")}
        onDelete={() => setDeleteOpen(true)}
      >
        <Button icon="users" onClick={() => setIdentityOpen(true)}>
          审核作者身份
        </Button>
      </DetailHeader>
      <section className="s4-paper-hero">
        <small>中文标题</small>
        <h2>{item.titleZh}</h2>
        <TagList items={item.tags} tone="info" />
      </section>
      <div className="s4-detail-stack">
        <FieldGroup title="论文摘要">
          <h3>原始摘要</h3>
          <p className="s4-long-copy">
            Vision-language-action models unify multimodal perception, language
            understanding, and robot control. This survey reviews model
            architectures, data pipelines, evaluation protocols, and real-world
            deployment challenges.
          </p>
          <h3>中文摘要</h3>
          <p className="s4-long-copy">
            视觉语言动作模型将多模态感知、语言理解和机器人控制统一起来。本文系统总结模型架构、数据流程、评测方法和真实机器人部署中的关键问题。
          </p>
        </FieldGroup>
        <FieldGroup
          title="作者与机构"
          action={
            <Button size="sm" onClick={() => setIdentityOpen(true)}>
              审核人物身份
            </Button>
          }
        >
          <div className="s4-authorship-list">
            {item.authors.map((author, index) => (
              <article key={author}>
                <em>{index + 1}</em>
                <span>
                  <b>{author}</b>
                  <small>
                    {item.institutions[index] || item.institutions[0]}
                  </small>
                </span>
                <StatusBadge tone={index < 2 ? "success" : "warning"}>
                  {index < 2 ? "已关联候选人" : "人物线索"}
                </StatusBadge>
                <button
                  type="button"
                  onClick={() =>
                    index < 2 && navigate("/candidates/candidate-linhao")
                  }
                >
                  查看
                  <Icon name="chevronRight" />
                </button>
              </article>
            ))}
          </div>
        </FieldGroup>
        <FieldGroup title="成果身份与来源">
          <div className="s4-identifier-list">
            <span>
              <b>DOI</b>
              <p>10.1109/TPAMI.2026.1234567</p>
            </span>
            <span>
              <b>OpenAlex Work ID</b>
              <p>W4401234567</p>
            </span>
            <span>
              <b>arXiv</b>
              <p>2603.01452</p>
            </span>
            <span>
              <b>数据来源</b>
              <p>{item.source}</p>
            </span>
          </div>
          <SourceList
            items={[
              {
                title: "OpenAlex",
                description: "论文元数据、作者机构和被引指标",
                meta: "2026-08-20 获取",
                status: "可访问",
              },
              {
                title: "arXiv 原文",
                description: "PDF 与摘要原文",
                meta: "2026-08-20 获取",
                status: "可访问",
              },
            ]}
          />
        </FieldGroup>
        <FieldGroup title="人才版图">
          <EntityLink
            icon="route"
            title="具身智能 VLA 核心人才版图"
            meta="学术脉络 · 2 位作者已关联"
            onClick={() => navigate("/mappings/mapping-embodied?tab=people")}
          />
        </FieldGroup>
      </div>
      {identityOpen ? (
        <PersonIdentityReview
          kind="paper"
          people={item.authors}
          close={() => setIdentityOpen(false)}
        />
      ) : null}
      <DeleteAssetModal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        assetLabel="论文"
        assetName={item.title}
        impact="候选人、人物线索和人才版图不会删除；人物关系显示论文已删除引用。"
        onConfirm={() => {
          setDeleteOpen(false);
          notify("论文已进入回收站");
          navigate("/papers");
        }}
      />
    </div>
  );
}

export function PatentDetailPage() {
  const { patentId } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const item = patents.find((patent) => patent.id === patentId);
  const [identityOpen, setIdentityOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  if (!item)
    return <NotFoundState label="专利" onBack={() => navigate("/patents")} />;
  return (
    <div className="s4-detail-page s4-academic-detail">
      <DetailHeader
        icon="patent"
        title={item.title}
        subtitle={`${item.type} · ${item.applicant}`}
        badges={[
          {
            label: item.grantDate === "—" ? "申请中" : "已授权",
            tone: item.grantDate === "—" ? "warning" : "success",
          },
          { label: item.relation, tone: "info" },
        ]}
        onBack={() => navigate("/patents")}
        onEdit={() => notify("已打开专利资料编辑")}
        onDelete={() => setDeleteOpen(true)}
      >
        <Button icon="users" onClick={() => setIdentityOpen(true)}>
          审核发明人身份
        </Button>
      </DetailHeader>
      <div className="s4-detail-stack">
        <FieldGroup title="专利摘要">
          <p className="s4-long-copy">
            本发明公开一种面向多任务机器人的操作策略训练方法，通过统一视觉、语言和动作表示，并结合真实机器人失败样本回流，提升不同操作任务之间的迁移效率和真实场景成功率。
          </p>
          <TagList items={item.tags} tone="info" />
        </FieldGroup>
        <FieldGroup title="申请与权利信息">
          <DefinitionGrid
            items={[
              ["申请人 / 权利人", item.applicant],
              ["申请号", item.applicationNo],
              ["公开号", item.publicationNo],
              ["申请日", item.applicationDate],
              ["授权日", item.grantDate],
              [
                "法律状态",
                item.grantDate === "—" ? "公开，等待实质审查" : "授权有效",
              ],
            ]}
          />
        </FieldGroup>
        <FieldGroup
          title="发明人"
          action={
            <Button size="sm" onClick={() => setIdentityOpen(true)}>
              审核人物身份
            </Button>
          }
        >
          <div className="s4-authorship-list">
            {item.inventors.map((person, index) => (
              <article key={person}>
                <em>{index + 1}</em>
                <span>
                  <b>{person}</b>
                  <small>原始发明人署名</small>
                </span>
                <StatusBadge tone={index === 0 ? "success" : "warning"}>
                  {index === 0 ? "已关联候选人" : "待确认"}
                </StatusBadge>
                <button
                  type="button"
                  onClick={() =>
                    index === 0
                      ? navigate("/candidates/candidate-linhao")
                      : setIdentityOpen(true)
                  }
                >
                  查看
                  <Icon name="chevronRight" />
                </button>
              </article>
            ))}
          </div>
        </FieldGroup>
        <FieldGroup title="来源与文件">
          <SourceList
            items={[
              {
                title: "国家知识产权局公开数据",
                description: `${item.publicationNo} · 著录项目和摘要`,
                meta: "2026-08-20 获取",
                status: "已验证",
              },
              {
                title: "专利原文 PDF",
                description: `${item.publicationNo}.pdf`,
                meta: "1.8 MB · 12 页",
                status: "可预览",
              },
            ]}
          />
        </FieldGroup>
        <FieldGroup title="人才版图">
          <EntityLink
            icon="route"
            title="具身智能 VLA 核心人才版图"
            meta="共同发明人关系 · 1 位已关联"
            onClick={() => navigate("/mappings/mapping-embodied?tab=people")}
          />
        </FieldGroup>
      </div>
      {identityOpen ? (
        <PersonIdentityReview
          kind="patent"
          people={item.inventors}
          close={() => setIdentityOpen(false)}
        />
      ) : null}
      <DeleteAssetModal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        assetLabel="专利"
        assetName={item.title}
        impact="候选人、人物线索和人才版图不会删除；共同发明人关系保留已删除引用。"
        onConfirm={() => {
          setDeleteOpen(false);
          notify("专利已进入回收站");
          navigate("/patents");
        }}
      />
    </div>
  );
}
