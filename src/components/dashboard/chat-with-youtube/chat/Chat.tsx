'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/SubmitButton';
import { LuSend } from 'react-icons/lu';
import { cn, errorToast, userNameInitials } from '@/utils/utils';
import { PiChatsLight } from 'react-icons/pi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { RiMessageFill } from 'react-icons/ri';
import { TypeYoutubeChat } from '@/types/types';
import { supabaseBrowserClient } from '@/utils/supabase/client';

interface ChatProps {
  chat: TypeYoutubeChat;
  userName: string;
}

type TypeYoutubeChatObject = { role: string; text: string };

const Chat = ({ chat, userName }: ChatProps) => {
  const supabase = supabaseBrowserClient();

  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [historyArray, setHistoryArray] = useState<TypeYoutubeChatObject[]>(
    (chat.chat_history as TypeYoutubeChatObject[]) || []
  );

  let historyMetadata = chat.history_metadata || '';

  const handleStream = async (data: ReadableStream, chatHistory: TypeYoutubeChatObject[]) => {
    setHistoryArray(chatHistory);

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let streamData = '';

    const lastChatIndex = chatHistory.length;

    // Append the stream data to the contentData state as it arrives
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;

      if (value) {
        const chunkValue = decoder.decode(value);
        streamData += chunkValue;
      }

      if (lastChatIndex >= 0) {
        setHistoryArray((prev) => {
          const updatedPrev = [...prev];
          updatedPrev[lastChatIndex] = { role: 'assistant', text: streamData };
          return updatedPrev;
        });
      }
    }

    return streamData;
  };

  const handleChatFn = async (formData: FormData) => {
    // Prevent multiple clicks
    if (isLoading || !chat.id) return;

    const question = formData.get('question') as string;
    setIsLoading(true);

    try {
      if (!question) {
        throw new Error('Please ask a question');
      }
      const res = await fetch('/api/chat-with-youtube/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          documentId: chat.id,
          history: historyMetadata,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get response from the server');
      }
      const data = res.body;
      if (!data) {
        throw new Error('Something went wrong, please try again');
      }

      setInput('');

      const chatHistory = [...historyArray, { role: 'user', text: question }];

      // Handle the stream data
      const output = await handleStream(data, chatHistory);
      if (output) {
        historyMetadata += `USER_QUESTION: ${question}\nAI_RESPONSE: ${output}`;

        const newChatHistory = [...chatHistory, { role: 'assistant', text: output }];
        await supabase
          .from('chat_with_youtube')
          .update({ chat_history: newChatHistory, history_metadata: historyMetadata })
          .eq('id', chat.id);
      }
      setIsLoading(false);
    } catch (error: any) {
      errorToast(error?.message ?? `${error}`);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className='h-[calc(100vh-90px)] flex flex-col justify-between rounded-md'>
        {historyArray?.length === 0 && (
          <div className='flex flex-col items-center text-sm text-center pt-40'>
            <PiChatsLight size={32} className='mb-2' />
            <p className='font-medium mb-6'>Ask any questions related to the YouTube video</p>
          </div>
        )}

        {historyArray?.length > 0 && (
          <div className='p-2 md:p-4 overflow-y-scroll'>
            {historyArray.map((chat, index) => (
              <div
                key={index}
                className={cn(
                  'max-w-xl w-fit flex items-start gap-2 mb-4 clear-both',
                  chat.role === 'user' ? 'flex-row-reverse float-end' : 'float-start'
                )}>
                <div className='w-fit rounded-md bg-muted/60'>
                  {chat.role === 'user' ? (
                    <div className='p-3'>
                      <p className='text-sm font-medium uppercase'>{userNameInitials(userName)}</p>
                    </div>
                  ) : (
                    <div className='p-2'>
                      <RiMessageFill className='size-7 text-primary' />
                    </div>
                  )}
                </div>
                <div
                  className={cn(
                    'text-sm whitespace-break-spaces rounded-md p-3',
                    chat.role === 'user' ? 'text-white bg-primary' : 'text-accent-foreground bg-muted/60 bot'
                  )}>
                  {chat.role === 'user' ? (
                    <p>{chat.text}</p>
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                      {chat.text}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <form className='w-full flex items-center gap-2 text-foreground border-t border-secondary p-4'>
          <Input
            name='question'
            placeholder='Ask here...'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className='bg-secondary h-10'
          />
          <SubmitButton
            size='icon'
            formAction={handleChatFn}
            className='size-10'
            disabled={isLoading || !chat.id}>
            <LuSend size={16} />
          </SubmitButton>
        </form>
      </div>
    </div>
  );
};

export default Chat;
