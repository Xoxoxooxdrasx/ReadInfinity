import clsx from 'clsx';
import React from 'react';

export interface SegmentedControlOption<T extends string | number> {
  value: T;
  label: React.ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
}

interface SegmentedControlProps<T extends string | number> {
  options: ReadonlyArray<SegmentedControlOption<T>>;
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  className?: string;
}

const SegmentedControl = <T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  disabled,
  size = 'sm',
  fullWidth = false,
  className,
}: SegmentedControlProps<T>) => {
  const sizeClasses =
    size === 'md' ? 'h-9 px-4 text-sm' : 'h-8 px-3 text-xs sm:text-sm';

  return (
    <div
      role='radiogroup'
      aria-label={ariaLabel}
      className={clsx(
        // M3 Segmented Track: Full Pill Container with subtle outline
        'rounded-full p-1 transition-colors duration-200',
        'bg-neutral-200/60 dark:bg-neutral-800/60',
        'border border-neutral-300/40 dark:border-neutral-700/50',
        fullWidth ? 'flex w-full' : 'inline-flex items-center',
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        const optionDisabled = !!disabled || !!option.disabled;
        return (
          <button
            key={String(option.value)}
            type='button'
            role='radio'
            aria-checked={selected}
            aria-label={option.ariaLabel}
            disabled={optionDisabled}
            onClick={() => {
              if (!selected) onChange(option.value);
            }}
            className={clsx(
              // M3 Segment Geometry & Typography
              'inline-flex items-center justify-center rounded-full font-medium tracking-tight',
              'transition-all duration-200 ease-out select-none',
              fullWidth && 'flex-1 min-w-0',
              sizeClasses,
              selected
                ? 'bg-primary text-primary-content shadow-sm font-semibold'
                : 'text-neutral-700 hover:bg-neutral-500/10 active:bg-neutral-500/15 dark:text-neutral-300 dark:hover:bg-neutral-400/12 dark:active:bg-neutral-400/20',
              optionDisabled && 'pointer-events-none opacity-40 cursor-not-allowed !bg-transparent',
              !optionDisabled && 'active:scale-[0.97]',
            )}
          >
            <span className='truncate'>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;