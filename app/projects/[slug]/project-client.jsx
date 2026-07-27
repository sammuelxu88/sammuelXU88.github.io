"use client";

import { useState } from "react";
import { BottomNav, ContactOverlay, CursorRing, Header } from "../../project-wall";
import { isVideoMedia, mediaSource } from "../../media-utils";

export default function ProjectClient({ project }) {
  const [contact, setContact] = useState(false);
  const [galleryScale, setGalleryScale] = useState(100);
  const allMedia = project.images?.length ? project.images : [project.cover];
  const gallery = project.hideCoverInDetail
    ? allMedia.filter((media) => mediaSource(media) !== mediaSource(project.cover))
    : allMedia;

  return (
    <main className="phantom-page project-page">
      <Header onContact={() => setContact(true)} />
      <section className="project-hero">
        <h1>{project.title}</h1>
        <div className="project-tags">
          <span className="micro">PROJECT TYPE</span>
          <strong>{project.region}</strong>
          <strong>{project.zone}</strong>
        </div>
      </section>

      <section className="project-story-block">
        <h2>{project.summary}</h2>
        <p>{project.description}</p>
        <div className="project-meta-grid">
          <div>
            <span>年份</span>
            <strong>{project.year}</strong>
          </div>
          <div>
            <span>分类</span>
            <strong>{project.category}</strong>
          </div>
          <div>
            <span>职责</span>
            <strong>{project.role}</strong>
          </div>
          <div>
            <span>标签</span>
            <strong>{project.tags.join(" / ")}</strong>
          </div>
        </div>
      </section>

      {gallery.length > 0 && <section
        className="project-gallery-row"
        style={{ width: `min(${1080 * galleryScale / 100}px, 100%)` }}
      >
        {gallery.map((media, index) => {
          const src = mediaSource(media);
          return isVideoMedia(media) ? (
            <video src={src} controls muted playsInline preload="metadata" aria-label={`${project.title} 视频 ${index + 1}`} key={src} />
          ) : (
            <img src={src} alt={`${project.title} ${index + 1}`} key={src} />
          );
        })}
      </section>}

      {gallery.length > 0 && <div className="project-size-controls" aria-label="调整作品画面显示大小">
        <button
          type="button"
          onClick={() => setGalleryScale((value) => Math.max(50, value - 10))}
          disabled={galleryScale <= 50}
          aria-label="缩小作品画面"
          title="缩小"
        >
          −
        </button>
        <button
          type="button"
          className="project-size-fit"
          onClick={() => setGalleryScale(100)}
          aria-label="恢复适应页面宽度"
          title="适应页面宽度"
        >
          <span aria-hidden="true">⌗</span>
          <small>{galleryScale}%</small>
        </button>
        <button
          type="button"
          onClick={() => setGalleryScale((value) => Math.min(140, value + 10))}
          disabled={galleryScale >= 140}
          aria-label="放大作品画面"
          title="放大"
        >
          +
        </button>
      </div>}

      <BottomNav active="work" showWorkControls={false} />
      <ContactOverlay open={contact} onClose={() => setContact(false)} />
      <CursorRing />
    </main>
  );
}
