/**
 * API utilities for SiYuan file operations
 */
import { fetchPost, showMessage as siyuanShowMessage } from "siyuan";

const BASE_URL = window.location.origin;

/**
 * Fetch a file from SiYuan's data/assets directory
 * @param {string} filePath - Path relative to data/assets/ (e.g., "2024/abc.docx")
 * @returns {Promise<ArrayBuffer>} File content as ArrayBuffer
 */
export async function getFile(filePath) {
    const resp = await fetch("/api/file/getFile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: filePath }),
    });
    if (!resp.ok) throw new Error(`Failed to fetch file: ${resp.status}`);
    return resp.arrayBuffer();
}

/**
 * Save a file to SiYuan's data/assets directory
 * @param {string} filePath - Destination path relative to data/
 * @param {ArrayBuffer|Blob} data - File content
 * @param {boolean} [isDir=false] - Whether to create directories
 * @returns {Promise<object>} Response with file info
 */
export async function putFile(filePath, data, isDir = false) {
    const formData = new FormData();
    formData.append("path", filePath);
    formData.append("isDir", isDir ? "true" : "false");
    formData.append("file[]", new Blob([data], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }), filePath.split("/").pop());

    const resp = await fetch("/api/file/putFile", {
        method: "POST",
        body: formData,
    });
    if (!resp.ok) throw new Error(`Failed to save file: ${resp.status}`);
    return resp.json();
}

/**
 * Upload a file to SiYuan's data/assets directory
 * @param {File|Blob} file - File to upload
 * @param {string} destPath - Destination path
 * @returns {Promise<object>}
 */
export function uploadFile(file, destPath) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("assetsDirPath", "/data/assets/");
        formData.append("file", file, destPath.split("/").pop());
        fetchPost("/api/asset/upload", formData, (resp) => {
            if (resp && resp.code === 0) resolve(resp);
            else reject(new Error(resp?.msg || "Upload failed"));
        });
    });
}

/**
 * List files in a directory via SiYuan API
 * @param {string} path - Directory path relative to data/
 * @returns {Promise<string[]>} List of file names
 */
export async function listFiles(path) {
    const resp = await fetch("/api/file/readDir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
    });
    const data = await resp.json();
    if (data.code !== 0) throw new Error(data.msg || "List failed");
    return data.data || [];
}

/**
 * Show a toast notification
 */
export function showMessage(msg) {
    siyuanShowMessage(msg);
}

/**
 * Fetch an asset file by its URL path (e.g., "/assets/2024/abc.docx")
 * @param {string} assetPath - URL path starting with /assets/
 * @returns {Promise<ArrayBuffer>}
 */
export async function getAssetFile(assetPath) {
    // Ensure path starts with /
    const url = assetPath.startsWith("/") ? assetPath : "/" + assetPath;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to fetch asset: ${resp.status}`);
    return resp.arrayBuffer();
}
