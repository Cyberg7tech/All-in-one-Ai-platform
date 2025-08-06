import { RiLayoutGridFill } from 'react-icons/ri';
import { MdHistory } from 'react-icons/md';

export const SidebarRoutes = [
  {
    icon: <RiLayoutGridFill className='size-5' />,
    label: 'Home',
    path: '/dashboard/youtube-content-generator',
  },
  {
    icon: <MdHistory className='size-5' />,
    label: 'History',
    path: '/dashboard/youtube-content-generator/history',
  },
];
