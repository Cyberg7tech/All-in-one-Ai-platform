// This component displays the generated headshots in a tabbed interface with 'Output' and 'History' tabs.
// It supports downloading of generated images and switching to historical generation details.
// The component is reactive, showing loading indicators or images based on the current state.

import { FC } from 'react';
import EmptyState from '@/assets/images/profile.png';
import Image from 'next/image';
import { LuLoader } from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import { TbDownload } from 'react-icons/tb';
import downloadImage from '@/utils/utils';

interface OutputGenerationProps {
  isPending: boolean;
  generatedImages?: string[];
}

// Show this blurred image while the generated images are loading
const blurImageDataUrl =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEXSURBVHgBVZDPSsNAEMa//dP8WVOheFToJejBKh7E4hMIXn0FwcfwrQSvPoFevFQUIdrE0NBTXRPTcbJrxc4yLHzz229nRtzd3lCy2YdJ+og5oyiG1hpSKwhICAEXWrGgdYBeEPLdg1TKp5AOEL8kaxqqc+Ci4tr8PcP11SUuzs/+IO/YAdq70HeLx4d7JIMBtmyNpq4RhKEHheQ+GArDCDGL6f4I6egQL08TlHmO7eHQg0RLgLgHfmCbBvOiwPQtg+2K/NMqZFM3WLYtiAgbxiCvKuzs7kGsBmETZ0RuIp6CtS+7wPHJGCaKYGLTkcz4o4/Gp8wIB05fn5FNuLfyA0VZIl0cwNpPtzZRzWYknDthPVj5J/0AA1VXn/cQBtkAAAAASUVORK5CYII=';

const OutputGeneration: FC<OutputGenerationProps> = ({ isPending, generatedImages }) => {
  return (
    <div className='w-full lg:w-1/2 pl-0 lg:pl-7 lg:border-l'>
      <div className='h-full'>
        {isPending ? (
          <div className='flex flex-col justify-center items-center mb-16 mt-10'>
            <div className='flex flex-col items-center justify-center'>
              <LuLoader className='animate-[spin_3s_linear_infinite] text-center mb-2' size={24} />
              <p className='text-base font-medium text-center text-default mb-2'>
                Your images will be ready in less than a minute. You can wait or find your generations later
                in the History.
              </p>
            </div>
            <Image src={EmptyState} alt='Empty-state' className='animate-pulse' height={347} width={347} />
          </div>
        ) : generatedImages?.length ? (
          <div className=''>
            <p className='text-default text-sm font-semibold mb-4'>Output</p>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 w-full'>
              {generatedImages?.map((imageUrl, index) => (
                <div key={index} className='relative group'>
                  <Image
                    src={imageUrl}
                    alt=''
                    width={250}
                    height={250}
                    className='border rounded-md mx-auto w-full'
                    placeholder='blur'
                    blurDataURL={blurImageDataUrl}
                  />
                  <div className='absolute inset-0 bg-black/50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                    <Button
                      variant='outline'
                      onClick={() => downloadImage(imageUrl, `output-${index + 1}.png`)}
                      className='rounded-full text-white border-white'>
                      <TbDownload className='mr-2' />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className='flex flex-col justify-center items-center'>
              <p className='text-base font-medium text-center mb-5 mt-10 text-default'>
                Your output will be displayed here
              </p>
              <Image src={EmptyState} alt='Empty-state' height={347} width={347} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputGeneration;
