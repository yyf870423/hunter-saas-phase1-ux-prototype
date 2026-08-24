import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { FormField, SelectMenu, TextInput } from "../stage4/asset-ui";
import { Button, IconButton, Modal, StatusBadge, useToast } from "../stage1/ui";
import {
  ChoiceCard,
  InlineNotice,
  LockedRule,
  MetricDonut,
  SettingRow,
  SettingsError,
  SettingsLoading,
  SettingsPageHeader,
  SettingsSection,
  Toggle,
} from "./settings-ui";

function usePageState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = searchParams.get("state") || "normal";
  const clearState = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("state");
    setSearchParams(next, { replace: true });
  };
  return { state, clearState };
}

function PageState({ state, clearState, rows = 4, children }) {
  if (state === "loading") return <SettingsLoading rows={rows} />;
  if (state === "error") return <SettingsError onRetry={clearState} />;
  return children;
}

function ModalActions({ cancel, confirm, confirmText = "保存", loading }) {
  return (
    <>
      <Button onClick={cancel} disabled={loading}>
        取消
      </Button>
      <Button tone="primary" onClick={confirm} loading={loading}>
        {confirmText}
      </Button>
    </>
  );
}

export function ProfileSettingsPage() {
  const { state, clearState } = usePageState();
  const notify = useToast();
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(false);
  const [name, setName] = useState("沈岚");
  const [workspace, setWorkspace] = useState("沈岚的猎头工作空间");
  const [language, setLanguage] = useState("简体中文");
  const [timezone, setTimezone] = useState("中国标准时间 UTC+8");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const save = (done, message) => {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      done();
      notify(message);
    }, 520);
  };

  return (
    <PageState state={state} clearState={clearState}>
      <SettingsPageHeader
        title="个人资料"
        description="管理个人身份、工作空间和登录安全。"
      />

      <SettingsSection
        title="个人资料"
        description="这些信息用于 Hunter 中的个人工作空间和邮件署名。"
        action={
          editingProfile ? (
            <span className="s5-section-actions">
              <Button size="sm" onClick={() => setEditingProfile(false)}>
                取消
              </Button>
              <Button
                size="sm"
                tone="primary"
                disabled={!name.trim()}
                onClick={() =>
                  save(() => setEditingProfile(false), "个人资料已保存")
                }
              >
                保存
              </Button>
            </span>
          ) : (
            <Button
              size="sm"
              icon="edit"
              onClick={() => setEditingProfile(true)}
            >
              编辑
            </Button>
          )
        }
      >
        <div className="s5-profile-grid">
          <div className="s5-avatar-editor">
            <i>SL</i>
            <button
              type="button"
              disabled={!editingProfile}
              onClick={() => notify("头像已更新", "info")}
            >
              更换头像
            </button>
          </div>
          <div className="s5-profile-fields">
            {editingProfile ? (
              <FormField
                label="姓名"
                required
                error={!name.trim() ? "请输入姓名" : ""}
              >
                <TextInput value={name} onChange={setName} />
              </FormField>
            ) : (
              <dl className="s5-definition-list">
                <div>
                  <dt>姓名</dt>
                  <dd>{name}</dd>
                </div>
                <div>
                  <dt>登录邮箱</dt>
                  <dd>
                    shenlan@hunter-demo.cn
                    <StatusBadge tone="success" dot={false}>
                      已验证
                    </StatusBadge>
                  </dd>
                </div>
              </dl>
            )}
            {editingProfile ? (
              <div className="s5-readonly-field">
                <span>登录邮箱</span>
                <b>shenlan@hunter-demo.cn</b>
                <button type="button" onClick={() => setEmailOpen(true)}>
                  修改邮箱
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="个人工作空间"
        description="阶段一只提供个人工作空间，不包含成员、角色和团队权限。"
        action={
          editingWorkspace ? (
            <span className="s5-section-actions">
              <Button size="sm" onClick={() => setEditingWorkspace(false)}>
                取消
              </Button>
              <Button
                size="sm"
                tone="primary"
                disabled={!workspace.trim()}
                onClick={() =>
                  save(() => setEditingWorkspace(false), "工作空间设置已保存")
                }
              >
                保存
              </Button>
            </span>
          ) : (
            <Button
              size="sm"
              icon="edit"
              onClick={() => setEditingWorkspace(true)}
            >
              编辑
            </Button>
          )
        }
      >
        {editingWorkspace ? (
          <div className="s5-form-grid">
            <FormField label="工作空间名称" required>
              <TextInput value={workspace} onChange={setWorkspace} />
            </FormField>
            <FormField label="界面语言">
              <SelectMenu
                label="界面语言"
                value={language}
                options={["简体中文", "English"]}
                onChange={setLanguage}
              />
            </FormField>
            <FormField label="时区">
              <SelectMenu
                label="时区"
                value={timezone}
                options={[
                  "中国标准时间 UTC+8",
                  "日本标准时间 UTC+9",
                  "太平洋时间 UTC-8",
                ]}
                onChange={setTimezone}
              />
            </FormField>
          </div>
        ) : (
          <dl className="s5-definition-list s5-definition-list-wide">
            <div>
              <dt>工作空间名称</dt>
              <dd>{workspace}</dd>
            </div>
            <div>
              <dt>界面语言</dt>
              <dd>{language}</dd>
            </div>
            <div>
              <dt>时区</dt>
              <dd>{timezone}</dd>
            </div>
          </dl>
        )}
      </SettingsSection>

      <SettingsSection
        title="登录与安全"
        description="管理密码和当前账号的登录设备。"
      >
        <div className="s5-setting-list">
          <SettingRow
            icon="lock"
            title="登录密码"
            description="上次修改于 2026 年 7 月 18 日"
            action={
              <Button size="sm" onClick={() => setPasswordOpen(true)}>
                修改密码
              </Button>
            }
          />
          <SettingRow
            icon="monitor"
            title="当前设备"
            description="Chrome · macOS · 上海"
            meta="刚刚活跃"
            status={<StatusBadge tone="success">当前会话</StatusBadge>}
          />
          <SettingRow
            icon="monitor"
            title="其他登录设备"
            description="Edge · Windows 11 · 北京"
            meta="3 小时前活跃"
            action={
              <Button size="sm" onClick={() => setSessionOpen(true)}>
                退出其他会话
              </Button>
            }
          />
        </div>
      </SettingsSection>

      <Modal
        open={emailOpen}
        close={() => setEmailOpen(false)}
        title="修改登录邮箱"
        description="新邮箱验证完成后才会替换当前登录邮箱。"
        footer={
          <ModalActions
            cancel={() => setEmailOpen(false)}
            confirmText="发送验证邮件"
            confirm={() => {
              if (!/^\S+@\S+\.\S+$/.test(newEmail)) return;
              save(() => setEmailOpen(false), "验证邮件已发送");
            }}
            loading={saving}
          />
        }
      >
        <FormField
          label="新邮箱"
          required
          error={
            newEmail && !/^\S+@\S+\.\S+$/.test(newEmail) ? "请输入有效邮箱" : ""
          }
        >
          <TextInput
            value={newEmail}
            onChange={setNewEmail}
            placeholder="name@company.com"
          />
        </FormField>
      </Modal>

      <Modal
        open={passwordOpen}
        close={() => setPasswordOpen(false)}
        title="修改密码"
        description="更新后其他设备会保持登录，可在登录会话中手动退出。"
        footer={
          <ModalActions
            cancel={() => setPasswordOpen(false)}
            confirm={() => {
              if (!passwords.current || passwords.next.length < 10) return;
              save(() => setPasswordOpen(false), "密码已更新");
            }}
            loading={saving}
          />
        }
      >
        <div className="s5-modal-form">
          <FormField
            label="当前密码"
            required
            error={passwords.current === "wrong" ? "当前密码不正确" : ""}
          >
            <input
              className="s4-input"
              type="password"
              value={passwords.current}
              onChange={(event) =>
                setPasswords((value) => ({
                  ...value,
                  current: event.target.value,
                }))
              }
            />
          </FormField>
          <FormField
            label="新密码"
            required
            error={
              passwords.next && passwords.next.length < 10
                ? "至少输入 10 个字符"
                : ""
            }
          >
            <input
              className="s4-input"
              type="password"
              value={passwords.next}
              onChange={(event) =>
                setPasswords((value) => ({
                  ...value,
                  next: event.target.value,
                }))
              }
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        open={sessionOpen}
        close={() => setSessionOpen(false)}
        title="退出其他会话"
        description="Windows 11 上的 Hunter 会立即退出，当前设备不受影响。"
        size="sm"
        footer={
          <>
            <Button onClick={() => setSessionOpen(false)}>取消</Button>
            <Button
              tone="danger"
              onClick={() =>
                save(() => setSessionOpen(false), "其他会话已退出")
              }
              loading={saving}
            >
              确认退出
            </Button>
          </>
        }
      >
        <InlineNotice tone="warning" icon="warning">
          该设备中尚未保存的输入会丢失，正在运行的云端任务不会停止。
        </InlineNotice>
      </Modal>
    </PageState>
  );
}

const notificationRows = [
  ["decision", "需要我处理", "待确认、待授权和需要补充信息", true, true, true],
  ["reply", "外部回复", "邮件回复、新简历和附件到达", true, true, true],
  ["task", "任务状态", "完成、失败、暂停和等待外部", true, true, false],
  ["signal", "高优先级信号", "即将失效的机会和强信号", true, true, false],
  ["app", "寻访 App", "结果提交、设备授权和版本异常", true, true, false],
  ["billing", "额度与订阅", "额度不足、预算上限和订阅到期", true, true, true],
];

export function NotificationSettingsPage() {
  const { state, clearState } = usePageState();
  const notify = useToast();
  const limited = state === "limited";
  const [matrix, setMatrix] = useState(() =>
    Object.fromEntries(
      notificationRows.map(([id, , , app, email]) => [id, { app, email }]),
    ),
  );
  const [digest, setDigest] = useState("每日 18:00 汇总");
  const [saving, setSaving] = useState(false);
  const save = () => {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      notify("通知设置已保存");
    }, 520);
  };
  return (
    <PageState state={state} clearState={clearState}>
      <SettingsPageHeader
        title="通知"
        description="选择重要事项的提醒方式，避免错过需要处理的工作。"
        actions={
          <Button tone="primary" loading={saving} onClick={save}>
            保存设置
          </Button>
        }
      />
      {limited ? (
        <InlineNotice tone="warning" icon="warning">
          邮箱尚未验证，邮件通知暂不可用。站内通知不会受到影响。
          <button
            type="button"
            onClick={() => notify("验证邮件已重新发送", "info")}
          >
            重新发送验证邮件
          </button>
        </InlineNotice>
      ) : null}
      <SettingsSection
        title="通知渠道"
        description="站内通知用于实时处理，邮件用于离开 Hunter 后的重要提醒。"
      >
        <div className="s5-channel-summary">
          <SettingRow
            icon="bell"
            title="站内通知"
            description="在通知中心和相关业务页面中显示"
            status={<StatusBadge tone="success">已启用</StatusBadge>}
          />
          <SettingRow
            icon="mail"
            title="邮件通知"
            description="shenlan@hunter-demo.cn"
            status={
              <StatusBadge tone={limited ? "warning" : "success"}>
                {limited ? "待验证" : "已验证"}
              </StatusBadge>
            }
          />
        </div>
      </SettingsSection>
      <SettingsSection
        title="通知内容"
        description="系统安全、订阅到期和额度耗尽等通知不能关闭。"
      >
        <div className="s5-notification-matrix">
          <div className="s5-matrix-head">
            <b>通知类型</b>
            <span>站内</span>
            <span>邮件</span>
          </div>
          {notificationRows.map(([id, title, description, , , locked]) => (
            <div className="s5-matrix-row" key={id}>
              <span>
                <b>{title}</b>
                <small>{description}</small>
                {locked ? (
                  <em>
                    <Icon name="lock" /> 必须通知
                  </em>
                ) : null}
              </span>
              <Toggle
                label={`${title}站内通知`}
                checked={matrix[id].app}
                disabled={locked}
                onChange={(value) =>
                  setMatrix((current) => ({
                    ...current,
                    [id]: { ...current[id], app: value },
                  }))
                }
              />
              <Toggle
                label={`${title}邮件通知`}
                checked={matrix[id].email}
                disabled={locked || limited}
                onChange={(value) =>
                  setMatrix((current) => ({
                    ...current,
                    [id]: { ...current[id], email: value },
                  }))
                }
              />
            </div>
          ))}
        </div>
      </SettingsSection>
      <SettingsSection
        title="低优先级摘要"
        description="普通任务进展和观察信号可以合并提醒，减少打断。"
      >
        <div className="s5-summary-choice">
          <SelectMenu
            label="摘要频率"
            value={digest}
            options={[
              "即时通知",
              "每日 18:00 汇总",
              "每周一 09:00 汇总",
              "仅站内查看",
            ]}
            onChange={setDigest}
          />
          <p>高优先级信号、失败和待确认事项仍会即时提醒。</p>
        </div>
      </SettingsSection>
    </PageState>
  );
}

const automationRows = [
  [
    "client",
    "客户开发",
    "自动寻找潜在客户、招聘信号和联系人",
    "执行前确认",
    "building",
  ],
  [
    "position",
    "岗位招聘",
    "解析岗位、公开找人、匹配和候选人分级",
    "执行前确认",
    "briefcase",
  ],
  [
    "mapping",
    "人才摸排",
    "探索公司、组织、方向、人物和关系",
    "仅分析",
    "route",
  ],
  [
    "candidate",
    "候选人求职",
    "核实求职意愿并匹配系统内岗位",
    "执行前确认",
    "user",
  ],
];

export function AutomationSettingsPage() {
  const { state, clearState } = usePageState();
  const notify = useToast();
  const [modes, setModes] = useState(() =>
    Object.fromEntries(automationRows.map(([id, , , mode]) => [id, mode])),
  );
  const [editing, setEditing] = useState(null);
  const [draftMode, setDraftMode] = useState("执行前确认");
  const [saving, setSaving] = useState(false);
  const open = (id) => {
    setEditing(id);
    setDraftMode(modes[id]);
  };
  const active = automationRows.find(([id]) => id === editing);
  return (
    <PageState state={state} clearState={clearState}>
      <SettingsPageHeader
        title="自动化授权"
        description="设置新工作的默认执行边界；运行中的工作可以单独调整。"
      />
      <InlineNotice>
        默认使用“执行前确认”。授权只影响尚未执行的动作，不能关闭 Hunter
        的强制门禁。
      </InlineNotice>
      <SettingsSection
        title="业务主线默认授权"
        description="每类业务可以使用不同默认值，之后创建的新工作会继承该设置。"
      >
        <div className="s5-automation-list">
          {automationRows.map(([id, title, description, , icon]) => (
            <SettingRow
              key={id}
              icon={icon}
              title={title}
              description={description}
              meta="上次修改于 2026 年 8 月 18 日"
              status={
                <StatusBadge
                  tone={
                    modes[id] === "自动执行"
                      ? "warning"
                      : modes[id] === "仅分析"
                        ? "neutral"
                        : "info"
                  }
                >
                  {modes[id]}
                </StatusBadge>
              }
              action={
                <Button size="sm" onClick={() => open(id)}>
                  修改
                </Button>
              }
            />
          ))}
        </div>
      </SettingsSection>
      <SettingsSection
        title="强制门禁"
        description="无论选择哪种授权，这些检查都不能关闭。"
      >
        <div className="s5-locked-grid">
          <LockedRule
            title="数据写入门禁"
            description="身份、证据、Schema、去重和权限检查"
          />
          <LockedRule
            title="执行边界门禁"
            description="预算、数量、停止条件和防循环检查"
          />
          <LockedRule
            title="必须人工处理"
            description="正式推荐、面试、薪资、Offer 和录取决定"
          />
          <LockedRule
            title="邮件逐封确认"
            description="收件人、标题、正文和附件每次确认"
          />
        </div>
      </SettingsSection>
      <Modal
        open={Boolean(editing)}
        close={() => setEditing(null)}
        title={active ? `修改${active[1]}默认授权` : "修改默认授权"}
        description="修改后只影响新创建且未单独指定授权的工作。"
        size="lg"
        footer={
          <ModalActions
            cancel={() => setEditing(null)}
            confirm={() => {
              setSaving(true);
              window.setTimeout(() => {
                setModes((current) => ({ ...current, [editing]: draftMode }));
                setSaving(false);
                setEditing(null);
                notify("默认授权已更新");
              }, 520);
            }}
            loading={saving}
          />
        }
      >
        <div
          className="s5-choice-list"
          role="radiogroup"
          aria-label="默认授权方式"
        >
          <ChoiceCard
            title="仅分析"
            description="Hunter 可以读取、分析并提出建议，不执行写入或外部动作。"
            icon="search"
            selected={draftMode === "仅分析"}
            onClick={() => setDraftMode("仅分析")}
          />
          <ChoiceCard
            title="执行前确认"
            description="Hunter 先准备结果和操作方案，在写入或外部动作前等待你确认。"
            icon="check"
            selected={draftMode === "执行前确认"}
            onClick={() => setDraftMode("执行前确认")}
          />
          <ChoiceCard
            title="自动执行"
            description="通过强制门禁后自动写入允许的业务数据；高风险动作仍由你处理。"
            icon="activity"
            selected={draftMode === "自动执行"}
            onClick={() => setDraftMode("自动执行")}
          />
        </div>
        {draftMode === "自动执行" ? (
          <InlineNotice tone="warning" icon="warning">
            自动执行可能创建或更新业务资产，但不会自动发送邮件、正式推荐候选人或作出招聘承诺。
          </InlineNotice>
        ) : null}
      </Modal>
    </PageState>
  );
}

export function ConnectionSettingsPage() {
  const { state, clearState } = usePageState();
  const notify = useToast();
  const empty = state === "empty";
  const [mailConnected, setMailConnected] = useState(!empty);
  const [deviceConnected, setDeviceConnected] = useState(!empty);
  const [mailModal, setMailModal] = useState(false);
  const [mailStep, setMailStep] = useState(1);
  const [provider, setProvider] = useState("腾讯企业邮箱");
  const [mailError, setMailError] = useState(false);
  const [deviceModal, setDeviceModal] = useState(false);
  const [deviceWaiting, setDeviceWaiting] = useState(false);
  const [disconnect, setDisconnect] = useState(null);

  const resetMail = () => {
    setMailModal(false);
    setMailStep(1);
    setMailError(false);
  };

  return (
    <PageState
      state={state === "error" ? "normal" : state}
      clearState={clearState}
    >
      <SettingsPageHeader
        title="连接"
        description="管理发件邮箱和已连接的寻访 App 设备。"
      />
      {state === "error" ? (
        <InlineNotice tone="danger" icon="warning">
          上次连接邮箱时授权服务未响应。当前连接不受影响，可以重新连接。
        </InlineNotice>
      ) : null}
      <SettingsSection
        title="发件邮箱"
        description="Hunter 只跟踪由 Hunter 发出的邮件和对应回复。"
      >
        {mailConnected ? (
          <div className="s5-connection-card">
            <i>
              <Icon name="mail" />
            </i>
            <span>
              <span>
                <b>shenlan@xinglan-talent.cn</b>
                <StatusBadge tone="success">已连接</StatusBadge>
              </span>
              <small>腾讯企业邮箱 · 最近发送于今天 10:42</small>
              <em>每封邮件仍需确认收件人、标题、正文和附件。</em>
            </span>
            <div>
              <Button size="sm" onClick={() => setMailModal(true)}>
                重新连接
              </Button>
              <IconButton
                icon="more"
                label="邮箱更多操作"
                onClick={() => setDisconnect("mail")}
              />
            </div>
          </div>
        ) : (
          <div className="s5-connection-empty">
            <i>
              <Icon name="mail" />
            </i>
            <span>
              <b>尚未连接发件邮箱</b>
              <small>
                连接后可以在 Hunter
                中确认邮件草稿并发送，收到回复后继续相关工作。
              </small>
            </span>
            <Button
              tone="primary"
              icon="link"
              onClick={() => setMailModal(true)}
            >
              连接邮箱
            </Button>
          </div>
        )}
      </SettingsSection>
      <SettingsSection
        title="寻访 App 设备"
        description="云端只管理设备连接、版本和结果同步，不显示人才平台账号与登录状态。"
        action={
          <Button size="sm" icon="plus" onClick={() => setDeviceModal(true)}>
            添加设备
          </Button>
        }
      >
        {deviceConnected ? (
          <div className="s5-device-list">
            <div className="s5-device-card">
              <i>
                <Icon name="monitor" />
              </i>
              <span>
                <span>
                  <b>沈岚的 MacBook Pro</b>
                  <StatusBadge tone="success">在线</StatusBadge>
                </span>
                <small>macOS 15.6 · 寻访 App 1.0.3 · 2 分钟前同步</small>
                <em>设备授权将于 2026 年 11 月 24 日复核</em>
              </span>
              <IconButton
                icon="more"
                label="MacBook 设备操作"
                onClick={() => setDisconnect("device")}
              />
            </div>
            <div className="s5-device-card is-warning">
              <i>
                <Icon name="monitor" />
              </i>
              <span>
                <span>
                  <b>办公室 Windows</b>
                  <StatusBadge tone="warning">需要升级</StatusBadge>
                </span>
                <small>Windows 11 · 寻访 App 0.9.8 · 昨天 19:35 同步</small>
                <em>版本过低，暂不能提交新的候选人批次。</em>
              </span>
              <Button
                size="sm"
                onClick={() => notify("升级说明已发送到该设备", "info")}
              >
                发送升级说明
              </Button>
            </div>
          </div>
        ) : (
          <div className="s5-connection-empty">
            <i>
              <Icon name="monitor" />
            </i>
            <span>
              <b>尚未连接设备</b>
              <small>
                安装寻访 App
                后使用一次性连接码，将确认结果安全提交到当前工作空间。
              </small>
            </span>
            <Button tone="primary" onClick={() => setDeviceModal(true)}>
              添加设备
            </Button>
          </div>
        )}
      </SettingsSection>

      <Modal
        open={mailModal}
        close={resetMail}
        closeDisabled={mailStep === 2 && !mailError}
        title={mailStep === 3 ? "邮箱连接完成" : "连接发件邮箱"}
        description={`步骤 ${mailStep} / 3 · ${mailStep === 1 ? "选择邮箱" : mailStep === 2 ? "完成授权" : "检查连接"}`}
        footer={
          mailStep === 1 ? (
            <>
              <Button onClick={resetMail}>取消</Button>
              <Button tone="primary" onClick={() => setMailStep(2)}>
                继续
              </Button>
            </>
          ) : mailStep === 2 ? (
            <Button
              tone="primary"
              onClick={() => {
                if (mailError) {
                  setMailError(false);
                  return;
                }
                setMailStep(3);
              }}
            >
              {mailError ? "重新授权" : "模拟授权完成"}
            </Button>
          ) : (
            <Button
              tone="primary"
              onClick={() => {
                setMailConnected(true);
                resetMail();
                notify("发件邮箱已连接");
              }}
            >
              完成
            </Button>
          )
        }
      >
        {mailStep === 1 ? (
          <div
            className="s5-choice-list"
            role="radiogroup"
            aria-label="邮箱类型"
          >
            {[
              "腾讯企业邮箱",
              "阿里企业邮箱",
              "Microsoft 365",
              "其他企业邮箱",
            ].map((item) => (
              <ChoiceCard
                key={item}
                title={item}
                description={
                  item === "其他企业邮箱"
                    ? "使用标准 OAuth 或企业邮箱授权"
                    : "通过服务商授权，不需要填写 API Key"
                }
                icon="mail"
                selected={provider === item}
                onClick={() => setProvider(item)}
              />
            ))}
          </div>
        ) : mailStep === 2 ? (
          mailError ? (
            <div className="s5-connect-status is-error">
              <i>
                <Icon name="warning" />
              </i>
              <b>授权未完成</b>
              <p>授权页面已关闭或服务未响应。你的邮箱密码不会保存到 Hunter。</p>
            </div>
          ) : (
            <div className="s5-connect-status is-running">
              <span className="s1-spinner" />
              <b>等待 {provider} 完成授权</b>
              <p>授权窗口完成后返回这里，当前页面不会自动关闭。</p>
              <button type="button" onClick={() => setMailError(true)}>
                模拟授权失败
              </button>
            </div>
          )
        ) : (
          <div className="s5-connect-status is-success">
            <i>
              <Icon name="check" />
            </i>
            <b>shenlan@xinglan-talent.cn 已连接</b>
            <p>已验证发件身份和回复跟踪权限，可以开始确认邮件草稿。</p>
          </div>
        )}
      </Modal>

      <Modal
        open={deviceModal}
        close={() => {
          setDeviceModal(false);
          setDeviceWaiting(false);
        }}
        title="添加寻访 App 设备"
        description="在设备上的寻访 App 中输入连接码，或扫描二维码。"
        footer={
          <>
            <Button onClick={() => setDeviceModal(false)}>取消</Button>
            <Button
              tone="primary"
              onClick={() => {
                if (!deviceWaiting) {
                  setDeviceWaiting(true);
                  return;
                }
                setDeviceConnected(true);
                setDeviceWaiting(false);
                setDeviceModal(false);
                notify("新设备已连接");
              }}
            >
              {deviceWaiting ? "模拟设备已连接" : "开始等待"}
            </Button>
          </>
        }
      >
        <div className="s5-device-code">
          <div className="s5-qr-placeholder">
            <Icon name="qrCode" />
          </div>
          <span>
            <small>一次性连接码</small>
            <b>H7K4-9Q2M</b>
            <em>09:42 后失效</em>
            <button
              type="button"
              onClick={() => notify("连接码已复制", "info")}
            >
              <Icon name="copy" />
              复制连接码
            </button>
          </span>
        </div>
        {deviceWaiting ? (
          <InlineNotice>
            正在等待设备确认。关闭窗口不会取消连接码。
          </InlineNotice>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(disconnect)}
        close={() => setDisconnect(null)}
        size="sm"
        title={disconnect === "mail" ? "断开发件邮箱" : "撤销设备授权"}
        description={
          disconnect === "mail"
            ? "已发送邮件和历史回复仍会保留。"
            : "设备中的未提交结果不会自动上传。"
        }
        footer={
          <>
            <Button onClick={() => setDisconnect(null)}>取消</Button>
            <Button
              tone="danger"
              onClick={() => {
                if (disconnect === "mail") setMailConnected(false);
                else setDeviceConnected(false);
                setDisconnect(null);
                notify(
                  disconnect === "mail" ? "发件邮箱已断开" : "设备授权已撤销",
                );
              }}
            >
              确认
            </Button>
          </>
        }
      >
        <InlineNotice tone="warning" icon="warning">
          {disconnect === "mail"
            ? "尚未发送的邮件草稿会保留，但发送前需要重新连接邮箱。"
            : "正在运行的设备侧工作不会被远程停止，请同时在设备中结束工作。"}
        </InlineNotice>
      </Modal>
    </PageState>
  );
}

export function SubscriptionSettingsPage() {
  const { state, clearState } = usePageState();
  const notify = useToast();
  const limited = state === "limited";
  const empty = state === "empty";
  const [planModal, setPlanModal] = useState(false);
  const [renewModal, setRenewModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("专业版");
  const [autoRenew, setAutoRenew] = useState(true);
  const [saving, setSaving] = useState(false);
  const commit = (message, close) => {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      close();
      notify(message);
    }, 600);
  };
  return (
    <PageState state={state} clearState={clearState}>
      <SettingsPageHeader
        title="订阅与用量"
        description="查看当前权益、用量边界、支付和续订记录。"
      />
      {limited ? (
        <InlineNotice tone="warning" icon="warning">
          订阅已于 2026 年 8 月 20 日到期。Agent
          和付费功能已暂停，业务数据仍可查看和导出。
          <button type="button" onClick={() => setPlanModal(true)}>
            恢复订阅
          </button>
        </InlineNotice>
      ) : null}
      <section className="s5-plan-overview">
        <div className="s5-plan-card">
          <span>
            <small>当前套餐</small>
            <h2>{limited ? "专业版 · 已到期" : "专业版"}</h2>
            <p>适合独立猎头持续经营客户、岗位、人才和版图。</p>
          </span>
          <strong>
            ¥399<small>/ 月</small>
          </strong>
          <dl>
            <div>
              <dt>下次续订</dt>
              <dd>{limited ? "已停止" : "2026 年 9 月 1 日"}</dd>
            </div>
            <div>
              <dt>支付方式</dt>
              <dd>招商银行 · 6028</dd>
            </div>
            <div>
              <dt>自动续订</dt>
              <dd>{autoRenew ? "已开启" : "已关闭"}</dd>
            </div>
          </dl>
          <div>
            <Button tone="primary" onClick={() => setPlanModal(true)}>
              {limited ? "恢复订阅" : "更换套餐"}
            </Button>
            <Button onClick={() => setPaymentModal(true)}>更新支付方式</Button>
            {!limited ? (
              <Button onClick={() => setRenewModal(true)}>
                {autoRenew ? "关闭自动续订" : "开启自动续订"}
              </Button>
            ) : null}
          </div>
        </div>
        <div className="s5-usage-card">
          <MetricDonut value={64} label="64%" caption="本月已使用" />
          <div className="s5-usage-breakdown">
            <span>
              <i style={{ "--usage": "72%" }} />
              <b>Agent 任务</b>
              <em>36 / 50 次</em>
            </span>
            <span>
              <i style={{ "--usage": "53%" }} />
              <b>公开网络搜索</b>
              <em>1,580 / 3,000 次</em>
            </span>
            <span>
              <i style={{ "--usage": "41%" }} />
              <b>数据处理</b>
              <em>8.2 / 20 GB</em>
            </span>
          </div>
        </div>
      </section>
      <SettingsSection
        title="额度预警"
        description="达到用量边界前提前通知，避免运行中的工作意外停止。"
      >
        <div className="s5-setting-list">
          <SettingRow
            title="使用达到 70%"
            description="站内通知和邮件提醒"
            action={<Toggle label="70% 用量提醒" checked />}
          />
          <SettingRow
            title="使用达到 90%"
            description="站内通知和邮件提醒"
            action={<Toggle label="90% 用量提醒" checked disabled />}
          />
          <SettingRow
            title="额度耗尽"
            description="强制通知，并停止创建新的付费任务"
            action={<Toggle label="额度耗尽提醒" checked disabled />}
          />
        </div>
      </SettingsSection>
      <SettingsSection
        title="订单记录"
        description="查看历史支付结果和下载收据。"
      >
        {empty ? (
          <div className="s5-orders-empty">
            <Icon name="receipt" />
            <b>还没有订单记录</b>
            <span>完成首笔订阅支付后会显示在这里。</span>
          </div>
        ) : (
          <div className="s5-order-list">
            {[
              ["2026 年 8 月 1 日", "专业版月度订阅", "¥399.00", "支付成功"],
              ["2026 年 7 月 1 日", "专业版月度订阅", "¥399.00", "支付成功"],
              ["2026 年 6 月 1 日", "专业版月度订阅", "¥399.00", "支付成功"],
            ].map((order) => (
              <div key={order[0]}>
                <span>
                  <b>{order[1]}</b>
                  <small>{order[0]}</small>
                </span>
                <em>{order[2]}</em>
                <StatusBadge tone="success">{order[3]}</StatusBadge>
                <button
                  type="button"
                  onClick={() => notify(`${order[0]}收据已开始下载`, "info")}
                >
                  <Icon name="download" />
                  下载收据
                </button>
              </div>
            ))}
          </div>
        )}
      </SettingsSection>

      <Modal
        open={planModal}
        close={() => setPlanModal(false)}
        title={limited ? "恢复订阅" : "更换套餐"}
        description="新套餐在确认支付后立即生效，剩余额度会自动结转。"
        size="lg"
        footer={
          <ModalActions
            cancel={() => setPlanModal(false)}
            confirmText="确认并支付"
            loading={saving}
            confirm={() => commit("套餐已更新", () => setPlanModal(false))}
          />
        }
      >
        <div className="s5-plan-choices" role="radiogroup">
          {[
            ["基础版", "¥199 / 月", "20 次 Agent 任务，适合轻量使用"],
            ["专业版", "¥399 / 月", "50 次 Agent 任务和完整自动化能力"],
            ["专业版年付", "¥3,990 / 年", "相当于免费使用两个月"],
          ].map(([title, price, description]) => (
            <ChoiceCard
              key={title}
              title={title}
              description={`${price} · ${description}`}
              selected={selectedPlan === title}
              onClick={() => setSelectedPlan(title)}
              icon="creditCard"
            />
          ))}
        </div>
      </Modal>
      <Modal
        open={renewModal}
        close={() => setRenewModal(false)}
        title={autoRenew ? "关闭自动续订" : "开启自动续订"}
        description={
          autoRenew
            ? "当前订阅将在 2026 年 8 月 31 日结束。"
            : "下个周期将自动使用当前支付方式续订。"
        }
        size="sm"
        footer={
          <ModalActions
            cancel={() => setRenewModal(false)}
            confirmText={autoRenew ? "确认关闭" : "确认开启"}
            loading={saving}
            confirm={() =>
              commit(autoRenew ? "自动续订已关闭" : "自动续订已开启", () => {
                setAutoRenew((value) => !value);
                setRenewModal(false);
              })
            }
          />
        }
      >
        <InlineNotice
          tone={autoRenew ? "warning" : "info"}
          icon={autoRenew ? "warning" : "info"}
        >
          到期后 Agent 和付费功能会暂停，业务数据仍可查看和导出。
        </InlineNotice>
      </Modal>
      <Modal
        open={paymentModal}
        close={() => setPaymentModal(false)}
        title="更新支付方式"
        description="新的支付方式将在下次续订时使用。"
        footer={
          <ModalActions
            cancel={() => setPaymentModal(false)}
            loading={saving}
            confirm={() =>
              commit("支付方式已更新", () => setPaymentModal(false))
            }
          />
        }
      >
        <div className="s5-payment-options">
          <ChoiceCard
            title="微信支付"
            description="通过微信扫码完成验证"
            selected
            icon="qrCode"
            onClick={() => {}}
          />
          <ChoiceCard
            title="银行卡"
            description="招商银行尾号 6028"
            icon="creditCard"
            onClick={() => notify("已选择银行卡", "info")}
          />
        </div>
      </Modal>
    </PageState>
  );
}

export function DataPrivacySettingsPage() {
  const { state, clearState } = usePageState();
  const navigate = useNavigate();
  const notify = useToast();
  const limited = state === "limited";
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [danger, setDanger] = useState(null);
  const [confirmation, setConfirmation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const workspaceName = "沈岚的猎头工作空间";
  const blocked = danger === "account" && limited;
  const confirmValid =
    danger === "workspace"
      ? confirmation === workspaceName
      : confirmation === "注销账号";
  return (
    <PageState state={state} clearState={clearState}>
      <SettingsPageHeader
        title="数据与隐私"
        description="管理数据带出、恢复、诊断和账号级危险操作。"
      />
      <SettingsSection
        title="数据带出与恢复"
        description="导出和回收站继续使用统一数据管理能力。"
      >
        <div className="s5-setting-list">
          <SettingRow
            icon="download"
            title="导出全部数据"
            description="生成候选人、岗位、公司、版图、论文、专利和业务记录的可下载文件"
            meta="订阅到期后仍可使用"
            action={
              <Button size="sm" onClick={() => navigate("/data/exports")}>
                前往导出
              </Button>
            }
          />
          <SettingRow
            icon="refresh"
            title="回收站"
            description="恢复误删的业务资产，或查看距离自动清理还剩多久"
            action={
              <Button size="sm" onClick={() => navigate("/recycle-bin")}>
                打开回收站
              </Button>
            }
          />
          <SettingRow
            icon="file"
            title="创建诊断包"
            description="只包含脱敏任务状态、错误码和运行环境，不包含业务内容"
            meta="上次创建：2026 年 8 月 21 日"
            action={
              <Button
                size="sm"
                loading={diagnosticLoading}
                onClick={() => {
                  setDiagnosticLoading(true);
                  window.setTimeout(() => {
                    setDiagnosticLoading(false);
                    notify("诊断包正在后台生成，完成后会通知你", "info");
                  }, 620);
                }}
              >
                创建诊断包
              </Button>
            }
          />
        </div>
      </SettingsSection>
      <SettingsSection
        title="隐私边界"
        description="阶段一默认使用最小数据访问原则。"
      >
        <div className="s5-privacy-principles">
          <div>
            <Icon name="shield" />
            <span>
              <b>运营人员不能查看业务内容</b>
              <small>
                运营后台只显示工作空间、订阅、用量、任务状态、错误码和脱敏诊断。
              </small>
            </span>
          </div>
          <div>
            <Icon name="lock" />
            <span>
              <b>外部服务不暴露用户配置</b>
              <small>
                模型、搜索和学术数据服务由 Hunter 托管，并按数据边界处理。
              </small>
            </span>
          </div>
          <div>
            <Icon name="database" />
            <span>
              <b>删除使用统一回收站</b>
              <small>
                正式业务资产删除后进入回收站，超过保留期才自动清理。
              </small>
            </span>
          </div>
        </div>
      </SettingsSection>
      <SettingsSection
        title="危险操作"
        description="这些操作会影响整个个人工作空间。"
        tone="danger"
      >
        <div className="s5-danger-list">
          <SettingRow
            title="删除个人工作空间"
            description="所有业务资产、主线、任务和文件进入待清理状态；保留期内可联系客服恢复。"
            action={
              <Button
                tone="danger"
                size="sm"
                onClick={() => {
                  setDanger("workspace");
                  setConfirmation("");
                }}
              >
                删除工作空间
              </Button>
            }
          />
          <SettingRow
            title="注销 Hunter 账号"
            description="账号将不能登录；注销前必须处理有效订阅并完成数据导出。"
            action={
              <Button
                tone="danger"
                size="sm"
                onClick={() => {
                  setDanger("account");
                  setConfirmation("");
                }}
              >
                注销账号
              </Button>
            }
          />
        </div>
      </SettingsSection>

      <Modal
        open={Boolean(danger)}
        close={() => {
          setDanger(null);
          setSubmitted(false);
        }}
        title={danger === "workspace" ? "删除个人工作空间" : "注销 Hunter 账号"}
        description="该操作影响范围很大，请阅读说明后再继续。"
        size="sm"
        footer={
          <>
            <Button onClick={() => setDanger(null)}>取消</Button>
            <Button
              tone="danger"
              disabled={!confirmValid || blocked}
              onClick={() => {
                setSubmitted(true);
                notify(
                  danger === "workspace" ? "删除申请已提交" : "注销申请已提交",
                  "info",
                );
              }}
            >
              {submitted ? "申请已提交" : "确认提交"}
            </Button>
          </>
        }
      >
        {blocked ? (
          <InlineNotice tone="warning" icon="warning">
            当前存在有效订阅，请先关闭自动续订并等待本周期结束，再提交注销申请。
          </InlineNotice>
        ) : null}
        <div className="s5-danger-copy">
          <p>
            {danger === "workspace"
              ? "删除后所有业务数据将不可继续编辑，正在运行的任务会停止。"
              : "注销后账号将不能登录，工作空间随账号进入待清理状态。"}
          </p>
          <FormField
            label={
              danger === "workspace"
                ? `输入“${workspaceName}”确认`
                : "输入“注销账号”确认"
            }
            required
            error={confirmation && !confirmValid ? "输入内容不匹配" : ""}
          >
            <TextInput value={confirmation} onChange={setConfirmation} />
          </FormField>
        </div>
      </Modal>
    </PageState>
  );
}
