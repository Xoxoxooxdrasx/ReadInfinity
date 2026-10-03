import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

type QuotaProps = {
  quotas: {
    name: string;
    tooltip: string;
    used: number;
    total: number;
    unit: string;
    resetAt?: number;
  }[];
  className?: string;
  labelClassName?: string;
  showProgress?: boolean;
};

const Quota: React.FC<QuotaProps> = ({ quotas, showProgress, className, labelClassName }) => {
  const _ = useTranslation();
  const [now, setNow] = useState(() => Date.now());

  const hasResetIndicator = showProgress && quotas.some((q) => q.resetAt);

  useEffect(() => {
    if (!hasResetIndicator) return;
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, [hasResetIndicator]);

  return (
    <div className={clsx('w-full space-y-3 font-sans text-sm text-neutral-900 dark:text-neutral-100', className)}>
      {quotas.map((quota) => {
        const usageRatio = quota.total > 0 ? quota.used / quota.total : 0;
        const usagePercentage = Math.min(100, Math.max(0, usageRatio * 100));
        const usagePercentageRounded = Math.round(usagePercentage);

        // M3 Semantic / Tonal Progress Colors
        let progressColor = 'bg-primary dark:bg-primary';
        if (usagePercentage > 80) {
          progressColor = 'bg-red-500/90 dark:bg-red-400';
        } else if (usagePercentage > 50) {
          progressColor = 'bg-amber-500/90 dark:bg-amber-400';
        }

        const showResetRow = showProgress && quota.resetAt;
        const totalMinutes = showResetRow
          ? Math.floor(Math.max(0, quota.resetAt! - now) / 60_000)
          : 0;
        const resetHours = Math.floor(totalMinutes / 60);
        const resetMinutes = totalMinutes % 60;

        return (
          <div key={quota.name} className='w-full'>
            {/* M3 Card Container */}
            <div
              className={clsx(
                'relative w-full overflow-hidden rounded-2xl border border-neutral-200/50 bg-neutral-200/40 transition-colors dark:border-neutral-800/60 dark:bg-neutral-800/40',
                showProgress && 'p-3',
              )}
            >
              {/* Row Header & Numeric Value */}
              <div
                className={clsx(
                  'relative z-10 flex items-center justify-between gap-4 font-medium',
                  labelClassName,
                )}
              >
                <span className='truncate text-sm font-semibold tracking-tight' title={quota.tooltip}>
                  {quota.name}
                </span>
                <div className='shrink-0 text-right text-xs font-semibold tabular-nums text-neutral-600 dark:text-neutral-300'>
                  {quota.used} / {quota.total} {quota.unit}
                </div>
              </div>

              {/* M3 Rounded Linear Progress Track */}
              {showProgress && (
                <div className='relative mt-2.5 h-2 w-full overflow-hidden rounded-full bg-neutral-300/50 dark:bg-neutral-700/50'>
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all duration-300 ease-out',
                      progressColor,
                    )}
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>
              )}
            </div>

            {/* Sub-label & Reset Metadata */}
            {showResetRow && (
              <div
                className={clsx(
                  'mt-1.5 flex items-center justify-between px-1 text-xs text-neutral-500 dark:text-neutral-400',
                  labelClassName,
                )}
              >
                <span className='font-medium'>
                  {_('{{percentage}}% used', { percentage: usagePercentageRounded })}
                </span>
                <span className='tabular-nums'>
                  {_('Resets in {{hours}} hr {{minutes}} min', {
                    hours: resetHours,
                    minutes: resetMinutes,
                  })}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Quota;