"use client";

import { useEffect, useRef } from "react";

type Variant = "hero" | "band";

interface MarblingCanvasProps {
  variant?: Variant;
  className?: string;
  interactive?: boolean;
}

/**
 * The marbling bath. A low-resolution field of ink, computed per pixel and
 * stretched to its frame: the softness is the material, not a filter.
 *
 * Motion rules:
 * - one static frame when the visitor asks for reduced motion;
 * - no rAF while the canvas is off screen or the document is hidden;
 * - a capped frame rate and a small internal resolution keep it light on phones.
 */
export default function MarblingCanvas({
  variant = "hero",
  className,
  interactive = false,
}: MarblingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const coarse = window.matchMedia("(max-width: 760px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W: number;
    let H: number;
    if (variant === "hero") {
      W = coarse ? 300 : 420;
      H = coarse ? 340 : 400;
    } else {
      W = coarse ? 360 : 680;
      H = coarse ? 130 : 200;
    }

    canvas.width = W;
    canvas.height = H;

    const image = ctx.createImageData(W, H);
    const data = image.data;

    const hash = (x: number, y: number) => {
      const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return s - Math.floor(s);
    };

    const noise = (x: number, y: number) => {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const xf = x - xi;
      const yf = y - yi;
      const u = xf * xf * (3 - 2 * xf);
      const v = yf * yf * (3 - 2 * yf);
      const a = hash(xi, yi);
      const b = hash(xi + 1, yi);
      const c = hash(xi, yi + 1);
      const e = hash(xi + 1, yi + 1);
      return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + e * u) * v;
    };

    // The pointer stirs the bath. Normalised to the viewport; on touch we
    // leave it alone so scrolling never fights the material.
    let mx = 0.52;
    let my = 0.44;
    let t = 1.7;

    const paint = () => {
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const u = x / W;
          const v = y / H;
          const w1 = noise(u * 2.0 + t * 0.06, v * 1.6 - t * 0.02);
          const w2 = noise(v * 2.2 - t * 0.05, u * 1.5 + 3.1);
          let wx = u * 1.55 + 0.95 * w1;
          let wy = v * 2.35 + 0.95 * w2;
          const dx = u - mx;
          const dy = v - my;
          const sw = Math.exp(-Math.sqrt(dx * dx + dy * dy) * 4.5) * 0.35;
          wx += -dy * sw;
          wy += dx * sw;

          const s1 = Math.sin(
            (wx + 0.55 * Math.sin(wy * 2.1 + t * 0.08)) * Math.PI * 2 + 0.8 * w1
          );
          const s2 = Math.sin(
            (wx * 2.35 - 0.75 * Math.sin(wy * 2.7 - t * 0.06)) * Math.PI * 2 +
              1.3 * w2
          );

          let r = 10;
          let g = 12;
          let b = 14;

          if (s1 > 0.25) {
            const a = (s1 - 0.25) / 0.75;
            r = r * (1 - a) + 168 * a;
            g = g * (1 - a) + 165 * a;
            b = b * (1 - a) + 157 * a;
          }
          if (s2 > 0.62) {
            const a = (s2 - 0.62) / 0.38;
            r = r * (1 - a) + 234 * a;
            g = g * (1 - a) + 231 * a;
            b = b * (1 - a) + 223 * a;
          }
          if (s1 > 0.94) {
            const a = (s1 - 0.94) / 0.06;
            r = r * (1 - a) + 246 * a;
            g = g * (1 - a) + 242 * a;
            b = b * (1 - a) + 233 * a;
          }

          const i = (y * W + x) * 4;
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = 255;
        }
      }
      ctx.putImageData(image, 0, 0);
    };

    paint();

    if (reduced) return;

    const fps = variant === "hero" ? (coarse ? 18 : 26) : coarse ? 16 : 22;
    const frameMs = 1000 / fps;
    const speed = variant === "hero" ? 0.00018 : 0.00012;

    let raf = 0;
    let running = false;
    let inView = true;
    let last = 0;
    let acc = 0;

    const frame = (now: number) => {
      if (!running) return;
      if (!last) last = now;
      const dt = Math.min(now - last, 120);
      last = now;
      acc += dt;
      if (acc >= frameMs) {
        t += acc * speed;
        acc = 0;
        paint();
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || reduced || document.hidden || !inView) return;
      running = true;
      last = 0;
      acc = 0;
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      mx = event.clientX / window.innerWidth;
      my = event.clientY / window.innerHeight;
    };

    if (interactive) {
      window.addEventListener("pointermove", onMove, { passive: true });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
        if (inView) start();
        else stop();
      },
      { rootMargin: "80px" }
    );
    observer.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    start();

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (interactive) window.removeEventListener("pointermove", onMove);
    };
  }, [variant, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      role="presentation"
    />
  );
}
