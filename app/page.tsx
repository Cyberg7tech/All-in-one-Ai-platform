'use client'

import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Bot, Brain, TrendingUp, Shield, Zap, Users, Database, Sparkles, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AIIcon } from '@/components/ui/ai-icon'

// Remove metadata since this is now a client component

const features = [
  {
    icon: Bot,
    title: 'AI Agents',
    description: 'Create custom AI agents with specialized tools, personalities, and knowledge bases for any task.',
    color: 'text-blue-500'
  },
  {
    icon: Brain,
    title: 'Multi-Model AI',
    description: 'Access GPT-4, Claude, Llama, and more. Switch between models for optimal performance.',
    color: 'text-purple-500'
  },
  {
    icon: TrendingUp,
    title: 'Forecasting',
    description: 'Advanced time series forecasting with multiple algorithms and AI-powered insights.',
    color: 'text-green-500'
  },
  {
    icon: Shield,
    title: 'Anomaly Detection',
    description: 'Real-time anomaly detection with intelligent alerts and automated responses.',
    color: 'text-red-500'
  },
  {
    icon: Database,
    title: 'Vector Search',
    description: 'Semantic search through your documents and data with advanced RAG capabilities.',
    color: 'text-indigo-500'
  },
  {
    icon: Sparkles,
    title: 'Creative AI',
    description: 'Generate images, videos, music, and content with cutting-edge AI models.',
    color: 'text-pink-500'
  }
]

const models = [
  { name: 'GPT-4 Turbo', provider: 'OpenAI', type: 'Text' },
  { name: 'Claude 3 Opus', provider: 'Anthropic', type: 'Text' },
  { name: 'DALL-E 3', provider: 'OpenAI', type: 'Image' },
  { name: 'Stable Diffusion XL', provider: 'Replicate', type: 'Image' },
  { name: 'Runway Gen-2', provider: 'Runway', type: 'Video' },
  { name: 'Suno Music', provider: 'Suno', type: 'Audio' },
]

const useCases = [
  {
    title: 'Customer Service',
    description: 'Deploy intelligent customer service agents that understand context and provide accurate responses.',
    icon: Users
  },
  {
    title: 'Data Analysis',
    description: 'Analyze trends, detect anomalies, and generate forecasts from your business data.',
    icon: TrendingUp
  },
  {
    title: 'Content Creation',
    description: 'Generate high-quality content, images, and videos for marketing and communication.',
    icon: Sparkles
  },
  {
    title: 'Process Automation',
    description: 'Automate complex workflows with AI agents that can reason and make decisions.',
    icon: Zap
  }
]

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <AIIcon size={20} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">One Ai</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#models" className="text-muted-foreground hover:text-foreground transition-colors">
              Models
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" asChild>
              <Link href="/test">Test Platform</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Demo Login</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            🚀 Now featuring AI Agents & Advanced Analytics
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              One Ai
            </span>
            <br />
            for Modern Business
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Transform your workflow with intelligent AI agents, advanced forecasting, 
            anomaly detection, and seamless access to multiple AI models. 
            Built for developers, designed for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/login">
                <LogIn className="mr-2 w-5 h-5" />
                Try Demo Login <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link href="/test">
                Test Platform
              </Link>
            </Button>
          </div>
          
          {/* Hero Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">15+</div>
              <div className="text-sm text-muted-foreground">AI Models</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">50ms</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for Every Use Case
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From intelligent agents to advanced analytics, our platform provides 
              everything you need to harness the power of AI.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-background ${feature.color}`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Models Section */}
      <section id="models" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Access Leading AI Models
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from the best AI models available, or let our platform 
              automatically select the optimal model for your task.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{model.name}</h3>
                      <p className="text-sm text-muted-foreground">{model.provider}</p>
                    </div>
                    <Badge variant={
                      model.type === 'Text' ? 'default' :
                      model.type === 'Image' ? 'secondary' :
                      model.type === 'Video' ? 'destructive' : 'outline'
                    }>
                      {model.type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Real-World Applications
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how businesses are transforming their operations with our AI platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <useCase.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{useCase.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {useCase.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Explore the AI Platform?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Experience our comprehensive AI platform with demo accounts. 
              No registration required - start exploring immediately!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link href="/login">
                  <LogIn className="mr-2 w-5 h-5" />
                  Demo Login <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <Link href="/test">
                  Test Platform
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/20 border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <AIIcon size={20} className="text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">One Ai</span>
              </div>
              <p className="text-muted-foreground">
                Empowering businesses with intelligent AI solutions.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/integrations" className="hover:text-foreground transition-colors">Integrations</Link></li>
                <li><Link href="/api" className="hover:text-foreground transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link href="/guides" className="hover:text-foreground transition-colors">Guides</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/support" className="hover:text-foreground transition-colors">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 CyberG7 Technologies. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 