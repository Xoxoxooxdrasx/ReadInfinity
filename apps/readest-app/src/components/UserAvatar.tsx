import clsx from 'clsx';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { IconType } from 'react-icons';

interface UserAvatarProps {
  url: string;
  size: number;
  DefaultIcon: IconType;
  className?: string;
  borderClassName?: string;
  /**
   * When true, the root box stretches via h-full/w-full instead of getting
   * the explicit `size` pinned via inline style. Use this when a parent
   * constrains the avatar with its own (responsive) classes — otherwise the
   * inline style overrides the parent box and the avatar can overflow on
   * smaller breakpoints. `size` is still used as the intrinsic dimension
   * for next/image and the fallback icon.
   */
  fillContainer?: boolean;
}

const getStorageKey = (url: string) => {
  return `avatar_${btoa(url).replace(/[^a-zA-Z0-9]/g, '')}`;
};

const UserAvatar: React.FC<UserAvatarProps> = ({
  url,
  size,
  className,
  borderClassName,
  DefaultIcon,
  fillContainer,
}) => {
  const [cachedImageUrl, setCachedImageUrl] = useState<string | null>(() => {
    if (!url) return null;

    return localStorage.getItem(getStorageKey(url));
  });

  useEffect(() => {
    if (!url) return;

    const storageKey = getStorageKey(url);
    const cached = localStorage.getItem(storageKey);

    if (cached && cached === cachedImageUrl) {
      return;
    }

    const cacheImage = async () => {
      try {
        const response = await fetch(url, { referrerPolicy: 'no-referrer' });
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          try {
            localStorage.setItem(storageKey, base64data);
            setCachedImageUrl(base64data);
          } catch (e) {
            console.warn('Failed to cache avatar in localStorage:', e);
          }
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Failed to cache avatar:', error);
      }
    };

    cacheImage();
  }, [url, cachedImageUrl]);

  return (
    <div
      className={clsx(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        'bg-neutral-200/70 dark:bg-neutral-800/70',
        'ring-1 ring-neutral-300/40 dark:ring-neutral-700/50',
        borderClassName,
      )}
      style={fillContainer ? { width: '100%', height: '100%' } : { width: size, height: size }}
    >
      {url ? (
        <div className='relative h-full w-full'>
          <Image
            src={cachedImageUrl || url}
            alt='User Avatar'
            className={clsx('h-full w-full rounded-full object-cover', className)}
            referrerPolicy='no-referrer'
            width={size}
            height={size}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('invisible');
            }}
          />
          <div className='invisible absolute inset-0 flex items-center justify-center'>
            <DefaultIcon
              className={clsx('text-neutral-500 dark:text-neutral-400', className)}
              size={Math.round(size * 0.55)}
            />
          </div>
        </div>
      ) : (
        <DefaultIcon
          className={clsx('text-neutral-500 dark:text-neutral-400', className)}
          size={Math.round(size * 0.55)}
        />
      )}
    </div>
  );
};

export default UserAvatar;