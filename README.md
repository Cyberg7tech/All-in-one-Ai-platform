# 🤖 One AI - Complete AI Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-CyberG7_Technologies-green)](#)

**One AI** is a comprehensive all-in-one AI platform that brings together 80+ AI models, intelligent agents, creative tools, and advanced analytics in a single, beautiful interface.

## ✨ Features

### 🧠 **Multi-Model AI Chat**
- **80+ AI Models** from top providers:
  - **OpenAI**: GPT-4.1, GPT-4o, GPT-4 Turbo, o1-mini, o1-preview
  - **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku  
  - **Google**: Gemini Pro, Gemini Flash, Gemini Ultra
  - **xAI**: Grok 2, Grok 3, Grok 4
  - **DeepSeek**: V3, R1, R1-0528
  - **Meta**: Llama 3.1, Llama 3.2, Llama 3.3
  - **Mistral**: Large, Small, Nemo
  - **Kimi**: K1, K2

### 🤖 **AI Agents System**
- Create custom AI agents with specialized tools
- Pre-built agent templates (Marketing, Developer, Data Analyst)
- Agent collaboration and workflow automation
- Advanced tool integration capabilities

### 🎨 **Creative AI Tools**
- **AI Image Generator** - DALL-E 3, Stable Diffusion XL, Midjourney
- **AI Video Generator** - Runway Gen-2, text-to-video generation
- **AI Talking Videos** - AI avatars with voice synthesis
- **AI Music Generator** - Suno AI music creation
- **AI Interior Designer** - Room design and visualization
- **AI Photo Studio** - Professional photo editing and enhancement

### 🎙️ **Audio AI Tools**
- **Text-to-Speech** - Natural voice synthesis with multiple voices
- **Speech-to-Text** - Accurate transcription in multiple languages
- **Record & Transcribe** - Live audio capture with real-time transcription

### 📊 **Analytics & Insights**
- Real-time usage analytics
- Model performance tracking
- Cost monitoring and optimization
- User engagement metrics

### 🔧 **Advanced Features**
- **Forecasting & Anomaly Detection** - Predictive analytics
- **Document Processing** - AI-powered document analysis
- **Workflow Automation** - Custom automation pipelines
- **Model Testing Playground** - Compare and test different AI models

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Cyberg7tech/All-in-one-Ai-platform.git
   cd All-in-one-Ai-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure API Keys** (in `.env.local`)
   ```env
   # OpenAI
   OPENAI_API_KEY=your_openai_api_key
   
   # Anthropic
   ANTHROPIC_API_KEY=your_anthropic_api_key
   
   # Google AI
   GOOGLE_API_KEY=your_google_api_key
   
   # xAI/Grok
   XAI_API_KEY=your_xai_api_key
   
   # DeepSeek
   DEEPSEEK_API_KEY=your_deepseek_api_key
   
   # Kimi
   KIMI_API_KEY=your_kimi_api_key
   
   # Additional APIs (optional)
   RUNWAY_API_KEY=your_runway_api_key
   SUNO_API_KEY=your_suno_api_key
   REPLICATE_API_TOKEN=your_replicate_token
   HEYGEN_API_KEY=your_heygen_api_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Demo Authentication

For testing purposes, use these demo accounts:

- **Admin**: `admin@oneai.com` / `admin123`
- **Developer**: `dev@oneai.com` / `dev123` 
- **User**: `user@oneai.com` / `user123`

## 🏗️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React Context
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom demo system
- **Deployment**: Vercel

## 📁 Project Structure

```
All-in-one-Ai-platform/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── api/              # API routes
│   └── login/            # Authentication
├── components/           # React components
│   ├── ui/              # UI components
│   ├── auth/            # Auth components
│   └── providers/       # Context providers
├── lib/                 # Utilities and services
│   ├── ai/             # AI API integrations
│   ├── auth/           # Authentication logic
│   └── utils/          # Helper functions
├── public/             # Static assets
└── types/              # TypeScript types
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🎯 Key Features Showcase

### Multi-Model Chat Interface
Switch between 80+ AI models seamlessly with a ChatGPT-like interface.

### AI Agents
Create specialized AI assistants with custom tools and personalities.

### Creative Suite
Generate images, videos, music, and designs with cutting-edge AI models.

### Voice & Audio
Convert text to speech, transcribe audio, and record with live transcription.

### Analytics Dashboard
Monitor usage, costs, and performance across all AI services.

## 🔒 Security & Privacy

- All API keys are stored securely in environment variables
- Demo authentication system for testing (replace with real auth in production)
- Client-side session management
- Rate limiting and error handling

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms

The app can be deployed to any platform that supports Node.js and Next.js:
- Netlify
- Railway
- DigitalOcean
- AWS
- Google Cloud

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

© 2024 CyberG7 Technologies. All rights reserved.

## 🔗 Links

- **Website**: [One AI Platform](https://github.com/Cyberg7tech/All-in-one-Ai-platform)
- **Issues**: [GitHub Issues](https://github.com/Cyberg7tech/All-in-one-Ai-platform/issues)
- **Documentation**: [Full Documentation](https://github.com/Cyberg7tech/All-in-one-Ai-platform/wiki)

## 🆘 Support

For support, please open an issue on GitHub or contact CyberG7 Technologies.

---

**Built with ❤️ by CyberG7 Technologies**

*Empowering businesses with intelligent AI solutions.* 