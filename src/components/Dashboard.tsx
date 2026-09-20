import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  Lock,
  CheckCircle2,
  Circle,
  PlayCircle,
  Star,
  Flame,
  Target,
  ChevronRight,
  X,
  Sparkles,
  Award,
} from 'lucide-react';
import { Avatar } from './Avatar';
import { ProgressBar } from './ProgressBar';
import { LEVEL_KEY_TO_LABEL, SUBJECT_COLORS, DIFFICULTY_LABELS, GRADE_LEVELS } from '@/constants';
import type { Profile, Module, ModuleProgress, ModuleWithProgress } from '@/types';
import { supabase } from '@/lib/supabase';

interface DashboardProps {
  profile: Profile;
  onBack: () => void;
}

interface SubjectMastery {
  subject: string;
  completed: number;
  total: number;
  avgScore: number;
}

export function Dashboard({ profile, onBack }: DashboardProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<ModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<ModuleWithProgress | null>(null);

  useEffect(() => {
    loadData();
  }, [profile.id]);

  async function loadData() {
    setLoading(true);
    const [modRes, progRes] = await Promise.all([
      supabase.from('modules').select('*').order('sequence_order'),
      supabase.from('module_progress').select('*').eq('profile_id', profile.id),
    ]);

    if (modRes.data) setModules(modRes.data as Module[]);
    if (progRes.data) setProgress(progRes.data as ModuleProgress[]);
    setLoading(false);
  }

  const progressMap = new Map<string, ModuleProgress>();
  progress.forEach((p) => progressMap.set(p.module_id, p));

  const completedIds = new Set(
    progress.filter((p) => p.status === 'completed').map((p) => p.module_id)
  );

  function isModuleUnlocked(mod: Module): boolean {
    if (!mod.prerequisite_module_id) return true;
    return completedIds.has(mod.prerequisite_module_id);
  }

  function buildModuleWithProgress(mod: Module): ModuleWithProgress {
    return {
      ...mod,
      progress: progressMap.get(mod.id),
      is_unlocked: isModuleUnlocked(mod),
    };
  }

  const profileModules = modules.filter((m) => m.level_key === profile.grade_level);
  const modulesWithProgress = profileModules.map(buildModuleWithProgress);

  const totalModules = profileModules.length;
  const completedModules = modulesWithProgress.filter((m) => m.progress?.status === 'completed').length;
  const inProgressModules = modulesWithProgress.filter((m) => m.progress?.status === 'in_progress').length;
  const overallPct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const avgScore = (() => {
    const completed = progress.filter((p) => p.status === 'completed' && progressMapHasModule(p.module_id, profileModules));
    if (completed.length === 0) return 0;
    return Math.round(completed.reduce((sum, p) => sum + p.score, 0) / completed.length);
  })();

  function progressMapHasModule(moduleId: string, mods: Module[]): boolean {
    return mods.some((m) => m.id === moduleId);
  }

  const subjects: SubjectMastery[] = (() => {
    const subjectMap = new Map<string, { completed: number; total: number; scores: number[] }>();
    profileModules.forEach((m) => {
      const entry = subjectMap.get(m.subject) ?? { completed: 0, total: 0, scores: [] };
      entry.total++;
      const prog = progressMap.get(m.id);
      if (prog?.status === 'completed') {
        entry.completed++;
        entry.scores.push(prog.score);
      }
      subjectMap.set(m.subject, entry);
    });
    return Array.from(subjectMap.entries()).map(([subject, e]) => ({
      subject,
      completed: e.completed,
      total: e.total,
      avgScore: e.scores.length > 0 ? Math.round(e.scores.reduce((a, b) => a + b, 0) / e.scores.length) : 0,
    }));
  })();

  const subjectsByOrder = subjects.sort((a, b) => b.total - a.total);

  const nextModule = modulesWithProgress.find((m) => m.is_unlocked && m.progress?.status !== 'completed');

  const currentLevelInfo = GRADE_LEVELS.find((l) => l.key === profile.grade_level);
  const nextLevel = GRADE_LEVELS.find((l) => l.order === (currentLevelInfo?.order ?? 0) + 1);

  async function handleModuleAction(mod: ModuleWithProgress, action: 'start' | 'complete') {
    const existing = progressMap.get(mod.id);
    if (action === 'start') {
      if (existing) {
        await supabase
          .from('module_progress')
          .update({ status: 'in_progress', attempts: existing.attempts + 1, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase.from('module_progress').insert({
          profile_id: profile.id,
          module_id: mod.id,
          status: 'in_progress',
          attempts: 1,
        });
      }
    } else if (action === 'complete') {
      const score = Math.floor(70 + Math.random() * 30);
      if (existing) {
        await supabase
          .from('module_progress')
          .update({ status: 'completed', score, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase.from('module_progress').insert({
          profile_id: profile.id,
          module_id: mod.id,
          status: 'completed',
          score,
          attempts: 1,
          completed_at: new Date().toISOString(),
        });
      }
    }
    setActiveModule(null);
    loadData();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-0 w-96 h-96 bg-brand-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-xl font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Switch Profile</span>
            </button>

            <div className="flex items-center gap-3">
              <Avatar name={profile.name} color={profile.avatar_color} size="sm" />
              <div className="text-right hidden sm:block">
                <p className="font-bold text-slate-800 text-sm leading-tight">{profile.name}</p>
                <p className="text-xs text-slate-500">{LEVEL_KEY_TO_LABEL[profile.grade_level]}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {loading ? (
            <div className="space-y-6">
              <div className="h-32 bg-slate-100 rounded-3xl animate-pulse" />
              <div className="h-48 bg-slate-100 rounded-3xl animate-pulse" />
            </div>
          ) : (
            <>
              <OverallProgressCard
                profileName={profile.name}
                levelLabel={LEVEL_KEY_TO_LABEL[profile.grade_level] ?? profile.grade_level}
                overallPct={overallPct}
                completedModules={completedModules}
                totalModules={totalModules}
                inProgressModules={inProgressModules}
                avgScore={avgScore}
                nextLevelLabel={nextLevel?.label}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LevelMasteryCard subjects={subjectsByOrder} />
                <AdaptivePathwayCard
                  modules={modulesWithProgress}
                  onSelectModule={setActiveModule}
                  nextModule={nextModule}
                  nextLevelLabel={nextLevel?.label}
                />
              </div>
            </>
          )}
        </main>
      </div>

      {activeModule && (
        <ModuleModal
          module={activeModule}
          profileName={profile.name}
          onClose={() => setActiveModule(null)}
          onAction={handleModuleAction}
        />
      )}
    </div>
  );
}

function OverallProgressCard({
  profileName,
  levelLabel,
  overallPct,
  completedModules,
  totalModules,
  inProgressModules,
  avgScore,
  nextLevelLabel,
}: {
  profileName: string;
  levelLabel: string;
  overallPct: number;
  completedModules: number;
  totalModules: number;
  inProgressModules: number;
  avgScore: number;
  nextLevelLabel?: string;
}) {
  return (
    <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-ocean-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-600/20 animate-slide-up overflow-hidden relative">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-ocean-400/20 rounded-full blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-white/70 text-sm font-medium mb-1">{profileName}'s Learning Journey</p>
            <h2 className="text-2xl sm:text-3xl font-bold font-display">{levelLabel}</h2>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/15 rounded-xl">
            <Trophy className="w-4 h-4 text-accent-300" />
            <span className="text-sm font-semibold">{avgScore}% avg</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-white/80 text-sm font-medium">Overall Progress</span>
            <span className="text-3xl font-bold font-display tabular-nums">{overallPct}%</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-300 to-accent-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <p className="text-white/60 text-xs mt-2">
            {completedModules} of {totalModules} modules completed
            {inProgressModules > 0 && ` · ${inProgressModules} in progress`}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Completed" value={completedModules} />
          <StatCard icon={<PlayCircle className="w-5 h-5" />} label="In Progress" value={inProgressModules} />
          <StatCard icon={<Target className="w-5 h-5" />} label="Avg Score" value={`${avgScore}%`} />
        </div>

        {nextLevelLabel && (
          <div className="mt-5 flex items-center gap-2 text-sm text-white/70">
            <Sparkles className="w-4 h-4 text-accent-300" />
            <span>
              Complete all modules to advance to <strong className="text-white">{nextLevelLabel}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-white/10 rounded-2xl p-3 text-center">
      <div className="flex items-center justify-center mb-1 text-accent-300">{icon}</div>
      <p className="text-xl font-bold font-display tabular-nums">{value}</p>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  );
}

function LevelMasteryCard({ subjects }: { subjects: SubjectMastery[] }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 animate-slide-up">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-9 h-9 bg-ocean-100 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-ocean-600" />
        </div>
        <div>
          <h3 className="font-bold font-display text-slate-800 text-lg">Level Masteries</h3>
          <p className="text-xs text-slate-400">Subject-by-subject progress</p>
        </div>
      </div>

      {subjects.length === 0 ? (
        <p className="text-slate-400 text-sm py-8 text-center">No modules for this level yet.</p>
      ) : (
        <div className="space-y-4">
          {subjects.map((s) => {
            const pct = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
            const color = SUBJECT_COLORS[s.subject] ?? '#64748b';
            return (
              <div key={s.subject}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-700 text-sm">{s.subject}</span>
                  <span className="text-xs text-slate-400 tabular-nums">
                    {s.completed}/{s.total}
                    {s.avgScore > 0 && ` · ${s.avgScore}% avg`}
                  </span>
                </div>
                <ProgressBar value={pct} color={color} height="h-2" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdaptivePathwayCard({
  modules,
  onSelectModule,
  nextModule,
  nextLevelLabel,
}: {
  modules: ModuleWithProgress[];
  onSelectModule: (m: ModuleWithProgress) => void;
  nextModule?: ModuleWithProgress;
  nextLevelLabel?: string;
}) {
  const unlocked = modules.filter((m) => m.is_unlocked);
  const locked = modules.filter((m) => !m.is_unlocked);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 animate-slide-up">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center">
          <Flame className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h3 className="font-bold font-display text-slate-800 text-lg">Adaptive Learning Pathway</h3>
          <p className="text-xs text-slate-400">Complete modules to unlock harder ones</p>
        </div>
      </div>

      {nextModule && (
        <div className="mb-4 p-3 bg-gradient-to-r from-brand-50 to-ocean-50 border border-brand-200 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span className="text-xs font-bold text-brand-700 uppercase tracking-wide">Recommended Next</span>
          </div>
          <button
            onClick={() => onSelectModule(nextModule)}
            className="flex items-center justify-between w-full group"
          >
            <span className="font-semibold text-slate-800 text-sm group-hover:text-brand-700 transition-colors">
              {nextModule.title}
            </span>
            <ChevronRight className="w-4 h-4 text-brand-600 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}

      {!nextModule && unlocked.length > 0 && unlocked.every((m) => m.progress?.status === 'completed') && (
        <div className="mb-4 p-3 bg-accent-50 border border-accent-200 rounded-xl flex items-center gap-2">
          <Award className="w-5 h-5 text-accent-600 shrink-0" />
          <p className="text-sm text-accent-800">
            All modules completed! {nextLevelLabel ? `Ready to advance to ${nextLevelLabel}.` : 'Outstanding work!'}
          </p>
        </div>
      )}

      {modules.length === 0 ? (
        <p className="text-slate-400 text-sm py-8 text-center">No modules for this level yet.</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin pr-1">
          {unlocked.map((m) => (
            <ModuleRow key={m.id} module={m} onClick={() => onSelectModule(m)} />
          ))}
          {locked.length > 0 && (
            <>
              <div className="pt-2 pb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" /> Locked — complete prerequisites to unlock
                </span>
              </div>
              {locked.map((m) => (
                <ModuleRow key={m.id} module={m} onClick={() => {}} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ModuleRow({ module: m, onClick }: { module: ModuleWithProgress; onClick: () => void }) {
  const color = SUBJECT_COLORS[m.subject] ?? '#64748b';
  const status = m.progress?.status;
  const locked = !m.is_unlocked;

  return (
    <button
      onClick={onClick}
      disabled={locked}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
        locked
          ? 'border-slate-100 bg-slate-50/50 cursor-not-allowed opacity-60'
          : 'border-slate-100 hover:border-brand-300 hover:bg-brand-50/40 hover:shadow-sm'
      }`}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: locked ? '#e2e8f0' : `${color}15` }}
      >
        {locked ? (
          <Lock className="w-4 h-4 text-slate-400" />
        ) : status === 'completed' ? (
          <CheckCircle2 className="w-5 h-5" style={{ color }} />
        ) : status === 'in_progress' ? (
          <PlayCircle className="w-5 h-5" style={{ color }} />
        ) : (
          <Circle className="w-5 h-5" style={{ color: `${color}80` }} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm truncate ${locked ? 'text-slate-400' : 'text-slate-700'}`}>
          {m.title}
        </p>
        <p className="text-xs text-slate-400 truncate">
          {m.subject} · {DIFFICULTY_LABELS[m.difficulty]}
          {m.progress?.score ? ` · ${m.progress.score}%` : ''}
        </p>
      </div>

      {!locked && status === 'completed' && (
        <div className="flex items-center gap-0.5">
          {[1, 2, 3].map((i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i <= Math.ceil((m.progress?.score ?? 0) / 34)
                  ? 'text-accent-400 fill-accent-400'
                  : 'text-slate-200'
              }`}
            />
          ))}
        </div>
      )}
    </button>
  );
}

function ModuleModal({
  module: m,
  profileName,
  onClose,
  onAction,
}: {
  module: ModuleWithProgress;
  profileName: string;
  onClose: () => void;
  onAction: (m: ModuleWithProgress, action: 'start' | 'complete') => void;
}) {
  const color = SUBJECT_COLORS[m.subject] ?? '#64748b';
  const status = m.progress?.status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        <div
          className="px-6 py-5 relative"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 bg-white/20 rounded-lg text-xs font-semibold text-white">
              {m.subject}
            </span>
            <span className="px-2.5 py-1 bg-white/20 rounded-lg text-xs font-semibold text-white">
              {DIFFICULTY_LABELS[m.difficulty]}
            </span>
          </div>
          <h2 className="text-xl font-bold font-display text-white">{m.title}</h2>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-slate-600 text-sm leading-relaxed">
            {m.description ?? 'No description available.'}
          </p>

          {m.prerequisite_module_id && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl p-3">
              {m.is_unlocked ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-brand-500" />
                  <span>Prerequisite completed — this module is unlocked!</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Complete the prerequisite module to unlock this one.</span>
                </>
              )}
            </div>
          )}

          {status === 'completed' && (
            <div className="flex items-center gap-3 p-4 bg-brand-50 rounded-2xl">
              <Trophy className="w-8 h-8 text-brand-600" />
              <div>
                <p className="font-bold text-brand-800">Module Completed!</p>
                <p className="text-sm text-brand-600">
                  Score: {m.progress?.score}% · {m.progress?.attempts} {m.progress?.attempts === 1 ? 'attempt' : 'attempts'}
                </p>
              </div>
            </div>
          )}

          {status === 'in_progress' && (
            <div className="flex items-center gap-2 text-sm text-ocean-600 bg-ocean-50 rounded-xl p-3">
              <PlayCircle className="w-4 h-4" />
              <span>Started — {m.progress?.attempts} {m.progress?.attempts === 1 ? 'attempt' : 'attempts'} so far</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {status === 'completed' ? (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Later
                </button>
                <button
                  onClick={() => onAction(m, 'complete')}
                  className="flex-1 px-4 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-md shadow-brand-600/20"
                >
                  Mark Complete
                </button>
              </>
            )}
          </div>

          {status !== 'completed' && (
            <p className="text-center text-xs text-slate-400">
              {profileName} can practise this module and mark it complete when ready.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
