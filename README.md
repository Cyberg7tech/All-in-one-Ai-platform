# 🤖 One AI - Complete AI Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-CyberG7_Technologies-green)](#)

**One AI** is a comprehensive all-in-one AI platform that brings together intelligent agents, creative tools, and advanced analytics in a single, beautiful interface.

## ✨ Features

### 🧠 **Multi-Model AI Chat**
- **12 Together AI Models** for cost-effective, high-performance chat:
  - **Llama 3.1 70B Turbo** - Latest Meta model (Recommended)
  - **Qwen 2.5 72B Turbo** - Alibaba's advanced model
  - **DeepSeek R1 Distill 70B** - Advanced reasoning
  - **Llama 3.2 90B Vision** - Multimodal capabilities
  - **Mixtral 8x7B** - Fast and efficient
  - **Free Models** - 3 models available at no cost
- **Real-time conversations** with persistent chat history
- **Model selection** with pricing and performance indicators
- **Cost-effective** at $0.88/1M tokens (70-90% cheaper than premium services)

### 🤖 **AI Agents System**
- **10+ Specialized AI Agents** with professional expertise
- **Marketing Assistant** - Campaign strategies and content creation
- **Developer Assistant** - Code review and technical guidance
- **Data Analyst** - Data insights and visualization
- **Content Creator** - Writing and creative content
- **Research Assistant** - Information gathering and analysis
- **Business Consultant** - Strategy and planning
- **Health Advisor** - Wellness and medical information
- **Financial Advisor** - Investment and financial planning
- **Travel Planner** - Trip planning and recommendations
- **Language Tutor** - Language learning and practice

### 🎨 **Creative AI Tools**

#### **AI Interior Designer** 🏠
- **Together AI-powered** design suggestions and prompts
- **Professional design concepts** with color palettes
- **Furniture recommendations** with budget breakdowns
- **Lighting plans** and layout suggestions
- **Style-specific guidance** for modern, traditional, minimalist designs

#### **AI Photo Studio** 📸
- **Professional photo editing** instructions and analysis
- **Step-by-step enhancement** guidance
- **Color correction** and technical settings
- **Style recommendations** for different photo types
- **Before/after expectations** and alternative approaches

#### **AI Headshots** 👤
- **Expert headshot prompt** generation
- **Photography settings** and composition guidelines
- **Style specifications** for different industries
- **Professional editing** tips and post-processing advice
- **Multiple variants** and alternative approaches

### 🎙️ **Audio AI Tools**
- **Text-to-Speech** - Natural voice synthesis with ElevenLabs
- **Speech-to-Text** - Accurate transcription in multiple languages
- **Record & Transcribe** - Real-time audio processing

### 📊 **Analytics & Insights**
- **User activity tracking** and usage analytics
- **Performance metrics** and cost analysis
- **Model usage statistics** and optimization insights

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Supabase account (for database)
- Together AI account (for AI models)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd All-in-one-Ai-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with:
   ```bash
   # Database (Required)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Together AI (Required for AI features)
   TOGETHER_API_KEY=your_together_api_key

   # ElevenLabs (Optional - for text-to-speech)
   ELEVENLABS_API_KEY=your_elevenlabs_api_key

   # App Settings (Optional)
   # Add any additional app configuration here
   ```

4. **Database Setup**
   Run the SQL scripts in `supabase/schema.sql` to set up your database tables.

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 **Key Features**

### **Cost Optimization**
- **Together AI Integration**: 70-90% cost savings compared to premium AI services
- **Smart Model Selection**: Automatic routing to most cost-effective models
- **Usage Analytics**: Track costs and optimize usage patterns

### **Professional Quality**
- **Expert-Level Prompts**: Each tool uses specialized, professional prompts
- **Industry Standards**: Follows best practices for each domain
- **Comprehensive Output**: Detailed, actionable recommendations

### **User Experience**
- **Clean Interface**: Modern, responsive design with Tailwind CSS
- **Real-time Updates**: Live chat and processing status
- **Persistent Data**: Chat history and user preferences saved
- **Mobile Responsive**: Works seamlessly on all devices

## 🛠 **Technology Stack**

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Database**: Supabase (PostgreSQL)
- **AI Models**: Together AI (Llama, Qwen, DeepSeek, Mixtral)
- **Authentication**: Supabase Auth (Built-in)
- **Deployment**: Vercel-ready

## 📁 **Project Structure**

```
All-in-one-Ai-platform/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
├── contexts/              # React contexts
├── lib/                   # Utility libraries
│   ├── ai/               # AI integration services
│   ├── supabase/         # Database helpers
│   └── utils/            # Utility functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── supabase/              # Database schema and migrations
└── public/                # Static assets
```

## 🔧 **API Endpoints**

### **Chat & AI**
- `POST /api/ai/chat` - AI chat completions
- `GET /api/ai/models` - Available AI models
- `POST /api/agents/execute` - AI agent execution

### **Creative Tools**
- `POST /api/ai/interior-design` - Interior design suggestions
- `POST /api/ai/photo-enhance` - Photo editing analysis
- `POST /api/ai/generate-headshot` - Headshot generation

### **Audio Tools**
- `POST /api/ai/text-to-speech` - Text-to-speech conversion
- `POST /api/ai/speech-to-text` - Speech-to-text conversion

## 💰 **Pricing**

### **Together AI Models**
- **Llama 3.1 70B Turbo**: $0.88/1M tokens
- **Qwen 2.5 72B Turbo**: $1.20/1M tokens
- **Mixtral 8x7B**: $0.60/1M tokens
- **Free Models**: 3 models available at no cost

### **Cost Comparison**
- **Together AI**: $0.88/1M tokens
- **OpenAI GPT-4**: $30/1M tokens (34x more expensive)
- **Claude 3.5**: $15/1M tokens (17x more expensive)

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the CyberG7 Technologies License.

## 🆘 **Support**

- **Documentation**: Check the inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join community discussions

---

**Built with ❤️ using Next.js, Together AI, and Supabase** 