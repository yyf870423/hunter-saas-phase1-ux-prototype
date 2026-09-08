import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { RelationshipCanvas } from "../stage3/RelationshipCanvas";
import {
  Button,
  DefinitionGrid,
  FieldGroup,
  HierarchyTable,
  Modal,
  RelationshipAiDialog,
  RelationshipAiProcessingState,
  SelectMenu,
  StateBanner,
  StatusBadge,
  TooltipText,
  useToast,
} from "./asset-ui";
import { positionTalentRows } from "./position-talent-results.js";
import {
  getOpportunityPermission,
  runOpportunityCommand,
} from "./opportunity-store";

export function PositionTalentMap({ position }) {
  const navigate = useNavigate();
  const [view, setView] = useState("table");
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("全部状态");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [dialog, setDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const timer = useRef(null);
  const notify = useToast();
  useEffect(() => () => clearTimeout(timer.current), []);
  const rows = useMemo(() => positionTalentRows(position), [position]);
  const filtered = rows.filter(
    (row) =>
      [row.name, row.company, row.title, row.basis]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase()) &&
      (stage === "全部状态" || row.stage === stage),
  );
  const result = position.talentMap;
  const sourceTask = result?.sourceTaskId;
  const views = useMemo(
    () => [
      {
        id: "position-talents-" + position.id,
        label: "岗位与目标人选",
        title: "岗位与目标人选",
        description: "已审核人选与当前岗位的关系",
        defaultSelection: { kind: "node", id: position.id },
        nodes: [
          {
            id: position.id,
            label: position.name,
            meta: position.company,
            kind: "position",
            x: 30,
            y: 150,
            status: position.status,
            tone: "info",
            summary: "当前岗位已审核目标人选",
            facts: [["结果版本", "v" + (result?.version || 0)]],
            evidence: ["当前岗位 JD"],
          },
          ...rows.map((row, index) => ({
            id: row.id,
            label: row.name,
            meta: row.title,
            kind: "person",
            x: 280 + (index % 3) * 215,
            y: 40 + Math.floor(index / 3) * 145,
            status: row.stage,
            tone: row.stage === "储备" ? "success" : "info",
            summary: row.basis,
            facts: [
              ["当前公司", row.company],
              ["匹配依据", row.basis],
              ["风险与待核实", row.risk],
            ],
            evidence: [row.source],
            detailPath: row.detailPath || undefined,
            detailLabel: "查看候选人",
          })),
        ],
        edges: rows.map((row) => ({
          id: "match-" + row.id,
          source: position.id,
          target: row.id,
          label: row.stage,
          status: "已审核",
          tone: "success",
          summary: row.basis,
          evidence: [row.source],
        })),
      },
    ],
    [position, rows, result?.version],
  );
  const update = () =>
    navigate(
      "/new?kind=recruiting&positionId=" +
        position.id +
        "&prompt=" +
        encodeURIComponent(
          "继续为" +
            position.name +
            "寻找候选人，审核加入岗位储备并同步更新人才梳理",
        ),
    );
  if (!rows.length)
    return (
      <FieldGroup title="人才梳理">
        <StateBanner
          title="暂无已审核的目标人选"
          description="岗位找人结果审核后，入储备人选的匹配依据、风险与流程状态保存在这里。"
          action={
            <Button icon="users" onClick={update}>
              开始找人
            </Button>
          }
        />
      </FieldGroup>
    );
  return (
    <div className="s4-detail-stack">
      {error ? (
        <StateBanner tone="danger" title="人才梳理未更新" description={error} />
      ) : null}
      <FieldGroup
        title="当前结果"
        description="来自岗位找人审核；与岗位储备和后续推进状态同步。"
        action={
          <Button
            size="sm"
            icon="refresh"
            disabled={refreshing || getOpportunityPermission()}
            onClick={() => setDialog(true)}
          >
            {refreshing ? "正在更新" : "更新人才梳理"}
          </Button>
        }
      >
        <div className="s4-landscape-summary-card">
          <span>
            <small>岗位人才池 · v{result.version}</small>
            <h3>{position.name}</h3>
            <p>
              已梳理 {rows.length} 位已审核人选，保留匹配依据、资料缺口与来源。
            </p>
          </span>
          <dl>
            <div>
              <dt>当前储备</dt>
              <dd>{rows.filter((row) => row.stage === "储备").length}</dd>
            </div>
            <div>
              <dt>其他阶段</dt>
              <dd>{rows.filter((row) => row.stage !== "储备").length}</dd>
            </div>
            <div>
              <dt>待核实资料</dt>
              <dd>{rows.filter((row) => row.risk).length}</dd>
            </div>
          </dl>
          {sourceTask ? (
            <Button
              icon="task"
              onClick={() => navigate("/tasks/" + sourceTask)}
            >
              查看梳理过程
            </Button>
          ) : null}
        </div>
      </FieldGroup>
      <FieldGroup
        title="重点人才"
        description="待核实资料不等于不合适；联系与推进仍由猎头决定。"
        action={
          <div className="s4-relation-type-tabs" role="tablist">
            {[
              ["table", "表格"],
              ["graph", "关系图"],
            ].map(([value, label]) => (
              <button
                type="button"
                role="tab"
                aria-selected={view === value}
                className={view === value ? "is-active" : ""}
                key={value}
                onClick={() => setView(value)}
              >
                {label}
              </button>
            ))}
          </div>
        }
      >
        {refreshing ? (
          <RelationshipAiProcessingState
            title="正在更新岗位人才梳理"
            description="核对已有候选人最新资料与当前岗位流程，保留匹配依据、风险和审核来源。"
            prompt={prompt}
            steps={[
              "读取岗位与已审核人选",
              "核对资料和流程状态",
              "同步表格与关系图",
            ]}
            activeStep={1}
          />
        ) : view === "table" ? (
          <div className="s4-large-relations s4-talent-table">
            <div className="s4-large-relations-toolbar s4-talent-table-toolbar s4-filter-scope is-compact">
              <div className="s4-inline-search">
                <Icon name="search" />
                <input
                  aria-label="搜索重点人才"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="搜索姓名、公司或职位"
                />
              </div>
              <SelectMenu
                label="筛选状态"
                value={stage}
                options={["全部状态", ...new Set(rows.map((row) => row.stage))]}
                onChange={(value) => {
                  setStage(value);
                  setPage(1);
                }}
              />
            </div>
            <HierarchyTable
              levelColumns={[
                { label: "当前公司", width: 180 },
                { label: "目标人选", width: 230 },
              ]}
              rows={filtered
                .slice((page - 1) * 8, page * 8)
                .map((row) => ({ ...row, path: row.hierarchyPath }))}
              columns={[
                {
                  key: "status",
                  label: "流程状态",
                  width: 90,
                  render: (row) => (
                    <StatusBadge
                      tone={row.stage === "储备" ? "success" : "info"}
                    >
                      {row.stage}
                    </StatusBadge>
                  ),
                },
                {
                  key: "basis",
                  label: "匹配依据",
                  width: 220,
                  render: (row) => (
                    <TooltipText tip={row.basis} clampLines={2}>
                      {row.basis}
                    </TooltipText>
                  ),
                },
                {
                  key: "risk",
                  label: "风险与待核实",
                  width: 220,
                  render: (row) => (
                    <TooltipText tip={row.risk} clampLines={2}>
                      {row.risk}
                    </TooltipText>
                  ),
                },
                {
                  key: "source",
                  label: "来源",
                  width: 150,
                  render: (row) => row.source,
                },
                {
                  key: "action",
                  label: "操作",
                  width: 100,
                  render: (row) => (
                    <Button size="xs" onClick={() => setSelected(row)}>
                      查看人选
                    </Button>
                  ),
                },
              ]}
              page={page}
              pages={Math.max(1, Math.ceil(filtered.length / 8))}
              pageSize={8}
              totalLabel={`共 ${filtered.length} 位符合条件的人才 · ${rows.length} 位已审核人选`}
              onPageChange={setPage}
              renderLevel={(node) => (
                <span className="tg-table-node is-static">
                  <Icon name={node.kind === "person" ? "user" : "building"} />
                  <span>
                    <b>{node.label}</b>
                    <small>{node.subtitle}</small>
                  </span>
                </span>
              )}
              scrollLabel="横向滚动重点人才层级表格"
              testId="position-talent-hierarchy-table"
            />
          </div>
        ) : (
          <RelationshipCanvas
            key={result.version}
            views={views}
            decisions={{}}
            onDecision={() => {}}
            draggable
            storageKey={"hunter-position-talent-layout-" + position.id}
          />
        )}
      </FieldGroup>
      <RelationshipAiDialog
        open={dialog}
        close={() => setDialog(false)}
        title="更新岗位人才梳理"
        description="补充本次需要核对的资料或关注点。更新现有人选摘要，不创建找人任务或自动联系。"
        initialPrompt={prompt}
        submitLabel="开始更新"
        onSubmit={(value) => {
          setPrompt(value);
          setDialog(false);
          setRefreshing(true);
          setError("");
          timer.current = setTimeout(() => {
            try {
              const result = runOpportunityCommand(
                "position.talent-map.refresh",
                { id: position.id },
              );
              notify(
                result.changed
                  ? "已有候选人资料已同步，匹配依据与风险保留"
                  : "核对完成，已有资料无需变更",
              );
            } catch (failure) {
              setError(failure.message);
            } finally {
              setRefreshing(false);
            }
          }, 700);
        }}
      />
      <Modal
        open={Boolean(selected)}
        close={() => setSelected(null)}
        title={selected?.name || "人选资料"}
        size="lg"
        footer={
          <>
            <Button onClick={() => setSelected(null)}>关闭</Button>
            {selected?.sourceTaskId ? (
              <Button
                icon="task"
                onClick={() => navigate("/tasks/" + selected.sourceTaskId)}
              >
                查看来源任务
              </Button>
            ) : null}
            {selected?.detailPath ? (
              <Button onClick={() => navigate(selected.detailPath)}>
                候选人详情
              </Button>
            ) : null}
          </>
        }
      >
        {selected ? (
          <DefinitionGrid
            columns={1}
            items={[
              ["当前公司", selected.company],
              ["当前职位", selected.title],
              ["流程状态", selected.stage],
              ["匹配依据", selected.basis],
              ["风险与待核实", selected.risk],
              ["资料来源", selected.source],
              ["下一步", "核实资料缺口与求职意向，再决定是否推荐或继续推进。"],
            ]}
          />
        ) : null}
      </Modal>
    </div>
  );
}
