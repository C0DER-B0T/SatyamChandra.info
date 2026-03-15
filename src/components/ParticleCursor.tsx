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
      // Increased steps for a denser, smoother trail
      const steps = Math.min(Math.floor(dist / 2), 15);
      
      for (let i = 0; i <= steps; i++) {
        const interpX = lastX + (x - lastX) * (i / steps);
        const interpY = lastY + (y - lastY) * (i / steps);
        
        // Add particles with slight randomness for a more organic feel
        particlesRef.current.push(new Particle(interpX, interpY));
      }
      
      // Increased cap slightly for better visuals on fast movements
      if (particlesRef.current.length > 300) {
        particlesRef.current = particlesRef.current.slice(-300);
      }
      
      mouseRef.current.x = x;
      mouseRef.current.y = y;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Initial clear
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.opacity = 1;
        this.colorBase = colors[Math.floor(Math.random() * colors.length)];
      }

      update(deltaTime: number) {
        const timeFactor = deltaTime / 16.67; 
        this.x += this.speedX * timeFactor;
        this.y += this.speedY * timeFactor;
        if (this.size > 0.1) this.size -= 0.02 * timeFactor;
        this.opacity -= 0.012 * timeFactor; 
      }

      draw(context: CanvasRenderingContext2D) {
        const alpha = Math.max(0, this.opacity);
        // Core
        context.fillStyle = `rgba(${this.colorBase}, ${alpha})`;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
        
        // Mid Glow
        context.fillStyle = `rgba(${this.colorBase}, ${alpha * 0.4})`;
        context.beginPath();
        context.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
        context.fill();

        // Outer Glow
        context.fillStyle = `rgba(${this.colorBase}, ${alpha * 0.15})`;
        context.beginPath();
        context.arc(this.x, this.y, this.size * 5, 0, Math.PI * 2);
        context.fill();
      }
    }

    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);
      
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Force render if no particles for testing
      // ctx.fillStyle = 'red';
      // ctx.fillRect(10, 10, 50, 50);

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        p.update(deltaTime);
        p.draw(ctx);
        
        if (p.opacity <= 0) {
          particlesRef.current.splice(i, 1);
          i--;
        }
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
