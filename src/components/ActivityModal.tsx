import { X } from 'lucide-react';
import type { ModuleWithProgress } from '@/types';
import { TracingActivity } from './activities/TracingActivity';
import { VoiceSpellingActivity } from './activities/VoiceSpellingActivity';
import { LetterMatchActivity } from './activities/LetterMatchActivity';
import { CountingActivity } from './activities/CountingActivity';
import { ShapeMatchActivity } from './activities/ShapeMatchActivity';
import { QuizActivity } from './activities/QuizActivity';

interface ActivityModalProps {
  module: ModuleWithProgress;
  onClose: () => void;
  onComplete: (score: number, passed?: boolean) => void;
}

const ACTIVITY_TITLE_MAP: Record<string, string> = {
  letter_match: 'Letter Match',
  tracing: 'Tracing',
  voice_spelling: 'Voice Spelling',
  counting: 'Counting',
  shape_match: 'Shape Match',
  quiz: 'Quiz',
};

const TRACING_LETTERS = ['A', 'B', 'C', 'D', 'E', 'a', 'b', 'c', 'd', 'e', 'M', 'S', 'T'];
const VOICE_WORDS = ['cat', 'dog', 'sun', 'pig', 'hat', 'bat', 'cup', 'box'];

export function ActivityModal({ module, onClose, onComplete }: ActivityModalProps) {
  const activityType = module.activity_type ?? 'standard';
  const title = ACTIVITY_TITLE_MAP[activityType] ?? module.title;

  function handleScore(score: number) {
    onComplete(score);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-500">
              {module.pillar ? `${module.pillar} pillar` : module.subject}
            </p>
            <h2 className="text-lg font-bold font-display text-slate-800">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {activityType === 'letter_match' && (
            <LetterMatchActivity
              onComplete={handleScore}
              onCancel={onClose}
              mode={module.title.includes('Phonics') ? 'sound' : module.title.includes('Blending') ? 'lowercase' : 'uppercase'}
            />
          )}
          {activityType === 'tracing' && (
            <TracingActivity
              onComplete={handleScore}
              onCancel={onClose}
              letter={module.title.includes('Stroke') ? '\/\/' : TRACING_LETTERS[Math.floor(Math.random() * TRACING_LETTERS.length)]}
            />
          )}
          {activityType === 'voice_spelling' && (
            <VoiceSpellingActivity
              onComplete={handleScore}
              onCancel={onClose}
              words={VOICE_WORDS.slice(0, 4)}
            />
          )}
          {activityType === 'counting' && (
            <CountingActivity
              onComplete={handleScore}
              onCancel={onClose}
              mode={module.title.includes('Addition') ? 'add' : 'count'}
            />
          )}
          {activityType === 'shape_match' && (
            <ShapeMatchActivity
              onComplete={handleScore}
              onCancel={onClose}
            />
          )}
          {activityType === 'quiz' && (
            <QuizActivity
              onComplete={(score, passed) => onComplete(score, passed)}
              onCancel={onClose}
              subject={module.subject}
              moduleTitle={module.title}
              difficulty={module.difficulty}
            />
          )}
          {activityType === 'standard' && (
            <div className="text-center py-8">
              <p className="text-slate-500">{module.description}</p>
              <button
                onClick={() => handleScore(85)}
                className="mt-6 px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors"
              >
                Mark Complete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
