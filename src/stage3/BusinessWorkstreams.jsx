import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Button, Modal, useToast } from "../stage1/ui";
import {
  Composer,
  createMarkdownTable,
  DecisionRequest,
  EmailDraftReview,
  HunterReply,
  RuntimeBar,
  UserMessage,
  WorkHistory,
} from "../stage2/automation-ui";
import { InspectionPanel } from "../stage2/ReviewWorkspace";
import { WorkstreamHeader } from "../stage2/Workstreams";
import { workItems } from "../stage2/data";
import {
  ContactReviewWorkspace,
  LandscapeReviewWorkspace,
  PositionMatchReviewWorkspace,
} from "./BusinessReviewWorkspaces";
import {
  businessScenarios,
  careerMatches,
  clientEvidence,
  contactReviewRows,
  mappingCompanies,
  mappingPeople,
  mappingRelationshipViews,
} from "./data";

function forcedPhase(scenarioId, state) {
  if (state === "stream-error") return 1;
  if (state === "limited" || state === "error") return 2;
  if (scenarioId === "client-xinglan") {
    if (state === "no-contact") return 3;
    if (state === "waiting") return 5;
    if (state === "reply") return 6;
  }
  if (scenarioId === "mapping-embodied") {
    if (state === "conflict" || state === "gaps" || state === "waiting")
      return 4;
  }
  if (scenarioId === "career-linhao") {
    if (state === "no-position") return 3;
    if (state === "waiting") return 5;
    if (state === "new-resume") return 6;
  }
  return null;
}

function buildPlan(scenario, phase, paused, planAdjusted) {
  return scenario.plan.map((step) => {
    let status = "pending";
    let statusDetail;
    if (phase >= step.doneAt) status = "done";
    else if (step.waitAt === phase || step.externalAt === phase) {
      status = "waiting-user";
      statusDetail =
        step.externalAt === phase
          ? "正在等待外部结果，等待期间不持续消耗 Agent 用量。"
          : "需要用户审核、授权或补充信息后继续。";
    } else if (phase === step.doneAt - 1) status = "running";
    if (paused && status === "running") {
      status = planAdjusted ? "adjusted" : "paused";
      statusDetail = planAdjusted
        ? "只重做受到新信息影响的范围，已完成结果继续保留。"
        : "当前检查点和已有结果已保留。";
    }
    return { ...step, status, statusDetail };
  });
}

const inspectionContexts = {
  "client-xinglan": {
    resultDestination: "星澜机器人招聘合作 · 公司、联系人或招聘机会",
    checkpoints: [
      {
        title: "公开来源读取完成",
        detail: "来源权限、时间和公司身份已经检查",
        done: true,
      },
      {
        title: "联系人身份与联系方式已核验",
        detail: "正式联系人、人物线索和已有关系已经分开",
        done: true,
      },
      {
        title: "等待业务审核或联系授权",
        detail: "保存联系人和对外发送不会合并成一次授权",
        done: false,
      },
    ],
  },
  "mapping-embodied": {
    resultDestination: "具身智能核心人才版图 · 本批次增量更新",
    checkpoints: [
      {
        title: "公司与组织范围已检查",
        detail: "四家公司和三个方向均有明确摸排目标",
        done: true,
      },
      {
        title: "人物身份与关系已去重",
        detail: "已确认人物、人物线索和冲突项保持分层",
        done: true,
      },
      {
        title: "等待本批次审核",
        detail: "冲突和未知项不会覆盖已经确认的版图内容",
        done: false,
      },
    ],
  },
  "career-linhao": {
    resultDestination: "林昊职业机会 · 系统内岗位匹配与联系建议",
    checkpoints: [
      {
        title: "动向信号已核验",
        detail: "信号强弱和待核实信息已经保留",
        done: true,
      },
      {
        title: "系统有效岗位已匹配",
        detail: "未检索公开市场岗位，也没有自动联系候选人",
        done: true,
      },
      {
        title: "等待猎头判断或补充联系结果",
        detail: "新资料只会重做受影响的岗位判断",
        done: false,
      },
    ],
  },
};

function ReviewEntry({ icon, label, note, onOpen }) {
  return (
    <div className="s2-markdown-action-row">
      <Button tone="primary" icon={icon} onClick={onOpen}>
        {label}
      </Button>
      <small>{note}</small>
    </div>
  );
}

function ExternalWaitState({ title, description, meta, onAddResult }) {
  return (
    <section className="s3-external-wait">
      <div className="s3-wait-icon">
        <Icon name="clock" />
      </div>
      <span>
        <small>等待外部</small>
        <b>{title}</b>
        <p>{description}</p>
        <em>{meta}</em>
      </span>
      <Button tone="secondary" size="sm" onClick={onAddResult}>
        补充线下结果
      </Button>
    </section>
  );
}

function LocalBusinessError({ scenarioId, onRetry }) {
  const copy = {
    "client-xinglan": [
      "联系人核验没有完成",
      "两个公开来源暂时无法访问，公司与招聘信号结果已经保留。可以只重试联系人核验。",
    ],
    "mapping-embodied": [
      "人物关系批次处理失败",
      "公司、组织和人物结果已经保留；关系批次可以从检查点重新执行，不会覆盖已确认内容。",
    ],
    "career-linhao": [
      "一个岗位匹配任务没有完成",
      "另外两个岗位结果可以继续查看。重试只处理失败岗位，不重新计算全部结果。",
    ],
  }[scenarioId];
  return (
    <div className="s2-local-error" role="alert">
      <Icon name="warning" />
      <span>
        <b>{copy[0]}</b>
        <small>{copy[1]}</small>
      </span>
      <Button tone="secondary" size="sm" icon="refresh" onClick={onRetry}>
        重试失败步骤
      </Button>
    </div>
  );
}

function ClientTimeline({
  phase,
  forcedState,
  setInspection,
  openReview,
  setPhase,
  notify,
}) {
  return (
    <>
      {phase >= 1 ? (
        <HunterReply
          streaming={phase === 1}
          markdown={`我会先核验公司身份和招聘信号，再查找招聘负责人、可用联系方式和已有关系。融资或扩张新闻只作为线索，不会直接当成真实招聘需求。${
            phase >= 2
              ? `

- 正式资产写入和对外联系分开确认。
- 找不到联系人时保留已尝试路径和缺口，不生成虚假联系人。
- 需求信息不完整时只形成招聘机会，不直接创建岗位。`
              : ""
          }`}
        />
      ) : null}
      {phase >= 2 ? (
        <HunterReply
          markdown={`## 公司值得继续核实招聘需求

融资、官网岗位变化和行业关系能够相互印证团队扩张，但“是否接受猎头合作”和具体招聘预算仍未确认。

${createMarkdownTable(
  ["来源", "核验结果", "判断", "时间"],
  clientEvidence.map((row) => [
    row.source,
    row.finding,
    row.stance || row.confidence,
    row.freshness,
  ]),
)}`}
        >
          <button
            type="button"
            className="s2-markdown-link"
            onClick={() =>
              setInspection({
                title: "星澜机器人招聘信号证据",
                rows: clientEvidence,
                kind: "evidence",
                lead: "招聘信号由公司身份、近期招聘变化和关系信息共同核验。融资只作为线索，不会直接当作已确认需求。",
              })
            }
          >
            查看来源与核验详情 <Icon name="chevronRight" />
          </button>
          {phase === 2 ? (
            <p className="s2-progress-line">
              <span />
              正在核验招聘负责人、联系方式和已有关系…
            </p>
          ) : null}
        </HunterReply>
      ) : null}
      {phase >= 3 && forcedState === "no-contact" ? (
        <HunterReply
          markdown={`## 暂未找到可以直接联系的招聘负责人

已经检查官网、公开职业资料和现有联系人，定位到两条角色线索，但都缺少可以验证的自然人身份或联系方式。

> 可以新建“寻找星澜机器人招聘联系路径”的独立任务，或等待你补充自己的 HR、投资人和行业关系。当前任务不会猜测姓名或反复发送无效请求。`}
        >
          <ReviewEntry
            icon="route"
            label="查看已尝试路径（6）"
            note="查看来源、失败原因和仍可尝试的关系；不会跳转到其他页面。"
            onOpen={() =>
              setInspection({
                title: "已尝试的联系路径",
                kind: "task",
                status: "等待用户",
                tone: "warning",
                action:
                  "官网邮箱可用，但没有确认具体负责人；两条行业关系尚未建立连接",
                duration: "3 分 42 秒",
                resultDestination: "星澜机器人招聘合作 · 联系路径与待补充信息",
                checkpoints: inspectionContexts["client-xinglan"].checkpoints,
              })
            }
          />
        </HunterReply>
      ) : null}
      {phase >= 3 && forcedState !== "no-contact" ? (
        <HunterReply
          markdown={`## 公司与联系人结果可以审核

找到 2 位身份已确认的招聘联系人、1 条身份待确认线索和 1 位可以引荐的已有关系。2 位联系人具有可用邮箱，陈雨同时有已核验手机。

| 结果 | 数量 |
| --- | --- |
| 正式联系人建议 | 2 |
| 联系人线索 | 1 |
| 已有引荐关系 | 1 |
| 具备手机或邮箱 | 2 |`}
        >
          <ReviewEntry
            icon="users"
            label="打开公司与联系人审核"
            note="审核只确认保存结果，不会发送消息；联系授权在下一步单独处理。"
            onOpen={openReview}
          />
        </HunterReply>
      ) : null}
      {phase === 4 ? (
        <HunterReply
          markdown={`## 公司与联系人已保存

已保存星澜机器人公司资料、陈雨和周琪两位正式联系人，以及刘健的引荐关系。人力资源副总裁仍只保留为联系人线索。`}
        >
          <EmailDraftReview
            sender="于一凡 <yifan.yu@hunter-mail.cn>"
            initialRecipients="yu.chen@xinglan-robotics.com"
            initialSubject="星澜机器人具身智能团队招聘合作"
            initialBody={`陈雨，你好：\n\n我长期关注具身智能算法和机器人学习方向的人才。近期看到星澜机器人北京研发团队持续扩张，希望了解贵司 VLA 算法和机器人学习岗位是否考虑外部猎头合作。\n\n我可以先根据团队方向提供一份候选人市场分布和代表性人才概览，供你判断是否值得进一步沟通。\n\n于一凡`}
            onCancel={() => notify("邮件草稿已保留，本次没有发送", "info")}
            onSend={() => {
              setPhase(5);
              notify("邮件已发送，回复会回到当前任务", "success");
            }}
          />
        </HunterReply>
      ) : null}
      {phase === 5 ? (
        <ExternalWaitState
          title="等待陈雨回复招聘合作邮件"
          description="邮件已于今天 09:26 发送。邮件回复会自动回到当前任务；猎头在系统外获得的新信息也可以作为普通跟进记录补充。"
          meta="最近检查：刚刚 · 下次检查：6 小时后 · 3 个工作日后建议跟进 · 7 天后标记长期未回复"
          onAddResult={() =>
            notify("可以在下方输入回复内容，或上传邮件截图和附件", "info")
          }
        />
      ) : null}
      {phase >= 6 ? (
        <HunterReply
          markdown={`## 回复已形成一条招聘机会

陈雨确认北京团队正在招聘 VLA 算法负责人和机器人学习工程师，猎头合作预算需与业务负责人进一步确认。现有信息足以建立招聘机会，但不足以直接创建正式岗位。

### 星澜机器人 · 具身智能团队招聘

| 项目 | 当前信息 |
| --- | --- |
| 状态 | 跟进中 |
| 确认依据 | 招聘负责人邮件回复 · 今天 11:08 |
| 招聘方向 | VLA 算法负责人、机器人学习工程师 |
| 联系人 | 陈雨 · 招聘负责人 |
| 仍缺信息 | 完整 JD、汇报关系、薪酬范围、合作预算 |

> 如果后续收到完整 JD，Hunter 会先生成岗位草稿；用户确认后再创建正式岗位并启动对应任务。`}
        />
      ) : null}
    </>
  );
}

function MappingTimeline({
  phase,
  forcedState,
  setInspection,
  openReview,
  notify,
}) {
  return (
    <>
      {phase >= 1 ? (
        <HunterReply
          streaming={phase === 1}
          markdown={`我会先把目标拆成可以检查的摸排清单，再分批处理公司与组织、关键角色与人物、人物关系和联系路径。范围外的新发现先形成信号，不会无限启动新任务。${
            phase >= 2
              ? `

- 目标公司：星澜、拓界、穹顶、灵跃。
- 目标方向：VLA、机器人学习、灵巧操作。
- 结果要能回答关键人物是谁、关系如何、通过什么路径能联系。`
              : ""
          }`}
        />
      ) : null}
      {phase >= 2 ? (
        <HunterReply
          markdown={`## 摸排目标清单已经建立

| 目标 | 完成标准 | 当前状态 |
| --- | --- | --- |
| 公司与组织 | 四家公司主要团队、方向和已知组织关系 | 正在处理 |
| 关键角色与人物 | 三个方向的负责人、核心骨干和可识别人物 | 正在处理 |
| 人物关系与联系路径 | 可核验关系、已有候选人和可联系入口 | 尚未开始 |

> 完成情况按这份目标清单表达，不用未知市场总人数计算覆盖百分比。`}
        />
      ) : null}
      {phase >= 3 ? (
        <HunterReply
          markdown={`## 第一批公司、组织和方向已形成

四家公司都定位到与目标方向直接相关的团队。星澜和灵跃的公开证据较完整；拓界缺技术负责人，穹顶只能确认平台与方向，暂不能确认汇报关系。

${createMarkdownTable(
  ["公司", "方向", "组织", "当前缺口"],
  mappingCompanies.map((item) => [
    item.company,
    item.direction,
    item.organization,
    item.status,
  ]),
)}`}
        >
          {phase === 3 ? (
            <p className="s2-progress-line">
              <span />
              正在合并候选人、论文、专利和公开资料中的人物身份与关系…
            </p>
          ) : null}
        </HunterReply>
      ) : null}
      {phase >= 4 ? (
        <HunterReply
          markdown={`## 人物与关系批次可以审核

共定位 30 位人物：18 位身份已确认，11 位保留为人物线索，1 位存在同名与单位时间冲突。9 条人物关系可以写入，1 条关系需要等待确认。${
            forcedState === "conflict"
              ? `

> **存在冲突：** 王奕的论文作者身份与星澜公开活动名单可能属于同一人，但单位时间线存在冲突。即使处于自动执行模式，也不会自动合并。`
              : ""
          }${
            forcedState === "gaps"
              ? `

> **仍需补充：** 本轮仍缺拓界机器人技术负责人、穹顶智能汇报关系和王奕身份确认。每个缺口都保留了可执行动作和预期结果，不使用抽象完成百分比。`
              : ""
          }`}
        >
          <ReviewEntry
            icon="database"
            label="打开本批次更新审核"
            note="查看公司、组织、人物、关系、冲突和待补充内容；待确认内容可由用户明确确认后写入。"
            onOpen={openReview}
          />
          <button
            type="button"
            className="s2-markdown-link"
            onClick={() =>
              setInspection({
                title: "待补充信息与下一步",
                kind: "task",
                status: "等待用户",
                tone: "warning",
                action: "拓界技术负责人、穹顶汇报关系和王奕身份仍需处理",
                duration: "本轮已运行 13 分 25 秒",
                resultDestination: "具身智能核心人才版图 · 待补充信息",
                checkpoints: inspectionContexts["mapping-embodied"].checkpoints,
              })
            }
          >
            查看待补充信息与下一步 <Icon name="chevronRight" />
          </button>
        </HunterReply>
      ) : null}
      {phase >= 5 ? (
        <HunterReply
          markdown={`## 人才版图已完成本批次更新

- 新增 4 家公司范围、7 个组织方向、18 位已确认人物和 9 条人物关系。
- 11 位人物线索继续保留，王奕身份冲突没有合并。
- 下一步可以探索拓界技术负责人，预计补充 1 至 3 条线索；也可以接受当前缺口并结束本轮。

> 本轮结束不会把人才版图标记为“初版完成”或“维护中”。未来出现新变化时，通过新的任务或信号增量更新。`}
        >
          <DecisionRequest
            title="本轮接下来怎么处理？"
            description="两个选项都不会删除已经写入的人才版图结果。"
            options={[
              {
                value: "explore",
                label: "继续探索缺失负责人",
                description: "创建一项范围有限的人物探索处理。",
              },
              {
                value: "finish",
                label: "接受当前缺口并结束本轮",
                description: "保留待补充信息，后续出现新证据时再提醒。",
              },
            ]}
            onSelect={(option) =>
              notify(
                option.value === "explore"
                  ? "已准备人物探索处理，确认范围后开始"
                  : "本轮摸排已结束，待补充信息继续保留在人才版图",
                "success",
              )
            }
          />
        </HunterReply>
      ) : null}
    </>
  );
}

function CareerTimeline({
  phase,
  forcedState,
  setInspection,
  openReview,
  notify,
}) {
  return (
    <>
      {phase >= 1 ? (
        <HunterReply
          streaming={phase === 1}
          markdown={`我会先核验动向信号和林昊档案的新鲜度，再与 Hunter 中正在招聘的岗位做增量匹配。不会搜索公开市场岗位，也不会替你联系候选人。${
            phase >= 2
              ? `

- 两条公开动态属于中等强度信号，不能直接判断其正在求职。
- 已有联系方式和最近一次跟进记录均可用，但最近一份简历是 9 个月前。
- 首次联系和后续联系都由猎头本人完成。`
              : ""
          }`}
        />
      ) : null}
      {phase >= 2 ? (
        <HunterReply
          markdown={`## 动向值得核实，但求职意愿仍未知

| 信号 | 说明 | 强度 |
| --- | --- | --- |
| 公开资料更新 | 新增“关注具身智能创业机会”，未写明正在求职 | 中 |
| 用户关系备注 | 共同联系人提到林昊近期在了解北京团队 | 中 |
| 最近沟通 | 6 个月前表示短期内不会离开现团队 | 反向证据 |`}
        >
          <button
            type="button"
            className="s2-markdown-link"
            onClick={() =>
              setInspection({
                title: "林昊动向信号证据",
                rows: [
                  {
                    source: "公开资料",
                    finding: "关注具身智能创业机会，未明确求职",
                    freshness: "2 天前",
                    confidence: "中等",
                  },
                  {
                    source: "用户关系备注",
                    finding: "共同联系人提到其了解北京团队",
                    freshness: "4 天前",
                    confidence: "中等",
                  },
                  {
                    source: "历史沟通",
                    finding: "6 个月前表示短期不会离开",
                    freshness: "6 个月前",
                    confidence: "已确认",
                  },
                ],
                kind: "evidence",
                lead: "动向信号只用于提示猎头核实意愿，不会被当成候选人正在求职的事实，也不会触发自动联系。",
              })
            }
          >
            查看信号来源 <Icon name="chevronRight" />
          </button>
        </HunterReply>
      ) : null}
      {phase >= 3 && forcedState !== "no-position" ? (
        <HunterReply
          markdown={`## 系统内有 3 个岗位值得查看

7 个有效岗位完成匹配：1 个优先沟通、1 个可以了解、1 个暂不优先，其余 4 个因角色层级或硬技能门槛没有进入结果。`}
        >
          <ReviewEntry
            icon="briefcase"
            label="查看完整岗位匹配"
            note="包括分数、推荐理由、风险、缺口和沟通要点；查看不会启动联系。"
            onOpen={openReview}
          />
        </HunterReply>
      ) : null}
      {phase >= 3 && forcedState === "no-position" ? (
        <HunterReply
          markdown={`## 当前没有合适的系统内岗位

7 个有效岗位均未通过角色层级或硬技能门槛。Hunter 不会为了维持任务进度而放宽硬门槛，也不会转去搜索公开市场职位。

> 可以先由你联系林昊核实真实意愿并补充资料。本轮结束后，未来系统出现新的合适岗位时会形成新的候选人动向或岗位匹配提醒。`}
        />
      ) : null}
      {phase >= 4 ? (
        <HunterReply
          markdown={`## 请由你本人联系林昊

建议先了解他是否愿意看北京的团队负责人岗位，再按兴趣介绍星澜和拓界。不要一开始承诺薪酬、岗位范围或推荐结果。

> 联系后可以直接输入结果，例如“已经联系，暂时没回复”“愿意了解星澜，但不考虑上海”，也可以上传新简历或其他补充文件。Hunter 会先说明档案变化和受影响岗位，再局部重新匹配。`}
        />
      ) : null}
      {phase === 5 ? (
        <ExternalWaitState
          title="等待林昊补充反馈"
          description="Hunter 没有代替你联系候选人。你已记录今天 10:14 完成首次联系，并询问是否愿意了解北京的团队负责人岗位。"
          meta="最近记录：今天 10:14 · 建议提醒：2 个工作日后 · 等待期间不消耗 Agent 用量"
          onAddResult={() =>
            notify("请在下方输入回复内容，或上传新简历和补充文件", "info")
          }
        />
      ) : null}
      {phase >= 6 ? (
        <HunterReply
          markdown={`## 新简历已合并，2 个岗位需要重新判断

新简历补充了最近 8 个月的团队扩张和真机数据闭环项目，没有创建重复候选人档案。原始简历版本继续保留。

| 变化 | 影响 |
| --- | --- |
| 团队规模从 8 人更新为 15 人 | 星澜岗位的团队管理分项提高 |
| 新增量产双臂机器人项目 | 拓界岗位的产品落地风险降低 |
| 明确只考虑北京或远程 | 上海、深圳岗位降级，不再优先建议 |

> 如果林昊确认有意愿，可以由你选择把他交给星澜或其他岗位招聘任务；正式推荐和后续推进仍由猎头处理。`}
        />
      ) : null}
    </>
  );
}

export function BusinessWorkstreamWorkspace({ scenarioId }) {
  const scenario = businessScenarios[scenarioId];
  const navigate = useNavigate();
  const notify = useToast();
  const [params] = useSearchParams();
  const forcedState = params.get("state");
  const storageKey = `hunter-stage3-${scenarioId}`;
  const directPhase = forcedPhase(scenarioId, forcedState);
  const [historyCollapsed, setHistoryCollapsed] = useState(false);
  const [phase, setPhase] = useState(() => {
    if (directPhase !== null) return directPhase;
    const stored = Number(sessionStorage.getItem(`${storageKey}-phase`));
    return Number.isFinite(stored) ? stored : 0;
  });
  const [paused, setPaused] = useState(forcedState === "limited");
  const [terminated, setTerminated] = useState(false);
  const [runtimeOpen, setRuntimeOpen] = useState(false);
  const [inspection, setInspection] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [authMode, setAuthMode] = useState(scenario.defaultAuth);
  const [composer, setComposer] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [planAdjusted, setPlanAdjusted] = useState(false);
  const [latestRequirement, setLatestRequirement] = useState("");
  const [streamStopped, setStreamStopped] = useState(false);
  const [streamError, setStreamError] = useState(
    forcedState === "stream-error",
  );
  const [localError, setLocalError] = useState(forcedState === "error");
  const [terminateOpen, setTerminateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (directPhase !== null) setPhase(directPhase);
    setPaused(forcedState === "limited");
    setStreamError(forcedState === "stream-error");
    setLocalError(forcedState === "error");
  }, [directPhase, forcedState]);

  useEffect(() => {
    if (
      forcedState ||
      paused ||
      terminated ||
      streamStopped ||
      streamError ||
      localError ||
      phase >= scenario.autoStopPhase
    )
      return undefined;
    const timer = window.setTimeout(
      () => setPhase((current) => current + 1),
      phase === 0 ? 650 : 1250,
    );
    return () => window.clearTimeout(timer);
  }, [
    forcedState,
    localError,
    paused,
    phase,
    scenario.autoStopPhase,
    streamError,
    streamStopped,
    terminated,
  ]);

  useEffect(() => {
    if (!forcedState)
      sessionStorage.setItem(`${storageKey}-phase`, String(phase));
    if (phase > 0)
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: forcedState ? "auto" : "smooth",
      });
  }, [forcedState, messages.length, phase, storageKey]);

  const plan = useMemo(
    () => buildPlan(scenario, phase, paused, planAdjusted),
    [paused, phase, planAdjusted, scenario],
  );
  const planUpdate = planAdjusted
    ? {
        title: "计划已根据新信息调整",
        detail: "只暂停并重做受影响范围；已经完成的步骤和正式结果继续保留。",
        requirement: latestRequirement,
        time: "刚刚",
        tone: "warning",
      }
    : paused
      ? {
          title: "计划已暂停",
          detail: "当前检查点和已经形成的结果均已保留。",
          time: "刚刚",
          tone: "warning",
        }
      : null;
  const status =
    phase === 5 && scenarioId !== "mapping-embodied"
      ? "等待外部"
      : phase >= scenario.autoStopPhase
        ? "等待用户"
        : "推进中";
  const statusTone =
    status === "推进中"
      ? "info"
      : status === "等待外部"
        ? "neutral"
        : "warning";

  const reset = () => {
    sessionStorage.removeItem(`${storageKey}-phase`);
    setPhase(0);
    setPaused(false);
    setTerminated(false);
    setRuntimeOpen(false);
    setInspection(null);
    setReviewOpen(false);
    setComposer("");
    setAttachments([]);
    setMessages([]);
    setPlanAdjusted(false);
    setLatestRequirement("");
    setStreamStopped(false);
    setStreamError(false);
    setLocalError(false);
    notify("已从第一条输入重新演示", "info");
  };

  const send = (text, files) => {
    const attachmentText = files.length
      ? `；附带 ${files.map((file) => file.name).join("、")}`
      : "";
    const fullText = `${text}${attachmentText}`;
    if (phase < scenario.autoStopPhase) {
      setMessages((items) => [
        ...items,
        {
          text: fullText,
          result:
            "已记录。当前正在执行的范围已安全暂停；Hunter 会保留已有结果，只调整受影响步骤。",
        },
      ]);
      setPlanAdjusted(true);
      setLatestRequirement(fullText);
      setPaused(true);
    } else if (scenarioId === "client-xinglan" && phase === 5) {
      setMessages((items) => [
        ...items,
        {
          text: fullText,
          result:
            "已把这条回复写回当前任务，正在整理招聘需求、确认依据和仍缺信息。",
        },
      ]);
      setPhase(6);
    } else if (scenarioId === "career-linhao" && phase >= 4) {
      const nextPhase =
        files.length || /简历|附件|只考虑|愿意/.test(text) ? 6 : 5;
      setMessages((items) => [
        ...items,
        {
          text: fullText,
          result:
            nextPhase === 6
              ? "已收到新的候选人信息。我会先展示档案变化与合并结果，再只重做受影响岗位的匹配。"
              : "已记录本次人工跟进，当前任务进入等待外部；等待期间不持续消耗 Agent 用量。",
        },
      ]);
      setPhase(nextPhase);
    } else {
      setMessages((items) => [
        ...items,
        {
          text: fullText,
          result:
            "已记录这项决定。Hunter 会在当前任务边界内继续处理，并在产生正式写入或外部影响前再次检查授权。",
        },
      ]);
    }
    setComposer("");
    setAttachments([]);
  };

  if (forcedState === "loading") {
    return (
      <div className="s2-page s2-workspace-loading">
        <aside>
          <span />
          <span />
          <span />
          <span />
        </aside>
        <section>
          <header>
            <span />
            <i />
          </header>
          <main>
            <span />
            <span />
            <span />
          </main>
          <footer>
            <span />
          </footer>
        </section>
      </div>
    );
  }

  if (reviewOpen && scenarioId === "client-xinglan") {
    return (
      <div className="s2-page s2-review-page-shell">
        <ContactReviewWorkspace
          contacts={contactReviewRows}
          onClose={() => setReviewOpen(false)}
          onApply={(selected) => {
            setReviewOpen(false);
            setPhase(4);
            setMessages((items) => [
              ...items,
              {
                text: `确认保存 ${selected.length} 项公司与联系人结果。`,
                result:
                  "审核结果已保存；联系人业务确认已经完成，对外联系仍需单独授权。",
              },
            ]);
          }}
        />
      </div>
    );
  }
  if (reviewOpen && scenarioId === "mapping-embodied") {
    return (
      <div className="s2-page s2-review-page-shell">
        <LandscapeReviewWorkspace
          companies={mappingCompanies}
          people={mappingPeople}
          relationshipViews={mappingRelationshipViews}
          onClose={() => setReviewOpen(false)}
          onApply={(pendingDecisions) => {
            const confirmedCount = Object.values(pendingDecisions).filter(
              (value) => value === "write",
            ).length;
            setReviewOpen(false);
            setPhase(5);
            setMessages((items) => [
              ...items,
              {
                text: confirmedCount
                  ? `将已确认结果更新到人才版图，并按我的决定写入 ${confirmedCount} 项待确认内容。`
                  : "将本批次已确认结果更新到人才版图，其他内容继续待确认。",
                result: confirmedCount
                  ? `本批次已经写入；${confirmedCount} 项待确认内容按用户明确决定写入，并保留确认记录和原始冲突。`
                  : "本批次已经写入；其他待确认内容和待补充信息继续保留。",
              },
            ]);
          }}
        />
      </div>
    );
  }
  if (reviewOpen && scenarioId === "career-linhao") {
    return (
      <div className="s2-page s2-review-page-shell">
        <PositionMatchReviewWorkspace
          matches={careerMatches}
          onClose={() => setReviewOpen(false)}
          onContinue={() => {
            setReviewOpen(false);
            setPhase(4);
            setMessages((items) => [
              ...items,
              {
                text: "我看完了岗位匹配，先由我本人联系林昊核实意愿。",
                result:
                  "可以。Hunter 不会自动发送消息；联系后请直接补充回复或新资料。",
              },
            ]);
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`s2-page s2-workspace ${inspection ? "has-inspector" : ""}`}
    >
      <WorkHistory
        items={workItems}
        collapsed={historyCollapsed}
        currentId={scenarioId}
        onToggle={() => setHistoryCollapsed((value) => !value)}
        onCreate={() => navigate("/new")}
        onSelect={(item) => navigate(`/tasks/${item.id}`)}
      />
      <section className="s2-workstream-main">
        <WorkstreamHeader
          type={scenario.type}
          title={scenario.title}
          object={scenario.object}
          status={status}
          statusTone={statusTone}
          paused={paused}
          terminated={terminated}
          onPause={() => {
            setPaused((value) => !value);
            setStreamStopped(false);
            if (paused) {
              setPlanAdjusted(false);
              setLatestRequirement("");
            }
          }}
          onReset={reset}
          onTerminate={() => setTerminateOpen(true)}
          onDelete={() => setDeleteOpen(true)}
        />
        <div className="s2-conversation" ref={scrollRef}>
          <div className="s2-timeline">
            <UserMessage>{scenario.prompt}</UserMessage>
            {scenarioId === "client-xinglan" ? (
              <ClientTimeline
                phase={phase}
                forcedState={forcedState}
                setInspection={setInspection}
                openReview={() => setReviewOpen(true)}
                setPhase={setPhase}
                notify={notify}
              />
            ) : null}
            {scenarioId === "mapping-embodied" ? (
              <MappingTimeline
                phase={phase}
                forcedState={forcedState}
                setInspection={setInspection}
                openReview={() => setReviewOpen(true)}
                notify={notify}
              />
            ) : null}
            {scenarioId === "career-linhao" ? (
              <CareerTimeline
                phase={phase}
                forcedState={forcedState}
                setInspection={setInspection}
                openReview={() => setReviewOpen(true)}
                notify={notify}
              />
            ) : null}
            {streamError ? (
              <div className="s2-local-error" role="alert">
                <Icon name="warning" />
                <span>
                  <b>回复生成中断</b>
                  <small>
                    已经生成的内容和输入已保留，可以从当前检查点继续。
                  </small>
                </span>
                <Button
                  tone="secondary"
                  size="sm"
                  icon="refresh"
                  onClick={() => setStreamError(false)}
                >
                  继续生成
                </Button>
              </div>
            ) : null}
            {streamStopped ? (
              <div className="s2-system-state">
                <Icon name="pause" />
                <span>
                  <b>已停止本次生成</b>
                  <small>
                    已经生成的内容不会丢失，可以继续生成或补充新的要求。
                  </small>
                </span>
                <Button
                  tone="secondary"
                  size="sm"
                  onClick={() => setStreamStopped(false)}
                >
                  继续生成
                </Button>
              </div>
            ) : null}
            {forcedState === "limited" ? (
              <div className="s2-permission-state">
                <Icon name="warning" />
                <span>
                  <b>
                    {scenarioId === "client-xinglan"
                      ? "公开职业资料来源暂不可用"
                      : scenarioId === "mapping-embodied"
                        ? "论文来源授权已失效"
                        : "候选人附件读取权限不足"}
                  </b>
                  <small>
                    只暂停受影响的内部处理，其他来源和已经形成的结果继续保留。
                  </small>
                </span>
                <Button
                  tone="secondary"
                  size="sm"
                  onClick={() => notify("已打开对应权限处理入口", "info")}
                >
                  处理权限
                </Button>
              </div>
            ) : null}
            {localError ? (
              <LocalBusinessError
                scenarioId={scenarioId}
                onRetry={() => setLocalError(false)}
              />
            ) : null}
            {messages.map((message, index) => (
              <div
                className="s2-decision-thread"
                key={`${message.text}-${index}`}
              >
                <UserMessage time="刚刚">{message.text}</UserMessage>
                <HunterReply markdown={message.result} />
              </div>
            ))}
            {terminated ? (
              <div className="s2-system-state is-danger">
                <Icon name="warning" />
                <span>
                  <b>任务已终止</b>
                  <small>对话、任务、审核结果和正式资产引用已保留。</small>
                </span>
              </div>
            ) : null}
          </div>
        </div>
        <div className="s2-composer-wrap">
          {phase >= 1 ? (
            <RuntimeBar
              open={runtimeOpen}
              onToggle={() => setRuntimeOpen((value) => !value)}
              plan={plan}
              planUpdate={planUpdate}
              tasks={scenario.tasks}
              paused={paused}
              docked
              onInspectTask={(task) =>
                setInspection({
                  ...task,
                  kind: "task",
                  ...inspectionContexts[scenarioId],
                })
              }
            />
          ) : null}
          <Composer
            value={composer}
            onChange={setComposer}
            onSend={send}
            authMode={authMode}
            onAuthChange={(mode) => {
              setAuthMode(mode);
              notify(
                `授权模式已切换为“${mode === "analysis" ? "仅分析" : mode === "auto" ? "自动执行" : "执行前确认"}”，只影响尚未执行的动作`,
                "info",
              );
            }}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            streaming={phase === 1 && !streamStopped && !streamError}
            onStop={() => setStreamStopped(true)}
            disabled={terminated}
          />
        </div>
      </section>
      <InspectionPanel item={inspection} onClose={() => setInspection(null)} />
      <Modal
        open={terminateOpen}
        close={() => setTerminateOpen(false)}
        title="终止任务"
        description="终止表示这项业务不再继续，不会删除历史和已确认成果。"
        footer={
          <>
            <Button tone="secondary" onClick={() => setTerminateOpen(false)}>
              取消
            </Button>
            <Button
              tone="danger"
              onClick={() => {
                setTerminated(true);
                setPaused(false);
                setTerminateOpen(false);
              }}
            >
              终止任务
            </Button>
          </>
        }
      >
        <div className="s2-confirm-copy">
          <p>
            排队、运行和等待中的内部处理会安全停止；已确认的正式资产、来源证据和已经发生的外部动作继续保留。
          </p>
          <p>终止后可以查看历史，但需要新的业务目标时应新建任务。</p>
        </div>
      </Modal>
      <Modal
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        title="删除任务"
        description="删除只适用于误建或不希望保留的内容。"
        footer={
          <>
            <Button tone="secondary" onClick={() => setDeleteOpen(false)}>
              取消
            </Button>
            <Button
              tone="danger"
              onClick={() => {
                setDeleteOpen(false);
                navigate("/home");
                notify("任务已移入回收站，30 天内可以恢复", "success");
              }}
            >
              删除并移入回收站
            </Button>
          </>
        }
      >
        <div className="s2-confirm-copy">
          <p>当前任务会先安全停止；任务专属的对话、计划和文件进入回收站。</p>
          <p>
            公司、联系人、招聘机会、岗位、候选人和人才版图等正式资产不会被删除。
          </p>
        </div>
      </Modal>
    </div>
  );
}
