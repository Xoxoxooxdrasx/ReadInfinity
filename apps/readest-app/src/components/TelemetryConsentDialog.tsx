'use client';

import clsx from 'clsx';
import { LuCheck, LuChartLine, LuX } from 'react-icons/lu';

import ModalPortal from '@/components/ModalPortal';
import { useEnv } from '@/context/EnvContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/store/settingsStore';
import { optInTelemetry, optOutTelemetry } from '@/utils/telemetry';

interface TelemetryConsentDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * First-launch consent prompt asking new users whether to share anonymous
 * usage data. Shown to a small fraction of new users; the rest are opted out
 * silently.
 */
export default function TelemetryConsentDialog({ open, onClose }: TelemetryConsentDialogProps) {
  const _ = useTranslation();
  const { envConfig } = useEnv();

  if (!open) return null;

  const persistTelemetryEnabled = async (value: boolean) => {
    const store = useSettingsStore.getState();
    if (store.settings && typeof store.settings.version === 'number') {
      const next = { ...store.settings, telemetryEnabled: value };
      store.setSettings(next);
      await store.saveSettings(envConfig, next);
    } else {
      const appService = await envConfig.getAppService();
      const settings = await appService.loadSettings();
      settings.telemetryEnabled = value;
      await appService.saveSettings(settings);
    }
  };

  const accept = async () => {
    optInTelemetry();
    await persistTelemetryEnabled(true);
    onClose();
  };

  const decline = async () => {
    optOutTelemetry();
    await persistTelemetryEnabled(false);
    onClose();
  };

  return (
    <ModalPortal>
      <dialog className='modal modal-open' open>
        <div className='modal-box relative w-[min(420px,calc(100vw-2rem))] rounded-[28px] border border-neutral-200/50 bg-neutral-50/95 p-0 shadow-2xl backdrop-blur-2xl dark:border-neutral-800/60 dark:bg-neutral-900/95 animate-in fade-in zoom-in-95 duration-200'>
          {/* M3 Header Section */}
          <div className='flex flex-col items-center gap-3 border-b border-neutral-200/50 px-6 pb-5 pt-7 text-center dark:border-neutral-800/50'>
            <div
              className='eink-bordered flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm'
              aria-hidden='true'
            >
              <LuChartLine size={24} strokeWidth={1.8} />
            </div>
            <h3 className='text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100'>
              {_('Help improve Read∞')}
            </h3>
            <p className='text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400'>
              {_(
                'Share anonymous usage data so we can understand how Read∞ is used and make it better.',
              )}
            </p>
          </div>

          {/* Value Proposition List */}
          <ul className='space-y-3 px-6 py-5'>
            <ConsentRow kind='positive' label={_('Anonymous, aggregated feature usage')} />
            <ConsentRow kind='negative' label={_('No personal information')} />
            <ConsentRow kind='negative' label={_('No book content or reading data')} />
          </ul>

          {/* M3 Actions Footer */}
          <div className='flex flex-col gap-2 border-t border-neutral-200/50 px-6 py-4 dark:border-neutral-800/50'>
            <button
              type='button'
              onClick={accept}
              className='inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-content shadow-sm transition-all duration-150 hover:shadow active:scale-95'
            >
              {_('Share anonymous data')}
            </button>
            <button
              type='button'
              onClick={decline}
              className='eink-bordered inline-flex h-10 items-center justify-center rounded-full text-sm font-medium text-neutral-700 transition-colors duration-150 hover:bg-neutral-500/10 active:bg-neutral-500/16 dark:text-neutral-300 dark:hover:bg-neutral-400/12 dark:active:bg-neutral-400/18'
            >
              {_('Not now')}
            </button>
            <p className='pt-1 text-center text-[11px] text-neutral-500 dark:text-neutral-400'>
              {_('You can change this anytime in Settings.')}
            </p>
          </div>
        </div>
      </dialog>
    </ModalPortal>
  );
}

function ConsentRow({ kind, label }: { kind: 'positive' | 'negative'; label: string }) {
  const isPositive = kind === 'positive';

  return (
    <li className='flex items-center gap-3'>
      <span
        className={clsx(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors',
          isPositive
            ? 'bg-emerald-600/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
            : 'eink-bordered border border-neutral-300/70 text-neutral-500 dark:border-neutral-700/70 dark:text-neutral-400',
        )}
        aria-hidden='true'
      >
        {isPositive ? <LuCheck size={14} strokeWidth={2.5} /> : <LuX size={14} strokeWidth={2.5} />}
      </span>
      <span className='text-[13px] font-medium leading-snug text-neutral-800 dark:text-neutral-200'>
        {label}
      </span>
    </li>
  );
}