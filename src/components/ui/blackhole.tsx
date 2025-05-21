import React, { useEffect, useRef, useState } from "react";

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

interface Clip {
  disc?: Disc;
  i?: number;
  path?: Path2D;
}

interface State {
  discs: Disc[];
  lines: Point[][];
  clip: Clip;
  startDisc: Disc;
  endDisc: Disc;
  rect: { width: number; height: number };
  render: { width: number; height: number; dpi: number };
  linesCanvas?: HTMLCanvasElement;
}

interface BlackholeProps {
  className?: string;
  numberOfLines?: number;
  numberOfDiscs?: number;
}

export default function Blackhole({
  className,
  numberOfLines = 50,
  numberOfDiscs = 50,
  children,
}: React.PropsWithChildren<BlackholeProps>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number>(0);
  const [strokeColor, setStrokeColor] = useState("#9ca3af"); // Default light theme color (gray-400)
  const stateRef = useRef<State>({
    discs: [],
    lines: [],
    clip: {},
    startDisc: { p: 0, x: 0, y: 0, w: 0, h: 0 },
    endDisc: { p: 0, x: 0, y: 0, w: 0, h: 0 },
    rect: { width: 0, height: 0 },
    render: { width: 0, height: 0, dpi: 1 },
  });

  function linear(p: number) {
    return p;
  }

  function easeInExpo(p: number) {
    return p === 0 ? 0 : Math.pow(2, 10 * (p - 1));
  }

  function tweenValue(
    start: number,
    end: number,
    p: number,
    ease: "inExpo" | null = null
  ) {
    const delta = end - start;
    const easeFn = ease === "inExpo" ? easeInExpo : linear;
    return start + delta * easeFn(p);
  }

  function tweenDisc(disc: Disc) {
    const { startDisc, endDisc } = stateRef.current;
    disc.x = tweenValue(startDisc.x, endDisc.x, disc.p);
    disc.y = tweenValue(startDisc.y, endDisc.y, disc.p, "inExpo");
    disc.w = tweenValue(startDisc.w, endDisc.w, disc.p);
    disc.h = tweenValue(startDisc.h, endDisc.h, disc.p);
  }

  function setSize() {
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
  }

  function setDiscs() {
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
  }

  function moveDiscs() {
    stateRef.current.discs.forEach((disc: Disc) => {
      disc.p = (disc.p + 0.001) % 1;
      tweenDisc(disc);
    });
  }

  function drawDiscs(ctx: CanvasRenderingContext2D) {
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
  }

  function drawLines(ctx: CanvasRenderingContext2D) {
    if (
      stateRef.current.linesCanvas &&
      stateRef.current.linesCanvas.width > 0 &&
      stateRef.current.linesCanvas.height > 0
    ) {
      ctx.drawImage(stateRef.current.linesCanvas, 0, 0);
    }
  }

  // Update stroke color when theme changes
  function updateStrokeColor() {
    const isDark = document.documentElement.classList.contains("dark");
    setStrokeColor(isDark ? "#737373" : "#78716c"); // dark:gray-500 : stone-500
  }

  useEffect(() => {
    // Define functions inside useEffect to avoid dependency issues
    function setLines() {
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
    }

    function tick() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(stateRef.current.render.dpi, stateRef.current.render.dpi);
      moveDiscs();
      drawDiscs(ctx);
      drawLines(ctx);
      ctx.restore();
      animationFrameIdRef.current = requestAnimationFrame(tick);
    }

    function init() {
      setSize();
      setDiscs();
      setLines();
    }

    function handleResize() {
      setSize();
      setDiscs();
      setLines();
    }

    // Initialize
    updateStrokeColor();
    setSize();
    init();
    tick();

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          updateStrokeColor();
          setLines(); // Redraw lines with new color
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numberOfLines, numberOfDiscs, strokeColor]);

  return (
    <div
      data-slot="black-hole-background"
      className={`fixed inset-0 min-h-screen w-full -z-10 bg-gradient-to-b from-gray-200/95 to-gray-100/95 dark:from-gray-900 dark:to-black
        before:absolute before:left-1/2 before:top-1/2 before:block before:size-[140%] before:content-[''] before:[background:radial-gradient(ellipse_at_50%_55%,transparent_10%,rgb(250_247_234)_50%)] dark:before:[background:radial-gradient(ellipse_at_50%_55%,transparent_10%,black_50%)] before:[transform:translate3d(-50%,-50%,0)]
        ${className || ""}`}
    >
      {children}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block size-full opacity-20"
      />
    </div>
  );
}
