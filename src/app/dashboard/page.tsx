import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { RxExternalLink } from 'react-icons/rx';

const apps = [
  {
    name: 'Content Writer',
    url: 'content-writer',
  },
  {
    name: 'MultiLLM ChatGPT',
    url: 'multillm-chatgpt',
  },
  {
    name: 'Chat with PDF',
    url: 'chat-with-pdf',
  },
  {
    name: 'Voice Transcription',
    url: 'Voice Transcription',
  },
  {
    name: 'Headshot Generator',
    url: 'headshot-generator',
  },
  {
    name: 'Image Generator',
    url: 'image-generator',
  },
  {
    name: 'Qr Code Generator',
    url: 'qr-code-generator',
  },
  {
    name: 'Interior Design',
    url: 'interior-design',
  },
  {
    name: 'Text To Speech',
    url: 'text-to-speech',
  },
  {
    name: 'Music Generator',
    url: 'music-generator',
  },
  {
    name: 'Chat with Youtube',
    url: 'chat-with-youtube',
  },
  {
    name: 'Llama 3.1 ChatGPT',
    url: 'llamagpt',
  },
  {
    name: 'Youtube Content Generation',
    url: 'youtube-content-generation',
  },
  {
    name: 'Image Upscaler & Enhancer',
    url: 'image-upscaler-enhancer',
  },
];

export default async function Dashboard() {
  return (
    <div>
      {/* Navbar */}
      <div className='h-16 shadow mb-10 px-4 md:px-6'>
        <div className='h-full flex items-center justify-between max-w-6xl mx-auto'>
          <Logo />

          <div className='flex items-center gap-5'>
            <div className='flex items-center gap-3'>
              <Link href='https://apps.builderkit.ai/' target='_blank' className='hidden md:block'>
                <Button variant='secondary' className='gap-2'>
                  Demo Apps
                </Button>
              </Link>
              <Link href='https://www.builderkit.ai/#pricing' target='_blank'>
                <Button className='gap-2 border border-destructive/10 bg-destructive/10 dark:bg-destructive/20 text-destructive shadow-none'>
                  Get Builderkit.ai
                  <RxExternalLink />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-4 md:px-0'>
        <h1 className='text-2xl text-center font-semibold mb-4'>All Demo Apps</h1>

        <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
          {apps.map((app) => (
            <Link
              key={app.name}
              href={`/dashboard/${app.url}`}
              className='min-h-16 border shadow-sm rounded-lg px-2'>
              <div className='h-full flex items-center justify-center'>
                <p className='text-center text-sm'>{app.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
