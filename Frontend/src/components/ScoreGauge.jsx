import React from 'react';

export default function ScoreGauge({ score = 87 }) {
  // Arc calculation
  const radius = 80;
  const strokeWidth = 12;
  const circumference = Math.PI * radius; // Semi-circle circumference
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center p-2">
      <svg className="w-52 h-28 overflow-visible">
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Track */}
        <path
          d="M 10 100 A 80 80 0 0 1 170 100"
          fill="none"
          stroke="currentColor"
          className="text-gray-300 dark:text-gray-800"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Dynamic Glowing Progress Arc */}
        <path
          d="M 10 100 A 80 80 0 0 1 170 100"
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter="url(#glow)"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Score Overlay */}
      <div className="absolute top-12 flex flex-col items-center">
        <span className="text-4xl font-extrabold tracking-tight text-emerald-500 dark:text-emerald-400">
          {score}%
        </span>
        <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400">
          Match Score
        </span>
      </div>

      {/* Verdict Pill Badge */}
      <div className="mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        Strong Match — High Fit
      </div>
    </div>
  );
}