import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const ParticleCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const particlesRef = useRef<any[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Disable on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.imageSmoothingEnabled = false;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      
      const lastX = mouseRef.current.x || x;
      const lastY = mouseRef.current.y || y;
      
      const dist = Math.hypot(x - lastX, y - lastY);
      // More conservative interpolation to prevent CPU spikes
      const steps = Math.min(Math.floor(dist / 4), 6);
      
      for (let i = 0; i <= steps; i++) {
        const interpX = lastX + (x - lastX) * (i / steps);
        const interpY = lastY + (y - lastY) * (i / steps);
        particlesRef.current.push(new Particle(interpX, interpY));
      }
      
      // Keep particle count strictly low for stability
      if (particlesRef.current.length > 150) {
        particlesRef.current = particlesRef.current.slice(-150);
      }
      
      mouseRef.current.x = x;
      mouseRef.current.y = y;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const colors = [
      '59, 130, 246',   // Blue
      '56, 189, 248',   // Sky Blue
      '34, 211, 238',   // Cyan
      '251, 191, 36',   // Glowing Gold
      '255, 255, 255',  // Glowing White
    ];

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      colorBase: string;
      opacity: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 1.5 + 1;
        this.speedX = (Math.random() - 0.5) * 1.2;
        this.speedY = (Math.random() - 0.5) * 1.2;
        this.opacity = 1;
        this.colorBase = colors[Math.floor(Math.random() * colors.length)];
      }

      update(deltaTime: number) {
        const timeFactor = Math.min(deltaTime / 16.67, 3); // Cap timeFactor to prevent jumps
        this.x += this.speedX * timeFactor;
        this.y += this.speedY * timeFactor;
        if (this.size > 0.1) this.size -= 0.015 * timeFactor;
        this.opacity -= 0.01 * timeFactor; 
      }

      draw(context: CanvasRenderingContext2D) {
        const alpha = Math.max(0, this.opacity);
        
        // Single draw with shadow for smoother glow
        context.shadowBlur = 8;
        context.shadowColor = `rgba(${this.colorBase}, ${alpha})`;
        context.fillStyle = `rgba(${this.colorBase}, ${alpha})`;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0; // Reset shadow for performance
      }
    }

    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);
      
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Use a slightly faster clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        p.update(deltaTime);
        
        if (p.opacity <= 0 || p.size <= 0.1) {
          particlesRef.current.splice(i, 1);
          i--;
          continue;
        }
        
        p.draw(ctx);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ 
        zIndex: 999999,
        mixBlendMode: 'screen',
        background: 'transparent'
      }}
    />
  );
};

export default ParticleCursor;
