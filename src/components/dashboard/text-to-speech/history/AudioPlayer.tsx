import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LuPlay, LuPause } from 'react-icons/lu';
import { cn } from '@/utils/utils';

const AudioPlayer = ({ audioUrl }: { audioUrl: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const setAudioData = () => {
      setDuration(Number(audio.duration.toFixed(0)));
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    // Add event listeners
    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', () => setIsPlaying(false));

    // Clean up
    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <>
      <div
        className={cn(
          'absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-2xl opacity-0 hover:opacity-100 transition-opacity',
          isPlaying && 'opacity-100'
        )}>
        <Button variant='link' onClick={togglePlay}>
          {isPlaying ? (
            <LuPause className='text-white text-4xl' strokeWidth={1.5} />
          ) : (
            <LuPlay className='text-white text-4xl' />
          )}
        </Button>

        <div className='w-5/6 flex items-center justify-between absolute bottom-5'>
          <input
            type='range'
            min={0}
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className='w-2/3'
          />
          <div className='text-sm text-white'>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </>
  );
};

export default AudioPlayer;
