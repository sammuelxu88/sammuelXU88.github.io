"use client";

import { useEffect, useRef } from "react";

const STAR_COUNT = 260;
const SPEED = 2.4;
const WARP = 0.6;

function createStars() {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
    z: Math.random(),
  }));
}

export default function HyperspeedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !context) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stars = createStars();
    let width = 0;
    let height = 0;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.fillStyle = "#040408";
      context.fillRect(0, 0, width, height);
    };

    const draw = () => {
      const centerX = width / 2;
      const centerY = height / 2;

      context.fillStyle = "rgba(4, 4, 8, 0.45)";
      context.fillRect(0, 0, width, height);
      context.strokeStyle = "#dfe6ff";
      context.lineWidth = 1.2;
      context.lineCap = "round";

      for (const star of stars) {
        const previousZ = star.z;
        star.z -= reducedMotion ? 0 : SPEED * 0.004;

        if (star.z <= 0.02) {
          star.x = Math.random() * 2 - 1;
          star.y = Math.random() * 2 - 1;
          star.z = 1;
          continue;
        }

        const currentX = centerX + (star.x / star.z) * centerX;
        const currentY = centerY + (star.y / star.z) * centerY;
        const previousX = centerX + (star.x / previousZ) * centerX;
        const previousY = centerY + (star.y / previousZ) * centerY;

        context.globalAlpha = Math.min(1, (1 - star.z) * 1.4);
        context.beginPath();
        context.moveTo(
          previousX - (previousX - currentX) * WARP,
          previousY - (previousY - currentY) * WARP,
        );
        context.lineTo(currentX, currentY);
        context.stroke();
      }

      context.globalAlpha = 1;
      if (!reducedMotion) raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas className="caustics-canvas" ref={canvasRef} aria-hidden="true" />;
}
