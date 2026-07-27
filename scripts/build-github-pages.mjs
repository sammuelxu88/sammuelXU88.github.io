import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const appDir = path.join(root, "app");
const publicDir = path.join(root, "public");
const stagingDir = path.join(root, ".local-only-build");
const originalPublic = path.join(stagingDir, "public-original");
const hiddenCms = path.join(stagingDir, "cms");
const hiddenApi = path.join(stagingDir, "api");
const projectsFile = path.join(root, "content", "projects.json");

function publicFile(ref) {
  return path.join(originalPublic, ...ref.replace(/^\//, "").split("/"));
}

function run(command, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, env, stdio: "inherit", shell: false });
    child.on("error", reject);
    child.on("exit", code => code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)));
  });
}

async function gatherPublicRefs() {
  const refs = new Set();
  const projects = JSON.parse(await fs.readFile(projectsFile, "utf8"));
  for (const project of projects) {
    refs.add(project.cover);
    for (const item of project.images || []) refs.add(typeof item === "string" ? item : item.src);
  }

  const sourceExtensions = new Set([".js", ".jsx", ".mjs", ".css", ".json"]);
  async function scan(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) await scan(target);
      else if (sourceExtensions.has(path.extname(entry.name))) {
        const text = await fs.readFile(target, "utf8");
        for (const match of text.matchAll(/["'(]((?:\/)[^"'()\s]+?\.(?:jpe?g|png|webp|gif|svg|woff2?|ttf|otf|mp4))(?:[?"')])/gi)) refs.add(match[1]);
      }
    }
  }
  await scan(appDir);
  return [...refs].filter(Boolean);
}

async function copyPublishAssets(refs) {
  await fs.mkdir(publicDir, { recursive: true });
  for (const ref of refs) {
    const source = publicFile(ref);
    const destination = path.join(publicDir, ...ref.replace(/^\//, "").split("/"));
    try {
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.copyFile(source, destination);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      console.warn(`Skipped missing publish asset: ${ref}`);
    }
  }
}

await fs.rm(stagingDir, { recursive: true, force: true });
await fs.mkdir(stagingDir, { recursive: true });

let publicMoved = false;
let cmsMoved = false;
let apiMoved = false;
try {
  await fs.rename(publicDir, originalPublic);
  publicMoved = true;
  await fs.cp(path.join(appDir, "cms"), hiddenCms, { recursive: true });
  await fs.rm(path.join(appDir, "cms"), { recursive: true, force: true });
  cmsMoved = true;
  await fs.cp(path.join(appDir, "api"), hiddenApi, { recursive: true });
  await fs.rm(path.join(appDir, "api"), { recursive: true, force: true });
  apiMoved = true;

  const refs = await gatherPublicRefs();
  await copyPublishAssets(refs);
  await run(process.execPath, [path.join(root, "node_modules", "next", "dist", "bin", "next"), "build"], {
    ...process.env,
    STATIC_EXPORT: "true",
    NEXT_PUBLIC_STATIC_EXPORT: "true"
  });
  await fs.writeFile(path.join(root, "out", ".nojekyll"), "", "utf8");
  console.log(`GitHub Pages export complete with ${refs.length} referenced public assets.`);
} finally {
  if (publicMoved) {
    await fs.rm(publicDir, { recursive: true, force: true });
    await fs.rename(originalPublic, publicDir);
  }
  if (cmsMoved) {
    await fs.cp(hiddenCms, path.join(appDir, "cms"), { recursive: true });
    await fs.rm(hiddenCms, { recursive: true, force: true });
  }
  if (apiMoved) {
    await fs.cp(hiddenApi, path.join(appDir, "api"), { recursive: true });
    await fs.rm(hiddenApi, { recursive: true, force: true });
  }
  await fs.rm(stagingDir, { recursive: true, force: true });
}
