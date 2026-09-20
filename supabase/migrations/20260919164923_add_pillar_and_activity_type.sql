/*
# Add pillar + activity_type to modules, replace kindergarten modules

1. Modified Tables
  - `modules` — added two new columns:
    - `pillar` (text, nullable) — for kindergarten: 'reading' | 'maths' | 'writing'. NULL for non-kindergarten modules.
    - `activity_type` (text, nullable) — interactive type: 'letter_match' | 'tracing' | 'voice_spelling' | 'counting' | 'shape_match' | 'standard'. NULL for existing modules (treated as standard).
2. Data Changes
  - Deletes existing kindergarten modules (and cascades their module_progress rows) to replace with a structured 3-pillar set.
  - Inserts 9 kindergarten modules: 3 per pillar (Reading, Maths, Writing), each with progressive prerequisites within the pillar.
3. Security
  - No policy changes — existing anon CRUD policies already cover all modules.
4. Notes
  - pillar + activity_type are nullable so non-kindergarten modules are unaffected.
  - Each pillar has 3 modules chained by prerequisites. When all 9 are completed, the Level Up event triggers in the app to advance the profile to Infants 1.
*/

ALTER TABLE modules ADD COLUMN IF NOT EXISTS pillar text;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS activity_type text;

DELETE FROM modules WHERE level_key = 'kindergarten';

INSERT INTO modules (level_key, subject, title, description, difficulty, sequence_order, prerequisite_module_id, pillar, activity_type)
VALUES
-- Reading pillar: letter recognition → phonics → simple blending
('kindergarten', 'Reading', 'Letter Recognition', 'Tap and identify uppercase and lowercase letters A through Z.', 1, 1, NULL, 'reading', 'letter_match'),
('kindergarten', 'Reading', 'Phonics Sounds', 'Match each letter to the sound it makes.', 2, 2, (SELECT id FROM modules WHERE title='Letter Recognition' AND level_key='kindergarten'), 'reading', 'letter_match'),
('kindergarten', 'Reading', 'Simple Blending', 'Blend consonant and vowel sounds to read three-letter words like "cat" and "pig".', 3, 3, (SELECT id FROM modules WHERE title='Phonics Sounds' AND level_key='kindergarten'), 'reading', 'voice_spelling'),

-- Maths pillar: counting → basic shapes → single-digit addition
('kindergarten', 'Mathematics', 'Counting 1–20', 'Count objects and tap the correct number.', 1, 1, NULL, 'maths', 'counting'),
('kindergarten', 'Mathematics', 'Basic Shapes', 'Identify circles, squares, triangles, and rectangles.', 2, 2, (SELECT id FROM modules WHERE title='Counting 1–20' AND level_key='kindergarten'), 'maths', 'shape_match'),
('kindergarten', 'Mathematics', 'Single-Digit Addition', 'Add two single-digit numbers using visual counters.', 3, 3, (SELECT id FROM modules WHERE title='Basic Shapes' AND level_key='kindergarten'), 'maths', 'counting'),

-- Writing pillar: stroke tracing → letter tracing → voice spelling
('kindergarten', 'Writing', 'Stroke Practice', 'Trace straight lines, curves, and zigzags to build pen control.', 1, 1, NULL, 'writing', 'tracing'),
('kindergarten', 'Writing', 'Letter Tracing', 'Trace uppercase and lowercase letters on screen.', 2, 2, (SELECT id FROM modules WHERE title='Stroke Practice' AND level_key='kindergarten'), 'writing', 'tracing'),
('kindergarten', 'Writing', 'Voice Spelling', 'Say the word you see and hear — a voice spelling challenge!', 3, 3, (SELECT id FROM modules WHERE title='Letter Tracing' AND level_key='kindergarten'), 'writing', 'voice_spelling')
ON CONFLICT DO NOTHING;
