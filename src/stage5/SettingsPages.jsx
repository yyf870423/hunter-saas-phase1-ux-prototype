import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import {
  formatCny,
  subscriptionPlanChoices,
  subscriptionPlans,
} from "../shared/productCatalog";
import { FormField, SelectMenu, TextInput } from "../stage4/asset-ui";
import { Button, IconButton, Modal, StatusBadge, useToast } from "../stage1/ui";
import {
  ChoiceCard,
  InlineNotice,
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

function ModalActions({
  cancel,
  confirm,
  confirmText = "保存",
  loading,
  confirmDisabled = false,
}) {
  return (
    <>
      <Button onClick={cancel} disabled={loading}>
        取消
      </Button>
      <Button
        tone="primary"
        onClick={confirm}
        loading={loading}
        disabled={confirmDisabled}
      >
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
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [wechatOpen, setWechatOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarDraft, setAvatarDraft] = useState("");
  const [avatarName, setAvatarName] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [avatarZoom, setAvatarZoom] = useState(100);
  const [newPhone, setNewPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [wechatBound, setWechatBound] = useState(true);
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

  const openAvatarEditor = () => {
    setAvatarDraft(avatarPreview);
    setAvatarError("");
    setAvatarZoom(100);
    setAvatarOpen(true);
  };

  const selectAvatarFile = (file) => {
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError("请选择 JPG、PNG 或 WebP 图片");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("图片不能超过 5 MB");
      return;
    }
    setAvatarError("");
    setAvatarName(file.name);
    setAvatarDraft(URL.createObjectURL(file));
    setAvatarZoom(100);
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
            <i
              className={avatarPreview ? "has-image" : ""}
              style={
                avatarPreview
                  ? { backgroundImage: `url(${avatarPreview})` }
                  : undefined
              }
            >
              {avatarPreview ? null : "SL"}
            </i>
            {!editingProfile ? (
              <button type="button" onClick={openAvatarEditor}>
                更换头像
              </button>
            ) : null}
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
                  <dt>登录手机号</dt>
                  <dd>
                    138 **** 8000
                    <StatusBadge tone="success" dot={false}>
                      已验证
                    </StatusBadge>
                  </dd>
                </div>
                <div>
                  <dt>微信</dt>
                  <dd>{wechatBound ? "沈岚 · 已绑定" : "未绑定"}</dd>
                </div>
                <div>
                  <dt>联系邮箱</dt>
                  <dd>shenlan@hunter-demo.cn</dd>
                </div>
              </dl>
            )}
            {editingProfile ? (
              <div className="s5-readonly-field">
                <span>联系邮箱</span>
                <b>shenlan@hunter-demo.cn</b>
                <button type="button" onClick={() => setEmailOpen(true)}>
                  修改联系邮箱
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </SettingsSection>

      <Modal
        open={avatarOpen}
        close={() => setAvatarOpen(false)}
        title="更换头像"
        description="支持 JPG、PNG 或 WebP，文件不超过 5 MB。"
        footer={
          <ModalActions
            cancel={() => setAvatarOpen(false)}
            confirmText="保存头像"
            confirm={() =>
              save(() => {
                setAvatarPreview(avatarDraft);
                setAvatarOpen(false);
              }, "头像已更新")
            }
            loading={saving}
            confirmDisabled={!avatarDraft}
          />
        }
      >
        <div className="s5-avatar-modal">
          <label
            className="s5-avatar-upload"
            htmlFor="s5-avatar-file"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              selectAvatarFile(event.dataTransfer.files?.[0]);
            }}
          >
            <Icon name="upload" />
            <span>
              <b>{avatarName || "选择头像图片"}</b>
              <small>点击选择文件，也可以将图片拖到这里</small>
            </span>
            <em>{avatarName ? "重新选择" : "选择图片"}</em>
          </label>
          <input
            id="s5-avatar-file"
            className="s5-visually-hidden"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => selectAvatarFile(event.target.files?.[0])}
          />
          {avatarError ? <p className="s5-field-error">{avatarError}</p> : null}
          {avatarDraft ? (
            <div className="s5-avatar-cropper">
              <div className="s5-avatar-crop-viewport">
                <img
                  src={avatarDraft}
                  alt="头像裁剪预览"
                  style={{ transform: `scale(${avatarZoom / 100})` }}
                />
                <i />
              </div>
              <div className="s5-avatar-zoom">
                <Icon name="minus" />
                <label>
                  <span>缩放头像</span>
                  <input
                    type="range"
                    min="100"
                    max="180"
                    value={avatarZoom}
                    onChange={(event) =>
                      setAvatarZoom(Number(event.target.value))
                    }
                  />
                </label>
                <Icon name="plus" />
              </div>
              <small>缩放图片，使头像主体位于圆形区域内。</small>
            </div>
          ) : (
            <div className="s5-avatar-placeholder">
              <i>SL</i>
              <span>选择图片后可在这里裁剪和预览</span>
            </div>
          )}
        </div>
      </Modal>

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
        description="管理登录身份和当前账号的登录设备。"
      >
        <div className="s5-setting-list">
          <SettingRow
            icon="phone"
            title="登录手机号"
            description="138 **** 8000 · 已验证"
            action={
              <Button size="sm" onClick={() => setPhoneOpen(true)}>
                更换手机号
              </Button>
            }
          />
          <SettingRow
            icon="message"
            title="微信登录"
            description={wechatBound ? "沈岚 · 已绑定" : "尚未绑定"}
            status={
              <StatusBadge tone={wechatBound ? "success" : "warning"}>
                {wechatBound ? "已绑定" : "待绑定"}
              </StatusBadge>
            }
            action={
              <Button size="sm" onClick={() => setWechatOpen(true)}>
                {wechatBound ? "管理绑定" : "绑定微信"}
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
        title="修改联系邮箱"
        description="联系邮箱用于接收通知，不作为 Hunter 的登录身份。"
        footer={
          <ModalActions
            cancel={() => setEmailOpen(false)}
            confirmText="保存联系邮箱"
            confirm={() => {
              if (!/^\S+@\S+\.\S+$/.test(newEmail)) return;
              save(() => setEmailOpen(false), "联系邮箱已更新");
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
        open={phoneOpen}
        close={() => setPhoneOpen(false)}
        title="更换登录手机号"
        description="验证新手机号后替换当前登录手机号，其他登录方式不受影响。"
        footer={
          <ModalActions
            cancel={() => setPhoneOpen(false)}
            confirmText="验证并更换"
            confirm={() => {
              if (!/^1\d{10}$/.test(newPhone) || !phoneCode.trim()) return;
              save(() => setPhoneOpen(false), "登录手机号已更新");
            }}
            loading={saving}
            confirmDisabled={!/^1\d{10}$/.test(newPhone) || !phoneCode.trim()}
          />
        }
      >
        <div className="s5-modal-form">
          <FormField
            label="新手机号"
            required
            error={
              newPhone && !/^1\d{10}$/.test(newPhone)
                ? "请输入有效的 11 位手机号"
                : ""
            }
          >
            <TextInput
              value={newPhone}
              onChange={setNewPhone}
              placeholder="请输入新手机号"
            />
          </FormField>
          <FormField label="短信验证码" required>
            <TextInput
              value={phoneCode}
              onChange={setPhoneCode}
              placeholder="请输入验证码"
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        open={wechatOpen}
        close={() => setWechatOpen(false)}
        title={wechatBound ? "管理微信登录" : "绑定微信登录"}
        description={
          wechatBound
            ? "解除绑定后仍可使用已验证手机号登录。"
            : "使用微信扫码完成绑定，绑定后可以直接扫码登录。"
        }
        size="sm"
        footer={
          <>
            <Button onClick={() => setWechatOpen(false)}>取消</Button>
            <Button
              tone={wechatBound ? "danger" : "primary"}
              onClick={() =>
                save(
                  () => {
                    setWechatBound((value) => !value);
                    setWechatOpen(false);
                  },
                  wechatBound ? "微信登录已解除绑定" : "微信登录已绑定",
                )
              }
            >
              {wechatBound ? "解除绑定" : "开始绑定"}
            </Button>
          </>
        }
      >
        <InlineNotice tone={wechatBound ? "warning" : "info"}>
          {wechatBound
            ? "当前账号仍保留已验证手机号，不会因解除微信绑定而无法登录。"
            : "原型使用模拟扫码，不会调用真实微信开放平台。"}
        </InlineNotice>
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
  ["task", "任务状态", "需要处理、暂停、等待用户和等待外部", true, true, false],
  ["signal", "高优先级信号", "即将失效的机会和强信号", true, true, false],
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
        description="选择重要事项的提醒方式，避免错过需要处理的任务。"
        actions={
          <Button tone="primary" loading={saving} onClick={save}>
            保存设置
          </Button>
        }
      />
      {limited ? (
        <InlineNotice tone="warning" icon="warning">
          联系邮箱尚未验证，邮件通知暂不可用。站内通知不会受到影响。
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

export function AutomationSettingsPage() {
  const { state, clearState } = usePageState();
  const notify = useToast();
  const [mode, setMode] = useState("执行前确认");
  const [editing, setEditing] = useState(false);
  const [draftMode, setDraftMode] = useState("执行前确认");
  const [saving, setSaving] = useState(false);
  const open = () => {
    setEditing(true);
    setDraftMode(mode);
  };
  return (
    <PageState state={state} clearState={clearState}>
      <SettingsPageHeader
        title="自动化授权"
        description="设置新任务的默认执行边界；运行中的任务可以单独调整。"
      />
      <InlineNotice>
        默认使用“执行前确认”。授权只影响尚未执行的动作，运行中的任务可以单独调整。
      </InlineNotice>
      <SettingsSection
        title="新任务默认授权"
        description="所有新创建的任务继承同一默认值；进入任务后仍可单独调整。"
      >
        <div className="s5-automation-list">
          <SettingRow
            icon="activity"
            title="所有新任务"
            description="适用于从新建入口或信号启动的任务"
            meta="上次修改于 2026 年 8 月 18 日"
            status={
              <StatusBadge
                tone={
                  mode === "自动执行"
                    ? "warning"
                    : mode === "仅分析"
                      ? "neutral"
                      : "info"
                }
              >
                {mode}
              </StatusBadge>
            }
            action={
              <Button size="sm" onClick={open}>
                修改
              </Button>
            }
          />
        </div>
      </SettingsSection>
      <Modal
        open={editing}
        close={() => setEditing(false)}
        title="修改新任务默认授权"
        description="修改后只影响新创建且未单独指定授权的任务。"
        size="lg"
        footer={
          <ModalActions
            cancel={() => setEditing(false)}
            confirm={() => {
              setSaving(true);
              window.setTimeout(() => {
                setMode(draftMode);
                setSaving(false);
                setEditing(false);
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
            description="自动完成已授权的数据写入和低风险操作；高风险动作仍由你处理。"
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
  const [mailModal, setMailModal] = useState(false);
  const [mailStage, setMailStage] = useState("credentials");
  const [mailAddress, setMailAddress] = useState(empty ? "" : "shenlan@qq.com");
  const [mailSecret, setMailSecret] = useState("");
  const [mailFieldError, setMailFieldError] = useState("");
  const [detectedProvider, setDetectedProvider] = useState("");
  const [incomingProtocol, setIncomingProtocol] = useState("IMAP");
  const [mailServers, setMailServers] = useState({
    smtpHost: "",
    smtpPort: "465",
    incomingHost: "",
    incomingPort: "993",
    encryption: "SSL/TLS",
  });
  const [disconnect, setDisconnect] = useState(null);

  const resetMail = () => {
    setMailModal(false);
    setMailStage("credentials");
    setMailFieldError("");
    setDetectedProvider("");
  };

  const startMailDetection = () => {
    if (!/^\S+@\S+\.\S+$/.test(mailAddress)) {
      setMailFieldError("请输入有效邮箱地址");
      return;
    }
    if (!mailSecret.trim()) {
      setMailFieldError("请输入邮箱密码或客户端授权码");
      return;
    }
    setMailFieldError("");
    setMailStage("detecting");
    window.setTimeout(() => {
      const domain = mailAddress.split("@")[1]?.toLowerCase();
      const knownProviders = {
        "qq.com": ["QQ 邮箱", "smtp.qq.com", "imap.qq.com"],
        "foxmail.com": ["Foxmail", "smtp.qq.com", "imap.qq.com"],
        "163.com": ["网易 163 邮箱", "smtp.163.com", "imap.163.com"],
        "gmail.com": ["Gmail", "smtp.gmail.com", "imap.gmail.com"],
        "outlook.com": [
          "Outlook",
          "smtp-mail.outlook.com",
          "outlook.office365.com",
        ],
        "hotmail.com": [
          "Outlook",
          "smtp-mail.outlook.com",
          "outlook.office365.com",
        ],
      };
      const detected = knownProviders[domain];
      if (!detected) {
        setMailServers((current) => ({
          ...current,
          smtpHost: `smtp.${domain || "example.com"}`,
          incomingHost: `imap.${domain || "example.com"}`,
        }));
        setMailStage("detect-failed");
        return;
      }
      setDetectedProvider(detected[0]);
      setIncomingProtocol("IMAP");
      setMailServers({
        smtpHost: detected[1],
        smtpPort: "465",
        incomingHost: detected[2],
        incomingPort: "993",
        encryption: "SSL/TLS",
      });
      setMailStage("detected");
    }, 650);
  };

  const verifyMailConnection = () => {
    if (
      !mailServers.smtpHost.trim() ||
      !mailServers.smtpPort.trim() ||
      !mailServers.incomingHost.trim() ||
      !mailServers.incomingPort.trim()
    ) {
      setMailFieldError("请完整填写发件和收件服务器信息");
      return;
    }
    setMailFieldError("");
    setMailStage("verifying");
    window.setTimeout(() => setMailStage("success"), 720);
  };

  return (
    <PageState
      state={state === "error" ? "normal" : state}
      clearState={clearState}
    >
      <SettingsPageHeader
        title="连接"
        description="管理 Hunter 用于发送邮件和读取回复的个人邮箱。"
      />
      {state === "error" ? (
        <InlineNotice tone="danger" icon="warning">
          上次连接邮箱时授权服务未响应。当前连接不受影响，可以重新连接。
        </InlineNotice>
      ) : null}
      <SettingsSection
        title="发件邮箱"
        description="连接常用个人邮箱后，Hunter 使用邮箱协议发送邮件并读取对应回复。"
      >
        {mailConnected ? (
          <div className="s5-connection-card">
            <i>
              <Icon name="mail" />
            </i>
            <span>
              <span>
                <b>{mailAddress || "shenlan@qq.com"}</b>
                <StatusBadge tone="success">已连接</StatusBadge>
              </span>
              <small>QQ 邮箱 · SMTP + IMAP · 最近发送于今天 10:42</small>
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
                填写邮箱地址及邮箱密码或客户端授权码。Hunter
                会自动探测可用协议，无法识别时再由你手动设置。
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
      <Modal
        open={mailModal}
        close={resetMail}
        closeDisabled={mailStage === "detecting" || mailStage === "verifying"}
        title={mailStage === "success" ? "邮箱连接完成" : "连接发件邮箱"}
        description={
          mailStage === "credentials"
            ? "填写个人邮箱凭据，Hunter 会自动探测发件和收件配置。"
            : mailStage === "manual"
              ? "自动探测失败，请确认邮箱服务商提供的协议和服务器信息。"
              : "验证邮箱协议和登录凭据。"
        }
        footer={
          mailStage === "credentials" ? (
            <>
              <Button onClick={resetMail}>取消</Button>
              <Button tone="primary" onClick={startMailDetection}>
                自动探测
              </Button>
            </>
          ) : mailStage === "detected" || mailStage === "manual" ? (
            <>
              <Button onClick={() => setMailStage("credentials")}>
                上一步
              </Button>
              <Button tone="primary" onClick={verifyMailConnection}>
                验证并连接
              </Button>
            </>
          ) : mailStage === "detect-failed" ? (
            <>
              <Button onClick={() => setMailStage("credentials")}>
                修改邮箱
              </Button>
              <Button tone="primary" onClick={() => setMailStage("manual")}>
                手动设置
              </Button>
            </>
          ) : mailStage === "success" ? (
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
          ) : (
            <Button tone="primary" loading disabled>
              正在验证
            </Button>
          )
        }
      >
        {mailStage === "credentials" ? (
          <div className="s5-modal-form">
            <FormField label="邮箱地址" required>
              <TextInput
                value={mailAddress}
                onChange={setMailAddress}
                placeholder="name@example.com"
              />
            </FormField>
            <FormField
              label="邮箱密码或客户端授权码"
              required
              hint="QQ、163 等邮箱通常需要先在邮箱设置中开启协议服务，并填写客户端授权码。"
            >
              <input
                className="s4-input"
                type="password"
                value={mailSecret}
                onChange={(event) => setMailSecret(event.target.value)}
                placeholder="仅用于验证邮箱连接"
              />
            </FormField>
            {mailFieldError ? (
              <p className="s5-field-error">{mailFieldError}</p>
            ) : null}
            <InlineNotice>
              发件固定使用 SMTP；收取回复优先使用
              IMAP。只有自动探测失败时，才需要手动选择收件协议和服务器。
            </InlineNotice>
          </div>
        ) : mailStage === "detecting" ? (
          <div className="s5-connect-status is-running">
            <span className="s1-spinner" />
            <b>正在探测邮箱配置</b>
            <p>正在识别邮箱服务商、SMTP 发件配置和 IMAP 收件配置。</p>
          </div>
        ) : mailStage === "detected" ? (
          <div className="s5-mail-detected">
            <div className="s5-connect-status is-success is-compact">
              <i>
                <Icon name="check" />
              </i>
              <b>已识别为 {detectedProvider}</b>
              <p>请确认配置后验证邮箱凭据。</p>
            </div>
            <dl>
              <div>
                <dt>发送邮件</dt>
                <dd>
                  SMTP · {mailServers.smtpHost}:{mailServers.smtpPort}
                </dd>
              </div>
              <div>
                <dt>读取回复</dt>
                <dd>
                  IMAP · {mailServers.incomingHost}:{mailServers.incomingPort}
                </dd>
              </div>
              <div>
                <dt>连接加密</dt>
                <dd>{mailServers.encryption}</dd>
              </div>
            </dl>
          </div>
        ) : mailStage === "detect-failed" ? (
          <div className="s5-connect-status is-error">
            <i>
              <Icon name="warning" />
            </i>
            <b>未能自动识别邮箱配置</b>
            <p>
              邮箱地址和密码已保留。你可以修改邮箱，或按照邮箱服务商提供的信息手动设置协议。
            </p>
          </div>
        ) : mailStage === "manual" ? (
          <div className="s5-mail-manual">
            <InlineNotice>
              SMTP 用于发送邮件，不能更换。收件协议推荐
              IMAP；仅当邮箱服务商不支持 IMAP 时选择 POP3。
            </InlineNotice>
            <div className="s5-mail-server-grid">
              <FormField label="发件协议">
                <div className="s5-protocol-readonly">SMTP</div>
              </FormField>
              <FormField label="SMTP 服务器" required>
                <TextInput
                  value={mailServers.smtpHost}
                  onChange={(value) =>
                    setMailServers((current) => ({
                      ...current,
                      smtpHost: value,
                    }))
                  }
                />
              </FormField>
              <FormField label="SMTP 端口" required>
                <TextInput
                  value={mailServers.smtpPort}
                  onChange={(value) =>
                    setMailServers((current) => ({
                      ...current,
                      smtpPort: value,
                    }))
                  }
                />
              </FormField>
              <FormField label="收件协议" required>
                <SelectMenu
                  label="收件协议"
                  value={incomingProtocol}
                  options={["IMAP", "POP3"]}
                  onChange={(value) => {
                    setIncomingProtocol(value);
                    setMailServers((current) => ({
                      ...current,
                      incomingPort: value === "IMAP" ? "993" : "995",
                      incomingHost: current.incomingHost.replace(
                        /^(imap|pop)\./,
                        value === "IMAP" ? "imap." : "pop.",
                      ),
                    }));
                  }}
                />
              </FormField>
              <FormField label={`${incomingProtocol} 服务器`} required>
                <TextInput
                  value={mailServers.incomingHost}
                  onChange={(value) =>
                    setMailServers((current) => ({
                      ...current,
                      incomingHost: value,
                    }))
                  }
                />
              </FormField>
              <FormField label={`${incomingProtocol} 端口`} required>
                <TextInput
                  value={mailServers.incomingPort}
                  onChange={(value) =>
                    setMailServers((current) => ({
                      ...current,
                      incomingPort: value,
                    }))
                  }
                />
              </FormField>
              <FormField label="连接加密" required>
                <SelectMenu
                  label="连接加密"
                  value={mailServers.encryption}
                  options={["SSL/TLS", "STARTTLS"]}
                  onChange={(value) =>
                    setMailServers((current) => ({
                      ...current,
                      encryption: value,
                    }))
                  }
                />
              </FormField>
            </div>
            {mailFieldError ? (
              <p className="s5-field-error">{mailFieldError}</p>
            ) : null}
          </div>
        ) : mailStage === "verifying" ? (
          <div className="s5-connect-status is-running">
            <span className="s1-spinner" />
            <b>正在验证发件和收件能力</b>
            <p>Hunter 会分别验证 SMTP 登录、测试邮件发送和收件协议连接。</p>
          </div>
        ) : (
          <div className="s5-connect-status is-success">
            <i>
              <Icon name="check" />
            </i>
            <b>{mailAddress} 已连接</b>
            <p>
              已验证 SMTP 发件和 {incomingProtocol} 收件，可以开始确认邮件草稿。
            </p>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(disconnect)}
        close={() => setDisconnect(null)}
        size="sm"
        title="断开发件邮箱"
        description="已发送邮件和历史回复仍会保留。"
        footer={
          <>
            <Button onClick={() => setDisconnect(null)}>取消</Button>
            <Button
              tone="danger"
              onClick={() => {
                setMailConnected(false);
                setDisconnect(null);
                notify("发件邮箱已断开");
              }}
            >
              确认
            </Button>
          </>
        }
      >
        <InlineNotice tone="warning" icon="warning">
          尚未发送的邮件草稿会保留，但发送和读取后续回复前需要重新连接邮箱。
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
  const noSubscription = state === "none";
  const [planModal, setPlanModal] = useState(false);
  const [renewModal, setRenewModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("专业版");
  const [paymentMethod, setPaymentMethod] = useState("支付宝");
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
      {noSubscription ? (
        <section className="s5-no-subscription">
          <i>
            <Icon name="creditCard" />
          </i>
          <span>
            <small>当前订阅</small>
            <h2>尚未订阅 Hunter</h2>
            <p>
              你可以浏览和导出已有业务数据；开始
              Agent、自动化任务和付费数据处理前需要选择套餐。
            </p>
          </span>
          <Button tone="primary" onClick={() => setPlanModal(true)}>
            选择订阅
          </Button>
        </section>
      ) : (
        <>
          <section className="s5-plan-overview">
            <div className="s5-plan-card">
              <span>
                <small>当前套餐</small>
                <h2>{limited ? "专业版 · 已到期" : "专业版"}</h2>
                <p>适合独立猎头持续经营客户、岗位、人才和版图。</p>
              </span>
              <dl>
                <div>
                  <dt>下次续订</dt>
                  <dd>{limited ? "已停止" : "2026 年 9 月 1 日"}</dd>
                </div>
                <div>
                  <dt>自动付费</dt>
                  <dd>{paymentMethod}</dd>
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
                  <b>Agent 用量</b>
                  <em>
                    36 / {subscriptionPlans.professional.agentTaskQuota} 次
                  </em>
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
            description="达到用量边界前提前通知，避免运行中的任务意外停止。"
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
                description="必须通知，并停止创建新的付费任务"
                action={<Toggle label="额度耗尽提醒" checked disabled />}
              />
            </div>
          </SettingsSection>
        </>
      )}
      <SettingsSection title="订单记录" description="查看历史支付结果。">
        {empty || noSubscription ? (
          <div className="s5-orders-empty">
            <Icon name="receipt" />
            <b>还没有订单记录</b>
            <span>完成首笔订阅支付后会显示在这里。</span>
          </div>
        ) : (
          <div className="s5-order-list">
            {[
              [
                "2026 年 8 月 1 日",
                "专业版月度订阅",
                formatCny(subscriptionPlans.professional.monthlyPrice),
                "支付成功",
              ],
              [
                "2026 年 7 月 1 日",
                "专业版月度订阅",
                formatCny(subscriptionPlans.professional.monthlyPrice),
                "支付成功",
              ],
              [
                "2026 年 6 月 1 日",
                "专业版月度订阅",
                formatCny(subscriptionPlans.professional.monthlyPrice),
                "支付成功",
              ],
            ].map((order) => (
              <div key={order[0]}>
                <span>
                  <b>{order[1]}</b>
                  <small>{order[0]}</small>
                </span>
                <em>{order[2]}</em>
                <StatusBadge tone="success">{order[3]}</StatusBadge>
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
          {subscriptionPlanChoices.map(({ title, price, description }) => (
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
        <div className="s5-subscription-payment">
          <span>
            <b>支付方式</b>
            <small>中国大陆阶段一支持支付宝和微信支付。</small>
          </span>
          <div className="s5-payment-options" role="radiogroup">
            <ChoiceCard
              title="支付宝"
              description="确认后跳转支付宝完成首次支付"
              selected={paymentMethod === "支付宝"}
              icon="creditCard"
              onClick={() => setPaymentMethod("支付宝")}
            />
            <ChoiceCard
              title="微信支付"
              description="确认后使用微信扫码完成首次支付"
              selected={paymentMethod === "微信支付"}
              icon="qrCode"
              onClick={() => setPaymentMethod("微信支付")}
            />
          </div>
          <InlineNotice>
            订阅默认开启自动续订，后续续订继续使用首次支付时授权的方式；当前版本不提供更换自动付费方式。
          </InlineNotice>
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
    </PageState>
  );
}

export function DataPrivacySettingsPage() {
  const { state, clearState } = usePageState();
  const navigate = useNavigate();
  const notify = useToast();
  const limited = state === "limited";
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [danger, setDanger] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const workspaceName = "沈岚的猎头工作空间";
  const blocked = limited;
  const confirmValid = confirmation === workspaceName;
  return (
    <PageState state={state} clearState={clearState}>
      <SettingsPageHeader
        title="数据与隐私"
        description="管理数据带出、恢复、诊断和工作空间操作。"
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
        title="危险操作"
        description="这些操作会影响整个个人工作空间。"
        tone="danger"
      >
        <div className="s5-danger-list">
          <SettingRow
            title="删除个人工作空间"
            description="所有业务资产、任务及相关文件进入待清理状态；保留期内可联系客服恢复。"
            action={
              <Button
                tone="danger"
                size="sm"
                onClick={() => {
                  setDanger(true);
                  setConfirmation("");
                }}
              >
                删除工作空间
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
        title="删除个人工作空间"
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
                notify("删除申请已提交", "info");
              }}
            >
              {submitted ? "申请已提交" : "确认提交"}
            </Button>
          </>
        }
      >
        {blocked ? (
          <InlineNotice tone="warning" icon="warning">
            当前仍有 2
            项数据导出任务正在运行。请等待任务完成或取消任务后，再删除工作空间。
          </InlineNotice>
        ) : null}
        <div className="s5-danger-copy">
          <p>删除后所有业务数据将不可继续编辑，正在运行的任务会停止。</p>
          <FormField
            label={`输入“${workspaceName}”确认`}
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
