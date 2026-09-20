import { useState, useMemo } from 'react';
import { CheckCircle2, XCircle, Circle, Square, Triangle } from 'lucide-react';

interface ShapeMatchProps {
  onComplete: (score: number) => void;
  onCancel: () => void;
}

type ShapeKey = 'circle' | 'square' | 'triangle' | 'rectangle';

const SHAPES: { key: ShapeKey; label: string; color: string }[] = [
  { key: 'circle', label: 'Circle', color: '#2563eb' },
  { key: 'square', label: 'Square', color: '#16a34a' },
  { key: 'triangle', label: 'Triangle', color: '#db2777' },
  { key: 'rectangle', label: 'Rectangle', color: '#ea580c' },
];

const TOTAL_ROUNDS = 5;

interface Round {
  prompt: string;
  answer: ShapeKey;
  options: ShapeKey[];
}

function buildRound(): Round {
  const shuffled = [...SHAPES].sort(() => Math.random() - 0.5);
  const answer = shuffled[0];
  const options = shuffled.slice(0, 4).map((s) => s.key);
  return {
    prompt: `Find the ${answer.label}!`,
    answer: answer.key,
    options,
  };
}

function ShapeIcon({ shape, color, size = 48 }: { shape: ShapeKey; color: string; size?: number }) {
  const common = { size, color, strokeWidth: 2, fill: `${color}30` };
  switch (shape) {
    case 'circle':
      return <Circle {...common} />;
    case 'square':
      return <Square {...common} />;
    case 'triangle':
      return <Triangle {...common} />;
    case 'rectangle':
      return <div style={{ width: size * 1.4, height: size * 0.7, backgroundColor: `${color}30`, borderColor: color, borderWidth: 2, borderStyle: 'solid', borderRadius: 4 }} />;
  }
}

export function ShapeMatchActivity({ onComplete, onCancel }: ShapeMatchProps) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [selected, setSelected] = useState<ShapeKey | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const rounds = useMemo(
    () => Array.from({ length: TOTAL_ROUNDS }, () => buildRound()),
    []
  );
  const round = rounds[roundIdx];

  function handleSelect(opt: ShapeKey) {
    if (selected) return;
    setSelected(opt);
    if (opt === round.answer) setCorrectCount((c) => c + 1);

    setTimeout(() => {
      if (roundIdx + 1 >= TOTAL_ROUNDS) {
        const score = Math.round(((correctCount + (opt === round.answer ? 1 : 0)) / TOTAL_ROUNDS) * 100);
        onComplete(Math.max(50, score));
      } else {
        setRoundIdx((i) => i + 1);
        setSelected(null);
      }
    }, 1000);
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="text-xs text-slate-400">
        Round {roundIdx + 1} of {TOTAL_ROUNDS}
      </div>

      <p className="text-lg font-bold font-display text-slate-700">{round.prompt}</p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {round.options.map((opt) => {
          const shape = SHAPES.find((s) => s.key === opt)!;
          const isAnswer = opt === round.answer;
          const isSelected = opt === selected;
          const showResult = selected !== null;

          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={showResult}
              className={`relative flex items-center justify-center py-6 rounded-2xl border-2 transition-all ${
                showResult
                  ? isAnswer
                    ? 'border-brand-400 bg-brand-50'
                    : isSelected
                      ? 'border-red-300 bg-red-50'
                      : 'border-slate-100 bg-slate-50 opacity-50'
                  : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/40 hover:shadow-md active:scale-95'
              }`}
            >
              <ShapeIcon shape={opt} color={shape.color} />
              {showResult && isAnswer && (
                <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-brand-500" />
              )}
              {showResult && isSelected && !isAnswer && (
                <XCircle className="absolute top-2 right-2 w-5 h-5 text-red-400" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 w-full">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors text-sm"
        >
          Exit
        </button>
      </div>
    </div>
  );
}
