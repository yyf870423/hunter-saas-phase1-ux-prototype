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
  ProgressBar,
  SelectMenu,
  StateBanner,
  StatusBadge,
  StatusFromText,
  TextArea,
  TextInput,
  useToast,
} from "./asset-ui";
import { exportTasks, importTasks, recycleItems } from "./data";

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
  const [params] = useSearchParams();
  const [wizardOpen, setWizardOpen] = useState(Boolean(params.get("type")));
  const [step, setStep] = useState("file");
  const [type, setType] = useState(
    params.get("type") === "mappings" || params.get("type") === "mapping"
      ? "人才版图"
      : params.get("type") === "papers"
        ? "论文"
        : params.get("type") === "patents"
          ? "专利"
          : "候选人",
  );
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [duplicateChoice, setDuplicateChoice] = useState("replace");
  const visibleTasks = useMemo(
    () =>
      importTasks.filter((task) =>
        `${task.name}${task.file}${task.type}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      ),
    [query],
  );
  const taskPages = Math.max(1, Math.ceil(visibleTasks.length / 2));
  const taskRows = visibleTasks.slice((page - 1) * 2, page * 2);
  useEffect(() => setPage(1), [query]);
  useEffect(() => {
    if (params.get("type") === "mappings" || params.get("type") === "mapping") {
      navigate("/mappings/mapping-embodied?panel=import", { replace: true });
    }
  }, [navigate, params]);
  const next = () => {
    if (!files.length) return;
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setStep(
        files[0]?.name?.includes("错误")
          ? "error"
          : type === "人才版图"
            ? "duplicate"
            : "confirm",
      );
    }, 700);
  };
  const finish = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setStep("success");
      notify("导入任务已创建，当前页面会持续更新状态", "info");
    }, 750);
  };
  const closeWizard = () => {
    setWizardOpen(false);
    setStep("file");
    setFiles([]);
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
      <FilterBar
        query={query}
        setQuery={setQuery}
        placeholder="搜索导入任务或文件名"
        filters={[
          {
            label: "资产类型",
            value: [],
            options: ["候选人", "公司", "岗位", "论文", "专利"],
            multiple: true,
          },
          {
            label: "任务状态",
            value: [],
            options: ["处理中", "已完成", "需要处理", "失败"],
            multiple: true,
          },
        ]}
      />
      <div className="s4-task-table">
        <header>
          <span>导入任务</span>
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
      <Pagination page={page} pages={taskPages} onChange={setPage} />
      <Modal
        open={wizardOpen}
        close={closeWizard}
        closeDisabled={busy}
        size="xl"
        title={
          step === "file"
            ? "导入业务数据"
            : step === "confirm"
              ? "确认导入结果"
              : step === "duplicate"
                ? "发现同名人才版图"
                : step === "error"
                  ? "文件格式校验失败"
                  : "导入任务已创建"
        }
        description={
          step === "file"
            ? "选择资产类型和文件，系统会先校验格式再解析内容"
            : step === "confirm"
              ? "本次解析发现新建、补充、待确认和失败结果"
              : step === "duplicate"
                ? "“具身智能 VLA 核心人才版图”已存在于当前工作空间"
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
            <Button tone="primary" onClick={closeWizard}>
              查看任务列表
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
                options={[
                  "候选人",
                  "公司",
                  "岗位",
                  "联系人",
                  "招聘机会",
                  "人才版图",
                  "论文",
                  "专利",
                ]}
                onChange={setType}
              />
            </FormField>
            <FileDrop
              files={files}
              onFiles={setFiles}
              accept={
                type === "人才版图"
                  ? "XLSX、MM、FreeMind"
                  : type === "候选人"
                    ? "PDF、DOCX、ZIP、XLSX"
                    : "PDF、DOCX、XLSX"
              }
              multiple={type !== "人才版图"}
            />
            <a
              href="#sample"
              onClick={(event) => {
                event.preventDefault();
                notify(`${type}导入示例已开始下载`);
              }}
            >
              下载 {type} 导入示例
            </a>
          </div>
        ) : null}
        {step === "confirm" ? (
          <div className="s4-import-summary">
            <dl>
              <div>
                <dt>新建</dt>
                <dd>18</dd>
              </div>
              <div>
                <dt>补充已有</dt>
                <dd>7</dd>
              </div>
              <div>
                <dt>待身份确认</dt>
                <dd>2</dd>
              </div>
              <div>
                <dt>失败</dt>
                <dd>1</dd>
              </div>
            </dl>
            <StateBanner
              tone="warning"
              icon="warning"
              title="2 条资料需要后续身份审核"
              description="只有姓名或身份依据不足的资料不会创建正式候选人，将保留为人物线索。"
            />
            <div className="s4-import-result-list">
              <article>
                <StatusBadge tone="success">新建</StatusBadge>
                <span>
                  <b>陈若凡</b>
                  <small>智源研究院 · 多模态算法研究员</small>
                </span>
              </article>
              <article>
                <StatusBadge tone="info">补充</StatusBadge>
                <span>
                  <b>林昊</b>
                  <small>发现 3 项更新，进入字段变化审核</small>
                </span>
              </article>
              <article>
                <StatusBadge tone="warning">待确认</StatusBadge>
                <span>
                  <b>王奕</b>
                  <small>同名候选人和论文单位时间线冲突</small>
                </span>
              </article>
            </div>
          </div>
        ) : null}
        {step === "duplicate" ? (
          <div className="s4-duplicate-import">
            <div>
              <article>
                <small>待导入</small>
                <b>具身智能 VLA 核心人才版图</b>
                <p>37 位人物 · 64 条关系</p>
              </article>
              <Icon name="refresh" />
              <article>
                <small>当前版图</small>
                <b>具身智能 VLA 核心人才版图</b>
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
              description="导入版图命名为“具身智能 VLA 核心人才版图（2）”"
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
            <code>工作表：人才版图 · 单元格 C3</code>
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
            <ProgressBar value={18} label="正在解析文件结构" />
          </div>
        ) : null}
      </Modal>
      <Modal
        open={Boolean(detail)}
        close={() => setDetail(null)}
        size="lg"
        title={detail?.name || "导入详情"}
        description={detail?.file}
        footer={<Button onClick={() => setDetail(null)}>关闭</Button>}
      >
        <div className="s4-import-detail">
          <ProgressBar
            value={detail?.progress || 0}
            label={detail?.result || ""}
          />
          <div className="s4-process-log">
            <article>
              <Icon name="check" />
              <span>
                <b>文件格式校验</b>
                <small>通过 · 0.4 秒</small>
              </span>
            </article>
            <article>
              <Icon name="check" />
              <span>
                <b>解析与标准化</b>
                <small>已处理文件内容</small>
              </span>
            </article>
            <article>
              <Icon name={detail?.status === "处理中" ? "clock" : "check"} />
              <span>
                <b>身份查重与写入</b>
                <small>
                  {detail?.status === "处理中" ? "正在处理" : detail?.result}
                </small>
              </span>
            </article>
          </div>
        </div>
      </Modal>
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
                "联系人",
                "招聘机会",
                "人才版图",
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
  const notify = useToast();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [conflict, setConflict] = useState(false);
  const rows = recycleItems.filter((item) =>
    `${item.type}${item.name}`.includes(query),
  );
  return (
    <div className="s4-page">
      <AssetPageHeader
        eyebrow="数据管理"
        title="回收站"
        description="正式资产删除后保留 30 天；到期自动永久清理。"
        count={rows.length}
      />
      <DataManagementNav value="recycle" />
      <div className="s4-recycle-guidance">
        <StateBanner
          tone="warning"
          icon="warning"
          title="回收站中的关系只用于恢复和影响说明"
          description="删除不会级联其他独立资产；永久清理后，其他对象只保留必要历史名称或已删除引用。"
        />
      </div>
      <FilterBar
        query={query}
        setQuery={setQuery}
        placeholder="搜索名称或资产类型"
        filters={[
          {
            label: "资产类型",
            value: [],
            options: [
              "候选人",
              "公司",
              "岗位",
              "联系人",
              "招聘机会",
              "人才版图",
              "论文",
              "专利",
            ],
            multiple: true,
            onChange: () => {},
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
                  setConflict(item.type === "公司");
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
      <Pagination page={1} pages={2} onChange={() => {}} />
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
              onClick={() => {
                setRestoreTarget(null);
                notify(conflict ? "已进入公司身份合并审核" : "资产已恢复");
              }}
            >
              {conflict ? "审核并合并" : "确认恢复"}
            </Button>
          </>
        }
      >
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
              onClick={() => {
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
              其他独立资产不会删除，但相关页面只保留必要历史名称和“已删除”引用。
            </p>
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
