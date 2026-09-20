/*
# Create SBA & Lab Portal tables (single-tenant, no auth)

1. New Tables
  - `sba_tasks` — School-Based Assessment task templates per CSEC subject.
      - id (uuid, pk)
      - subject (text, not null) — e.g. "Biology", "Chemistry", "Principles of Business"
      - title (text, not null) — e.g. "Investigating Osmosis in Potato Cells"
      - description (text) — detailed instructions for the SBA task
      - task_type (text, not null) — 'sba' or 'lab'
      - max_marks (int, default 20) — total marks the SBA is graded out of
      - due_phase (text) — e.g. "Form 4 Term 2", "Form 5 Term 1"
      - created_at (timestamptz)
  - `sba_submissions` — per-profile progress on each SBA/lab task.
      - id (uuid, pk)
      - profile_id (uuid, not null, FK to profiles.id ON DELETE CASCADE)
      - task_id (uuid, not null, FK to sba_tasks.id ON DELETE CASCADE)
      - status (text, not null, default 'not_started') — 'not_started', 'in_progress', 'submitted', 'graded'
      - progress_pct (int, default 0) — student's self-reported completion percentage
      - marks_awarded (int, nullable) — marks given after grading
      - notes (text) — student notes on their progress
      - submitted_at (timestamptz, nullable)
      - graded_at (timestamptz, nullable)
      - updated_at (timestamptz, default now())
      - UNIQUE(profile_id, task_id)
2. Security
  - Enable RLS on all new tables.
  - Single-tenant (no sign-in): policies TO anon, authenticated with USING (true) / WITH CHECK (true).
3. Notes
  - sba_tasks holds the master list of SBA and lab assignments.
  - sba_submissions tracks each student's progress on their SBAs and lab reports.
  - The SBA & Lab Portal reads from both tables to show a tracker dashboard.
*/

CREATE TABLE IF NOT EXISTS sba_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  title text NOT NULL,
  description text,
  task_type text NOT NULL DEFAULT 'sba',
  max_marks int NOT NULL DEFAULT 20,
  due_phase text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sba_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sba_tasks" ON sba_tasks;
CREATE POLICY "anon_select_sba_tasks" ON sba_tasks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sba_tasks" ON sba_tasks;
CREATE POLICY "anon_insert_sba_tasks" ON sba_tasks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sba_tasks" ON sba_tasks;
CREATE POLICY "anon_update_sba_tasks" ON sba_tasks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sba_tasks" ON sba_tasks;
CREATE POLICY "anon_delete_sba_tasks" ON sba_tasks FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS sba_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES sba_tasks(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started',
  progress_pct int NOT NULL DEFAULT 0,
  marks_awarded int,
  notes text,
  submitted_at timestamptz,
  graded_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, task_id)
);

ALTER TABLE sba_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sba_submissions" ON sba_submissions;
CREATE POLICY "anon_select_sba_submissions" ON sba_submissions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sba_submissions" ON sba_submissions;
CREATE POLICY "anon_insert_sba_submissions" ON sba_submissions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sba_submissions" ON sba_submissions;
CREATE POLICY "anon_update_sba_submissions" ON sba_submissions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sba_submissions" ON sba_submissions;
CREATE POLICY "anon_delete_sba_submissions" ON sba_submissions FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_sba_tasks_subject ON sba_tasks(subject);
CREATE INDEX IF NOT EXISTS idx_sba_submissions_profile ON sba_submissions(profile_id);
CREATE INDEX IF NOT EXISTS idx_sba_submissions_task ON sba_submissions(task_id);
