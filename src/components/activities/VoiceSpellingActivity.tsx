import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Volume2, CheckCircle2, XCircle } from 'lucide-react';

interface VoiceSpellingProps {
  onComplete: (score: number) => void;
  onCancel: () => void;
  words: string[];
}

type Phase = 'idle' | 'listening' | 'result';

export function VoiceSpellingActivity({ onComplete, onCancel, words }: VoiceSpellingProps) {
  const [wordIdx, setWordIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [heard, setHeard] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const recognitionRef = useRef<any>(null);

  const currentWord = words[wordIdx] ?? words[0];

  const speak = useCallback((text: string) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    } catch {
      // speech synthesis not available
    }
  }, []);

  useEffect(() => {
    return () => {
      try {
        speechSynthesis.cancel();
      } catch {
        // ignore
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
    };
  }, []);

  function startListening() {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      // fallback: manual confirm
      setHeard(currentWord);
      setPhase('result');
      return;
    }

    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognitionRef.current = recognition;

    recognition.onstart = () => setPhase('listening');
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim().toLowerCase();
      setHeard(transcript);
      const isCorrect = transcript === currentWord.toLowerCase() ||
        event.results[0].alternative?.some?.(
          (a: any) => a.transcript.trim().toLowerCase() === currentWord.toLowerCase()
        );
      if (isCorrect) setCorrectCount((c) => c + 1);
      setPhase('result');
    };
    recognition.onerror = () => {
      setPhase('idle');
    };
    recognition.onend = () => {
      if (phase !== 'result') setPhase('result');
    };

    try {
      recognition.start();
    } catch {
      setPhase('idle');
    }
  }

  function nextWord() {
    if (wordIdx + 1 >= words.length) {
      const score = Math.round((correctCount / words.length) * 100);
      onComplete(Math.max(50, score));
    } else {
      setWordIdx((i) => i + 1);
      setPhase('idle');
      setHeard('');
    }
  }

  const isCorrect = heard.toLowerCase() === currentWord.toLowerCase();

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="text-xs text-slate-400">
        Word {wordIdx + 1} of {words.length}
      </div>

      <div className="text-center">
        <p className="text-sm text-slate-500 mb-2">Look at this word and say it out loud:</p>
        <div className="text-5xl font-bold font-display text-slate-800 py-4">{currentWord}</div>
        <button
          onClick={() => speak(currentWord)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ocean-50 text-ocean-600 rounded-xl font-semibold text-sm hover:bg-ocean-100 transition-colors"
        >
          <Volume2 className="w-4 h-4" /> Hear it
        </button>
      </div>

      {phase === 'idle' && (
        <button
          onClick={startListening}
          className="flex items-center gap-3 px-6 py-3 bg-brand-600 text-white rounded-2xl font-semibold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20"
        >
          <Mic className="w-5 h-5" /> Tap to Speak
        </button>
      )}

      {phase === 'listening' && (
        <div className="flex items-center gap-2 text-brand-600 font-semibold">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
          </span>
          Listening...
        </div>
      )}

      {phase === 'result' && (
        <div className="w-full space-y-3 animate-scale-in">
          <div
            className={`flex items-center gap-3 p-4 rounded-2xl ${
              isCorrect ? 'bg-brand-50' : 'bg-amber-50'
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-8 h-8 text-brand-600" />
            ) : (
              <XCircle className="w-8 h-8 text-amber-500" />
            )}
            <div>
              <p className={`font-bold ${isCorrect ? 'text-brand-800' : 'text-amber-700'}`}>
                {isCorrect ? 'Perfect!' : 'Almost!'}
              </p>
              <p className="text-sm text-slate-500">
                You said: "{heard}" — the word is "{currentWord}"
              </p>
            </div>
          </div>
          <button
            onClick={nextWord}
            className="w-full px-4 py-2.5 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors text-sm"
          >
            {wordIdx + 1 >= words.length ? 'Finish' : 'Next Word'}
          </button>
        </div>
      )}

      {phase === 'idle' && (
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors text-sm"
          >
            Exit
          </button>
          <button
            onClick={() => {
              setCorrectCount((c) => c + 1);
              nextWord();
            }}
            className="flex-1 px-4 py-2.5 border-2 border-brand-200 text-brand-600 rounded-xl font-semibold hover:bg-brand-50 transition-colors text-sm"
          >
            Mark Correct
          </button>
        </div>
      )}

      <p className="text-xs text-slate-400 text-center max-w-xs">
        Voice recognition works best in a quiet room. If it's unavailable, use "Mark Correct" to confirm verbally.
      </p>
    </div>
  );
}
