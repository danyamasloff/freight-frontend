import React, { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Disc {
  p: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Point {
  x: number;
  y: number;
}

interface Particle {
  x: number;
  sx: number;
  dx: number;
  y: number;
  vy: number;
  p: number;
  r: number;
  c: string;
}

interface Clip {
  disc?: Disc;
  i?: number;
  path?: Path2D;
}

interface State {
  discs: Disc[];
  lines: Point[][];
  particles: Particle[];
  clip: Clip;
  startDisc: Disc;
  endDisc: Disc;
  rect: { width: number; height: number };
  render: { width: number; height: number; dpi: number };
  particleArea: {
    sw?: number;
    ew?: number;
    h?: number;
    sx?: number;
    ex?: number;
  };
  linesCanvas?: HTMLCanvasElement;
}

interface BlackholeProps {
  className?: string;
  strokeColor?: string;
  numberOfLines?: number;
  numberOfDiscs?: number;
  particleRGBColor?: [number, number, number];
}

const Blackhole: React.FC<React.PropsWithChildren<BlackholeProps>> = ({
                                                                        children,
                                                                        className,
                                                                        strokeColor = "#1e40af", // Темно-синий цвет по умолчанию
                                                                        numberOfLines = 50,
                                                                        numberOfDiscs = 50,
                                                                        particleRGBColor = [30, 64, 175], // Темно-синие частицы
                                                                      }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number>(0);
  const stateRef = useRef<State>({
    discs: [],
    lines: [],
    particles: [],
    clip: {},
    startDisc: { p: 0, x: 0, y: 0, w: 0, h: 0 },
    endDisc: { p: 0, x: 0, y: 0, w: 0, h: 0 },
    rect: { width: 0, height: 0 },
    render: { width: 0, height: 0, dpi: 1 },
    particleArea: {},
  });

  const easeInExpo = (p: number): number => (p === 0 ? 0 : Math.pow(2, 10 * (p - 1)));

  const tweenValue = (
      start: number,
      end: number,
      p: number,
      ease: boolean = false
  ): number => {
    const delta = end - start;
    const easeFn = ease ? easeInExpo : (x: number) => x;
    return start + delta * easeFn(p);
  };

  const tweenDisc = (disc: Disc): void => {
    const { startDisc, endDisc } = stateRef.current;
    disc.x = tweenValue(startDisc.x, endDisc.x, disc.p);
    disc.y = tweenValue(startDisc.y, endDisc.y, disc.p, true);
    disc.w = tweenValue(startDisc.w, endDisc.w, disc.p);
    disc.h = tweenValue(startDisc.h, endDisc.h, disc.p);
  };

  const setSize = useCallback((): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    stateRef.current.rect = { width: rect.width, height: rect.height };
    stateRef.current.render = {
      width: rect.width,
      height: rect.height,
      dpi: window.devicePixelRatio || 1,
    };

    canvas.width = stateRef.current.render.width * stateRef.current.render.dpi;
    canvas.height = stateRef.current.render.height * stateRef.current.render.dpi;
  }, []);

  const setDiscs = useCallback((): void => {
    const { width, height } = stateRef.current.rect;
    if (width <= 0 || height <= 0) return;

    stateRef.current.discs = [];
    stateRef.current.startDisc = {
      p: 0,
      x: width * 0.5,
      y: height * 0.45,
      w: width * 0.75,
      h: height * 0.7,
    };
    stateRef.current.endDisc = {
      p: 0,
      x: width * 0.5,
      y: height * 0.95,
      w: 0,
      h: 0,
    };

    let prevBottom = height;
    stateRef.current.clip = {};

    for (let i = 0; i < numberOfDiscs; i++) {
      const p = i / numberOfDiscs;
      const disc = { p, x: 0, y: 0, w: 0, h: 0 };
      tweenDisc(disc);
      const bottom = disc.y + disc.h;
      if (bottom <= prevBottom) {
        stateRef.current.clip = { disc: { ...disc }, i };
      }
      prevBottom = bottom;
      stateRef.current.discs.push(disc);
    }

    if (stateRef.current.clip.disc) {
      const clipPath = new Path2D();
      const disc = stateRef.current.clip.disc;
      clipPath.ellipse(disc.x, disc.y, disc.w, disc.h, 0, 0, Math.PI * 2);
      clipPath.rect(disc.x - disc.w, 0, disc.w * 2, disc.y);
      stateRef.current.clip.path = clipPath;
    }
  }, [numberOfDiscs]);

  const setLines = useCallback((): void => {
    const { width, height } = stateRef.current.rect;
    if (width <= 0 || height <= 0) return;

    stateRef.current.lines = [];
    const linesAngle = (Math.PI * 2) / numberOfLines;
    for (let i = 0; i < numberOfLines; i++) {
      stateRef.current.lines.push([]);
    }

    stateRef.current.discs.forEach((disc: Disc) => {
      for (let i = 0; i < numberOfLines; i++) {
        const angle = i * linesAngle;
        const p = {
          x: disc.x + Math.cos(angle) * disc.w,
          y: disc.y + Math.sin(angle) * disc.h,
        };
        stateRef.current.lines[i].push(p);
      }
    });

    const offCanvas = document.createElement("canvas");
    offCanvas.width = Math.max(1, width);
    offCanvas.height = Math.max(1, height);

    const ctx = offCanvas.getContext("2d");
    if (!ctx || !stateRef.current.clip.path) {
      stateRef.current.linesCanvas = undefined;
      return;
    }

    ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);

    stateRef.current.lines.forEach((line: Point[]) => {
      ctx.save();
      let lineIsIn = false;
      line.forEach((p1: Point, j: number) => {
        if (j === 0) return;
        const p0 = line[j - 1];
        if (
            !lineIsIn &&
            (ctx.isPointInPath(stateRef.current.clip.path!, p1.x, p1.y) ||
                ctx.isPointInStroke(stateRef.current.clip.path!, p1.x, p1.y))
        ) {
          lineIsIn = true;
        } else if (lineIsIn) {
          ctx.clip(stateRef.current.clip.path!);
        }
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
      });
      ctx.restore();
    });
    stateRef.current.linesCanvas = offCanvas;
  }, [numberOfLines, strokeColor]);

  const initParticle = (start: boolean = false): Particle => {
    const sx =
        (stateRef.current.particleArea.sx || 0) +
        (stateRef.current.particleArea.sw || 0) * Math.random();
    const ex =
        (stateRef.current.particleArea.ex || 0) +
        (stateRef.current.particleArea.ew || 0) * Math.random();
    const dx = ex - sx;
    const y = start
        ? (stateRef.current.particleArea.h || 0) * Math.random()
        : stateRef.current.particleArea.h || 0;
    const r = 0.5 + Math.random() * 4;
    const vy = 0.5 + Math.random();
    return {
      x: sx,
      sx,
      dx,
      y,
      vy,
      p: 0,
      r,
      c: `rgba(${particleRGBColor[0]}, ${particleRGBColor[1]}, ${particleRGBColor[2]}, ${Math.random()})`,
    };
  };

  const setParticles = useCallback((): void => {
    const { width, height } = stateRef.current.rect;
    stateRef.current.particles = [];
    const disc = stateRef.current.clip.disc;
    if (!disc) return;

    stateRef.current.particleArea = {
      sw: disc.w * 0.5,
      ew: disc.w * 2,
      h: height * 0.85,
    };
    stateRef.current.particleArea.sx = (width - (stateRef.current.particleArea.sw || 0)) / 2;
    stateRef.current.particleArea.ex = (width - (stateRef.current.particleArea.ew || 0)) / 2;

    const totalParticles = 100;
    for (let i = 0; i < totalParticles; i++) {
      stateRef.current.particles.push(initParticle(true));
    }
  }, [particleRGBColor]);

  const drawDiscs = (ctx: CanvasRenderingContext2D): void => {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    const outerDisc = stateRef.current.startDisc;
    ctx.beginPath();
    ctx.ellipse(outerDisc.x, outerDisc.y, outerDisc.w, outerDisc.h, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();

    stateRef.current.discs.forEach((disc: Disc, i: number) => {
      if (i % 5 !== 0) return;
      if (disc.w < (stateRef.current.clip.disc?.w || 0) - 5) {
        ctx.save();
        ctx.clip(stateRef.current.clip.path!);
      }
      ctx.beginPath();
      ctx.ellipse(disc.x, disc.y, disc.w, disc.h, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
      if (disc.w < (stateRef.current.clip.disc?.w || 0) - 5) {
        ctx.restore();
      }
    });
  };

  const drawLines = (ctx: CanvasRenderingContext2D): void => {
    if (
        stateRef.current.linesCanvas &&
        stateRef.current.linesCanvas.width > 0 &&
        stateRef.current.linesCanvas.height > 0
    ) {
      ctx.drawImage(stateRef.current.linesCanvas, 0, 0);
    }
  };

  const drawParticles = (ctx: CanvasRenderingContext2D): void => {
    if (!stateRef.current.clip.path) return;
    ctx.save();
    ctx.clip(stateRef.current.clip.path);
    stateRef.current.particles.forEach((particle: Particle) => {
      ctx.fillStyle = particle.c;
      ctx.beginPath();
      ctx.rect(particle.x, particle.y, particle.r, particle.r);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  };

  const moveDiscs = (): void => {
    stateRef.current.discs.forEach((disc: Disc) => {
      disc.p = (disc.p + 0.001) % 1;
      tweenDisc(disc);
    });
  };

  const moveParticles = (): void => {
    stateRef.current.particles.forEach((particle: Particle, idx: number) => {
      particle.p = 1 - particle.y / (stateRef.current.particleArea.h || 1);
      particle.x = particle.sx + particle.dx * particle.p;
      particle.y -= particle.vy;
      if (particle.y < 0) {
        stateRef.current.particles[idx] = initParticle();
      }
    });
  };

  const tick = useCallback((): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(stateRef.current.render.dpi, stateRef.current.render.dpi);

    moveDiscs();
    moveParticles();
    drawDiscs(ctx);
    drawLines(ctx);
    drawParticles(ctx);

    ctx.restore();
    animationFrameIdRef.current = requestAnimationFrame(tick);
  }, [strokeColor]);

  const init = useCallback((): void => {
    setSize();
    setDiscs();
    setLines();
    setParticles();
  }, [setSize, setDiscs, setLines, setParticles]);

  const handleResize = useCallback((): void => {
    init();
  }, [init]);

  useEffect(() => {
    init();
    tick();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [init, tick, handleResize]);

  return (
      <div
          className={cn(
              // Фиксированный фон без блокировки взаимодействия
              "fixed inset-0 -z-50 pointer-events-none",
              // Base gradient overlay с темно-синим оттенком
              "before:absolute before:left-1/2 before:top-1/2 before:block before:size-[140%] before:content-['']",
              "before:[background:radial-gradient(ellipse_at_50%_55%,transparent_10%,rgba(30,64,175,0.1)_50%)]",
              "before:[transform:translate3d(-50%,-50%,0)]",
              "dark:before:[background:radial-gradient(ellipse_at_50%_55%,transparent_10%,rgba(30,64,175,0.2)_50%)]",
              // Color overlay с синим акцентом
              "after:absolute after:left-1/2 after:top-1/2 after:z-[5] after:block after:size-full",
              "after:mix-blend-overlay after:content-['']",
              "after:[background:radial-gradient(ellipse_at_50%_75%,rgba(59,130,246,0.3)_20%,transparent_75%)]",
              "after:[transform:translate3d(-50%,-50%,0)]",
              className
          )}
      >
        <canvas
            ref={canvasRef}
            className="absolute inset-0 block size-full opacity-15 dark:opacity-25"
            aria-hidden="true"
        />

        {/* Animated gradient beam с синими оттенками */}
        <div className="absolute left-1/2 top-[-71.5%] z-[3] h-[140%] w-[30%] rounded-b-full opacity-60 mix-blend-plus-darker blur-3xl [background-position:0%_100%] [background-size:100%_200%] [transform:translate3d(-50%,0,0)] dark:mix-blend-plus-lighter [background:linear-gradient(20deg,#1e40af,#3b82f640_16.5%,#60a5fa_33%,#60a5fa40_49.5%,#1e40af_66%,#1e40af80_85.5%,#3b82f6_100%)_0_100%_/_100%_200%] dark:[background:linear-gradient(20deg,#1e40af,#3b82f620_16.5%,#60a5fa_33%,#60a5fa20_49.5%,#1e40af_66%,#1e40af60_85.5%,#3b82f6_100%)_0_100%_/_100%_200%] animate-[backgroundPosition_5s_linear_infinite]" />

        {/* Overlay texture */}
        <div className="absolute left-0 top-0 z-[7] size-full opacity-30 mix-blend-overlay dark:[background:repeating-linear-gradient(transparent,transparent_1px,rgba(30,64,175,0.1)_1px,rgba(30,64,175,0.1)_2px)]" />

        {/* Контент поверх фона */}
        <div className="relative z-10 pointer-events-auto">
          {children}
        </div>
      </div>
  );
};

export default Blackhole;