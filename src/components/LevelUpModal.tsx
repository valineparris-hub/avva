import { useEffect, useState } from 'react';
import { Sparkles, Trophy, ArrowRight, PartyPopper } from 'lucide-react';

interface LevelUpModalProps {
  profileName: string;
  fromLevel: string;
  toLevel: string;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function LevelUpModal({ profileName, fromLevel, toLevel, onConfirm, onDismiss }: LevelUpModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      {/* Confetti dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => {
          const colors = ['#0d9488', '#2563eb', '#f59e0b', '#db2777', '#16a34a'];
          const left = Math.random() * 100;
          const delay = Math.random() * 2;
          const duration = 2 + Math.random() * 2;
          const size = 6 + Math.random() * 8;
          return (
            <div
              key={i}
              className="absolute top-0 rounded-sm"
              style={{
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: colors[i % colors.length],
                animation: `confetti-fall ${duration}s ${delay}s ease-in forwards`,
              }}
            />
          );
        })}
      </div>

      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>

      <div
        className={`bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center transition-all duration-500 ${
          show ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
      >
        <div className="w-20 h-20 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-accent-500/30 animate-pop">
          <PartyPopper className="w-10 h-10 text-white" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-xs font-bold uppercase tracking-wide mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Level Up!
        </div>

        <h2 className="text-2xl font-bold font-display text-slate-800 mb-2">
          Congratulations, {profileName}!
        </h2>

        <p className="text-slate-500 mb-6">
          You've mastered all Kindergarten milestones. You're ready to move up to the
          Ministry of Education <strong className="text-slate-700">Infants 1</strong> curriculum!
        </p>

        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="px-4 py-2 bg-slate-100 rounded-xl">
            <span className="text-sm font-semibold text-slate-500">{fromLevel}</span>
          </div>
          <ArrowRight className="w-5 h-5 text-brand-500" />
          <div className="px-4 py-2 bg-brand-50 border-2 border-brand-200 rounded-xl">
            <span className="text-sm font-bold text-brand-700">{toLevel}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6 text-slate-400">
          <Trophy className="w-4 h-4 text-accent-500" />
          <span className="text-sm">All 9 Kindergarten modules completed</span>
        </div>

        <button
          onClick={onConfirm}
          className="w-full px-6 py-3.5 bg-gradient-to-r from-brand-600 to-ocean-600 text-white rounded-2xl font-bold hover:from-brand-700 hover:to-ocean-700 transition-all shadow-lg shadow-brand-600/20"
        >
          Start Infants 1 Journey
        </button>
        <button
          onClick={onDismiss}
          className="mt-3 text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          Stay in Kindergarten for now
        </button>
      </div>
    </div>
  );
}
