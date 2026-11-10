import React from 'react';
import { clsx } from '../../utils/format';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'indigo';
  onClick?: () => void;
}

const colorMap = {
  blue: { icon: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
  green: { icon: 'bg-green-50 text-green-600', border: 'border-green-100' },
  amber: { icon: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
  red: { icon: 'bg-red-50 text-red-600', border: 'border-red-100' },
  purple: { icon: 'bg-purple-50 text-purple-600', border: 'border-purple-100' },
  indigo: { icon: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' },
};

export function StatCard({ title, value, subtitle, icon, trend, color = 'blue', onClick }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border p-5 flex items-start gap-4 shadow-sm',
        c.border,
        onClick && 'cursor-pointer hover:shadow-md transition-shadow',
      )}
      onClick={onClick}
    >
      {icon && (
        <div className={clsx('p-3 rounded-xl flex-shrink-0', c.icon)}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5 truncate">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1 truncate">{subtitle}</p>}
        {trend && (
          <div className={clsx('flex items-center gap-1 mt-1.5 text-xs font-medium', trend.value >= 0 ? 'text-green-600' : 'text-red-500')}>
            <span>{trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
            <span className="text-gray-400 font-normal">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  title?: string;
  action?: React.ReactNode;
}

export function Card({ children, className, padding = true, title, action }: CardProps) {
  return (
    <div className={clsx('bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden', className)}>
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {action}
        </div>
      )}
      <div className={clsx(padding && 'p-5')}>
        {children}
      </div>
    </div>
  );
}
