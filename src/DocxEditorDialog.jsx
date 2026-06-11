import { useState, useRef, useEffect, useCallback } from "react";
import { DocxEditor } from "@eigenpal/docx-editor-react";
import "@eigenpal/docx-editor-react/styles.css";

/**
 * DOCX Editor dialog component
 * Wraps @eigenpal/docx-editor-react with SiYuan integration
 */

// -- SVG icon components (inline, matching SiYuan style) --

function IconDownload() {
    return (
        <svg viewBox="0 0 32 32">
            <path d="M26 22v4H6v-4H4v6h24v-6zM16 2l-8 8h5v10h6V10h5z" />
        </svg>
    );
}

function IconSave() {
    return (
        <svg viewBox="0 0 32 32">
            <path d="M24 4H6C4.9 4 4 4.9 4 6v20c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V8l-4-4zm-2 22H10v-8h12v8zm0-12H10V6h12v8z" />
        </svg>
    );
}

function IconClose() {
    return (
        <svg viewBox="0 0 32 32">
            <path d="M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4l6.6 6.6L8 22.6 9.4 24l6.6-6.6 6.6 6.6 1.4-1.4-6.6-6.6z" />
        </svg>
    );
}

function IconEdit() {
    return (
        <svg viewBox="0 0 32 32">
            <path d="M25.6 10.2l-3.8-3.8c-.5-.5-1.3-.5-1.8 0L6.2 20.2 4 26l5.8-2.2 13.8-13.8c.5-.5.5-1.3 0-1.8zM8.8 22.4l-.8.6.6-.8 12.6-12.6.8.8-13.2 12z" />
        </svg>
    );
}

function IconTrackChanges() {
    return (
        <svg viewBox="0 0 32 32">
            <path d="M22 6h-2V4h-8v2h-2v2h12V6zm-6 10c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm-6-8v2h12V8H10z" />
            <path d="M16 20c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
    );
}

function IconFile() {
    return (
        <svg viewBox="0 0 32 32">
            <path d="M22 2H8C6.9 2 6 2.9 6 4v24c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8l-4-4zm2 26H8V4h10v6h6v18z" />
        </svg>
    );
}

export default function DocxEditorDialog({
    initialBuffer,    // ArrayBuffer | null - initial .docx content
    fileName,          // string - current file name
    filePath,          // string - asset path for saving back
    onSave,            // (buffer: ArrayBuffer, fileName: string) => Promise<void>
    onDownload,        // (buffer: ArrayBuffer, fileName: string) => void
    onClose,           // () => void
    i18n,              // object - localized strings
}) {
    const editorRef = useRef(null);
    const [buffer, setBuffer] = useState(initialBuffer);
    const [mode, setMode] = useState("editing");
    const [isSaving, setIsSaving] = useState(false);
    const [title, setTitle] = useState(fileName || "Untitled.docx");

    const t = i18n || {}; // shorthand

    const handleSave = useCallback(async () => {
        if (!editorRef.current) return;
        setIsSaving(true);
        try {
            const savedBuffer = await editorRef.current.save();
            if (onSave) {
                await onSave(savedBuffer, title);
            }
        } catch (err) {
            console.error("Save failed:", err);
        } finally {
            setIsSaving(false);
        }
    }, [onSave, title]);

    const handleDownload = useCallback(async () => {
        if (!editorRef.current) return;
        const savedBuffer = await editorRef.current.save();
        const blob = new Blob([savedBuffer], {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = title.endsWith(".docx") ? title : title + ".docx";
        a.click();
        URL.revokeObjectURL(url);
    }, [title]);

    return (
        <div className="siyuan-docx-editor__root">
            {/* Toolbar */}
            <div className="siyuan-docx-editor__toolbar">
                <div className="siyuan-docx-editor__toolbar-left">
                    <input
                        className="siyuan-docx-editor__filename b3-text-field"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="File name"
                    />
                </div>

                <div className="siyuan-docx-editor__toolbar-right">
                    {/* Mode switch */}
                    <div className="siyuan-docx-editor__mode-switch">
                        <button
                            className={mode === "editing" ? "b3-button--outline" : ""}
                            onClick={() => setMode("editing")}
                            title={t.editing || "Editing"}
                        >
                            <span className="siyuan-docx-editor__mode-indicator siyuan-docx-editor__mode-indicator--editing" />
                            {t.editing || "Editing"}
                        </button>
                        <button
                            className={mode === "suggesting" ? "b3-button--outline" : ""}
                            onClick={() => setMode("suggesting")}
                            title={t.suggesting || "Track Changes"}
                        >
                            <span className="siyuan-docx-editor__mode-indicator siyuan-docx-editor__mode-indicator--suggesting" />
                            {t.suggesting || "Track Changes"}
                        </button>
                    </div>

                    <div className="siyuan-docx-editor__toolbar-separator" />

                    {/* Download */}
                    <button
                        className="b3-button siyuan-docx-editor__btn-icon"
                        onClick={handleDownload}
                        title={t.download || "Download as .docx"}
                    >
                        <IconDownload />
                    </button>

                    {/* Save */}
                    {onSave && (
                        <button
                            className="b3-button"
                            onClick={handleSave}
                            disabled={isSaving}
                            title={t.save || "Save"}
                        >
                            <IconSave />
                            {isSaving
                                ? (t.saving || "Saving...")
                                : (t.save || "Save")}
                        </button>
                    )}

                    <div className="siyuan-docx-editor__toolbar-separator" />

                    {/* Close */}
                    <button
                        className="b3-button b3-button--cancel"
                        onClick={onClose}
                        title={t.close || "Close"}
                    >
                        <IconClose />
                        {t.close || "Close"}
                    </button>
                </div>
            </div>

            {/* Editor */}
            <div className="siyuan-docx-editor__editor">
                {buffer === undefined ? (
                    <div className="siyuan-docx-editor__loading">
                        <div className="siyuan-docx-editor__loading-spinner" />
                        <span>{t.loading || "Loading document..."}</span>
                    </div>
                ) : (
                    <DocxEditor
                        ref={editorRef}
                        documentBuffer={buffer}
                        mode={mode}
                    />
                )}
            </div>

            {/* Status bar */}
            <div className="siyuan-docx-editor__statusbar">
                <div className="siyuan-docx-editor__statusbar-left">
                    <span
                        className={`siyuan-docx-editor__mode-indicator ${
                            mode === "editing"
                                ? "siyuan-docx-editor__mode-indicator--editing"
                                : "siyuan-docx-editor__mode-indicator--suggesting"
                        }`}
                    />
                    <span>
                        {mode === "editing"
                            ? (t.editing || "Editing")
                            : (t.suggesting || "Track Changes")}
                        {" mode"}
                    </span>
                </div>
                <div className="siyuan-docx-editor__statusbar-right">
                    <IconFile />
                    <span>{fileName || (t.emptyDoc || "New document")}</span>
                </div>
            </div>
        </div>
    );
}
