import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Code, Database, Zap, Shield, Globe } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Documentation</h1>
          <p className="text-gray-300 text-lg">
            Complete guide to using the One Ai platform
          </p>
        </div>

        {/* Quick Start */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-400" />
              Quick Start
            </CardTitle>
            <CardDescription className="text-gray-300">
              Get up and running with One Ai in minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                <div>
                  <h3 className="text-white font-semibold">Sign Up</h3>
                  <p className="text-gray-300">Create your account using email or Google authentication</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                <div>
                  <h3 className="text-white font-semibold">Explore Tools</h3>
                  <p className="text-gray-300">Navigate to the dashboard and try different AI tools</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                <div>
                  <h3 className="text-white font-semibold">Start Creating</h3>
                  <p className="text-gray-300">Use AI chat, generate images, create videos, and more</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-green-400" />
                AI Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Chat with multiple AI models including Llama, Qwen, and DeepSeek. Get intelligent responses for any task.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Code className="w-5 h-5 mr-2 text-purple-400" />
                AI Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Create custom AI agents that can perform complex tasks and workflows automatically.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Database className="w-5 h-5 mr-2 text-orange-400" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Track your usage, monitor performance, and get insights into your AI interactions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* API Documentation */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Globe className="w-5 h-5 mr-2 text-cyan-400" />
              API Reference
            </CardTitle>
            <CardDescription className="text-gray-300">
              Integrate One Ai into your applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-semibold mb-2">Authentication</h3>
                <p className="text-gray-300 mb-2">All API requests require authentication using your API key:</p>
                <code className="bg-gray-900 text-green-400 px-2 py-1 rounded text-sm">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Base URL</h3>
                <code className="bg-gray-900 text-blue-400 px-2 py-1 rounded text-sm">
                  https://your-domain.vercel.app/api
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="w-5 h-5 mr-2 text-red-400" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="text-white font-semibold">Data Protection</h3>
                <p className="text-gray-300">Your data is encrypted and stored securely using industry-standard practices.</p>
              </div>
              <div>
                <h3 className="text-white font-semibold">API Security</h3>
                <p className="text-gray-300">All API communications are secured with HTTPS and proper authentication.</p>
              </div>
              <div>
                <h3 className="text-white font-semibold">Privacy</h3>
                <p className="text-gray-300">We respect your privacy and never share your data with third parties.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 