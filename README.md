# DOCX Editor

[![MIT License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

A WYSIWYG .docx editor for SiYuan Note — open, edit, and save Word attachments directly in the browser.

Built on [@eigenpal/docx-editor-react](https://github.com/eigenpal/docx-editor-react) (MIT licensed).

## Features

- **Click to open**: Click any .docx attachment link to open it in the built-in editor
- **Multiple open methods**: Command palette → "Open DOCX Editor", supporting:
  - New blank document
  - Browse and open local .docx files
  - Load from asset path (`assets/xxx.docx`)
- **Two editing modes**: Editing (direct edit) and Track Changes (suggesting/revision mode)
- **Save back**: Save edited documents directly to SiYuan's `data/assets/` directory
- **Download**: Export as .docx file
- **WYSIWYG**: Full rich-text editing experience (formatting, tables, images, etc.)

## Usage

### Opening a .docx file

1. **Direct click** (default): Click any .docx attachment link in SiYuan to open it in the DOCX Editor
2. **Command palette**: Search for "Open DOCX Editor" in the command palette, then choose:
   - Create a new blank document
   - Select a local .docx file from your computer
   - Enter an asset path (e.g., `assets/2024/example.docx`)

### Editing

Use the toolbar's mode switch to toggle between:
- **Editing mode** (green) — Directly modify document content
- **Track Changes** (orange) — Changes are shown as tracked revisions

### Saving

- **Save** — Save the edited document back to SiYuan's `data/assets/` directory (same path)
- **Download** — Download the document to your local computer

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Enable Click Override | On | When enabled, clicking .docx attachments opens them in the DOCX Editor. Disable to restore SiYuan's default download behavior. |

## Build

```bash
cd siyuan-docx-editor
npm install
npm run build
```

Output: `index.js` (CJS webpack bundle) + `package.zip` (marketplace release artifact).

## Dependencies

| Package | License | Purpose |
|---------|---------|---------|
| [@eigenpal/docx-editor-react](https://github.com/eigenpal/docx-editor-react) | MIT | WYSIWYG .docx editor |
| react / react-dom | MIT | UI rendering |
| prosemirror-* | MIT | Rich text editing engine |
| webpack / babel | MIT | Build tooling |

## Changelog

### v0.2.0

- Redesigned toolbar and status bar with better aesthetics
- Card-based file picker dialog with icons
- Added SVG icons for toolbar actions
- Fixed settings panel layout (toggle now on the right)
- Improved dialog content area sizing
- Custom settings dialog (gear button)
- Click override enabled by default, no manual setup needed

### v0.1.0

- Initial release
- Basic .docx open, edit, save, download
- Click override for .docx attachments
- Webpack CJS build

## License

MIT © [Raing5Days](https://github.com/Raing5Days)
