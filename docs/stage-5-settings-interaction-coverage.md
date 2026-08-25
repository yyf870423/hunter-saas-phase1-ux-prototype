# 阶段五：设置中心交互覆盖清单

| 需求操作           | 页面入口       | 组件                               | 正常路径                   | 异常路径                                         |
| ------------------ | -------------- | ---------------------------------- | -------------------------- | ------------------------------------------------ |
| 从账户菜单进入设置 | 全局用户菜单   | AccountMenu                        | 打开个人资料               | 路由不可用时显示错误页                           |
| 编辑个人资料       | 个人资料       | SectionEditor、Input               | 编辑、保存、Toast          | 必填为空、邮箱错误、保存失败                     |
| 更换头像           | 个人资料查看态 | AvatarUploadModal、Cropper         | 直接选图、裁剪、缩放并保存 | 格式错误、超过 5 MB、上传失败                    |
| 维护登录身份       | 个人资料       | Modal、PhoneInput、WeChatBinding   | 更换手机号、绑定或解除微信 | 手机号错误、验证码缺失、不能移除最后一种登录身份 |
| 管理活跃会话       | 个人资料       | SessionList、ConfirmModal          | 退出其他会话               | 会话读取失败、操作失败                           |
| 修改通知偏好       | 通知           | NotificationMatrix、Toggle         | 保存选择                   | 联系邮箱未验证、强制项不可关闭、保存失败         |
| 修改默认授权       | 自动化授权     | AuthorizationModal                 | 选择模式并确认             | 自动执行影响确认、保存失败                       |
| 连接发件邮箱       | 连接           | ProtocolDetectModal                | 填写凭据、自动探测、验证   | 探测失败、手动选 IMAP/POP3、重试                 |
| 断开发件邮箱       | 连接           | ConfirmModal                       | 确认后断开                 | 存在待发草稿、操作失败                           |
| 添加寻访 App 设备  | 连接           | DeviceConnectModal                 | 连接码、等待、成功         | 连接码过期、版本不兼容                           |
| 撤销设备授权       | 连接           | ConfirmModal                       | 撤销并刷新列表             | 未提交结果影响、操作失败                         |
| 查看套餐与用量     | 订阅与用量     | UsageRing、UsageBreakdown          | 查看明细                   | 用量明细加载失败                                 |
| 首次订阅           | 订阅与用量     | PlanModal、PaymentChoice           | 选套餐、支付宝/微信支付    | 支付失败、重复提交禁用                           |
| 更换套餐与续订     | 订阅与用量     | PlanModal                          | 选择并确认                 | 支付失败、重复提交禁用                           |
| 管理自动续订       | 订阅与用量     | ConfirmModal                       | 开启或关闭                 | 关闭影响说明、操作失败                           |
| 查看订单记录       | 订阅与用量     | OrderList                          | 查看日期、金额和支付状态   | 无订单空状态                                     |
| 导出全部数据       | 数据与隐私     | ActionRow                          | 进入数据导出               | 创建失败、订阅到期仍可用                         |
| 创建诊断包         | 数据与隐私     | AsyncAction                        | 创建异步任务               | 创建失败、脱敏说明                               |
| 进入回收站         | 数据与隐私     | ActionRow                          | 打开回收站                 | 无数据空状态                                     |
| 删除工作空间       | 数据与隐私     | TypedConfirmModal                  | 输入名称后确认             | 名称错误、有效任务阻塞                           |
| 切换设置项         | 全部           | SettingsNav、MobileSectionSelector | 保留状态切换               | 未保存离开确认                                   |
| 响应式操作         | 全部           | ResponsiveShell                    | 桌面、iPad、iPhone 可操作  | 无横向溢出、浮层不截断                           |

## 状态验收

| 状态           | URL 示例                                | 验收重点                       |
| -------------- | --------------------------------------- | ------------------------------ |
| 加载           | `/settings/profile?state=loading`       | 骨架稳定，不整页闪动           |
| 页面错误       | `/settings/profile?state=error`         | 原因、影响和重试动作清楚       |
| 联系邮箱未验证 | `/settings/notifications?state=limited` | 邮件通知不可选，站内通知可用   |
| 无连接         | `/settings/connections?state=empty`     | 空状态和连接入口清楚           |
| 连接失败       | `/settings/connections?state=error`     | 原步骤可重试，不清空选择       |
| 订阅到期       | `/settings/subscription?state=limited`  | Agent 受限，数据浏览导出可用   |
| 从未订阅       | `/settings/subscription?state=none`     | 首次订阅入口和能力边界清楚     |
| 无订单         | `/settings/subscription?state=empty`    | 套餐仍正常显示                 |
| 删除阻塞       | `/settings/data-privacy?state=limited`  | 运行中的数据任务和处理动作清楚 |
