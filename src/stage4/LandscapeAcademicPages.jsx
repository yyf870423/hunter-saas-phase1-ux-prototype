import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Composer } from "../stage2/automation-ui";
import { RelationshipCanvas } from "../stage3/RelationshipCanvas";
import { mappingRelationshipViews } from "../stage3/data";
import {
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
  FilterBar,
  FloatingPanel,
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
import { candidates, landscapes, papers, patents } from "./data";

export function MappingsListPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [openMenu, setOpenMenu] = useState(null);
  const controller = useListController(landscapes, ["name", "goal"], 6);
  return (
    <div className="s4-page">
      <AssetPageHeader
        title="知识图谱"
        description="围绕一个摸排目标组织公司、组织、方向、人物和关系。"
        count={controller.filtered.length}
        primaryLabel="新建知识图谱"
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
                  <small>知识图谱</small>
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
          <b>还没有知识图谱</b>
          <p>说明一个摸排目标，或导入已有的人才地图文件。</p>
          <Button
            tone="primary"
            icon="plus"
            onClick={() => navigate("/mappings/new")}
          >
            新建知识图谱
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

const initialMappingTargets = [
  {
    id: "target-vla-lead",
    title: "确认星澜机器人 VLA 算法组负责人",
    category: "关键人物",
    priority: "高",
    status: "已完成",
    gap: "—",
    action: "已关联赵星羽",
    completion: "确认负责人身份，并关联到正式候选人或稳定人物线索。",
    evidence: "候选人档案、公司团队页面和公开履历相互印证。",
  },
  {
    id: "target-tuojie-org",
    title: "补齐拓界机器人学习团队组织关系",
    category: "组织结构",
    priority: "高",
    status: "进行中",
    gap: "缺技术负责人",
    action: "继续公开资料探索",
    completion: "明确一级组织、方向团队、负责人和至少 3 位核心成员。",
    evidence: "已确认智能操作部和策略学习团队，负责人身份仍缺稳定来源。",
  },
  {
    id: "target-wangyi-identity",
    title: "核实王奕的当前单位与身份",
    category: "身份确认",
    priority: "中",
    status: "等待用户",
    gap: "两个公开来源冲突",
    action: "查看冲突证据",
    completion: "确认论文作者和活动名单中的王奕是否为同一人。",
    evidence: "论文单位时间线与公司公开活动名单存在冲突，需要人工判断。",
  },
  {
    id: "target-contact-path",
    title: "建立 VLA 核心人才联系路径",
    category: "联系路径",
    priority: "中",
    status: "进行中",
    gap: "5 人缺可靠路径",
    action: "从共同作者和前同事继续探索",
    completion: "为核心人才建立至少一条可解释、可执行的联系路径。",
    evidence: "已关联共同作者、前同事和 2 位现有联系人。",
  },
];

function MappingTargetEditor({ open, target, close, onSave }) {
  const [title, setTitle] = useState(target?.title || "");
  const [category, setCategory] = useState(target?.category || "关键人物");
  const [priority, setPriority] = useState(target?.priority || "中");
  const [completion, setCompletion] = useState(target?.completion || "");
  const [gap, setGap] = useState(target?.gap === "—" ? "" : target?.gap || "");
  useEffect(() => {
    setTitle(target?.title || "");
    setCategory(target?.category || "关键人物");
    setPriority(target?.priority || "中");
    setCompletion(target?.completion || "");
    setGap(target?.gap === "—" ? "" : target?.gap || "");
  }, [open, target]);
  return (
    <Modal
      open={open}
      close={close}
      size="lg"
      title={target ? "编辑摸排目标" : "增加摸排目标"}
      description="目标必须说明要补齐什么，以及达到什么条件才算完成。"
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button
            tone="primary"
            disabled={!title.trim() || !completion.trim()}
            onClick={() =>
              onSave({
                ...(target || {}),
                id: target?.id || `target-${Date.now()}`,
                title: title.trim(),
                category,
                priority,
                status: target?.status || "进行中",
                gap: gap.trim() || "暂无明确缺口",
                action: target?.action || "继续收集并核验证据",
                completion: completion.trim(),
                evidence: target?.evidence || "由本轮摸排任务持续补充。",
              })
            }
          >
            {target ? "保存修改" : "添加目标"}
          </Button>
        </>
      }
    >
      <div className="s4-form-grid">
        <FormField label="目标事项" required span={2}>
          <TextInput
            value={title}
            onChange={setTitle}
            placeholder="例如：确认拓界机器人操作策略方向技术负责人"
          />
        </FormField>
        <FormField label="目标类别" required>
          <SelectMenu
            label="选择目标类别"
            value={category}
            options={["关键人物", "组织结构", "身份确认", "联系路径"]}
            onChange={setCategory}
          />
        </FormField>
        <FormField label="优先级" required>
          <SelectMenu
            label="选择优先级"
            value={priority}
            options={["高", "中", "低"]}
            onChange={setPriority}
          />
        </FormField>
        <FormField label="完成标准" required span={2}>
          <TextArea
            value={completion}
            onChange={setCompletion}
            placeholder="说明获得哪些信息或关系后，这个目标可以结束"
            rows={4}
          />
        </FormField>
        <FormField label="当前已知缺口" span={2}>
          <TextArea
            value={gap}
            onChange={setGap}
            placeholder="例如：已知团队名称，但缺少负责人稳定身份"
            rows={3}
          />
        </FormField>
      </div>
    </Modal>
  );
}

function MappingTargetDetail({ target, close, onEdit, onToggleStatus }) {
  if (!target) return null;
  return (
    <Modal
      open
      close={close}
      size="lg"
      title="摸排目标详情"
      description={target.title}
      footer={
        <>
          <Button onClick={close}>关闭</Button>
          <Button icon="edit" onClick={() => onEdit(target)}>
            编辑目标
          </Button>
          <Button tone="primary" onClick={() => onToggleStatus(target)}>
            {target.status === "已完成" ? "重新打开" : "标记完成"}
          </Button>
        </>
      }
    >
      <div className="s4-target-detail">
        <DefinitionGrid
          columns={3}
          items={[
            ["目标类别", target.category],
            ["优先级", target.priority],
            ["当前状态", target.status],
          ]}
        />
        <section>
          <small>完成标准</small>
          <p>{target.completion}</p>
        </section>
        <section>
          <small>当前缺口</small>
          <p>{target.gap}</p>
        </section>
        <section>
          <small>当前证据与判断</small>
          <p>{target.evidence}</p>
        </section>
        <section>
          <small>下一步</small>
          <p>{target.action}</p>
        </section>
      </div>
    </Modal>
  );
}

function LandscapeOverview({ profile }) {
  const notify = useToast();
  const [targets, setTargets] = useState(initialMappingTargets);
  const [targetEditor, setTargetEditor] = useState(null);
  const [targetDetail, setTargetDetail] = useState(null);
  const saveTarget = (target) => {
    setTargets((current) => {
      const exists = current.some((item) => item.id === target.id);
      return exists
        ? current.map((item) => (item.id === target.id ? target : item))
        : [...current, target];
    });
    setTargetEditor(null);
    setTargetDetail(target);
    notify(targetEditor?.id ? "摸排目标已更新" : "摸排目标已添加");
  };
  const toggleTargetStatus = (target) => {
    const status = target.status === "已完成" ? "进行中" : "已完成";
    const updated = { ...target, status };
    setTargets((current) =>
      current.map((item) => (item.id === target.id ? updated : item)),
    );
    setTargetDetail(updated);
    notify(status === "已完成" ? "目标已标记完成" : "目标已重新打开");
  };
  return (
    <div className="s4-detail-stack">
      <div className="s4-mapping-progress">
        <article>
          <span>
            <small>摸排目标</small>
            <h2>{profile.name}</h2>
            <p>{profile.goal}</p>
          </span>
          <strong>
            8<small>目标公司</small>
          </strong>
        </article>
        <dl>
          {[
            ["目标事项", `${targets.length + 8} 项`],
            [
              "已完成",
              `${targets.filter((item) => item.status === "已完成").length + 6} 项`,
            ],
            [
              "进行中",
              `${targets.filter((item) => item.status === "进行中").length + 1} 项`,
            ],
            [
              "等待用户",
              `${targets.filter((item) => item.status === "等待用户").length + 1} 项`,
            ],
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
            onClick={() => setTargetEditor({ mode: "create" })}
          >
            添加目标
          </Button>
        }
      >
        <div className="s4-target-list">
          {targets.map((item) => (
            <article
              className="is-clickable"
              key={item.id}
              role="button"
              tabIndex="0"
              aria-label={`查看目标：${item.title}`}
              onClick={() => setTargetDetail(item)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setTargetDetail(item);
                }
              }}
            >
              <button
                type="button"
                className={item.status === "已完成" ? "is-done" : ""}
                aria-label={
                  item.status === "已完成" ? "重新打开目标" : "标记目标完成"
                }
                onClick={(event) => {
                  event.stopPropagation();
                  toggleTargetStatus(item);
                }}
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
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setTargetDetail(item);
                }}
              >
                查看详情
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
            <p>{profile.includedScope}</p>
          </article>
          <article>
            <b>排除范围</b>
            <p>{profile.excludedScope}</p>
          </article>
          <article>
            <b>完成标准</b>
            <p>{profile.completion}</p>
          </article>
        </div>
      </FieldGroup>
      <MappingTargetEditor
        open={Boolean(targetEditor)}
        target={targetEditor?.mode === "create" ? null : targetEditor}
        close={() => setTargetEditor(null)}
        onSave={saveTarget}
      />
      <MappingTargetDetail
        target={targetDetail}
        close={() => setTargetDetail(null)}
        onEdit={(target) => {
          setTargetDetail(null);
          setTargetEditor(target);
        }}
        onToggleStatus={toggleTargetStatus}
      />
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
  const notify = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [positionLinks, setPositionLinks] = useState([
    "具身智能 VLA 算法负责人",
    "机器人数据平台负责人",
  ]);
  const [workstreamLinks, setWorkstreamLinks] = useState([
    "具身智能 VLA 人才摸排",
  ]);
  return (
    <div className="s4-detail-stack">
      <FieldGroup
        title="关联岗位"
        action={
          <Button size="sm" icon="edit" onClick={() => setEditOpen(true)}>
            编辑关联
          </Button>
        }
      >
        <div className="s4-entity-grid">
          {positionLinks.map((position) => (
            <EntityLink
              icon="briefcase"
              title={position}
              meta={
                position === "具身智能 VLA 算法负责人"
                  ? "用于候选人范围扩展和关系路径"
                  : "用于数据闭环方向人才摸排"
              }
              key={position}
              onClick={() =>
                navigate(
                  position === "具身智能 VLA 算法负责人"
                    ? "/positions/position-vla"
                    : "/positions/position-platform",
                )
              }
            />
          ))}
        </div>
      </FieldGroup>
      <FieldGroup title="关联任务">
        {workstreamLinks.map((workstream) => (
          <EntityLink
            icon="route"
            title={workstream}
            meta="运行中 · 3 项目标正在推进"
            key={workstream}
            onClick={() => navigate("/tasks/mapping-embodied")}
          />
        ))}
      </FieldGroup>
      <FieldGroup title="复用记录">
        <div className="s4-task-records s4-mapping-reuse-records">
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
      <Modal
        open={editOpen}
        close={() => setEditOpen(false)}
        size="lg"
        title="编辑相关业务"
        description="这里只维护知识图谱与现有业务资产的关联，不复制岗位或任务。"
        footer={
          <>
            <Button onClick={() => setEditOpen(false)}>取消</Button>
            <Button
              tone="primary"
              onClick={() => {
                setEditOpen(false);
                notify("相关业务关联已更新");
              }}
            >
              保存关联
            </Button>
          </>
        }
      >
        <div className="s4-form-grid">
          <FormField label="关联岗位" span={2}>
            <SelectMenu
              label="选择关联岗位"
              value={positionLinks}
              options={[
                "具身智能 VLA 算法负责人",
                "机器人数据平台负责人",
                "运动控制算法专家",
              ]}
              onChange={setPositionLinks}
              multiple
              searchable
            />
          </FormField>
          <FormField label="关联任务" span={2}>
            <SelectMenu
              label="选择任务"
              value={workstreamLinks}
              options={[
                "具身智能 VLA 人才摸排",
                "星澜机器人客户开发",
                "具身智能 VLA 算法负责人招聘",
              ]}
              onChange={setWorkstreamLinks}
              multiple
              searchable
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}

function MappingEditModal({ open, profile, close, onSave }) {
  const [name, setName] = useState(profile.name);
  const [goal, setGoal] = useState(profile.goal);
  const [includedScope, setIncludedScope] = useState(profile.includedScope);
  const [excludedScope, setExcludedScope] = useState(profile.excludedScope);
  const [completion, setCompletion] = useState(profile.completion);
  useEffect(() => {
    setName(profile.name);
    setGoal(profile.goal);
    setIncludedScope(profile.includedScope);
    setExcludedScope(profile.excludedScope);
    setCompletion(profile.completion);
  }, [open, profile]);
  return (
    <Modal
      open={open}
      close={close}
      size="lg"
      title="编辑知识图谱"
      description="调整版图名称、摸排范围和完成标准；已有关系和审核记录不会被删除。"
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button
            tone="primary"
            disabled={!name.trim() || !goal.trim() || !completion.trim()}
            onClick={() =>
              onSave({
                name: name.trim(),
                goal: goal.trim(),
                includedScope: includedScope.trim(),
                excludedScope: excludedScope.trim(),
                completion: completion.trim(),
              })
            }
          >
            保存修改
          </Button>
        </>
      }
    >
      <div className="s4-form-grid">
        <FormField label="版图名称" required span={2}>
          <TextInput value={name} onChange={setName} />
        </FormField>
        <FormField label="摸排目标" required span={2}>
          <TextArea value={goal} onChange={setGoal} rows={4} />
        </FormField>
        <FormField label="纳入范围" required span={2}>
          <TextArea
            value={includedScope}
            onChange={setIncludedScope}
            rows={3}
          />
        </FormField>
        <FormField label="排除范围" span={2}>
          <TextArea
            value={excludedScope}
            onChange={setExcludedScope}
            rows={3}
          />
        </FormField>
        <FormField label="完成标准" required span={2}>
          <TextArea value={completion} onChange={setCompletion} rows={4} />
        </FormField>
      </div>
    </Modal>
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
  const [editOpen, setEditOpen] = useState(false);
  const [profile, setProfile] = useState(() => ({
    name: item?.name || "",
    goal: item?.goal || "",
    includedScope:
      "中国具身智能创业公司与重点研究机构；VLA、机器人学习、操作策略和数据闭环方向；技术负责人和核心骨干。",
    excludedScope:
      "仅做人形硬件机械设计、纯视觉感知、没有机器人任务落地的多模态研究。",
    completion:
      "完成 8 家目标公司、核心团队结构、关键角色与人才、主要人物关系和可行联系路径的核验。",
  }));
  if (!item)
    return (
      <NotFoundState label="知识图谱" onBack={() => navigate("/mappings")} />
    );
  return (
    <div className="s4-detail-page s4-mapping-detail">
      <DetailHeader
        icon="route"
        title={profile.name}
        subtitle={profile.goal}
        badges={[
          { label: `${item.gaps} 项缺口`, tone: "warning" },
          { label: `${item.people} 位人物`, tone: "info" },
        ]}
        onBack={() => navigate("/mappings")}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      >
        <Button
          icon="sparkles"
          onClick={() => navigate("/tasks/mapping-embodied")}
        >
          继续摸排
        </Button>
      </DetailHeader>
      <DetailTabs
        tabs={mappingTabs}
        value={tab}
        onChange={(value) => setParams({ tab: value })}
      />
      {tab === "overview" ? <LandscapeOverview profile={profile} /> : null}
      {tab === "ecosystem" ? <LandscapeGraphTab kind="ecosystem" /> : null}
      {tab === "organization" ? (
        <LandscapeGraphTab kind="organization" />
      ) : null}
      {tab === "people" ? <LandscapeGraphTab kind="people" /> : null}
      {tab === "updates" ? <LandscapeUpdates /> : null}
      {tab === "business" ? <LandscapeBusiness /> : null}
      <MappingEditModal
        open={editOpen}
        profile={profile}
        close={() => setEditOpen(false)}
        onSave={(next) => {
          setProfile(next);
          setEditOpen(false);
          notify("知识图谱资料已更新");
        }}
      />
      <DeleteAssetModal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        assetLabel="知识图谱"
        assetName={item.name}
        impact="版图中引用的公司、候选人、联系人、论文和专利不会删除；共享资产保留。"
        onConfirm={() => {
          setDeleteOpen(false);
          notify("知识图谱已进入回收站");
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
  const [authMode, setAuthMode] = useState("confirm");
  const [attachments, setAttachments] = useState([]);
  return (
    <div className="s4-create-page">
      <AssetPageHeader
        eyebrow="知识图谱"
        title="新建知识图谱"
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
              <div className="s4-agent-composer-shell">
                <Composer
                  value={goal}
                  onChange={setGoal}
                  onSend={(text, attachedFiles) => {
                    const fileNames = attachedFiles
                      .map((file) => file.name)
                      .join("、");
                    const prompt = text || `根据附件 ${fileNames} 新建知识图谱`;
                    navigate(`/new?prompt=${encodeURIComponent(prompt)}`);
                  }}
                  authMode={authMode}
                  onAuthChange={setAuthMode}
                  attachments={attachments}
                  onAttachmentsChange={setAttachments}
                  placeholder="例如：摸排国内具身智能 VLA 方向，重点关注有真机部署经验的算法负责人和核心骨干，优先北京、上海和深圳。"
                />
              </div>
              <small className="s4-agent-create-hint">
                可直接粘贴链接，或添加文件与截图；Hunter
                会先形成可调整的摸排计划和目标清单。
              </small>
            </div>
          ) : mode === "file" ? (
            <>
              <header>
                <h2>导入知识图谱</h2>
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
                <p>只创建范围和目标，后续可以手工或通过任务补充关系。</p>
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
                    notify("知识图谱已创建");
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
                  key: "paper-years",
                  label: "年份",
                  render: (
                    <DatePicker
                      label="年份"
                      mode="years"
                      value={typeFilters}
                      yearOptions={["2026", "2025", "2024", "2023"]}
                      onChange={setTypeFilters}
                    />
                  ),
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
                  ? `${item.authors.slice(0, 4).join("、")}${
                      item.authors.length > 4
                        ? ` 等 ${item.authors.length} 位作者`
                        : ""
                    }`
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
          <Button size="sm" onClick={() => notify("已加入知识图谱")}>
            加入知识图谱
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

const candidateIdentityMatches = {
  "Hao Lin": "candidate-linhao",
  "Mingyuan Zhou": "candidate-zhoumingyuan",
  "Yifan Jiang": "candidate-jiangyifan",
  "Wenting He": "candidate-hewenting",
  "Xingyu Zhao": "candidate-zhaoxingyu",
  "Chuning Chen": "candidate-chenchuning",
  赵星羽: "candidate-zhaoxingyu",
  王奕: "candidate-wangyi",
};

const identityComparisonProfiles = {
  "Yifan Jiang": {
    contactStatus: ["信息不足", "warning"],
    workStatus: ["时间存在冲突", "warning"],
    educationStatus: ["高度一致", "success"],
    projectStatus: ["方向一致", "success"],
    source: {
      contacts: [
        { title: "手机", value: "未从公开成果中获取" },
        { title: "邮箱", value: "yi***@pjlab.org.cn", meta: "论文通讯信息" },
      ],
      work: [
        {
          title: "上海人工智能实验室",
          meta: "2023.07 至今",
          detail: "论文署名单位；具身智能与机器人学习方向。",
          relation: "可对应",
          relationTone: "success",
        },
        {
          title: "上海交通大学机器人研究所",
          meta: "2020.09 - 2023.06",
          detail: "从共同作者与公开项目页面获得，具体职位待核实。",
          relation: "待核实",
          relationTone: "warning",
        },
      ],
      education: [
        {
          title: "上海交通大学 · 计算机科学与技术",
          meta: "2016.09 - 2021.06 · 博士",
          detail: "研究方向为机器人学习与多模态控制。",
        },
      ],
      projects: [
        {
          title: "VLA 机器人综述与评测",
          meta: "2025.03 - 2026.03",
          detail: "负责真实机器人部署、数据闭环和评测协议相关研究。",
        },
        {
          title: "多任务机器人操作数据集",
          meta: "2024.01 - 2025.02",
          detail: "参与数据采集规范和跨任务泛化实验。",
        },
      ],
    },
    candidate: {
      contacts: [
        { title: "手机", value: "186 **** 3271", meta: "候选人资料" },
        {
          title: "邮箱",
          value: "yif***@baai.ac.cn",
          meta: "最近核实于 2026.07",
        },
      ],
      work: [
        {
          title: "智源研究院 · 多模态算法研究员",
          meta: "2024.08 至今",
          detail: "负责多模态基础模型和具身智能预训练。",
          relation: "来源未发现",
          relationTone: "warning",
        },
        {
          title: "上海人工智能实验室 · 研究科学家",
          meta: "2021.07 - 2024.07",
          detail: "从事机器人学习、VLA 模型和真机部署。",
          relation: "时间冲突",
          relationTone: "warning",
        },
        {
          title: "上海交通大学机器人研究所 · 研究助理",
          meta: "2019.09 - 2021.06",
          detail: "参与机器人学习和视觉控制研究。",
          relation: "候选人补充",
          relationTone: "info",
        },
      ],
      education: [
        {
          title: "上海交通大学 · 计算机科学与技术",
          meta: "2016.09 - 2021.06 · 博士",
          detail: "导师与公开论文作者网络能够对应。",
          relation: "一致",
          relationTone: "success",
        },
        {
          title: "华中科技大学 · 自动化",
          meta: "2012.09 - 2016.06 · 本科",
          detail: "候选人简历中记录的本科教育经历。",
          relation: "来源未披露",
          relationTone: "neutral",
        },
      ],
      projects: [
        {
          title: "具身 VLA 预训练项目",
          meta: "2024.08 至今",
          detail: "负责多模态对齐、数据闭环与机器人策略评测。",
        },
        {
          title: "真实机器人多任务泛化",
          meta: "2022.02 - 2024.06",
          detail: "完成真机部署和失败样本回流方案。",
        },
        {
          title: "多模态具身数据清洗工具链",
          meta: "2021.08 - 2022.01",
          detail: "负责数据质量评估、轨迹筛选和训练样本版本管理。",
          relation: "候选人补充",
          relationTone: "info",
        },
      ],
    },
  },
  王奕: {
    contactStatus: ["仅候选人有记录", "warning"],
    workStatus: ["当前机构一致", "success"],
    educationStatus: ["来源未披露", "neutral"],
    projectStatus: ["成果方向一致", "success"],
    source: {
      contacts: [
        { title: "手机", value: "专利公开信息未披露" },
        { title: "邮箱", value: "专利公开信息未披露" },
      ],
      work: [
        {
          title: "星澜机器人（北京）有限公司",
          meta: "专利申请时在职",
          detail: "公开专利未披露具体部门与职位。",
        },
      ],
      education: [],
      projects: [
        {
          title: "多任务机器人操作策略训练方法",
          meta: "发明人 · 申请于 2025.11",
          detail: "涉及多模态策略学习、失败样本回流和真实机器人操作。",
        },
      ],
    },
    candidate: {
      contacts: [
        { title: "手机", value: "139 **** 5816", meta: "候选人资料" },
        {
          title: "邮箱",
          value: "wang***@xinglan.ai",
          meta: "最近核实于 2026.06",
        },
      ],
      work: [
        {
          title: "星澜机器人 · 机器人学习研究员",
          meta: "2023.04 至今",
          detail: "负责机器人操作策略、模仿学习和真机评测。",
        },
        {
          title: "腾讯 Robotics X · 算法工程师",
          meta: "2021.07 - 2023.03",
          detail: "参与运动控制和强化学习项目。",
        },
      ],
      education: [
        {
          title: "浙江大学 · 控制科学与工程",
          meta: "2018.09 - 2021.06 · 硕士",
          detail: "研究方向为机器人控制与强化学习。",
        },
      ],
      projects: [
        {
          title: "机器人多任务操作平台",
          meta: "2023.08 至今",
          detail: "负责策略训练、失败样本回流和真实场景成功率优化。",
        },
      ],
    },
  },
};

function IdentityRecordList({ items, emptyLabel }) {
  if (!items.length)
    return (
      <div className="s4-person-record-empty">
        <Icon name="alert" />
        <span>{emptyLabel}</span>
      </div>
    );
  return (
    <div className="s4-person-record-list">
      {items.map((item) => (
        <article key={`${item.title}-${item.meta || item.value}`}>
          <header>
            <b>{item.title}</b>
            {item.relation ? (
              <StatusBadge tone={item.relationTone || "neutral"}>
                {item.relation}
              </StatusBadge>
            ) : null}
          </header>
          {item.value ? <p>{item.value}</p> : null}
          {item.meta ? <small>{item.meta}</small> : null}
          {item.detail ? <p>{item.detail}</p> : null}
        </article>
      ))}
    </div>
  );
}

function IdentityCompareGroup({
  title,
  status,
  source,
  candidate,
  emptyLabel,
}) {
  return (
    <section className="s4-person-compare-group">
      <header>
        <h3>{title}</h3>
        <StatusBadge tone={status[1]}>{status[0]}</StatusBadge>
      </header>
      <div>
        <section>
          <header className="s4-person-compare-side-title">
            <small>来源人物资料</small>
            <span>{source.length} 条</span>
          </header>
          <IdentityRecordList items={source} emptyLabel={emptyLabel} />
        </section>
        <section>
          <header className="s4-person-compare-side-title">
            <small>疑似候选人资料</small>
            <span>{candidate.length} 条</span>
          </header>
          <IdentityRecordList
            items={candidate}
            emptyLabel="候选人资料中没有对应记录"
          />
        </section>
      </div>
    </section>
  );
}

function PersonIdentityReview({
  kind,
  person,
  institution,
  sourceTitle,
  sourceMeta,
  close,
  onOpenCandidate,
  onSave,
}) {
  const notify = useToast();
  const suggestedId = candidateIdentityMatches[person] || "";
  const suggestedCandidate = candidates.find(
    (candidate) => candidate.id === suggestedId,
  );
  const noun = kind === "paper" ? "作者" : "发明人";
  const comparison = identityComparisonProfiles[person] || {
    contactStatus: ["信息不足", "warning"],
    workStatus: ["需要核实", "warning"],
    educationStatus: ["来源未披露", "neutral"],
    projectStatus: ["方向疑似相关", "warning"],
    source: {
      contacts: [
        { title: "手机", value: "未从公开成果中获取" },
        { title: "邮箱", value: "未从公开成果中获取" },
      ],
      work: [
        {
          title: institution,
          meta: sourceMeta,
          detail: "来自当前成果的署名机构，具体职位和任职时间待核实。",
        },
      ],
      education: [],
      projects: [
        {
          title: sourceTitle,
          meta: sourceMeta,
          detail: `以${noun}身份出现在当前成果中。`,
        },
      ],
    },
    candidate: {
      contacts: suggestedCandidate
        ? [
            { title: "手机", value: "已录入，进入候选人详情查看" },
            { title: "邮箱", value: "已录入，进入候选人详情查看" },
          ]
        : [],
      work: suggestedCandidate
        ? [
            {
              title: `${suggestedCandidate.company} · ${suggestedCandidate.title}`,
              meta: `${suggestedCandidate.experience}工作经验`,
              detail: `当前地点为${suggestedCandidate.location}。`,
            },
          ]
        : [],
      education: suggestedCandidate
        ? [
            {
              title: suggestedCandidate.education,
              meta: "院校与专业信息待进入候选人详情查看",
            },
          ]
        : [],
      projects: suggestedCandidate
        ? [
            {
              title: suggestedCandidate.skills.join("、"),
              meta: "候选人技能和项目方向摘要",
            },
          ]
        : [],
    },
  };
  const saveDecision = (decision) => {
    onSave({
      decision,
      candidateId:
        decision === "candidate" ? suggestedCandidate?.id || null : null,
    });
    close();
    notify(
      decision === "candidate"
        ? `已关联至候选人 ${suggestedCandidate.name}`
        : decision === "lead"
          ? `${person} 已保留为人物线索`
          : `${person} 已暂不关联`,
    );
  };
  return (
    <Modal
      open
      close={close}
      size="lg"
      title={`${person} · ${noun}身份审核`}
      description="逐项对比来源署名与系统中置信度最高的疑似候选人；同名只用于召回，不会直接建立关系。"
      footer={
        <>
          <Button tone="ghost" onClick={() => saveDecision("none")}>
            暂不关联
          </Button>
          <Button onClick={() => saveDecision("lead")}>保留人物线索</Button>
          {suggestedCandidate ? (
            <Button tone="primary" onClick={() => saveDecision("candidate")}>
              确认是同一人并关联
            </Button>
          ) : null}
        </>
      }
    >
      <div className="s4-person-identity-review">
        <section className="s4-person-identity-comparison">
          <header>
            <span>
              <h3>身份信息对比</h3>
              <p>系统只给出一位疑似候选人，以下信息用于人工判断。</p>
            </span>
            <StatusBadge tone={suggestedCandidate ? "warning" : "neutral"}>
              {suggestedCandidate ? "需要人工确认" : "暂无可靠匹配"}
            </StatusBadge>
          </header>

          <div className="s4-person-compare-profiles">
            <article>
              <small>
                {kind === "paper" ? "论文署名信息" : "专利署名信息"}
              </small>
              <h4>{person}</h4>
              <p>{institution}</p>
              <StatusBadge tone="neutral">原始来源</StatusBadge>
            </article>
            {suggestedCandidate ? (
              <article className="is-candidate">
                <small>系统疑似候选人</small>
                <h4>{suggestedCandidate.name}</h4>
                <p>
                  {suggestedCandidate.company} · {suggestedCandidate.title}
                </p>
                <button
                  type="button"
                  onClick={() => onOpenCandidate(suggestedCandidate.id)}
                >
                  查看完整候选人详情
                  <Icon name="chevronRight" />
                </button>
              </article>
            ) : (
              <article className="is-empty">
                <Icon name="search" />
                <h4>没有可靠的疑似候选人</h4>
                <p>可以保留为人物线索，获得更多信息后再判断。</p>
              </article>
            )}
          </div>
        </section>

        <div className="s4-person-compare-groups">
          <IdentityCompareGroup
            title="联系方式"
            status={comparison.contactStatus}
            source={comparison.source.contacts}
            candidate={comparison.candidate.contacts}
            emptyLabel="公开成果中没有联系方式"
          />
          <IdentityCompareGroup
            title="工作经历"
            status={comparison.workStatus}
            source={comparison.source.work}
            candidate={comparison.candidate.work}
            emptyLabel="公开成果中没有工作经历"
          />
          <IdentityCompareGroup
            title="教育经历"
            status={comparison.educationStatus}
            source={comparison.source.education}
            candidate={comparison.candidate.education}
            emptyLabel="公开成果中没有教育经历"
          />
          <IdentityCompareGroup
            title="项目与研究经历"
            status={comparison.projectStatus}
            source={comparison.source.projects}
            candidate={comparison.candidate.projects}
            emptyLabel="公开成果中没有项目或研究经历"
          />
        </div>
      </div>
    </Modal>
  );
}

function AcademicPeopleList({
  people,
  institutions = [],
  authorships,
  kind,
  linkedPeople,
  reviewStates = {},
  onLinked,
  onReview,
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const panelRef = useRef(null);
  const noun = kind === "paper" ? "作者" : "发明人";
  const personRecords = authorships
    ? authorships.map(([name, affiliations]) => ({ name, affiliations }))
    : people.map((name, index) => ({
        name,
        affiliations: institutions[index] ? [institutions[index]] : [],
      }));
  const visiblePeople = personRecords.slice(0, 5);
  const hiddenPeople = personRecords.slice(5);
  useEffect(() => {
    if (!moreOpen) return undefined;
    const close = (event) => {
      if (
        !moreRef.current?.contains(event.target) &&
        !panelRef.current?.contains(event.target)
      )
        setMoreOpen(false);
    };
    const escape = (event) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [moreOpen]);
  const personItem = (record, index) => {
    const person = record.name;
    const linkedCandidateId = linkedPeople[person] || null;
    const linked = Boolean(linkedCandidateId);
    const institution =
      kind === "paper"
        ? record.affiliations.join("、") || "机构待补充"
        : "原始发明人署名";
    return (
      <article key={person}>
        <span>
          <button
            type="button"
            className={linked ? "is-linked" : ""}
            onClick={() => {
              if (linked) onLinked(person, linkedCandidateId);
              else {
                setMoreOpen(false);
                onReview(person, index);
              }
            }}
          >
            {person}
          </button>
          <small>
            <Icon name={kind === "paper" ? "building" : "patent"} />
            {institution}
          </small>
        </span>
        <StatusBadge tone={linked ? "success" : "warning"}>
          {linked
            ? "已关联"
            : reviewStates[person] ||
              (kind === "paper" ? "人物线索" : "待确认")}
        </StatusBadge>
      </article>
    );
  };
  return (
    <div className="s4-academic-people">
      <div className="s4-authorship-list">{visiblePeople.map(personItem)}</div>
      {hiddenPeople.length ? (
        <div className="s4-authorship-more" ref={moreRef}>
          <button
            type="button"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((value) => !value)}
          >
            <Icon name="plus" />
            还有 {hiddenPeople.length} 位{noun}
            <Icon name={moreOpen ? "chevronUp" : "chevronDown"} />
          </button>
          <FloatingPanel
            open={moreOpen}
            anchorRef={moreRef}
            panelRef={panelRef}
            className="s4-authorship-more-panel"
            width={600}
            role="dialog"
            ariaLabel={`其余${noun}`}
          >
            <header>
              <span>
                <b>
                  其余 {hiddenPeople.length} 位{noun}
                </b>
                <small>
                  {kind === "paper"
                    ? "机构名称来自论文署名信息"
                    : "点击姓名可以处理人物身份"}
                </small>
              </span>
              <button
                type="button"
                aria-label={`关闭其余${noun}`}
                onClick={() => setMoreOpen(false)}
              >
                <Icon name="close" />
              </button>
            </header>
            <div className="s4-authorship-list">
              {hiddenPeople.map((record, hiddenIndex) =>
                personItem(record, hiddenIndex + 5),
              )}
            </div>
          </FloatingPanel>
        </div>
      ) : null}
    </div>
  );
}

export function PaperDetailPage() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const item = papers.find((paper) => paper.id === paperId);
  const [identityPerson, setIdentityPerson] = useState(null);
  const [identityLinks, setIdentityLinks] = useState({
    "Hao Lin": "candidate-linhao",
    "Mingyuan Zhou": "candidate-zhoumingyuan",
  });
  const [reviewStates, setReviewStates] = useState({});
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
      />
      <section className="s4-paper-hero">
        <small>中文标题</small>
        <h2>{item.titleZh}</h2>
        <TagList items={item.tags} tone="info" />
      </section>
      <div className="s4-detail-stack">
        <FieldGroup title="论文摘要">
          <h3>原始摘要</h3>
          <p className="s4-long-copy">
            {item.abstractOriginal || "未获取原始摘要"}
          </p>
          <h3>中文摘要</h3>
          <p className="s4-long-copy">{item.abstractZh || item.summary}</p>
        </FieldGroup>
        <FieldGroup title="作者与机构">
          <AcademicPeopleList
            people={item.authors}
            authorships={item.authorships}
            kind="paper"
            linkedPeople={identityLinks}
            reviewStates={reviewStates}
            onLinked={(_person, candidateId) =>
              navigate(`/candidates/${candidateId}`)
            }
            onReview={(person, index) =>
              setIdentityPerson({
                person,
                institution:
                  item.authorships[index]?.[1]?.join("、") || "机构待补充",
              })
            }
          />
        </FieldGroup>
        <FieldGroup title="成果身份与来源">
          <div className="s4-identifier-list">
            {item.doi ? (
              <span>
                <b>DOI</b>
                <p>{item.doi}</p>
              </span>
            ) : null}
            {item.openAlexId ? (
              <span>
                <b>OpenAlex Work ID</b>
                <p>{item.openAlexId}</p>
              </span>
            ) : null}
            {item.arxivId ? (
              <span>
                <b>arXiv</b>
                <p>{item.arxivId}</p>
              </span>
            ) : null}
            <span>
              <b>数据来源</b>
              <p>{item.source}</p>
            </span>
          </div>
          <SourceList items={item.sourceRecords} />
        </FieldGroup>
      </div>
      {identityPerson ? (
        <PersonIdentityReview
          kind="paper"
          person={identityPerson.person}
          institution={identityPerson.institution}
          sourceTitle={item.title}
          sourceMeta={`${item.year} · ${item.venue}`}
          close={() => setIdentityPerson(null)}
          onOpenCandidate={(candidateId) => {
            setIdentityPerson(null);
            navigate(`/candidates/${candidateId}`);
          }}
          onSave={({ decision, candidateId }) => {
            setIdentityLinks((current) => {
              const next = { ...current };
              if (decision === "candidate")
                next[identityPerson.person] = candidateId;
              else delete next[identityPerson.person];
              return next;
            });
            setReviewStates((current) => ({
              ...current,
              [identityPerson.person]:
                decision === "lead" ? "人物线索" : "未关联",
            }));
          }}
        />
      ) : null}
      <DeleteAssetModal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        assetLabel="论文"
        assetName={item.title}
        impact="候选人、人物线索和知识图谱不会删除；人物关系显示论文已删除引用。"
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
  const [identityPerson, setIdentityPerson] = useState(null);
  const [identityLinks, setIdentityLinks] = useState({
    赵星羽: "candidate-zhaoxingyu",
  });
  const [reviewStates, setReviewStates] = useState({});
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
      />
      <div className="s4-detail-stack">
        <FieldGroup title="专利摘要">
          <p className="s4-long-copy">{item.summary}</p>
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
              ["法律状态", item.legalStatus],
              [
                "状态核验",
                `${item.legalStatusSource} · ${item.legalStatusObservedAt}`,
              ],
            ]}
          />
        </FieldGroup>
        <FieldGroup title="发明人">
          <AcademicPeopleList
            people={item.inventors}
            kind="patent"
            linkedPeople={identityLinks}
            reviewStates={reviewStates}
            onLinked={(_person, candidateId) =>
              navigate(`/candidates/${candidateId}`)
            }
            onReview={(person) =>
              setIdentityPerson({ person, institution: item.applicant })
            }
          />
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
        <FieldGroup
          title="关系同步"
          description="发明人身份确认后，共同发明关系会更新到候选人和引用该关系的知识图谱。"
        >
          <EntityLink
            icon="route"
            title="VLA 核心候选人关系知识图谱"
            meta="候选人关系 · 1 位已关联 · 自动同步"
            onClick={() => navigate("/mappings/mapping-candidate-relations")}
          />
        </FieldGroup>
      </div>
      {identityPerson ? (
        <PersonIdentityReview
          kind="patent"
          person={identityPerson.person}
          institution={identityPerson.institution}
          sourceTitle={item.title}
          sourceMeta={`${item.type} · ${item.applicationNo}`}
          close={() => setIdentityPerson(null)}
          onOpenCandidate={(candidateId) => {
            setIdentityPerson(null);
            navigate(`/candidates/${candidateId}`);
          }}
          onSave={({ decision, candidateId }) => {
            setIdentityLinks((current) => {
              const next = { ...current };
              if (decision === "candidate")
                next[identityPerson.person] = candidateId;
              else delete next[identityPerson.person];
              return next;
            });
            setReviewStates((current) => ({
              ...current,
              [identityPerson.person]:
                decision === "lead" ? "人物线索" : "未关联",
            }));
          }}
        />
      ) : null}
      <DeleteAssetModal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        assetLabel="专利"
        assetName={item.title}
        impact="候选人、人物线索和知识图谱不会删除；共同发明人关系保留已删除引用。"
        onConfirm={() => {
          setDeleteOpen(false);
          notify("专利已进入回收站");
          navigate("/patents");
        }}
      />
    </div>
  );
}
