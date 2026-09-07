import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AssetPageHeader, Button, CustomCheckbox, DatePicker, DefinitionGrid, EntitySelect, FieldGroup,
  FormField, Modal, SelectMenu, StateBanner, TextArea, useToast } from "./asset-ui";
import { configureOpportunityDemo, getOpportunityPermission, resetOpportunityDemo, runOpportunityCommand, useOpportunityState } from "./opportunity-store";
import { currentFollowup, opportunityNow } from "./opportunity-domain";
import { useCompanyContacts } from "./company-contact-store";
import { displayDateTime, localDateTime } from "./OpportunityComponents";
import { opportunityDemoCases, demoOpportunityPrompt } from "./opportunity-demo-data";

export function OpportunityDemoPage() {
  const state = useOpportunityState();
  const context = useCompanyContacts();
  const navigate = useNavigate();
  const notify = useToast();
  const [caseId, setCaseId] = useState("chengyue");
  const [opportunityId, setOpportunityId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [clock, setClock] = useState(localDateTime(opportunityNow(state)));
  const [failure, setFailure] = useState("下一次业务写入");
  const [reset, setReset] = useState(false);
  const example = opportunityDemoCases.find((item) => item.id === caseId);
  const company = context.companies.find((item) => item.name === example.company && !context.deletedCompanies.includes(item.id));
  const selected = state.opportunities.find((item) => item.id === opportunityId && !item.deletedAt);
  const plan = selected ? currentFollowup(state, selected.id) : null;
  const prompt = demoOpportunityPrompt(example);
  const copy = async (value) => { try { await navigator.clipboard.writeText(value); notify("演示输入已复制"); } catch { notify("无法访问剪贴板，可在下方输入区选择文字。", "error"); } };
  const setTime = (value) => {
    try { runOpportunityCommand("clock.set", { value }); runOpportunityCommand("notifications.tick"); setClock(localDateTime(value)); notify("演示时间已更新"); }
    catch (error) { notify(error.message, "error"); }
  };
  const downloadText = () => {
    const blob = new Blob([prompt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob), link = document.createElement("a");
    link.href = url; link.download = example.company + "招聘需求.txt"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <div className="s4-page"><AssetPageHeader title="招聘机会演示" actions={<Button onClick={() => navigate("/opportunities")}>招聘机会列表</Button>} />
    <div className="s4-detail-stack"><StateBanner title="【原型说明，正式实现不展示】" description="这里仅选择模拟输入、推进演示时钟和注入失败。正式机会、岗位和任务仍需经过业务页面的确认；没有真实邮件发送、云端调度或生产 Agent。" />
      <FieldGroup title="演示输入"><div className="s4-form-grid"><FormField label="需求样本"><EntitySelect value={caseId} options={opportunityDemoCases.map((item) => ({ value: item.id, label: item.company }))} onChange={setCaseId} /></FormField>
        <FormField label="当前公司"><Button icon={company ? "building" : "plus"} onClick={() => navigate(company ? "/companies/" + company.id + "?tab=recruiting" : "/companies/new?name=" + encodeURIComponent(example.company))}>{company ? "打开公司招聘业务" : "填写新公司资料"}</Button></FormField>
        <FormField label="机会输入" span={2}><TextArea value={prompt} rows={10} /></FormField></div>
        <div className="s4-command-actions"><Button icon="edit" onClick={() => navigate("/opportunities/new?demoCase=" + caseId)}>手工新建机会</Button>
          <Button icon="task" onClick={() => navigate("/new?kind=opportunity&prompt=" + encodeURIComponent(prompt))}>在新任务中打开</Button>
          <Button icon="link" onClick={() => navigate("/new?kind=opportunity&prompt=" + encodeURIComponent("来源链接：" + location.origin + location.pathname + "#/demo/opportunity-source/" + caseId + "\n\n来源原文：\n" + prompt))}>链接与原文</Button>
          <Button icon="copy" onClick={() => copy(prompt)}>复制需求</Button>
          <Button icon="download" onClick={downloadText}>下载 TXT</Button>
        </div>
      </FieldGroup>
      <FieldGroup title="跟进与形成岗位"><div className="s4-form-grid"><FormField label="目标招聘机会"><EntitySelect value={opportunityId} label="选择实际机会" searchable
        options={state.opportunities.filter((item) => !item.deletedAt).map((item) => ({ value: item.id, label: item.title }))} onChange={setOpportunityId} /></FormField>
        <FormField label="原任务"><EntitySelect value={taskId} label="选择已有需求任务" searchable options={state.tasks.filter((item) => !item.deletedAt && item.kind === "opportunity").map((item) => ({ value: item.id, label: item.title + " · " + item.id.slice(-6) }))} onChange={setTaskId} /></FormField></div>
        <div className="s4-command-actions"><Button disabled={!selected} onClick={() => navigate("/opportunities/" + opportunityId)}>机会与跟进</Button><Button disabled={!selected} onClick={() => navigate("/opportunities/" + opportunityId + "?tab=directions")}>招聘方向与岗位</Button>
          <Button disabled={!taskId} onClick={() => navigate("/tasks/" + taskId + "?input=" + encodeURIComponent(prompt))}>补充到原任务</Button>
          <Button icon="copy" onClick={() => copy(example.algorithmJd)}>复制第一方向 JD</Button><Button icon="copy" onClick={() => copy(example.simulationJd)}>复制第二方向 JD</Button></div>
      </FieldGroup>
      <FieldGroup title="演示时间与故障"><DefinitionGrid columns={2} items={[["当前演示时间", displayDateTime(opportunityNow(state))], ["当前跟进安排", plan ? plan.subject + " · " + displayDateTime(plan.dueAt) : "未选择或未安排"]]} />
        <div className="s4-form-grid"><FormField label="演示时间"><DatePicker mode="datetime" value={clock} onChange={setClock} /></FormField><FormField label="时间操作"><div className="s4-command-actions">
          <Button icon="clock" onClick={() => setTime(clock)}>应用时间</Button><Button disabled={!plan} icon="bell" onClick={() => setTime(new Date(new Date(plan.dueAt).getTime() + 60000).toISOString())}>推进到跟进到期</Button></div></FormField>
          <FormField label="失败范围"><SelectMenu value={failure} options={["下一次业务写入", "下一次提醒派发", "下一次匹配处理"]} onChange={setFailure} /></FormField>
          <FormField label="故障操作"><Button icon="warning" onClick={() => { configureOpportunityDemo({ failure: "模拟失败：资料和输入已保留，请重试。", operation: failure === "下一次提醒派发" ? "notifications.tick" : failure === "下一次匹配处理" ? "position.match" : "write" }); notify("一次性失败已设置"); }}>注入一次失败</Button></FormField>
        </div><CustomCheckbox checked={getOpportunityPermission()} onChange={(limited) => configureOpportunityDemo({ limited })} label="模拟无修改权限" />
      </FieldGroup>
      <FieldGroup title="其他形成入口"><div className="s4-command-actions"><Button onClick={() => navigate("/signals")}>洞察中心</Button><Button onClick={() => navigate("/tasks/client-xinglan")}>客户开发与回复</Button>
        <Button onClick={() => navigate("/recycle-bin")}>回收站</Button><Button onClick={() => navigate("/components")}>公共组件状态</Button>
        <Button tone="danger-outline" icon="refresh" onClick={() => setReset(true)}>重置机会演示资料</Button></div>
      </FieldGroup>
    </div><Modal open={reset} close={() => setReset(false)} title="重置机会演示资料" footer={<><Button onClick={() => setReset(false)}>取消</Button><Button tone="danger" onClick={() => {
      try { resetOpportunityDemo(true); setReset(false); setOpportunityId(""); setTaskId(""); notify("机会演示资料已重置"); } catch (error) { notify(error.message, "error"); }
    }}>确认重置</Button></>}><p>仅重置本轮机会、方向、跟进、通知、导入记录、新岗位和新任务。已有公司、联系人、其他资产及文件原件不删除。</p></Modal>
  </div>;
}

export function OpportunityDemoSourcePage() {
  const { caseId } = useParams();
  const example = opportunityDemoCases.find((item) => item.id === caseId);
  return <main className="s4-page"><AssetPageHeader title="招聘需求来源原件" />
    <StateBanner title="【原型说明，正式实现不展示】" description="这是演示用的虚构客户资料。" />
    <p className="s4-long-copy">{example ? demoOpportunityPrompt(example) : "来源样本不存在"}</p>
  </main>;
}
