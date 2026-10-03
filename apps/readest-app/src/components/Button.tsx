import clsx from 'clsx';
import React from 'react';
import { useEnv } from '@/context/EnvContext';

interface ButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ icon, onClick, disabled = false, label, className }) => {
  const { appService } = useEnv();

  return (
    <button
      type='button'
      className={clsx(
        // Core Layout & Sizing
        'relative inline-flex items-center justify-center shrink-0',
        // M3 Icon Button Dimensions & Touch Target (40px visual, 44-48px tap target)
        'h-10 w-10 min-h-[40px] min-w-[40px] rounded-full p-0 touch-target',
        // M3 Surface & State Layer Transitions
        'text-neutral-700 dark:text-neutral-200 transition-colors duration-200 ease-out',
        'hover:bg-neutral-500/12 active:bg-neutral-500/20',
        'dark:hover:bg-neutral-300/12 dark:active:bg-neutral-300/20',
        // Mobile-specific touch adjustments
        appService?.isMobileApp && 'active:scale-95',
        // Disabled State per M3 Spec (38% opacity)
        disabled && 'pointer-events-none opacity-40 cursor-not-allowed !bg-transparent',
        className,
      )}
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
    >
      <span className='flex items-center justify-center text-current pointer-events-none'>
        {icon}
      </span>
    </button>
  );
};

export default Button;