'use client';

import {
  generateTranscriptionFn,
  saveSummary,
  uploadAudioFile,
} from '@/app/dashboard/(apps)/voice-transcription/actions';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import { cn, errorToast, formatTime } from '@/utils/utils';
import { ChangeEvent, FC, useCallback, useEffect, useState } from 'react';
import ModalOutput from '@/components/dashboard/voice-transcription/generate/ModalOutput';
import { LiveAudioVisualizer } from 'react-audio-visualize';
import { Button, buttonVariants } from '@/components/ui/button';
import { FaSquare } from 'react-icons/fa';
import { AiOutlineAudio } from 'react-icons/ai';
import { FiUpload } from 'react-icons/fi';
import { useAudioRecorder } from 'react-audio-voice-recorder';
import { BiLoaderAlt } from 'react-icons/bi';
import { toast } from '@/components/ui/use-toast';
import ModalLimitExceeded from '../../ModalLimitExceeded';

interface GenerateTranscriptionProps {}

type TypeOutputContent = { transcription: string; summary?: string; created_at?: string };

const GenerateTranscription: FC<GenerateTranscriptionProps> = () => {
  const supabase = supabaseBrowserClient();

  const [isPending, setIsPending] = useState<boolean>(false);
  const [content, setContent] = useState<TypeOutputContent>();
  const [transcriptionId, setTranscriptionId] = useState<string>();
  const [audioUrl, setAudioUrl] = useState<string>();
  const [status, setStatus] = useState<string>('Audio is being uploaded');
  const [hasHandled, setHasHandled] = useState(false);
  const [hasLimitExceeded, setHasLimitExceeded] = useState(false);

  const { startRecording, stopRecording, mediaRecorder, isRecording, recordingTime, recordingBlob } =
    useAudioRecorder();

  //function to check the limit of content creations and set the state accordingly
  const limitUser = useCallback(async () => {
    const { error, count } = await supabase
      .from('voice_transcriptions')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return toast({ description: error.message, variant: 'destructive' });
    }
    if (count && count >= 5) {
      setHasLimitExceeded(true);
    }
  }, [supabase]);

  //checking on load if the user has reached the limit of content creations
  useEffect(() => {
    limitUser();
  }, [limitUser]);

  // Start the process of generating the transcription
  const handleGeneration = useCallback(
    async (blob?: Blob | File) => {
      if (hasLimitExceeded) {
        return toast({
          description: 'You have reached the limit of transcriptions. Please upgrade to continue.',
          variant: 'destructive',
        });
      }
      setIsPending(true);

      try {
        if (!blob) {
          throw 'Please select or record and audio';
        }

        const data = new FormData();
        data.append('audio', blob, 'audio.mp3');

        // First upload the audio file to the supabase storage and get the public url
        const audioUrl = await uploadAudioFile(data);
        if (audioUrl == null) {
          throw 'Failed to upload your file. Please try again.';
        }
        setAudioUrl(audioUrl);

        setStatus('File uploaded successfully');

        setStatus('Getting your transcription ready');
        // Use the public url to generate the transcription through deepgram API
        const response = await generateTranscriptionFn(audioUrl);

        if (typeof response == 'string') {
          throw response;
        } else {
          setTranscriptionId(response.id);
          setStatus('Getting your transcription ready');
        }
      } catch (error) {
        errorToast(`${error}`);
        setIsPending(false);
      }
    },
    [hasLimitExceeded]
  );

  // Handle the input audio file and set the value to the state
  const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    // Check if the file size is within the limit.
    // 4.5mb is the maximum file size allowed by Vercel to be handled by the edge/lambda functions
    const fileLimit = 4.5 * 1000 * 1000; //  4.5mb
    if (file && file?.size > fileLimit) {
      errorToast('File size limit Exceeded');
      return;
    }

    handleGeneration(file);
  };

  // Function to handle summary stream
  const handleStream = useCallback(
    async (data: ReadableStream) => {
      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let streamData = '';

      // Append the stream data to the state
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        streamData += chunkValue;
        setContent((prevContent) => {
          const transcription = prevContent?.transcription;
          return {
            transcription: transcription!,
            summary: streamData,
          };
        });
      }

      // Update the summary in supabase "voice_transcriptions" table for the transcription id once the stream is done
      if (done) {
        await saveSummary(streamData, transcriptionId as string);
      }

      return streamData;
    },
    [transcriptionId]
  );

  // Function to generate the summary of the transcription by making api call to '/api/summary'
  const generateSummary = useCallback(
    async (transciption: string) => {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transciption }),
      });

      // Stream response from the server (api call)
      const streamResponse = response.body;
      if (!streamResponse) {
        errorToast('Failed to get transcription summary. Please try again later.');
        return;
      }
      await handleStream(streamResponse);
    },
    [handleStream]
  );

  // Realtime subscription to the changes in the "voice_transcriptions" table
  // This is used to read the transcription received from the deepgram API in the webhook response
  // Once the transcription is generated, it is used to generate the summary by default (You can disable this feature, and add a button to generate the summary manually)
  useEffect(() => {
    const channel = supabase
      .channel('value-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'voice_transcriptions',
        },
        async (payload) => {
          if (payload.new.error != null) {
            errorToast(payload.new.error);
          } else if (payload.new.transcription_id === transcriptionId && payload.new.summary == null) {
            // Check if the transcription id matches the updated row's transcription id and summary is not present
            setContent(() => ({
              transcription: payload.new.transcription,
            }));
            // Automatically generate the summary once the transcription is received
            await generateSummary(payload.new.transcription);
          }
          setIsPending(false);
        }
      )
      .subscribe();

    return async () => {
      await supabase.removeChannel(channel);
    };
    return () => {};
  }, [transcriptionId, supabase, generateSummary]);

  // Memoize handleRecording with an extra step to control repetitive calls.
  const stableHandleRecording = useCallback(
    async (blob: Blob) => {
      if (hasHandled) return; // Prevent re-handling if already done
      setHasHandled(true);
      await handleGeneration(blob);
    },
    [hasHandled, handleGeneration]
  );

  useEffect(() => {
    if (recordingBlob && !hasHandled) {
      stableHandleRecording(recordingBlob);
    }
  }, [recordingBlob, stableHandleRecording, hasHandled]);

  return (
    <>
      <div className='rounded-2xl p-4 border space-y-5 w-full sm:min-w-[392px]'>
        {hasLimitExceeded && <ModalLimitExceeded isModalOpen={hasLimitExceeded} />}

        <div className='text-subtle text-sm font-semibold mx-auto rounded-lg bg-border/50 py-1 px-4 w-fit'>
          Record Audio
        </div>
        <div className='bg-border/50 rounded-lg border px-2 py-3 h-28 flex items-center justify-center flex-col'>
          {isPending ? (
            <div className='flex flex-col justify-center items-center'>
              <BiLoaderAlt className='text-destructive size-6 mb-4 text-center animate-spin' />
              <p className='text-destructive font-semibold text-sm'>{status}</p>
            </div>
          ) : (
            <>
              {isRecording ? (
                <div className='text-red-600'>
                  {mediaRecorder && (
                    <LiveAudioVisualizer
                      mediaRecorder={mediaRecorder}
                      width={330}
                      height={50}
                      barWidth={3}
                      gap={4}
                      fftSize={512}
                      maxDecibels={-10}
                      minDecibels={-80}
                      smoothingTimeConstant={0.8}
                    />
                  )}
                </div>
              ) : (
                <div className='border-2 w-full' />
              )}
            </>
          )}
        </div>

        {/* Show audio duration */}
        <div className={cn(isPending && 'text-subtle', 'text-default text-[40px] font-bold text-center')}>
          {formatTime(recordingTime)}
        </div>

        {isPending ? (
          <Button variant='outline' className='text-subtle/30 text-sm font-medium w-full cursor-wait'>
            Uploading audio
          </Button>
        ) : isRecording ? (
          // End audio recording button
          <Button
            variant='destructive'
            onClick={() => stopRecording()}
            className='w-full rounded-lg gap-1.5 red-btn-gradient text-white'>
            <FaSquare />
            End Recording
          </Button>
        ) : (
          <div className='block sm:flex gap-1.5' aria-disabled>
            {/* Button to record audio */}
            <Button
              variant='destructive'
              onClick={() => startRecording()}
              disabled={hasLimitExceeded}
              className='w-full rounded-lg px-7 mb-2 sm:mb-0 red-btn-gradient text-white'>
              <AiOutlineAudio className='size-4' />
              Record Audio
            </Button>

            {/* Button to upload an audio file */}
            <label
              htmlFor='audioInput'
              className={cn(buttonVariants({ variant: 'outline' }), 'w-full cursor-pointer rounded-lg px-7')}>
              <FiUpload className='size-4 mr-1.5' /> Upload Audio
            </label>
            <input
              type='file'
              name='audio'
              id='audioInput'
              disabled={hasLimitExceeded}
              accept='.mp3, .mp4, .webm'
              className='hidden'
              onChange={handleFileInput}
            />
          </div>
        )}
      </div>

      {content && (
        <ModalOutput
          transcription={content.transcription ?? ''}
          summary={content.summary ?? ''}
          audio_url={audioUrl ?? ''}
          defualtOpen
        />
      )}
    </>
  );
};

export default GenerateTranscription;
