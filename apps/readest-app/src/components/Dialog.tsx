import clsx from 'clsx';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import 'overlayscrollbars/overlayscrollbars.css';
import { MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md';
import { useEnv } from '@/context/EnvContext';
import { useDrag } from '@/hooks/useDrag';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeviceControlStore } from '@/store/deviceStore';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';
import { impactFeedback } from '@tauri-apps/plugin-haptics';
import { getDirFromUILanguage } from '@/utils/rtl';
import { eventDispatcher } from '@/utils/event';
import { Overlay } from './Overlay';

const VELOCITY_THRESHOLD = 0.5;
const SNAP_THRESHOLD = 0.2;

interface DialogProps {
  id?: string;
  isOpen: boolean;
  children: ReactNode;
  snapHeight?: number;
  dismissible?: boolean;
  header?: ReactNode;
  title?: string;
  className?: string;
  bgClassName?: string;
  boxClassName?: string;
  contentClassName?: string;
  useOverlayScroll?: boolean;
  onBack?: () => void;
  onClose: () => void;
}

const Dialog: React.FC<DialogProps> = ({
  id,
  isOpen,
  children,
  snapHeight,
  dismissible = true,
  header,
  title,
  className,
  bgClassName,
  boxClassName,
  contentClassName,
  useOverlayScroll = false,
  onBack,
  onClose,
}) => {
  const _ = useTranslation();
  const { appService } = useEnv();
  const { systemUIVisible, statusBarHeight, safeAreaInsets } = useThemeStore();
  const { acquireBackKeyInterception, releaseBackKeyInterception } = useDeviceControlStore();
  const [isFullHeightInMobile, setIsFullHeightInMobile] = useState(!snapHeight);
  const [isRtl] = useState(() => getDirFromUILanguage() === 'rtl');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const iconSize22 = useResponsiveSize(22);
  const isMobile = window.innerWidth < 640 || window.innerHeight < 640;

  const handleKeyDown = (event: KeyboardEvent | CustomEvent) => {
    if (event instanceof CustomEvent) {
      if (event.detail.keyName === 'Back') {
        if (onBack) {
          onBack();
        } else {
          onClose();
        }
        return true;
      }
    } else {
      if (event.key === 'Escape') {
        onClose();
      }
      event.stopPropagation();
    }
    return false;
  };

  useEffect(() => {
    if (!isOpen) {
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
        previousActiveElementRef.current = null;
      }
      return;
    }

    previousActiveElementRef.current = document.activeElement as HTMLElement;

    setIsFullHeightInMobile(!snapHeight && isMobile);
    window.addEventListener('keydown', handleKeyDown);
    if (dialogRef.current) {
      dialogRef.current.addEventListener('keydown', handleKeyDown);
    }
    if (appService?.isAndroidApp) {
      acquireBackKeyInterception();
      eventDispatcher.onSync('native-key-down', handleKeyDown);
    }

    const timer = setTimeout(() => {
      if (dialogRef.current) {
        dialogRef.current.focus();
      }
    }, 100);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      if (appService?.isAndroidApp) {
        releaseBackKeyInterception();
        eventDispatcher.offSync('native-key-down', handleKeyDown);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleDragMove = (data: { clientY: number; deltaY: number }) => {
    if (!dismissible || !isMobile || !dialogRef.current) return;

    const modal = dialogRef.current.querySelector('.modal-box') as HTMLElement;
    const overlay = dialogRef.current.querySelector('.overlay') as HTMLElement;

    const heightFraction = data.clientY / window.innerHeight;
    const newTop = Math.max(0.0, Math.min(1, heightFraction));

    if (modal && overlay) {
      modal.style.height = '100%';
      modal.style.transform = `translateY(${newTop * 100}%)`;
      overlay.style.opacity = `${1 - heightFraction}`;

      setIsFullHeightInMobile(data.clientY < 44);
      modal.style.transition = `padding-top 0.3s ease-out`;
    }
  };

  const handleDragEnd = (data: { velocity: number; clientY: number }) => {
    if (!dismissible || !isMobile || !dialogRef.current) return;
    const modal = dialogRef.current.querySelector('.modal-box') as HTMLElement;
    const overlay = dialogRef.current.querySelector('.overlay') as HTMLElement;
    if (!modal || !overlay) return;

    const snapUpper = snapHeight ? 1 - snapHeight - SNAP_THRESHOLD : 0.5;
    const snapLower = snapHeight ? 1 - snapHeight + SNAP_THRESHOLD : 0.5;
    if (
      data.velocity > VELOCITY_THRESHOLD ||
      (data.velocity >= 0 && data.clientY >= window.innerHeight * snapLower)
    ) {
      const transitionDuration = 0.15 / Math.max(data.velocity, 0.5);
      modal.style.height = '100%';
      modal.style.transition = `transform ${transitionDuration}s ease-out`;
      modal.style.transform = 'translateY(100%)';
      overlay.style.transition = `opacity ${transitionDuration}s ease-out`;
      overlay.style.opacity = '0';
      onClose();
      setTimeout(() => {
        modal.style.transform = 'translateY(0%)';
      }, 300);
    } else if (
      snapHeight &&
      data.clientY > window.innerHeight * snapUpper &&
      data.clientY < window.innerHeight * snapLower
    ) {
      overlay.style.transition = `opacity 0.3s ease-out`;
      overlay.style.opacity = `${1 - snapHeight}`;
      modal.style.height = `${snapHeight * 100}%`;
      modal.style.bottom = '0';
      modal.style.transition = `transform 0.3s ease-out`;
      modal.style.transform = '';
    } else {
      setIsFullHeightInMobile(true);
      modal.style.height = '100%';
      modal.style.transition = `transform 0.3s ease-out`;
      modal.style.transform = `translateY(0%)`;
      overlay.style.opacity = '0';
    }
    if (appService?.hasHaptics) {
      impactFeedback('medium');
    }
  };

  const handleDragKeyDown = () => {};

  const { handleDragStart } = useDrag(handleDragMove, handleDragKeyDown, handleDragEnd);

  return (
    <dialog
      ref={dialogRef}
      id={id ?? 'dialog'}
      tabIndex={-1}
      open={isOpen}
      aria-label={title}
      aria-hidden={!isOpen}
      className={clsx(
        'modal sm:min-w-90 z-50 h-full w-full !items-start !bg-transparent sm:w-full sm:!items-center',
        className,
      )}
      dir={isRtl ? 'rtl' : undefined}
    >
      {/* M3 Scrim */}
      <Overlay
        captureBlocking={isOpen}
        className={clsx(
          'dialog-overlay z-10 bg-neutral-950/45 backdrop-blur-[2px] transition-opacity duration-300',
          appService?.hasRoundedWindow && 'rounded-window',
          bgClassName,
        )}
        onDismiss={onClose}
      />

      {/* M3 Surface Container & Bottom Sheet Chassis */}
      <div
        className={clsx(
          'modal-box settings-content absolute z-20 flex flex-col p-0',
          'bg-neutral-50/95 dark:bg-neutral-900/95 backdrop-blur-2xl shadow-2xl',
          'border border-neutral-200/50 dark:border-neutral-800/60',
          'rounded-t-[28px] rounded-b-none sm:rounded-[28px]',
          'h-full max-h-full w-full max-w-full',
          window.innerWidth < window.innerHeight
            ? 'sm:h-[55%] sm:w-3/4'
            : 'sm:h-[70%] sm:w-1/2 sm:max-w-[620px]',
          boxClassName,
        )}
        style={{
          paddingTop:
            appService?.hasSafeAreaInset && isFullHeightInMobile
              ? `${Math.max(safeAreaInsets?.top || 0, systemUIVisible ? statusBarHeight : 0)}px`
              : '0px',
          ...(isMobile
            ? snapHeight
              ? { height: `${snapHeight * 100}%`, top: 'auto', bottom: 0 }
              : { height: '100%', bottom: 0 }
            : {}),
        }}
      >
        {/* M3 Bottom Sheet Drag Handle */}
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div
          className={clsx(
            'drag-handle mb-1 h-7 min-h-[28px] w-full cursor-row-resize items-center justify-center',
            'flex transition-all duration-300 ease-out sm:hidden',
          )}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className='h-1 w-8 rounded-full bg-neutral-400/60 dark:bg-neutral-600/70 transition-colors' />
        </div>

        {/* M3 Dialog App Bar */}
        <div className='dialog-header sticky top-0 z-10 flex items-center justify-between px-3 py-1 sm:px-4 sm:py-2'>
          {header ? (
            header
          ) : (
            <div className='flex h-11 w-full items-center justify-between'>
              <button
                type='button'
                aria-label={_('Close')}
                aria-hidden={!isOpen}
                onClick={onClose}
                disabled={!dismissible}
                className='inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-500/10 dark:text-neutral-300 dark:hover:bg-neutral-400/15 transition-colors focus:outline-none disabled:opacity-40 sm:hidden'
              >
                {isRtl ? (
                  <MdArrowForwardIos size={iconSize22} />
                ) : (
                  <MdArrowBackIosNew size={iconSize22} />
                )}
              </button>

              <div className='pointer-events-none absolute inset-0 flex h-11 items-center justify-center'>
                <span className='line-clamp-1 text-center text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100'>
                  {title ?? ''}
                </span>
              </div>

              <button
                type='button'
                aria-label={_('Close')}
                aria-hidden={!isOpen}
                onClick={onClose}
                disabled={!dismissible}
                className='ml-auto hidden h-8 w-8 items-center justify-center rounded-full bg-neutral-200/50 hover:bg-neutral-300/60 text-neutral-600 dark:bg-neutral-800/50 dark:hover:bg-neutral-700/60 dark:text-neutral-300 transition-colors focus:outline-none sm:inline-flex'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2.2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <line x1='18' y1='6' x2='6' y2='18' />
                  <line x1='6' y1='6' x2='18' y2='18' />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        {useOverlayScroll ? (
          <OverlayScrollbarsComponent
            className={clsx('my-2 flex-grow px-6 text-neutral-800 dark:text-neutral-200 sm:px-8', contentClassName)}
            options={{
              scrollbars: { autoHide: 'scroll', clickScroll: true },
              showNativeOverlaidScrollbars: false,
            }}
            defer
          >
            {children}
          </OverlayScrollbarsComponent>
        ) : (
          <div
            className={clsx(
              'my-2 flex-grow overflow-y-auto px-6 text-neutral-800 dark:text-neutral-200 sm:px-8',
              contentClassName,
            )}
          >
            {children}
          </div>
        )}
      </div>
    </dialog>
  );
};

export default Dialog;