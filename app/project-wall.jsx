"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import CausticsBackground from "./soft-aurora";
import { featureFilters, groupedByYear, partnerFilters } from "./phantom-data";

function PhantomLogo() {
  return (
    <Link href="/" className="phantom-logo" aria-label="Sammuel XU Portfolio home">
      <img
        src="/brand/sammuel-xu-portfolio-logo.svg"
        alt="Sammuel XU Portfolio"
        draggable="false"
      />
    </Link>
  );
}

function Header() {
  return (
    <header className="phantom-header">
      <PhantomLogo />
      <p className="drag-instruction">拖动浏览 · 点击查看项目</p>
    </header>
  );
}

function BottomNav({ active = "work", view, onView, showWorkControls = active === "work" }) {
  return (
    <>
      {showWorkControls && (
        <>
          <div className="view-switch" aria-label="Work view">
            <button type="button" className={view === "grid" ? "active" : ""} onClick={() => onView("grid")} aria-label="Grid view">
              <span className="grid-ico" />
            </button>
            <button type="button" className={view === "list" ? "active" : ""} onClick={() => onView("list")} aria-label="List view">
              <span className="list-ico" />
            </button>
          </div>
          {process.env.NEXT_PUBLIC_STATIC_EXPORT !== "true" && (
            <Link className="filter-pill" href="/cms">CMS</Link>
          )}
        </>
      )}
      <nav className="bottom-tabs" aria-label="Primary navigation">
        <Link href="/" className={active === "work" ? "active" : ""}>作品</Link>
        <Link href="/about" className={active === "about" ? "active" : ""}>简历</Link>
      </nav>
    </>
  );
}

function Loader() {
  return (
    <div className="loader-screen" aria-hidden="true">
      <strong>SAMMUEL XU</strong>
      <span>精选视觉作品</span>
      <i />
    </div>
  );
}

function makeWorkLabelTexture(project) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,0.62)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(1022, 0);
  ctx.lineTo(1022, 768);
  ctx.moveTo(0, 766);
  ctx.lineTo(1024, 766);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.76)";
  ctx.font = "500 28px Microsoft YaHei, Arial, sans-serif";
  ctx.fillText(project.client, 34, 42);
  ctx.textAlign = "right";
  ctx.fillText(project.year, 990, 42);
  ctx.textAlign = "left";
  ctx.font = "500 28px Microsoft YaHei, Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.94)";
  ctx.fillText(project.titleCn.slice(0, 24), 34, 704);
  ctx.font = "500 28px Microsoft YaHei, Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.68)";
  ctx.textAlign = "right";
  ctx.fillText(project.zone, 990, 704);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function WorkGrid({ projects, onOpen }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(56, mount.clientWidth / mount.clientHeight, 0.1, 1200);
    camera.position.set(0, 0, 0.1);
    camera.rotation.order = "YXZ";

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const cards = [];
    const items = [];
    const gridGroup = new THREE.Group();
    gridGroup.rotation.order = "YXZ";
    scene.add(gridGroup);

    const ambient = new THREE.AmbientLight(0xffffff, 0.78);
    scene.add(ambient);

    const centerLight = new THREE.PointLight(0xffffff, 5, 26);
    centerLight.position.set(0, 0, -2);
    scene.add(centerLight);

    const rows = 5;
    const cols = 8;
    const visibleRows = 4;
    const visibleCols = 6;
    const total = rows * cols;
    const reel = Array.from({ length: total }, (_, index) => projects[index % projects.length]);
    const cellGeometry = new THREE.PlaneGeometry(3.38, 3.12);
    const imageGeometry = new THREE.PlaneGeometry(2.18, 2.18);
    // Labels use the full slot size so their right/bottom dividers sit in the gaps.
    const labelGeometry = new THREE.PlaneGeometry(3.5, 3.3);

    reel.forEach((project, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const texture = textureLoader.load(project.cover, (loadedTexture) => {
        const imageWidth = loadedTexture.image?.naturalWidth || loadedTexture.image?.width || 1;
        const imageHeight = loadedTexture.image?.naturalHeight || loadedTexture.image?.height || 1;
        const ratio = imageWidth / imageHeight;
        loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
        loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
        if (ratio > 1) {
          loadedTexture.repeat.set(1 / ratio, 1);
          loadedTexture.offset.set((1 - 1 / ratio) / 2, 0);
        } else {
          loadedTexture.repeat.set(1, ratio);
          loadedTexture.offset.set(0, (1 - ratio) / 2);
        }
        loadedTexture.needsUpdate = true;
      });
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      const cellMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.01,
        side: THREE.DoubleSide
      });
      const cell = new THREE.Mesh(cellGeometry, cellMaterial);
      cell.userData = { project, itemIndex: index };
      gridGroup.add(cell);

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(imageGeometry, material);
      mesh.userData = { project, itemIndex: index };
      gridGroup.add(mesh);

      const labelMaterial = new THREE.MeshBasicMaterial({
        map: makeWorkLabelTexture(project),
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide
      });
      const label = new THREE.Mesh(labelGeometry, labelMaterial);
      label.userData = { project, itemIndex: index };
      gridGroup.add(label);

      cards.push(cell, mesh, label);
      items.push({ cell, mesh, label, material, cellMaterial, labelMaterial, project, row, col });
    });

    const state = { yaw: 0, pitch: 0, tyaw: 0, tpitch: 0, dragging: false, sx: 0, sy: 0, moved: false };
    let hovered = null;
    let raf = 0;

    const setPointer = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const updateHover = (event) => {
      setPointer(event);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(cards, false).find(({ object }) => object.material.opacity > 0.08);
      hovered = hit?.object ?? null;
      renderer.domElement.style.cursor = hit ? "pointer" : state.dragging ? "grabbing" : "grab";
    };

    const wheel = (event) => {
      state.tyaw -= event.deltaX * 0.0012;
      state.tpitch -= event.deltaY * 0.0009;
    };
    const down = (event) => {
      state.dragging = true;
      state.moved = false;
      hovered = null;
      state.sx = event.clientX;
      state.sy = event.clientY;
      renderer.domElement.setPointerCapture?.(event.pointerId);
      mount.classList.add("dragging");
    };
    const move = (event) => {
      if (state.dragging) {
        const dx = event.clientX - state.sx;
        const dy = event.clientY - state.sy;
        if (Math.abs(dx) + Math.abs(dy) > 3) state.moved = true;
        state.tyaw -= dx * 0.0044;
        state.tpitch -= dy * 0.0034;
        state.sx = event.clientX;
        state.sy = event.clientY;
        renderer.domElement.style.cursor = "grabbing";
      } else {
        updateHover(event);
      }
    };
    const up = (event) => {
      state.dragging = false;
      state.tyaw = Math.round(state.tyaw);
      state.tpitch = Math.round(state.tpitch);
      mount.classList.remove("dragging");
      if (!state.moved && event) updateHover(event);
      else renderer.domElement.style.cursor = "grab";
    };
    const click = () => {
      if (!hovered || state.moved) return;
      onOpen(hovered.userData.project.slug);
    };
    const resize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    renderer.domElement.addEventListener("wheel", wheel, { passive: true });
    renderer.domElement.addEventListener("pointerdown", down);
    renderer.domElement.addEventListener("pointermove", move);
    renderer.domElement.addEventListener("click", click);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("resize", resize);

    const smoothstep = (min, max, value) => {
      const t = THREE.MathUtils.clamp((value - min) / (max - min), 0, 1);
      return t * t * (3 - 2 * t);
    };

    const animate = () => {
      raf = window.requestAnimationFrame(animate);
      state.yaw = THREE.MathUtils.damp(state.yaw, state.tyaw, 5, 0.016);
      state.pitch = THREE.MathUtils.damp(state.pitch, state.tpitch, 5, 0.016);
      const wrap = (value, size) => THREE.MathUtils.euclideanModulo(value + size / 2, size) - size / 2;
      items.forEach((item) => {
        const gridX = wrap(item.col - (cols - 1) / 2 + state.yaw, cols);
        const gridY = wrap(item.row - (rows - 1) / 2 + state.pitch, rows);
        const edgeY = Math.max(0, Math.abs(gridY) - 1.15);
        const curveAngle = gridX * 0.19;
        const curveRadius = 3.5 / 0.19;
        const x = Math.sin(curveAngle) * curveRadius;
        const y = -gridY * 3.3;
        const z = -15 + (1 - Math.cos(curveAngle)) * curveRadius + edgeY * edgeY * 0.18;
        const rotationX = gridY < 0 ? edgeY * -0.035 : edgeY * 0.035;
        const rotationY = -curveAngle;
        const isHovered = hovered?.userData.itemIndex === item.cell.userData.itemIndex;
        // Keep the camera framed to four by six while the larger six by eight
        // reel supplies off-screen cards for continuous dragging.
        const horizontalProgress = Math.abs(gridX) / (visibleCols / 2);
        const verticalProgress = Math.abs(gridY) / (visibleRows / 2);
        const rawEdgeProgress = Math.max(horizontalProgress, verticalProgress);
        const edgeProgress = THREE.MathUtils.clamp(rawEdgeProgress, 0, 1);
        const smoothEdge = edgeProgress * edgeProgress * (3 - 2 * edgeProgress);
        const visibility = isHovered ? 1 : 1 - smoothEdge * 0.4;
        // Complete the wrap outside the visible four-by-six window. Cards fade
        // away before their wrapped coordinate changes side, preventing flashes.
        const seamOpacity = 1 - smoothstep(0.9, 1.18, rawEdgeProgress);

        item.cell.position.set(x, y, z);
        item.mesh.position.set(x, y, z + 0.035);
        item.label.position.set(x, y, z + 0.07);
        item.cell.rotation.set(rotationX, rotationY, 0);
        item.mesh.rotation.copy(item.cell.rotation);
        item.label.rotation.copy(item.cell.rotation);

        item.cellMaterial.opacity = (0.003 + visibility * 0.009) * seamOpacity;
        item.material.opacity = seamOpacity;
        item.labelMaterial.opacity = seamOpacity;
        item.material.color.setScalar(visibility);
        item.labelMaterial.color.setScalar(visibility);
        const scale = isHovered ? 1.025 : 1;
        item.cell.scale.setScalar(scale);
        item.mesh.scale.setScalar(scale);
        item.label.scale.setScalar(scale);
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(raf);
      renderer.domElement.removeEventListener("wheel", wheel);
      renderer.domElement.removeEventListener("pointerdown", down);
      renderer.domElement.removeEventListener("pointermove", move);
      renderer.domElement.removeEventListener("click", click);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      mount.innerHTML = "";
    };
  }, [projects, onOpen]);

  return (
    <section className="work-stage webgl-work-stage" aria-label="Three.js WebGL six by eight work reel with a four by six viewport">
      <CausticsBackground />
      <div className="webgl-work-canvas" ref={mountRef} />
    </section>
  );
}

function WorkList({ projects, onOpen }) {
  const groups = groupedByYear(projects);
  const years = Object.keys(groups).sort((a, b) => Number(b) - Number(a));
  return (
    <section className="work-list-page">
      <h1>全部项目 <span>{projects.length} 个项目</span></h1>
      {years.map((year) => (
        <div className="list-year" key={year}>
          <h2>{year}</h2>
          <div>
            {groups[year].map((project) => (
              <button type="button" className="project-line" key={project.slug} onClick={() => onOpen(project.slug)}>
                <strong>{project.title}</strong>
                <span>{project.client}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function FilterPanel({ open, onClose, active, onPick }) {
  if (!open) return null;
  return (
    <div className="filter-overlay">
      <div className="zone-list">
        <span className="micro">按项目类型筛选</span>
        {["All", ...featureFilters].map((zone) => (
          <button key={zone} className={active === zone ? "active" : ""} type="button" onClick={() => onPick(zone)}>{zone}</button>
        ))}
      </div>
      <div className="filter-columns">
        <div>
          <span className="micro">项目类型</span>
          {featureFilters.map((filter) => <button type="button" key={filter} onClick={() => onPick(filter)}>{filter}</button>)}
        </div>
        <div>
          <span className="micro">设计方向</span>
          {["视觉设计", "品牌设计", "数字体验"].map((filter) => <button type="button" key={filter} onClick={() => onPick(filter)}>{filter}</button>)}
          <span className="micro partner-title">客户品牌</span>
          {partnerFilters.map((filter) => <button type="button" key={filter} onClick={() => onPick(filter)}>{filter}</button>)}
        </div>
      </div>
      <button className="close-pill" type="button" onClick={onClose}>关闭</button>
    </div>
  );
}

function ContactOverlay({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="contact-overlay">
      <button type="button" className="close-round" onClick={onClose} aria-label="Close contact">×</button>
      <section className="contact-panel">
        <p className="micro">○ LET'S TALK</p>
        <h2>Welcome! It's great to meet you.</h2>
        <div className="contact-cards">
          {[
            ["COLLABORATION", "I'm interested in working together."],
            ["HIRING", "I'd like to join the team."],
            ["ANYTHING ELSE", "Just saying hi."]
          ].map(([label, text]) => (
            <button type="button" className="contact-card" key={label}>
              <span className="micro">● {label}</span>
              <strong>{text}</strong>
              <i>→</i>
            </button>
          ))}
          <div className="contact-card contact-wide">
            <span className="micro">EMAIL<br />HELLO@PHANTOM.LOCAL</span>
            <span className="micro">MESSAGE<br />+00 0000 000000</span>
          </div>
        </div>
        <a href="#privacy">Privacy Policy</a>
      </section>
    </div>
  );
}

function CursorRing() {
  const ring = useRef(null);
  useEffect(() => {
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { ...target };
    let raf = 0;
    const move = (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
    };
    const animate = () => {
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;
      if (ring.current) ring.current.style.transform = `translate3d(${current.x - 26}px, ${current.y - 26}px, 0)`;
      raf = window.requestAnimationFrame(animate);
    };
    window.addEventListener("pointermove", move);
    animate();
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
    };
  }, []);
  return <div className="cursor-ring" ref={ring} />;
}

export default function ProjectWall({ projects }) {
  const [view, setView] = useState("grid");
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), 1400);
    return () => window.clearTimeout(id);
  }, []);

  const visibleProjects = useMemo(() => {
    if (activeFilter === "All") return projects;
    return projects.filter((project) => (
      project.zone === activeFilter ||
      project.region === activeFilter ||
      project.client.toUpperCase() === activeFilter ||
      project.tags.includes(activeFilter)
    ));
  }, [activeFilter, projects]);

  const openProject = (slug) => {
    window.location.href = `/projects/${slug}`;
  };

  return (
    <main className="phantom-shell">
      <Header />
      {view === "grid" ? <WorkGrid projects={visibleProjects} onOpen={openProject} /> : <WorkList projects={visibleProjects} onOpen={openProject} />}
      <BottomNav active="work" view={view} onView={setView} />
      <CursorRing />
      {loading && <Loader />}
    </main>
  );
}

export { Header, BottomNav, ContactOverlay, CursorRing };
