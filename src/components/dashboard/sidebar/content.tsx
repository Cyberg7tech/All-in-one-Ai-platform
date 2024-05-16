import { RiLayoutGridFill } from 'react-icons/ri';
import { MdHistory } from 'react-icons/md';

export const SidebarRoutes = [
  {
    icon: <RiLayoutGridFill className='size-5' />,
    label: 'Home',
    path: '/home',
  },
  {
    icon: <MdHistory className='size-5' />,
    label: 'History',
    path: '/history',
  },
  // {
  //   icon: <PiMagicWand className='size-5' />,
  //   label: 'Prompt library',
  //   path: '/prompt-library',
  // },
];
