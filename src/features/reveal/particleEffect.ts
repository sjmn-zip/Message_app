/**
 * Zero-dependency Burst Particle Engine
 *
 * Emits vibrant particles (stars, hearts, circles, confetti ribbons)
 * when TechNyong's cheer gauge hits 100%.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  scale: number;
  color: string;
  shape: 'star' | 'circle' | 'heart' | 'ribbon';
  alpha: number;
  decay: number;
}

const COLORS = [
  '#22c55e', // Dragon Green
  '#15803d', // Dark Emerald
  '#facc15', // Gold
  '#fbbf24', // Amber
  '#ef4444', // Heart Red
  '#ec4899', // Pink
  '#38bdf8'  // Sky Blue
];

export function triggerBurstParticles(canvas: HTMLCanvasElement, originX?: number, originY?: number): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio;
  canvas.height = rect.height * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const startX = originX ?? rect.width / 2;
  const startY = originY ?? rect.height / 2;

  const particles: Particle[] = [];
  const count = 70;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const speed = 4 + Math.random() * 8;
    const shapes: ('star' | 'circle' | 'heart' | 'ribbon')[] = ['star', 'circle', 'heart', 'ribbon'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    particles.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.5, // slight upward boost
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 12,
      scale: 0.8 + Math.random() * 1.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape,
      alpha: 1.0,
      decay: 0.015 + Math.random() * 0.015
    });
  }

  function drawStar(c: CanvasRenderingContext2D, size: number) {
    c.beginPath();
    for (let i = 0; i < 5; i++) {
      c.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * size, -Math.sin(((18 + i * 72) * Math.PI) / 180) * size);
      c.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * (size / 2), -Math.sin(((54 + i * 72) * Math.PI) / 180) * (size / 2));
    }
    c.closePath();
    c.fill();
  }

  function drawHeart(c: CanvasRenderingContext2D, size: number) {
    c.beginPath();
    const d = size * 0.6;
    c.moveTo(0, d / 3);
    c.bezierCurveTo(d, -d, d * 1.8, d / 3, 0, d * 1.6);
    c.bezierCurveTo(-d * 1.8, d / 3, -d, -d, 0, d / 3);
    c.fill();
  }

  let rafId: number;

  function render() {
    ctx!.clearRect(0, 0, rect.width, rect.height);
    let activeCount = 0;

    for (const p of particles) {
      if (p.alpha <= 0) continue;
      activeCount++;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // gravity
      p.vx *= 0.98; // air resistance
      p.rotation += p.vRot;
      p.alpha -= p.decay;

      ctx!.save();
      ctx!.globalAlpha = Math.max(0, p.alpha);
      ctx!.translate(p.x, p.y);
      ctx!.rotate((p.rotation * Math.PI) / 180);
      ctx!.scale(p.scale, p.scale);
      ctx!.fillStyle = p.color;

      if (p.shape === 'star') {
        drawStar(ctx!, 7);
      } else if (p.shape === 'heart') {
        drawHeart(ctx!, 6);
      } else if (p.shape === 'ribbon') {
        ctx!.fillRect(-5, -2, 10, 4);
      } else {
        ctx!.beginPath();
        ctx!.arc(0, 0, 4, 0, Math.PI * 2);
        ctx!.fill();
      }

      ctx!.restore();
    }

    if (activeCount > 0) {
      rafId = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(rafId);
      ctx!.clearRect(0, 0, rect.width, rect.height);
    }
  }

  render();
}
