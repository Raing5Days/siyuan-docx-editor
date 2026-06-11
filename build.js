#!/usr/bin/env node
const { execSync } = require("child_process");
const { existsSync, rmSync, createWriteStream, readFileSync, statSync } = require("fs");
const path = require("path");

console.log("Building webpack bundle...");
execSync("npx webpack --mode production --config webpack.config.cjs.js", {
    cwd: __dirname, stdio: "inherit",
});

console.log("Creating package.zip for marketplace release...");

const files = [
    "plugin.json",
    "index.js",
    "index.css",
    "icon.png",
    "preview.png",
    "README.md",
    "README_zh_CN.md",
    "LICENSE",
    "i18n/en_US.json",
    "i18n/zh_CN.json",
];

// Clean up previous package
if (existsSync("package.zip")) rmSync("package.zip");

// Use native ZIP if available, otherwise use Node.js archiver fallback
// Try PowerShell's Compress-Archive on Windows first
const isWin = process.platform === "win32";
try {
    if (isWin) {
        // PowerShell Compress-Archive approach
        const fileList = files.map(f => `'${path.resolve(f).replace(/'/g, "''")}'`).join(", ");
        execSync(
            `powershell -Command "Compress-Archive -Path ${fileList} -DestinationPath '${path.resolve("package.zip")}' -Force"`,
            { cwd: __dirname, stdio: "inherit" }
        );
    } else {
        execSync(`zip -j package.zip ${files.join(" ")}`, { cwd: __dirname, stdio: "inherit" });
    }
    console.log("Done! package.zip created.");
} catch (e) {
    console.error("Warning: Could not create package.zip automatically.");
    console.error("Manually zip the following files into package.zip (flat, no outer directory):");
    files.forEach(f => console.error(`  ${f}`));
    process.exit(1);
}
