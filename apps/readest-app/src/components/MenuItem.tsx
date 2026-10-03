import clsx from 'clsx';
import React from 'react';
import { IconType } from 'react-icons';
import { MdCheck } from 'react-icons/md';
import { useTranslation } from '@/hooks/useTranslation';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';

interface MenuItemProps {
  label: string;
  toggled?: boolean;
  description?: string;
  tooltip?: string;
  buttonClass?: string;
  labelClass?: string;
  shortcut?: string;
  disabled?: boolean;
  noIcon?: boolean;
  transient?: boolean;
  Icon?: React.ReactNode | IconType;
  iconClassName?: string;
  children?: React.ReactNode;
  siblings?: React.ReactNode;
  detailsOpen?: boolean;
  onClick?: () => void;
  setIsDropdownOpen?: (isOpen: boolean) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
  label,
  toggled,
  description,
  tooltip,
  buttonClass,
  labelClass,
  shortcut,
  disabled,
  noIcon = false,
  transient = false,
  Icon,
  iconClassName,
  children,
  siblings,
  detailsOpen = false,
  onClick,
  setIsDropdownOpen,
}) => {
  const _ = useTranslation();
  const iconSize = useResponsiveSize(18);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(detailsOpen);
  const IconType = Icon || (toggled !== undefined ? (toggled ? MdCheck : undefined) : undefined);

  const handleClick = () => {
    onClick?.();
    if (transient) {
      setIsDropdownOpen?.(false);
    }
  };

  const buttonContent = (
    <>
      <div className='flex w-full items-center justify-between'>
        <div className='flex min-w-0 items-center gap-2.5'>
          {!noIcon && (
            <span
              className={clsx(
                'flex items-center justify-center shrink-0',
                toggled ? 'text-primary' : disabled ? 'text-neutral-400 dark:text-neutral-600' : 'text-neutral-600 dark:text-neutral-400',
              )}
              style={{ width: `${iconSize}px`, minWidth: `${iconSize}px` }}
            >
              {typeof IconType === 'function' ? (
                <IconType
                  className={clsx(iconClassName)}
                  size={iconSize}
                />
              ) : (
                IconType
              )}
            </span>
          )}
          <span
            className={clsx(
              'flex-1 break-words text-pretty text-start text-sm font-medium transition-colors',
              toggled
                ? 'text-primary font-semibold'
                : disabled
                  ? 'text-neutral-400 dark:text-neutral-600'
                  : 'text-neutral-800 dark:text-neutral-200',
              labelClass,
            )}
            style={{ minWidth: 0 }}
          >
            {label}
          </span>
        </div>
        {shortcut && (
          <kbd
            className={clsx(
              'hidden shrink-0 items-center justify-center rounded-lg border px-2 py-0.5 text-[11px] font-semibold tracking-wide sm:inline-flex',
              disabled
                ? 'border-neutral-300/30 bg-neutral-200/40 text-neutral-400 dark:border-neutral-700/30 dark:bg-neutral-800/40 dark:text-neutral-600'
                : 'border-neutral-300/50 bg-neutral-200/70 text-neutral-700 dark:border-neutral-700/60 dark:bg-neutral-800/80 dark:text-neutral-300',
            )}
            style={{ fontFamily: 'monospace' }}
          >
            {shortcut}
          </kbd>
        )}
      </div>
      {description && (
        <div className='flex w-full'>
          <span
            className='mt-0.5 truncate text-start text-xs text-neutral-500 dark:text-neutral-400 leading-tight'
            style={{ minWidth: 0, paddingInlineStart: noIcon ? '0' : `${iconSize + 10}px` }}
          >
            {description}
          </span>
        </div>
      )}
    </>
  );

  const baseItemClasses = clsx(
    // M3 State layer and item dimensions
    'group flex w-full flex-col justify-center rounded-xl px-3 py-2 text-start transition-colors duration-150',
    toggled
      ? 'bg-primary/10 text-primary dark:bg-primary/15'
      : 'text-neutral-800 hover:bg-neutral-500/10 active:bg-neutral-500/15 dark:text-neutral-200 dark:hover:bg-neutral-400/12 dark:active:bg-neutral-400/18',
    disabled && 'pointer-events-none opacity-40 cursor-not-allowed !bg-transparent',
    buttonClass,
  );

  if (children) {
    return (
      <ul className='m-0 list-none p-0 w-full'>
        <li aria-label={label} className='w-full'>
          <details open={detailsOpen} onToggle={(e) => setIsDetailsOpen(e.currentTarget.open)}>
            <summary
              role='button'
              tabIndex={0}
              aria-expanded={isDetailsOpen}
              className={clsx(baseItemClasses, 'cursor-pointer list-none [&::-webkit-details-marker]:hidden')}
              title={tooltip ? tooltip : ''}
            >
              {buttonContent}
            </summary>
            <div className='pl-3 py-1 space-y-0.5'>{children}</div>
          </details>
        </li>
      </ul>
    );
  }

  return (
    <div className='flex w-full items-center'>
      <button
        type='button'
        role={disabled ? 'none' : 'menuitem'}
        aria-label={
          toggled !== undefined ? `${label} - ${toggled ? _('ON') : _('OFF')}` : undefined
        }
        aria-live={toggled === undefined ? 'polite' : 'off'}
        tabIndex={disabled ? -1 : 0}
        className={baseItemClasses}
        title={tooltip ? tooltip : ''}
        onClick={handleClick}
        disabled={disabled}
      >
        {buttonContent}
      </button>
      {siblings}
    </div>
  );
};

export default MenuItem;