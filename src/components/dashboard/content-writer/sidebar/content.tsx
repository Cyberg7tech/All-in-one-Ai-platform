import { RiLayoutGridFill } from 'react-icons/ri';
import { MdHistory } from 'react-icons/md';

export const SidebarRoutes = [
  {
    icon: <RiLayoutGridFill className='size-5' />,
    label: 'Home',
    path: '/dashboard/content-writer',
  },
  {
    icon: <MdHistory className='size-5' />,
    label: 'History',
    path: '/dashboard/content-writer/history',
  },
];
