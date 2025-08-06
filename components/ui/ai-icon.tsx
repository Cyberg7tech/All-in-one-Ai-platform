import React from 'react';

interface AIIconProps {
  className?: string;
  size?: number;
}

export function AIIcon({ className = '', size = 24 }: AIIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}>
      <circle cx='12' cy='12' r='11' fill='#3B82F6' stroke='#1E40AF' strokeWidth='1' />
      <circle cx='12' cy='12' r='9' fill='#2563EB' />
      {/* AI Robot Face */}
      <circle cx='9' cy='9' r='1.5' fill='white' />
      <circle cx='15' cy='9' r='1.5' fill='white' />
      <circle cx='9' cy='9' r='0.5' fill='#1E40AF' />
      <circle cx='15' cy='9' r='0.5' fill='#1E40AF' />

      {/* Robot mouth/smile */}
      <path d='M8 14 Q12 17 16 14' stroke='white' strokeWidth='1.5' strokeLinecap='round' fill='none' />

      {/* AI Circuit patterns */}
      <rect x='6' y='6' width='3' height='1' rx='0.5' fill='rgba(255,255,255,0.3)' />
      <rect x='15' y='6' width='3' height='1' rx='0.5' fill='rgba(255,255,255,0.3)' />
      <rect x='6' y='17' width='4' height='1' rx='0.5' fill='rgba(255,255,255,0.3)' />
      <rect x='14' y='17' width='4' height='1' rx='0.5' fill='rgba(255,255,255,0.3)' />

      {/* Central AI indicator */}
      <circle cx='12' cy='12' r='2' fill='rgba(255,255,255,0.2)' />
      <circle cx='12' cy='12' r='1' fill='white' />
    </svg>
  );
}
