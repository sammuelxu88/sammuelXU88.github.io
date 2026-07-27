"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { BottomNav, CursorRing, Header } from "../project-wall";
import { isStaticCoverMedia, isVideoMedia, mediaSource } from "../media-utils";

function CmsMediaPreview({ media }) {
  const src = mediaSource(media);
  if (isVideoMedia(media)) {
    return <video src={src} controls muted playsInline preload="metadata" />;
  }
  return <img src={src} alt="" />;
}

export default function CmsClient({ projects }) {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState(projects);
  const [selectedSlug, setSelectedSlug] = useState(projects[0]?.slug);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const fileInput = useRef(null);

  const filteredProjects = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return drafts;
    return drafts.filter((project) => (
      project.title.toLowerCase().includes(keyword) ||
      project.client.toLowerCase().includes(keyword) ||
      project.category.toLowerCase().includes(keyword)
    ));
  }, [drafts, query]);

  const selectedProject = drafts.find((project) => project.slug === selectedSlug) || drafts[0];
  const homeSlots = Array.from({ length: 40 }, (_, index) => ({
    index,
    project: drafts[index],
    active: drafts[index]?.slug === selectedProject?.slug
  }));

  const unlock = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch("/api/cms/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "auth", password })
      });
      if (!response.ok) throw new Error("密码不正确，请重新输入。");
      setUnlocked(true);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const updateSelected = (field, value) => {
    setDrafts((items) => items.map((project) => (
      project.slug === selectedProject.slug ? { ...project, [field]: value } : project
    )));
  };

  const replaceProject = (project) => {
    setDrafts((items) => items.map((item) => item.slug === project.slug ? { ...item, ...project } : item));
  };

  const applyResult = (result) => {
    if (result.projects) setDrafts(result.projects);
    else if (result.project) replaceProject(result.project);
    if (result.project?.slug) setSelectedSlug(result.project.slug);
  };

  const runAction = async (payload, successMessage) => {
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch("/api/cms/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, slug: selectedProject.slug, ...payload })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "操作失败。");
      applyResult(result);
      setStatus(successMessage);
    } catch (requestError) {
      setStatus(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const saveProject = () => runAction({ action: "save", project: selectedProject }, "文案与项目信息已保存。刷新首页后即可看到更新。");
  const saveAllProjects = () => runAction({ action: "saveAll", projects: drafts }, "全部项目内容与展示墙顺序已永久保存。");
  const setCover = (image) => runAction({ action: "cover", image }, "首页封面已更新。");
  const deleteImage = (image) => runAction({ action: "delete", image }, "图片已删除。");
  const createProject = () => runAction({ action: "create" }, "新项目已创建，请完善文案并导入图片。");
  const duplicateProject = () => runAction({ action: "duplicate" }, "项目副本已创建。");
  const moveProject = (direction) => runAction({ action: "move", direction }, "项目排序已保存。");

  const reorderProjects = (fromIndex, toIndex) => {
    if (fromIndex === null || fromIndex === toIndex || !drafts[fromIndex] || !drafts[toIndex]) return;
    setDrafts((items) => {
      const next = [...items];
      [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
      return next;
    });
    setStatus("展示墙顺序已调整，请点击“保存全部修改”永久保存。");
  };

  const renameProject = () => {
    const nextSlug = window.prompt("输入新的项目路径（英文字母、数字或横线）：", selectedProject.slug);
    if (!nextSlug || nextSlug === selectedProject.slug) return;
    runAction({ action: "rename", nextSlug }, "项目路径已更新。");
  };

  const deleteProject = () => {
    if (!window.confirm(`确定删除项目“${selectedProject.title}”吗？此操作不能撤销。`)) return;
    runAction({ action: "deleteProject" }, "项目已删除。");
  };

  const uploadImages = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setBusy(true);
    setStatus("");
    const formData = new FormData();
    formData.append("password", password);
    formData.append("slug", selectedProject.slug);
    files.forEach((file) => formData.append("files", file));
    try {
      const response = await fetch("/api/cms/projects", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "上传失败。");
      applyResult(result);
      setStatus(`已导入 ${files.length} 张图片。`);
    } catch (requestError) {
      setStatus(requestError.message);
    } finally {
      event.target.value = "";
      setBusy(false);
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(drafts, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "projects.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!unlocked) {
    return (
      <main className="phantom-page cms-lock-page">
        <Header />
        <section className="cms-lock-panel">
          <p className="micro">LOCAL CMS</p>
          <h1>作品内容管理</h1>
          <p>输入密码后查看、筛选和编辑当前作品集草稿。</p>
          <form onSubmit={unlock}>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="请输入 CMS 密码"
              autoFocus
            />
            <button type="submit">进入 CMS</button>
          </form>
          {error && <span className="cms-error">{error}</span>}
          <Link href="/">返回首页</Link>
        </section>
        <BottomNav active="cms" showWorkControls={false} />
        <CursorRing />
      </main>
    );
  }

  return (
    <main className="phantom-page cms-editor-page">
      <Header />
      <section className="cms-editor-shell">
        <div className="cms-editor-head">
          <div>
            <p className="micro">CMS / FRONT-END DRAFT</p>
            <h1>作品集内容管理</h1>
            <span>{drafts.length} 个项目组，首页使用 1:1 方形代表图。</span>
          </div>
          <div className="cms-head-actions">
            <button type="button" onClick={createProject} disabled={busy}>新建项目</button>
            <button type="button" onClick={saveAllProjects} disabled={busy}>保存全部修改</button>
            <button type="button" onClick={exportJson}>导出 JSON</button>
          </div>
        </div>

        <div className="cms-editor-layout">
          <aside className="cms-project-list">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索项目 / 品牌 / 分类"
            />
            {filteredProjects.map((project) => (
              <button
                type="button"
                className={project.slug === selectedProject.slug ? "active" : ""}
                onClick={() => setSelectedSlug(project.slug)}
                key={project.slug}
              >
                <img src={project.cover} alt="" />
                <span>{project.title}</span>
                <small>{project.category}</small>
              </button>
            ))}
          </aside>

          {selectedProject && (
            <section className="cms-edit-panel">
              <div className="cms-preview-row">
                <div className="cms-cover-preview">
                  <img className="cms-edit-cover" src={selectedProject.cover} alt="" />
                  <div className="cms-cover-note">当前首页封面</div>
                </div>
                <div className="cms-home-map">
                  <div className="cms-home-map-head">
                    <strong>首页位置示意</strong>
                    <span>拖拽封面交换展示位置 · 高亮为当前项目</span>
                  </div>
                  <div className="cms-home-grid" aria-label="当前项目在首页作品墙中的位置">
                    {homeSlots.map((slot) => (
                      <span
                        className={`${slot.active ? "active" : ""} ${draggedIndex === slot.index ? "dragging" : ""}`}
                        draggable={Boolean(slot.project)}
                        onClick={() => slot.project && setSelectedSlug(slot.project.slug)}
                        onDragStart={(event) => {
                          setDraggedIndex(slot.index);
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/plain", String(slot.index));
                        }}
                        onDragOver={(event) => {
                          if (slot.project) event.preventDefault();
                          event.dataTransfer.dropEffect = "move";
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          const sourceIndex = Number(event.dataTransfer.getData("text/plain"));
                          reorderProjects(Number.isInteger(sourceIndex) ? sourceIndex : draggedIndex, slot.index);
                          setDraggedIndex(null);
                        }}
                        onDragEnd={() => setDraggedIndex(null)}
                        title={slot.project ? `${slot.index + 1}. ${slot.project.title}` : `位置 ${slot.index + 1}`}
                        key={slot.index}
                      >
                        {slot.project && <img src={slot.project.cover} alt="" />}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="cms-project-tools">
                <button type="button" onClick={duplicateProject} disabled={busy}>复制项目</button>
                <button type="button" onClick={renameProject} disabled={busy}>修改路径</button>
                <button type="button" onClick={() => moveProject("up")} disabled={busy}>上移</button>
                <button type="button" onClick={() => moveProject("down")} disabled={busy}>下移</button>
                <button type="button" className="danger" onClick={deleteProject} disabled={busy || drafts.length <= 1}>删除项目</button>
                <span>/{selectedProject.slug}</span>
              </div>
              <div className="cms-fields-grid">
                <label>
                  项目名称
                  <input value={selectedProject.title} onChange={(event) => updateSelected("title", event.target.value)} />
                </label>
                <label>
                  客户 / 品牌
                  <input value={selectedProject.client} onChange={(event) => updateSelected("client", event.target.value)} />
                </label>
                <label>
                  分类
                  <input value={selectedProject.category} onChange={(event) => updateSelected("category", event.target.value)} />
                </label>
                <label>
                  项目简介
                  <textarea value={selectedProject.summary} onChange={(event) => updateSelected("summary", event.target.value)} />
                </label>
                <label className="cms-description-field">
                  项目说明
                  <textarea value={selectedProject.description} onChange={(event) => updateSelected("description", event.target.value)} />
                </label>
              </div>
              <div className="cms-save-row">
                <button type="button" onClick={saveProject} disabled={busy}>保存文案信息</button>
                <button type="button" onClick={() => fileInput.current?.click()} disabled={busy}>导入图片 / 视频</button>
                <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4" multiple onChange={uploadImages} hidden />
                {status && <span className="cms-status" role="status">{status}</span>}
              </div>
              <label className="cms-detail-cover-toggle">
                <input
                  type="checkbox"
                  checked={Boolean(selectedProject.hideCoverInDetail)}
                  onChange={(event) => updateSelected("hideCoverInDetail", event.target.checked)}
                />
                <span>
                  <strong>详情页隐藏首页封面</strong>
                  <small>开启后首页仍使用当前封面，但详情页图库不再重复展示该图片。</small>
                </span>
              </label>
              <div className="cms-image-strip">
                {(selectedProject.images || []).map((image) => (
                  <article className={mediaSource(image) === mediaSource(selectedProject.cover) ? "is-cover" : ""} key={mediaSource(image)}>
                    <CmsMediaPreview media={image} />
                    <div>
                      <button type="button" onClick={() => setCover(image)} disabled={busy || mediaSource(image) === mediaSource(selectedProject.cover) || !isStaticCoverMedia(image)}>
                        {mediaSource(image) === mediaSource(selectedProject.cover) ? "首页封面" : isStaticCoverMedia(image) ? "设为封面" : "仅详情展示"}
                      </button>
                      <button type="button" className="danger" onClick={() => deleteImage(image)} disabled={busy || selectedProject.images.length <= 1}>
                        删除
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
      <BottomNav active="cms" showWorkControls={false} />
      <CursorRing />
    </main>
  );
}
