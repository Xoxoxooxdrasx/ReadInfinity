import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { isMacPlatform } from '@/services/environment';
import { getShortcutsForDisplay } from '@/helpers/shortcuts';
import { formatKeyForDisplay } from '@/utils/shortcutKeys';
import Dialog from './Dialog';
import Link from './Link';

export const setShortcutsDialogVisible = (visible: boolean) => {
  const dialog = document.getElementById('shortcuts_help');
  if (dialog) {
    const event = new CustomEvent('setDialogVisibility', {
      detail: { visible },
    });
    dialog.dispatchEvent(event);
  }
};

export const KeyboardShortcutsHelp = () => {
  const _ = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const isMac = isMacPlatform();

  const sections = useMemo(() => getShortcutsForDisplay(isMac), [isMac]);

  // Split sections into two balanced columns by item count
  const [leftColumn, rightColumn] = useMemo(() => {
    const totalItems = sections.reduce((sum, s) => sum + s.items.length + 1, 0); // +1 for header
    const left: typeof sections = [];
    const right: typeof sections = [];
    let leftCount = 0;
    for (const section of sections) {
      const sectionWeight = section.items.length + 1;
      if (leftCount <= totalItems / 2) {
        left.push(section);
        leftCount += sectionWeight;
      } else {
        right.push(section);
      }
    }
    return [left, right];
  }, [sections]);

  const renderSection = useCallback(
    (section: (typeof sections)[number]) => (
      <div key={section.section} className='mb-5'>
        {/* M3 Section Label */}
        <h3 className='mb-2.5 text-xs font-semibold uppercase tracking-wider text-primary'>
          {_(section.section)}
        </h3>
        <div className='divide-y divide-neutral-200/50 dark:divide-neutral-800/50'>
          {section.items.map((item) => (
            <div key={item.description} className='flex items-center justify-between gap-4 py-2'>
              <span className='text-sm text-neutral-800 dark:text-neutral-200'>
                {_(item.description)}
              </span>
              <div className='flex shrink-0 items-center gap-1.5'>
                {item.keys.map((key) => (
                  /* M3 Keycap Chip */
                  <kbd
                    key={key}
                    className='inline-flex h-6 min-w-[24px] items-center justify-center rounded-lg border border-neutral-300/50 bg-neutral-200/70 px-2 text-[11px] font-semibold text-neutral-800 shadow-sm transition-colors dark:border-neutral-700/60 dark:bg-neutral-800/80 dark:text-neutral-200'
                    style={{ fontFamily: 'monospace' }}
                  >
                    {formatKeyForDisplay(key, isMac)}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    [_, isMac],
  );

  useEffect(() => {
    const handleCustomEvent = (event: CustomEvent) => {
      setIsOpen(event.detail.visible);
    };

    const el = document.getElementById('shortcuts_help');
    if (el) {
      el.addEventListener('setDialogVisibility', handleCustomEvent as EventListener);
    }

    return () => {
      if (el) {
        el.removeEventListener('setDialogVisibility', handleCustomEvent as EventListener);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '?') return;

      const activeElement = document.activeElement as HTMLElement;
      const isInteractive =
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable;
      if (isInteractive) return;

      event.preventDefault();
      setIsOpen((prev) => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    (document.activeElement as HTMLElement)?.blur();
  };

  return (
    <Dialog
      id='shortcuts_help'
      isOpen={isOpen}
      title={_('Keyboard Shortcuts')}
      onClose={handleClose}
      boxClassName='sm:!w-[560px] md:!w-[780px] sm:!max-w-[90vw] sm:h-auto sm:!max-h-[80vh] !rounded-[28px]'
      useOverlayScroll={true}
    >
      {isOpen && (
        <div className='shortcuts-content pb-6 sm:pb-2'>
          <div className='md:grid md:grid-cols-2 md:gap-8'>
            <div>{leftColumn.map(renderSection)}</div>
            <div>{rightColumn.map(renderSection)}</div>
          </div>
          <div className='mt-4 border-t border-neutral-200/50 pt-3 text-center dark:border-neutral-800/50'>
            <Link
              href='https://github.com/readest/readest/wiki/Keyboard-Shortcuts-Reference-Guide'
              className='text-sm font-medium text-primary underline underline-offset-4 hover:opacity-85'
            >
              {_('View all keyboard shortcuts')}
            </Link>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default KeyboardShortcutsHelp;