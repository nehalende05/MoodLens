import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

export function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      const numStars = Math.floor((canvas.width * canvas.height) / 3000);
      starsRef.current = [];

      for (let i = 0; i < numStars; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    const drawMoon = (ctx: CanvasRenderingContext2D) => {
      const moonX = canvas.width - 120;
      const moonY = 100;
      const moonRadius = 50;

      const gradient = ctx.createRadialGradient(
        moonX - 10,
        moonY - 10,
        0,
        moonX,
        moonY,
        moonRadius
      );
      gradient.addColorStop(0, "rgba(255, 255, 240, 1)");
      gradient.addColorStop(0.5, "rgba(255, 255, 220, 0.9)");
      gradient.addColorStop(1, "rgba(200, 200, 180, 0.3)");

      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius + 20, 0, Math.PI * 2);
      const glowGradient = ctx.createRadialGradient(
        moonX,
        moonY,
        moonRadius,
        moonX,
        moonY,
        moonRadius + 40
      );
      glowGradient.addColorStop(0, "rgba(255, 255, 220, 0.3)");
      glowGradient.addColorStop(1, "rgba(255, 255, 220, 0)");
      ctx.fillStyle = glowGradient;
      ctx.fill();

      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(moonX - 15, moonY - 10, 8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(180, 180, 160, 0.5)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(moonX + 10, moonY + 15, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(moonX + 20, moonY - 5, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, "hsl(230, 25%, 6%)");
      bgGradient.addColorStop(0.3, "hsl(240, 30%, 10%)");
      bgGradient.addColorStop(0.6, "hsl(260, 35%, 12%)");
      bgGradient.addColorStop(1, "hsl(230, 25%, 8%)");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach((star) => {
        const twinkle =
          Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.5 + 0.5;
        const currentOpacity = star.opacity * (0.5 + twinkle * 0.5);

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.fill();

        if (star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          const starGlow = ctx.createRadialGradient(
            star.x,
            star.y,
            0,
            star.x,
            star.y,
            star.size * 3
          );
          starGlow.addColorStop(0, `rgba(180, 180, 255, ${currentOpacity * 0.3})`);
          starGlow.addColorStop(1, "rgba(180, 180, 255, 0)");
          ctx.fillStyle = starGlow;
          ctx.fill();
        }
      });

      drawMoon(ctx);

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      data-testid="starry-background"
    />
  );
}
