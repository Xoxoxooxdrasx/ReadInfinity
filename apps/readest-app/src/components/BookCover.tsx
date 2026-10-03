import clsx from 'clsx';
import Image from 'next/image';
import { memo, useEffect, useRef, useState } from 'react';
import { Book } from '@/types/book';
import { LibraryCoverFitType, LibraryViewModeType } from '@/types/settings';
import { formatAuthors, formatTitle } from '@/utils/book';
import { getInitializedAppService } from '@/services/environment';
import { observeCoverForThumbnail } from '@/services/coverThumbnailService';
import { useLibraryStore } from '@/store/libraryStore';
import { useSettingsStore } from '@/store/settingsStore';

interface BookCoverProps {
  book: Book;
  mode?: LibraryViewModeType;
  coverFit?: LibraryCoverFitType;
  className?: string;
  imageClassName?: string;
  showSpine?: boolean;
  isPreview?: boolean;
  onImageError?: () => void;
  onAspectRatioChange?: (ratio: number) => void;
}

const BookCover: React.FC<BookCoverProps> = memo<BookCoverProps>(
  ({
    book,
    mode = 'grid',
    coverFit = 'crop',
    showSpine = false,
    className,
    imageClassName,
    isPreview,
    onImageError,
    onAspectRatioChange,
  }) => {
    const coverRef = useRef<HTMLDivElement>(null);
    const bookRef = useRef(book);
    bookRef.current = book;
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [failedThumbnailUrl, setFailedThumbnailUrl] = useState<string | null>(null);
    const thumbnail = useLibraryStore((state) => state.coverThumbnails.get(book.hash));
    const matchingThumbnail =
      thumbnail?.coverHash === (book.coverHash ?? null) ? thumbnail.url : null;
    const usableThumbnail = matchingThumbnail === failedThumbnailUrl ? null : matchingThumbnail;
    const metadataCoverImageUrl = book.metadata?.coverImageUrl || null;
    const coverImageUrl = metadataCoverImageUrl || usableThumbnail || book.coverImageUrl || null;
    const hideCovers = useSettingsStore((state) => state.settings.libraryHideCovers);
    const displayCoverUrl = hideCovers ? null : coverImageUrl;

    const shouldShowSpine = showSpine && !hideCovers && imageLoaded && !imageError;

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      setImageLoaded(true);
      setImageError(false);
      const img = e.currentTarget;
      if (onAspectRatioChange && img.naturalWidth > 0 && img.naturalHeight > 0) {
        onAspectRatioChange(img.naturalWidth / img.naturalHeight);
      }
    };

    const handleImageError = () => {
      if (usableThumbnail && book.coverImageUrl) {
        setFailedThumbnailUrl(usableThumbnail);
        setImageLoaded(false);
        setImageError(false);
        return;
      }
      setImageLoaded(false);
      setImageError(true);
      onImageError?.();
    };

    useEffect(() => {
      setImageLoaded(false);
      setImageError(false);
    }, [coverImageUrl]);

    useEffect(() => {
      setFailedThumbnailUrl(null);
    }, [book.hash, book.coverHash]);

    useEffect(() => {
      const element = coverRef.current;
      const appService = getInitializedAppService();
      if (
        !element ||
        hideCovers ||
        !book.coverImageUrl ||
        metadataCoverImageUrl ||
        matchingThumbnail ||
        !appService?.supportsCoverThumbnailOptimization
      ) {
        return;
      }
      return observeCoverForThumbnail(element, () =>
        appService.requestCoverThumbnail(bookRef.current),
      );
    }, [
      book.hash,
      book.coverHash,
      book.coverImageUrl,
      book.deletedAt,
      matchingThumbnail,
      metadataCoverImageUrl,
      hideCovers,
    ]);

    return (
      <div
        ref={coverRef}
        className={clsx(
          'book-cover-container relative flex h-full w-full overflow-hidden rounded-xl shadow-sm transition-all duration-200',
          className,
        )}
      >
        {coverFit === 'crop' ? (
          <>
            {displayCoverUrl && (
              <Image
                src={displayCoverUrl}
                alt={book.title}
                fill={true}
                loading='lazy'
                draggable={false}
                className={clsx(
                  'cover-image crop-cover-img rounded-xl object-cover transition-opacity duration-300',
                  imageError ? 'invisible' : 'opacity-100',
                  imageClassName,
                )}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}
            <div
              className={`book-spine absolute inset-0 rounded-xl ${
                shouldShowSpine ? 'visible' : 'invisible'
              }`}
            />
          </>
        ) : (
          <div className='flex h-full w-full justify-start'>
            <div
              className={clsx(
                'flex h-full max-h-full',
                mode === 'grid' ? 'items-end' : 'items-center',
              )}
            >
              {displayCoverUrl && (
                <Image
                  src={displayCoverUrl}
                  alt={book.title}
                  width={0}
                  height={0}
                  sizes='100vw'
                  loading='lazy'
                  draggable={false}
                  className={clsx(
                    'cover-image fit-cover-img h-auto max-h-full w-auto max-w-full rounded-xl shadow-md transition-opacity duration-300',
                    imageError ? 'invisible' : 'opacity-100',
                    imageClassName,
                  )}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              )}
              <div
                className={`book-spine absolute inset-0 rounded-xl ${
                  shouldShowSpine ? 'visible' : 'invisible'
                }`}
              />
            </div>
          </div>
        )}

        {/* Material 3 Fallback Book Cover Surface */}
        <div
          className={clsx(
            'fallback-cover absolute inset-0 flex flex-col justify-between p-3.5 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50',
            displayCoverUrl && !imageError && 'invisible',
            isPreview
              ? 'bg-neutral-200/40 dark:bg-neutral-800/40'
              : 'bg-neutral-100 dark:bg-neutral-900',
            imageClassName,
          )}
        >
          <div className='flex h-1/2 items-center justify-center text-center'>
            <span
              className={clsx(
                'font-serif font-semibold tracking-tight text-neutral-800 dark:text-neutral-200',
                isPreview ? 'line-clamp-2 text-[0.55em]' : mode === 'grid' ? 'line-clamp-3 text-base' : 'line-clamp-2 text-sm',
              )}
            >
              {formatTitle(book.title)}
            </span>
          </div>

          <div className='flex h-1/3 items-end justify-center text-center pb-1'>
            <span
              className={clsx(
                'line-clamp-1 font-sans text-xs text-neutral-500 dark:text-neutral-400',
                isPreview && 'text-[0.45em]',
              )}
            >
              {formatAuthors(book.author || book.metadata?.author || '')}
            </span>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.book.hash === nextProps.book.hash &&
      prevProps.book.coverHash === nextProps.book.coverHash &&
      prevProps.book.deletedAt === nextProps.book.deletedAt &&
      prevProps.book.coverImageUrl === nextProps.book.coverImageUrl &&
      prevProps.book.metadata?.coverImageUrl === nextProps.book.metadata?.coverImageUrl &&
      prevProps.book.updatedAt === nextProps.book.updatedAt &&
      prevProps.mode === nextProps.mode &&
      prevProps.coverFit === nextProps.coverFit &&
      prevProps.isPreview === nextProps.isPreview &&
      prevProps.showSpine === nextProps.showSpine &&
      prevProps.className === nextProps.className &&
      prevProps.imageClassName === nextProps.imageClassName
    );
  },
);

BookCover.displayName = 'BookCover';

export default BookCover;