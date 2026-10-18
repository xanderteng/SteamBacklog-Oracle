import React from 'react';
import { LucideIcon } from 'lucide-react';
import { CornerBrackets } from './CornerBrackets';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: 'cyan' | 'indigo' | 'amber' | 'emerald';
  testId?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  accent = 'cyan',
  testId,
}) => {
  const accentStyles = {
    cyan: {
      border: 'border-neon-cyan/30 hover:border-neon-cyan/60',
      text: 'text-neon-cyan',
      glow: 'group-hover:shadow-glow-cyan',
      iconBg: 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30',
      bracket: 'text-neon-cyan/60',
    },
    indigo: {
      border: 'border-neon-indigo/30 hover:border-neon-indigo/60',
      text: 'text-neon-indigo',
      glow: 'group-hover:shadow-glow-indigo',
      iconBg: 'bg-neon-indigo/10 text-neon-indigo border-neon-indigo/30',
      bracket: 'text-neon-indigo/60',
    },
    amber: {
      border: 'border-neon-amber/30 hover:border-neon-amber/60',
      text: 'text-neon-amber',
      glow: 'group-hover:shadow-glow-amber',
      iconBg: 'bg-neon-amber/10 text-neon-amber border-neon-amber/30',
      bracket: 'text-neon-amber/60',
    },
    emerald: {
      border: 'border-neon-emerald/30 hover:border-neon-emerald/60',
      text: 'text-neon-emerald',
      glow: 'group-hover:shadow-glow-emerald',
      iconBg: 'bg-neon-emerald/10 text-neon-emerald border-neon-emerald/30',
      bracket: 'text-neon-emerald/60',
    },
  }[accent];

  return (
    <div
      data-testid={testId || `stat-card-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className={`group relative p-3.5 bg-obsidian-850/80 border ${accentStyles.border} rounded-sm transition-all duration-300 backdrop-blur-sm ${accentStyles.glow}`}
    >
      <CornerBrackets accentColor={accentStyles.bracket} />

      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="block font-mono text-[10px] tracking-widest text-slate-400 uppercase font-medium">
            {label}
          </span>
          <span
            className={`block font-display font-bold text-2xl tracking-tight mt-0.5 ${accentStyles.text}`}
          >
            {value}
          </span>
        </div>

        <div className={`p-2 rounded border ${accentStyles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
