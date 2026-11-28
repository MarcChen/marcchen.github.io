"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, MousePointerClick } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { assetPath } from "@/lib/paths";
import { getHobbies } from "@/lib/hobbies";
import type { HobbyId, RoomController } from "@/components/three/hobbyRoom";
import styles from "@/styles/components/HobbyRoom.module.css";

function isDarkScheme() {
  const meta = document.querySelector('meta[name="color-scheme"]')?.getAttribute("content");
  return meta === "dark" || (meta !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

/** Interactive 3D room of hobbies. three.js and the scene load after first paint. */
export default function HobbyRoom({ locale }: { locale: Locale }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrl = useRef<RoomController | null>(null);
  const [hover, setHover] = useState<{ id: HobbyId; x: number; y: number } | null>(null);
  const [selected, setSelected] = useState<HobbyId | null>(null);
  const [score, setScore] = useState<{ made: number; shots: number } | null>(null);
  const [failed, setFailed] = useState(false);
  const [touch, setTouch] = useState(false);
  const hobbies = getHobbies(locale);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};
    if (window.matchMedia("(hover: none)").matches) setTouch(true);
    (async () => {
      const [THREE, { createHobbyRoom }] = await Promise.all([import("three"), import("@/components/three/hobbyRoom")]);
      if (disposed) return;
      try {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const room = createHobbyRoom(THREE, host, {
          lightScale: Math.PI,
          fujiUrl: assetPath("/videos/timelapse-mtfuji-poster.jpg"),
          dark: isDarkScheme(),
          reducedMotion: reduced,
          onHover: (id, x, y) => setHover(id ? { id, x, y } : null),
          onSelect: (id) => setSelected(id),
          onScore: (made, shots) => setScore({ made, shots }),
        });
        ctrl.current = room;
        const repaint = () => room.setDark(isDarkScheme());
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        mq.addEventListener("change", repaint);
        const meta = document.querySelector('meta[name="color-scheme"]');
        const mo = new MutationObserver(repaint);
        if (meta) mo.observe(meta, { attributes: true });
        cleanup = () => {
          mq.removeEventListener("change", repaint);
          mo.disconnect();
          room.dispose();
          ctrl.current = null;
        };
      } catch {
        setFailed(true);
      }
    })();
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const back = () => {
    setSelected(null);
    ctrl.current?.focus(null);
  };

  const info = selected ? hobbies[selected] : null;
  const hoverInfo = hover && hover.id !== selected ? hobbies[hover.id] : null;

  return (
    <div ref={hostRef} className={styles.room} role="img" aria-label={t(locale, "room_label")} data-failed={failed || undefined}>
      {hoverInfo && hover && (
        <span className={styles.tip} style={{ left: hover.x, top: hover.y }} aria-hidden="true">
          {hoverInfo.name}
        </span>
      )}

      {!selected && (
        <span className={styles.hint} aria-hidden="true">
          <MousePointerClick size={14} />
          {t(locale, touch ? "room_hint_touch" : "room_hint")}
        </span>
      )}

      {score && (
        <span className={styles.score} aria-live="polite">
          {t(locale, "room_shots")} {score.made}/{score.shots}
        </span>
      )}

      {info && (
        <div className={styles.panel} role="dialog" aria-label={info.name}>
          <span className={styles.kind}>{info.kind}</span>
          <h3 className={styles.name}>{info.name}</h3>
          <p className={styles.text}>{info.text}</p>
          {info.play && <p className={styles.play}>{info.play}</p>}
          <div className={styles.actions}>
            <button type="button" className={styles.back} onClick={back}>
              <ArrowLeft size={14} aria-hidden="true" />
              {t(locale, "room_back")}
            </button>
            {info.link && (
              <Link href={info.link.href} className={styles.link}>
                {info.link.label}
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
