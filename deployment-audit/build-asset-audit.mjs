import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = path.resolve(import.meta.dirname, "..");
const publicRoot = path.join(root, "public");
const outputRoot = path.join(root, "deployment-audit");
const projects = JSON.parse(fs.readFileSync(path.join(root, "content", "projects.json"), "utf8"));
const mediaPattern = /\.(?:avif|gif|jpe?g|mp4|png|svg|webm|webp|woff2?|ttf|otf)$/i;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

function publicPath(file) {
  return `/${path.relative(publicRoot, file).replaceAll("\\", "/")}`;
}

function hashFile(file) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(file));
  return hash.digest("hex");
}

function collectStrings(value, result = new Set()) {
  if (typeof value === "string" && value.startsWith("/") && mediaPattern.test(value)) result.add(value);
  if (Array.isArray(value)) value.forEach((item) => collectStrings(item, result));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectStrings(item, result));
  return result;
}

const referenced = collectStrings(projects);
const sourceFiles = walk(path.join(root, "app")).filter((file) => /\.(?:css|js|jsx|mjs|ts|tsx)$/.test(file));
for (const file of sourceFiles) {
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(/["'`](\/[^"'`?]+\.(?:avif|gif|jpe?g|mp4|png|svg|webm|webp|woff2?|ttf|otf))["'`?]/gi)) {
    referenced.add(match[1]);
  }
}

const files = walk(publicRoot).filter((file) => mediaPattern.test(file));
const records = files.map((file) => {
  const stat = fs.statSync(file);
  return {
    path: publicPath(file),
    bytes: stat.size,
    mib: (stat.size / 1024 / 1024).toFixed(3),
    sha256: hashFile(file),
    referenced: referenced.has(publicPath(file)),
  };
});

const missing = [...referenced].filter((item) => !fs.existsSync(path.join(publicRoot, item.slice(1))));
const csv = (items) => ["path,bytes,mib,sha256", ...items.map((item) =>
  `"${item.path.replaceAll('"', '""')}",${item.bytes},${item.mib},${item.sha256}`
)].join("\n");

const used = records.filter((item) => item.referenced).sort((a, b) => a.path.localeCompare(b.path));
const unused = records.filter((item) => !item.referenced).sort((a, b) => b.bytes - a.bytes);
const duplicateGroups = Object.entries(Object.groupBy(records, (item) => item.sha256))
  .filter(([, items]) => items.length > 1)
  .sort((a, b) => b[1][0].bytes * b[1].length - a[1][0].bytes * a[1].length)
  .map(([sha256, items]) => ({ sha256, bytesEach: items[0].bytes, copies: items.length, paths: items.map((item) => item.path) }));

fs.mkdirSync(outputRoot, { recursive: true });
fs.writeFileSync(path.join(outputRoot, "used-assets-manifest.csv"), csv(used));
fs.writeFileSync(path.join(outputRoot, "unused-assets-manifest.csv"), csv(unused));
fs.writeFileSync(path.join(outputRoot, "duplicate-assets.json"), JSON.stringify(duplicateGroups, null, 2));
fs.writeFileSync(path.join(outputRoot, "missing-assets.json"), JSON.stringify(missing, null, 2));

const sum = (items) => items.reduce((total, item) => total + item.bytes, 0);
const summary = {
  generatedAt: new Date().toISOString(),
  projects: projects.length,
  publicFiles: records.length,
  publicBytes: sum(records),
  referencedFiles: used.length,
  referencedBytes: sum(used),
  unreferencedFiles: unused.length,
  unreferencedBytes: sum(unused),
  missingReferences: missing.length,
  duplicateGroups: duplicateGroups.length,
  duplicateBytesPotentiallyRecoverable: duplicateGroups.reduce((total, group) => total + group.bytesEach * (group.copies - 1), 0),
};
fs.writeFileSync(path.join(outputRoot, "asset-summary.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
