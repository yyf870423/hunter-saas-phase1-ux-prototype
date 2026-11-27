# 候选人职业概览操作对齐

用户反馈GitHub原型候选人详情的“重新生成”按钮应靠右。原FieldGroup header使用space-between，而两个按钮以Fragment直接传入，导致标题、重新生成、编辑被分成三个布局项。

本次仅把该处action的Fragment替换为既有`.s4-field-actions`操作组，两个按钮在标题右侧相邻排列，复用6px间距。不改公共FieldGroup/CSS、不改变顺序、文案、图标、尺寸或点击行为，不改AROS1420、后端、SDK或官网。

1440/871/390px三项Playwright检查通过：按钮组贴齐右内边距、两按钮间隔6px且在同一行；重新生成的原提示及编辑弹窗仍有效，无页面横向溢出、脚本异常或网络写入。已对照修改前后截图及源码，布局扫描无新增发现。

本次为已验收原型的局部位置修正，沿用GitHub原型main发布流程，Pages结果以对应提交的Actions与公网复验为准。

入口：<https://yyf870423.github.io/hunter-saas-phase1-ux-prototype/#/candidates/candidate-linhao>。
