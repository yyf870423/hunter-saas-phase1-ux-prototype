import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import {
  AssetPageHeader,
  Button,
  CustomCheckbox,
  CustomRadio,
  DetailTabs,
  FileDrop,
  FilterBar,
  FormField,
  Modal,
  Pagination,
  PostWriteMatchingOptions,
  ProgressBar,
  SelectMenu,
  StateBanner,
  StatusBadge,
  StatusFromText,
  TextArea,
  TextInput,
  useToast,
} from "./asset-ui";
import { companies, exportTasks, recycleItems } from "./data";
import { ImportTaskDetail } from "./ImportTaskDetail";
import {
  advanceImportSample,
  createUploadedImportSample,
  retryImportSample,
} from "./import-task-details";
import { useImportTasks } from "./import-task-store";
import { CandidateImportExampleLink } from "./CandidateImportExampleLink";
import {
  useCompanyContacts,
  restoreCompanyContact,
} from "./company-contact-store";
import { restoreGraph, useTopicGraphs } from "./topic-graph-store";
import { graphTypeLabel } from "./graph-types";
import {
  runOpportunityCommand,
  useOpportunityState,
} from "./opportunity-store";
import { opportunityNow } from "./opportunity-domain";
import { OpportunityImportDetail } from "./OpportunityImport";
import { displayDateTime } from "./OpportunityComponents";

function DataManagementNav({ value }) {
  const navigate = useNavigate();
  return (
    <div className="s4-data-management-nav">
      <DetailTabs
        tabs={[
          { value: "imports", label: "数据导入" },
          { value: "exports", label: "数据导出" },
          { value: "recycle", label: "回收站" },
        ]}
        value={value}
        onChange={(next) =>
          navigate(next === "recycle" ? "/recycle-bin" : `/data/${next}`)
        }
      />
    </div>
  );
}

export function ImportsPage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [params, setParams] = useSearchParams();
  const [wizardOpen, setWizardOpen] = useState(
    Boolean(params.get("type")) && params.get("type") !== "opportunities",
  );
  useEffect(() => {
    if (params.get("type") === "opportunities")
      navigate("/data/imports", { replace: true });
  }, [params, navigate]);
  const [step, setStep] = useState("file");
  const [type, setType] = useState(
    params.get("type") === "mappings" || params.get("type") === "mapping"
      ? "知识图谱"
      : params.get("type") === "papers"
        ? "论文"
        : params.get("type") === "patents"
          ? "专利"
          : params.get("type") === "positions"
            ? "岗位"
            : "候选人",
  );
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [localTasks, setLocalTasks] = useImportTasks();
  const [createdTask, setCreatedTask] = useState(null);
  const [typeFilter, setTypeFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const setDetail = (task) =>
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (task) next.set("detail", task.id);
      else next.delete("detail");
      next.delete("importView");
      return next;
    });
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [duplicateChoice, setDuplicateChoice] = useState("replace");
  const initialMatchMode = params.get("match") || "none";
  const [matchEnabled, setMatchEnabled] = useState(
    initialMatchMode === "all" || initialMatchMode === "selected",
  );
  const [matchScope, setMatchScope] = useState(
    initialMatchMode === "selected" ? "selected" : "all",
  );
  const [selectedPositions, setSelectedPositions] = useState(
    initialMatchMode === "selected"
      ? ["具身智能 VLA 算法负责人 · 星澜机器人"]
      : [],
  );
  const [matchError, setMatchError] = useState("");
  const lifecycle = useOpportunityState();
  const visibleTasks = useMemo(
    () =>
      [
        ...lifecycle.imports.map((batch) => {
          const task = lifecycle.tasks.find((item) => item.id === batch.taskId);
          const written = batch.rows.filter(
            (row) => row.status === "written",
          ).length;
          const failed = batch.rows.filter(
            (row) => row.status === "error",
          ).length;
          return {
            ...batch,
            lifecycle: true,
            type: "招聘机会",
            progress: batch.rows.length
              ? Math.round((written / batch.rows.length) * 100)
              : 0,
            status: task?.results.length ? "已完成" : batch.status,
            time: displayDateTime(batch.createdAt),
            result: batch.taskId
              ? task?.results.length
                ? "已写入 " + task.results.length + " 项结果"
                : "等待任务审核"
              : "已写入 " + written + " 行，需修正 " + failed + " 行",
          };
        }),
        ...localTasks,
      ].filter(
        (task) =>
          `${task.name}${task.file}${task.type}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()) &&
          (!typeFilter.length || typeFilter.includes(task.type)) &&
          (!statusFilter.length || statusFilter.includes(task.status)),
      ),
    [query, lifecycle, localTasks, typeFilter, statusFilter],
  );
  const detailId = params.get("detail");
  const detail = detailId
    ? localTasks.find((task) => task.id === detailId) ||
      visibleTasks.find((task) => task.id === detailId) || { id: detailId }
    : null;
  const taskPages = Math.max(1, Math.ceil(visibleTasks.length / 50));
  const taskRows = visibleTasks.slice((page - 1) * 50, page * 50);
  useEffect(() => setPage(1), [query, typeFilter, statusFilter]);
  useEffect(() => {
    if (params.get("type") === "mappings" || params.get("type") === "mapping") {
      navigate("/mappings/mapping-embodied?panel=import", { replace: true });
    }
  }, [navigate, params]);
  const next = () => {
    if (!files.length) return;
    if (
      type === "候选人" &&
      matchEnabled &&
      matchScope === "selected" &&
      !selectedPositions.length
    ) {
      setMatchError("请至少选择一个岗位");
      return;
    }
    setMatchError("");
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setStep(
        files[0]?.name?.includes("错误")
          ? "error"
          : type === "知识图谱"
            ? "duplicate"
            : "confirm",
      );
    }, 700);
  };
  const finish = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      const task = createUploadedImportSample(type, files);
      setLocalTasks((current) => [task, ...current]);
      setCreatedTask(task);
      setStep("success");
      notify("导入处理已开始，当前页面会持续更新状态", "info");
    }, 750);
  };
  const closeWizard = () => {
    setWizardOpen(false);
    setStep("file");
    setFiles([]);
    setCreatedTask(null);
  };
  return (
    <div className="s4-page">
      <AssetPageHeader
        eyebrow="数据管理"
        title="数据导入"
        description="统一查看解析、查重、审核与写入结果；所有输入路径都会返回明确处理结论。"
        primaryLabel="新建导入"
        primaryIcon="download"
        onPrimary={() => setWizardOpen(true)}
      />
      <DataManagementNav value="imports" />
      <p className="s4-import-prototype-note">
        【原型说明，正式实现不展示】本页导入明细使用本地虚构样例，不连接真实导入接口。
      </p>
      <FilterBar
        query={query}
        setQuery={setQuery}
        placeholder="搜索导入记录或文件名"
        filters={[
          {
            label: "资产类型",
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              "候选人",
              "公司",
              "岗位",
              ...(lifecycle.imports.length ? ["招聘机会"] : []),
              "知识图谱",
              "论文",
              "专利",
            ],
            multiple: true,
          },
          {
            label: "处理状态",
            value: statusFilter,
            onChange: setStatusFilter,
            options: ["处理中", "已完成", "需要处理", "失败"],
            multiple: true,
          },
        ]}
      />
      <div className="s4-task-table">
        <header>
          <span>导入记录</span>
          <span>资产类型</span>
          <span>进度与结果</span>
          <span>状态</span>
          <span>时间</span>
          <span>操作</span>
        </header>
        {taskRows.map((task) => (
          <article key={task.id}>
            <b>
              {task.name}
              <small>{task.file}</small>
            </b>
            <span>{task.type}</span>
            <div>
              {task.progress > 0 ? (
                <ProgressBar value={task.progress} label={task.result} />
              ) : (
                <p>{task.result}</p>
              )}
            </div>
            <StatusFromText value={task.status} />
            <span>{task.time}</span>
            <button type="button" onClick={() => setDetail(task)}>
              查看详情
            </button>
          </article>
        ))}
      </div>
      {!taskRows.length ? (
        <StateBanner
          title="没有符合条件的导入任务"
          description="调整搜索词或筛选条件后再试。"
        />
      ) : null}
      <Pagination
        page={page}
        pages={taskPages}
        pageSize={50}
        total={visibleTasks.length}
        onChange={setPage}
      />
      <Modal
        open={wizardOpen}
        close={closeWizard}
        closeDisabled={busy}
        size="xl"
        title={
          step === "file"
            ? "导入业务数据"
            : step === "confirm"
              ? "确认导入任务"
              : step === "duplicate"
                ? "发现同名知识图谱"
                : step === "error"
                  ? "文件格式校验失败"
                  : "导入处理已开始"
        }
        description={
          step === "file"
            ? "选择资产类型和文件，系统会先校验格式再解析内容"
            : step === "confirm"
              ? "确认文件和导入设置；开始后可在任务详情查看处理结果"
              : step === "duplicate"
                ? "“具身智能 VLA 核心知识图谱”已存在于当前工作空间"
                : step === "error"
                  ? "未通过格式校验的文件不能进入长时间解析"
                  : "可以关闭窗口，任务会继续在后台运行"
        }
        footer={
          step === "file" ? (
            <>
              <Button onClick={closeWizard}>取消</Button>
              <Button
                tone="primary"
                loading={busy}
                disabled={!files.length}
                onClick={next}
              >
                校验并解析
              </Button>
            </>
          ) : step === "confirm" || step === "duplicate" ? (
            <>
              <Button disabled={busy} onClick={() => setStep("file")}>
                返回
              </Button>
              <Button tone="primary" loading={busy} onClick={finish}>
                确认导入
              </Button>
            </>
          ) : step === "error" ? (
            <>
              <Button onClick={closeWizard}>取消</Button>
              <Button
                tone="primary"
                onClick={() => {
                  setFiles([]);
                  setStep("file");
                }}
              >
                重新选择
              </Button>
            </>
          ) : (
            <Button
              tone="primary"
              onClick={() => {
                closeWizard();
                if (createdTask) setDetail(createdTask);
              }}
            >
              查看任务详情
            </Button>
          )
        }
      >
        {step === "file" ? (
          <div className="s4-import-step">
            <FormField label="资产类型" required>
              <SelectMenu
                label="选择类型"
                value={type}
                options={["候选人", "公司", "岗位", "知识图谱", "论文", "专利"]}
                onChange={(nextType) => {
                  setType(nextType);
                  setMatchError("");
                }}
              />
            </FormField>
            <FileDrop
              files={files}
              onFiles={setFiles}
              accept={
                type === "知识图谱"
                  ? "XLSX、MM、FreeMind"
                  : type === "候选人"
                    ? "PDF、DOCX、ZIP、XLSX"
                    : "PDF、DOCX、XLSX"
              }
              multiple={type !== "知识图谱"}
              maxFiles={type === "候选人" ? 100 : undefined}
              sizeLabel={type === "候选人" ? "20 MB" : undefined}
            />
            {type === "候选人" || type === "岗位" ? (
              <PostWriteMatchingOptions
                entityType={type === "候选人" ? "candidate" : "position"}
                enabled={matchEnabled}
                onEnabledChange={(nextEnabled) => {
                  setMatchEnabled(nextEnabled);
                  setMatchError("");
                }}
                scope={matchScope}
                onScopeChange={(nextScope) => {
                  setMatchScope(nextScope);
                  setMatchError("");
                }}
                selectedPositions={selectedPositions}
                onSelectedPositionsChange={(nextPositions) => {
                  setSelectedPositions(nextPositions);
                  setMatchError("");
                }}
                error={matchError}
              />
            ) : null}
            {type === "候选人" ? <CandidateImportExampleLink /> : <a
              href="#sample"
              onClick={(event) => {
                event.preventDefault();
                notify(`${type}导入示例已开始下载`);
              }}
            >
              下载 {type} 导入示例
            </a>}
          </div>
        ) : null}
        {step === "confirm" ? (
          <div className="s4-import-summary">
            <dl>
              <div>
                <dt>待处理文件</dt>
                <dd>{files.length}</dd>
              </div>
              <div>
                <dt>已处理</dt>
                <dd>0</dd>
              </div>
              <div>
                <dt>成功</dt>
                <dd>0</dd>
              </div>
              <div>
                <dt>失败</dt>
                <dd>0</dd>
              </div>
            </dl>
            <StateBanner
              title="确认后开始导入"
              description="当前仅确认所选文件。具体记录数量、成功、失败及待确认结果在处理后更新，不提前计入成功。"
            />
            {matchEnabled && (type === "候选人" || type === "岗位") ? (
              <StateBanner
                tone="info"
                icon="sparkles"
                title="正式写入后将自动开始人岗匹配"
                description={
                  type === "候选人"
                    ? matchScope === "selected"
                      ? `只对成功写入的候选人匹配已选择的 ${selectedPositions.length} 个岗位；待身份确认和失败记录不会启动。`
                      : "只对成功写入的候选人匹配全部招聘中岗位；待身份确认和失败记录不会启动。"
                    : "只对成功写入的岗位匹配系统内可用候选人；失败岗位不会启动。"
                }
              />
            ) : null}
            <div className="s4-import-result-list">
              {files.map((file, index) => <article key={`${file.name}-${index}`}>
                <StatusBadge tone="neutral">待处理</StatusBadge>
                <span><b>{file.name}</b><small>{type} · 文件结构校验后进入解析与导入</small></span>
              </article>)}
            </div>
          </div>
        ) : null}
        {step === "duplicate" ? (
          <div className="s4-duplicate-import">
            <div>
              <article>
                <small>待导入</small>
                <b>具身智能 VLA 核心知识图谱</b>
                <p>37 位人物 · 64 条关系</p>
              </article>
              <Icon name="refresh" />
              <article>
                <small>当前版图</small>
                <b>具身智能 VLA 核心知识图谱</b>
                <p>35 位人物 · 58 条关系</p>
              </article>
            </div>
            <CustomRadio
              checked={duplicateChoice === "replace"}
              label="替换当前版图"
              description="当前版图进入回收站，导入内容成为新的当前版图"
              onChange={() => setDuplicateChoice("replace")}
            />
            <CustomRadio
              checked={duplicateChoice === "keep"}
              label="保留两张版图"
              description="导入版图命名为“具身智能 VLA 核心知识图谱（2）”"
              onChange={() => setDuplicateChoice("keep")}
            />
          </div>
        ) : null}
        {step === "error" ? (
          <div className="s4-import-error">
            <Icon name="warning" />
            <h3>组织层级不连续</h3>
            <p>
              第 3
              行直接出现“三级节点”，但对应的“二级节点”为空。请补齐上级节点后重新导入。
            </p>
            <code>工作表：知识图谱 · 单元格 C3</code>
          </div>
        ) : null}
        {step === "success" ? (
          <div className="s4-import-success">
            <i>
              <Icon name="check" />
            </i>
            <h3>导入任务已创建</h3>
            <p>
              Hunter
              将继续完成查重、身份分析和写入门禁；遇到需要用户决定的内容会发送通知。
            </p>
            <ProgressBar value={createdTask?.progress || 0} label={`已接收 ${createdTask?.items.length || 0} 份文件，等待处理结果`} />
          </div>
        ) : null}
      </Modal>
      {detail?.lifecycle ? (
        <OpportunityImportDetail
          batchId={detail.id}
          close={() => setDetail(null)}
        />
      ) : null}
      {detail && !detail.lifecycle ? (
        <ImportTaskDetail
          key={`${detail.id}-${params.get("importView") || "ready"}`}
          task={localTasks.find((task) => task.id === detail.id)}
          taskId={detail.id}
          view={params.get("importView") || "ready"}
          close={() => setDetail(null)}
          onOpenTask={(id) => setDetail({ id })}
          onRefresh={(task) =>
            setLocalTasks((current) =>
              current.map((item) =>
                item.id === task.id ? advanceImportSample(item) : item,
              ),
            )
          }
          onRetry={(task) => {
            if (task.retryTaskId) return;
            const retry = retryImportSample(task);
            if (retry)
              setLocalTasks((current) => current.some((item) => item.id === retry.id) ? current : [
                retry,
                ...current.map((item) =>
                  item.id === task.id
                    ? { ...item, retryTaskId: retry.id }
                    : item,
                ),
              ]);
          }}
        />
      ) : null}
    </div>
  );
}

export function ExportsPage() {
  const notify = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [scope, setScope] = useState("候选人");
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState("Excel");
  const [range, setRange] = useState("当前筛选结果");
  const [fileName, setFileName] = useState("候选人_20260821");
  const rows = exportTasks.filter((task) =>
    `${task.name}${task.scope}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  return (
    <div className="s4-page">
      <AssetPageHeader
        eyebrow="数据管理"
        title="数据导出"
        description="创建导出任务并管理限时下载文件。"
        primaryLabel="新建导出"
        primaryIcon="upload"
        onPrimary={() => setCreateOpen(true)}
      />
      <DataManagementNav value="exports" />
      <FilterBar
        query={query}
        setQuery={setQuery}
        placeholder="搜索导出任务"
        filters={[
          {
            label: "文件格式",
            value: [],
            options: ["Excel", "PDF", "CSV"],
            multiple: true,
          },
          {
            label: "状态",
            value: [],
            options: ["生成中", "可下载", "已失效"],
            multiple: true,
          },
        ]}
      />
      <div className="s4-task-table s4-export-table">
        <header>
          <span>导出任务</span>
          <span>导出范围</span>
          <span>格式</span>
          <span>状态</span>
          <span>创建时间</span>
          <span>操作</span>
        </header>
        {rows.map((task) => (
          <article key={task.id}>
            <b>
              {task.name}
              <small>{task.expires}</small>
            </b>
            <span>{task.scope}</span>
            <span>{task.format}</span>
            <StatusFromText value={task.status} />
            <span>{task.time}</span>
            <button
              type="button"
              disabled={task.status !== "可下载"}
              onClick={() => notify(`“${task.name}”已开始下载`)}
            >
              {task.status === "可下载" ? "下载" : "生成中"}
            </button>
          </article>
        ))}
      </div>
      <Pagination page={1} pages={1} onChange={() => {}} />
      <Modal
        open={createOpen}
        close={() => setCreateOpen(false)}
        size="lg"
        title="新建数据导出"
        description="导出文件只保留 7 天，过期后可以重新生成"
        footer={
          <>
            <Button onClick={() => setCreateOpen(false)}>取消</Button>
            <Button
              tone="primary"
              disabled={!fileName.trim()}
              onClick={() => {
                setCreateOpen(false);
                notify("导出任务已创建", "info");
              }}
            >
              开始生成
            </Button>
          </>
        }
      >
        <div className="s4-form-grid s4-export-create-form">
          <FormField label="资产类型" required>
            <SelectMenu
              label="资产类型"
              value={scope}
              options={[
                "候选人",
                "公司",
                "岗位",
                "招聘机会",
                "知识图谱",
                "论文",
                "专利",
              ]}
              onChange={(value) => {
                setScope(value);
                setFileName(`${value}_20260821`);
              }}
            />
          </FormField>
          <FormField label="文件格式" required>
            <SelectMenu
              label="格式"
              value={format}
              options={["Excel", "CSV", "PDF"]}
              onChange={setFormat}
            />
          </FormField>
          <FormField label="导出范围" span={2}>
            <SelectMenu
              label="选择范围"
              value={range}
              options={["当前筛选结果", "全部数据", "手动选择"]}
              onChange={setRange}
            />
          </FormField>
          <FormField label="文件名称" span={2}>
            <TextInput value={fileName} onChange={setFileName} />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}

export function RecycleBinPage() {
  const contactState = useCompanyContacts();
  const graphs = useTopicGraphs();
  const lifecycle = useOpportunityState();
  const [removedDemoIds, setRemovedDemoIds] = useState([]);
  const [types, setTypes] = useState([]);
  const [restoreError, setRestoreError] = useState("");
  const [restoreName, setRestoreName] = useState("");
  const notify = useToast();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [conflict, setConflict] = useState(false);
  const companyRows = contactState.companies
    .filter(
      (company) =>
        contactState.deletedCompanies.includes(company.id) &&
        !(contactState.purgedCompanies || []).includes(company.id),
    )
    .map((company) => ({
      ...company,
      type: "公司",
      local: true,
      reason: `包含 ${contactState.contacts.filter((contact) => contact.companyId === company.id && contact.deletedWithCompany).length} 条本次随公司删除的联系人记录`,
      operator: "沈岚",
      deletedAt: "刚刚",
      remaining: "剩余 30 天",
    }));
  const contactRows = contactState.contacts
    .filter((contact) => contact.deletedAt && !contact.deletedWithCompany)
    .map((contact) => ({
      ...contact,
      type: "公司联系人",
      local: true,
      reason: `所属公司：${contact.company}`,
      operator: "沈岚",
      deletedAt: contact.deletedAt.slice(0, 10),
      remaining: "剩余 30 天",
    }));
  const rows = [
    ...[...lifecycle.opportunities.map((item) => ({ ...item, name: item.title, type: "招聘机会", lifecycleType: "opportunity" })),
      ...lifecycle.positions.map((item) => ({ ...item, type: "岗位", lifecycleType: "position" })),
      ...lifecycle.tasks.map((item) => ({ ...item, name: item.title, type: "任务", lifecycleType: "task" }))]
      .filter((item) => item.deletedAt).map((item) => ({ ...item, reason: "用户删除；其他独立资产保留", operator: "用户",
        remaining: "剩余 " + Math.max(0, 30 - Math.floor((new Date(opportunityNow(lifecycle)).getTime() - new Date(item.deletedAt).getTime()) / 86400000)) + " 天",
        deletedAt: displayDateTime(item.deletedAt) })),
    ...companyRows,
    ...contactRows,
    ...graphs
      .filter((graph) => graph.deletedAt && graph.deletedAt !== "purged")
      .map((graph) => ({
        ...graph,
        type: "知识图谱",
        localGraph: true,
        reason: `图谱类型：${graphTypeLabel(graph.typeId)}`,
        operator: "沈岚",
        deletedAt: graph.deletedAt.slice(0, 10),
        remaining: "剩余 30 天",
      })),
    ...recycleItems.filter((item) => !removedDemoIds.includes(item.id)),
  ].filter(
    (item) =>
      `${item.type}${item.name}${item.company || ""}`.includes(query) &&
      (!types.length || types.includes(item.type)),
  );
  return (
    <div className="s4-page">
      <AssetPageHeader
        eyebrow="数据管理"
        title="回收站"
        description="正式资产删除后保留 30 天；到期自动永久清理。候选人和联系人清理时，资料版本和文件一并删除，任务对话和运行记录里这个人的信息换成“已删除的候选人 / 联系人”；知识图谱里的节点和连线保留，只解除关联。"
        count={rows.length}
      />
      <DataManagementNav value="recycle" />
      <div className="s4-recycle-guidance">
        <StateBanner
          tone="warning"
          icon="warning"
          title="回收站中的关系只用于恢复和影响说明"
          description="公司删除包含所属联系人；恢复公司仅恢复本次一起删除的联系人。其他独立资产不会级联删除。"
        />
      </div>
      <FilterBar
        query={query}
        setQuery={setQuery}
        placeholder="搜索名称或资产类型"
        filters={[
          {
            label: "资产类型",
            value: types,
            options: [
              "候选人",
              "公司",
              "岗位",
              "公司联系人",
              "招聘机会",
              "知识图谱",
              "论文",
              "专利",
              "任务",
            ],
            multiple: true,
            onChange: setTypes,
          },
        ]}
      />
      <div className="s4-recycle-table">
        <header>
          <span />
          <span>资产</span>
          <span>删除原因</span>
          <span>删除时间</span>
          <span>自动清理</span>
          <span>操作</span>
        </header>
        {rows.map((item) => (
          <article key={item.id}>
            <CustomCheckbox
              checked={selected.has(item.id)}
              ariaLabel={`选择${item.name}`}
              onChange={(checked) => {
                const next = new Set(selected);
                if (checked) next.add(item.id);
                else next.delete(item.id);
                setSelected(next);
              }}
            />
            <b>
              {item.name}
              <small>
                {item.type} · {item.operator}
              </small>
            </b>
            <span>{item.reason}</span>
            <span>{item.deletedAt}</span>
            <StatusBadge tone="warning">{item.remaining}</StatusBadge>
            <div>
              <button
                type="button"
                onClick={() => {
                  setRestoreTarget(item);
                  setRestoreName(item.name);
                  setConflict(item.type === "公司" && !item.local);
                  setRestoreError("");
                }}
              >
                恢复
              </button>
              <button
                type="button"
                className="is-danger"
                onClick={() => setDeleteTarget(item)}
              >
                永久删除
              </button>
            </div>
          </article>
        ))}
      </div>
      {!rows.length ? <StateBanner title="回收站中没有匹配记录" /> : null}
      <Modal
        open={Boolean(restoreTarget)}
        close={() => setRestoreTarget(null)}
        title={
          conflict
            ? "恢复前需要处理名称冲突"
            : `恢复${restoreTarget?.type || "资产"}`
        }
        description={
          conflict
            ? "删除后已经创建了同名公司，不能直接恢复为第二条正式资产"
            : `“${restoreTarget?.name || ""}”将恢复到原来的业务位置`
        }
        footer={
          <>
            <Button onClick={() => setRestoreTarget(null)}>取消</Button>
            <Button
              tone="primary"
              onClick={async () => {
                try {
                  if (restoreTarget.lifecycleType)
                    runOpportunityCommand(restoreTarget.lifecycleType + ".restore", { id: restoreTarget.id, title: restoreName });
                  else if (restoreTarget.localGraph)
                    restoreGraph(restoreTarget.id, false, restoreName);
                  else if (restoreTarget.local)
                    await restoreCompanyContact(restoreTarget);
                  else
                    setRemovedDemoIds((current) => [
                      ...current,
                      restoreTarget.id,
                    ]);
                } catch (failure) {
                  setRestoreError(failure.message);
                  return;
                }
                setRestoreTarget(null);
                notify(conflict ? "已进入公司身份合并审核" : "资产已恢复");
              }}
            >
              {conflict ? "审核并合并" : "确认恢复"}
            </Button>
          </>
        }
      >
        {restoreError ? (
          <StateBanner tone="danger" title={restoreError} />
        ) : null}
        {restoreTarget?.localGraph || restoreTarget?.lifecycleType === "opportunity" ? (
          <FormField label={restoreTarget?.localGraph ? "恢复后的图谱名称" : "恢复后的机会名称"} required>
            <TextInput
              value={restoreName}
              onChange={(value) => {
                setRestoreName(value);
                setRestoreError("");
              }}
            />
          </FormField>
        ) : null}
        {conflict ? (
          <div className="s4-duplicate-compare">
            <article>
              <small>回收站记录</small>
              <b>{restoreTarget?.name}</b>
              <p>包含 2 个联系人和 1 个岗位引用</p>
            </article>
            <Icon name="refresh" />
            <article>
              <small>当前资产</small>
              <b>{restoreTarget?.name}</b>
              <p>3 天前手动创建</p>
            </article>
          </div>
        ) : (
          <div className="s4-restore-impact">
            <Icon name="refresh" />
            <span>
              <b>恢复关系上下文</b>
              <p>
                删除前的正式关系会在满足当前门禁后恢复；已删除或冲突关系会进入待确认。
              </p>
            </span>
          </div>
        )}
      </Modal>
      <Modal
        open={Boolean(deleteTarget)}
        close={() => setDeleteTarget(null)}
        title="永久删除"
        description="此操作无法撤销"
        footer={
          <>
            <Button onClick={() => setDeleteTarget(null)}>取消</Button>
            <Button
              tone="danger"
              onClick={async () => {
                try {
                  if (deleteTarget.lifecycleType)
                    runOpportunityCommand(deleteTarget.lifecycleType + ".purge", { id: deleteTarget.id });
                  else if (deleteTarget.localGraph)
                    restoreGraph(deleteTarget.id, true);
                  else if (deleteTarget.local)
                    await restoreCompanyContact(deleteTarget, true);
                  else
                    setRemovedDemoIds((current) => [
                      ...current,
                      deleteTarget.id,
                    ]);
                } catch {
                  notify("永久删除失败，请检查浏览器存储后重试。", "error");
                  return;
                }
                setDeleteTarget(null);
                notify("资产已永久删除");
              }}
            >
              确认永久删除
            </Button>
          </>
        }
      >
        <div className="s4-delete-impact">
          <Icon name="warning" />
          <span>
            <b>将永久清理资产和专属文件</b>
            <p>
              其他独立资产不会删除，相关页面显示“对象已删除”。
            </p>
            {["候选人", "公司联系人", "联系人"].includes(deleteTarget?.type) ? (
              <p>
                这是代表真实的人的资产：资料版本和文件（简历、附件）会删除；任务对话和运行记录里关于这个人的姓名、联系方式、简历摘录会换成“已删除的{deleteTarget?.type === "候选人" ? "候选人" : "联系人"}”；知识图谱里的节点和连线保留，只解除关联。
              </p>
            ) : null}
            {deleteTarget?.type === "公司" ? (
              <p>
                和公司一起进回收站的联系人也会一并永久删除，按同样的规则清理：联系人的资料和文件删除；任务对话和运行记录里关于他们的姓名、联系方式换成“已删除的联系人”；知识图谱节点保留，只解除关联。
              </p>
            ) : null}
          </span>
        </div>
      </Modal>
    </div>
  );
}

export function CommonStatesPage() {
  const notify = useToast();
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  return (
    <div className="s4-page">
      <AssetPageHeader
        eyebrow="阶段四验收"
        title="公共状态与异常路径"
        description="集中检查产品级状态，不需要在每个资产页面重复制造演示数据。"
      />
      <div className="s4-state-gallery">
        <section>
          <h2>列表与详情状态</h2>
          <div>
            <StateBanner
              title="正常信息"
              description="明确说明当前状态与下一步。"
            />
            <StateBanner
              tone="success"
              icon="check"
              title="处理成功"
              description="资产已写入并可追溯。"
            />
            <StateBanner
              tone="warning"
              icon="warning"
              title="需要用户处理"
              description="存在冲突，后续流程暂时停止。"
            />
            <StateBanner
              tone="danger"
              icon="warning"
              title="处理失败"
              description="保留输入和当前上下文，可安全重试。"
            />
          </div>
        </section>
        <section>
          <h2>按钮状态</h2>
          <div className="s4-button-state-row">
            <Button
              tone="primary"
              loading={loading}
              onClick={() => {
                setLoading(true);
                window.setTimeout(() => setLoading(false), 900);
              }}
            >
              提交处理
            </Button>
            <Button
              disabled={disabled}
              onClick={() => notify("普通操作已执行")}
            >
              普通操作
            </Button>
            <Button
              tone="danger"
              onClick={() => notify("危险操作需要二次确认", "error")}
            >
              危险操作
            </Button>
            <button
              type="button"
              className="s4-text-action"
              onClick={() => setDisabled((value) => !value)}
            >
              切换禁用态
            </button>
          </div>
        </section>
        <section>
          <h2>权限受限</h2>
          <div className="s4-permission-state">
            <Icon name="warning" />
            <span>
              <b>当前账号无权查看联系方式</b>
              <p>页面仍显示候选人业务摘要，敏感字段隐藏且不可通过导出绕过。</p>
            </span>
            <Button disabled>查看联系方式</Button>
          </div>
        </section>
        <section>
          <h2>空状态</h2>
          <div className="s4-custom-empty">
            <Icon name="search" />
            <b>当前筛选没有结果</b>
            <p>清空筛选或调整搜索词后再试。</p>
            <Button onClick={() => notify("筛选已清空")}>清空筛选</Button>
          </div>
        </section>
      </div>
    </div>
  );
}
