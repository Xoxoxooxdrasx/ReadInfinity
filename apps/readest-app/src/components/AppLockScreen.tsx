'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';

import PinInput from '@/components/PinInput';
import { useEnv } from '@/context/EnvContext';
import { PIN_LENGTH, verifyPin } from '@/libs/crypto/applock';
import { useAppLockStore } from '@/store/appLockStore';
import { useTranslation } from '@/hooks/useTranslation';
import {
  authenticateWithBiometrics,
  getBiometricStatus,
  getBiometryLabelKey,
  isBiometricSupported,
  shouldAttemptBiometricUnlock,
} from '@/services/biometric';

export default function AppLockScreen() {
  const _ = useTranslation();
  const { appService } = useEnv();
  const { pinHash, pinSalt, unlock, biometricUnlockEnabled } = useAppLockStore();
  const [biometryLabel, setBiometryLabel] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [kbInset, setKbInset] = useState(0);

  const [biometricBusy, setBiometricBusy] = useState(
    () => isBiometricSupported(appService) && !!biometricUnlockEnabled,
  );
  const biometricAttemptedRef = useRef(false);
  const biometricInFlightRef = useRef(false);
  const autoFocusEnabled = !appService?.isMobile;

  const runBiometric = async () => {
    if (biometricInFlightRef.current) return;
    biometricInFlightRef.current = true;
    setBiometricBusy(true);
    try {
      const ok = await authenticateWithBiometrics(_('Unlock Read∞'));
      if (ok) unlock();
    } finally {
      biometricInFlightRef.current = false;
      setBiometricBusy(false);
    }
  };

  useEffect(() => {
    if (!isBiometricSupported(appService)) {
      setBiometricBusy(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      const { available, biometryType } = await getBiometricStatus();
      if (cancelled) return;
      if (
        !shouldAttemptBiometricUnlock({
          isMobileApp: !!appService?.isMobileApp,
          biometricUnlockEnabled,
          available,
        })
      ) {
        setBiometricBusy(false);
        return;
      }
      setBiometryLabel(_(getBiometryLabelKey(biometryType)));
      if (biometricAttemptedRef.current) return;
      biometricAttemptedRef.current = true;
      await runBiometric();
    })();
    return () => {
      cancelled = true;
    };
  }, [appService]);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const layoutH = document.documentElement.clientHeight;
      const offset = layoutH - vv.height - vv.offsetTop;
      setKbInset(offset > 1 ? offset : 0);
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  const verifyingRef = useRef(false);

  const handleChange = async (next: string) => {
    setPin(next);
    if (error) setError('');
    if (next.length !== PIN_LENGTH || verifyingRef.current) return;
    if (!pinHash || !pinSalt) {
      unlock();
      return;
    }
    verifyingRef.current = true;
    try {
      const ok = await verifyPin(next, pinSalt, pinHash);
      if (ok) {
        unlock();
      } else {
        setError(_('Incorrect PIN'));
        setPin('');
        setShaking(true);
        window.setTimeout(() => setShaking(false), 400);
      }
    } finally {
      verifyingRef.current = false;
    }
  };

  return (
    <div
      className='fixed inset-0 z-[200] flex flex-col items-center justify-center px-6 bg-neutral-100/95 dark:bg-neutral-950 backdrop-blur-2xl transition-colors duration-200'
      style={{ paddingBottom: kbInset || undefined }}
      role='dialog'
      aria-modal='true'
      aria-label={_('App locked')}
    >
      {!biometricBusy && (
        <div className='flex w-full max-w-sm flex-col items-center text-center animate-fade-in'>
          {/* M3 Lock Header Icon Container */}
          <div className='mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-200/80 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 shadow-sm'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.75}
              stroke='currentColor'
              className='h-7 w-7'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z'
              />
            </svg>
          </div>

          <h1 className='text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100'>
            {_('Enter your PIN')}
          </h1>
          <p className='mt-1.5 mb-8 text-sm text-neutral-600 dark:text-neutral-400 max-w-xs leading-relaxed'>
            {_('Read∞ is locked. Enter your 4-digit PIN to continue.')}
          </p>

          {/* PIN Input Slots */}
          <div className='my-2'>
            <PinInput
              value={pin}
              onChange={handleChange}
              ariaLabel={_('PIN code')}
              stickyFocus={autoFocusEnabled}
              shake={shaking}
            />
          </div>

          {/* M3 Tonal Error Chip */}
          <div className='mt-3 flex h-7 items-center justify-center'>
            {error ? (
              <span className='rounded-full bg-red-500/10 px-3 py-0.5 text-xs font-medium text-red-600 dark:text-red-400 animate-pulse'>
                {error}
              </span>
            ) : null}
          </div>

          {/* M3 Outlined / Tonal Biometric Pill Button */}
          {biometryLabel && (
            <button
              type='button'
              onClick={runBiometric}
              className={clsx(
                'mt-5 flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium',
                'bg-neutral-200/60 hover:bg-neutral-300/70 text-neutral-800 dark:bg-neutral-800/80 dark:hover:bg-neutral-700/80 dark:text-neutral-200',
                'border border-neutral-300/40 dark:border-neutral-700/50 shadow-sm transition-all duration-200 active:scale-95',
              )}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.8}
                stroke='currentColor'
                className='h-4 w-4'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75A.75.75 0 0112 10.5z'
                />
              </svg>
              {_('Use {{biometry}}', { biometry: biometryLabel })}
            </button>
          )}

          <p className='mt-10 max-w-xs text-xs leading-relaxed text-neutral-500 dark:text-neutral-500'>
            {_(
              "Forgetting your PIN locks you out of this device. You'll need to clear the app's data to reset it.",
            )}
          </p>
        </div>
      )}
    </div>
  );
}