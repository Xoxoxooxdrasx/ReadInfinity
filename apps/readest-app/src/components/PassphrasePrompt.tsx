'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import ModalPortal from '@/components/ModalPortal';
import { useTranslation } from '@/hooks/useTranslation';
import { setPassphraseDismisser, setPassphrasePrompter } from '@/services/sync/passphraseGate';
import type { PassphrasePromptKind } from '@/services/sync/passphraseGate';

interface PendingPrompt {
  kind: PassphrasePromptKind;
  resolve: (passphrase: string | null) => void;
}

/**
 * Singleton passphrase prompt for the encrypted-fields flow. Mount
 * once at the app root. Registers itself with the passphrase gate;
 * any caller that invokes `ensurePassphraseUnlocked` causes this
 * modal to render and resolve with the entered passphrase (or null
 * on cancel).
 */
export default function PassphrasePrompt() {
  const _ = useTranslation();
  const [pending, setPending] = useState<PendingPrompt | null>(null);
  const [value, setValue] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setPassphrasePrompter(({ kind, error: promptError }) => {
      return new Promise<string | null>((resolve) => {
        setValue('');
        setConfirm('');
        setError(promptError ? _(promptError) : '');
        setChecking(false);
        setPending({ kind, resolve });
      });
    });
    setPassphraseDismisser(() => {
      setPending(null);
      setValue('');
      setConfirm('');
      setError('');
      setChecking(false);
    });
    return () => {
      setPassphrasePrompter(null);
      setPassphraseDismisser(null);
    };
  }, [_]);

  useEffect(() => {
    if (pending) {
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [pending]);

  if (!pending) return null;

  const isSetup = pending.kind === 'setup';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checking) return;
    if (value.length < 8) {
      setError(_('Passphrase must be at least 8 characters'));
      return;
    }
    if (isSetup && value !== confirm) {
      setError(_('Passphrases do not match'));
      return;
    }
    setChecking(true);
    setError('');
    pending.resolve(value);
  };

  const inputClass =
    'eink-bordered w-full rounded-2xl bg-neutral-200/50 dark:bg-neutral-800/50 px-4 py-3 text-sm ' +
    'text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500/60 dark:placeholder:text-neutral-400/50 ' +
    'border border-neutral-300/40 dark:border-neutral-700/50 transition-all duration-200 ' +
    'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent ' +
    'disabled:opacity-50';

  return (
    <ModalPortal>
      <dialog className='modal modal-open' open>
        <div className='modal-box relative w-full max-w-md rounded-[28px] border border-neutral-200/50 bg-neutral-50/95 p-6 shadow-2xl backdrop-blur-2xl dark:border-neutral-800/60 dark:bg-neutral-900/95 animate-in fade-in zoom-in-95 duration-200'>
          {/* M3 Security Header Icon */}
          <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.75}
              stroke='currentColor'
              className='h-6 w-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z'
              />
            </svg>
          </div>

          <h3 className='text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100'>
            {isSetup ? _('Set sync passphrase') : _('Enter sync passphrase')}
          </h3>
          <p className='mt-1.5 mb-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400'>
            {isSetup
              ? _(
                  'A sync passphrase encrypts your sensitive fields (like OPDS catalog credentials) before they sync. We never see this passphrase. Pick something memorable — there is no recovery without it.',
                )
              : _(
                  'Enter the sync passphrase you set on another device to decrypt your synced credentials.',
                )}
          </p>

          <form onSubmit={handleSubmit} className='space-y-3'>
            <div>
              <input
                ref={inputRef}
                type='password'
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setError('');
                }}
                placeholder={_('Sync passphrase')}
                className={inputClass}
                autoComplete='new-password'
                disabled={checking}
                required
              />
            </div>
            {isSetup && (
              <div>
                <input
                  type='password'
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    setError('');
                  }}
                  placeholder={_('Confirm passphrase')}
                  className={inputClass}
                  autoComplete='new-password'
                  disabled={checking}
                  required
                />
              </div>
            )}

            {error && (
              <div className='flex items-center gap-1.5 pt-0.5 text-xs font-medium text-red-600 dark:text-red-400 animate-pulse'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                  className='h-3.5 w-3.5 shrink-0'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* M3 Actions Row */}
            <div className='flex items-center justify-end gap-2.5 pt-4'>
              <button
                type='button'
                onClick={() => pending.resolve(null)}
                disabled={checking}
                className='eink-bordered rounded-full px-5 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-500/10 active:bg-neutral-500/20 dark:text-neutral-300 dark:hover:bg-neutral-400/12 dark:active:bg-neutral-400/20 transition-colors disabled:opacity-50'
              >
                {_('Cancel')}
              </button>
              <button
                type='submit'
                disabled={checking}
                className={clsx(
                  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-2 text-sm font-medium shadow-sm transition-all duration-200',
                  'bg-primary text-primary-content hover:shadow-md active:scale-95 disabled:pointer-events-none disabled:opacity-50',
                )}
              >
                {checking && <span className='loading loading-spinner loading-xs' />}
                {isSetup ? _('Set passphrase') : _('Unlock')}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </ModalPortal>
  );
}