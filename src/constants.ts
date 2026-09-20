export interface LevelOption {
  key: string;
  label: string;
  category: string;
  order: number;
}

export const GRADE_LEVELS: LevelOption[] = [
  { key: 'kindergarten', label: 'Toddler / Kindergarten', category: 'Early Childhood', order: 0 },
  { key: 'primary_infants_1', label: 'Primary — Infants 1', category: 'Primary', order: 1 },
  { key: 'primary_infants_2', label: 'Primary — Infants 2', category: 'Primary', order: 2 },
  { key: 'standard_1', label: 'Standard 1', category: 'Primary', order: 3 },
  { key: 'standard_2', label: 'Standard 2', category: 'Primary', order: 4 },
  { key: 'standard_3', label: 'Standard 3', category: 'Primary', order: 5 },
  { key: 'standard_4', label: 'Standard 4', category: 'Primary', order: 6 },
  { key: 'standard_5', label: 'Standard 5 (SEA Prep)', category: 'Primary', order: 7 },
  { key: 'form_1', label: 'Secondary — Form 1', category: 'Secondary', order: 8 },
  { key: 'form_2', label: 'Secondary — Form 2', category: 'Secondary', order: 9 },
  { key: 'form_3', label: 'Secondary — Form 3', category: 'Secondary', order: 10 },
  { key: 'form_4', label: 'Secondary — Form 4', category: 'Secondary', order: 11 },
  { key: 'form_5', label: 'Secondary — Form 5 (CSEC)', category: 'Secondary', order: 12 },
];

export const LEVEL_KEY_TO_LABEL: Record<string, string> = Object.fromEntries(
  GRADE_LEVELS.map((l) => [l.key, l.label]),
);

export const AVATAR_COLORS = [
  '#0d9488', '#0891b2', '#2563eb', '#7c3aed',
  '#c026d3', '#db2777', '#dc2626', '#ea580c',
  '#ca8a04', '#16a34a', '#059669', '#4f46e5',
];

export const SUBJECT_ICONS: Record<string, string> = {
  'Mathematics': 'Calculator',
  'Numeracy': 'Calculator',
  'Language Arts': 'BookOpen',
  'English': 'BookOpen',
  'Science': 'FlaskConical',
  'Social Studies': 'Globe2',
};

export const SUBJECT_COLORS: Record<string, string> = {
  'Mathematics': '#2563eb',
  'Numeracy': '#2563eb',
  'Language Arts': '#16a34a',
  'English': '#16a34a',
  'Science': '#db2777',
  'Social Studies': '#ea580c',
};

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
};

export interface PillarConfig {
  key: string;
  label: string;
  color: string;
  gradient: string;
  icon: string;
  description: string;
}

export const KINDERGARTEN_PILLARS: PillarConfig[] = [
  {
    key: 'reading',
    label: 'Reading',
    color: '#2563eb',
    gradient: 'from-ocean-500 to-ocean-600',
    icon: 'BookOpen',
    description: 'Letter recognition, phonics, and simple blending',
  },
  {
    key: 'maths',
    label: 'Maths',
    color: '#16a34a',
    gradient: 'from-brand-500 to-brand-600',
    icon: 'Calculator',
    description: 'Counting, basic shapes, and single-digit addition',
  },
  {
    key: 'writing',
    label: 'Writing',
    color: '#db2777',
    gradient: 'from-pink-500 to-rose-600',
    icon: 'PenLine',
    description: 'Stroke tracing and voice spelling challenges',
  },
];
