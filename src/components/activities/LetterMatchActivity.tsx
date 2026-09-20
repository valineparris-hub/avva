import { useState, useMemo } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface LetterMatchProps {
  onComplete: (score: number) => void;
  onCancel: () => void;
  mode: 'uppercase' | 'lowercase' | 'sound';
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const SOUNDS: Record<string, string> = {
  A: 'ay', B: 'bee', C: 'see', D: 'dee', E: 'ee', F: 'ef',
  G: 'jee', H: 'aitch', I: 'eye', J: 'jay', K: 'kay', L: 'el',
  M: 'em', N: 'en', O: 'oh', P: 'pee', Q: 'cue', R: 'ar',
  S: 'ess', T: 'tee', U: 'you', V: 'vee', W: 'double-you',
  X: 'eks', Y: 'why', Z: 'zee',
};

interface Round {
  prompt: string;
  promptLabel: string;
  options: string[];
  answer: string;
}

function buildRound(mode: 'uppercase' | 'lowercase' | 'sound', roundIdx: number): Round {
  const letters = [...LETTERS].sort(() => Math.random() - 0.5);
  const answer = letters[0];
  const distractors = letters.slice(1, 4);
  const options = [answer, ...distractors].sort(() => Math.random() - 0.5);

  if (mode === 'uppercase') {
    return { prompt: answer, promptLabel: 'Find this letter:', options, answer };
  }
  if (mode === 'lowercase') {
    return {
      prompt: answer.toLowerCase(),
      promptLabel: 'Find the uppercase match:',
      options: options.map((o) => o.toUpperCase()),
      answer: answer.toUpperCase(),
    };
  }
  // sound mode
  return {
    prompt: SOUNDS[answer] ?? answer.toLowerCase(),
    promptLabel: 'Which letter makes this sound?',
    options,
    answer,
  };
}

const TOTAL_ROUNDS = 5;

export function LetterMatchActivity({ onComplete, onCancel, mode }: LetterMatchProps) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const rounds = useMemo(
    () => Array.from({ length: TOTAL_ROUNDS }, (_, i) => buildRound(mode, i)),
    [mode]
  );
  const round = rounds[roundIdx];

  function handleSelect(opt: string) {
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

      <div className="text-center">
        <p className="text-sm text-slate-500 mb-2">{round.promptLabel}</p>
        <div className="text-6xl font-bold font-display text-slate-800 py-3">
          {round.prompt}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {round.options.map((opt) => {
          const isAnswer = opt === round.answer;
          const isSelected = opt === selected;
          const showResult = selected !== null;

          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={showResult}
              className={`relative flex items-center justify-center py-6 rounded-2xl border-2 text-3xl font-bold font-display transition-all ${
                showResult
                  ? isAnswer
                    ? 'border-brand-400 bg-brand-50 text-brand-700'
                    : isSelected
                      ? 'border-red-300 bg-red-50 text-red-600'
                      : 'border-slate-100 bg-slate-50 text-slate-300'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50/40 hover:shadow-md active:scale-95'
              }`}
            >
              {opt}
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
