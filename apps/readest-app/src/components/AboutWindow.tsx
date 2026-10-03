import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useEnv } from '@/context/EnvContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/store/settingsStore';
import { checkForAppUpdates, checkAppReleaseNotes } from '@/helpers/updater';
import { parseWebViewInfo } from '@/utils/ua';
import { getAppVersion } from '@/utils/version';
import { writeTextToClipboard } from '@/utils/clipboard';
import { eventDispatcher } from '@/utils/event';
import SupportLinks from './SupportLinks';
import LegalLinks from './LegalLinks';
import Dialog from './Dialog';
import Link from './Link';

export const setAboutDialogVisible = (visible: boolean) => {
  const dialog = document.getElementById('about_window');
  if (dialog) {
    const event = new CustomEvent('setDialogVisibility', {
      detail: { visible },
    });
    dialog.dispatchEvent(event);
  }
};

type UpdateStatus = 'checking' | 'updating' | 'updated' | 'error';

export const AboutWindow = () => {
  const _ = useTranslation();
  const { appService } = useEnv();
  const { settings } = useSettingsStore();
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null);
  const [browserInfo, setBrowserInfo] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setBrowserInfo(parseWebViewInfo(appService));

    const handleCustomEvent = (event: CustomEvent) => {
      setIsOpen(event.detail.visible);
    };

    const el = document.getElementById('about_window');
    if (el) {
      el.addEventListener('setDialogVisibility', handleCustomEvent as EventListener);
    }

    return () => {
      if (el) {
        el.removeEventListener('setDialogVisibility', handleCustomEvent as EventListener);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckUpdate = async () => {
    setUpdateStatus('checking');
    try {
      const hasUpdate = await checkForAppUpdates(_, false, settings.updateChannel);
      if (hasUpdate) {
        handleClose();
      } else {
        setUpdateStatus('updated');
      }
    } catch (error) {
      console.info('Error checking for updates:', error);
      setUpdateStatus('error');
    }
  };

  const handleShowRecentUpdates = async () => {
    const hasNotes = await checkAppReleaseNotes(false);
    if (hasNotes) {
      handleClose();
    } else {
      setUpdateStatus('error');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setUpdateStatus(null);
  };

  const versionInfo = `${_('Version {{version}}', { version: getAppVersion() })} (${browserInfo})`;

  const handleCopyVersion = async () => {
    const copied = await writeTextToClipboard(versionInfo);
    if (!copied) return;
    eventDispatcher.dispatch('toast', {
      type: 'info',
      message: _('Copied to clipboard'),
      className: 'whitespace-nowrap',
      timeout: 2000,
    });
  };

  return (
    <Dialog
      id='about_window'
      isOpen={isOpen}
      title={_('About Read∞')}
      onClose={handleClose}
      boxClassName='sm:!w-[480px] sm:!max-w-screen-sm sm:h-auto !rounded-3xl shadow-2xl bg-neutral-50/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/50'
    >
      {isOpen && (
        <div className='about-content flex flex-col items-center justify-center gap-4 pb-8 sm:pb-2'>
          <div className='flex flex-1 flex-col items-center justify-end gap-3 px-8 py-2'>
            {/* M3 Tonal App Icon Container */}
            <div className='mb-2 mt-4 rounded-2xl bg-primary/10 p-3 shadow-sm'>
              <Image
                src='/icon.png'
                alt='Read∞ icon'
                className='h-16 w-16 drop-shadow-md'
                width={64}
                height={64}
              />
            </div>

            <div className='flex select-text flex-col items-center'>
              <h2 className='text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100'>
                Read∞
              </h2>
              {/* M3 Version Pill / Chip */}
              <button
                type='button'
                title={_('Copy')}
                className='mt-1 rounded-full bg-neutral-200/60 dark:bg-neutral-800/60 px-3 py-1 text-center text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors hover:bg-neutral-300/60 dark:hover:bg-neutral-700/60'
                onClick={handleCopyVersion}
              >
                {versionInfo}
              </button>
            </div>

            <div className='my-2 flex min-h-[36px] items-center justify-center'>
              {!updateStatus && (
                /* M3 Filled Rounded Pill Button */
                <button
                  className='rounded-full bg-primary px-5 py-2 text-xs font-medium text-primary-content shadow-sm transition-all duration-200 hover:shadow-md active:scale-95'
                  onClick={appService?.hasUpdater ? handleCheckUpdate : handleShowRecentUpdates}
                >
                  {_('Check Update')}
                </button>
              )}
              {updateStatus === 'updated' && (
                <span className='rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400'>
                  {_('Already the latest version')}
                </span>
              )}
              {updateStatus === 'checking' && (
                <span className='text-xs font-medium text-neutral-500 dark:text-neutral-400 animate-pulse'>
                  {_('Checking for updates...')}
                </span>
              )}
              {updateStatus === 'error' && (
                <span className='rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400'>
                  {_('Error checking for updates')}
                </span>
              )}
            </div>
          </div>

          {/* M3 Outline Variant Divider */}
          <hr aria-hidden='true' className='my-2 w-full border-t border-neutral-200/50 dark:border-neutral-800/50' />

          <div
            className='flex flex-1 flex-col items-center justify-start gap-2.5 px-6 text-center text-xs text-neutral-600 dark:text-neutral-400'
            dir='ltr'
          >
            <p className='text-sm text-neutral-800 dark:text-neutral-200'>
              Created by <strong className='font-semibold'>InfinityZ-Lab</strong>.
            </p>
            <p className='text-xs'>
              © {new Date().getFullYear()} ZHINFINITY. All rights reserved.
            </p>

            <p className='leading-relaxed'>
              This software is licensed under the{' '}
              <Link
                href='https://www.gnu.org/licenses/agpl-3.0.html'
                className='font-medium text-primary underline underline-offset-2'
              >
                GNU Affero General Public License v3.0
              </Link>
              . You are free to use, modify, and distribute this software under the terms of the
              AGPL v3 license.
            </p>
            <p>
              Source code is available at{' '}
              <Link
                href='https://github.com/ZHINFINITY/ReadInfinity'
                className='font-medium text-primary underline underline-offset-2'
              >
                GitHub
              </Link>
              .
            </p>

            <LegalLinks />
          </div>
          <SupportLinks />
        </div>
      )}
    </Dialog>
  );
};