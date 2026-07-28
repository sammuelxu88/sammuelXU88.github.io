"use client";

import { useEffect, useRef, useState } from "react";
import { BottomNav, CursorRing } from "../project-wall";

const skills = [
  { name: "AI", value: 88, color: "#ff9a00", icon: "/resume-assets/icons/illustrator.svg" },
  { name: "Figma", value: 90, color: "#45b9e8", icon: "/resume-assets/icons/figma.webp" },
  { name: "PS", value: 96, color: "#31a8ff", icon: "/resume-assets/icons/photoshop.svg" },
  { name: "PR", value: 70, color: "#9999ff", icon: "/resume-assets/icons/premiere.svg" },
  { name: "C4D / 犀牛", value: 88, color: "#536dff", icon: "/resume-assets/icons/3d.svg" },
  { name: "AIGC", value: 85, color: "#00e8ff", icon: "/resume-assets/icons/aigc.png" },
];

const capabilities = [
  "能够独立推进视觉策略、版式体系与最终交付，覆盖品牌、电商活动及数字产品界面。",
  "擅长将复杂卖点转化为清晰的信息层级，建立可延展的主视觉、组件与多尺寸传播系统。",
  "熟练运用 Photoshop、Illustrator 与 Figma，完成视觉设计、界面规范、品牌图形及高保真原型。",
  "掌握 Cinema 4D 与 Rhino，可完成产品建模、场景搭建、材质灯光与商业渲染。",
  "具备 AIGC 辅助创意、动态内容与视频剪辑能力，能在协作和紧凑周期中稳定推进交付。",
];

const shuffleTitleLines = ["PERSONAL", "RESUME"];
const shuffleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function ShuffleTitle() {
  const initialLines = shuffleTitleLines.map((line, lineIndex) =>
    line.split("").map((_, charIndex) =>
      shuffleCharacters[(lineIndex * 11 + charIndex * 7) % shuffleCharacters.length]
    ).join("")
  );
  const [displayLines, setDisplayLines] = useState(initialLines);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayLines(shuffleTitleLines);
      return undefined;
    }

    let frame = 0;
    const startDelay = 420;
    const characterStagger = 68;
    const characterDuration = 1040;
    const startedAt = performance.now() + startDelay;
    const totalCharacters = shuffleTitleLines.reduce((sum, line) => sum + line.length, 0);
    const totalDuration = (totalCharacters - 1) * characterStagger + characterDuration;

    const update = (now) => {
      const elapsed = now - startedAt;
      let globalIndex = 0;
      const nextLines = shuffleTitleLines.map((line, lineIndex) =>
        line.split("").map((targetCharacter, charIndex) => {
          const characterStart = globalIndex * characterStagger;
          globalIndex += 1;
          const progress = (elapsed - characterStart) / characterDuration;
          if (progress >= 1) return targetCharacter;
          const shuffleStep = Math.max(0, Math.floor((elapsed - characterStart) / 84));
          return shuffleCharacters[
            (shuffleStep * 5 + charIndex * 7 + lineIndex * 11) % shuffleCharacters.length
          ];
        }).join("")
      );

      setDisplayLines(nextLines);
      if (elapsed < totalDuration) {
        frame = requestAnimationFrame(update);
      } else {
        setDisplayLines(shuffleTitleLines);
      }
    };

    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <h1 className="resume-shuffle-title" aria-label="Personal Resume">
      {displayLines.map((line, index) => (
        <span className="resume-shuffle-line" aria-hidden="true" key={shuffleTitleLines[index]}>
          {line}
        </span>
      ))}
    </h1>
  );
}

function SkillIcon({ src, name }) {
  return <img className="resume-skill-icon" src={src} alt={`${name} 图标`} />;
}

function SkillRing({ name, value, color, icon }) {
  const ringRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return undefined;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setProgress(value);
      return undefined;
    }

    let frame = 0;
    const play = () => {
      const startedAt = performance.now();
      const duration = 3000 * (value / 100);
      const update = (now) => {
        const next = Math.min(value, Math.round((now - startedAt) / duration * value));
        setProgress(next);
        if (next < value) {
          frame = requestAnimationFrame(update);
        }
      };
      frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        play();
        observer.unobserve(ring);
      }
    }, { threshold: 0.35 });

    observer.observe(ring);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <div ref={ringRef} className="resume-skill" style={{ "--skill": `${progress * 3.6}deg`, "--skill-color": color }}>
      <div><SkillIcon src={icon} name={name} /><strong>{name}</strong><span>{progress}%</span></div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="resume-page">
      <section className="resume-section resume-hero">
        <div className="resume-texture" />
        <div className="resume-hero-copy">
          <p className="resume-kicker">SAMMUEL XU / VISUAL DESIGNER</p>
          <ShuffleTitle />
          <h2>个人简历</h2>
        </div>
        <p className="resume-side-note">Work<br />Portfolio</p>
      </section>

      <section className="resume-section resume-basic">
        <div className="resume-texture" />
        <div className="resume-section-title outline">
          <span>01 / PROFILE</span>
          <h2>THE BASIC<br />INFORMATION</h2>
        </div>
        <div className="resume-basic-layout">
          <div className="resume-portrait" role="img" aria-label="黑白人物剪影" />
          <div className="resume-profile-copy">
            <p className="resume-label">POSITION</p>
            <h3>视觉设计师</h3>
            <dl>
              <div><dt>姓名</dt><dd>Sammuel XU</dd></div>
              <div><dt>方向</dt><dd>视觉 / 品牌 / UI UX / 3D</dd></div>
              <div><dt>状态</dt><dd>开放设计岗位机会</dd></div>
              <div><dt>电话</dt><dd>13560403312</dd></div>
            </dl>
          </div>
        </div>
        <p className="resume-side-note">Work<br />Profile</p>
      </section>

      <section className="resume-section resume-skills-section">
        <div className="resume-texture" />
        <div className="resume-section-title outline">
          <span>02 / CAPABILITIES</span>
          <h2>SKILLS<br />PROFESSIONAL</h2>
        </div>
        <div className="resume-skills-layout">
          <div className="resume-capabilities">
            <h3>专业技能</h3>
            <ol>{capabilities.map((item) => <li key={item}>{item}</li>)}</ol>
          </div>
          <div className="resume-skill-grid">
            {skills.map((skill) => <SkillRing key={skill.name} {...skill} />)}
          </div>
        </div>
        <p className="resume-side-note">Work<br />Skills</p>
      </section>

      <BottomNav active="about" />
      <CursorRing />
    </main>
  );
}
