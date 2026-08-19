import { useState } from "react";
import { Icon } from "../components/Icon";
import {
  Button,
  EmptyState,
  Modal,
  SearchField,
  StatusBadge,
  Tabs,
  useToast,
} from "./ui";

export function ComponentsPage() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const notify = useToast();
  return (
    <div className="s1-component-page">
      <header className="s1-dashboard-head">
        <div>
          <small>产品级组件库</small>
          <h1>阶段一公共组件</h1>
          <p>后续页面只能复用或扩展这些组件，不在业务页面中临时创造样式。</p>
        </div>
      </header>
      <section className="s1-component-section">
        <h2>按钮与状态</h2>
        <div className="s1-component-row">
          <Button tone="primary" icon="plus">
            主要操作
          </Button>
          <Button>次要操作</Button>
          <Button tone="ghost">文字操作</Button>
          <Button tone="danger" icon="trash">
            删除
          </Button>
          <Button loading>处理中</Button>
          <Button disabled>不可操作</Button>
        </div>
        <div className="s1-component-row">
          <StatusBadge tone="info">运行中</StatusBadge>
          <StatusBadge tone="warning">等待用户</StatusBadge>
          <StatusBadge tone="success">已完成</StatusBadge>
          <StatusBadge tone="danger">失败</StatusBadge>
          <StatusBadge tone="neutral">等待外部</StatusBadge>
        </div>
      </section>
      <section className="s1-component-section">
        <h2>输入与切换</h2>
        <div className="s1-component-controls">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="搜索候选人、公司或岗位"
          />
          <Tabs
            label="内容范围"
            value={tab}
            onChange={setTab}
            items={[
              { value: "all", label: "全部", count: 12 },
              { value: "active", label: "进行中", count: 5 },
              { value: "done", label: "已完成", count: 7 },
            ]}
          />
        </div>
      </section>
      <section className="s1-component-section">
        <h2>反馈与浮层</h2>
        <div className="s1-component-row">
          <Button onClick={() => notify("修改已保存", "success")}>
            成功 Toast
          </Button>
          <Button onClick={() => notify("当前页面只展示阶段一能力", "info")}>
            信息 Toast
          </Button>
          <Button onClick={() => notify("数据保存失败，请稍后重试", "error")}>
            错误 Toast
          </Button>
          <Button tone="primary" onClick={() => setModalOpen(true)}>
            打开 Modal
          </Button>
        </div>
      </section>
      <section className="s1-component-section s1-component-state-grid">
        <article>
          <EmptyState
            icon="route"
            title="还没有业务主线"
            description="从一个真实目标开始，Hunter 会整理后续工作。"
            action={<Button tone="primary">新建业务主线</Button>}
          />
        </article>
        <article className="s1-permission-sample">
          <i>
            <Icon name="warning" />
          </i>
          <div>
            <b>平台登录已失效</b>
            <p>相关任务已暂停，已获取结果和检查点已保留。</p>
          </div>
          <Button size="sm">处理登录</Button>
        </article>
      </section>
      <Modal
        open={modalOpen}
        close={() => setModalOpen(false)}
        title="确认继续此操作"
        description="统一 Modal 需要说明操作对象、影响和结果。"
        footer={
          <>
            <Button onClick={() => setModalOpen(false)}>取消</Button>
            <Button
              tone="primary"
              onClick={() => {
                setModalOpen(false);
                notify("操作已确认", "success");
              }}
            >
              确认
            </Button>
          </>
        }
      >
        <p className="s1-modal-copy">
          确认后只更新当前工作台演示状态，不会创建真实业务数据。
        </p>
      </Modal>
    </div>
  );
}
