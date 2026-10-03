'use client';

import clsx from 'clsx';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { PIN_LENGTH } from '@/libs/crypto/applock';

interface PinInputProps {
  value: string;
  onChange: (next: string) => void;
  autoFocus?: boolean;
  shake?: boolean;
  disabled?: boolean;
  ariaLabel: string;
  /**
   * When true, the component keeps focus pinned to the hidden input —
   * used by the full-screen lock screen so the on-screen keyboard
   * stays available even after taps elsewhere on the page.
   */
  stickyFocus?: boolean;
  /** Form-level autocomplete hint. */
  autoComplete?: 'one-time-code' | 'current-password' | 'new-password';
}

export interface PinInputHandle {
  focus: () => void;
}

const PinDot = ({ filled, active }: { filled: boolean; active: boolean }) => (
  <div
    className={clsx(
      'eink-bordered relative flex h-14 w-12 items-center justify-center rounded-2xl border transition-all duration-200',
      // Base Surface Container
      'bg-neutral-200/50 dark:bg-neutral-800/50',
      // M3 State Layers
      active
        ? 'border-primary ring-2 ring-primary/25 bg-neutral-200/80 dark:bg-neutral-800/80'
        : filled
          ? 'border-neutral-400/50 dark:border-neutral-600/50'
          : 'border-neutral-300/40 dark:border-neutral-700/40',
    )}
  >
    <span
      className={clsx(
        'inline-block h-3.5 w-3.5 rounded-full bg-primary transition-all duration-150',
        filled ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
      )}
    />
    {active && !filled && (
      <span
        aria-hidden='true'
        className='absolute bottom-3 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary animate-pulse'
      />
    )}
  </div>
);

const PinInput = forwardRef<PinInputHandle, PinInputProps>(function PinInput(
  {
    value,
    onChange,
    autoFocus,
    shake,
    disabled,
    ariaLabel,
    stickyFocus,
    autoComplete = 'one-time-code',
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [focused, setFocused] = useState(false);
  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }));

  useEffect(() => {
    if (autoFocus) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [autoFocus]);

  useEffect(() => {
    if (!stickyFocus) return;
    const focus = () => inputRef.current?.focus();
    focus();
    const t = window.setInterval(focus, 200);
    return () => window.clearInterval(t);
  }, [stickyFocus]);

  const handleClick = () => inputRef.current?.focus();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH);
    onChange(next);
  };

  return (
    <label className='relative block w-fit cursor-pointer' onClick={handleClick}>
      <span className='sr-only'>{ariaLabel}</span>
      <input
        ref={inputRef}
        type='password'
        inputMode='numeric'
        pattern='[0-9]*'
        maxLength={PIN_LENGTH}
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        autoComplete={autoComplete}
        autoFocus={autoFocus || stickyFocus}
        aria-label={ariaLabel}
        className='absolute inset-0 z-10 cursor-pointer opacity-0'
      />
      <div className={clsx('flex gap-3.5', shake && 'animate-pin-shake')}>
        {Array.from({ length: PIN_LENGTH }).map((_dot, i) => (
          <PinDot
            key={i}
            filled={i < value.length}
            active={focused && !disabled && i === value.length}
          />
        ))}
      </div>
    </label>
  );
});

export default PinInput;