import clsx from 'clsx';
import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useKeyDownActions } from '@/hooks/useKeyDownActions';

const Alert: React.FC<{
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  // Optional content rendered between the title/message and the actions row
  children?: React.ReactNode;
  confirmLabel?: string;
  confirmButtonClassName?: string;
}> = ({
  title,
  message,
  onCancel,
  onConfirm,
  children,
  confirmLabel,
  confirmButtonClassName = 'bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-neutral-950',
}) => {
  const _ = useTranslation();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const divRef = useKeyDownActions({ onCancel, onConfirm });

  return (
    <div className='z-[130] flex w-full justify-center px-4'>
      <div
        ref={divRef}
        role='alert'
        className={clsx(
          'flex flex-col gap-4',
          // Material 3 Dialog Container (28px corner radius + elevation)
          'rounded-[28px] p-6 shadow-2xl',
          'bg-neutral-50/95 dark:bg-neutral-900/95 backdrop-blur-xl',
          'border border-neutral-200/50 dark:border-neutral-800/50',
          'w-full max-w-md sm:max-w-lg md:max-w-xl transition-all duration-200',
        )}
      >
        <div className='labels flex items-start gap-4'>
          {/* M3 Tonal Icon Container */}
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              className='h-5 w-5 stroke-current'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>

          <div className='flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5'>
            <h3 className='text-start text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100'>
              {title}
            </h3>
            <div className='text-start text-sm leading-relaxed text-neutral-600 dark:text-neutral-400'>
              {message}
            </div>
          </div>
        </div>

        {children && <div className='px-1'>{children}</div>}

        {/* Material 3 Actions Row */}
        <div className='buttons mt-2 flex items-center justify-end gap-2'>
          <button
            type='button'
            className='rounded-full px-5 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200/60 dark:text-neutral-300 dark:hover:bg-neutral-800/60 transition-colors'
            onClick={onCancel}
          >
            {_('Cancel')}
          </button>
          <button
            type='button'
            className={clsx(
              'rounded-full px-6 py-2 text-sm font-medium shadow-sm transition-all duration-200',
              'hover:shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
              confirmButtonClassName,
            )}
            disabled={isProcessing}
            onClick={() => {
              setIsProcessing(true);
              onConfirm();
            }}
          >
            {confirmLabel ?? _('Confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;