import React from 'react';

interface CornerBracketsProps {
  accentColor?: string;
  size?: string;
  className?: string;
}

export const CornerBrackets: React.FC<CornerBracketsProps> = ({
  accentColor = 'text-neon-cyan/50',
  size = 'w-2.5 h-2.5',
  className = '',
}) => {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      {/* Top Left */}
      <span
        className={`absolute -top-px -left-px ${size} border-t-2 border-l-2 ${accentColor}`}
      />
      {/* Top Right */}
      <span
        className={`absolute -top-px -right-px ${size} border-t-2 border-r-2 ${accentColor}`}
      />
      {/* Bottom Left */}
      <span
        className={`absolute -bottom-px -left-px ${size} border-b-2 border-l-2 ${accentColor}`}
      />
      {/* Bottom Right */}
      <span
        className={`absolute -bottom-px -right-px ${size} border-b-2 border-r-2 ${accentColor}`}
      />
    </div>
  );
};
