import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { HiArrowDownTray } from 'react-icons/hi2';

const DropIndicator: React.FC = () => {
  const _ = useTranslation();
  return (
    <>
      {/* M3 Scrim */}
      <div 
        className='drag-overlay pointer-events-none fixed inset-0 z-[150] bg-neutral-950/40 backdrop-blur-[2px] transition-opacity duration-200' 
        aria-hidden='true'
      />
      {/* M3 Elevated Target Card */}
      <div className='drop-indicator pointer-events-none fixed inset-0 z-[160] flex items-center justify-center p-6'>
        <div className='flex flex-col items-center justify-center rounded-[28px] border border-primary/30 bg-neutral-50/95 p-8 shadow-2xl backdrop-blur-xl dark:bg-neutral-900/95 animate-in fade-in zoom-in-95 duration-200'>
          <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner'>
            <HiArrowDownTray className='h-8 w-8 animate-bounce' />
          </div>
          <p className='mt-4 text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100'>
            {_('Drop to Import Books')}
          </p>
          <span className='mt-1 text-xs text-neutral-500 dark:text-neutral-400'>
            {_('Release files anywhere to add to your library')}
          </span>
        </div>
      </div>
    </>
  );
};

export default DropIndicator;