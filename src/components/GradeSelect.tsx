import { useState } from 'react';
import { GraduationCap, ChevronDown, Check } from 'lucide-react';
import { GRADE_LEVELS } from '@/constants';

interface GradeSelectProps {
  value: string;
  onChange: (key: string) => void;
}

export function GradeSelect({ value, onChange }: GradeSelectProps) {
  const [open, setOpen] = useState(false);

  const categories = Array.from(new Set(GRADE_LEVELS.map((l) => l.category)));
  const selected = GRADE_LEVELS.find((l) => l.key === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-left transition-colors hover:border-brand-400 focus:outline-none focus:border-brand-500"
      >
        <span className={selected ? 'text-slate-800 font-medium' : 'text-slate-400'}>
          {selected ? selected.label : 'Select current grade / level'}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-2 w-full bg-white border-2 border-slate-200 rounded-xl shadow-xl max-h-72 overflow-y-auto scrollbar-thin animate-scale-in">
            {categories.map((cat) => (
              <div key={cat}>
                <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50 sticky top-0">
                  {cat}
                </div>
                {GRADE_LEVELS.filter((l) => l.category === cat).map((level) => (
                  <button
                    key={level.key}
                    type="button"
                    onClick={() => {
                      onChange(level.key);
                      setOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-brand-50 transition-colors"
                  >
                    <span className="text-slate-700 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      {level.label}
                    </span>
                    {level.key === value && (
                      <Check className="w-4 h-4 text-brand-600" />
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
