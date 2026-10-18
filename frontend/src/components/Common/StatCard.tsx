import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: 'amber' | 'crimson' | 'indigo' | 'cyan' | 'terracotta' | 'gold';
  testId?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  accent = 'gold',
  testId,
}) => {
  const accentStyles = {
    amber: {
      border: 'border-[#38312b] hover:border-[#78350f]',
      text: 'text-[#f59e0b]',
      iconBg: 'bg-[#78350f]/20 text-[#fbbf24] border-[#78350f]/40',
    },
    gold: {
      border: 'border-[#38312b] hover:border-[#b45309]',
      text: 'text-[#fbbf24]',
      iconBg: 'bg-[#b45309]/20 text-[#fcd34d] border-[#b45309]/40',
    },
    terracotta: {
      border: 'border-[#38312b] hover:border-[#c2410c]',
      text: 'text-[#fb923c]',
      iconBg: 'bg-[#c2410c]/20 text-[#fdba74] border-[#c2410c]/40',
    },
    crimson: {
      border: 'border-[#38312b] hover:border-[#991b1b]',
      text: 'text-[#f87171]',
      iconBg: 'bg-[#991b1b]/20 text-[#fca5a5] border-[#991b1b]/40',
    },
    indigo: {
      border: 'border-[#38312b] hover:border-[#635345]',
      text: 'text-[#e7e5e4]',
      iconBg: 'bg-[#29231e] text-[#d6d3d1] border-[#38312b]',
    },
    cyan: {
      border: 'border-[#38312b] hover:border-[#78350f]',
      text: 'text-[#fcd34d]',
      iconBg: 'bg-[#78350f]/20 text-[#fbbf24] border-[#78350f]/40',
    },
  }[accent] || {
    border: 'border-[#38312b] hover:border-[#4a3e35]',
    text: 'text-stone-100',
    iconBg: 'bg-[#24201d] text-stone-300 border-[#38312b]',
  };

  return (
    <div
      data-testid={testId || `stat-card-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className={`group relative p-4 bg-[#1c1917] border ${accentStyles.border} rounded-sm transition-all duration-300 shadow-tactile-card hover:-translate-y-0.5`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="block font-sans text-xs tracking-wider text-stone-400 font-medium">
            {label}
          </span>
          <span
            className={`block font-serif font-bold text-2xl tracking-tight mt-1 ${accentStyles.text}`}
          >
            {value}
          </span>
        </div>

        <div className={`p-2.5 rounded-sm border ${accentStyles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
