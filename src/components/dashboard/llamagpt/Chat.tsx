'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { cn, errorToast, userNameInitials } from '@/utils/utils';
import { SubmitButton } from '@/components/SubmitButton';
import { LuSend } from 'react-icons/lu';
import { RiMessage2Fill } from 'react-icons/ri';
import { TypeLlamaGPT } from '@/types/types';
import { saveChat } from '@/app/dashboard/(apps)/llamagpt/actions';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { PiChatsLight } from 'react-icons/pi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import ModalLimitExceeded from '../ModalLimitExceeded';

interface ChatBoardProps {
  userName: string;
  chat?: TypeLlamaGPT;
}

type TypeChatObject = { role: string; content: string };

const suggestions = [
  'What is the most widely spoken language in the world?',
  'Who is the founder of Google?',
  'Can you name a planet in our solar system with rings?',
];

const ChatBoard: FC<ChatBoardProps> = ({ userName, chat }) => {
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState<string>('');
  const [historyArray, setHistoryArray] = useState((chat?.chat_history as TypeChatObject[]) || []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // State to check if the user has reached the limit of content creations
  const [hasLimitExceeded, setHasLimitExceeded] = useState(false);

  const router = useRouter();

  //function to check the limit of content creations and set the state accordingly
  const limitUser = useCallback(async () => {
    const supabase = supabaseBrowserClient();

    const { error, count } = await supabase.from('llamagpt').select('*', { count: 'exact', head: true });

    if (error) {
      return errorToast(error.message);
    }

    if (count && count >= 5) {
      setHasLimitExceeded(true);
    }
  }, []);

  //checking on load if the user has reached the limit of content creations
  useEffect(() => {
    limitUser();
  }, [limitUser]);

  useEffect(() => {
    if (chatHistoryRef?.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistoryRef]);

  const handleStream = async (data: ReadableStream, chatHistory: TypeChatObject[]) => {
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
          updatedPrev[lastChatIndex] = { role: 'assistant', content: streamData };
          return updatedPrev;
        });
      }
    }

    return streamData;
  };

  const handleChatFn = async (formData: FormData) => {
    if (hasLimitExceeded || isLoading) {
      return;
    }

    const question = formData.get('question') as string;

    if (!question) {
      errorToast('Please enter a question.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/llamagpt/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          history: historyArray,
        }),
      });

      if (!response.ok) {
        errorToast('Failed to get message response from the server. Please try again.');
        return;
      }
      if (!response.body) {
        errorToast('Message not found in the response. Please try again.');
        return;
      }

      setInput('');

      const chatHistory = [...historyArray, { role: 'user', content: question }];

      // Handle the stream data
      const output = await handleStream(response.body, chatHistory);

      if (output) {
        const { data, error } = await saveChat({
          id: chat?.id,
          title: chat?.title,
          chat_history: [...chatHistory, { role: 'assistant', content: output }],
        });

        if (error) {
          throw error;
        }

        router.replace(`/dashboard/llamagpt/${data?.id}`);
        router.refresh();
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      errorToast(`${error}`);
    }
  };

  const handleExampleQuestionClick = async (question: string) => {
    // Explicitly define the type as string
    setInput(question); // Set the clicked question as input
    // Create a form data object with the clicked question
    const formData = new FormData();
    formData.append('question', question);
    // Call the handleChatFn function with the form data
    await handleChatFn(formData);
  };

  return (
    <div>
      {hasLimitExceeded && <ModalLimitExceeded isModalOpen={hasLimitExceeded} />}

      <div className='w-full md:w-2/3 h-[calc(100vh-136px)] flex flex-col justify-between rounded-md mx-auto'>
        {historyArray.length == 0 && (
          <div className='flex flex-col items-center text-sm text-center pt-40'>
            <PiChatsLight size={32} className='mb-2' />
            <p className='font-medium mb-6'>What to ask?</p>
            <div className='flex flex-col items-center gap-2 text-muted-foreground'>
              {suggestions.map((suggestion, index) => (
                <p
                  key={index}
                  className='w-full px-2 py-1 rounded-lg bg-muted/60 cursor-pointer'
                  onClick={() => handleExampleQuestionClick(suggestion)}>
                  <q>{suggestion}</q>
                </p>
              ))}
            </div>
          </div>
        )}

        {historyArray?.length > 0 && (
          <div className='md:p-4 overflow-y-scroll' ref={chatHistoryRef}>
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
                      <RiMessage2Fill className='size-7 text-primary' />
                    </div>
                  )}
                </div>
                <div
                  className={cn(
                    'text-sm whitespace-break-spaces rounded-md p-3',
                    chat.role === 'user'
                      ? 'w-  text-white bg-primary'
                      : 'text-accent-foreground/70 bg-muted/60'
                  )}>
                  {chat.role === 'user' ? (
                    <p>{chat.content}</p>
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                      {chat.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <form className='w-full flex items-center gap-2 text-foreground'>
          <Textarea
            name='question'
            placeholder='Ask here...'
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className='min-h-10 border shadow-sm'
          />
          <SubmitButton
            isLoading={isLoading}
            size='icon'
            disabled={hasLimitExceeded}
            formAction={handleChatFn}
            isCircleLoader={true}
            className='size-10'>
            <LuSend size={16} />
          </SubmitButton>
        </form>
      </div>
    </div>
  );
};

export default ChatBoard;
