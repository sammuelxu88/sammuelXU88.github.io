import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const CMS_PASSWORD = process.env.CMS_PASSWORD;
const dataFile = path.join(process.cwd(), "content", "projects.json");
const uploadRoot = path.join(process.cwd(), "public", "portfolio", "uploads");
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4"]);
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4"]);
const staticCoverExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function mediaPath(value) {
  return typeof value === "string" ? value : value?.src || "";
}

function isStaticCover(value) {
  return staticCoverExtensions.has(path.extname(mediaPath(value).split(/[?#]/)[0]).toLowerCase());
}

function isAllowedUpload(file) {
  const extension = path.extname(file.name).toLowerCase();
  return allowedExtensions.has(extension) && (!file.type || allowedTypes.has(file.type));
}

async function readProjects() {
  return JSON.parse(await fs.readFile(dataFile, "utf8"));
}

async function writeProjects(projects) {
  await fs.writeFile(dataFile, `${JSON.stringify(projects, null, 2)}\n`, "utf8");
}

function unauthorized() {
  return NextResponse.json({ error: "CMS 密码无效。" }, { status: 401 });
}

function hasValidPassword(value) {
  return Boolean(CMS_PASSWORD) && value === CMS_PASSWORD;
}

function safeSegment(value) {
  return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "");
}

function safeFileName(value) {
  const extension = path.extname(value).toLowerCase().replace(/[^.a-z0-9]/g, "");
  const base = path.basename(value, path.extname(value)).replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80) || "image";
  return `${Date.now()}-${base}${extension}`;
}

function uniqueSlug(projects, preferred) {
  const base = safeSegment(preferred) || "new-project";
  let slug = base;
  let suffix = 2;
  while (projects.some((project) => project.slug === slug)) slug = `${base}-${suffix++}`;
  return slug;
}

export async function POST(request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    if (!hasValidPassword(formData.get("password"))) return unauthorized();

    const slug = safeSegment(formData.get("slug"));
    const files = formData.getAll("files").filter((file) => file && file.size);
    const projects = await readProjects();
    const projectIndex = projects.findIndex((project) => project.slug === slug);
    if (projectIndex < 0) return NextResponse.json({ error: "未找到项目。" }, { status: 404 });
    if (!files.length) return NextResponse.json({ error: "请选择图片。" }, { status: 400 });

    const invalidFile = files.find((file) => !isAllowedUpload(file));
    if (invalidFile) return NextResponse.json({ error: `不支持的文件类型：${invalidFile.name}` }, { status: 415 });
    const oversizedFile = files.find((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFile) return NextResponse.json({ error: `文件超过 100MB：${oversizedFile.name}` }, { status: 413 });

    const projectFolder = path.join(uploadRoot, slug);
    await fs.mkdir(projectFolder, { recursive: true });
    const uploaded = [];
    for (const file of files) {
      const fileName = safeFileName(file.name);
      await fs.writeFile(path.join(projectFolder, fileName), Buffer.from(await file.arrayBuffer()));
      uploaded.push(`/portfolio/uploads/${slug}/${fileName}`);
    }

    projects[projectIndex].images = [...(projects[projectIndex].images || []), ...uploaded];
    if (!projects[projectIndex].cover) projects[projectIndex].cover = uploaded.find(isStaticCover) || "";
    await writeProjects(projects);
    return NextResponse.json({ project: projects[projectIndex] });
  }

  const body = await request.json();
  if (!hasValidPassword(body.password)) return unauthorized();
  if (body.action === "auth") return NextResponse.json({ ok: true });
  const projects = await readProjects();

  if (body.action === "saveAll") {
    if (!Array.isArray(body.projects) || !body.projects.length) {
      return NextResponse.json({ error: "没有可保存的项目。" }, { status: 400 });
    }
    const slugs = body.projects.map((project) => safeSegment(project.slug));
    if (slugs.some((slug) => !slug) || new Set(slugs).size !== slugs.length) {
      return NextResponse.json({ error: "项目路径为空或存在重复。" }, { status: 400 });
    }
    if (body.projects.some((project) => project.cover && !isStaticCover(project.cover))) {
      return NextResponse.json({ error: "首页封面仅支持 JPG、PNG 或 WebP 静态图片。" }, { status: 400 });
    }
    await writeProjects(body.projects);
    return NextResponse.json({ projects: body.projects });
  }

  if (body.action === "create") {
    const fallback = projects[0];
    const slug = uniqueSlug(projects, body.slug || `new-project-${Date.now()}`);
    const project = {
      slug,
      title: "新项目",
      titleCn: "新项目",
      year: String(new Date().getFullYear()),
      client: "待填写",
      category: "视觉设计",
      zone: "视觉设计",
      region: "视觉设计",
      tags: ["视觉设计"],
      services: ["视觉设计"],
      cover: fallback?.cover || "",
      alt: fallback?.cover || "",
      images: fallback?.cover ? [fallback.cover] : [],
      summary: "请在 CMS 中填写项目简介。",
      summaryCn: "请在 CMS 中填写项目简介。",
      description: "请在 CMS 中填写项目说明。",
      descriptionCn: "请在 CMS 中填写项目说明。",
      role: "视觉设计",
      hideCoverInDetail: false
    };
    projects.push(project);
    await writeProjects(projects);
    return NextResponse.json({ project, projects });
  }

  const projectIndex = projects.findIndex((project) => project.slug === body.slug);
  if (projectIndex < 0) return NextResponse.json({ error: "未找到项目。" }, { status: 404 });

  if (body.action === "duplicate") {
    const source = projects[projectIndex];
    const slug = uniqueSlug(projects, `${source.slug}-copy`);
    const project = { ...source, slug, title: `${source.title} 副本`, titleCn: `${source.titleCn || source.title} 副本`, images: [...(source.images || [])], tags: [...(source.tags || [])], services: [...(source.services || [])] };
    projects.splice(projectIndex + 1, 0, project);
    await writeProjects(projects);
    return NextResponse.json({ project, projects });
  } else if (body.action === "deleteProject") {
    if (projects.length <= 1) return NextResponse.json({ error: "作品集至少需要保留一个项目。" }, { status: 400 });
    const [removed] = projects.splice(projectIndex, 1);
    await fs.rm(path.join(uploadRoot, safeSegment(removed.slug)), { recursive: true, force: true });
    await writeProjects(projects);
    return NextResponse.json({ project: projects[Math.min(projectIndex, projects.length - 1)], projects });
  } else if (body.action === "rename") {
    const nextSlug = safeSegment(body.nextSlug);
    if (!nextSlug) return NextResponse.json({ error: "项目路径只能使用英文字母、数字、横线和下划线。" }, { status: 400 });
    if (projects.some((project, index) => index !== projectIndex && project.slug === nextSlug)) {
      return NextResponse.json({ error: "该项目路径已存在。" }, { status: 400 });
    }
    projects[projectIndex].slug = nextSlug;
  } else if (body.action === "move") {
    const targetIndex = body.direction === "up" ? projectIndex - 1 : projectIndex + 1;
    if (targetIndex >= 0 && targetIndex < projects.length) {
      [projects[projectIndex], projects[targetIndex]] = [projects[targetIndex], projects[projectIndex]];
    }
  } else if (body.action === "save") {
    if (body.project.cover && !isStaticCover(body.project.cover)) {
      return NextResponse.json({ error: "首页封面仅支持 JPG、PNG 或 WebP 静态图片。" }, { status: 400 });
    }
    const allowed = ["title", "titleCn", "client", "category", "zone", "region", "summary", "summaryCn", "description", "descriptionCn", "role", "year", "tags", "services", "cover", "alt", "images", "hideCoverInDetail"];
    const next = { ...projects[projectIndex] };
    for (const key of allowed) {
      if (body.project[key] !== undefined) next[key] = body.project[key];
    }
    projects[projectIndex] = next;
  } else if (body.action === "cover") {
    if (!(projects[projectIndex].images || []).includes(body.image)) {
      return NextResponse.json({ error: "封面必须来自当前项目图片。" }, { status: 400 });
    }
    if (!isStaticCover(body.image)) {
      return NextResponse.json({ error: "首页封面仅支持 JPG、PNG 或 WebP 静态图片。" }, { status: 400 });
    }
    projects[projectIndex].cover = body.image;
  } else if (body.action === "delete") {
    const images = projects[projectIndex].images || [];
    if (images.length <= 1) return NextResponse.json({ error: "每个项目至少需要保留一张图片。" }, { status: 400 });
    projects[projectIndex].images = images.filter((image) => image !== body.image);
    if (mediaPath(projects[projectIndex].cover) === mediaPath(body.image)) {
      projects[projectIndex].cover = projects[projectIndex].images.find(isStaticCover) || "";
    }
    if (body.image.startsWith(`/portfolio/uploads/${safeSegment(body.slug)}/`)) {
      const diskPath = path.join(process.cwd(), "public", body.image.replace(/^\//, ""));
      await fs.rm(diskPath, { force: true });
    }
  } else {
    return NextResponse.json({ error: "不支持的操作。" }, { status: 400 });
  }

  await writeProjects(projects);
  const resultProject = body.action === "rename"
    ? projects.find((project) => project.slug === safeSegment(body.nextSlug))
    : projects.find((project) => project.slug === body.slug);
  return NextResponse.json({ project: resultProject, projects });
}
