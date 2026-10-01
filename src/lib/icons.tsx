import {
  Activity,
  Apple,
  Award,
  BookOpen,
  CigaretteOff,
  Clock,
  Droplets,
  Dumbbell,
  Flame,
  Heart,
  Moon,
  Salad,
  ShieldBan,
  Smartphone,
  Sun,
  Target,
  Trophy,
  Utensils,
  Zap,
} from 'lucide-react';

export const HABIT_ICONS = [
  { id: 'target', label: 'Target', icon: Target },
  { id: 'dumbbell', label: 'Workout', icon: Dumbbell },
  { id: 'book-open', label: 'Reading', icon: BookOpen },
  { id: 'droplets', label: 'Water', icon: Droplets },
  { id: 'moon', label: 'Sleep', icon: Moon },
  { id: 'utensils', label: 'Diet', icon: Utensils },
  { id: 'flame', label: 'Fitness', icon: Flame },
  { id: 'shield-ban', label: 'Avoidance', icon: ShieldBan },
  { id: 'smartphone', label: 'Screen Time', icon: Smartphone },
  { id: 'cigarette-off', label: 'No Smoking', icon: CigaretteOff },
  { id: 'heart', label: 'Health', icon: Heart },
  { id: 'activity', label: 'Cardio', icon: Activity },
  { id: 'apple', label: 'Healthy Snack', icon: Apple },
  { id: 'salad', label: 'Clean Eating', icon: Salad },
  { id: 'sun', label: 'Morning Routine', icon: Sun },
  { id: 'trophy', label: 'Achievement', icon: Trophy },
  { id: 'clock', label: 'Discipline', icon: Clock },
  { id: 'zap', label: 'Energy', icon: Zap },
  { id: 'award', label: 'Goal', icon: Award },
];

export const HABIT_COLORS = [
  { id: 'indigo', name: 'Indigo', bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500' },
  { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500' },
  { id: 'rose', name: 'Rose', bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500' },
  { id: 'sky', name: 'Sky Blue', bg: 'bg-sky-500', text: 'text-sky-500', border: 'border-sky-500' },
  { id: 'amber', name: 'Amber', bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500' },
  { id: 'purple', name: 'Purple', bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500' },
  { id: 'teal', name: 'Teal', bg: 'bg-teal-500', text: 'text-teal-500', border: 'border-teal-500' },
  { id: 'orange', name: 'Orange', bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' },
];

export function renderHabitIcon(iconName?: string, className: string = 'w-5 h-5') {
  const match = HABIT_ICONS.find((item) => item.id === iconName);
  const IconComponent = match ? match.icon : Target;
  return <IconComponent className={className} />;
}
