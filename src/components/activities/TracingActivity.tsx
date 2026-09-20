import { useState, useRef, useCallback, useEffect } from 'react';

interface TracingModuleProps {
  onComplete: (score: number) => void;
  onCancel: () => void;
  letter: string;
}

export function TracingActivity({ onComplete, onCancel, letter }: TracingModuleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#0d9488';
  }, []);

  const getPos = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  function startDraw(e: React.PointerEvent) {
    e.preventDefault();
    setDrawing(true);
    setStrokeCount((s) => s + 1);
    lastPoint.current = getPos(e);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function draw(e: React.PointerEvent) {
    if (!drawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !lastPoint.current) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPoint.current = pos;
    setHasDrawn(true);
  }

  function stopDraw() {
    setDrawing(false);
    lastPoint.current = null;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasDrawn(false);
    setStrokeCount(0);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-slate-500 text-center">
        Trace the letter <span className="font-bold text-slate-700">{letter}</span> with your finger or stylus. Try to stay on the guide!
      </p>

      <div className="relative w-full max-w-xs aspect-square bg-slate-50 rounded-2xl border-2 border-slate-200 overflow-hidden">
        <span
          className="absolute inset-0 flex items-center justify-center font-display text-[10rem] leading-none text-slate-200 select-none pointer-events-none"
          aria-hidden
        >
          {letter}
        </span>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={stopDraw}
          onPointerLeave={stopDraw}
          onPointerCancel={stopDraw}
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        {strokeCount > 0 && <span>{strokeCount} stroke{strokeCount > 1 ? 's' : ''} drawn</span>}
      </div>

      <div className="flex gap-3 w-full">
        <button
          onClick={clearCanvas}
          className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors text-sm"
        >
          Clear
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors text-sm"
        >
          Exit
        </button>
        <button
          onClick={() => onComplete(Math.min(100, 60 + strokeCount * 10))}
          disabled={!hasDrawn}
          className="flex-[2] px-4 py-2.5 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Tracing
        </button>
      </div>
    </div>
  );
}
