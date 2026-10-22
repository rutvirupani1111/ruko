/**
 * A tiny canvas confetti burst for good runs. Brand colours, about 1.6 s,
 * removed afterwards. Skipped entirely with prefers-reduced-motion.
 */
const COLORS = ['#FF7A1A', '#4F46E5', '#10B981', '#F59E0B', '#FBF8F2', '#E11D48'];

export function burstConfetti(origin?: { x: number; y: number }) {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, { position: 'fixed', inset: '0', width: `${w}px`, height: `${h}px`, pointerEvents: 'none', zIndex: '70' });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }
  ctx.scale(dpr, dpr);

  const ox = origin?.x ?? w / 2;
  const oy = origin?.y ?? h * 0.35;
  const count = w < 500 ? 90 : 140;
  const parts = Array.from({ length: count }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
    const speed = 7 + Math.random() * 9;
    return {
      x: ox,
      y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 5 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      bar: Math.random() < 0.45,
    };
  });

  const start = performance.now();
  const duration = 1700;
  const frame = (now: number) => {
    const t = now - start;
    ctx.clearRect(0, 0, w, h);
    const fade = t > duration - 400 ? Math.max(0, (duration - t) / 400) : 1;
    for (const p of parts) {
      p.vy += 0.32;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      // Some pieces are little "pause bars", the Ruko mark.
      if (p.bar) {
        ctx.fillRect(-p.size * 0.5, -p.size * 0.9, p.size * 0.38, p.size * 1.8);
        ctx.fillRect(p.size * 0.12, -p.size * 0.9, p.size * 0.38, p.size * 1.8);
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    }
    if (t < duration) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}
