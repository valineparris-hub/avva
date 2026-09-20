import { useState, useEffect, useCallback } from 'react';
import {
  FlaskConical,
  ClipboardList,
  Circle,
  PlayCircle,
  CheckCircle2,
  Award,
  Upload,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  FileText,
  TrendingUp,
} from 'lucide-react';
import type { Profile, SBATask, SBASubmission, SBATaskWithSubmission, SBAStatus } from '@/types';
import { supabase } from '@/lib/supabase';

interface SBAPortalProps {
  profile: Profile;
}

const STATUS_CONFIG: Record<SBAStatus, { label: string; color: string; bg: string; icon: typeof Circle }> = {
  not_started: { label: 'Not Started', color: 'text-slate-500', bg: 'bg-slate-100', icon: Circle },
  in_progress: { label: 'In Progress', color: 'text-amber-600', bg: 'bg-amber-50', icon: PlayCircle },
  submitted: { label: 'Submitted', color: 'text-ocean-600', bg: 'bg-ocean-50', icon: Upload },
  graded: { label: 'Graded', color: 'text-brand-600', bg: 'bg-brand-50', icon: CheckCircle2 },
};

const PROGRESS_OPTIONS = [0, 25, 50, 75, 100];

export function SBAPortal({ profile }: SBAPortalProps) {
  const [tasks, setTasks] = useState<SBATaskWithSubmission[]>([]);
  const [submissions, setSubmissions] = useState<SBASubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [taskRes, subRes] = await Promise.all([
      supabase.from('sba_tasks').select('*').order('subject'),
      supabase.from('sba_submissions').select('*').eq('profile_id', profile.id),
    ]);

    const taskList = (taskRes.data ?? []) as SBATask[];
    const subList = (subRes.data ?? []) as SBASubmission[];
    setSubmissions(subList);

    const subMap = new Map<string, SBASubmission>();
    subList.forEach((s) => subMap.set(s.task_id, s));

    const combined: SBATaskWithSubmission[] = taskList.map((t) => ({
      ...t,
      submission: subMap.get(t.id),
    }));
    setTasks(combined);
    setLoading(false);
  }, [profile.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function updateSubmission(taskId: string, updates: Partial<SBASubmission>) {
    const existing = submissions.find((s) => s.task_id === taskId);
    if (existing) {
      const { error } = await supabase
        .from('sba_submissions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (error) console.error('Failed to update submission:', error.message);
    } else {
      const { error } = await supabase.from('sba_submissions').insert({
        profile_id: profile.id,
        task_id: taskId,
        status: updates.status ?? 'in_progress',
        progress_pct: updates.progress_pct ?? 0,
        notes: updates.notes ?? null,
        submitted_at: updates.submitted_at ?? null,
      });
      if (error) console.error('Failed to create submission:', error.message);
    }
    await loadData();
  }

  const sbaTasks = tasks.filter((t) => t.task_type === 'sba');
  const labTasks = tasks.filter((t) => t.task_type === 'lab');

  const allSubs = tasks.map((t) => t.submission).filter(Boolean) as SBASubmission[];
  const submittedCount = allSubs.filter((s) => s.status === 'submitted' || s.status === 'graded').length;
  const gradedCount = allSubs.filter((s) => s.status === 'graded').length;
  const avgProgress = allSubs.length > 0
    ? Math.round(allSubs.reduce((a, s) => a + s.progress_pct, 0) / allSubs.length)
    : 0;

  function renderTaskCard(task: SBATaskWithSubmission) {
    const sub = task.submission;
    const status: SBAStatus = sub?.status ?? 'not_started';
    const config = STATUS_CONFIG[status];
    const StatusIcon = config.icon;
    const isExpanded = expandedTask === task.id;

    return (
      <div
        key={task.id}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <button
          onClick={() => setExpandedTask(isExpanded ? null : task.id)}
          className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50/50 transition-colors"
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${config.bg}`}>
            <StatusIcon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-slate-800 truncate">{task.title}</p>
            <p className="text-xs text-slate-400 truncate">
              {task.subject} · {task.max_marks} marks
              {task.due_phase && ` · ${task.due_phase}`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${config.bg} ${config.color}`}>
              {config.label}
            </span>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 animate-fade-in border-t border-slate-50">
            <p className="text-xs text-slate-500 mt-3 mb-3 leading-relaxed">{task.description}</p>

            {/* Progress selector */}
            <div className="mb-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                Progress
              </label>
              <div className="flex gap-2">
                {PROGRESS_OPTIONS.map((pct) => (
                  <button
                    key={pct}
                    onClick={() => updateSubmission(task.id, {
                      progress_pct: pct,
                      status: pct === 100 ? 'submitted' : pct > 0 ? 'in_progress' : 'not_started',
                      submitted_at: pct === 100 ? new Date().toISOString() : null,
                    })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      (sub?.progress_pct ?? 0) === pct
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-500"
                  style={{ width: `${sub?.progress_pct ?? 0}%` }}
                />
              </div>
            </div>

            {/* Status actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateSubmission(task.id, { status: 'in_progress' })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  status === 'in_progress'
                    ? 'border-amber-300 bg-amber-50 text-amber-700'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                Mark In Progress
              </button>
              <button
                onClick={() => updateSubmission(task.id, {
                  status: 'submitted',
                  progress_pct: 100,
                  submitted_at: new Date().toISOString(),
                })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  status === 'submitted'
                    ? 'border-ocean-300 bg-ocean-50 text-ocean-700'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                Submit
              </button>
              <button
                onClick={() => updateSubmission(task.id, {
                  status: 'graded',
                  graded_at: new Date().toISOString(),
                })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  status === 'graded'
                    ? 'border-brand-300 bg-brand-50 text-brand-700'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                Mark as Graded
              </button>
            </div>

            {/* Marks display */}
            {sub?.status === 'graded' && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-accent-50 rounded-xl">
                <Award className="w-4 h-4 text-accent-600" />
                <span className="text-sm font-semibold text-accent-700">
                  {sub.marks_awarded ?? '—'} / {task.max_marks} marks
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <ClipboardList className="w-5 h-5 text-slate-400 mb-1.5" />
          <p className="text-2xl font-bold font-display text-slate-800 tabular-nums">{tasks.length}</p>
          <p className="text-xs text-slate-400">Total Tasks</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <PlayCircle className="w-5 h-5 text-amber-400 mb-1.5" />
          <p className="text-2xl font-bold font-display text-slate-800 tabular-nums">
            {allSubs.filter((s) => s.status === 'in_progress').length}
          </p>
          <p className="text-xs text-slate-400">In Progress</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <Upload className="w-5 h-5 text-ocean-400 mb-1.5" />
          <p className="text-2xl font-bold font-display text-slate-800 tabular-nums">{submittedCount}</p>
          <p className="text-xs text-slate-400">Submitted</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <TrendingUp className="w-5 h-5 text-brand-400 mb-1.5" />
          <p className="text-2xl font-bold font-display text-slate-800 tabular-nums">{avgProgress}%</p>
          <p className="text-xs text-slate-400">Avg Progress</p>
        </div>
      </div>

      {/* Lab Reports section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical className="w-5 h-5 text-pink-500" />
          <h3 className="text-lg font-bold font-display text-slate-800">Lab Reports</h3>
          <span className="text-xs text-slate-400 font-medium">({labTasks.length})</span>
        </div>
        <div className="space-y-2">
          {labTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
              No lab reports assigned yet.
            </div>
          ) : (
            labTasks.map(renderTaskCard)
          )}
        </div>
      </div>

      {/* SBA Projects section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-ocean-500" />
          <h3 className="text-lg font-bold font-display text-slate-800">SBA Projects</h3>
          <span className="text-xs text-slate-400 font-medium">({sbaTasks.length})</span>
        </div>
        <div className="space-y-2">
          {sbaTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
              No SBA projects assigned yet.
            </div>
          ) : (
            sbaTasks.map(renderTaskCard)
          )}
        </div>
      </div>

      {/* Add custom task button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-medium hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50/30 transition-all text-sm"
      >
        <Plus className="w-4 h-4" /> Add Custom Task
      </button>

      {showAddModal && <AddTaskModal profileId={profile.id} onClose={() => setShowAddModal(false)} onSaved={loadData} />}
    </div>
  );
}

function AddTaskModal({ profileId, onClose, onSaved }: { profileId: string; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [taskType, setTaskType] = useState<'sba' | 'lab'>('sba');
  const [description, setDescription] = useState('');
  const [maxMarks, setMaxMarks] = useState(20);
  const [duePhase, setDuePhase] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim() || !subject.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('sba_tasks').insert({
      title: title.trim(),
      subject: subject.trim(),
      task_type: taskType,
      description: description.trim() || null,
      max_marks: maxMarks,
      due_phase: duePhase.trim() || null,
    });
    if (error) {
      console.error('Failed to add task:', error.message);
    }
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold font-display text-slate-800">Add Custom Task</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Photosynthesis Investigation"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Biology"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Type</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as 'sba' | 'lab')}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-white"
              >
                <option value="sba">SBA Project</option>
                <option value="lab">Lab Report</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Max Marks</label>
              <input
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(parseInt(e.target.value) || 20)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Due Phase</label>
            <input
              value={duePhase}
              onChange={(e) => setDuePhase(e.target.value)}
              placeholder="e.g. Form 5 Term 1"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task instructions..."
              rows={3}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 resize-none"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !subject.trim() || saving}
            className="w-full py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 text-sm"
          >
            {saving ? 'Saving...' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
