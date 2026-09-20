/*
# Create profiles, modules, and module_progress tables (single-tenant, no auth)

1. New Tables
  - `profiles` — educational learner profiles for Trinidad & Tobago students.
      - id (uuid, pk)
      - name (text, not null)
      - date_of_birth (date, not null)
      - grade_level (text, not null) — e.g. "Kindergarten", "Primary Infants 1", "Standard 3", "Secondary Form 2"
      - avatar_color (text) — a hex color used to render profile avatars
      - created_at (timestamptz)
  - `modules` — learning modules organized by level, subject, and sequence.
      - id (uuid, pk)
      - level_key (text, not null)
      - subject (text, not null)
      - title (text, not null)
      - description (text)
      - difficulty (int, not null, 1-3)
      - sequence_order (int, not null)
      - prerequisite_module_id (uuid, nullable, FK to modules.id)
      - created_at (timestamptz)
  - `module_progress` — per-profile progress on each module.
      - id (uuid, pk)
      - profile_id (uuid, not null, FK to profiles.id ON DELETE CASCADE)
      - module_id (uuid, not null, FK to modules.id ON DELETE CASCADE)
      - status (text, not null, default 'locked')
      - score (int, default 0)
      - attempts (int, default 0)
      - completed_at (timestamptz, nullable)
      - updated_at (timestamptz, default now())
      - UNIQUE(profile_id, module_id)
2. Security
  - Enable RLS on all three tables.
  - Single-tenant (no sign-in): policies TO anon, authenticated with USING (true) / WITH CHECK (true).
3. Notes
  - module_progress drives the adaptive learning pathway.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  date_of_birth date NOT NULL,
  grade_level text NOT NULL,
  avatar_color text DEFAULT '#0d9488',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_profiles" ON profiles;
CREATE POLICY "anon_select_profiles" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_profiles" ON profiles;
CREATE POLICY "anon_insert_profiles" ON profiles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_profiles" ON profiles;
CREATE POLICY "anon_update_profiles" ON profiles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_profiles" ON profiles;
CREATE POLICY "anon_delete_profiles" ON profiles FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_key text NOT NULL,
  subject text NOT NULL,
  title text NOT NULL,
  description text,
  difficulty int NOT NULL DEFAULT 1,
  sequence_order int NOT NULL DEFAULT 0,
  prerequisite_module_id uuid REFERENCES modules(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_modules" ON modules;
CREATE POLICY "anon_select_modules" ON modules FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_modules" ON modules;
CREATE POLICY "anon_insert_modules" ON modules FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_modules" ON modules;
CREATE POLICY "anon_update_modules" ON modules FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_modules" ON modules;
CREATE POLICY "anon_delete_modules" ON modules FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS module_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'locked',
  score int NOT NULL DEFAULT 0,
  attempts int NOT NULL DEFAULT 0,
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, module_id)
);

ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_module_progress" ON module_progress;
CREATE POLICY "anon_select_module_progress" ON module_progress FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_module_progress" ON module_progress;
CREATE POLICY "anon_insert_module_progress" ON module_progress FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_module_progress" ON module_progress;
CREATE POLICY "anon_update_module_progress" ON module_progress FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_module_progress" ON module_progress;
CREATE POLICY "anon_delete_module_progress" ON module_progress FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_modules_level_key ON modules(level_key);
CREATE INDEX IF NOT EXISTS idx_module_progress_profile ON module_progress(profile_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_module ON module_progress(module_id);
