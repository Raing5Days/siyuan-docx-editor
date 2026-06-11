/**
 * siyuan-docx-editor — Open .docx attachments in SiYuan with WYSIWYG editor
 *
 * Uses @eigenpal/docx-editor-react to provide a browser-based Word editor.
 */

import { createRoot } from "react-dom/client";
import DocxEditorDialog from "./DocxEditorDialog";
import { getAssetFile, putFile, showMessage } from "./api";

// Import plugin styles (bundled by webpack)
import "../index.css";

import { Plugin, Dialog, Setting } from "siyuan";

const PLUGIN_NAME = "siyuan-docx-editor";
const DATA_KEY = "config";

/**
 * Open the DOCX editor in a SiYuan dialog
 * @param {object} plugin - Plugin instance
 * @param {ArrayBuffer|null} buffer - Initial .docx content (null = empty doc)
 * @param {string} [fileName] - Current file name
 * @param {string} [filePath] - Asset path for saving back
 */
function openEditorDialog(plugin, buffer, fileName, filePath) {
    // Clean up any existing dialog
    if (plugin._editorDialog) {
        try { plugin._editorDialog.destroy(); } catch (e) { /* ignore */ }
        plugin._editorDialog = null;
    }

    const dialog = new Dialog({
        title: fileName || plugin.i18n.docxEditor || "DOCX Editor",
        content: `<div id="${PLUGIN_NAME}-container" class="siyuan-docx-editor__container"></div>`,
        width: "92vw",
        height: "88vh",
        destroyCallback: () => {
            // Cleanup React root
            if (plugin._editorRoot) {
                plugin._editorRoot.unmount();
                plugin._editorRoot = null;
            }
            plugin._editorDialog = null;
        },
    });

    // Force dialog layout to flex column so content fills all space
    const dialogElement = dialog.element;
    if (dialogElement) {
        dialogElement.style.display = "flex";
        dialogElement.style.flexDirection = "column";
    }
    const dialogContent = dialogElement?.querySelector(".b3-dialog__content");
    if (dialogContent) {
        dialogContent.style.padding = "0";
        dialogContent.style.overflow = "hidden";
        dialogContent.style.flex = "1";
        dialogContent.style.display = "flex";
        dialogContent.style.flexDirection = "column";
        dialogContent.style.background = "var(--b3-theme-background)";
    }

    plugin._editorDialog = dialog;
    const container = dialog.element.querySelector(`#${PLUGIN_NAME}-container`);
    if (!container) return;

    // Mount React component
    const root = createRoot(container);
    plugin._editorRoot = root;

    root.render(
        <DocxEditorDialog
            initialBuffer={buffer}
            fileName={fileName}
            filePath={filePath}
            i18n={plugin.i18n}
            onSave={async (savedBuffer, name) => {
                if (!filePath) {
                    // No original path - download instead
                    showMessage(plugin.i18n.saveAs || "Saving as...");
                    return;
                }
                try {
                    // Ensure the path is under data/assets/
                    const savePath = filePath.startsWith("/data/")
                        ? filePath
                        : filePath.startsWith("assets/")
                            ? "/data/" + filePath
                            : "/data/assets/" + filePath;
                    await putFile(savePath, savedBuffer);
                    showMessage(plugin.i18n.saveSuccess || "Saved successfully");
                } catch (err) {
                    console.error("Save error:", err);
                    showMessage(plugin.i18n.saveError || "Save failed");
                }
            }}
            onClose={() => {
                dialog.destroy();
            }}
        />
    );
}

/**
 * Extract .docx path info from a SiYuan DOM element
 * SiYuan renders attachments as: <span ... data-href="assets/xxx.docx" data-type="a">
 */
function getDocxInfoFromElement(el) {
    const href = el.getAttribute?.("data-href") || "";
    if (!href.toLowerCase().endsWith(".docx")) return null;
    return {
        href,
        fileName: href.split("/").pop(),
    };
}

/**
 * Find all .docx attachment links in the editor and add click interceptors
 */
function initClickOverride(plugin) {
    // Use a delegated listener on the document body
    // SiYuan attachment spans have: data-type="a" and data-href ending in .docx
    const handler = (event) => {
        // Walk up to find the attachment element
        let target = event.target;
        while (target && target !== document.body) {
            if (
                target.getAttribute?.("data-type") === "a" &&
                target.getAttribute?.("data-href")
            ) {
                const info = getDocxInfoFromElement(target);
                if (info) {
                    event.preventDefault();
                    event.stopPropagation();
                    openDocxAsset(plugin, info.href);
                    return;
                }
            }
            target = target.parentElement;
        }
    };

    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
}

/**
 * Open a .docx asset by its href path
 */
async function openDocxAsset(plugin, href) {
    const fileName = href.split("/").pop();
    showMessage(`Loading ${fileName}...`);

    try {
        const buffer = await getAssetFile(href);
        openEditorDialog(plugin, buffer, fileName, href);
    } catch (err) {
        console.error("Load error:", err);
        showMessage(`Failed to load: ${fileName}`);
    }
}

/**
 * Open the editor with a file picker or path input
 */
function openEditorWithPicker(plugin) {
    const pickerDialog = new Dialog({
        title: plugin.i18n.openDocxTitle || "Open .docx File",
        content: `
            <div class="siyuan-docx-editor__picker">

                <!-- New Document card -->
                <div class="siyuan-docx-editor__picker-card" id="docx-new-blank-card" tabindex="0" role="button">
                    <div class="siyuan-docx-editor__picker-card-icon">
                        <svg viewBox="0 0 32 32">
                            <path d="M28 6H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h24c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 18H4V8h24v16zM16 10l-4 6h3v6h2v-6h3l-4-6z"/>
                        </svg>
                    </div>
                    <div class="siyuan-docx-editor__picker-card-content">
                        <div class="siyuan-docx-editor__picker-card-title">${plugin.i18n.emptyDoc || "New Blank Document"}</div>
                        <div class="siyuan-docx-editor__picker-card-desc">${plugin.i18n.emptyDocDesc || "Create a new empty .docx document"}</div>
                    </div>
                </div>

                <!-- Browse File card -->
                <div class="siyuan-docx-editor__picker-card" id="docx-browse-card" tabindex="0" role="button">
                    <div class="siyuan-docx-editor__picker-card-icon">
                        <svg viewBox="0 0 32 32">
                            <path d="M26 4H6C4.9 4 4 4.9 4 6v20c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 22H6V6h20v20zM12 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm4-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                    </div>
                    <div class="siyuan-docx-editor__picker-card-content">
                        <div class="siyuan-docx-editor__picker-card-title">${plugin.i18n.selectDocx || "Browse Local File"}</div>
                        <div class="siyuan-docx-editor__picker-card-desc">${plugin.i18n.selectDocxDesc || "Select a .docx file from your computer"}</div>
                    </div>
                </div>
                <input type="file" accept=".docx" id="docx-file-input" class="fn__none" />

                <div class="siyuan-docx-editor__picker-divider"></div>

                <!-- Asset path input -->
                <div class="siyuan-docx-editor__picker-section">
                    <label>${plugin.i18n.browseAssets || "Asset Path"}</label>
                    <input class="b3-text-field" id="docx-asset-path" placeholder="${plugin.i18n.openDocxPlaceholder || "assets/2024/example.docx"}" />
                    <button class="b3-button b3-button--outline" id="docx-load-asset-btn" style="margin-top: 8px;">
                        ${plugin.i18n.loadFromAssets || "Open from Assets"}
                    </button>
                </div>
            </div>
        `,
        width: "520px",
    });

    const container = pickerDialog.element;

    // New blank document
    const newBlankCard = container.querySelector("#docx-new-blank-card");
    if (newBlankCard) {
        newBlankCard.addEventListener("click", () => {
            pickerDialog.destroy();
            openEditorDialog(plugin, null, "Untitled.docx", null);
        });
        newBlankCard.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                newBlankCard.click();
            }
        });
    }

    // Browse local file
    const browseCard = container.querySelector("#docx-browse-card");
    const fileInput = container.querySelector("#docx-file-input");
    if (browseCard) {
        browseCard.addEventListener("click", () => {
            fileInput?.click();
        });
        browseCard.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                browseCard.click();
            }
        });
    }
    fileInput?.addEventListener("change", async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        pickerDialog.destroy();
        try {
            const buffer = await file.arrayBuffer();
            openEditorDialog(plugin, buffer, file.name, null);
        } catch (err) {
            console.error("File read error:", err);
            showMessage("Failed to read file");
        }
    });

    // Load from asset path
    const assetPathInput = container.querySelector("#docx-asset-path");
    const loadAssetBtn = container.querySelector("#docx-load-asset-btn");
    if (loadAssetBtn) {
        loadAssetBtn.addEventListener("click", () => {
            const path = assetPathInput?.value?.trim();
            if (!path) return;
            pickerDialog.destroy();
            openDocxAsset(plugin, path);
        });
    }
    if (assetPathInput) {
        assetPathInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                loadAssetBtn?.click();
            }
        });
    }
}

/**
 * Main Plugin Class
 */
export default class SiYuanDocxEditor extends Plugin {
    constructor() {
        super(...arguments);
        this._cleanupClickOverride = null;
        this._editorDialog = null;
        this._editorRoot = null;
        this.config = { enableClickOverride: true };
    }

    onload() {
        console.log(this.i18n.helloPlugin);

        // Load config, then apply click override immediately
        this.loadData(DATA_KEY).then((data) => {
            this.config = Object.assign({ enableClickOverride: true }, data);
            this._updateClickOverride();
        }).catch(() => {
            this.config = { enableClickOverride: true };
            this._updateClickOverride();
        });

        // Register command: Open DOCX Editor
        this.addCommand({
            langKey: "cmdOpenDocx",
            hotkey: "",
            callback: () => {
                openEditorWithPicker(this);
            },
        });

        // Save config helper
        this._saveConfig = () => {
            this.saveData(DATA_KEY, this.config).catch((err) => {
                console.error("Save config failed:", err);
            });
        };
    }

    onLayoutReady() {
        this._updateClickOverride();
    }

    onunload() {
        console.log(this.i18n.byePlugin);

        // Cleanup click override
        if (this._cleanupClickOverride) {
            this._cleanupClickOverride();
            this._cleanupClickOverride = null;
        }

        // Cleanup dialog
        if (this._editorDialog) {
            try { this._editorDialog.destroy(); } catch (e) { /* ignore */ }
            this._editorDialog = null;
        }
        if (this._editorRoot) {
            try { this._editorRoot.unmount(); } catch (e) { /* ignore */ }
            this._editorRoot = null;
        }
    }

    /**
     * Custom settings dialog opened via the gear button.
     * Provides proper row layout: title left, toggle right.
     */
    openSetting() {
        const { Dialog } = require("siyuan");
        const plugin = this;

        const dialog = new Dialog({
            title: this.i18n.settings || "Settings",
            content: `
                <div class="b3-setting-item" style="display:flex; flex-direction:row; align-items:center; justify-content:space-between; padding:12px 16px;">
                    <div style="flex:1; min-width:0;">
                        <div class="b3-setting-item__title">${this.i18n.enableClickOverride || "Enable Click Override"}</div>
                        ${this.i18n.enableClickOverrideDesc ? `<div class="b3-setting-item__desc">${this.i18n.enableClickOverrideDesc}</div>` : ""}
                    </div>
                    <div style="flex-shrink:0; padding-left:16px; display:flex; align-items:center;">
                        <input type="checkbox" class="b3-switch" id="docx-setting-toggle"
                            ${this.config.enableClickOverride ? "checked" : ""} />
                    </div>
                </div>
            `,
            width: "520px",
        });

        const toggle = dialog.element.querySelector("#docx-setting-toggle");
        if (toggle) {
            toggle.addEventListener("change", () => {
                this.config.enableClickOverride = toggle.checked;
                this._saveConfig();
                this._updateClickOverride();
            });
        }
    }

    _updateClickOverride() {
        // Cleanup existing
        if (this._cleanupClickOverride) {
            this._cleanupClickOverride();
            this._cleanupClickOverride = null;
        }

        if (this.config.enableClickOverride) {
            this._cleanupClickOverride = initClickOverride(this);
        }
    }
}
