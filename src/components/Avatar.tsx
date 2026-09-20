import { GraduationCap } from 'lucide-react';

interface AvatarProps {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-14 h-14 text-lg',
  lg: 'w-20 h-20 text-2xl',
  xl: 'w-28 h-28 text-3xl',
};

export function Avatar({ name, color, size = 'md' }: AvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div
      className={`${sizeMap[size]} rounded-2xl flex items-center justify-center font-bold font-display text-white shadow-md shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initials || <GraduationCap className="w-1/2 h-1/2" />}
    </div>
  );
}
