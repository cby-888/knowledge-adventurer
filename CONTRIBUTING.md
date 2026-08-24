# 贡献指南

感谢你对 Knowledge Adventurer 的关注与贡献！无论修复 Bug、改进文档还是新增功能，我们都非常欢迎。

## 如何贡献

1. **Fork 本仓库** 并克隆到本地。
2. 基于 `main` 分支创建特性分支：`git checkout -b feat/your-feature`。
3. 参考 [README.md](./README.md) 完成本地环境搭建。
4. 编写或修改代码，并补充必要的测试。
5. 运行测试与类型检查：
   ```bash
   pnpm test
   pnpm typecheck
   ```
6. 提交改动并推送，发起 Pull Request。

## 提交规范

- 提交信息使用清晰的中文或英文描述，建议格式：`feat: 添加 xxx` / `fix: 修复 xxx` / `docs: 更新 xxx`。
- 一个 PR 尽量只做一件事。

## 代码风格

- 使用 TypeScript，开启 `strict`。
- 组件使用函数式组件 + Tailwind CSS。
- 业务逻辑放在 `server/`，AI 调用统一放在 `services/deepseek/`，不要散落在页面组件中。
- 纯游戏数值逻辑放在 `lib/game/` 并配套单元测试。

## 安全要求

- 绝不在前端暴露 API Key。
- 所有外部输入必须用 Zod 校验。
- 奖励（XP/Gold/Level）必须通过 `server/rewards.ts` 服务端重算。
- AI 返回内容当作数据处理，前端纯文本渲染。

## 报告问题

提交 Issue 时请提供：运行环境、复现步骤、期望行为与截图（如适用）。

再次感谢你的贡献！🎉
