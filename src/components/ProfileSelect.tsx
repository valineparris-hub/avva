import { useState } from 'react';
import { Plus, Trash2, GraduationCap, MapPin, X } from 'lucide-react';
import { Avatar } from './Avatar';
import { CreateProfileModal } from './CreateProfileModal';
import { LEVEL_KEY_TO_LABEL } from '@/constants';
import type { Profile } from '@/types';

interface ProfileSelectProps {
  profiles: Profile[];
  loading: boolean;
  onSelect: (profile: Profile) => void;
  onCreate: (data: Omit<Profile, 'id' | 'created_at'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function ageFromDob(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export function ProfileSelect({
  profiles,
  loading,
  onSelect,
  onCreate,
  onDelete,
}: ProfileSelectProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Profile | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50/40 to-ocean-50/40">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-ocean-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-ocean-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-600/20">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-slate-800">
              EduTrack <span className="text-brand-600">TT</span>
            </h1>
          </div>
          <p className="text-slate-500 text-lg flex items-center justify-center gap-1.5">
            <MapPin className="w-4 h-4" />
            Educational progress tracking for Trinidad &amp; Tobago
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-6 sm:p-8 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold font-display text-slate-800">Who's learning today?</h2>
            <span className="text-sm text-slate-400">
              {profiles.length} {profiles.length === 1 ? 'learner' : 'learners'}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-brand-500" />
              </div>
              <p className="text-slate-500 mb-1">No learner profiles yet.</p>
              <p className="text-sm text-slate-400 mb-6">
                Create your first profile to start tracking progress.
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-md shadow-brand-600/20"
              >
                <Plus className="w-5 h-5" />
                Add Learner Profile
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="group relative bg-white border-2 border-slate-100 rounded-2xl p-5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-100/50 transition-all cursor-pointer animate-pop"
                  onClick={() => onSelect(profile)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(profile);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    aria-label="Delete profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-4 mb-3">
                    <Avatar name={profile.name} color={profile.avatar_color} size="lg" />
                    <div className="min-w-0">
                      <h3 className="font-bold font-display text-slate-800 truncate text-lg">
                        {profile.name}
                      </h3>
                      <p className="text-sm text-slate-500">{ageFromDob(profile.date_of_birth)} years old</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg font-medium">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {LEVEL_KEY_TO_LABEL[profile.grade_level] ?? profile.grade_level}
                    </span>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setShowCreate(true)}
                className="flex flex-col items-center justify-center gap-3 min-h-32 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50/50 transition-all group"
              >
                <div className="w-12 h-12 bg-slate-100 group-hover:bg-brand-100 rounded-xl flex items-center justify-center transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-semibold">Add New Learner</span>
              </button>
            </div>
          )}

          {!loading && profiles.length > 0 && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2.5 text-brand-600 hover:bg-brand-50 rounded-xl font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add another profile
            </button>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateProfileModal
          onClose={() => setShowCreate(false)}
          onCreate={async (data) => {
            await onCreate(data);
            setShowCreate(false);
          }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-display text-slate-800">Delete profile?</h3>
              <button
                onClick={() => setConfirmDelete(null)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-600 mb-6">
              This will permanently remove <strong>{confirmDelete.name}</strong> and all their
              learning progress. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onDelete(confirmDelete.id);
                  setConfirmDelete(null);
                }}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
