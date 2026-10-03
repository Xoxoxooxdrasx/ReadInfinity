import clsx from 'clsx';
import React from 'react';

type Option = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  disabled?: boolean;
  className?: string;
};

export default function Select({
  value,
  onChange,
  options,
  className,
  disabled = false,
}: SelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      onKeyDown={(e) => e.stopPropagation()}
      className={clsx(
        // M3 Compact Select Container & Typography
        'h-8 min-h-[32px] max-w-[65%] truncate rounded-xl px-2.5 text-sm font-medium',
        'text-neutral-800 dark:text-neutral-200',
        'bg-transparent transition-all duration-150',
        // M3 State Layers on Hover/Focus
        'hover:bg-neutral-500/10 active:bg-neutral-500/15',
        'dark:hover:bg-neutral-400/12 dark:active:bg-neutral-400/18',
        // Focus & Borderless Reset
        'border-none focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-primary/40',
        disabled && 'pointer-events-none opacity-40 cursor-not-allowed',
        className,
      )}
      disabled={disabled}
      style={{
        textAlignLast: 'end',
      }}
    >
      {options.map(({ value, label, disabled: optionDisabled }) => (
        <option
          key={value}
          value={value}
          disabled={optionDisabled}
          className='bg-neutral-50 py-1 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100'
        >
          {label}
        </option>
      ))}
    </select>
  );
}