import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { useCanvasFullscreen } from "../components/useCanvasFullscreen";
import {
  AssetListState,
  AssetPageHeader,
  Button,
  CustomCheckbox,
  DeleteAssetModal,
  DetailHeader,
  DetailTabs,
  FileDrop,
  FilterBar,
  FloatingPanel,
  FormField,
  HierarchyTable,
  Modal,
  NotFoundState,
  Pagination,
  SelectMenu,
  StateBanner,
  StatusBadge,
  TextArea,
  TextInput,
  TooltipText,
  useListController,
  useToast,
} from "./asset-ui";
import {
  graphHistory,
  graphReviewItems,
  initialGraphPages,
  topicGraphs,
} from "./topic-graph-data";

const detailTabs = [
  { value: "content", label: "图谱内容" },
  { value: "reviews", label: "更新与审核", count: 3 },
  { value: "history", label: "版本记录" },
];

const graphOrderStorageKey = "hunter-topic-graph-order";

const evidenceMeta = {
  公司官网: {
    type: "公司官网",
    title: "星澜机器人 · 关于我们",
    path: "/companies/company-xinglan",
    originalUrl: "https://example.com/xinglan-robotics/about",
  },
  用户确认: {
    type: "用户补充",
    title: "2026-08-31 用户确认记录",
    path: "/tasks/mapping-embodied",
  },
  候选人档案: {
    type: "正式资产",
    title: "林昊 · 候选人资料 v6",
    path: "/candidates/candidate-linhao",
  },
  公开履历: {
    type: "公开网页",
    title: "团队成员公开履历",
    path: "/candidates/candidate-linhao?tab=relations",
    originalUrl: "https://example.com/public-profile/lin-hao",
  },
  团队论文: {
    type: "论文",
    title: "VLA 机器人学习团队近两年论文",
    path: "/papers/paper-vla-survey",
    originalUrl: "https://arxiv.org/",
  },
  论文作者信息: {
    type: "论文",
    title: "作者、机构与发表时间",
    path: "/papers/paper-vla-survey",
    originalUrl: "https://arxiv.org/",
  },
  论文作者记录: {
    type: "论文",
    title: "共同作者与机构关系",
    path: "/papers/paper-vla-survey",
    originalUrl: "https://arxiv.org/",
  },
  作者机构: {
    type: "论文",
    title: "作者机构原始记录",
    path: "/papers/paper-vla-survey",
    originalUrl: "https://arxiv.org/",
  },
  招聘页面: {
    type: "公开网页",
    title: "星澜机器人招聘页面",
    path: "/opportunities/opportunity-xinglan",
    originalUrl: "https://example.com/xinglan-robotics/careers",
  },
  公开岗位: {
    type: "岗位",
    title: "公开招聘岗位与职责",
    path: "/positions/position-vla",
  },
  公司资料: {
    type: "正式资产",
    title: "星澜机器人公司资料",
    path: "/companies/company-xinglan",
  },
  正式资产资料: {
    type: "正式资产",
    title: "已关联业务资产",
    path: "/candidates/candidate-linhao",
  },
  用户维护: {
    type: "用户维护",
    title: "当前图页手工记录",
    path: "/mappings/mapping-embodied",
  },
};

function getEvidenceDetail(name) {
  const meta = evidenceMeta[name] || {
    type: "来源证据",
    title: name,
    path: "/tasks/mapping-embodied",
  };
  return {
    name,
    ...meta,
    capturedAt: "2026-08-31 10:42",
    excerpt:
      "该来源支持当前节点或连接关系。原始内容、获取时间与引用位置会随证据一起保存，便于后续复核。",
  };
}

function EvidencePreviewModal({ evidence, close }) {
  const detail = evidence ? getEvidenceDetail(evidence) : null;
  return (
    <Modal
      open={Boolean(detail)}
      close={close}
      size="lg"
      title="来源与证据"
      description="查看本次关系判断引用的原始记录。"
      footer={
        <>
          <Button onClick={close}>关闭</Button>
          {detail?.path ? (
            <Button
              icon="external"
              onClick={() => {
                window.open(
                  `${window.location.pathname}#${detail.path}`,
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
            >
              打开来源记录
            </Button>
          ) : null}
          {detail?.originalUrl ? (
            <Button
              tone="primary"
              icon="external"
              onClick={() =>
                window.open(detail.originalUrl, "_blank", "noopener,noreferrer")
              }
            >
              打开原始网页
            </Button>
          ) : null}
        </>
      }
    >
      {detail ? (
        <div className="tg-evidence-preview">
          <header>
            <span>
              <small>{detail.type}</small>
              <h3>{detail.title}</h3>
            </span>
            <StatusBadge tone="success">可访问</StatusBadge>
          </header>
          <dl>
            <div>
              <dt>引用名称</dt>
              <dd>{detail.name}</dd>
            </div>
            <div>
              <dt>采集时间</dt>
              <dd>{detail.capturedAt}</dd>
            </div>
          </dl>
          <section>
            <h4>证据摘录</h4>
            <p>{detail.excerpt}</p>
          </section>
        </div>
      ) : null}
    </Modal>
  );
}

const nodeKindLabel = {
  company: "公司",
  organization: "组织",
  person: "人物",
  contact: "联系人",
  position: "岗位",
  industry: "产业环节",
  group: "分组",
  note: "自由节点",
};

const relationKindLabel = {
  shared: "共享关系",
  derived: "来源派生",
  local: "本图关系",
  analysis: "分析建议",
};

const deepClonePages = () =>
  initialGraphPages.map((page) => ({
    ...page,
    nodes: page.nodes.map((node) => ({ ...node })),
    edges: page.edges.map((edge) => ({ ...edge })),
  }));

function updateParams(params, setParams, changes) {
  const next = new URLSearchParams(params);
  Object.entries(changes).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") next.delete(key);
    else next.set(key, value);
  });
  setParams(next);
}

export function MappingsListPage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [params] = useSearchParams();
  const [openMenu, setOpenMenu] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const dragStartOrderRef = useRef(null);
  const dragPreviewOrderRef = useRef(null);
  const dragCommittedRef = useRef(false);
  const [orderedGraphs, setOrderedGraphs] = useState(() => {
    const stored = window.localStorage.getItem(graphOrderStorageKey);
    if (!stored) return topicGraphs;
    try {
      const order = JSON.parse(stored);
      return [...topicGraphs].sort(
        (a, b) => order.indexOf(a.id) - order.indexOf(b.id),
      );
    } catch {
      return topicGraphs;
    }
  });
  const controller = useListController(
    orderedGraphs,
    ["name", "description", "related"],
    6,
  );
  const state = params.get("state") || "normal";

  const previewGraphOrder = (targetId) => {
    if (!draggedId || draggedId === targetId) return;
    setOrderedGraphs((items) => {
      const next = [...items];
      const from = next.findIndex((item) => item.id === draggedId);
      const to = next.findIndex((item) => item.id === targetId);
      if (from < 0 || to < 0) return items;
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      dragPreviewOrderRef.current = next;
      return next;
    });
  };

  const commitGraphOrder = () => {
    const next = dragPreviewOrderRef.current || orderedGraphs;
    dragCommittedRef.current = true;
    window.localStorage.setItem(
      graphOrderStorageKey,
      JSON.stringify(next.map((item) => item.id)),
    );
    notify("知识图谱顺序已保存");
  };

  return (
    <div className="s4-page tg-list-page">
      <AssetPageHeader
        title="知识图谱"
        description="用图页整理组织、人物、公司生态、岗位人才和其他需要持续维护的关系内容。"
        count={controller.filtered.length}
        primaryLabel="新建知识图谱"
        onPrimary={() => navigate("/mappings/new")}
      />
      <FilterBar
        query={controller.query}
        setQuery={controller.setQuery}
        placeholder="搜索图谱名称、内容或关联业务"
        filters={[]}
      />
      <AssetListState
        state={state}
        label="知识图谱"
        onRetry={() => navigate("/mappings")}
      >
        {state === "normal" && controller.rows.length ? (
          <div className="tg-graph-grid">
            {controller.rows.map((item) => (
              <article
                key={item.id}
                className={`tg-graph-card ${draggedId === item.id ? "is-dragging" : ""}`}
                draggable
                onDragStart={(event) => {
                  dragStartOrderRef.current = orderedGraphs;
                  dragPreviewOrderRef.current = orderedGraphs;
                  dragCommittedRef.current = false;
                  setDraggedId(item.id);
                  event.dataTransfer.effectAllowed = "move";
                }}
                onDragEnter={(event) => {
                  event.preventDefault();
                  previewGraphOrder(item.id);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  commitGraphOrder();
                }}
                onDragEnd={() => {
                  if (!dragCommittedRef.current && dragStartOrderRef.current) {
                    setOrderedGraphs(dragStartOrderRef.current);
                  }
                  dragStartOrderRef.current = null;
                  dragPreviewOrderRef.current = null;
                  setDraggedId(null);
                }}
              >
                <header>
                  <span className="tg-card-drag-handle" title="拖动调整顺序">
                    <Icon name="menu" />
                  </span>
                  <span className="tg-graph-card-icon">
                    <Icon name="route" />
                  </span>
                  <span>
                    <small>知识图谱 · {item.pageCount} 个图页</small>
                    <h2>{item.name}</h2>
                  </span>
                  <button
                    type="button"
                    className="tg-icon-button"
                    aria-label={`更多操作：${item.name}`}
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
                    <div className="tg-card-menu" role="menu">
                      <button
                        type="button"
                        onClick={() => navigate(`/mappings/${item.id}`)}
                      >
                        <Icon name="edit" />
                        编辑图谱资料
                      </button>
                      <button
                        type="button"
                        className="is-danger"
                        onClick={() => {
                          setDeleteItem(item);
                          setOpenMenu(null);
                        }}
                      >
                        <Icon name="trash" />
                        删除知识图谱
                      </button>
                    </div>
                  ) : null}
                </header>
                <TooltipText
                  className="tg-graph-description"
                  tip={item.description}
                  clampLines={3}
                >
                  {item.description}
                </TooltipText>
                <dl>
                  <div>
                    <dt>节点</dt>
                    <dd>{item.nodeCount}</dd>
                  </div>
                  <div>
                    <dt>已关联资产</dt>
                    <dd>{item.linkedAssets}</dd>
                  </div>
                  <div>
                    <dt>待确认</dt>
                    <dd className={item.pending ? "is-warning" : ""}>
                      {item.pending}
                    </dd>
                  </div>
                </dl>
                <footer>
                  <span>
                    <b>{item.related}</b>
                    <small>更新于 {item.updatedAt}</small>
                  </span>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/mappings/${item.id}`)}
                  >
                    打开图谱
                  </Button>
                </footer>
              </article>
            ))}
          </div>
        ) : state === "normal" || state === "empty" ? (
          <div className="s4-custom-empty">
            <Icon name="route" />
            <b>还没有知识图谱</b>
            <p>
              先创建一个图谱，再在其中增加空白图页、导入文件或使用 AI 整理内容。
            </p>
            <Button
              tone="primary"
              icon="plus"
              onClick={() => navigate("/mappings/new")}
            >
              新建知识图谱
            </Button>
          </div>
        ) : null}
      </AssetListState>
      <Pagination
        page={controller.page}
        pages={controller.pages}
        onChange={controller.setPage}
      />
      <DeleteAssetModal
        open={Boolean(deleteItem)}
        close={() => setDeleteItem(null)}
        assetLabel="知识图谱"
        assetName={deleteItem?.name || ""}
        impact="图谱进入回收站；候选人、岗位、公司、论文、专利和共享关系均不会删除。"
        onConfirm={() => {
          notify(`“${deleteItem?.name}”已进入回收站`);
          setDeleteItem(null);
        }}
      />
    </div>
  );
}

export function MappingCreatePage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const create = () => {
    setSubmitted(true);
    if (!name.trim()) return;
    notify("知识图谱已创建");
    navigate("/mappings/graph-empty");
  };

  return (
    <div className="s4-create-page tg-create-page">
      <AssetPageHeader
        eyebrow="知识图谱"
        title="新建知识图谱"
        description="先建立图谱容器。创建后再增加图页、导入文件或让 AI 整理内容。"
        actions={<Button onClick={() => navigate("/mappings")}>取消</Button>}
      />
      <section className="tg-create-panel">
        <header>
          <span>
            <Icon name="route" />
          </span>
          <div>
            <h2>图谱基本资料</h2>
            <p>
              知识图谱可以承载组织、人物、公司生态、岗位人才或其他关系内容。
            </p>
          </div>
        </header>
        <div className="s4-form-grid">
          <FormField
            label="图谱名称"
            required
            span={2}
            error={submitted && !name.trim() ? "请输入图谱名称" : ""}
          >
            <TextInput
              value={name}
              onChange={setName}
              placeholder="例如：具身智能 VLA 知识图谱"
            />
          </FormField>
          <FormField label="图谱说明" span={2}>
            <TextArea
              value={description}
              onChange={setDescription}
              rows={5}
              placeholder="说明这份图谱主要整理什么内容，方便后续查找和复用。"
            />
          </FormField>
        </div>
        <div className="tg-create-note">
          <Icon name="info" />
          <p>
            创建后不会自动生成图页，也不会启动任务。文件导入和 AI
            整理只能在已有知识图谱中执行。
          </p>
        </div>
        <footer>
          <Button onClick={() => navigate("/mappings")}>取消</Button>
          <Button tone="primary" disabled={!name.trim()} onClick={create}>
            创建知识图谱
          </Button>
        </footer>
      </section>
    </div>
  );
}

function GraphEmptyState({ onCreatePage, onImport, onAi }) {
  return (
    <section className="tg-empty-graph">
      <div className="tg-empty-visual" aria-hidden="true">
        <span />
        <span />
        <span />
        <i />
      </div>
      <h2>这份知识图谱还没有图页</h2>
      <p>选择一种方式开始。后续可以在同一份图谱中继续增加更多图页。</p>
      <div>
        <button type="button" onClick={onCreatePage}>
          <Icon name="plus" />
          <span>
            <b>创建空白图页</b>
            <small>手动添加节点与关系</small>
          </span>
        </button>
        <button type="button" onClick={onImport}>
          <Icon name="download" />
          <span>
            <b>导入文件为图页</b>
            <small>保留原文件结构</small>
          </span>
        </button>
        <button type="button" onClick={onAi}>
          <Icon name="sparkles" />
          <span>
            <b>让 AI 整理图页</b>
            <small>先预览变化再写入</small>
          </span>
        </button>
      </div>
    </section>
  );
}

function EmptyGraphAiDialog({ open, close, onCreate }) {
  const [goal, setGoal] = useState(
    "梳理新能源机器人产业链中的核心公司、上下游关系和关键技术负责人。",
  );
  const [title, setTitle] = useState("");
  const [planned, setPlanned] = useState(false);
  useEffect(() => {
    if (!open) {
      setGoal(
        "梳理新能源机器人产业链中的核心公司、上下游关系和关键技术负责人。",
      );
      setTitle("");
      setPlanned(false);
    }
  }, [open]);
  return (
    <Modal
      open={open}
      close={close}
      size="xl"
      title={planned ? "确认 AI 整理目标" : "AI 整理新图页"}
      description="用自然语言说明要梳理的范围。AI 会提炼图页标题和整理计划，确认后才开始写入。"
      footer={
        <>
          <Button onClick={close}>取消</Button>
          {planned ? (
            <Button
              tone="primary"
              disabled={!title.trim()}
              onClick={() =>
                onCreate({ title: title.trim(), goal: goal.trim() })
              }
            >
              创建图页并开始整理
            </Button>
          ) : (
            <Button
              tone="primary"
              disabled={!goal.trim()}
              onClick={() => {
                setTitle("新能源机器人产业链与关键人才");
                setPlanned(true);
              }}
            >
              生成整理计划
            </Button>
          )}
        </>
      }
    >
      <div className="tg-empty-ai-dialog">
        <FormField label="整理目标" required span={2}>
          <TextArea value={goal} onChange={setGoal} rows={5} />
        </FormField>
        {planned ? (
          <>
            <FormField label="AI 提炼的图页标题" required span={2}>
              <TextInput value={title} onChange={setTitle} />
            </FormField>
            <section className="tg-empty-ai-plan">
              <header>
                <Icon name="sparkles" />
                <span>
                  <b>整理计划</b>
                  <small>标题和目标仍可继续修改</small>
                </span>
              </header>
              <ol>
                <li>读取已有公司、候选人、岗位、论文与专利资产</li>
                <li>补充公开网络中可核验的公司与人物关系</li>
                <li>生成节点与连接，低置信度关系进入更新与审核</li>
              </ol>
            </section>
          </>
        ) : null}
      </div>
    </Modal>
  );
}

function GraphPageStrip({
  pages,
  activeId,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
}) {
  const [menu, setMenu] = useState(null);
  const menuAnchorRef = useRef(null);
  const menuPanelRef = useRef(null);
  const activeMenuPage = pages.find((page) => page.id === menu);
  return (
    <div className="tg-page-strip">
      <div role="tablist" aria-label="图页">
        {pages.map((page) => (
          <span
            key={page.id}
            className={activeId === page.id ? "is-active" : ""}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeId === page.id}
              onClick={() => onSelect(page.id)}
            >
              {page.name}
            </button>
            <button
              type="button"
              aria-label={`图页操作：${page.name}`}
              aria-expanded={menu === page.id}
              onClick={(event) => {
                menuAnchorRef.current = event.currentTarget;
                setMenu((current) => (current === page.id ? null : page.id));
              }}
            >
              <Icon name="more" />
            </button>
          </span>
        ))}
      </div>
      <FloatingPanel
        open={Boolean(activeMenuPage)}
        anchorRef={menuAnchorRef}
        panelRef={menuPanelRef}
        className="tg-page-menu"
        width={166}
        align="end"
        role="menu"
        ariaLabel={`图页操作：${activeMenuPage?.name || ""}`}
      >
        <button
          type="button"
          onClick={() => {
            onEdit(activeMenuPage);
            setMenu(null);
          }}
        >
          <Icon name="edit" />
          编辑
        </button>
        <button
          type="button"
          className="is-danger"
          onClick={() => {
            onDelete(activeMenuPage);
            setMenu(null);
          }}
        >
          <Icon name="trash" />
          删除图页
        </button>
      </FloatingPanel>
      <button type="button" className="tg-add-page-button" onClick={onCreate}>
        <Icon name="plus" />
        新建图页
      </button>
    </div>
  );
}

function NodeStatus({ node }) {
  if (node.status === "review")
    return (
      <span className="tg-node-marker is-review">
        <Icon name="warning" />
        {node.marker || "待确认"}
      </span>
    );
  return null;
}

function GraphSearch({ pages, activePageId, onLocate }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const matches = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return [];
    return pages
      .flatMap((page) =>
        page.nodes
          .filter((node) => !node.hidden)
          .filter((node) =>
            [node.label, node.subtitle, node.summary]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(keyword),
          )
          .map((node) => ({ page, node })),
      )
      .sort(
        (a, b) =>
          Number(b.page.id === activePageId) -
          Number(a.page.id === activePageId),
      );
  }, [activePageId, pages, query]);
  return (
    <div className="tg-graph-search">
      <Icon name="search" />
      <input
        aria-label="搜索知识图谱"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        placeholder="搜索全部图页"
      />
      {query ? (
        <button
          type="button"
          aria-label="清空搜索"
          onClick={() => setQuery("")}
        >
          <Icon name="close" />
        </button>
      ) : null}
      {open && query ? (
        <div className="tg-search-results">
          <header>
            <b>
              {matches.length ? `${matches.length} 个匹配结果` : "没有匹配结果"}
            </b>
            <button type="button" onClick={() => setOpen(false)}>
              关闭
            </button>
          </header>
          {matches.map(({ page, node }) => (
            <button
              type="button"
              key={`${page.id}-${node.id}`}
              onClick={() => {
                onLocate(page.id, node.id);
                setOpen(false);
              }}
            >
              <Icon
                name={
                  node.kind === "person"
                    ? "user"
                    : node.kind === "company"
                      ? "building"
                      : "route"
                }
              />
              <span>
                <b>
                  {page.name} · {node.label}
                </b>
                <small>{node.subtitle || nodeKindLabel[node.kind]}</small>
              </span>
              {page.id === activePageId ? <em>当前图页</em> : null}
            </button>
          ))}
          {!matches.length ? <p>隐藏内容不会出现在普通搜索中。</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function getDescendantIds(nodes, parentId) {
  const direct = nodes
    .filter((node) => node.parentId === parentId)
    .map((node) => node.id);
  return direct.flatMap((id) => [id, ...getDescendantIds(nodes, id)]);
}

const graphCanvasMinimumBounds = { width: 1240, height: 650 };
const graphCanvasExpansionPadding = 240;
const graphCanvasExpansionStep = 320;
const graphNodeHeight = 86;
const graphNodeGap = 18;

function expandGraphCanvasBounds(bounds, nodes) {
  const requiredWidth = Math.max(
    graphCanvasMinimumBounds.width,
    ...nodes.map(
      (node) => node.x + (node.width || 180) + graphCanvasExpansionPadding,
    ),
  );
  const requiredHeight = Math.max(
    graphCanvasMinimumBounds.height,
    ...nodes.map(
      (node) => node.y + graphNodeHeight + graphCanvasExpansionPadding,
    ),
  );
  const width = Math.max(
    bounds.width,
    Math.ceil(requiredWidth / graphCanvasExpansionStep) *
      graphCanvasExpansionStep,
  );
  const height = Math.max(
    bounds.height,
    Math.ceil(requiredHeight / graphCanvasExpansionStep) *
      graphCanvasExpansionStep,
  );
  return width === bounds.width && height === bounds.height
    ? bounds
    : { width, height };
}

function graphNodesOverlap(left, right) {
  const leftWidth = left.width || 180;
  const rightWidth = right.width || 180;
  return !(
    left.x + leftWidth + graphNodeGap <= right.x ||
    right.x + rightWidth + graphNodeGap <= left.x ||
    left.y + graphNodeHeight + graphNodeGap <= right.y ||
    right.y + graphNodeHeight + graphNodeGap <= left.y
  );
}

function clampGraphNode(node, bounds = graphCanvasMinimumBounds) {
  const width = node.width || 180;
  return {
    ...node,
    x: Math.min(bounds.width - width - 16, Math.max(16, node.x)),
    y: Math.min(bounds.height - graphNodeHeight - 16, Math.max(16, node.y)),
  };
}

function placeGraphNodeWithoutOverlap(
  node,
  occupied,
  bounds = graphCanvasMinimumBounds,
) {
  const desired = clampGraphNode(node, bounds);
  if (!occupied.some((item) => graphNodesOverlap(desired, item))) {
    return desired;
  }
  const step = 24;
  for (let ring = 1; ring <= 12; ring += 1) {
    const offsets = [];
    for (let axis = -ring; axis <= ring; axis += 1) {
      offsets.push(
        [axis * step, -ring * step],
        [axis * step, ring * step],
        [-ring * step, axis * step],
        [ring * step, axis * step],
      );
    }
    for (const [dx, dy] of offsets) {
      const candidate = clampGraphNode(
        {
          ...node,
          x: node.x + dx,
          y: node.y + dy,
        },
        bounds,
      );
      if (!occupied.some((item) => graphNodesOverlap(candidate, item))) {
        return candidate;
      }
    }
  }
  return desired;
}

function placeMovedGraphNodes(
  nodes,
  ids,
  desiredById,
  bounds = graphCanvasMinimumBounds,
) {
  const occupied = nodes.filter((node) => !ids.includes(node.id));
  const placed = [];
  const positions = {};
  ids.forEach((id) => {
    const current = nodes.find((node) => node.id === id);
    if (!current || !desiredById[id]) return;
    const next = placeGraphNodeWithoutOverlap(
      { ...current, ...desiredById[id] },
      [...occupied, ...placed],
      bounds,
    );
    placed.push(next);
    positions[id] = { x: next.x, y: next.y };
  });
  return nodes.map((node) =>
    positions[node.id]
      ? { ...node, ...positions[node.id], userMoved: true }
      : node,
  );
}

function GraphCanvas({
  page,
  selectedIds,
  setSelectedIds,
  selectedEdgeId,
  setSelectedEdgeId,
  onNodesChange,
  collapsed,
  setCollapsed,
  zoom,
  focusNodeId,
  onContextMenu,
  onEditRelation,
  onCreateRelation,
  onReparentNodes,
  onZoom,
  connectionMode = false,
  reviewMode = false,
  allowPan = false,
}) {
  const scrollRef = useRef(null);
  const stageRef = useRef(null);
  const dragRef = useRef(null);
  const panRef = useRef(null);
  const connectionRef = useRef(null);
  const [connectionDraft, setConnectionDraft] = useState(null);
  const [dropTargetId, setDropTargetId] = useState(null);
  const [shortcutOpen, setShortcutOpen] = useState(true);
  const [canvasPan, setCanvasPan] = useState({ x: 0, y: 0 });
  const [canvasBounds, setCanvasBounds] = useState(() =>
    expandGraphCanvasBounds(graphCanvasMinimumBounds, page.nodes),
  );
  const hiddenByCollapse = useMemo(() => {
    const ids = new Set();
    collapsed.forEach((id) =>
      getDescendantIds(page.nodes, id).forEach((child) => ids.add(child)),
    );
    return ids;
  }, [collapsed, page.nodes]);
  const visibleNodes = page.nodes.filter(
    (node) => !node.hidden && !hiddenByCollapse.has(node.id),
  );
  const nodeMap = new Map(visibleNodes.map((node) => [node.id, node]));
  const visibleEdges = page.edges.filter(
    (edge) =>
      !edge.hidden && nodeMap.has(edge.source) && nodeMap.has(edge.target),
  );

  useEffect(() => {
    setCanvasBounds(
      expandGraphCanvasBounds(graphCanvasMinimumBounds, page.nodes),
    );
    setCanvasPan({ x: 0, y: 0 });
  }, [page.id]);

  useEffect(() => {
    if (!focusNodeId || !scrollRef.current) return;
    const target = page.nodes.find((node) => node.id === focusNodeId);
    if (!target) return;
    scrollRef.current.scrollTo({
      left: Math.max(
        0,
        target.x * zoom - scrollRef.current.clientWidth / 2 + 90,
      ),
      top: Math.max(
        0,
        target.y * zoom - scrollRef.current.clientHeight / 2 + 34,
      ),
      behavior: "smooth",
    });
  }, [focusNodeId, page.nodes, zoom]);

  useEffect(() => {
    const move = (event) => {
      if (dragRef.current) {
        const { startX, startY, original, ids } = dragRef.current;
        const dx = (event.clientX - startX) / zoom;
        const dy = (event.clientY - startY) / zoom;
        const desiredById = Object.fromEntries(
          ids.map((id) => [
            id,
            { x: original[id].x + dx, y: original[id].y + dy },
          ]),
        );
        const desiredNodes = page.nodes.map((node) =>
          desiredById[node.id] ? { ...node, ...desiredById[node.id] } : node,
        );
        const nextBounds = expandGraphCanvasBounds(canvasBounds, desiredNodes);
        if (nextBounds !== canvasBounds) setCanvasBounds(nextBounds);
        onNodesChange((nodes) =>
          nodes.map((node) =>
            desiredById[node.id]
              ? {
                  ...node,
                  ...clampGraphNode(
                    { ...node, ...desiredById[node.id] },
                    nextBounds,
                  ),
                  userMoved: true,
                }
              : node,
          ),
        );
        if (stageRef.current) {
          const stageRect = stageRef.current.getBoundingClientRect();
          const pointerX = (event.clientX - stageRect.left) / zoom;
          const pointerY = (event.clientY - stageRect.top) / zoom;
          const blockedIds = new Set(
            ids.flatMap((id) => [id, ...getDescendantIds(page.nodes, id)]),
          );
          const target = page.nodes.find((node) => {
            if (node.hidden || blockedIds.has(node.id)) return false;
            const width = node.width || 180;
            return (
              pointerX >= node.x &&
              pointerX <= node.x + width &&
              pointerY >= node.y &&
              pointerY <= node.y + 70
            );
          });
          const nextTargetId = target?.id || null;
          dragRef.current.dropTargetId = nextTargetId;
          setDropTargetId(nextTargetId);
        }
      }
      if (connectionRef.current && stageRef.current) {
        const rect = stageRef.current.getBoundingClientRect();
        setConnectionDraft((current) =>
          current
            ? {
                ...current,
                x2: (event.clientX - rect.left) / zoom,
                y2: (event.clientY - rect.top) / zoom,
              }
            : current,
        );
      }
    };
    const up = (event) => {
      if (connectionRef.current) {
        const target = document
          .elementFromPoint(event.clientX, event.clientY)
          ?.closest(".tg-node");
        const targetId = target?.dataset.nodeId;
        if (targetId && targetId !== connectionRef.current.sourceId) {
          onCreateRelation?.({
            source: connectionRef.current.sourceId,
            target: targetId,
          });
        }
        connectionRef.current = null;
        setConnectionDraft(null);
      }
      if (dragRef.current?.dropTargetId) {
        onReparentNodes?.(dragRef.current.ids, dragRef.current.dropTargetId);
      } else if (dragRef.current) {
        const { ids } = dragRef.current;
        onNodesChange((nodes) => {
          const desiredById = Object.fromEntries(
            nodes
              .filter((node) => ids.includes(node.id))
              .map((node) => [node.id, { x: node.x, y: node.y }]),
          );
          return placeMovedGraphNodes(nodes, ids, desiredById, canvasBounds);
        });
      }
      dragRef.current = null;
      setDropTargetId(null);
      panRef.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [
    canvasBounds,
    onCreateRelation,
    onNodesChange,
    onReparentNodes,
    page.nodes,
    zoom,
  ]);

  return (
    <div
      className={`tg-canvas-frame ${reviewMode ? "is-review-mode" : ""} ${allowPan ? "is-pan-enabled" : ""} ${connectionMode ? "is-connection-mode" : ""}`}
    >
      {connectionMode ? (
        <div className="tg-connection-mode-hint">
          <Icon name="link" />
          从节点右侧连接点拖到另一个节点，松开后直接建立连接
        </div>
      ) : null}
      {!reviewMode ? (
        <div className={`tg-shortcut-panel ${shortcutOpen ? "is-open" : ""}`}>
          <button
            type="button"
            aria-label={shortcutOpen ? "收起图谱快捷键" : "查看图谱快捷键"}
            onClick={() => setShortcutOpen((value) => !value)}
          >
            <Icon name="keyboard" />
            {shortcutOpen ? "快捷键" : null}
            <Icon name={shortcutOpen ? "chevronDown" : "chevronUp"} />
          </button>
          {shortcutOpen ? (
            <dl>
              <div>
                <dt>新增子节点</dt>
                <dd>
                  <kbd>Tab</kbd>
                </dd>
              </div>
              <div>
                <dt>新增同级节点</dt>
                <dd>
                  <kbd>Enter</kbd>
                </dd>
              </div>
              <div>
                <dt>编辑节点或关系</dt>
                <dd>
                  <kbd>E</kbd>
                  <kbd>F2</kbd>
                </dd>
              </div>
              <div>
                <dt>删除</dt>
                <dd>
                  <kbd>Del</kbd>
                  <kbd>Backspace</kbd>
                </dd>
              </div>
              <div>
                <dt>缩放</dt>
                <dd>滚轮</dd>
              </div>
              <div>
                <dt>平移</dt>
                <dd>拖动画布</dd>
              </div>
              <div>
                <dt>移动节点</dt>
                <dd>拖动节点</dd>
              </div>
              <div>
                <dt>调整层级</dt>
                <dd>拖到目标节点</dd>
              </div>
              <div>
                <dt>更多操作</dt>
                <dd>右键</dd>
              </div>
            </dl>
          ) : null}
        </div>
      ) : null}
      <div
        ref={scrollRef}
        className="tg-canvas-scroll is-pan-mode"
        onWheel={(event) => {
          if (!onZoom) return;
          event.preventDefault();
          const direction = event.deltaY > 0 ? -0.1 : 0.1;
          onZoom((value) =>
            Math.min(
              1.5,
              Math.max(0.5, Number((value + direction).toFixed(1))),
            ),
          );
        }}
        onPointerDown={(event) => {
          if (
            (reviewMode && !allowPan) ||
            event.button !== 0 ||
            event.target.closest(".tg-node") ||
            event.target.closest(".tg-edge-label-button") ||
            event.target.closest(".tg-edge-hit")
          )
            return;
          panRef.current = {
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            offsetX: canvasPan.x,
            offsetY: canvasPan.y,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (panRef.current?.pointerId !== event.pointerId) return;
          setCanvasPan({
            x: panRef.current.offsetX + event.clientX - panRef.current.x,
            y: panRef.current.offsetY + event.clientY - panRef.current.y,
          });
        }}
        onPointerUp={(event) => {
          if (panRef.current?.pointerId !== event.pointerId) return;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          panRef.current = null;
        }}
        onPointerCancel={(event) => {
          if (panRef.current?.pointerId !== event.pointerId) return;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          panRef.current = null;
        }}
        onClick={(event) => {
          if (
            event.target.closest(".tg-node") ||
            event.target.closest(".tg-edge-hit")
          )
            return;
          setSelectedIds([]);
          setSelectedEdgeId(null);
        }}
      >
        <div
          className="tg-canvas-size"
          style={{
            width: canvasBounds.width * zoom,
            height: canvasBounds.height * zoom,
          }}
        >
          <div
            ref={stageRef}
            className={`tg-canvas-stage ${zoom < 0.8 ? "is-compact" : ""}`}
            style={{
              width: canvasBounds.width,
              height: canvasBounds.height,
              transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${zoom})`,
            }}
          >
            <svg
              className="tg-edge-layer"
              width={canvasBounds.width}
              height={canvasBounds.height}
              aria-label="图谱关系"
            >
              <defs>
                <marker
                  id="tg-arrow"
                  markerWidth="8"
                  markerHeight="8"
                  refX="7"
                  refY="4"
                  orient="auto"
                >
                  <path d="M0 0 L8 4 L0 8 Z" />
                </marker>
              </defs>
              {connectionDraft ? (
                <path
                  className="tg-connection-draft"
                  d={`M ${connectionDraft.x1} ${connectionDraft.y1} L ${connectionDraft.x2} ${connectionDraft.y2}`}
                  markerEnd="url(#tg-arrow)"
                />
              ) : null}
              {visibleEdges.map((relation) => {
                const source = nodeMap.get(relation.source);
                const target = nodeMap.get(relation.target);
                const x1 = source.x + (source.width || 180);
                const y1 = source.y + graphNodeHeight / 2;
                const x2 = target.x;
                const y2 = target.y + graphNodeHeight / 2;
                const mid = (x1 + x2) / 2;
                const path = `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
                return (
                  <g
                    key={relation.id}
                    className={`tg-edge is-${relation.kind} ${selectedEdgeId === relation.id ? "is-selected" : ""} ${relation.status === "review" ? "is-review" : ""}`}
                  >
                    <path
                      d={path}
                      className="tg-edge-line"
                      markerEnd="url(#tg-arrow)"
                    />
                    <path
                      d={path}
                      className="tg-edge-hit"
                      data-edge-id={relation.id}
                      data-edge-label={relation.label || "未命名关系"}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedEdgeId(relation.id);
                        setSelectedIds([]);
                      }}
                      onDoubleClick={(event) => {
                        event.stopPropagation();
                        onEditRelation?.(relation);
                      }}
                    />
                    {relation.label
                      ? (() => {
                          const labelWidth = Math.max(
                            54,
                            Math.min(132, relation.label.length * 11 + 22),
                          );
                          const labelY = (y1 + y2) / 2 - 13;
                          return (
                            <g
                              className="tg-edge-label-button"
                              role="button"
                              tabIndex="0"
                              aria-label={`编辑关系：${relation.label}`}
                              transform={`translate(${mid - labelWidth / 2} ${labelY})`}
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedEdgeId(relation.id);
                                setSelectedIds([]);
                              }}
                              onDoubleClick={(event) => {
                                event.stopPropagation();
                                onEditRelation?.(relation);
                              }}
                              onKeyDown={(event) => {
                                if (event.key !== "Enter" && event.key !== " ")
                                  return;
                                event.preventDefault();
                                setSelectedEdgeId(relation.id);
                                setSelectedIds([]);
                              }}
                            >
                              <title>单击查看关系，双击编辑名称</title>
                              <rect width={labelWidth} height="26" rx="5" />
                              <text
                                x={labelWidth / 2}
                                y="17"
                                textAnchor="middle"
                              >
                                {relation.label}
                              </text>
                            </g>
                          );
                        })()
                      : null}
                  </g>
                );
              })}
            </svg>
            {visibleNodes.map((item) => {
              const selected = selectedIds.includes(item.id);
              const hasChildren = page.nodes.some(
                (node) => node.parentId === item.id && !node.hidden,
              );
              return (
                <button
                  type="button"
                  key={item.id}
                  className={`tg-node is-${item.kind} is-${item.status} ${selected ? "is-selected" : ""} ${focusNodeId === item.id ? "is-focused" : ""} ${dropTargetId === item.id ? "is-drop-target" : ""}`}
                  data-node-id={item.id}
                  style={{
                    left: item.x,
                    top: item.y,
                    width: item.width || 180,
                  }}
                  aria-pressed={selected}
                  onPointerDown={(event) => {
                    if (
                      reviewMode ||
                      event.button !== 0 ||
                      event.target.closest(".tg-node-connector")
                    )
                      return;
                    event.stopPropagation();
                    const nextIds =
                      event.shiftKey || event.metaKey || event.ctrlKey
                        ? selected
                          ? selectedIds.filter((id) => id !== item.id)
                          : [...selectedIds, item.id]
                        : selectedIds.includes(item.id) &&
                            selectedIds.length > 1
                          ? selectedIds
                          : [item.id];
                    setSelectedIds(nextIds);
                    setSelectedEdgeId(null);
                    dragRef.current = {
                      startX: event.clientX,
                      startY: event.clientY,
                      ids: nextIds,
                      original: Object.fromEntries(
                        page.nodes
                          .filter((node) => nextIds.includes(node.id))
                          .map((node) => [node.id, { x: node.x, y: node.y }]),
                      ),
                    };
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!selectedIds.includes(item.id))
                      setSelectedIds([item.id]);
                    setSelectedEdgeId(null);
                  }}
                  onDoubleClick={(event) => {
                    event.stopPropagation();
                    onContextMenu({
                      x: event.clientX,
                      y: event.clientY,
                      node: item,
                      action: "edit",
                    });
                  }}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setSelectedIds([item.id]);
                    onContextMenu({
                      x: event.clientX,
                      y: event.clientY,
                      node: item,
                    });
                  }}
                >
                  <span className="tg-node-kind">
                    <Icon
                      name={
                        item.kind === "person"
                          ? "user"
                          : item.kind === "company"
                            ? "building"
                            : item.kind === "position"
                              ? "briefcase"
                              : item.kind === "contact"
                                ? "users"
                                : "route"
                      }
                    />
                  </span>
                  <span className="tg-node-copy">
                    <TooltipText
                      tip={item.label}
                      className="tg-node-title"
                      clampLines={1}
                    >
                      {item.label}
                    </TooltipText>
                    <TooltipText
                      tip={item.subtitle || nodeKindLabel[item.kind]}
                      className="tg-node-subtitle"
                      clampLines={1}
                    >
                      {item.subtitle || nodeKindLabel[item.kind]}
                    </TooltipText>
                    {item.assetPath ? (
                      <span className="tg-node-asset">
                        <Icon name="link" />
                        已关联 · {item.assetType || nodeKindLabel[item.kind]}
                      </span>
                    ) : null}
                  </span>
                  <NodeStatus node={item} />
                  {!reviewMode ? (
                    <span
                      role="button"
                      tabIndex="0"
                      className="tg-node-connector"
                      aria-label={`从${item.label}开始连线`}
                      data-tooltip="拖到另一个节点建立关系"
                      onPointerDown={(event) => {
                        if (event.button !== 0) return;
                        event.preventDefault();
                        event.stopPropagation();
                        const width = item.width || 180;
                        connectionRef.current = { sourceId: item.id };
                        setConnectionDraft({
                          sourceId: item.id,
                          x1: item.x + width,
                          y1: item.y + graphNodeHeight / 2,
                          x2: item.x + width + 24,
                          y2: item.y + graphNodeHeight / 2,
                        });
                      }}
                    >
                      <Icon name="plus" />
                    </span>
                  ) : null}
                  {hasChildren ? (
                    <span
                      role="button"
                      tabIndex="0"
                      className="tg-collapse-node"
                      aria-label={
                        collapsed.has(item.id) ? "展开子节点" : "收起子节点"
                      }
                      onClick={(event) => {
                        event.stopPropagation();
                        setCollapsed((current) => {
                          const next = new Set(current);
                          if (next.has(item.id)) next.delete(item.id);
                          else next.add(item.id);
                          return next;
                        });
                      }}
                    >
                      <Icon name={collapsed.has(item.id) ? "plus" : "minus"} />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function flattenTree(nodes) {
  const visible = nodes.filter((node) => !node.hidden);
  const byParent = new Map();
  visible.forEach((node) => {
    const key = node.parentId || "root";
    byParent.set(key, [...(byParent.get(key) || []), node]);
  });
  const result = [];
  const visit = (parentId, depth, path) => {
    (byParent.get(parentId) || []).forEach((node) => {
      const nextPath = [...path, node];
      result.push({ node, depth, path: nextPath });
      visit(node.id, depth + 1, nextPath);
    });
  };
  visit("root", 0, []);
  const included = new Set(result.map(({ node }) => node.id));
  visible
    .filter((node) => !included.has(node.id))
    .forEach((node) => result.push({ node, depth: 0, path: [node] }));
  return result;
}

function GraphTable({ page, selectedIds, setSelectedIds, onOpenNode }) {
  const rows = flattenTree(page.nodes);
  const pageSize = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const visibleRows = rows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  useEffect(() => setCurrentPage(1), [page.id]);
  return (
    <HierarchyTable
      rows={visibleRows.map((row) => ({ ...row, id: row.node.id }))}
      columns={[
        {
          key: "type",
          label: "类型",
          render: ({ node }) => nodeKindLabel[node.kind],
        },
        {
          key: "status",
          label: "关联状态",
          render: ({ node }) =>
            node.status === "review" ? (
              <StatusBadge tone="warning">待确认</StatusBadge>
            ) : node.assetPath ? (
              <StatusBadge tone="success">已关联资产</StatusBadge>
            ) : (
              <StatusBadge tone="neutral">图谱本地</StatusBadge>
            ),
        },
        {
          key: "summary",
          label: "内容摘要",
          render: ({ node }) => (
            <TooltipText tip={node.summary} clampLines={2}>
              {node.summary || "—"}
            </TooltipText>
          ),
        },
        {
          key: "source",
          label: "来源",
          render: ({ node }) => node.evidence?.[0] || "用户维护",
        },
        {
          key: "action",
          label: "操作",
          render: ({ node }) => (
            <Button size="xs" onClick={() => onOpenNode(node)}>
              查看
            </Button>
          ),
        },
      ]}
      page={currentPage}
      pages={pageCount}
      pageSize={pageSize}
      totalLabel={`共 ${rows.length} 个节点`}
      onPageChange={setCurrentPage}
      rowClassName={({ node }) =>
        selectedIds.includes(node.id) ? "is-selected" : ""
      }
      renderLevel={(node) => (
        <button
          type="button"
          className="tg-table-node"
          onClick={() => {
            setSelectedIds([node.id]);
            onOpenNode(node);
          }}
        >
          <Icon
            name={
              node.kind === "person"
                ? "user"
                : node.kind === "company"
                  ? "building"
                  : "route"
            }
          />
          <span>
            <b>{node.label}</b>
            <small>{node.subtitle}</small>
          </span>
        </button>
      )}
      scrollLabel="横向滚动图谱层级表格"
      testId="topic-graph-table-scroll"
    />
  );
}

function GraphDetailPanel({
  page,
  node,
  relation,
  navigate,
  onEditRelation,
  onEvidence,
  onHide,
  onDelete,
  onDeleteRelation,
  onRestoreRelation,
  onClose,
  readOnly = false,
}) {
  if (!node && !relation) {
    return (
      <aside className="tg-detail-panel is-empty">
        <button
          type="button"
          className="tg-detail-close"
          aria-label="关闭详情"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
        <Icon name="route" />
        <h3>选择节点或关系</h3>
        <p>查看关联资产、来源证据、关系所有者和当前图页中的本地信息。</p>
      </aside>
    );
  }
  if (relation) {
    const source = page.nodes.find((item) => item.id === relation.source);
    const target = page.nodes.find((item) => item.id === relation.target);
    return (
      <aside className="tg-detail-panel">
        <button
          type="button"
          className="tg-detail-close"
          aria-label="关闭详情"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
        <header>
          <span>
            <small>{relationKindLabel[relation.kind]}</small>
            <h3>{relation.label || "未命名关系"}</h3>
          </span>
          <StatusBadge tone={relation.status === "review" ? "warning" : "info"}>
            {relation.status === "review" ? "待确认" : "有效"}
          </StatusBadge>
        </header>
        <dl>
          <div>
            <dt>起点</dt>
            <dd>{source?.label}</dd>
          </div>
          <div>
            <dt>终点</dt>
            <dd>{target?.label}</dd>
          </div>
          <div>
            <dt>显示名称</dt>
            <dd>{relation.label || "未命名"}</dd>
          </div>
          <div>
            <dt>数据所有者</dt>
            <dd>
              {relation.kind === "local"
                ? "当前图页"
                : relation.kind === "derived"
                  ? "来源业务记录"
                  : relation.kind === "shared"
                    ? "共享关系事实"
                    : "分析展示层"}
            </dd>
          </div>
        </dl>
        <section>
          <h4>证据</h4>
          {relation.evidence?.length ? (
            relation.evidence.map((item) => (
              <button type="button" key={item} onClick={() => onEvidence(item)}>
                {item}
                <Icon name="chevronRight" />
              </button>
            ))
          ) : (
            <p>当前只有原文件结构连接，没有业务关系证据。</p>
          )}
        </section>
        {!readOnly ? (
          <footer>
            <Button
              size="sm"
              icon="edit"
              onClick={() => onEditRelation(relation)}
            >
              编辑关系
            </Button>
            <Button size="sm" onClick={() => onRestoreRelation(relation)}>
              隐藏当前图页关系
            </Button>
            <Button
              size="sm"
              tone="danger"
              icon="trash"
              onClick={() => onDeleteRelation(relation)}
            >
              删除关系
            </Button>
          </footer>
        ) : null}
      </aside>
    );
  }
  return (
    <aside className="tg-detail-panel">
      <button
        type="button"
        className="tg-detail-close"
        aria-label="关闭详情"
        onClick={onClose}
      >
        <Icon name="close" />
      </button>
      <header>
        <span>
          <small>
            {nodeKindLabel[node.kind]} ·{" "}
            {node.sourceType === "local"
              ? "图谱本地"
              : node.sourceType === "asset"
                ? "正式资产引用"
                : node.sourceType === "derived"
                  ? "来源派生"
                  : "分析展示层"}
          </small>
          <h3>{node.label}</h3>
          <p>{node.subtitle}</p>
        </span>
        {node.status === "review" ? (
          <StatusBadge tone="warning">待确认</StatusBadge>
        ) : null}
      </header>
      <section>
        <h4>当前图页说明</h4>
        <p>{node.summary || "尚未补充说明。"}</p>
      </section>
      <section>
        <h4>来源与证据</h4>
        {node.evidence?.length ? (
          node.evidence.map((item) => (
            <button type="button" key={item} onClick={() => onEvidence(item)}>
              {item}
              <Icon name="chevronRight" />
            </button>
          ))
        ) : (
          <p>用户手动创建，暂无外部证据。</p>
        )}
      </section>
      {readOnly ? (
        <div className="tg-asset-reference">
          <Icon name="clock" />
          <span>
            <b>
              {node.assetPath
                ? `当时引用${node.assetType}`
                : "当时为图谱本地节点"}
            </b>
            <small>这里只展示该版本保存时的节点与关系信息</small>
          </span>
        </div>
      ) : node.assetPath ? (
        <div className="tg-asset-reference">
          <Icon name="link" />
          <span>
            <b>已关联{node.assetType}</b>
            <small>正式资料变化会自动同步到当前节点</small>
          </span>
          <Button size="xs" onClick={() => navigate(node.assetPath)}>
            打开详情
          </Button>
        </div>
      ) : (
        <div className="tg-asset-reference is-unlinked">
          <Icon name="link" />
          <span>
            <b>未关联正式资产</b>
            <small>可以保留自由节点或关联已有资产</small>
          </span>
        </div>
      )}
      {!readOnly ? (
        <footer>
          <Button size="sm" onClick={() => onHide(node)}>
            隐藏节点
          </Button>
          <Button
            size="sm"
            tone="danger"
            icon="trash"
            onClick={() => onDelete(node)}
          >
            删除节点
          </Button>
        </footer>
      ) : null}
    </aside>
  );
}

function NodeEditor({ open, node, pages, close, onSave, onCreateAsset }) {
  const [label, setLabel] = useState(node?.label || "");
  const [subtitle, setSubtitle] = useState(node?.subtitle || "");
  const [summary, setSummary] = useState(node?.summary || "");
  const [kind, setKind] = useState(node?.kind || "note");
  const [unlinkAsset, setUnlinkAsset] = useState(false);
  useEffect(() => {
    setLabel(node?.label || "");
    setSubtitle(node?.subtitle || "");
    setSummary(node?.summary || "");
    setKind(node?.kind || "note");
    setUnlinkAsset(false);
  }, [node, open]);
  return (
    <Modal
      open={open}
      close={close}
      size="lg"
      title={node?.id ? "编辑节点" : "添加节点"}
      description="本地标题、备注和层级只影响当前图页，不覆盖关联资产资料。"
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button
            tone="primary"
            disabled={!label.trim()}
            onClick={() =>
              onSave({
                ...(node || {}),
                label: label.trim(),
                subtitle: subtitle.trim(),
                summary: summary.trim(),
                kind,
                ...(unlinkAsset
                  ? {
                      assetPath: undefined,
                      assetType: undefined,
                      sourceType: "local",
                    }
                  : {}),
              })
            }
          >
            {node?.id ? "保存修改" : "添加节点"}
          </Button>
        </>
      }
    >
      <div className="s4-form-grid">
        <FormField label="节点名称" required>
          <TextInput value={label} onChange={setLabel} />
        </FormField>
        <FormField label="节点类型">
          <SelectMenu
            label="选择类型"
            value={nodeKindLabel[kind] || "自由节点"}
            options={["自由节点", "公司", "组织", "人物", "岗位", "分组"]}
            onChange={(value) =>
              setKind(
                Object.entries(nodeKindLabel).find(
                  ([, label]) => label === value,
                )?.[0] || "note",
              )
            }
          />
        </FormField>
        <FormField label="副标题" span={2}>
          <TextInput
            value={subtitle}
            onChange={setSubtitle}
            placeholder="例如：VLA 算法负责人"
          />
        </FormField>
        <FormField label="本图备注" span={2}>
          <TextArea value={summary} onChange={setSummary} rows={4} />
        </FormField>
      </div>
      {node?.assetPath && !unlinkAsset ? (
        <div className="tg-editor-asset">
          <span>
            <Icon name="link" />
            <span>
              <b>已关联{node.assetType}</b>
              <small>{node.label} · 正式资料会自动同步</small>
            </span>
          </span>
          <Button size="sm" onClick={() => setUnlinkAsset(true)}>
            解除关联
          </Button>
        </div>
      ) : (
        <div className="tg-editor-asset">
          <span>
            <Icon name="link" />
            <span>
              <b>{unlinkAsset ? "将转为图谱本地节点" : "关联正式资产"}</b>
              <small>
                {unlinkAsset
                  ? "保存后不再自动同步原资产；节点内容仍保留在当前图页"
                  : "搜索候选人、公司、岗位、联系人、论文或专利"}
              </small>
            </span>
          </span>
          {unlinkAsset ? (
            <Button size="sm" onClick={() => setUnlinkAsset(false)}>
              撤销
            </Button>
          ) : (
            <Button size="sm" onClick={onCreateAsset}>
              选择资产
            </Button>
          )}
        </div>
      )}
      {pages?.length ? (
        <p className="tg-editor-hint">
          同一正式资产允许在不同图页或不同层级创建独立节点实例。
        </p>
      ) : null}
    </Modal>
  );
}

function AssetLinkDialog({ open, close, onSelect }) {
  const [query, setQuery] = useState("");
  const options = [
    [
      "candidate-zhaoxingyu",
      "赵星羽",
      "候选人 · 星澜机器人 VLA 算法负责人",
      "/candidates/candidate-zhaoxingyu",
    ],
    [
      "candidate-linhao",
      "林昊",
      "候选人 · 拓界机器人学习负责人",
      "/candidates/candidate-linhao",
    ],
    [
      "company-xinglan",
      "星澜机器人",
      "公司 · 具身智能",
      "/companies/company-xinglan",
    ],
    [
      "position-vla",
      "具身智能 VLA 算法负责人",
      "岗位 · 星澜机器人",
      "/positions/position-vla",
    ],
  ].filter((item) => item.slice(1).join(" ").includes(query));
  return (
    <Modal
      open={open}
      close={close}
      size="lg"
      title="关联正式资产"
      description="只有充分证据对应同一对象时才建立关联；仅姓名相同不会自动关联。"
      footer={<Button onClick={close}>取消</Button>}
    >
      <div className="tg-asset-picker-search">
        <Icon name="search" />
        <input
          aria-label="搜索正式资产"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索姓名、公司或岗位"
        />
      </div>
      <div className="tg-asset-picker-list">
        {options.map(([id, title, meta, path]) => (
          <button
            type="button"
            key={id}
            onClick={() => onSelect({ id, title, meta, path })}
          >
            <Icon
              name={
                id.startsWith("company")
                  ? "building"
                  : id.startsWith("position")
                    ? "briefcase"
                    : "user"
              }
            />
            <span>
              <b>{title}</b>
              <small>{meta}</small>
            </span>
            <Icon name="chevronRight" />
          </button>
        ))}
      </div>
      <div className="tg-asset-create-links">
        <span>
          <b>系统中还没有这个对象？</b>
          <small>在新标签页创建正式资产，完成后返回这里重新搜索。</small>
        </span>
        <div>
          <a href="#/candidates/new" target="_blank" rel="noreferrer">
            新建候选人
          </a>
          <a href="#/companies/new" target="_blank" rel="noreferrer">
            新建公司
          </a>
          <a href="#/positions/new" target="_blank" rel="noreferrer">
            新建岗位
          </a>
          <a href="#/contacts/new" target="_blank" rel="noreferrer">
            新建联系人
          </a>
        </div>
      </div>
    </Modal>
  );
}

function RelationEditor({ open, relation, page, close, onSave }) {
  const sourceNode = page.nodes.find((node) => node.id === relation?.source);
  const targetNode = page.nodes.find((node) => node.id === relation?.target);
  const [source, setSource] = useState(
    sourceNode?.label || page.nodes[0]?.label || "",
  );
  const [target, setTarget] = useState(
    targetNode?.label || page.nodes[1]?.label || "",
  );
  const [label, setLabel] = useState(relation?.label || "");
  useEffect(() => {
    setSource(sourceNode?.label || page.nodes[0]?.label || "");
    setTarget(targetNode?.label || page.nodes[1]?.label || "");
    setLabel(relation?.label || "");
  }, [open, relation?.id, page.id]);
  return (
    <Modal
      open={open}
      close={close}
      size="lg"
      title={relation?.id ? "编辑关系" : "添加关系"}
      description={
        relation?.id
          ? "起点和终点创建后不可修改；关系名称可以留空。"
          : "选择两个节点建立连接，关系名称可以稍后补充。"
      }
      footer={
        <>
          <Button onClick={close}>取消</Button>
          <Button
            tone="primary"
            disabled={source === target}
            onClick={() => onSave({ id: relation?.id, source, target, label })}
          >
            {relation?.id ? "保存关系" : "添加关系"}
          </Button>
        </>
      }
    >
      <div className="s4-form-grid">
        {relation?.id ? (
          <div className="tg-relation-endpoints">
            <span>
              <small>起点</small>
              <b>{source}</b>
            </span>
            <Icon name="chevronRight" />
            <span>
              <small>终点</small>
              <b>{target}</b>
            </span>
          </div>
        ) : (
          <>
            <FormField label="起点" required>
              <SelectMenu
                label="选择起点"
                value={source}
                options={page.nodes
                  .filter((node) => !node.hidden)
                  .map((node) => node.label)}
                searchable
                onChange={setSource}
              />
            </FormField>
            <FormField label="终点" required>
              <SelectMenu
                label="选择终点"
                value={target}
                options={page.nodes
                  .filter((node) => !node.hidden)
                  .map((node) => node.label)}
                searchable
                onChange={setTarget}
              />
            </FormField>
          </>
        )}
        <FormField label="关系名称" span={2}>
          <TextInput
            value={label}
            onChange={setLabel}
            placeholder="例如：汇报给、前同事、合作"
          />
        </FormField>
      </div>
    </Modal>
  );
}

function HiddenContentPanel({ pages, close, onRestore }) {
  const hidden = pages.flatMap((page) =>
    page.nodes.filter((node) => node.hidden).map((node) => ({ page, node })),
  );
  return (
    <aside className="tg-overlay-panel tg-hidden-panel">
      <header>
        <span>
          <small>当前知识图谱</small>
          <h2>隐藏内容</h2>
        </span>
        <button type="button" aria-label="关闭隐藏内容" onClick={close}>
          <Icon name="close" />
        </button>
      </header>
      <p>
        隐藏只影响当前图页，不删除正式资产和底层关系。隐藏节点不会出现在普通图谱搜索中。
      </p>
      {hidden.length ? (
        <div>
          {hidden.map(({ page, node }) => (
            <article key={`${page.id}-${node.id}`}>
              <span>
                <small>{page.name}</small>
                <b>{node.label}</b>
                <p>{node.hiddenReason || "用户从当前图页隐藏"}</p>
              </span>
              <Button size="sm" onClick={() => onRestore(page.id, node.id)}>
                恢复
              </Button>
            </article>
          ))}
        </div>
      ) : (
        <div className="tg-panel-empty">
          <Icon name="check" />
          <b>没有隐藏内容</b>
        </div>
      )}
    </aside>
  );
}

function ImportGraphPage({ open, close, onImported, scenario = "" }) {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [smart, setSmart] = useState(true);
  const [duplicateMode, setDuplicateMode] = useState("rename");
  const useDemo = () =>
    setFiles([{ name: "星澜机器人组织架构.mm", size: 24812 }]);
  useEffect(() => {
    if (!open) {
      setStep(1);
      setFiles([]);
      setSmart(true);
      return;
    }
    if (scenario === "multi-root" || scenario === "partial") {
      setFiles([{ name: "机器人产业关系.xlsx", size: 43124 }]);
      setStep(2);
    }
  }, [open, scenario]);
  const validationError =
    scenario === "unsupported"
      ? {
          title: "不支持该文件格式",
          description:
            "请选择 XLSX、MM、FreeMind、OPML、XMind、Markdown 或 JSON 文件；当前文件没有被导入。",
        }
      : scenario === "corrupt"
        ? {
            title: "文件无法读取",
            description:
              "文件可能已损坏或内容不完整。当前知识图谱没有产生任何半成品图页。",
          }
        : null;
  return (
    <Modal
      open={open}
      close={close}
      size="xl"
      title={
        step === 1 ? "导入图页" : step === 2 ? "确认图页结构" : "图页已导入"
      }
      description={
        step === 1
          ? "文件只会在当前知识图谱中创建图页。"
          : step === 2
            ? "结构先落地；智能分析在导入后继续运行。"
            : "可以立即查看图页，智能分析不会阻塞使用。"
      }
      footer={
        step === 1 ? (
          <>
            <Button onClick={close}>取消</Button>
            <Button
              tone="primary"
              disabled={!files.length || Boolean(validationError)}
              onClick={() => setStep(2)}
            >
              校验并预览
            </Button>
          </>
        ) : step === 2 ? (
          <>
            <Button onClick={() => setStep(1)}>上一步</Button>
            <Button
              tone="primary"
              onClick={() => {
                setStep(3);
                onImported({ smart });
              }}
            >
              确认导入
            </Button>
          </>
        ) : (
          <Button tone="primary" onClick={close}>
            查看图页
          </Button>
        )
      }
    >
      {step === 1 ? (
        <div className="tg-import-step">
          <FileDrop
            files={files}
            onFiles={setFiles}
            accept="XLSX、MM、FreeMind、OPML、XMind、Markdown、JSON"
            multiple={false}
          />
          <button type="button" className="tg-demo-file" onClick={useDemo}>
            <Icon name="file" />
            <span>
              <b>使用演示文件验收</b>
              <small>星澜机器人组织架构.mm · 24 KB</small>
            </span>
          </button>
          <p>格式校验失败、文件损坏或无法识别根结构时不会产生半成品图页。</p>
          {validationError ? (
            <StateBanner
              tone="danger"
              icon="warning"
              title={validationError.title}
              description={validationError.description}
            />
          ) : null}
        </div>
      ) : null}
      {step === 2 ? (
        <div className="tg-import-preview">
          <section>
            <header>
              <span>
                <small>结构预览</small>
                <h3>星澜机器人组织架构</h3>
              </span>
              <StatusBadge tone="success">格式校验通过</StatusBadge>
            </header>
            {scenario === "multi-root" ? (
              <div className="tg-import-groups">
                <StateBanner
                  tone="warning"
                  icon="warning"
                  title="文件中没有共同的第一层结构"
                  description="系统识别出 3 组互不隶属的内容。本次会在当前知识图谱中分别创建 3 个图页，不会强行给它们增加同一个父节点。"
                />
                <div className="tg-import-group-preview">
                  {[
                    [
                      "星澜机器人组织",
                      "星澜机器人 → 具身智能中心 → VLA 算法组",
                      "10 个节点 · 9 条连线",
                    ],
                    [
                      "具身智能产业链",
                      "上游供应商 → 核心厂商 → 场景客户",
                      "5 个节点 · 4 条连线",
                    ],
                    [
                      "核心人物关系",
                      "关键人物 → 合作人 → 共同成果",
                      "3 个节点 · 4 条连线",
                    ],
                  ].map(([name, structure, meta], index) => (
                    <article key={name}>
                      <i>{index + 1}</i>
                      <span>
                        <small>将新建图页</small>
                        <b>{name}</b>
                        <p>{structure}</p>
                      </span>
                      <em>{meta}</em>
                    </article>
                  ))}
                </div>
                <p className="tg-import-groups-result">
                  导入后可以分别维护这 3
                  个图页；如果它们之间确实存在关系，再由用户手动连线或让 AI
                  提出关系建议。
                </p>
              </div>
            ) : null}
            {scenario === "partial" ? (
              <StateBanner
                tone="warning"
                icon="warning"
                title="2 个节点只能保留原文"
                description="其余 16 个节点已完整解析；无法识别的内容会以自由节点保留并标记待确认。"
              />
            ) : null}
            {scenario !== "multi-root" ? (
              <div className="tg-import-tree">
                <b>星澜机器人</b>
                <span>具身智能中心</span>
                <span className="is-child">VLA 算法组 · 8 个节点</span>
                <span className="is-child">机器人学习组 · 6 个节点</span>
              </div>
            ) : null}
            <dl>
              <div>
                <dt>
                  {scenario === "multi-root" ? "将创建图页" : "顶层内容组"}
                </dt>
                <dd>{scenario === "multi-root" ? "3 个" : 1}</dd>
              </div>
              <div>
                <dt>节点</dt>
                <dd>18</dd>
              </div>
              <div>
                <dt>连线</dt>
                <dd>17</dd>
              </div>
              <div>
                <dt>无标签连线</dt>
                <dd>5</dd>
              </div>
            </dl>
          </section>
          <aside>
            <div className="tg-duplicate-box">
              <Icon name="warning" />
              <span>
                <b>发现同名图页</b>
                <p>当前图谱已经有“星澜机器人组织”。</p>
              </span>
            </div>
            <div className="tg-radio-stack">
              {[
                ["rename", "保留两个图页", "新图页命名为“星澜机器人组织（2）”"],
                ["replace", "替换现有图页", "原图页进入当前图谱的版本历史"],
              ].map(([value, title, detail]) => (
                <button
                  type="button"
                  key={value}
                  className={duplicateMode === value ? "is-active" : ""}
                  onClick={() => setDuplicateMode(value)}
                >
                  <i>{duplicateMode === value ? <span /> : null}</i>
                  <span>
                    <b>{title}</b>
                    <small>{detail}</small>
                  </span>
                </button>
              ))}
            </div>
            <CustomCheckbox
              checked={smart}
              onChange={setSmart}
              label="智能分析节点与连线关系"
              description="导入后识别可能的资产和业务关系；只依据图形结构的判断保留为建议。"
            />
          </aside>
        </div>
      ) : null}
      {step === 3 ? (
        <div className="tg-import-complete">
          <i>
            <Icon name="check" />
          </i>
          <h3>图页已经可以查看</h3>
          <p>
            18 个节点和 17 条连线已完整写入。
            {smart
              ? "智能分析正在后台处理，当前已完成 4 / 18 个节点。"
              : "本次没有启动智能分析。"}
          </p>
          <div>
            <StatusBadge tone="success">结构已保存</StatusBadge>
            {smart ? <StatusBadge tone="info">分析中</StatusBadge> : null}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

function AnalysisProgress({ state, onPause, onResume, onReview }) {
  const paused = state === "paused";
  const failed = state === "failed";
  return (
    <div className={`tg-analysis-banner ${failed ? "is-failed" : ""}`}>
      <span className="tg-analysis-icon">
        <Icon name={failed ? "warning" : paused ? "pause" : "sparkles"} />
      </span>
      <span>
        <small>导入处理记录 · 不进入任务列表</small>
        <b>
          {failed
            ? "智能分析未完成"
            : paused
              ? "智能分析已暂停"
              : "正在分析节点与连线关系"}
        </b>
        <p>
          {failed
            ? "图页结构和已完成结果均已保留；可以重新分析或先审核已经产生的 2 项建议。"
            : paused
              ? "已完成内容和图页结构均已保留，可以稍后继续。"
              : "正在核对人物身份与组织关系 · 已处理 12 / 18 个节点、9 / 17 条连线"}
        </p>
      </span>
      {!failed ? (
        <div className="tg-analysis-meter">
          <i
            style={{
              transform: `scaleX(${paused ? 0.58 : 0.72})`,
            }}
          />
        </div>
      ) : null}
      <Button size="sm" onClick={paused || failed ? onResume : onPause}>
        {failed ? "重新分析" : paused ? "继续分析" : "暂停"}
      </Button>
      <Button size="sm" onClick={onReview}>
        查看分析结果
      </Button>
    </div>
  );
}

function GraphAiWorkspace({ page, close, onApply }) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <section className="tg-ai-workspace">
      <header>
        <button type="button" onClick={close}>
          <Icon name="chevronLeft" />
          返回知识图谱
        </button>
        <span>
          <small>资产内 AI 协作 · 不进入任务列表</small>
          <h2>整理“{page.name}”</h2>
        </span>
        <StatusBadge tone="info">预览中</StatusBadge>
      </header>
      <div className="tg-ai-layout">
        <section className="tg-ai-conversation">
          <div className="tg-ai-message is-user">
            <p>
              结合知识图谱中已经确认的公司、候选人和论文关系，补齐 VLA
              算法组最近加入的核心成员，并整理与岗位人才池的关系。
            </p>
          </div>
          <div className="tg-ai-reply">
            <h3>我会在当前图页内完成增量整理</h3>
            <p>
              本次只处理已经存在稳定证据的成员和直接关系，不会沿新节点继续无限展开外围网络。
            </p>
            <ul>
              <li>读取当前图页节点和已关联资产</li>
              <li>核对近期任职变化与论文作者关系</li>
              <li>生成节点和关系差异，等待确认后写入</li>
            </ul>
          </div>
          {sent ? (
            <>
              <div className="tg-ai-message is-user">
                <p>
                  {message ||
                    "只保留能够追溯到正式候选人或论文作者记录的变化。"}
                </p>
              </div>
              <div className="tg-ai-reply">
                <h3>已根据补充要求收紧结果</h3>
                <p>
                  已移除 1 条仅来自会议合影的弱关系，保留 2
                  个有稳定来源的新节点。
                </p>
              </div>
            </>
          ) : null}
          <div className="tg-ai-plan">
            <header>
              <b>执行计划</b>
              <small>3 / 4</small>
            </header>
            {[
              "读取当前图页与正式资产",
              "核对来源和身份",
              "生成图谱差异",
              "等待确认后写入",
            ].map((item, index) => (
              <div key={item} className={index < 3 ? "is-done" : "is-waiting"}>
                <Icon name={index < 3 ? "check" : "clock"} />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="tg-ai-composer">
            <textarea
              aria-label="补充要求"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="补充文字、链接或文件要求…"
              rows={2}
            />
            <button
              type="button"
              aria-label="发送"
              onClick={() => setSent(true)}
              disabled={!message.trim()}
            >
              <Icon name="send" />
            </button>
          </div>
        </section>
        <aside className="tg-ai-preview">
          <header>
            <span>
              <small>待写入当前图页</small>
              <h3>4 项图谱变化</h3>
            </span>
            <StatusBadge tone="warning">尚未写入</StatusBadge>
          </header>
          <div className="tg-ai-diff-item is-add">
            <span>
              <b>新增人物节点</b>
              <small>何静 · 强化学习研究员</small>
            </span>
            <em>正式资产引用</em>
          </div>
          <div className="tg-ai-diff-item is-add">
            <span>
              <b>新增人物节点</b>
              <small>孙若凡 · VLA 算法工程师</small>
            </span>
            <em>自由节点</em>
          </div>
          <div className="tg-ai-diff-item">
            <span>
              <b>新增关系</b>
              <small>何静 → VLA 算法组 · 共同作者</small>
            </span>
            <em>来源派生</em>
          </div>
          <div className="tg-ai-diff-item is-review">
            <span>
              <b>待确认关系</b>
              <small>孙若凡 → 星澜机器人 · 疑似任职</small>
            </span>
            <em>分析展示层</em>
          </div>
          <section>
            <h4>写入边界</h4>
            <p>
              已确认的来源关系直接同步；疑似任职只进入图谱分析层和待处理事项，不参与正式统计。
            </p>
          </section>
          <footer>
            <Button onClick={close}>暂不应用</Button>
            <Button tone="primary" onClick={onApply}>
              应用可信变化
            </Button>
          </footer>
        </aside>
      </div>
    </section>
  );
}

function GraphReviewWorkspace({ pages, onLocate, onResolve }) {
  const [items, setItems] = useState(graphReviewItems);
  const [selectedId, setSelectedId] = useState(items[0]?.id);
  const [evidencePreview, setEvidencePreview] = useState(null);
  const { isFullscreen, toggleFullscreen } = useCanvasFullscreen();
  const selected = items.find((item) => item.id === selectedId) || items[0];
  const page = pages.find((item) => item.id === selected?.pageId) || pages[0];
  useEffect(() => {
    if (selected) onLocate(selected.pageId, selected.nodeId);
  }, [selectedId]);
  const resolve = (action) => {
    const current = selected;
    setItems((list) => list.filter((item) => item.id !== current.id));
    const remaining = items.filter((item) => item.id !== current.id);
    setSelectedId(remaining[0]?.id);
    onResolve(action, current);
  };
  if (!selected)
    return (
      <div className="tg-review-empty">
        <Icon name="check" />
        <h2>全部待处理事项已完成</h2>
        <p>图上标记、通知和待处理数量已经同步更新。</p>
      </div>
    );
  return (
    <section
      className={`tg-review-workspace ${isFullscreen ? "is-fullscreen" : ""}`}
    >
      <aside className="tg-review-list">
        <header>
          <span>
            <small>分析审核模式</small>
            <h2>待处理事项</h2>
          </span>
          <StatusBadge tone="warning">{items.length}</StatusBadge>
        </header>
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            className={selected.id === item.id ? "is-active" : ""}
            onClick={() => setSelectedId(item.id)}
          >
            <span>
              <small>
                {item.type} ·{" "}
                {pages.find((page) => page.id === item.pageId)?.name}
              </small>
              <b>{item.title}</b>
              <p>{item.summary}</p>
            </span>
            <Icon name="chevronRight" />
          </button>
        ))}
      </aside>
      <div className="tg-review-canvas">
        <header>
          <span>
            <small>对应图页</small>
            <b>{page.name}</b>
          </span>
          <span className="tg-review-location-state">
            <i className="is-review" />
            待确认内容已定位
          </span>
          <button
            type="button"
            className="tg-review-fullscreen-button"
            aria-label={isFullscreen ? "退出审核画布全屏" : "进入审核画布全屏"}
            onClick={toggleFullscreen}
          >
            <Icon name={isFullscreen ? "minimize" : "maximize"} />
          </button>
        </header>
        <GraphCanvas
          page={page}
          selectedIds={[selected.nodeId]}
          setSelectedIds={() => {}}
          selectedEdgeId={null}
          setSelectedEdgeId={() => {}}
          onNodesChange={() => {}}
          collapsed={new Set()}
          setCollapsed={() => {}}
          zoom={0.72}
          focusNodeId={selected.nodeId}
          onContextMenu={() => {}}
          reviewMode
        />
      </div>
      <aside className="tg-review-detail">
        <header>
          <small>{selected.type}</small>
          <h2>{selected.title}</h2>
          <p>{selected.summary}</p>
        </header>
        <section>
          <h3>AI 建议</h3>
          <p>{selected.suggestion}</p>
        </section>
        <section>
          <h3>节点与候选资产对比</h3>
          <dl>
            <div>
              <dt>图中名称</dt>
              <dd>
                {page.nodes.find((node) => node.id === selected.nodeId)?.label}
              </dd>
            </div>
            <div>
              <dt>图中上下文</dt>
              <dd>
                {
                  page.nodes.find((node) => node.id === selected.nodeId)
                    ?.subtitle
                }
              </dd>
            </div>
            <div>
              <dt>候选资产</dt>
              <dd>
                {selected.id === "review-wang"
                  ? "王奕 · 上海 · 机器人学习研究员"
                  : selected.id === "review-import"
                    ? "何静 · 杭州 · 强化学习算法"
                    : "暂无明确资产"}
              </dd>
            </div>
          </dl>
        </section>
        <section>
          <h3>证据</h3>
          {selected.evidence.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setEvidencePreview(item)}
            >
              {item}
              <Icon name="chevronRight" />
            </button>
          ))}
        </section>
        <footer>
          <Button onClick={() => resolve("ignore")}>忽略建议</Button>
          <Button onClick={() => resolve("local")}>作为本图备注保留</Button>
          <Button tone="primary" onClick={() => resolve("confirm")}>
            确认并同步到正式资料
          </Button>
        </footer>
      </aside>
      <EvidencePreviewModal
        evidence={evidencePreview}
        close={() => setEvidencePreview(null)}
      />
    </section>
  );
}

function GraphHistoryTab({ notify }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(graphHistory[0]);
  const [zoom, setZoom] = useState(0.72);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [focusNodeId, setFocusNodeId] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState(null);
  const { isFullscreen, toggleFullscreen } = useCanvasFullscreen();
  const previewPage = useMemo(
    () => ({
      ...initialGraphPages[0],
      name: `${initialGraphPages[0].name} · ${selected.version}`,
      nodes: initialGraphPages[0].nodes
        .filter((node, index) => {
          if (selected.version === "v12") return true;
          if (selected.version === "v11") return node.id !== "org-hejing";
          return index < Math.max(4, initialGraphPages[0].nodes.length - 3);
        })
        .map((node) => ({ ...node, status: "normal", marker: undefined })),
    }),
    [selected],
  );
  const selectedNode = previewPage.nodes.find(
    (node) => selectedIds.length === 1 && node.id === selectedIds[0],
  );
  const selectedRelation = previewPage.edges.find(
    (edge) => edge.id === selectedEdgeId,
  );
  const locateNode = (_pageId, nodeId) => {
    setSelectedIds([nodeId]);
    setSelectedEdgeId(null);
    setDetailOpen(true);
    setFocusNodeId(nodeId);
    window.setTimeout(() => setFocusNodeId(null), 1800);
  };
  useEffect(() => {
    setSelectedIds([]);
    setSelectedEdgeId(null);
    setDetailOpen(false);
    setFocusNodeId(null);
  }, [selected.id]);
  return (
    <div className="tg-history-layout is-previewing">
      <section>
        <header>
          <h2>图谱版本</h2>
          <p>版本只追溯图谱本地内容、布局和引用状态，不复制或回滚正式资产。</p>
        </header>
        {graphHistory.map((item) => (
          <button
            type="button"
            key={item.id}
            className={selected.id === item.id ? "is-active" : ""}
            onClick={() => setSelected(item)}
          >
            <span>
              <small>
                {item.version} · {item.time}
              </small>
              <b>{item.title}</b>
              <p>{item.summary}</p>
            </span>
            <StatusBadge tone={item.tone}>{item.actor}</StatusBadge>
          </button>
        ))}
      </section>
      <aside
        className={`is-history-preview ${isFullscreen ? "is-fullscreen" : ""}`}
      >
        <header>
          <span>
            <small>
              {selected.version} · {selected.time}
            </small>
            <h2>{selected.version} 当时视图</h2>
            <p>只读预览 · 节点位置、隐藏状态和本地图内关系均还原到该版本。</p>
          </span>
          <div className="tg-history-actions">
            <Button
              size="sm"
              onClick={() =>
                notify(
                  `已从 ${selected.version} 恢复图谱本地内容；正式资产没有回滚`,
                )
              }
            >
              恢复此版本
            </Button>
          </div>
        </header>
        <div className="tg-history-viewer-toolbar">
          <GraphSearch
            pages={[previewPage]}
            activePageId={previewPage.id}
            onLocate={locateNode}
          />
          <span>拖动画布平移，单击节点或连线查看详情</span>
          <div className="tg-zoom-controls">
            <button
              type="button"
              aria-label="缩小历史图谱"
              disabled={zoom <= 0.5}
              onClick={() =>
                setZoom((value) =>
                  Math.max(0.5, Number((value - 0.1).toFixed(1))),
                )
              }
            >
              <Icon name="minus" />
            </button>
            <button type="button" onClick={() => setZoom(0.72)}>
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              aria-label="放大历史图谱"
              disabled={zoom >= 1.5}
              onClick={() =>
                setZoom((value) =>
                  Math.min(1.5, Number((value + 0.1).toFixed(1))),
                )
              }
            >
              <Icon name="plus" />
            </button>
            <button
              type="button"
              aria-label={
                isFullscreen ? "退出历史画布全屏" : "进入历史画布全屏"
              }
              onClick={toggleFullscreen}
            >
              <Icon name={isFullscreen ? "minimize" : "maximize"} />
            </button>
          </div>
        </div>
        <div
          className={`tg-history-preview-workspace ${detailOpen ? "is-detail-open" : ""}`}
        >
          <div className="tg-history-preview-canvas">
            <GraphCanvas
              page={previewPage}
              selectedIds={selectedIds}
              setSelectedIds={(ids) => {
                setSelectedIds(ids);
                if (ids.length) setDetailOpen(true);
              }}
              selectedEdgeId={selectedEdgeId}
              setSelectedEdgeId={(id) => {
                setSelectedEdgeId(id);
                if (id) setDetailOpen(true);
              }}
              onNodesChange={() => {}}
              collapsed={new Set()}
              setCollapsed={() => {}}
              zoom={zoom}
              focusNodeId={focusNodeId}
              onContextMenu={() => {}}
              onZoom={setZoom}
              reviewMode
              allowPan
            />
          </div>
          {detailOpen ? (
            <GraphDetailPanel
              page={previewPage}
              node={selectedNode}
              relation={selectedRelation}
              navigate={navigate}
              onEvidence={setEvidencePreview}
              onClose={() => setDetailOpen(false)}
              readOnly
            />
          ) : null}
        </div>
        <details className="tg-history-summary">
          <summary>查看本版本变更摘要</summary>
          <div className="tg-version-diff">
            <article>
              <span className="is-add">
                <Icon name="plus" />
              </span>
              <span>
                <b>新增 2 个节点</b>
                <p>何静、孙若凡</p>
              </span>
            </article>
            <article>
              <span className="is-change">
                <Icon name="refresh" />
              </span>
              <span>
                <b>更新 4 条来源关系</b>
                <p>人岗匹配、论文作者和任职状态</p>
              </span>
            </article>
            <article>
              <span className="is-layout">
                <Icon name="route" />
              </span>
              <span>
                <b>保留用户布局</b>
                <p>自动新增节点放在相关团队附近，没有重排整图</p>
              </span>
            </article>
          </div>
          <StateBanner
            title="恢复不会改变正式业务数据"
            description="候选人资料、岗位流程、论文作者和共享关系继续保持当前状态；恢复后图谱会引用这些数据的最新值。"
          />
        </details>
        <EvidencePreviewModal
          evidence={evidencePreview}
          close={() => setEvidencePreview(null)}
        />
      </aside>
    </div>
  );
}

function GraphRelatedTab({ navigate }) {
  return (
    <div className="tg-related-layout">
      <section>
        <header>
          <h2>关联业务</h2>
          <p>知识图谱可以被任务和资产复用，但不会因为被引用而复制正式数据。</p>
        </header>
        {[
          [
            "briefcase",
            "具身智能 VLA 算法负责人",
            "岗位 · 人才梳理持续引用 18 个节点",
            "/positions/position-vla?tab=talent-map",
          ],
          [
            "task",
            "星澜机器人具身智能团队招聘",
            "任务 · 候选人审核中",
            "/tasks/position-vla",
          ],
          [
            "building",
            "星澜机器人",
            "公司 · 4 个图页引用",
            "/companies/company-xinglan?tab=mappings",
          ],
          [
            "user",
            "林昊",
            "候选人 · 3 个图页引用",
            "/candidates/candidate-linhao?tab=relations",
          ],
        ].map(([icon, title, meta, path]) => (
          <button type="button" key={title} onClick={() => navigate(path)}>
            <Icon name={icon} />
            <span>
              <b>{title}</b>
              <small>{meta}</small>
            </span>
            <Icon name="chevronRight" />
          </button>
        ))}
      </section>
      <aside>
        <h2>最近复用记录</h2>
        {[
          [
            "今天 11:06",
            "岗位人才梳理读取图谱",
            "生成 18 位当前候选人和 5 位人物线索",
          ],
          ["今天 09:52", "任务查询人物联系路径", "返回 3 条可解释路径"],
          ["昨天 18:36", "公司关系变化同步", "更新 2 个图页中的 4 条关系"],
        ].map(([time, title, detail]) => (
          <article key={title}>
            <small>{time}</small>
            <b>{title}</b>
            <p>{detail}</p>
          </article>
        ))}
      </aside>
    </div>
  );
}

function GraphContent({
  pages,
  setPages,
  activePageId,
  setActivePageId,
  params,
  setParams,
  notify,
}) {
  const navigate = useNavigate();
  const { isFullscreen, toggleFullscreen } = useCanvasFullscreen();
  const page = pages.find((item) => item.id === activePageId) || pages[0];
  const initialView = params.get("view") || "canvas";
  const [view, setView] = useState(initialView);
  const [selectedIds, setSelectedIds] = useState(
    [params.get("node") || page?.nodes[0]?.id].filter(Boolean),
  );
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(initialView === "canvas");
  const [connectionMode, setConnectionMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [focusNodeId, setFocusNodeId] = useState(null);
  const [collapsed, setCollapsed] = useState(new Set());
  const [contextMenu, setContextMenu] = useState(null);
  const [nodeEditor, setNodeEditor] = useState(null);
  const [assetPicker, setAssetPicker] = useState(false);
  const [relationEditor, setRelationEditor] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState(null);
  const [pageEditor, setPageEditor] = useState(null);
  const [pageDelete, setPageDelete] = useState(null);
  const [nodeDelete, setNodeDelete] = useState(null);
  const [relationDelete, setRelationDelete] = useState(null);
  const [analysisState, setAnalysisState] = useState(
    params.get("state") === "analyzing"
      ? "running"
      : params.get("state") === "analysis-error"
        ? "failed"
        : "idle",
  );
  const selectedNode = page?.nodes.find(
    (node) => selectedIds.length === 1 && node.id === selectedIds[0],
  );
  const selectedRelation = page?.edges.find(
    (edge) => edge.id === selectedEdgeId,
  );

  useEffect(() => {
    if (!page) return;
    const requestedNode = params.get("node");
    if (requestedNode && page.nodes.some((node) => node.id === requestedNode)) {
      setSelectedIds([requestedNode]);
      setFocusNodeId(requestedNode);
      window.setTimeout(() => setFocusNodeId(null), 1800);
      return;
    }
    if (!page.nodes.some((node) => selectedIds.includes(node.id)))
      setSelectedIds([page.nodes[0]?.id].filter(Boolean));
  }, [activePageId, params]);
  useEffect(() => {
    if (params.get("state") === "analyzing") setAnalysisState("running");
    if (params.get("state") === "analysis-error") setAnalysisState("failed");
  }, [params]);

  useEffect(() => {
    if (view !== "canvas") return undefined;
    const onKeyDown = (event) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.matches("input, textarea, select, [contenteditable='true']") ||
          target.closest("[role='dialog'], .s4-select-panel"))
      )
        return;
      if (event.key === "Tab" && selectedNode) {
        event.preventDefault();
        setNodeEditor({ parentId: selectedNode.id });
      } else if (event.key === "Enter" && selectedNode) {
        event.preventDefault();
        setNodeEditor({ parentId: selectedNode.parentId });
      } else if (
        (event.key === "e" || event.key === "E" || event.key === "F2") &&
        (selectedNode || selectedRelation)
      ) {
        event.preventDefault();
        if (selectedRelation) setRelationEditor(selectedRelation);
        else setNodeEditor(selectedNode);
      } else if (
        (event.key === "Delete" || event.key === "Backspace") &&
        (selectedNode || selectedRelation)
      ) {
        event.preventDefault();
        if (selectedRelation) setRelationDelete(selectedRelation);
        else setNodeDelete(selectedNode);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedNode, selectedRelation, view]);

  if (!page) return null;
  const updateActiveNodes = (updater) =>
    setPages((current) =>
      current.map((item) =>
        item.id === page.id
          ? {
              ...item,
              nodes:
                typeof updater === "function" ? updater(item.nodes) : updater,
            }
          : item,
      ),
    );
  const updateActiveEdges = (updater) =>
    setPages((current) =>
      current.map((item) =>
        item.id === page.id
          ? {
              ...item,
              edges:
                typeof updater === "function" ? updater(item.edges) : updater,
            }
          : item,
      ),
    );
  const createRelation = ({ source, target }) => {
    const existing = page.edges.some(
      (edge) =>
        !edge.hidden && edge.source === source && edge.target === target,
    );
    if (existing) {
      notify("这两个节点之间已经存在同方向连接");
      setConnectionMode(false);
      return;
    }
    const id = `edge-${Date.now()}`;
    updateActiveEdges((edges) => [
      ...edges,
      {
        id,
        source,
        target,
        label: "",
        kind: "local",
        status: "normal",
        evidence: ["用户维护"],
      },
    ]);
    setSelectedIds([]);
    setSelectedEdgeId(id);
    setDetailOpen(true);
    setConnectionMode(false);
    notify("连接已添加；双击连线可以补充关系名称");
  };
  const reparentNodes = (ids, parentId) => {
    const parent = page.nodes.find((node) => node.id === parentId);
    if (!parent) return;
    const movedNodes = page.nodes.filter((node) => ids.includes(node.id));
    const oldParentById = Object.fromEntries(
      movedNodes.map((node) => [node.id, node.parentId]),
    );
    updateActiveNodes((nodes) => {
      const desiredById = Object.fromEntries(
        ids.map((id, index) => [
          id,
          {
            x: parent.x + (parent.width || 180) + 92,
            y: parent.y + index * 88,
          },
        ]),
      );
      return placeMovedGraphNodes(nodes, ids, desiredById).map((node) =>
        ids.includes(node.id) ? { ...node, parentId } : node,
      );
    });
    updateActiveEdges((edges) => {
      const withoutOldHierarchy = edges.filter(
        (edge) =>
          !ids.some(
            (id) => edge.target === id && edge.source === oldParentById[id],
          ),
      );
      const existingPairs = new Set(
        withoutOldHierarchy.map((edge) => `${edge.source}:${edge.target}`),
      );
      const hierarchyEdges = ids
        .filter((id) => !existingPairs.has(`${parentId}:${id}`))
        .map((id, index) => ({
          id: `edge-reparent-${Date.now()}-${index}`,
          source: parentId,
          target: id,
          label: "",
          kind: "local",
          status: "normal",
          evidence: ["用户调整层级"],
        }));
      return [...withoutOldHierarchy, ...hierarchyEdges];
    });
    notify(
      `${movedNodes.map((node) => node.label).join("、")}已移动到“${parent.label}”下`,
    );
  };
  const selectNodes = (ids) => {
    setSelectedIds(ids);
    if (ids.length) setDetailOpen(true);
  };
  const selectRelation = (id) => {
    setSelectedEdgeId(id);
    if (id) setDetailOpen(true);
  };
  const changeView = (nextView) => {
    setView(nextView);
    setDetailOpen(false);
    setConnectionMode(false);
    updateParams(params, setParams, { view: nextView });
  };
  const locate = (pageId, nodeId) => {
    setActivePageId(pageId);
    updateParams(params, setParams, { page: pageId });
    setSelectedIds([nodeId]);
    setSelectedEdgeId(null);
    setFocusNodeId(nodeId);
    setCollapsed(new Set());
    window.setTimeout(() => setFocusNodeId(null), 1800);
  };
  const hideNode = (node) => {
    updateActiveNodes((nodes) =>
      nodes.map((item) =>
        item.id === node.id
          ? {
              ...item,
              hidden: true,
              hiddenReason: "用户从当前图页隐藏",
              excluded: true,
            }
          : item,
      ),
    );
    setSelectedIds([]);
    notify(`“${node.label}”已从当前图页隐藏，可在隐藏内容中恢复`);
  };
  const openContext = (payload) => {
    if (payload.action === "edit") {
      setNodeEditor(payload.node);
      return;
    }
    setContextMenu(payload);
  };

  return (
    <div className={`tg-content-shell ${isFullscreen ? "is-fullscreen" : ""}`}>
      {analysisState !== "idle" ? (
        <AnalysisProgress
          state={analysisState}
          onPause={() => setAnalysisState("paused")}
          onResume={() => setAnalysisState("running")}
          onReview={() =>
            updateParams(params, setParams, { tab: "reviews", panel: null })
          }
        />
      ) : null}
      <GraphPageStrip
        pages={pages}
        activeId={page.id}
        onSelect={(id) => {
          setActivePageId(id);
          updateParams(params, setParams, { page: id });
        }}
        onCreate={() => setPageEditor({ mode: "create", name: "" })}
        onEdit={(item) => {
          if (selectedRelation) setRelationEditor(selectedRelation);
          else if (selectedNode) setNodeEditor(selectedNode);
          else setPageEditor(item);
        }}
        onDelete={setPageDelete}
      />
      <div className="tg-graph-toolbar">
        <GraphSearch pages={pages} activePageId={page.id} onLocate={locate} />
        <div className="tg-view-switch" role="group" aria-label="展示方式">
          <button
            type="button"
            className={view === "canvas" ? "is-active" : ""}
            onClick={() => changeView("canvas")}
          >
            <Icon name="route" />
            画布
          </button>
          <button
            type="button"
            className={view === "table" ? "is-active" : ""}
            onClick={() => changeView("table")}
          >
            <Icon name="database" />
            层级表格
          </button>
        </div>
        <div className="tg-toolbar-divider" />
        {view === "canvas" ? (
          <div className="tg-zoom-controls">
            <button
              type="button"
              aria-label="缩小"
              onClick={() =>
                setZoom((value) =>
                  Math.max(0.5, Number((value - 0.1).toFixed(1))),
                )
              }
            >
              <Icon name="minus" />
            </button>
            <button type="button" onClick={() => setZoom(1)}>
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              aria-label="放大"
              onClick={() =>
                setZoom((value) =>
                  Math.min(1.5, Number((value + 0.1).toFixed(1))),
                )
              }
            >
              <Icon name="plus" />
            </button>
            <button
              type="button"
              aria-label="自适应全部内容"
              onClick={() => setZoom(0.76)}
            >
              <Icon name="maximize" />
            </button>
            <button
              type="button"
              aria-label={isFullscreen ? "退出图谱全屏" : "进入图谱全屏"}
              onClick={toggleFullscreen}
            >
              <Icon name={isFullscreen ? "minimize" : "maximize"} />
            </button>
          </div>
        ) : null}
        <button
          type="button"
          className="tg-toolbar-button"
          onClick={() =>
            setCollapsed(
              collapsed.size
                ? new Set()
                : new Set(
                    page.nodes
                      .filter((node) =>
                        page.nodes.some((child) => child.parentId === node.id),
                      )
                      .map((node) => node.id),
                  ),
            )
          }
        >
          <Icon name={collapsed.size ? "plus" : "minus"} />
          {collapsed.size ? "全部展开" : "全部收起"}
        </button>
        <button
          type="button"
          className="tg-toolbar-button"
          onClick={() => updateParams(params, setParams, { panel: "hidden" })}
        >
          <Icon name="folder" />
          隐藏内容
        </button>
        <button
          type="button"
          className={`tg-toolbar-button ${connectionMode ? "is-active" : ""}`}
          aria-pressed={connectionMode}
          onClick={() => {
            setConnectionMode((current) => !current);
            if (!connectionMode) notify("请从任一节点右侧连接点拖到目标节点");
          }}
        >
          <Icon name="link" />
          {connectionMode ? "退出连线" : "添加关系"}
        </button>
        <Button size="sm" icon="plus" onClick={() => setNodeEditor({})}>
          添加节点
        </Button>
      </div>
      {selectedIds.length > 1 ? (
        <div className="tg-batch-toolbar">
          <b>已选择 {selectedIds.length} 个节点</b>
          <span>拖动任一选中节点可批量移动</span>
          <Button size="xs" onClick={() => notify("已将选中节点加入同一分组")}>
            建立分组
          </Button>
          <Button
            size="xs"
            onClick={() => {
              selectedIds.forEach((id) => {
                const node = page.nodes.find((item) => item.id === id);
                if (node) hideNode(node);
              });
            }}
          >
            批量隐藏
          </Button>
          <button
            type="button"
            aria-label="取消多选"
            onClick={() => setSelectedIds([])}
          >
            <Icon name="close" />
          </button>
        </div>
      ) : null}
      <div
        className={`tg-graph-main ${view === "table" ? "is-table" : ""} ${detailOpen ? "" : "is-detail-closed"}`}
      >
        <div className="tg-graph-workarea">
          {view === "canvas" ? (
            <GraphCanvas
              page={page}
              selectedIds={selectedIds}
              setSelectedIds={selectNodes}
              selectedEdgeId={selectedEdgeId}
              setSelectedEdgeId={selectRelation}
              onNodesChange={updateActiveNodes}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              zoom={zoom}
              focusNodeId={focusNodeId}
              onContextMenu={openContext}
              onEditRelation={setRelationEditor}
              onCreateRelation={createRelation}
              onReparentNodes={reparentNodes}
              onZoom={setZoom}
              connectionMode={connectionMode}
            />
          ) : (
            <GraphTable
              page={page}
              selectedIds={selectedIds}
              setSelectedIds={selectNodes}
              onOpenNode={(node) => {
                setSelectedIds([node.id]);
                setDetailOpen(true);
              }}
            />
          )}
        </div>
        {detailOpen ? (
          <GraphDetailPanel
            page={page}
            node={selectedNode}
            relation={selectedRelation}
            navigate={navigate}
            onEditRelation={setRelationEditor}
            onEvidence={setEvidencePreview}
            onHide={hideNode}
            onDelete={setNodeDelete}
            onDeleteRelation={setRelationDelete}
            onClose={() => setDetailOpen(false)}
            onRestoreRelation={(relation) => {
              updateActiveEdges((edges) =>
                edges.map((item) =>
                  item.id === relation.id ? { ...item, hidden: true } : item,
                ),
              );
              setSelectedEdgeId(null);
              notify("关系已在当前图页隐藏，来源业务记录没有变化");
            }}
          />
        ) : null}
      </div>
      {contextMenu ? (
        <div
          className="tg-context-menu"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 230),
            top: Math.min(contextMenu.y, window.innerHeight - 320),
          }}
        >
          <header>
            <b>{contextMenu.node.label}</b>
            <button type="button" onClick={() => setContextMenu(null)}>
              <Icon name="close" />
            </button>
          </header>
          <button
            type="button"
            onClick={() => {
              setNodeEditor(contextMenu.node);
              setContextMenu(null);
            }}
          >
            <Icon name="edit" />
            编辑
          </button>
          <button
            type="button"
            onClick={() => {
              setNodeEditor({ parentId: contextMenu.node.id });
              setContextMenu(null);
            }}
          >
            <Icon name="plus" />
            添加子节点
          </button>
          <button
            type="button"
            onClick={() => {
              setAssetPicker(true);
              setNodeEditor(contextMenu.node);
              setContextMenu(null);
            }}
          >
            <Icon name="link" />
            关联正式资产
          </button>
          <button
            type="button"
            onClick={() => {
              hideNode(contextMenu.node);
              setContextMenu(null);
            }}
          >
            <Icon name="folder" />
            从当前图页隐藏
          </button>
          <button
            type="button"
            className="is-danger"
            onClick={() => {
              setNodeDelete(contextMenu.node);
              setContextMenu(null);
            }}
          >
            <Icon name="trash" />
            删除节点实例
          </button>
        </div>
      ) : null}
      <NodeEditor
        open={Boolean(nodeEditor)}
        node={nodeEditor}
        pages={pages}
        close={() => setNodeEditor(null)}
        onCreateAsset={() => setAssetPicker(true)}
        onSave={(next) => {
          if (next.id)
            updateActiveNodes((nodes) =>
              nodes.map((node) => (node.id === next.id ? next : node)),
            );
          else {
            const id = `local-${Date.now()}`;
            updateActiveNodes((nodes) => [
              ...nodes,
              {
                ...next,
                id,
                sourceType: "local",
                status: "normal",
                x: 520,
                y: 250,
                width: 180,
                evidence: [],
              },
            ]);
            setSelectedIds([id]);
          }
          setNodeEditor(null);
          notify(next.id ? "节点已更新并形成新版本" : "节点已添加");
        }}
      />
      <AssetLinkDialog
        open={assetPicker}
        close={() => setAssetPicker(false)}
        onSelect={(asset) => {
          if (nodeEditor?.id)
            updateActiveNodes((nodes) =>
              nodes.map((node) =>
                node.id === nodeEditor.id
                  ? {
                      ...node,
                      label: asset.title,
                      assetPath: asset.path,
                      assetType: asset.meta.split(" · ")[0],
                      sourceType: "asset",
                    }
                  : node,
              ),
            );
          else {
            const id = `asset-${Date.now()}`;
            updateActiveNodes((nodes) => [
              ...nodes,
              {
                id,
                label: asset.title,
                subtitle: asset.meta,
                kind: asset.id.startsWith("company")
                  ? "company"
                  : asset.id.startsWith("position")
                    ? "position"
                    : "person",
                assetPath: asset.path,
                assetType: asset.meta.split(" · ")[0],
                sourceType: "asset",
                status: "normal",
                x: 520,
                y: 250,
                width: 180,
                summary: "",
                evidence: ["正式资产资料"],
              },
            ]);
            setSelectedIds([id]);
          }
          setAssetPicker(false);
          setNodeEditor(null);
          notify("正式资产已关联；后续资料变化会自动同步");
        }}
      />
      <RelationEditor
        open={Boolean(relationEditor)}
        relation={relationEditor}
        page={page}
        close={() => setRelationEditor(null)}
        onSave={(payload) => {
          const sourceNode = page.nodes.find(
            (node) => node.label === payload.source,
          );
          const targetNode = page.nodes.find(
            (node) => node.label === payload.target,
          );
          const nextRelation = {
            id: payload.id || `edge-${Date.now()}`,
            source: sourceNode.id,
            target: targetNode.id,
            label: payload.label,
            kind: "local",
            status: "normal",
            evidence: ["用户维护"],
          };
          updateActiveEdges((edges) =>
            payload.id
              ? edges.map((edge) =>
                  edge.id === payload.id ? nextRelation : edge,
                )
              : [...edges, nextRelation],
          );
          setRelationEditor(null);
          notify(payload.id ? "本图关系已更新" : "本图关系已添加");
        }}
      />
      <EvidencePreviewModal
        evidence={evidencePreview}
        close={() => setEvidencePreview(null)}
      />
      <Modal
        open={Boolean(pageEditor)}
        close={() => setPageEditor(null)}
        title={pageEditor?.id ? "编辑图页" : "新建图页"}
        description={
          pageEditor?.id
            ? "只修改当前知识图谱中的图页名称。"
            : "创建空白图页；也可以改用导入或 AI 整理。"
        }
        footer={
          <>
            <Button onClick={() => setPageEditor(null)}>取消</Button>
            <Button
              tone="primary"
              onClick={() => {
                const name = pageEditor?.name?.trim() || "未命名图页";
                if (pageEditor?.id)
                  setPages((items) =>
                    items.map((item) =>
                      item.id === pageEditor.id ? { ...item, name } : item,
                    ),
                  );
                else {
                  const id = `page-${Date.now()}`;
                  setPages((items) => [
                    ...items,
                    {
                      id,
                      name,
                      type: "自由图页",
                      description: "",
                      updatedAt: "刚刚",
                      nodes: [],
                      edges: [],
                    },
                  ]);
                  setActivePageId(id);
                }
                setPageEditor(null);
              }}
            >
              保存
            </Button>
          </>
        }
      >
        <FormField label="图页名称" required>
          <TextInput
            value={pageEditor?.name || ""}
            onChange={(value) =>
              setPageEditor((current) => ({ ...current, name: value }))
            }
          />
        </FormField>
      </Modal>
      <DeleteAssetModal
        open={Boolean(nodeDelete)}
        close={() => setNodeDelete(null)}
        assetLabel="图谱节点"
        assetName={nodeDelete?.label || ""}
        impact={`将同时删除当前图页中的该节点、${nodeDelete ? getDescendantIds(page.nodes, nodeDelete.id).length : 0} 个下级节点及相连关系；正式业务资产不会删除，可通过版本历史恢复图谱。`}
        onConfirm={() => {
          const ids = new Set([
            nodeDelete.id,
            ...getDescendantIds(page.nodes, nodeDelete.id),
          ]);
          updateActiveNodes((nodes) =>
            nodes.filter((node) => !ids.has(node.id)),
          );
          updateActiveEdges((edges) =>
            edges.filter(
              (edge) => !ids.has(edge.source) && !ids.has(edge.target),
            ),
          );
          setSelectedIds([]);
          setNodeDelete(null);
          notify("节点及其下级内容已删除，并记录到图谱版本历史");
        }}
      />
      <DeleteAssetModal
        open={Boolean(relationDelete)}
        close={() => setRelationDelete(null)}
        assetLabel="图谱关系"
        assetName={relationDelete?.label || ""}
        impact="只删除当前图页中的这条关系；关系来源、正式业务记录和两端节点不会删除，可通过版本历史恢复图谱。"
        onConfirm={() => {
          updateActiveEdges((edges) =>
            edges.filter((edge) => edge.id !== relationDelete.id),
          );
          setSelectedEdgeId(null);
          setRelationDelete(null);
          notify("关系已删除，并记录到图谱版本历史");
        }}
      />
      <DeleteAssetModal
        open={Boolean(pageDelete)}
        close={() => setPageDelete(null)}
        assetLabel="图页"
        assetName={pageDelete?.name || ""}
        impact="只删除当前图页和它的本地布局；正式资产、其他图页和底层关系不会删除。"
        onConfirm={() => {
          const remaining = pages.filter((item) => item.id !== pageDelete.id);
          setPages(remaining);
          setActivePageId(remaining[0]?.id);
          setPageDelete(null);
          notify("图页已进入当前知识图谱的版本历史");
        }}
      />
    </div>
  );
}

export function MappingDetailPage() {
  const { mappingId } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "content";
  const panel = params.get("panel") || "";
  const requestedPageId = params.get("page");
  const graph =
    topicGraphs.find((item) => item.id === mappingId) ||
    (mappingId === "graph-empty"
      ? {
          id: "graph-empty",
          name: "新能源机器人产业图谱",
          description: "整理产业链、目标公司与关键人才。",
          pending: 0,
          nodeCount: 0,
          pageCount: 0,
        }
      : null);
  const [pages, setPages] = useState(() =>
    mappingId === "graph-empty" ? [] : deepClonePages(),
  );
  const [activePageId, setActivePageId] = useState(
    () => params.get("page") || pages[0]?.id,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(panel === "import");
  const [emptyAiOpen, setEmptyAiOpen] = useState(false);
  const [taskBlockedOpen, setTaskBlockedOpen] = useState(false);
  const [newPageOpen, setNewPageOpen] = useState(false);
  const [newPageName, setNewPageName] = useState("产业链与关键公司");
  const [analysisState, setAnalysisState] = useState(
    params.get("state") === "analyzing" ? "running" : "idle",
  );
  const activePage = pages.find((page) => page.id === activePageId) || pages[0];

  useEffect(() => {
    const nextPages = mappingId === "graph-empty" ? [] : deepClonePages();
    setPages(nextPages);
    setActivePageId(params.get("page") || nextPages[0]?.id);
    setNewPageOpen(false);
    setImportOpen(panel === "import");
  }, [mappingId]);
  useEffect(() => {
    if (requestedPageId) setActivePageId(requestedPageId);
  }, [requestedPageId]);
  useEffect(() => setImportOpen(panel === "import"), [panel]);
  const analysisActive = ["running", "paused"].includes(analysisState);
  const startImport = () => {
    if (analysisActive) {
      setTaskBlockedOpen(true);
      return;
    }
    setImportOpen(true);
    updateParams(params, setParams, { panel: "import" });
  };
  const startAi = () => {
    if (analysisActive) {
      setTaskBlockedOpen(true);
      return;
    }
    if (!pages.length) {
      setEmptyAiOpen(true);
      return;
    }
    updateParams(params, setParams, { panel: "ai" });
  };
  if (!graph)
    return (
      <NotFoundState label="知识图谱" onBack={() => navigate("/mappings")} />
    );
  if (panel === "ai" && activePage)
    return (
      <GraphAiWorkspace
        page={activePage}
        close={() => updateParams(params, setParams, { panel: null })}
        onApply={() => {
          notify("3 项可信变化已写入当前图页，1 项待确认");
          updateParams(params, setParams, {
            panel: null,
            tab: "content",
            state: null,
          });
        }}
      />
    );
  const locateFromReview = (pageId) => {
    setActivePageId(pageId);
    updateParams(params, setParams, { page: pageId });
  };

  return (
    <div className="s4-detail-page tg-detail-page">
      <DetailHeader
        icon="route"
        title={graph.name}
        subtitle={graph.description}
        badges={
          pages.length
            ? [
                { label: `${pages.length} 个图页`, tone: "info" },
                {
                  label: `${graph.pending || 3} 项待确认`,
                  tone: graph.pending ? "warning" : "neutral",
                },
              ]
            : [{ label: "空图谱", tone: "neutral" }]
        }
        onBack={() => navigate("/mappings")}
        onDelete={() => setDeleteOpen(true)}
      >
        <Button icon="download" onClick={startImport}>
          导入图页
        </Button>
        <Button icon="sparkles" onClick={startAi}>
          AI 整理
        </Button>
      </DetailHeader>
      {pages.length ? (
        <DetailTabs
          tabs={detailTabs.map((item) =>
            item.value === "reviews"
              ? { ...item, count: graphReviewItems.length }
              : item,
          )}
          value={tab}
          onChange={(value) =>
            updateParams(params, setParams, { tab: value, panel: null })
          }
        />
      ) : null}
      {!pages.length ? (
        <GraphEmptyState
          onCreatePage={() => setNewPageOpen(true)}
          onImport={startImport}
          onAi={startAi}
        />
      ) : null}
      {pages.length && tab === "content" ? (
        <GraphContent
          pages={pages}
          setPages={setPages}
          activePageId={activePageId}
          setActivePageId={setActivePageId}
          params={params}
          setParams={setParams}
          notify={notify}
        />
      ) : null}
      {pages.length && tab === "reviews" ? (
        <GraphReviewWorkspace
          pages={pages}
          onLocate={locateFromReview}
          onResolve={(action, item) =>
            notify(
              action === "confirm"
                ? `“${item.title}”已写入对应数据所有者并同步图谱`
                : action === "local"
                  ? "建议已作为当前图页备注保留"
                  : "建议已忽略并保留处理记录",
            )
          }
        />
      ) : null}
      {pages.length && tab === "history" ? (
        <GraphHistoryTab notify={notify} />
      ) : null}
      {panel === "hidden" ? (
        <HiddenContentPanel
          pages={pages}
          close={() => updateParams(params, setParams, { panel: null })}
          onRestore={(pageId, nodeId) => {
            setPages((items) =>
              items.map((page) =>
                page.id === pageId
                  ? {
                      ...page,
                      nodes: page.nodes.map((node) =>
                        node.id === nodeId
                          ? {
                              ...node,
                              hidden: false,
                              excluded: false,
                              status: "normal",
                              marker: undefined,
                            }
                          : node,
                      ),
                    }
                  : page,
              ),
            );
            setActivePageId(pageId);
            updateParams(params, setParams, {
              panel: null,
              tab: "content",
              page: pageId,
            });
            notify("节点已恢复到原图页并显示最新正式资料");
          }}
        />
      ) : null}
      <ImportGraphPage
        open={importOpen}
        scenario={params.get("case") || ""}
        close={() => {
          setImportOpen(false);
          updateParams(params, setParams, { panel: null });
        }}
        onImported={({ smart }) => {
          if (!pages.length) {
            const imported = deepClonePages()[0];
            setPages([imported]);
            setActivePageId(imported.id);
          }
          if (smart) setAnalysisState("running");
          updateParams(params, setParams, {
            state: smart ? "analyzing" : null,
          });
        }}
      />
      <EmptyGraphAiDialog
        open={emptyAiOpen}
        close={() => setEmptyAiOpen(false)}
        onCreate={({ title, goal }) => {
          const template = deepClonePages()[1] || deepClonePages()[0];
          const createdPage = {
            ...template,
            id: `ai-page-${Date.now()}`,
            name: title,
            description: goal,
            updatedAt: "刚刚",
            nodes: template.nodes.slice(0, 4).map((node, index) => ({
              ...node,
              id: `${node.id}-ai-${index}`,
              parentId: undefined,
              x: 100 + index * 245,
              y: index % 2 === 0 ? 160 : 330,
            })),
            edges: [],
          };
          setPages([createdPage]);
          setActivePageId(createdPage.id);
          setEmptyAiOpen(false);
          setAnalysisState("running");
          updateParams(params, setParams, {
            page: createdPage.id,
            tab: "content",
            state: "analyzing",
          });
          notify("图页已创建，AI 正在按目标整理关系");
        }}
      />
      <Modal
        open={taskBlockedOpen}
        close={() => setTaskBlockedOpen(false)}
        title="当前图谱已有整理任务"
        description="为了避免两个任务同时修改同一份图谱，单个知识图谱同一时间只能运行一个导入分析或 AI 整理任务。"
        footer={
          <Button tone="primary" onClick={() => setTaskBlockedOpen(false)}>
            查看当前进度
          </Button>
        }
      >
        <StateBanner
          tone="info"
          icon="activity"
          title="正在分析节点与连线关系"
          description="当前任务完成、暂停后取消，或失败结束后，才能启动下一项整理任务。"
        />
      </Modal>
      <Modal
        open={newPageOpen}
        close={() => setNewPageOpen(false)}
        title="创建空白图页"
        description="图页创建后可手动增加节点和关系，也可以随时让 AI 整理。"
        footer={
          <>
            <Button onClick={() => setNewPageOpen(false)}>取消</Button>
            <Button
              tone="primary"
              disabled={!newPageName.trim()}
              onClick={() => {
                const page = {
                  id: "blank-page",
                  name: newPageName.trim(),
                  type: "自由图页",
                  description: "",
                  updatedAt: "刚刚",
                  nodes: [],
                  edges: [],
                };
                setPages([page]);
                setActivePageId(page.id);
                setNewPageOpen(false);
                setNewPageName("产业链与关键公司");
                notify("空白图页已创建");
              }}
            >
              创建图页
            </Button>
          </>
        }
      >
        <FormField label="图页名称" required>
          <TextInput value={newPageName} onChange={setNewPageName} />
        </FormField>
      </Modal>
      <DeleteAssetModal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        assetLabel="知识图谱"
        assetName={graph.name}
        impact="整份图谱进入回收站；正式资产、来源记录和共享关系均不会删除。"
        onConfirm={() => {
          setDeleteOpen(false);
          notify("知识图谱已进入回收站");
          navigate("/mappings");
        }}
      />
    </div>
  );
}
