import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  Brain,
  TrendingUp,
  Shield,
  Zap,
  Users,
  Database,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AIIcon } from '@/components/ui/ai-icon';
import { ThemeToggle } from '@/components/theme-switcher';

const features = [
  {
    icon: Bot,
    title: 'AI Agents',
    description:
      'Create custom AI agents with specialized tools, personalities, and knowledge bases for any task.',
    color: 'text-blue-500',
  },
  {
    icon: Brain,
    title: 'Multi-Model AI',
    description: 'Access GPT-4, Claude, Llama, and more. Switch between models for optimal performance.',
    color: 'text-purple-500',
  },
  {
    icon: TrendingUp,
    title: 'Forecasting',
    description: 'Advanced time series forecasting with multiple algorithms and AI-powered insights.',
    color: 'text-green-500',
  },
  {
    icon: Shield,
    title: 'Anomaly Detection',
    description: 'Real-time anomaly detection with intelligent alerts and automated responses.',
    color: 'text-red-500',
  },
  {
    icon: Database,
    title: 'Vector Search',
    description: 'Semantic search through your documents and data with advanced RAG capabilities.',
    color: 'text-indigo-500',
  },
  {
    icon: Sparkles,
    title: 'Creative AI',
    description: 'Generate images, videos, music, and content with cutting-edge AI models.',
    color: 'text-pink-500',
  },
];

export default function HomePage() {
  return (
    <div className='min-h-screen'>
      {/* Navigation */}
      <nav className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <div className='size-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center'>
              <AIIcon size={20} className='text-primary-foreground' />
            </div>
            <span className='font-bold text-xl'>One Ai</span>
          </div>
          <div className='hidden md:flex items-center space-x-6'>
            <Link href='#features' className='text-muted-foreground hover:text-foreground transition-colors'>
              Features
            </Link>
            <Link href='#pricing' className='text-muted-foreground hover:text-foreground transition-colors'>
              Pricing
            </Link>
            <Link href='/docs' className='text-muted-foreground hover:text-foreground transition-colors'>
              Docs
            </Link>
          </div>
          <div className='flex items-center space-x-3'>
            <ThemeToggle />
            <Button variant='ghost' asChild>
              <Link href='/dashboard'>Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href='/login'>Login</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20'>
        <div className='absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]' />
        <div className='relative container mx-auto px-4 py-24 text-center'>
          <div className='max-w-5xl mx-auto'>
            <Badge
              variant='secondary'
              className='px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors mb-8'>
              🚀 NEW: Advanced AI Agents & 18+ Tools Available
            </Badge>

            <h1 className='text-5xl sm:text-7xl font-bold tracking-tight mb-8 leading-tight'>
              The Complete
              <span className='block bg-gradient-to-r from-primary via-purple-600 to-cyan-600 bg-clip-text text-transparent'>
                AI Platform
              </span>
              for Business
            </h1>

            <p className='text-xl sm:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto'>
              Transform your workflow with 18+ AI tools, intelligent agents, advanced analytics, and seamless
              access to multiple AI models.
            </p>

            <div className='flex flex-col sm:flex-row gap-4 justify-center mb-16'>
              <Button size='lg' className='text-lg px-8 py-4 h-auto' asChild>
                <Link href='/dashboard'>
                  Start Building
                  <ArrowRight className='ml-2 size-5' />
                </Link>
              </Button>
              <Button size='lg' variant='outline' className='text-lg px-8 py-4 h-auto' asChild>
                <Link href='#demo'>
                  Watch Demo
                  <LogIn className='ml-2 size-5' />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id='features' className='py-24 bg-muted/50'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold mb-4'>Powerful AI Features</h2>
            <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
              Everything you need to build, deploy, and scale AI applications
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {features.map((feature, index) => (
              <Card key={index} className='border-0 shadow-lg hover:shadow-xl transition-shadow'>
                <CardHeader>
                  <div className='flex items-center space-x-3'>
                    <div className={`p-3 rounded-lg bg-background ${feature.color}`}>
                      <feature.icon className='size-6' />
                    </div>
                    <CardTitle className='text-xl'>{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className='text-base'>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-24'>
        <div className='container mx-auto px-4 text-center'>
          <div className='max-w-3xl mx-auto'>
            <h2 className='text-4xl font-bold mb-6'>Ready to Get Started?</h2>
            <p className='text-xl text-muted-foreground mb-8'>
              Join thousands of businesses using One AI to transform their operations
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Button size='lg' className='text-lg px-8 py-4 h-auto' asChild>
                <Link href='/dashboard'>Start Free Trial</Link>
              </Button>
              <Button size='lg' variant='outline' className='text-lg px-8 py-4 h-auto' asChild>
                <Link href='/pricing'>View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t bg-muted/50'>
        <div className='container mx-auto px-4 py-12'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            <div>
              <div className='flex items-center space-x-2 mb-4'>
                <div className='size-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center'>
                  <AIIcon size={20} className='text-primary-foreground' />
                </div>
                <span className='font-bold text-xl'>One Ai</span>
              </div>
              <p className='text-muted-foreground'>Empowering businesses with intelligent AI solutions.</p>
            </div>
            <div>
              <h3 className='font-semibold mb-4'>Product</h3>
              <ul className='space-y-2 text-muted-foreground'>
                <li><Link href='/pricing' className='hover:text-foreground transition-colors'>Pricing</Link></li>
                <li><Link href='/docs' className='hover:text-foreground transition-colors'>Docs</Link></li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold mb-4'>Company</h3>
              <ul className='space-y-2 text-muted-foreground'>
                <li><Link href='/about' className='hover:text-foreground transition-colors'>About</Link></li>
                <li><Link href='/privacy' className='hover:text-foreground transition-colors'>Privacy</Link></li>
              </ul>
            </div>
            <div>
              <div className='border-t pt-8 text-center text-muted-foreground'>
                <p>&copy; 2024 CyberG7 Technologies. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
