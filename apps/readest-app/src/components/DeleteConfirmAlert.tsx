import clsx from 'clsx';
import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import Alert from './Alert';

/**
 * Delete confirmation alert with an optional, opt-in "purge all reading data"
 * toggle. Used by both the single-book delete (BookDetailModal) and the
 * bulk/multi-select delete (Bookshelf), so the same purge-on-delete affordance
 * covers every standard delete path (issue #4698).
 */
const DeleteConfirmAlert: React.FC<{
  title: string;
  message: string;
  showPurgeToggle?: boolean;
  onCancel: () => void;
  onConfirm: (purgeData: boolean) => void;
}> = ({ title, message, showPurgeToggle = false, onCancel, onConfirm }) => {
  const _ = useTranslation();
  const [purgeData, setPurgeData] = useState(false);

  return (
    <Alert
      title={title}
      message={message}
      confirmLabel={purgeData ? _('Purge & Delete') : _('Delete')}
      confirmButtonClassName={clsx(
        'rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 shadow-sm active:scale-95',
        purgeData
          ? 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 dark:text-neutral-950'
          : 'bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-neutral-950',
      )}
      onCancel={onCancel}
      onConfirm={() => onConfirm(purgeData)}
    >
      {showPurgeToggle && (
        <label
          className={clsx(
            'flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all duration-200',
            purgeData
              ? 'border-red-500/40 bg-red-500/10 dark:border-red-500/30 dark:bg-red-950/20'
              : 'border-neutral-200/60 bg-neutral-100/70 hover:bg-neutral-200/50 dark:border-neutral-800 dark:bg-neutral-800/40 dark:hover:bg-neutral-800/70',
          )}
        >
          <div className='flex min-w-0 flex-1 flex-col gap-1'>
            <span
              className={clsx(
                'text-sm font-semibold tracking-tight transition-colors',
                purgeData
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-neutral-900 dark:text-neutral-100',
              )}
            >
              {_('Purge all reading data')}
            </span>
            <span className='text-xs leading-relaxed text-neutral-600 dark:text-neutral-400'>
              {purgeData
                ? _(
                    'This permanently erases reading progress, notes, and bookmarks. This cannot be undone.',
                  )
                : _('Also erase reading progress, notes, and bookmarks.')}
            </span>
          </div>

          {/* M3 Style Toggle Switch */}
          <input
            type='checkbox'
            className={clsx(
              'toggle toggle-sm shrink-0 cursor-pointer transition-colors',
              purgeData && 'toggle-error',
            )}
            checked={purgeData}
            onChange={(e) => setPurgeData(e.target.checked)}
            aria-label={_('Purge all reading data')}
          />
        </label>
      )}
    </Alert>
  );
};

export default DeleteConfirmAlert;