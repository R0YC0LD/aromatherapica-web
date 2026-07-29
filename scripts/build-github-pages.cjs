/**
 * Prepares a GitHub Pages–compatible static export.
 * API routes and middleware are temporarily moved aside because
 * `output: 'export'` cannot include them.
 */
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const root = process.cwd();
const apiDir = path.join(root, "src", "app", "api");
const apiBak = path.join(root, ".export-bak", "api");
const mw = path.join(root, "src", "middleware.ts");
const mwBak = path.join(root, ".export-bak", "middleware.ts");
const bakRoot = path.join(root, ".export-bak");

function rimraf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function restore() {
  if (fs.existsSync(apiBak)) {
    if (fs.existsSync(apiDir)) rimraf(apiDir);
    fs.renameSync(apiBak, apiDir);
  }
  if (fs.existsSync(mwBak)) {
    if (fs.existsSync(mw)) fs.unlinkSync(mw);
    fs.renameSync(mwBak, mw);
  }
}

function prepare() {
  ensureDir(bakRoot);
  if (fs.existsSync(apiDir) && !fs.existsSync(apiBak)) {
    fs.renameSync(apiDir, apiBak);
  }
  if (fs.existsSync(mw) && !fs.existsSync(mwBak)) {
    fs.renameSync(mw, mwBak);
  }
}

function finalizeOut() {
  const outDir = path.join(root, "out");
  if (!fs.existsSync(outDir)) {
    throw new Error("out/ klasörü oluşmadı");
  }

  // GitHub Pages: disable Jekyll so _next/ is served
  fs.writeFileSync(path.join(outDir, ".nojekyll"), "");

  // SPA-ish fallback: unknown paths → 404.html (Next already emits 404.html)
  const notFound = path.join(outDir, "404.html");
  if (!fs.existsSync(notFound)) {
    const alt = path.join(outDir, "404", "index.html");
    if (fs.existsSync(alt)) {
      fs.copyFileSync(alt, notFound);
    }
  }

  // Ensure root index.html exists
  const index = path.join(outDir, "index.html");
  if (!fs.existsSync(index)) {
    throw new Error("out/index.html yok — GitHub Pages açılış sayfasını bulamaz");
  }

  console.log("Static export ready:", outDir);
  console.log("Root index:", fs.existsSync(index));
  console.log("404.html:", fs.existsSync(notFound));
  console.log(".nojekyll:", fs.existsSync(path.join(outDir, ".nojekyll")));
}

try {
  prepare();
  execSync("npx next build", {
    stdio: "inherit",
    env: {
      ...process.env,
      GITHUB_PAGES: "true",
      STATIC_EXPORT: "true",
      NEXT_PUBLIC_STATIC_EXPORT: "true",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  });
  finalizeOut();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  restore();
}
