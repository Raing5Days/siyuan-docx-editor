# DOCX 编辑器

[![MIT License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

在思源笔记中直接打开并编辑 .docx 附件，所见即所得。

基于 [@eigenpal/docx-editor-react](https://github.com/eigenpal/docx-editor-react)（MIT 许可）构建。

## 功能

- **点击打开**：点击任意 .docx 附件链接，自动在内置编辑器中打开
- **多种打开方式**：命令面板 → "打开 DOCX 编辑器"，支持：
  - 新建空白文档
  - 浏览并打开本地 .docx 文件
  - 从资源路径加载（如 `assets/xxx.docx`）
- **两种编辑模式**：编辑模式（直接修改）和修订追踪（以修订标记显示）
- **保存回写**：编辑后直接保存回思源的 `data/assets/` 目录
- **下载导出**：导出为 .docx 文件
- **所见即所得**：完整的富文本编辑体验（格式、表格、图片等）

## 使用方法

### 打开 .docx 文件

1. **直接点击**（默认）：在思源笔记中点击任意 .docx 附件链接，自动在 DOCX 编辑器中打开
2. **命令面板**：搜索"打开 DOCX 编辑器"，然后选择：
   - 新建空白文档
   - 从计算机选择本地 .docx 文件
   - 输入资源路径（如 `assets/2024/example.docx`）

### 编辑

使用工具栏的模式开关切换：
- **编辑模式**（绿色指示）— 直接修改文档内容
- **修订模式**（橙色指示）— 修改将以修订标记显示

### 保存

- **保存** — 将编辑后的文档保存回思源的 `data/assets/` 目录（同一路径）
- **下载** — 将文档下载到本地计算机

## 设置

| 设置项 | 默认 | 说明 |
|--------|------|------|
| 启用点击覆盖 | 开启 | 启用后，点击 .docx 附件自动用 DOCX 编辑器打开。关闭后恢复思源默认行为。 |

## 构建

```bash
cd siyuan-docx-editor
npm install
npm run build
```

输出：`index.js`（CJS webpack 构建产物）+ `package.zip`（集市发布包）。

## 依赖

| 包名 | 许可 | 用途 |
|------|------|------|
| [@eigenpal/docx-editor-react](https://github.com/eigenpal/docx-editor-react) | MIT | 所见即所得 .docx 编辑器 |
| react / react-dom | MIT | UI 渲染 |
| prosemirror-* | MIT | 富文本编辑引擎 |
| webpack / babel | MIT | 构建工具 |

## 更新日志

### v0.2.0

- 重新设计工具栏和状态栏样式
- 卡片式文件选择对话框，带图标
- 工具栏操作添加 SVG 图标
- 修复设置面板布局（开关现在在右侧）
- 改进对话框内容区域尺寸
- 自定义设置对话框（齿轮按钮）
- 点击覆盖默认启用，无需手动配置

### v0.1.0

- 初始版本
- 基本 .docx 打开、编辑、保存、下载
- .docx 附件点击拦截
- Webpack CJS 构建

## 许可

MIT © [Raing5Days](https://github.com/Raing5Days)
