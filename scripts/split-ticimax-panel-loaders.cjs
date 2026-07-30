/**
 * Split huge Dinamik Script pastes into GitHub-hosted CSS/JS + tiny loaders
 * so Ticimax panel does not crash on Save.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const finalDir = path.join(root, "public", "ticimax", "final");
const runtimeDir = path.join(root, "public", "ticimax", "runtime");
const backupDir = path.join(root, "public", "ticimax", "final-full");

fs.mkdirSync(runtimeDir, { recursive: true });
fs.mkdirSync(backupDir, { recursive: true });

const BASE = "https://r0yc0ld.github.io/aromatherapica-web/ticimax/runtime";

function split(file, cssName, jsName) {
  const srcPath = path.join(finalDir, file);
  const raw = fs.readFileSync(srcPath, "utf8");
  // Keep a full backup once
  const backupPath = path.join(backupDir, file);
  if (!fs.existsSync(backupPath) || fs.statSync(backupPath).size < raw.length) {
    fs.writeFileSync(backupPath, raw);
  }

  const style = raw.match(/<style>([\s\S]*?)<\/style>/i);
  const script = raw.match(/<script>([\s\S]*?)<\/script>/i);
  if (!style && !script) {
    console.log("skip (already tiny?):", file, raw.length);
    return raw.length;
  }

  if (style) fs.writeFileSync(path.join(runtimeDir, cssName), style[1].trim() + "\n");
  if (script) fs.writeFileSync(path.join(runtimeDir, jsName), script[1].trim() + "\n");

  const paste =
    `<!-- Aromatherapica exact — hafif yükleyici (panel çökmesin) -->\n` +
    (cssName ? `<link rel="stylesheet" href="${BASE}/${cssName}">\n` : "") +
    (jsName ? `<script src="${BASE}/${jsName}" defer></script>\n` : "");

  fs.writeFileSync(srcPath, paste);
  console.log(file, "-> paste", paste.length, "chars; css", style ? style[1].length : 0, "js", script ? script[1].length : 0);
  return paste.length;
}

split("01-tum-sayfalar.txt", "ar-global.css", "ar-global.js");
split("02-anasayfa.txt", "ar-home.css", "ar-home.js");

// Header stays inline (small) but ensure anti-redirect is present
const header = fs.readFileSync(path.join(finalDir, "10-tum-sayfalar-header.txt"), "utf8");
console.log("header chars", header.length);

const sums = fs
  .readdirSync(finalDir)
  .filter((n) => n !== "SHA256SUMS.txt")
  .sort()
  .map((name) => {
    const hash = require("crypto")
      .createHash("sha256")
      .update(fs.readFileSync(path.join(finalDir, name)))
      .digest("hex");
    return `${hash}  ${name}`;
  });
fs.writeFileSync(path.join(finalDir, "SHA256SUMS.txt"), sums.join("\r\n") + "\r\n");

console.log("runtime:", fs.readdirSync(runtimeDir));
