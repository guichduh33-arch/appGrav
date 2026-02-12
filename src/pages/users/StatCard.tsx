import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface IStatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  variant?: 'blue' | 'green' | 'orange' | 'purple';
}

const iconVariants: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  orange: 'bg-orange-50 text-orange-600',
  purple: 'bg-purple-50 text-purple-600',
};

export function StatCard({ label, value, icon, variant = 'blue' }: IStatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex flex-col">
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconVariants[variant])}>
        {icon}
      </div>
    </div>
  );
}
