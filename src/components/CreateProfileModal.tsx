import { useState } from 'react';
import { X, User, Calendar, GraduationCap, Sparkles } from 'lucide-react';
import { GradeSelect } from './GradeSelect';
import { AVATAR_COLORS } from '@/constants';
import type { Profile } from '@/types';

interface CreateProfileModalProps {
  onClose: () => void;
  onCreate: (data: Omit<Profile, 'id' | 'created_at'>) => Promise<void>;
}

export function CreateProfileModal({ onClose, onCreate }: CreateProfileModalProps) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a name.');
      return;
    }
    if (!dob) {
      setError('Please select a date of birth.');
      return;
    }
    if (!gradeLevel) {
      setError('Please select a current grade level.');
      return;
    }

    setSaving(true);
    try {
      await onCreate({
        name: name.trim(),
        date_of_birth: dob,
        grade_level: gradeLevel,
        avatar_color: color,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create profile. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="bg-gradient-to-r from-brand-600 to-ocean-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">New Learner Profile</h2>
              <p className="text-sm text-white/80">Add a student to track their journey</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" /> Name
              </span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aaliyah Mohammed"
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 transition-colors hover:border-slate-300 focus:outline-none focus:border-brand-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" /> Date of Birth
              </span>
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 transition-colors hover:border-slate-300 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-slate-400" /> Current Grade / Level
              </span>
            </label>
            <GradeSelect value={gradeLevel} onChange={setGradeLevel} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Avatar Colour
            </label>
            <div className="flex flex-wrap gap-2.5">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-xl transition-all ${
                    color === c ? 'ring-4 ring-offset-2 ring-slate-300 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-brand-600/20"
            >
              {saving ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
