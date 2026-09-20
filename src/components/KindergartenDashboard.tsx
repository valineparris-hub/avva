import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Calculator,
  PenLine,
  Lock,
  CheckCircle2,
  PlayCircle,
  Circle,
  Star,
  Sparkles,
  Trophy,
  ChevronRight,
  Target,
  Flame,
} from 'lucide-react';
import { Avatar } from './Avatar';
import { ProgressBar } from './ProgressBar';
import { ActivityModal } from './ActivityModal';
import { LevelUpModal } from './LevelUpModal';
import { KINDERGARTEN_PILLARS, LEVEL_KEY_TO_LABEL, DIFFICULTY_LABELS } from '@/constants';
import type { Profile, Module, ModuleProgress, ModuleWithProgress, Pillar } from '@/types';
import { supabase } from '@/lib/supabase';

interface KindergartenDashboardProps {
  profile: Profile;
  onBack: () => void;
  onLevelUp: (newGradeLevel: string) => Promise<void>;
}

const PILLAR_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Calculator,
  PenLine,
};

export function KindergartenDashboard({ profile, onBack, onLevelUp }: KindergartenDashboardProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<ModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<ModuleWithProgress | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    loadData();
  }, [profile.id]);

  async function loadData() {
    setLoading(true);
    const [modRes, progRes] = await Promise.all([
      supabase.from('modules').select('*').eq('level_key', 'kindergarten').order('sequence_order'),
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

  const kgModules = modules.map(buildMwp);
  const totalModules = kgModules.length;
  const completedModules = kgModules.filter((m) => m.progress?.status === 'completed').length;
  const overallPct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const completedScores = kgModules
    .filter((m) => m.progress?.status === 'completed')
    .map((m) => m.progress!.score);
  const avgScore = completedScores.length > 0
    ? Math.round(completedScores.reduce((a, b) => a + b, 0) / completedScores.length)
    : 0;

  // Check for level up: all modules completed
  const allComplete = totalModules > 0 && completedModules === totalModules;

  useEffect(() => {
    if (allComplete && !justCompleted) {
      setShowLevelUp(true);
      setJustCompleted(true);
    }
    if (!allComplete) {
      setJustCompleted(false);
    }
  }, [allComplete, justCompleted]);

  function getPillarModules(pillarKey: string): ModuleWithProgress[] {
    return kgModules.filter((m) => m.pillar === pillarKey);
  }

  function getPillarProgress(pillarKey: string) {
    const mods = getPillarModules(pillarKey);
    const completed = mods.filter((m) => m.progress?.status === 'completed').length;
    const total = mods.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const nextUnlocked = mods.find((m) => m.is_unlocked && m.progress?.status !== 'completed');
    return { completed, total, pct, nextUnlocked, mods };
  }

  async function handleActivityComplete(mod: ModuleWithProgress, score: number) {
    const existing = progressMap.get(mod.id);
    if (existing) {
      await supabase
        .from('module_progress')
        .update({
          status: 'completed',
          score,
          attempts: existing.attempts + 1,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
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
    setActiveModule(null);
    await loadData();
  }

  async function handleLevelUpConfirm() {
    setShowLevelUp(false);
    await onLevelUp('primary_infants_1');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          <div className="h-32 bg-slate-100 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50/30 to-ocean-50/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-ocean-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
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
                <p className="text-xs text-slate-500">Toddler / Kindergarten</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {/* Overall progress hero */}
          <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-ocean-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-600/20 animate-slide-up overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-ocean-400/20 rounded-full blur-3xl" />

            <div className="relative">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-white/70 text-sm font-medium mb-1">{profile.name}'s Early Learning Journey</p>
                  <h2 className="text-2xl sm:text-3xl font-bold font-display">Three Learning Pillars</h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/15 rounded-xl">
                  <Trophy className="w-4 h-4 text-accent-300" />
                  <span className="text-sm font-semibold">{avgScore}% avg</span>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-white/80 text-sm font-medium">Overall Mastery</span>
                  <span className="text-3xl font-bold font-display tabular-nums">{overallPct}%</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-300 to-accent-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${overallPct}%` }}
                  />
                </div>
                <p className="text-white/60 text-xs mt-2">
                  {completedModules} of {totalModules} milestones mastered
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/10 rounded-2xl p-3 text-center">
                  <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-accent-300" />
                  <p className="text-xl font-bold font-display tabular-nums">{completedModules}</p>
                  <p className="text-xs text-white/60">Mastered</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-3 text-center">
                  <PlayCircle className="w-5 h-5 mx-auto mb-1 text-accent-300" />
                  <p className="text-xl font-bold font-display tabular-nums">
                    {kgModules.filter((m) => m.progress?.status === 'in_progress').length}
                  </p>
                  <p className="text-xs text-white/60">Active</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-3 text-center">
                  <Target className="w-5 h-5 mx-auto mb-1 text-accent-300" />
                  <p className="text-xl font-bold font-display tabular-nums">{avgScore}%</p>
                  <p className="text-xs text-white/60">Avg Score</p>
                </div>
              </div>

              {allComplete && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-accent-400/20 rounded-xl animate-pulse">
                  <Sparkles className="w-5 h-5 text-accent-300" />
                  <span className="text-sm font-semibold text-white">
                    All milestones mastered! Time to level up to Infants 1!
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Three Pillar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {KINDERGARTEN_PILLARS.map((pillar) => {
              const data = getPillarProgress(pillar.key);
              const Icon = PILLAR_ICONS[pillar.icon] ?? BookOpen;
              const pillarMods = data.mods;

              return (
                <div
                  key={pillar.key}
                  className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden animate-slide-up flex flex-col"
                >
                  {/* Pillar header */}
                  <div className={`bg-gradient-to-br ${pillar.gradient} p-5 text-white relative overflow-hidden`}>
                    <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold font-display tabular-nums">{data.pct}%</span>
                      </div>
                      <h3 className="text-xl font-bold font-display mb-1">{pillar.label}</h3>
                      <p className="text-xs text-white/70">{pillar.description}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="px-5 pt-4">
                    <ProgressBar value={data.pct} color={pillar.color} height="h-2" showLabel />
                    <p className="text-xs text-slate-400 mt-1.5">
                      {data.completed}/{data.total} milestones mastered
                    </p>
                  </div>

                  {/* Module list */}
                  <div className="p-5 flex-1">
                    <div className="space-y-2">
                      {pillarMods.map((m, idx) => {
                        const status = m.progress?.status;
                        const locked = !m.is_unlocked;
                        const isNext = data.nextUnlocked?.id === m.id;

                        return (
                          <button
                            key={m.id}
                            onClick={() => !locked && setActiveModule(m)}
                            disabled={locked}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                              locked
                                ? 'border-slate-100 bg-slate-50/50 cursor-not-allowed opacity-60'
                                : isNext
                                  ? 'border-brand-300 bg-brand-50/40 hover:shadow-md ring-1 ring-brand-200'
                                  : 'border-slate-100 hover:border-brand-300 hover:bg-brand-50/30 hover:shadow-sm'
                            }`}
                          >
                            {/* Step number / icon */}
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                              style={{
                                backgroundColor: locked ? '#e2e8f0' : `${pillar.color}15`,
                                color: locked ? '#94a3b8' : pillar.color,
                              }}
                            >
                              {locked ? (
                                <Lock className="w-3.5 h-3.5" />
                              ) : status === 'completed' ? (
                                <CheckCircle2 className="w-5 h-5" style={{ color: pillar.color }} />
                              ) : status === 'in_progress' ? (
                                <PlayCircle className="w-5 h-5" style={{ color: pillar.color }} />
                              ) : (
                                <span>{idx + 1}</span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold text-sm truncate ${locked ? 'text-slate-400' : 'text-slate-700'}`}>
                                {m.title}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                {DIFFICULTY_LABELS[m.difficulty]}
                                {m.progress?.score ? ` · ${m.progress.score}%` : ''}
                              </p>
                            </div>

                            {!locked && status === 'completed' ? (
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
                            ) : isNext ? (
                              <ChevronRight className="w-4 h-4 text-brand-500 shrink-0" />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pillar footer */}
                  {data.nextUnlocked ? (
                    <div className="px-5 pb-5">
                      <button
                        onClick={() => setActiveModule(data.nextUnlocked!)}
                        className="w-full flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-brand-50 hover:to-ocean-50 rounded-xl transition-all group"
                      >
                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 group-hover:text-brand-600">
                          <Flame className="w-3.5 h-3.5" /> Next Up
                        </span>
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-brand-700 truncate ml-2">
                          {data.nextUnlocked.title}
                        </span>
                      </button>
                    </div>
                  ) : data.completed === data.total && data.total > 0 ? (
                    <div className="px-5 pb-5">
                      <div className="flex items-center justify-center gap-2 py-2.5 bg-accent-50 rounded-xl">
                        <Trophy className="w-4 h-4 text-accent-600" />
                        <span className="text-sm font-semibold text-accent-700">Pillar Complete!</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {activeModule && (
        <ActivityModal
          module={activeModule}
          onClose={() => setActiveModule(null)}
          onComplete={(score) => handleActivityComplete(activeModule, score)}
        />
      )}

      {showLevelUp && (
        <LevelUpModal
          profileName={profile.name}
          fromLevel="Kindergarten"
          toLevel="Primary — Infants 1"
          onConfirm={handleLevelUpConfirm}
          onDismiss={() => setShowLevelUp(false)}
        />
      )}
    </div>
  );
}
