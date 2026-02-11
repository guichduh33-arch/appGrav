import type { ReactNode } from 'react';

interface IStatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  variant?: 'blue' | 'green' | 'orange' | 'purple';
}

export function StatCard({ label, value, icon, variant = 'blue' }: IStatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card__content">
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
      </div>
      <div className={`stat-card__icon stat-card__icon--${variant}`}>{icon}</div>
    </div>
  );
}
