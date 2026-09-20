import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calculator,
  BookOpen,
  BookText,
  FlaskConical,
  Atom,
  Atom as PhysicsIcon,
  Briefcase,
  Cpu,
  Wrench,
  Lock,
  CheckCircle2,
  PlayCircle,
  Star,
  Trophy,
  Target,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Award,
  ClipboardList,
  FlaskRound,
  LayoutGrid,
} from 'lucide-react';
import { Avatar } from './Avatar';
import { ProgressBar } from './ProgressBar';
import { ActivityModal } from './ActivityModal';
import { SBAPortal } from './SBAPortal';
import { LEVEL_KEY_TO_LABEL, DIFFICULTY_LABELS } from '@/constants';
import type { Profile, Module, ModuleProgress, ModuleWithProgress } from '@/types';
import { supabase } from '@/lib/supabase';

interface CSECDashboardProps {
  profile: Profile;
  onBack: () => void;
}

interface SubjectInfo {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
  description: string;
}

const CSEC_SUBJECTS: SubjectInfo[] = [
  {
    name: 'Mathematics',
    icon: Calculator,
    color: '#2563eb',
    gradient: 'from-ocean-500 to-ocean-600',
    description: 'Algebra, geometry, trigonometry, statistics, matrices & exam prep',
  },
  {
    name: 'English A',
    icon: BookOpen,
    color: '#16a34a',
    gradient: 'from-brand-500 to-brand-600',
    description: 'Summary, comprehension, persuasive/expository writing & grammar',
  },
  {
    name: 'English B',
    icon: BookText,
    color: '#059669',
    gradient: 'from-emerald-500 to-emerald-600',
    description: 'Prose fiction, poetry, drama, Shakespeare & literature analysis',
  },
  {
    name: 'Biology',
    icon: FlaskConical,
    color: '#db2777',
    gradient: 'from-pink-500 to-rose-600',
    description: 'Cells, nutrition, genetics, ecology & CSEC exam preparation',
  },
  {
    name: 'Chemistry',
    icon: Atom,
    color: '#7c3aed',
    gradient: 'from-violet-500 to-purple-600',
    description: 'Atomic structure, bonding, stoichiometry, acids, organic chemistry',
  },
  {
    name: 'Physics',
    icon: PhysicsIcon,
    color: '#0891b2',
    gradient: 'from-cyan-500 to-teal-600',
    description: 'Mechanics, energy, waves, optics, electricity & magnetism',
  },
  {
    name: 'Principles of Business',
    icon: Briefcase,
    color: '#ea580c',
    gradient: 'from-amber-500 to-orange-600',
    description: 'Business types, marketing, finance, economics, consumer affairs',
  },
  {
    name: 'Information Technology',
    icon: Cpu,
    color: '#4f46e5',
    gradient: 'from-indigo-500 to-indigo-600',
    description: 'Hardware, software, spreadsheets, databases, web & programming',
  },
  {
    name: 'Industrial Technology',
    icon: Wrench,
    color: '#dc2626',
    gradient: 'from-red-500 to-red-600',
    description: 'Materials, technical drawing, manufacturing, construction & power',
  },
];

const PASS_THRESHOLD = 85;

type Tab = 'subjects' | 'sba';

export function CSECDashboard({ profile, onBack }: CSECDashboardProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<ModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<ModuleWithProgress | null>(null);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('subjects');

  useEffect(() => {
    loadData();
  }, [profile.id]);

  useEffect(() => {
    if (!expandedSubject && !loading && tab === 'subjects') {
      const firstSubject = CSEC_SUBJECTS.find((s) => {
        const mods = modules.filter(
          (m) => m.level_key === profile.grade_level && m.subject === s.name
        );
        return mods.some((m) => {
          if (m.prerequisite_module_id) {
            return completedIds.has(m.prerequisite_module_id) &&
              !completedIds.has(m.id);
          }
          return !completedIds.has(m.id);
        });
      });
      setExpandedSubject(firstSubject?.name ?? CSEC_SUBJECTS[0].name);
    }
  }, [loading, expandedSubject, modules, profile.grade_level, tab]);

  async function loadData() {
    setLoading(true);
    const [modRes, progRes] = await Promise.all([
      supabase.from('modules').select('*').eq('level_key', profile.grade_level).order('sequence_order'),
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

  function buildMwp(mod: Module): ModuleWithProgress {
    return {
      ...mod,
      progress: progressMap.get(mod.id),
      is_unlocked: isModuleUnlocked(mod),
    };
  }

  const levelModules = modules.map(buildMwp);
  const totalModules = levelModules.length;
  const completedModules = levelModules.filter((m) => m.progress?.status === 'completed').length;
  const overallPct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const completedScores = levelModules
    .filter((m) => m.progress?.status === 'completed')
    .map((m) => m.progress!.score);
  const avgScore = completedScores.length > 0
    ? Math.round(completedScores.reduce((a, b) => a + b, 0) / completedScores.length)
    : 0;

  function getSubjectModules(subjectName: string): ModuleWithProgress[] {
    return levelModules.filter((m) => m.subject === subjectName);
  }

  function getSubjectProgress(subjectName: string) {
    const mods = getSubjectModules(subjectName);
    const completed = mods.filter((m) => m.progress?.status === 'completed').length;
    const total = mods.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const scores = mods
      .filter((m) => m.progress?.status === 'completed')
      .map((m) => m.progress!.score);
    const subjAvg = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    const nextUnlocked = mods.find((m) => m.is_unlocked && m.progress?.status !== 'completed');
    return { completed, total, pct, avgScore: subjAvg, nextUnlocked, mods };
  }

  async function handleActivityComplete(mod: ModuleWithProgress, score: number, passed?: boolean) {
    const existing = progressMap.get(mod.id);
    const isQuiz = mod.activity_type === 'quiz';
    const status = isQuiz && passed === false ? 'in_progress' : 'completed';

    if (existing) {
      await supabase
        .from('module_progress')
        .update({
          status,
          score: Math.max(existing.score, score),
          attempts: existing.attempts + 1,
          completed_at: status === 'completed' ? new Date().toISOString() : existing.completed_at,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('module_progress').insert({
        profile_id: profile.id,
        module_id: mod.id,
        status,
        score,
        attempts: 1,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
      });
    }
    setActiveModule(null);
    await loadData();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          <div className="h-32 bg-slate-100 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="h-48 bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-ocean-50/20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-ocean-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-100/30 rounded-full blur-3xl" />
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
          {/* Overall progress hero */}
          <div className="bg-gradient-to-br from-ocean-700 via-ocean-800 to-brand-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-ocean-700/20 animate-slide-up overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-brand-400/20 rounded-full blur-3xl" />

            <div className="relative">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-white/70 text-sm font-medium mb-1">{profile.name}'s CSEC Journey</p>
                  <h2 className="text-2xl sm:text-3xl font-bold font-display">
                    {LEVEL_KEY_TO_LABEL[profile.grade_level]}
                  </h2>
                  <p className="text-white/60 text-sm mt-1">2-year CXC curriculum · 8 subjects · SBA & Lab Portal</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/15 rounded-xl shrink-0">
                  <Trophy className="w-4 h-4 text-accent-300" />
                  <span className="text-sm font-semibold">{avgScore}% avg</span>
                </div>
              </div>

              <div className="mb-5">
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
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/10 rounded-2xl p-3 text-center">
                  <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-accent-300" />
                  <p className="text-xl font-bold font-display tabular-nums">{completedModules}</p>
                  <p className="text-xs text-white/60">Completed</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-3 text-center">
                  <PlayCircle className="w-5 h-5 mx-auto mb-1 text-accent-300" />
                  <p className="text-xl font-bold font-display tabular-nums">
                    {levelModules.filter((m) => m.progress?.status === 'in_progress').length}
                  </p>
                  <p className="text-xs text-white/60">In Progress</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-3 text-center">
                  <Target className="w-5 h-5 mx-auto mb-1 text-accent-300" />
                  <p className="text-xl font-bold font-display tabular-nums">{avgScore}%</p>
                  <p className="text-xs text-white/60">Avg Score</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-white/70">
                <ClipboardList className="w-4 h-4 text-accent-300" />
                <span>Score {PASS_THRESHOLD}% or higher on each quiz to unlock the next topic</span>
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm text-white/70">
                <Sparkles className="w-4 h-4 text-accent-300" />
                <span>Form 4 &amp; 5 share a unified CXC syllabus — work through both years to prepare for exams</span>
              </div>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 bg-white rounded-2xl border border-slate-100 shadow-sm w-fit">
            <button
              onClick={() => setTab('subjects')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                tab === 'subjects'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Subjects
            </button>
            <button
              onClick={() => setTab('sba')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                tab === 'sba'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FlaskRound className="w-4 h-4" />
              SBA & Lab Portal
            </button>
          </div>

          {/* Tab content */}
          {tab === 'subjects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {CSEC_SUBJECTS.map((subject) => {
                const data = getSubjectProgress(subject.name);
                const Icon = subject.icon;
                const isExpanded = expandedSubject === subject.name;

                if (data.total === 0) return null;

                return (
                  <div
                    key={subject.name}
                    className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden animate-slide-up flex flex-col"
                  >
                    {/* Subject header */}
                    <button
                      onClick={() => setExpandedSubject(isExpanded ? null : subject.name)}
                      className={`w-full bg-gradient-to-br ${subject.gradient} p-4 text-white relative overflow-hidden text-left`}
                    >
                      <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold font-display truncate">{subject.name}</h3>
                            <p className="text-xs text-white/70">{data.completed}/{data.total} · {data.pct}%</p>
                          </div>
                        </div>
                        <span className="text-xl font-bold font-display tabular-nums shrink-0">{data.pct}%</span>
                      </div>
                    </button>

                    {/* Progress bar */}
                    <div className="px-4 pt-2.5">
                      <ProgressBar value={data.pct} color={subject.color} height="h-2" />
                    </div>

                    {/* Expanded module list */}
                    {isExpanded && (
                      <div className="p-4 animate-fade-in flex-1">
                        <p className="text-xs text-slate-400 mb-3">{subject.description}</p>

                        <div className="space-y-2">
                          {data.mods.map((m, idx) => {
                            const status = m.progress?.status;
                            const locked = !m.is_unlocked;
                            const isNext = data.nextUnlocked?.id === m.id;
                            const isQuiz = m.activity_type === 'quiz';
                            const failedQuiz = isQuiz && status === 'in_progress' && (m.progress?.score ?? 0) < PASS_THRESHOLD;

                            return (
                              <button
                                key={m.id}
                                onClick={() => !locked && setActiveModule(m)}
                                disabled={locked}
                                className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left ${
                                  locked
                                    ? 'border-slate-100 bg-slate-50/50 cursor-not-allowed opacity-60'
                                    : isNext
                                      ? 'border-brand-300 bg-brand-50/40 hover:shadow-md ring-1 ring-brand-200'
                                      : failedQuiz
                                        ? 'border-amber-200 bg-amber-50/40 hover:shadow-sm'
                                        : 'border-slate-100 hover:border-brand-300 hover:bg-brand-50/30 hover:shadow-sm'
                                }`}
                              >
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                                  style={{
                                    backgroundColor: locked ? '#e2e8f0' : `${subject.color}15`,
                                    color: locked ? '#94a3b8' : subject.color,
                                  }}
                                >
                                  {locked ? (
                                    <Lock className="w-3 h-3" />
                                  ) : status === 'completed' ? (
                                    <CheckCircle2 className="w-4 h-4" style={{ color: subject.color }} />
                                  ) : status === 'in_progress' ? (
                                    <PlayCircle className="w-4 h-4" style={{ color: failedQuiz ? '#d97706' : subject.color }} />
                                  ) : (
                                    <span>{idx + 1}</span>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className={`font-semibold text-xs truncate ${locked ? 'text-slate-400' : 'text-slate-700'}`}>
                                    {m.title}
                                  </p>
                                  <p className="text-xs text-slate-400 truncate">
                                    {DIFFICULTY_LABELS[m.difficulty]}
                                    {m.progress?.score !== undefined && m.progress?.score > 0 && ` · ${m.progress.score}%`}
                                    {failedQuiz && ' · Retry'}
                                  </p>
                                </div>

                                {!locked && status === 'completed' ? (
                                  <div className="flex items-center gap-0.5">
                                    {[1, 2, 3].map((i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i <= Math.ceil((m.progress?.score ?? 0) / 34)
                                            ? 'text-accent-400 fill-accent-400'
                                            : 'text-slate-200'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                ) : isNext ? (
                                  <ChevronRight className="w-4 h-4 text-brand-500 shrink-0" />
                                ) : null}
                              </button>
                            );
                          })}
                        </div>

                        {data.nextUnlocked ? (
                          <button
                            onClick={() => setActiveModule(data.nextUnlocked!)}
                            className="mt-3 w-full flex items-center justify-between px-3 py-2 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-brand-50 hover:to-ocean-50 rounded-xl transition-all group"
                          >
                            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 group-hover:text-brand-600">
                              <TrendingUp className="w-3.5 h-3.5" /> Next
                            </span>
                            <span className="text-xs font-semibold text-slate-700 group-hover:text-brand-700 truncate ml-2">
                              {data.nextUnlocked.title}
                            </span>
                          </button>
                        ) : data.completed === data.total && data.total > 0 ? (
                          <div className="mt-3 flex items-center justify-center gap-2 py-2.5 bg-accent-50 rounded-xl">
                            <Award className="w-4 h-4 text-accent-600" />
                            <span className="text-sm font-semibold text-accent-700">Subject Complete!</span>
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* Collapsed summary */}
                    {!isExpanded && (
                      <div className="px-4 py-3 flex-1">
                        <p className="text-xs text-slate-400 truncate">{subject.description}</p>
                        {data.nextUnlocked ? (
                          <p className="text-xs text-brand-600 font-medium mt-1.5 flex items-center gap-1">
                            <ChevronRight className="w-3 h-3" />
                            Next: {data.nextUnlocked.title}
                          </p>
                        ) : data.completed === data.total && data.total > 0 ? (
                          <p className="text-xs text-accent-600 font-medium mt-1.5 flex items-center gap-1">
                            <Award className="w-3 h-3" /> Mastered!
                          </p>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'sba' && <SBAPortal profile={profile} />}
        </main>
      </div>

      {activeModule && (
        <ActivityModal
          module={activeModule}
          onClose={() => setActiveModule(null)}
          onComplete={(score, passed) => handleActivityComplete(activeModule, score, passed)}
        />
      )}
    </div>
  );
}
