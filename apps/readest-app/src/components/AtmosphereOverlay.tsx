'use client';

import { useEffect, useRef, useState } from 'react';
import { useAtmosphereStore } from '@/store/atmosphereStore';
import { useThemeStore } from '@/store/themeStore';

const AtmosphereOverlay = () => {
  const active = useAtmosphereStore((s) => s.active);
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isInitialMount = useRef(true);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const audioSrc = isDarkMode ? '/assets/forest-crickets.mp3' : '/assets/forest-birds.mp3';

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (active) {
      document.body.classList.add('atmosphere');
      video?.play()?.catch(() => {});
      if (!isInitialMount.current) {
        audio?.play()?.catch(() => {});
      }
    } else {
      document.body.classList.remove('atmosphere');
      setVideoLoaded(false);
    }
    isInitialMount.current = false;
  }, [active]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !active) return;
    audio.src = audioSrc;
    audio.play()?.catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioSrc]);

  return (
    <>
      {active && (
        <div 
          className='pointer-events-none fixed inset-0 z-0 overflow-hidden select-none transition-opacity duration-700 ease-out'
          aria-hidden='true'
        >
          {/* M3 Ambient Video Container */}
          <video
            ref={videoRef}
            id='atmosphere-overlay'
            src='/assets/komorebi.mp4'
            loop
            muted
            playsInline
            preload='auto'
            onLoadedData={() => setVideoLoaded(true)}
            className={`h-full w-full object-cover transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-35 dark:opacity-20' : 'opacity-0'
            }`}
          />
          {/* M3 Surface Scrim: Ensures readability of text and controls above the canvas */}
          <div className='absolute inset-0 bg-neutral-100/40 dark:bg-neutral-950/60 backdrop-blur-[1px]' />
        </div>
      )}
      {active && (
        // biome-ignore lint/a11y/useMediaCaption: ambient background audio, no spoken content
        <audio ref={audioRef} id='forest-audio' src={audioSrc} loop preload='none' />
      )}
    </>
  );
};

export default AtmosphereOverlay;