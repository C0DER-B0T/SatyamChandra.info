import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  life: number;
}

const ParticleCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isAdminPath) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const createParticle = (x: number, y: number) => {
      const colorValue = Math.floor(Math.random() * 60) + 180; // Blue/Cyan/Mint range
      const particle: Particle = {
        x: x + (Math.random() - 0.5) * 8, // subtle starting spread
        y: y + (Math.random() - 0.5) * 8,
        size: Math.random() * 5 + 1.5, // slightly larger
        speedX: (Math.random() - 0.5) * 3, // wider spread
        speedY: (Math.random() - 0.5) * 3,
        color: `hsla(${colorValue}, 100%, 65%, 0.8)`, // brighter
        life: 1.0,
      };
      particles.current.push(particle);
    };

    const animate = () => {
      // Create at least one particle per frame at the current mouse position
      // so it looks alive even when the mouse is still.
      createParticle(mouse.current.x, mouse.current.y);
      
      // Use standard source-over to clear properly
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add additive blending for intense glow
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < particles.current.length; i++) {
        const p = particles.current[i];
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Add smooth friction
        p.speedX *= 0.95;
        p.speedY *= 0.95;
        
        // Slower decay for a longer trail
        p.life -= 0.015;

        if (p.life <= 0) {
          particles.current.splice(i, 1);
          i--;
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        const currentAlpha = 0.8 * p.life;
        // Make the glow pop smoothly
        ctx.fillStyle = p.color.replace('0.8)', `${currentAlpha})`);
        
        ctx.shadowBlur = 15 * p.life;
        ctx.shadowColor = p.color.replace('0.8)', `${currentAlpha})`);
        
        ctx.fill();
        
        // Reset shadow to not mess up next draw commands unpredictably
        ctx.shadowBlur = 0;
      }

      requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX;
      const newY = e.clientY;
      
      const dx = newX - mouse.current.x;
      const dy = newY - mouse.current.y;
      
      // If we jumped a far distance, interpolate and fill the gap for super smooth trails
      const distance = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(Math.floor(distance / 5), 1);
      
      for (let i = 0; i < steps; i++) {
        const interpX = mouse.current.x + (dx * i) / steps;
        const interpY = mouse.current.y + (dy * i) / steps;
        // spawn 3 particles per step
        for (let j = 0; j < 3; j++) {
          createParticle(interpX, interpY);
        }
      }
      
      mouse.current.x = newX;
      mouse.current.y = newY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    const animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [isAdminPath]);

  if (isAdminPath) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default ParticleCursor;
