export interface Profile {
  id: string;
  name: string;
  date_of_birth: string;
  grade_level: string;
  avatar_color: string;
  created_at: string;
}

export type ActivityType =
  | 'letter_match'
  | 'tracing'
  | 'voice_spelling'
  | 'counting'
  | 'shape_match'
  | 'quiz'
  | 'standard';

export type Pillar = 'reading' | 'maths' | 'writing';

export interface Module {
  id: string;
  level_key: string;
  subject: string;
  title: string;
  description: string | null;
  difficulty: number;
  sequence_order: number;
  prerequisite_module_id: string | null;
  pillar: Pillar | null;
  activity_type: ActivityType | null;
  created_at: string;
}

export type ModuleStatus = 'locked' | 'in_progress' | 'completed';

export interface ModuleProgress {
  id: string;
  profile_id: string;
  module_id: string;
  status: ModuleStatus;
  score: number;
  attempts: number;
  completed_at: string | null;
  updated_at: string;
}

export interface ModuleWithProgress extends Module {
  progress?: ModuleProgress;
  is_unlocked: boolean;
}

export type SBATaskType = 'sba' | 'lab';

export type SBAStatus = 'not_started' | 'in_progress' | 'submitted' | 'graded';

export interface SBATask {
  id: string;
  subject: string;
  title: string;
  description: string | null;
  task_type: SBATaskType;
  max_marks: number;
  due_phase: string | null;
  created_at: string;
}

export interface SBASubmission {
  id: string;
  profile_id: string;
  task_id: string;
  status: SBAStatus;
  progress_pct: number;
  marks_awarded: number | null;
  notes: string | null;
  submitted_at: string | null;
  graded_at: string | null;
  updated_at: string;
}

export interface SBATaskWithSubmission extends SBATask {
  submission?: SBASubmission;
}
