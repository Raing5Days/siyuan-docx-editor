# siyuan-docx-editor — DOCX 编辑器插件

## 简介

在思源笔记中直接打开和编辑 .docx 附件，使用 @eigenpal/docx-editor-react 提供所见即所得的编辑体验。

## 功能

- **点击打开**：点击 .docx 附件自动用内置编辑器打开（可配置）
- **命令面板**：通过命令面板打开编辑器，支持新建空白文档、浏览本地文件、从资源目录加载
- **编辑模式**：支持 Editing（编辑）和 Suggesting（修订追踪）两种模式
- **保存回写**：编辑后保存回思源的 assets 目录
- **下载导出**：导出为 .docx 文件

## 架构

```
siyuan-docx-editor/
├── src/
│   ├── index.js              # 主入口 — Plugin 类 + 生命周期 + 点击拦截
│   ├── DocxEditorDialog.jsx  # React 编辑器组件
│   └── api.js                # SiYuan API 封装
├── i18n/
│   ├── zh_CN.json
│   └── en_US.json
├── plugin.json               # 插件元数据
├── package.json              # npm 依赖
├── webpack.config.cjs.js     # Webpack CJS 构建配置
├── build.js                  # 构建脚本
├── index.css                 # 插件样式
├── index.js                  # 构建产物（CJS webpack → module.exports）
├── icon.png                  # 插件图标
├── README.md                 # 英文文档
├── README_zh_CN.md           # 中文文档
└── AGENTS.md                 # AI 参考文件
```

## 构建

```bash
cd siyuan-docx-editor
npm install
npm run build    # → 输出 index.js
```

构建产出 `index.js` 供思源加载。**不需要**后处理，直接 CJS webpack 输出即可。

## 发布到集市

### 首次提交

1. Fork [siyuan-note/bazaar](https://github.com/siyuan-note/bazaar)
2. 修改 `plugins.txt`，添加一行：`Raing5Days/siyuan-docx-editor`
3. 提交 PR 到 bazaar 的 `main` 分支
4. PR Check 工作流自动检查（release、必要文件、元数据字段等）
5. 维护者审核并合并
6. 数分钟内集市索引自动更新（需重启思源刷新缓存）

### 后续更新

无需再提交 PR。只需：
1. 更新 `plugin.json` 中的 `version` 字段（遵循 semver）
2. 执行 `npm run build`
3. 在 GitHub 上创建新 Release，tag 为版本号
4. 上传 `package.zip`（构建产物压缩包）作为附件
5. 发布 Release
6. 集市每 1-3 小时自动拉取更新

检查部署状态：<https://github.com/siyuan-note/bazaar/actions/workflows/stage.yml>

## 关键技术

### Webpack CJS 构建（已验证）

SiYuan 插件加载器使用 `eval()` + 普通脚本上下文执行 `index.js`。**不支持 `export default`**（SyntaxError），但支持 `module.exports`。

```javascript
// webpack.config.cjs.js — 关键配置
module.exports = {
    output: {
        filename: "index.js",
        library: { type: "commonjs2" },   // → module.exports = ClassName
    },
    externals: { siyuan: "commonjs siyuan" },  // → require("siyuan")
    optimization: { splitChunks: false, runtimeChunk: false },  // 单文件
};
```

**不要使用** `experiments.outputModule: true` —— 会导致库中的 `await import(...)` 被当作异步块，300+ 模块变成 orphan modules（产出仅 168KB vs 正常 1.9MB）。

### Plugin 类

```javascript
export default class SiYuanDocxEditor extends Plugin {
    constructor() {
        super(...arguments);  // ← 必须传 arguments，否则 Plugin 构造函数中 this.app 为 undefined
    }
}
```

- `super()` 不传参 → `TypeError: Cannot read properties of undefined (reading 'app')`
- `super(...arguments)` 正确转发所有参数

### React 挂载到 Dialog

```jsx
import { createRoot } from "react-dom/client";
import { Dialog } from "siyuan";

function openDialog(plugin) {
    const dialog = new Dialog({
        title: "标题",
        content: `<div id="root"></div>`,
        width: "92vw",
        height: "88vh",
        destroyCallback: () => root && (root.unmount(), root = null),
    });
    const root = createRoot(dialog.element.querySelector("#root"));
    root.render(<YourComponent />);
}
```

### 附件点击拦截

SiYuan 将附件渲染为 `<span data-type="a" data-href="assets/xxx.docx">`。通过全局事件委托拦截：

```javascript
function initClickOverride(plugin) {
    const handler = (event) => {
        let el = event.target;
        while (el && el !== document.body) {
            if (el.getAttribute?.("data-type") === "a" && el.getAttribute?.("data-href")) {
                const href = el.getAttribute("data-href");
                if (href.endsWith(".docx")) {
                    event.preventDefault();
                    event.stopPropagation();
                    handleDocx(href);
                    return;
                }
            }
            el = el.parentElement;
        }
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
}
```

在 `onLayoutReady()` 中激活，`onunload()` 中取消。

### 文件 API

```javascript
// 读取资源
async function getAssetFile(assetPath) {
    const url = assetPath.startsWith("/") ? assetPath : "/" + assetPath;
    const resp = await fetch(url);
    return resp.arrayBuffer();
}

// 写入 assets
async function putFile(filePath, data) {
    const form = new FormData();
    form.append("path", filePath);
    form.append("file[]", new Blob([data]));
    const resp = await fetch("/api/file/putFile", { method: "POST", body: form });
    return resp.json();
}
```

## 依赖

| 包名 | 用途 | 许可 |
|------|------|------|
| @eigenpal/docx-editor-react | 所见即所得 .docx 编辑器（WYSIWYG） | MIT |
| react / react-dom | React 18 渲染 |
| prosemirror-commands, -dropcursor, -history, -keymap, -model, -state, -tables, -transform, -view | 编辑器引擎（docx-editor 的 peerDependencies） |
| webpack / babel-loader / css-loader / style-loader | 构建工具 |
