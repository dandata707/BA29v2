import React from 'react';
import { ChevronDown } from 'lucide-react';

interface TruncatedSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  displayValue: string;
}

// The native select keeps keyboard/option behavior while the visible label ellipsizes.
export function TruncatedSelect({ displayValue, className = '', title, disabled, children, ...props }: TruncatedSelectProps) {
  return <div title={title || displayValue} className={`relative w-full min-w-0 rounded-lg border border-slate-200 text-xs focus-within:ring-1 focus-within:ring-blue-500 ${disabled ? 'bg-slate-50 text-slate-400' : 'bg-white text-slate-800'} ${className}`}>
    <span aria-hidden="true" className="block truncate py-2 pl-2 pr-7 pointer-events-none">{displayValue}</span>
    <ChevronDown aria-hidden="true" className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" />
    <select {...props} title={title || displayValue} disabled={disabled} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed">{children}</select>
  </div>;
}
