"use client";

import { useEffect, useRef, useState } from "react";

const CONFETTI_COLORS = [
  "#e879f9", // fuchsia
  "#a3e635", // lime
  "#fbbf24", // amber
  "#38bdf8", // sky
  "#fb7185", // rose
  "#a78bfa", // violet
];

/** Пары «лицевая/обратная сторона» для вьющихся лент. */
const SERPENTINE_PAIRS: [string, string][] = [
  ["#f87171", "#dc2626"],
  ["#ef4444", "#b91c1c"],
  ["#fca5a5", "#dc2626"],
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  color2?: string;
  ribbon: boolean;
  circle: boolean;
  serpentine: boolean;
  rot: number;
  vrot: number;
  flip: number;
  vflip: number;
  born: number;
  life: number;
  /** серпантин: число сегментов, амплитуда и шаг волны завитка */
  segs?: number;
  amp?: number;
  wave?: number;
}

/**
 * Канвас-конфетти в духе стикеров Telegram: два залпа, гравитация,
 * сопротивление воздуха, порхание и «кувыркание» лент. Возвращает stop().
 */
function startConfetti(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  const cx = w / 2;
  const cy = h / 2;
  const parts: Particle[] = [];
  const rand = (a: number, b: number) => a + Math.random() * (b - a);

  function burst(
    now: number,
    count: number,
    power: number,
    serpentineCount: number
  ) {
    for (let i = 0; i < count; i++) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(0.06, 0.24) * power; // px/мс
      parts.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.06 * power, // лёгкий подброс вверх
        size: rand(4, 7),
        color: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0],
        ribbon: Math.random() < 0.3,
        circle: Math.random() < 0.35,
        serpentine: false,
        rot: rand(0, Math.PI * 2),
        vrot: rand(-0.012, 0.012),
        flip: rand(0, Math.PI * 2),
        vflip: rand(0.008, 0.02),
        born: now,
        life: rand(1300, 2100),
      });
    }
    // ленты — вместе с конфетти, но каждая со своей задержкой;
    // стороны пополам вперемешку
    const sides: (1 | -1)[] = Array.from(
      { length: serpentineCount },
      (_, i) => (i % 2 === 0 ? 1 : -1) as 1 | -1
    );
    for (let i = sides.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [sides[i], sides[j]] = [sides[j], sides[i]];
    }
    for (const side of sides) {
      spawnSerpentine(now + rand(0, 400), power, side);
    }
  }

  /** Вьющаяся лента: вылетает преимущественно вбок, планирует. */
  function spawnSerpentine(now: number, power: number, side: 1 | -1) {
    const pair = SERPENTINE_PAIRS[(Math.random() * SERPENTINE_PAIRS.length) | 0];
    const angle = (side > 0 ? 0 : Math.PI) + rand(-0.7, 0.7); // ±~40° от горизонтали
    const speed = rand(0.08, 0.18) * power;
    parts.push({
      x: cx + rand(-14, 14),
      y: cy + rand(-10, 10),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed * 0.7,
      size: 0,
      color: pair[0],
      color2: pair[1],
      ribbon: false,
      circle: false,
      serpentine: true,
      rot: 0,
      vrot: 0,
      flip: rand(0, Math.PI * 2),
      vflip: rand(0.012, 0.022),
      born: now,
      life: rand(2000, 2800),
      segs: 12 + ((Math.random() * 5) | 0),
      amp: rand(3, 4),
      wave: rand(0.5, 0.65),
    });
  }

  const t0 = performance.now();
  const BURSTS = [
    { at: 560, count: 70, power: 1, serpentine: 4 },
    { at: 1180, count: 45, power: 0.75, serpentine: 4 },
  ];

  let fired = 0;
  let raf = 0;
  let prev = t0;

  const frame = (now: number) => {
    const t = now - t0;
    const dt = Math.min(now - prev, 50);
    prev = now;

    while (fired < BURSTS.length && t >= BURSTS[fired].at) {
      const b = BURSTS[fired];
      burst(t, b.count, b.power, b.serpentine);
      fired++;
    }

    ctx.clearRect(0, 0, w, h);

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      const age = t - p.born;
      if (age > p.life) {
        parts.splice(i, 1);
        continue;
      }
      if (age < 0) continue; // лента ещё ждёт свою задержку

      // у лент гравитация и сопротивление слабее — они планируют в стороны
      const drag = p.serpentine ? 0.9993 : 0.995;
      p.vy += (p.serpentine ? 0.00009 : 0.00028) * dt;
      p.vx *= Math.pow(drag, dt);
      p.vy *= Math.pow(drag, dt);
      p.x += (p.vx + Math.sin(p.flip) * 0.02) * dt; // порхание
      p.y += p.vy * dt + (p.serpentine ? Math.sin(p.flip * 1.6) * 0.012 * dt : 0);
      p.rot += p.vrot * dt;
      p.flip += p.vflip * dt;

      const alpha = Math.max(
        0,
        Math.min(Math.min(age / 80, 1), Math.min((p.life - age) / 350, 1))
      );
      // затухание у граней поля, чтобы частицы не обрезались визуально
      const EDGE = 26;
      const edgeAlpha = Math.max(
        0,
        Math.min(Math.min(p.x, w - p.x, p.y, h - p.y) / EDGE, 1)
      );

      ctx.save();
      ctx.globalAlpha = alpha * edgeAlpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.serpentine) {
        // крутящаяся полоса: чередование лицевой и обратной сторон (3D-завиток)
        ctx.rotate(Math.atan2(p.vy, p.vx));
        const SEG = p.segs ?? 14;
        const SEG_LEN = 3.4;
        const AMP = p.amp ?? 3.5;
        const WAVE = p.wave ?? 0.55;
        for (let s = 0; s < SEG; s++) {
          const tt = p.flip + s * WAVE;
          const face = Math.cos(tt);
          const ww = 3 * Math.abs(face) + 0.6;
          ctx.fillStyle = face > 0 ? p.color : (p.color2 ?? p.color);
          ctx.fillRect(
            -s * SEG_LEN - SEG_LEN / 2,
            Math.sin(tt) * AMP - ww / 2,
            SEG_LEN + 0.5,
            ww
          );
        }
      } else {
        ctx.fillStyle = p.color;
        if (p.ribbon) {
          // лента: кувыркается (ширина «дышит» по синусу)
          ctx.scale(Math.max(Math.abs(Math.sin(p.flip)), 0.15), 1);
          ctx.fillRect(-2, -p.size, 4, p.size * 2);
        } else if (p.circle) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.scale(Math.max(Math.abs(Math.sin(p.flip)), 0.2), 1);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        }
      }
      ctx.restore();
    }

    if (fired < BURSTS.length || parts.length > 0) {
      raf = requestAnimationFrame(frame);
    }
  };
  raf = requestAnimationFrame(frame);

  return () => cancelAnimationFrame(raf);
}

/**
 * 🥳 из логотипа: при загрузке страницы проигрывает анимацию
 * «смайл дважды дует в трубку» с разлётом конфетти и лент.
 * Срабатывает один раз на монтирование; при prefers-reduced-motion — без анимации.
 */
export function PartyEmoji() {
  const [play, setPlay] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = setTimeout(() => setPlay(true), 250);
    return () => clearTimeout(start);
  }, []);

  useEffect(() => {
    if (!play || !canvasRef.current) return;
    const stop = startConfetti(canvasRef.current);
    const done = setTimeout(() => setPlay(false), 5100);
    return () => {
      stop();
      clearTimeout(done);
    };
  }, [play]);

  return (
    <span className="party-root">
      <span
        className={play ? "party-emoji" : undefined}
        role="img"
        aria-label="EvSpace"
      >
        🥳
      </span>
      {play && (
        <span className="party-horn" aria-hidden="true">
          <span className="party-horn-paper" />
        </span>
      )}
      <span className="party-field" aria-hidden="true">
        <canvas ref={canvasRef} className="party-canvas" />
      </span>
    </span>
  );
}
