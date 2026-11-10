import React from 'react';
import { clsx } from '../../utils/format';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

export function Input({ label, error, hint, icon, iconRight, fullWidth, className, ...props }: InputProps) {
  return (
    <div className={clsx('flex flex-col gap-1', fullWidth ? 'w-full' : '')}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-gray-400 pointer-events-none">{icon}</span>
        )}
        <input
          {...props}
          className={clsx(
            'w-full border rounded-lg bg-white text-gray-900 placeholder-gray-400',
            'h-10 px-3 text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500',
            'disabled:bg-gray-50 disabled:text-gray-500',
            error ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20' : 'border-gray-300',
            icon ? 'pl-9' : '',
            iconRight ? 'pr-9' : '',
            className,
          )}
        />
        {iconRight && (
          <span className="absolute right-3 text-gray-400">{iconRight}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export function Textarea({ label, error, hint, fullWidth, className, ...props }: TextareaProps) {
  return (
    <div className={clsx('flex flex-col gap-1', fullWidth ? 'w-full' : '')}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        {...props}
        className={clsx(
          'w-full border rounded-lg bg-white text-gray-900 placeholder-gray-400',
          'px-3 py-2 text-sm transition-colors resize-none',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500',
          error ? 'border-red-400' : 'border-gray-300',
          className,
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, hint, fullWidth, options, placeholder, className, ...props }: SelectProps) {
  return (
    <div className={clsx('flex flex-col gap-1', fullWidth ? 'w-full' : '')}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        {...props}
        className={clsx(
          'w-full border rounded-lg bg-white text-gray-900',
          'h-10 px-3 text-sm transition-colors appearance-none cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500',
          'disabled:bg-gray-50',
          error ? 'border-red-400' : 'border-gray-300',
          className,
        )}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
