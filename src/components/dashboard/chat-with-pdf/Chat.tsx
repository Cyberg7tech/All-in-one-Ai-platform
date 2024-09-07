'use client';

import { TypeChat } from '@/types/types';
import { FC, useState } from 'react';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/SubmitButton';
import { LuSend } from 'react-icons/lu';
import { cn, errorToast, getDocIdFromFilename, userNameInitials } from '@/utils/utils';
import { RiMessage2Fill } from 'react-icons/ri';
import { updateChat } from '@/app/dashboard/(apps)/chat-with-pdf/actions/store-chat';
import { PiChatsLight } from 'react-icons/pi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface ChatProps {
  chat: TypeChat;
  userName: string;
}

type TypeChatObject = { role: string; text: string };

const Chat: FC<ChatProps> = ({ chat, userName }) => {
  const [input, setInput] = useState<string>('');
  const [historyArray, setHistoryArray] = useState((chat.chat_history as TypeChatObject[]) || []);

  let historyMetadata = chat.history_metadata || '';

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
          updatedPrev[lastChatIndex] = { role: 'assistant', text: streamData };
          return updatedPrev;
        });
      }
    }

    return streamData;
  };

  const handleChatFn = async (formData: FormData) => {
    const question = formData.get('question') as string;
    if (!question) {
      return errorToast('Please enter a question');
    }

    const documentId = getDocIdFromFilename(chat.file);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          documentId,
          history: historyMetadata,
        }),
      });

      if (!res.ok) {
        errorToast('Something went wrong, please try again');
        return;
      }

      const data = res.body;
      if (!data) {
        errorToast('Something went wrong, please try again');
        return;
      }

      setInput('');

      const chatHistory = [...historyArray, { role: 'user', text: question }];

      // Handle the stream data
      const output = await handleStream(data, chatHistory);

      if (output) {
        historyMetadata += `USER_QUESTION: ${question}\nAI_RESPONSE: ${output}`;

        const chatResponse = await updateChat({
          id: chat.id,
          chat_history: [...chatHistory, { role: 'assistant', text: output }],
          history_metadata: historyMetadata,
        });

        if (typeof chatResponse === 'string') {
          throw chatResponse;
        }
      }
    } catch (error) {
      errorToast(`${error}`);
    }
  };

  return (
    <div className='h-[calc(100vh-102px)] flex flex-col justify-between rounded-md'>
      {historyArray.length == 0 && (
        <div className='flex flex-col items-center text-sm text-center pt-40'>
          <PiChatsLight size={32} className='mb-2' />
          <p className='font-medium mb-6'>Ask any question from the document</p>
        </div>
      )}

      {historyArray?.length > 0 && (
        <div className='p-2 md:p-4 overflow-scroll'>
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
                  chat.role === 'user' ? 'text-white bg-primary' : 'text-accent-foreground/70 bg-muted/60'
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
        <SubmitButton size='icon' formAction={handleChatFn} isCircleLoader={true} className='size-10'>
          <LuSend size={16} />
        </SubmitButton>
      </form>
    </div>
  );
};

export default Chat;
