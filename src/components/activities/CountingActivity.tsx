import { useState, useMemo } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface CountingProps {
  onComplete: (score: number) => void;
  onCancel: () => void;
  mode: 'count' | 'add';
}

const TOTAL_ROUNDS = 5;

interface Round {
  prompt: string;
  emoji: string;
  count: number;
  addA?: number;
  addB?: number;
  options: number[];
  answer: number;
}

function buildRound(mode: 'count' | 'add'): Round {
  if (mode === 'add') {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    const answer = a + b;
    const options = [answer, answer + 1, answer - 1, answer + 2]
      .filter((v, i, arr) => v > 0 && arr.indexOf(v) === i)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    if (!options.includes(answer)) options[0] = answer;
    return {
      prompt: `How many apples altogether?`,
      emoji: 'apple',
      count: answer,
      addA: a,
      addB: b,
      options: options.sort(() => Math.random() - 0.5),
      answer,
    };
  }
  // count mode
  const emojis = ['apple', 'star', 'ball', 'fish'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const count = Math.floor(Math.random() * 15) + 1;
  const options = [count, count + 1, count - 1, count + 2]
    .filter((v, i, arr) => v > 0 && arr.indexOf(v) === i)
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);
  if (!options.includes(count)) options[0] = count;
  return {
    prompt: 'How many do you see?',
    emoji,
    count,
    options: options.sort(() => Math.random() - 0.5),
    answer: count,
  };
}

const EMOJI_MAP: Record<string, string> = {
  apple: '\u{1F34E}',
  star: '\u{2B50}',
  ball: '\u{26BD}',
  fish: '\u{1F41F}',
};

export function CountingActivity({ onComplete, onCancel, mode }: CountingProps) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const rounds = useMemo(
    () => Array.from({ length: TOTAL_ROUNDS }, () => buildRound(mode)),
    [mode]
  );
  const round = rounds[roundIdx];

  function handleSelect(opt: number) {
    if (selected !== null) return;
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

  const emojiChar = EMOJI_MAP[round.emoji] ?? '\u{2B50}';

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="text-xs text-slate-400">
        Round {roundIdx + 1} of {TOTAL_ROUNDS}
      </div>

      <p className="text-sm font-semibold text-slate-600">{round.prompt}</p>

      {mode === 'add' && round.addA !== undefined && round.addB !== undefined ? (
        <div className="flex items-center gap-3 text-2xl">
          <span className="text-4xl">{emojiChar.repeat(round.addA)}</span>
          <span className="text-3xl font-bold text-slate-400">+</span>
          <span className="text-4xl">{emojiChar.repeat(round.addB)}</span>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-1 max-w-xs py-2">
          {Array.from({ length: round.count }).map((_, i) => (
            <span key={i} className="text-3xl animate-pop" style={{ animationDelay: `${i * 50}ms` }}>
              {emojiChar}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {round.options.map((opt) => {
          const isAnswer = opt === round.answer;
          const isSelected = opt === selected;
          const showResult = selected !== null;

          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={showResult}
              className={`relative flex items-center justify-center py-5 rounded-2xl border-2 text-2xl font-bold font-display transition-all ${
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
