import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { StatusBadge } from "../stage1/ui";

const groups = [
  {
    number: "01",
    title: "候选人与身份",
    description: "复杂资料、文件、来源、合并和变化审核。",
    links: [
      ["候选人列表", "/candidates", "搜索、筛选、列配置、批量操作、分页和删除"],
      [
        "候选人详情",
        "/candidates/candidate-linhao",
        "六个 Tab 与编辑、补全、文件、沟通和关系",
      ],
      [
        "上传简历",
        "/candidates/new?mode=upload",
        "文件门禁、解析、查重和明确处理反馈",
      ],
      [
        "身份合并审核",
        "/reviews/identity/candidate-linhao",
        "字段选择、关系保留、来源依据和可撤销合并",
      ],
      [
        "字段变化审核",
        "/reviews/fields/candidate-linhao",
        "按字段采用或拒绝建议",
      ],
      ["来源证据", "/sources/candidate-linhao", "字段到来源的可解释关系"],
    ],
  },
  {
    number: "02",
    title: "岗位与招聘推进",
    description: "岗位版本、角色门禁、匹配与岗位级流程。",
    links: [
      ["岗位列表", "/positions", "岗位搜索、公司地点筛选和状态"],
      [
        "岗位资料",
        "/positions/position-vla",
        "JD、确认要求、岗位解析和寻访关键词",
      ],
      [
        "候选人流程",
        "/positions/position-vla?tab=pipeline",
        "泳道、列表、阶段移动和岗位级阶段配置",
      ],
      [
        "匹配结果",
        "/positions/position-vla?tab=matching",
        "版本、角色硬门槛、条件扣分、理由和风险",
      ],
      ["新建岗位", "/positions/new", "手动资料与自然语言 AI 创建分支"],
    ],
  },
  {
    number: "03",
    title: "客户与招聘机会",
    description: "公司、联系人、机会和反向关系所有权。",
    links: [
      ["公司列表", "/companies", "行业搜索、列配置与关联摘要"],
      [
        "公司详情",
        "/companies/company-xinglan",
        "资料、招聘业务、联系人、任职人才、版图与工作",
      ],
      ["新建公司", "/companies/new", "手动、文件和 Agent 三种输入"],
      [
        "联系人详情",
        "/contacts/contact-chenyu",
        "多公司归属、身份关系和沟通记录",
      ],
      [
        "招聘机会详情",
        "/opportunities/opportunity-xinglan",
        "需求依据、方向拆分、创建或关联岗位",
      ],
    ],
  },
  {
    number: "04",
    title: "人才版图",
    description: "目标清单和同一关系数据的多种投影视图。",
    links: [
      ["人才版图列表", "/mappings", "卡片列表、目标与缺口摘要"],
      [
        "摸排概况",
        "/mappings/mapping-embodied",
        "可理解、可行动、可预期的目标清单",
      ],
      [
        "公司与生态",
        "/mappings/mapping-embodied?tab=ecosystem",
        "公司竞争、合作和人才来源关系",
      ],
      [
        "组织与方向",
        "/mappings/mapping-embodied?tab=organization",
        "组织树、方向角色和人才流动",
      ],
      [
        "人物与关系",
        "/mappings/mapping-embodied?tab=people",
        "人物关系、学术脉络和联系路径",
      ],
      [
        "更新与审核",
        "/mappings/mapping-embodied?tab=updates",
        "增量批次、影响图和冲突审核",
      ],
    ],
  },
  {
    number: "05",
    title: "论文与专利",
    description: "成果身份、人物消歧和来源证据。",
    links: [
      ["论文列表", "/papers", "单列卡片、搜索筛选和批量操作"],
      [
        "论文详情",
        "/papers/paper-vla-survey",
        "双语摘要、作者机构、身份和版图",
      ],
      ["专利列表", "/patents", "专利类型、发明人和权利人搜索"],
      [
        "专利详情",
        "/patents/patent-manipulation",
        "申请信息、发明人身份和共同发明关系",
      ],
    ],
  },
  {
    number: "06",
    title: "统一数据管理",
    description: "导入、导出、回收站和全局状态。",
    links: [
      ["数据导入", "/data/imports", "格式校验、解析、查重、结果确认和失败"],
      ["人才版图重名导入", "/data/imports?type=mapping", "替换或保留两张版图"],
      ["数据导出", "/data/exports", "异步生成、限时下载和状态"],
      ["回收站", "/recycle-bin", "30 天恢复、永久删除和恢复冲突"],
      [
        "公共状态",
        "/review/stage-4/states",
        "normal、loading、empty、error、disabled 和权限受限",
      ],
    ],
  },
];

const stateLinks = [
  ["候选人加载中", "/candidates?state=loading"],
  ["候选人空状态", "/candidates?state=empty"],
  ["候选人加载失败", "/candidates?state=error"],
  ["候选人权限受限", "/candidates?state=limited"],
  ["详情加载失败", "/candidates/candidate-linhao?state=error"],
  ["详情敏感信息受限", "/candidates/candidate-linhao?state=limited"],
];

export function Stage4ReviewPage() {
  return (
    <main className="s4-review-page" data-theme="light">
      <header className="s4-review-hero">
        <span className="s4-review-brand">
          <i>
            <Icon name="sparkles" />
          </i>
          Hunter SaaS
        </span>
        <StatusBadge tone="info">阶段四待审批</StatusBadge>
        <h1>业务资产与统一数据管理</h1>
        <p>
          八类正式业务资产使用同一套创建、编辑、关系、来源、文件、审核、删除与恢复原则。本页列出全部验收入口和异常状态。
        </p>
        <Link className="s4-review-primary" to="/candidates">
          从候选人列表开始验收
          <Icon name="chevronRight" />
        </Link>
      </header>
      {groups.map((group) => (
        <section className="s4-review-section" key={group.number}>
          <div>
            <small>{group.number}</small>
            <h2>{group.title}</h2>
            <p>{group.description}</p>
          </div>
          <div className="s4-review-links">
            {group.links.map(([title, route, description]) => (
              <Link to={route} key={`${group.number}-${title}`}>
                <span>
                  <b>{title}</b>
                  <small>{description}</small>
                </span>
                <Icon name="chevronRight" />
              </Link>
            ))}
          </div>
        </section>
      ))}
      <section className="s4-review-section">
        <div>
          <small>07</small>
          <h2>异常状态</h2>
          <p>直接进入可重复验收的页面状态。</p>
        </div>
        <div className="s4-review-state-links">
          {stateLinks.map(([title, route]) => (
            <Link to={route} key={title}>
              {title}
              <Icon name="chevronRight" />
            </Link>
          ))}
        </div>
      </section>
      <section className="s4-review-boundary">
        <h2>交叉验证口径</h2>
        <div>
          <article>
            <Icon name="database" />
            <b>一份业务事实</b>
            <p>公司反向列表、岗位流程和成果人物关系不维护第二份数据。</p>
          </article>
          <article>
            <Icon name="refresh" />
            <b>输入必有反馈</b>
            <p>新建、补充、无变化、待确认和失败都明确展示。</p>
          </article>
          <article>
            <Icon name="warning" />
            <b>门禁不可绕过</b>
            <p>身份冲突、格式错误和敏感关系即使自动授权也会阻塞。</p>
          </article>
          <article>
            <Icon name="trash" />
            <b>统一回收站</b>
            <p>正式资产保留 30 天，不级联删除其他独立资产。</p>
          </article>
        </div>
      </section>
    </main>
  );
}
