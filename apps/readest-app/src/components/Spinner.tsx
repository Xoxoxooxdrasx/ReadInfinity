import clsx from 'clsx';
import React from 'react';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/hooks/useTranslation';

const Spinner: React.FC<{
  loading: boolean;
  className?: string;
}> = ({ loading, className }) => {
  const _ = useTranslation();
  const { safeAreaInsets } = useThemeStore();
  if (!loading) return null;

  return (
    <div
      className='pointer-events-none absolute left-1/2 top-4 z-40 -translate-x-1/2 transform text-center'
      style={{
        paddingTop: `${(safeAreaInsets?.top || 0) + 64}px`,
      }}
      role='status'
      aria-live='polite'
    >
      {/* M3 Floating Surface Badge */}
      <div
        className={clsx(
          'inline-flex items-center justify-center rounded-full p-2.5 shadow-lg backdrop-blur-xl transition-all duration-200',
          'border border-neutral-200/50 bg-neutral-50/90 text-primary dark:border-neutral-800/60 dark:bg-neutral-900/90',
          className,
        )}
      >
        <svg
          className='h-6 w-6 animate-spin text-primary'
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          aria-hidden='true'
        >
          <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='3.5'
          />
          <path
            className='opacity-90'
            fill='currentColor'
            d='M4 12a8 8 0 018-8v3.5a4.5 4.5 0 00-4.5 4.5H4z'
          />
        </svg>
      </div>
      <span className='sr-only'>{_('Loading...')}</span>
    </div>
  );
};

export default Spinner;