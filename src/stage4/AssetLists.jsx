import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import {
  AssetListState,
  AssetPageHeader,
  BulkBar,
  Button,
  ColumnMenu,
  DataTable,
  DeleteAssetModal,
  FilterBar,
  Pagination,
  StatusFromText,
  TagList,
  TooltipText,
  useListController,
  useToast,
} from "./asset-ui";
import {
  CandidateFilterBar,
  FavoritePickerModal,
  IndustryCascade,
  candidateFilterDefaults,
} from "./CandidateFilters";
import {
  candidates,
  companies,
  contacts,
  opportunities,
  positions,
} from "./data";

const educationTones = {
  博士: "violet",
  硕士: "info",
  本科: "success",
  专科: "warning",
};

const configs = {
  candidates: {
    title: "候选人",
    description: "管理候选人资料、简历、跟进、匹配和岗位推进。",
    data: candidates,
    searchKeys: [
      "name",
      "company",
      "title",
      "location",
      "skills",
      "industries",
    ],
    placeholder: "搜索姓名、公司、职位、技能、经历或原始简历内容",
    candidateFilters: true,
    filters: [],
    defaultHidden: [],
    stickyEdges: true,
    tableMinWidth: 1600,
    columns: [
      {
        key: "name",
        label: "姓名",
        required: true,
        width: 142,
        render: (row) => (
          <span className="s4-primary-cell">
            <b>{row.name}</b>
          </span>
        ),
      },
      { key: "company", label: "公司", width: 132 },
      { key: "title", label: "职位", width: 178 },
      {
        key: "education",
        label: "学历",
        width: 90,
        render: (row) => (
          <TagList
            items={[row.education]}
            tone={educationTones[row.education] || "neutral"}
          />
        ),
      },
      {
        key: "skills",
        label: "技能",
        width: 270,
        render: (row) => <TagList items={row.skills} maxVisible={2} />,
      },
      {
        key: "industries",
        label: "行业",
        width: 220,
        render: (row) => <TagList items={row.industries} maxVisible={1} />,
      },
      { key: "experience", label: "年限", width: 80 },
      {
        key: "age",
        label: "年龄",
        width: 74,
        render: (row) => (row.age ? `${row.age} 岁` : "—"),
      },
      { key: "location", label: "地点", width: 90 },
      {
        key: "pipeline",
        label: "流程",
        width: 110,
        render: (row) => <StatusFromText value={row.pipeline} />,
      },
    ],
  },
  positions: {
    title: "岗位",
    description: "管理招聘岗位、岗位资料、匹配结果和候选人推进。",
    data: positions,
    searchKeys: ["name", "company", "location", "skills"],
    placeholder: "搜索岗位名称、公司、地点或关键技能",
    filters: [
      ["公司", ["星澜机器人", "拓界机器人", "灵跃科技", "穹顶智能"]],
      ["地点", ["北京", "上海", "深圳"]],
      ["招聘状态", ["招聘中", "已暂停", "已关闭"]],
    ],
    columns: [
      {
        key: "name",
        label: "岗位",
        required: true,
        render: (row) => (
          <span className="s4-primary-cell">
            <b>{row.name}</b>
            <small>{row.company}</small>
          </span>
        ),
      },
      { key: "company", label: "招聘公司", required: true },
      { key: "location", label: "地点" },
      {
        key: "status",
        label: "状态",
        render: (row) => <StatusFromText value={row.status} />,
      },
      {
        key: "skills",
        label: "关键技能",
        render: (row) => <TagList items={row.skills} maxVisible={2} />,
      },
      { key: "matches", label: "匹配结果" },
      { key: "progress", label: "推进中" },
      { key: "updatedAt", label: "更新时间" },
    ],
  },
  companies: {
    title: "公司",
    description: "沉淀公司资料，并统一查看联系人、招聘业务和人才关系。",
    data: companies,
    searchKeys: ["name", "industries", "location"],
    placeholder: "搜索公司名称、名称变体、行业或地点",
    industryFilter: true,
    filters: [],
    columns: [
      {
        key: "name",
        label: "公司",
        required: true,
        render: (row) => (
          <span className="s4-primary-cell">
            <b>{row.name}</b>
            <small>{row.location}</small>
          </span>
        ),
      },
      {
        key: "industries",
        label: "行业",
        required: true,
        render: (row) => <TagList items={row.industries} maxVisible={1} />,
      },
      { key: "contacts", label: "联系人" },
      { key: "opportunities", label: "招聘机会" },
      { key: "positions", label: "岗位" },
      { key: "talents", label: "任职人才" },
      { key: "progress", label: "招聘推进" },
      { key: "updatedAt", label: "更新时间" },
    ],
  },
  contacts: {
    title: "联系人",
    description: "管理客户、投资人、顾问和行业关系人的身份与沟通记录。",
    data: contacts,
    searchKeys: ["name", "company", "role", "categories", "phone", "email"],
    placeholder: "搜索姓名、公司、角色、手机或邮箱",
    filters: [
      ["类别", ["客户 HR", "招聘负责人", "投资人", "顾问", "中间介绍人"]],
      ["公司", ["星澜机器人", "拓界机器人", "灵跃科技", "启程资本"]],
    ],
    columns: [
      {
        key: "name",
        label: "联系人",
        required: true,
        render: (row) => (
          <span className="s4-primary-cell">
            <b>{row.name}</b>
            <small>{row.role}</small>
          </span>
        ),
      },
      { key: "company", label: "主要归属", required: true },
      {
        key: "categories",
        label: "类别",
        render: (row) => <TagList items={row.categories} maxVisible={1} />,
      },
      { key: "phone", label: "手机" },
      {
        key: "email",
        label: "邮箱",
        render: (row) =>
          row.email ? (
            <TooltipText tip={row.email}>{row.email}</TooltipText>
          ) : (
            "—"
          ),
      },
      { key: "region", label: "地区" },
      { key: "lastContact", label: "最近沟通" },
    ],
  },
  opportunities: {
    title: "招聘机会",
    description: "记录已确认的招聘需求，并逐步拆分为正式岗位。",
    data: opportunities,
    searchKeys: ["title", "company", "summary", "evidence"],
    placeholder: "搜索机会名称、公司或招聘方向",
    filters: [
      ["公司", ["星澜机器人", "拓界机器人", "灵跃科技", "穹顶智能"]],
      ["状态", ["跟进中", "已完成", "已关闭"]],
    ],
    columns: [
      {
        key: "title",
        label: "招聘机会",
        required: true,
        render: (row) => (
          <span className="s4-primary-cell">
            <b>{row.title}</b>
            <small>{row.company}</small>
          </span>
        ),
      },
      { key: "company", label: "公司", required: true },
      {
        key: "summary",
        label: "需求摘要",
        render: (row) => (
          <TooltipText tip={row.summary}>{row.summary}</TooltipText>
        ),
      },
      { key: "directions", label: "招聘方向" },
      { key: "positions", label: "已形成岗位" },
      {
        key: "status",
        label: "状态",
        render: (row) => <StatusFromText value={row.status} />,
      },
      { key: "updatedAt", label: "更新时间" },
    ],
  },
};

function RowActions({ row, type, onDelete }) {
  const navigate = useNavigate();
  return (
    <div className="s4-row-actions">
      <button
        type="button"
        aria-label={`打开${row.name || row.title}`}
        onClick={() => navigate(`/${type}/${row.id}`)}
      >
        <Icon name="chevronRight" />
      </button>
      <button
        type="button"
        className="is-danger"
        aria-label={`删除${row.name || row.title}`}
        onClick={() => onDelete(row)}
      >
        <Icon name="trash" />
      </button>
    </div>
  );
}

export function AssetListPage({ type }) {
  const config = configs[type];
  const navigate = useNavigate();
  const notify = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const state = searchParams.get("state") || "normal";
  const controller = useListController(config.data, config.searchKeys, 6);
  const [filterValues, setFilterValues] = useState(() =>
    Object.fromEntries(config.filters.map(([label]) => [label, []])),
  );
  const [candidateFilters, setCandidateFilters] = useState(
    candidateFilterDefaults,
  );
  const [companyIndustries, setCompanyIndustries] = useState([]);
  const [candidateFolders, setCandidateFolders] = useState(() =>
    Object.fromEntries(
      candidates.map((candidate) => [candidate.id, candidate.folders]),
    ),
  );
  const [visibleColumns, setVisibleColumns] = useState(
    config.columns
      .filter(
        (column) =>
          column.required ||
          !(config.defaultHidden ?? ["updatedAt", "experience"]).includes(
            column.key,
          ),
      )
      .map((column) => column.key),
  );
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [favoritePickerOpen, setFavoritePickerOpen] = useState(false);
  const candidateRows = useMemo(
    () =>
      controller.filtered.map((row) => ({
        ...row,
        folders: candidateFolders[row.id] || [],
      })),
    [candidateFolders, controller.filtered],
  );
  const filtered = useMemo(() => {
    if (type === "candidates") {
      return candidateRows.filter((row) => {
        if (
          candidateFilters.companies.length &&
          !candidateFilters.companies.includes(row.company)
        )
          return false;
        if (
          candidateFilters.industries.length &&
          !candidateFilters.industries.some((item) =>
            row.industries.includes(item),
          )
        )
          return false;
        if (
          candidateFilters.education.length &&
          !candidateFilters.education.includes(row.education)
        )
          return false;
        if (
          candidateFilters.locations.length &&
          !candidateFilters.locations.includes(row.location)
        )
          return false;
        if (candidateFilters.opportunity.length) {
          const statuses = candidateFilters.opportunity.map(
            (item) => item.split(" · ")[0],
          );
          if (!statuses.includes(row.opportunityStatus)) return false;
        }
        if (candidateFilters.pipeline === "在流程中" && !row.pipelineActive)
          return false;
        if (candidateFilters.pipeline === "不在流程中" && row.pipelineActive)
          return false;
        if (
          candidateFilters.title.trim() &&
          !row.title
            .toLowerCase()
            .includes(candidateFilters.title.trim().toLowerCase())
        )
          return false;
        if (candidateFilters.favorite.length) {
          if (
            !candidateFilters.favorite.some((path) =>
              row.folders.some(
                (folder) => folder === path || folder.startsWith(`${path}/`),
              ),
            )
          )
            return false;
        }
        if (
          candidateFilters.yearsMin &&
          Number.parseInt(row.experience, 10) <
            Number.parseInt(candidateFilters.yearsMin, 10)
        )
          return false;
        if (
          candidateFilters.ageMin &&
          row.age < Number.parseInt(candidateFilters.ageMin, 10)
        )
          return false;
        if (
          candidateFilters.ageMax &&
          row.age > Number.parseInt(candidateFilters.ageMax, 10)
        )
          return false;
        return true;
      });
    }
    return controller.filtered.filter((row) => {
      if (
        type === "companies" &&
        companyIndustries.length &&
        !companyIndustries.some((industry) => row.industries.includes(industry))
      )
        return false;
      return config.filters.every(([label]) => {
        const values = filterValues[label];
        if (!values?.length) return true;
        const key = {
          公司: "company",
          地点: "location",
          学历: "education",
          行业: "industries",
          收藏夹: "folders",
          招聘状态: "status",
          状态: "status",
          类别: "categories",
        }[label];
        const cell = row[key];
        return values.some((value) =>
          Array.isArray(cell)
            ? cell.includes(value)
            : String(cell || "").includes(value),
        );
      });
    });
  }, [
    candidateFilters,
    candidateRows,
    companyIndustries,
    config.filters,
    controller.filtered,
    filterValues,
    type,
  ]);
  const pages = Math.max(1, Math.ceil(filtered.length / 6));
  const filteredRows = filtered.slice(
    (controller.page - 1) * 6,
    controller.page * 6,
  );
  useEffect(
    () => controller.setPage(1),
    [candidateFilters, companyIndustries, filterValues],
  );
  const filterConfigs = config.filters.map(([label, options]) => ({
    label,
    value: filterValues[label],
    options,
    multiple: true,
    searchable: options.length > 4,
    onChange: (value) =>
      setFilterValues((current) => ({ ...current, [label]: value })),
  }));
  const entityRoute = type;
  return (
    <div className="s4-page">
      <AssetPageHeader
        title={config.title}
        description={config.description}
        count={filtered.length}
        primaryLabel={`新建${config.title}`}
        onPrimary={() => navigate(`/${type}/new`)}
      />
      {type === "candidates" ? (
        <CandidateFilterBar
          query={controller.query}
          setQuery={controller.setQuery}
          values={candidateFilters}
          setValues={setCandidateFilters}
          columnMenu={
            <ColumnMenu
              columns={config.columns}
              visible={visibleColumns}
              onChange={setVisibleColumns}
            />
          }
        />
      ) : (
        <FilterBar
          query={controller.query}
          setQuery={controller.setQuery}
          placeholder={config.placeholder}
          filters={
            config.industryFilter
              ? [
                  {
                    key: "industry",
                    render: (
                      <IndustryCascade
                        value={companyIndustries}
                        onChange={setCompanyIndustries}
                      />
                    ),
                  },
                ]
              : filterConfigs
          }
          trailing={
            <ColumnMenu
              columns={config.columns}
              visible={visibleColumns}
              onChange={setVisibleColumns}
            />
          }
        />
      )}
      <BulkBar
        count={controller.selected.size}
        onClear={() => controller.setSelected(new Set())}
      >
        {type === "candidates" ? (
          <Button
            size="sm"
            icon="folder"
            onClick={() => setFavoritePickerOpen(true)}
          >
            加入收藏夹
          </Button>
        ) : null}
        <Button
          size="sm"
          tone="danger-outline"
          onClick={() =>
            setDeleteTarget({
              name: `${controller.selected.size} 条${config.title}`,
            })
          }
        >
          批量删除
        </Button>
      </BulkBar>
      <AssetListState
        state={state}
        label={config.title}
        onRetry={() => setSearchParams({})}
      >
        <DataTable
          columns={config.columns}
          rows={state === "empty" ? [] : filteredRows}
          visibleColumns={visibleColumns}
          selected={controller.selected}
          onSelect={controller.setSelected}
          onRow={(row) => navigate(`/${entityRoute}/${row.id}`)}
          rowActions={(row) => (
            <RowActions
              row={row}
              type={entityRoute}
              onDelete={setDeleteTarget}
            />
          )}
          stickyEdges={config.stickyEdges}
          minWidth={config.tableMinWidth}
          empty={
            <div className="s4-custom-empty">
              <Icon name="search" />
              <b>
                {controller.query
                  ? `没有找到“${controller.query}”`
                  : `还没有${config.title}`}
              </b>
              <p>
                {controller.query
                  ? "搜索也包含可显示字段和已解析原始内容；当前没有符合条件的数据。"
                  : `新建或导入第一条${config.title}后，会显示在这里。`}
              </p>
              <Button
                tone="primary"
                icon="plus"
                onClick={() => navigate(`/${type}/new`)}
              >
                新建{config.title}
              </Button>
            </div>
          }
        />
        <Pagination
          page={Math.min(controller.page, pages)}
          pages={pages}
          onChange={controller.setPage}
        />
      </AssetListState>
      <DeleteAssetModal
        open={Boolean(deleteTarget)}
        close={() => setDeleteTarget(null)}
        assetLabel={config.title}
        assetName={deleteTarget?.name || deleteTarget?.title || ""}
        impact={`关联的其他正式资产不会删除；从反向列表进入时，也不会创建第二份关系。`}
        onConfirm={() => {
          notify(`“${deleteTarget?.name || deleteTarget?.title}”已进入回收站`);
          setDeleteTarget(null);
        }}
      />
      <FavoritePickerModal
        open={favoritePickerOpen}
        count={controller.selected.size}
        close={() => setFavoritePickerOpen(false)}
        onConfirm={(folders) => {
          setCandidateFolders((current) => {
            const next = { ...current };
            controller.selected.forEach((candidateId) => {
              next[candidateId] = [
                ...new Set([...(next[candidateId] || []), ...folders]),
              ];
            });
            return next;
          });
          notify(
            `已将 ${controller.selected.size} 位候选人加入 ${folders.length} 个收藏夹`,
          );
          controller.setSelected(new Set());
          setFavoritePickerOpen(false);
        }}
      />
    </div>
  );
}

export function CandidatesListPage() {
  return <AssetListPage type="candidates" />;
}
export function PositionsListPage() {
  return <AssetListPage type="positions" />;
}
export function CompaniesListPage() {
  return <AssetListPage type="companies" />;
}
export function ContactsListPage() {
  return <AssetListPage type="contacts" />;
}
export function OpportunitiesListPage() {
  return <AssetListPage type="opportunities" />;
}
