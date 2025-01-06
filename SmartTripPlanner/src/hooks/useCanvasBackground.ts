import { useEffect, useRef } from "react";

interface ParticleProps {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;
    update: () => void;
    draw: (ctx: CanvasRenderingContext2D) => void;
   }

   class Particle implements ParticleProps {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;
    canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
      this.canvas = canvas;
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1;
      this.speedX = Math.random() * 3 - 1.5;
      this.speedY = Math.random() * 3 - 1.5;
      this.color = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.size > 0.2) this.size -= 0.1;

      if (this.x > this.canvas.width || this.x < 0 ||
          this.y > this.canvas.height || this.y < 0 ||
          this.size <= 0.2) {
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.size = Math.random() * 3 + 1;
      }
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
   }

   export const useCanvasBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };

      resizeCanvas();

      const particles: Particle[] = [];
      const particleCount = 100;

      const init = () => {
        for (let i = 0; i < particleCount; i++) {
          particles.push(new Particle(canvas));
        }
      };

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
          particle.update();
          particle.draw(ctx);
        });
        requestAnimationFrame(animate);
      };

      init();
      animate();

      window.addEventListener('resize', resizeCanvas);

      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }, []);

    return canvasRef;
   };
