import { FaGithub } from 'react-icons/fa';

import { useTranslation } from '@/hooks/useTranslation';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';
import Link from './Link';

const SupportLinks = () => {
  const _ = useTranslation();
  const iconSize = useResponsiveSize(20);

  return (
    <div className='my-3 flex flex-col items-center gap-2'>
      <p className='text-xs font-medium tracking-wide text-neutral-500 dark:text-neutral-400'>
        {_('Get Help with Read∞')}
      </p>
      <div className='flex items-center gap-3'>
        <Link
          href='https://github.com/ZHINFINITY/ReadInfinity'
          className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300/40 bg-neutral-200/60 text-neutral-800 shadow-sm transition-all duration-150 hover:bg-neutral-500/12 hover:text-neutral-900 active:scale-95 active:bg-neutral-500/20 dark:border-neutral-700/50 dark:bg-neutral-800/60 dark:text-neutral-200 dark:hover:bg-neutral-400/15 dark:hover:text-neutral-100'
          title='GitHub'
          aria-label='GitHub'
        >
          <FaGithub size={iconSize} />
        </Link>
      </div>
    </div>
  );
};

export default SupportLinks;