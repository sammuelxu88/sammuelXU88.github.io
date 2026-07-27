import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const publicDir = path.join(root, "public");
const contentFile = path.join(root, "content", "projects.json");
const auditDir = path.join(root, "deployment-audit");
const imagePattern = /\.(?:jpe?g|png|webp)$/i;
const records = [];

function diskPath(publicPath) {
  return path.join(publicDir, ...publicPath.replace(/^\//, "").split("/"));
}

async function optimize(sourceRef, outputRef, options) {
  const source = diskPath(sourceRef);
  const output = diskPath(outputRef);
  await fs.mkdir(path.dirname(output), { recursive: true });
  const before = (await fs.stat(source)).size;
  let pipeline = sharp(source, { failOn: "none" }).rotate();
  if (options.cover) {
    pipeline = pipeline.resize(1200, 1200, { fit: "cover", position: "attention", withoutEnlargement: true });
  } else {
    pipeline = pipeline.resize(2560, 2560, { fit: "inside", withoutEnlargement: true });
  }
  await pipeline.webp({ quality: 82, effort: 6, smartSubsample: true }).toFile(output);
  const after = (await fs.stat(output)).size;
  records.push({ source: sourceRef, output: outputRef, role: options.cover ? "cover" : "detail", before, after });
  return outputRef;
}

function mediaSrc(item) {
  return typeof item === "string" ? item : item?.src;
}

const raw = await fs.readFile(contentFile, "utf8");
const projects = JSON.parse(raw);
await fs.mkdir(auditDir, { recursive: true });
const backup = path.join(auditDir, "projects-before-media-optimization.json");
try {
  await fs.access(backup);
} catch {
  await fs.writeFile(backup, raw, "utf8");
}

for (const project of projects) {
  const originalCover = project.cover;
  let optimizedCover = originalCover;
  if (imagePattern.test(originalCover) && !originalCover.startsWith("/optimized/")) {
    optimizedCover = `/optimized/covers/${project.slug}.webp`;
    await optimize(originalCover, optimizedCover, { cover: true });
    project.cover = optimizedCover;
  }

  const detailCache = new Map();
  project.images = await Promise.all((project.images || []).map(async (item, index) => {
    const sourceRef = mediaSrc(item);
    if (!sourceRef || !imagePattern.test(sourceRef) || sourceRef.startsWith("/optimized/")) return item;
    if (sourceRef === originalCover) {
      return typeof item === "string" ? optimizedCover : { ...item, src: optimizedCover };
    }
    let outputRef = detailCache.get(sourceRef);
    if (!outputRef) {
      outputRef = `/optimized/projects/${project.slug}/image-${String(index + 1).padStart(2, "0")}.webp`;
      await optimize(sourceRef, outputRef, { cover: false });
      detailCache.set(sourceRef, outputRef);
    }
    return typeof item === "string" ? outputRef : { ...item, src: outputRef, type: "image" };
  }));
}

const resumeAssets = [
  ["/resume-assets/cover-space.jpg", "/optimized/resume-assets/cover-space.webp"],
  ["/resume-assets/content-space.jpg", "/optimized/resume-assets/content-space.webp"],
  ["/resume-assets/portrait-reference.jpg", "/optimized/resume-assets/portrait-reference.webp"]
];
for (const [source, output] of resumeAssets) await optimize(source, output, { cover: false });

await fs.writeFile(contentFile, `${JSON.stringify(projects, null, 2)}\n`, "utf8");
await fs.writeFile(path.join(auditDir, "optimized-assets-manifest.json"), `${JSON.stringify(records, null, 2)}\n`, "utf8");

const beforeTotal = records.reduce((sum, item) => sum + item.before, 0);
const afterTotal = records.reduce((sum, item) => sum + item.after, 0);
console.log(`Optimized ${records.length} images: ${(beforeTotal / 1048576).toFixed(1)} MiB -> ${(afterTotal / 1048576).toFixed(1)} MiB`);

