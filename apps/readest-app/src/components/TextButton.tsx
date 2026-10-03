import clsx from 'clsx';
import React from 'react';

interface TextButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
}

const TextButton: React.FC<TextButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className,
  variant = 'primary',
  size = 'sm',
  type = 'button',
}) => {
  const variantClasses = {
    primary:
      'text-primary hover:bg-primary/10 active:bg-primary/15',
    secondary:
      'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-500/10 active:bg-neutral-500/15',
    danger:
      'text-red-600 dark:text-red-400 hover:bg-red-500/10 active:bg-red-500/15',
    success:
      'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 active:bg-emerald-500/15',
  };

  const sizeClasses = {
    sm: 'h-8 px-2.5 text-xs font-medium',
    md: 'h-9 px-3 text-sm font-medium',
    lg: 'h-10 px-4 text-base font-medium',
  };

  return (
    <button
      type={type}
      className={clsx(
        // M3 Text Button Base & Pill State Layer
        'inline-flex items-center justify-center rounded-full transition-all duration-150 select-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        'active:scale-[0.98]',
        sizeClasses[size],
        variantClasses[variant],
        disabled && 'pointer-events-none opacity-40 cursor-not-allowed !bg-transparent',
        className,
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <span className='inline-flex items-center justify-center truncate'>
        {children}
      </span>
    </button>
  );
};

export default TextButton;