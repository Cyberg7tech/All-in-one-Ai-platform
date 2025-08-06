'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  MessageSquare,
  Bot,
  Wrench,
  Image,
  Video,
  UserCheck,
  Mic,
  Volume2,
  FileAudio,
  Music,
  PaintBucket,
  Camera,
  Sparkles,
  Zap,
  History,
  LogOut,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const navigationItems = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Agents', href: '/dashboard/agents', icon: Bot },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Tools', href: '/dashboard/explore', icon: Wrench },
  { name: 'AI Images', href: '/dashboard/tools/image-generator', icon: Image },
  { name: 'AI Videos', href: '/dashboard/tools/video-generator', icon: Video, badge: 'New' },
  { name: 'AI Talking Videos', href: '/dashboard/tools/talking-videos', icon: UserCheck, badge: 'New' },
  { name: 'AI Text to Speech', href: '/dashboard/tools/text-to-speech', icon: Volume2 },
  { name: 'AI Speech to Text', href: '/dashboard/tools/speech-to-text', icon: Mic },
  { name: 'Record & Transcribe', href: '/dashboard/tools/record-transcribe', icon: FileAudio },
  { name: 'AI Music Generator', href: '/dashboard/tools/music-generator', icon: Music, badge: 'New' },
  { name: 'AI Interior Designer', href: '/dashboard/tools/interior-design', icon: PaintBucket },
  { name: 'AI Photo Studio', href: '/dashboard/tools/photo-studio', icon: Camera },
  { name: 'Headshots', href: '/dashboard/tools/headshots', icon: Sparkles, badge: 'New' },
  { name: 'Brand Voice', href: '/dashboard/tools/brand-voice', icon: Zap },
  { name: 'History', href: '/dashboard/history', icon: History },
];

export function SideNavigation() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className='w-64 bg-card border-r border-border hidden md:flex md:flex-col'>
      {/* Navigation Items */}
      <nav className='flex-1 overflow-y-auto py-4'>
        <div className='px-3 space-y-1'>
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}>
                <div className='flex items-center space-x-3'>
                  <item.icon className='w-5 h-5' />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <Badge variant='secondary' className='text-xs'>
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout Section */}
      <div className='p-4 border-t border-border'>
        <Button
          variant='ghost'
          className='w-full justify-start text-muted-foreground hover:text-foreground'
          onClick={logout}>
          <LogOut className='w-4 h-4 mr-3' />
          Logout
        </Button>
      </div>
    </div>
  );
}
