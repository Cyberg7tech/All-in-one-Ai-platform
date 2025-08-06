# 🚀 All-in-One AI Platform

> **A comprehensive AI application suite featuring 18+ AI-powered tools for content creation, media processing, and intelligent automation.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

---

## 🌟 Features

### 🤖 AI Chat & Language Models
- **💬 MultiLLM ChatGPT** - Support for GPT-4, Claude, Gemini, and more
- **🦙 Llama 3.1 Chat** - Advanced open-source language model
- **🤖 AI Agents** - Create custom AI assistants with specialized skills

### 📝 Content Creation
- **📝 Content Writer** - Generate blogs, social media posts, and marketing copy
- **📺 YouTube Content Generator** - Create video scripts, titles, and descriptions
- **🎵 Music Generator** - Compose original music with AI

### 🖼️ Image & Visual AI
- **🎨 Image Generator** - Create custom images from text prompts
- **🖼️ Photo Enhancer & Upscaler** - Improve image quality and resolution
- **🖼️ Headshot Generator** - Professional AI-generated portraits
- **🏠 Interior Design Generator** - AI-powered room design concepts

### 🎬 Video & Audio
- **🎥 Video Generator** - Create videos from text descriptions
- **🎬 Talking Video Generator** - AI avatars that speak your content
- **🗣️ Text to Speech** - Natural voice synthesis in multiple languages
- **🎙️ Voice Transcription** - Convert audio to text with high accuracy

### 📄 Document & Data Processing
- **📄 Chat with PDF** - Interactive Q&A with your documents
- **🎥 Chat with YouTube** - Ask questions about video content
- **📱 QR Code Generator** - Create custom QR codes

### 🔧 Productivity Tools
- **🎯 Brand Voice** - Maintain consistent messaging across content
- **📊 Analytics Dashboard** - Track usage, costs, and performance
- **⚡ Workflow Automation** - Chain AI tools together

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase
- **Database:** PostgreSQL (Supabase) with Row Level Security
- **Authentication:** Supabase Auth (Google OAuth + Email)
- **AI Providers:** OpenAI, Anthropic, Google, Together AI, Replicate
- **Deployment:** Vercel-ready

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- API keys for AI services (OpenAI, Anthropic, etc.)

### 1. Clone & Install

```bash
git clone https://github.com/Cyberg7tech/All-in-one-Ai-platform.git
cd All-in-one-Ai-platform
npm install
```

### 2. Database Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Reset and setup database:**
   ```bash
   # In Supabase SQL Editor, run these files in order:
   # 1. supabase/reset-database.sql (⚠️ This deletes all data!)
   # 2. supabase/fresh-setup.sql
   ```

3. **Verify setup:**
   - Check that all tables are created
   - Verify Row Level Security is enabled
   - Test authentication

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# AI Provider API Keys
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
TOGETHER_API_KEY=your_together_ai_api_key
REPLICATE_API_TOKEN=your_replicate_api_key

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Media Processing APIs
HEYGEN_API_KEY=your_heygen_api_key
RUNWAYML_API_KEY=your_runwayml_api_key
LUMALABS_API_KEY=your_lumalabs_api_key

# File Storage
UPLOADCARE_PUBLIC_KEY=your_uploadcare_public_key
UPLOADCARE_SECRET_KEY=your_uploadcare_secret_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

---

## 📋 Detailed Setup Guide

### Database Schema

The platform uses a comprehensive database schema with the following core tables:

- **`users`** - User profiles and authentication
- **`ai_models`** - Available AI models and configurations
- **`ai_agents`** - Custom AI assistants
- **`chat_sessions`** & **`chat_messages`** - Conversation history
- **`generated_content`** - AI-generated assets
- **`usage_tracking`** - Token usage and cost tracking
- **`user_api_keys`** - Encrypted user API keys
- **`activities`** - User action logs
- **`analytics_data`** - Platform analytics

### Security Features

- **🔒 Row Level Security (RLS)** - Users can only access their own data
- **🔐 Encrypted API Keys** - User API keys are encrypted at rest
- **🛡️ Authentication** - Supabase Auth with Google OAuth and email
- **🚫 Rate Limiting** - Built-in protection against abuse

### AI Provider Integration

The platform supports multiple AI providers:

1. **OpenAI** - GPT models, DALL-E, Whisper, TTS
2. **Anthropic** - Claude models
3. **Google** - Gemini models
4. **Together AI** - Open source models
5. **Replicate** - Stable Diffusion, video models
6. **HeyGen** - AI avatar generation
7. **RunwayML** - Video generation

---

## 🌐 Deployment

### Deploy to Vercel

1. **Connect Repository:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `All-in-one-Ai-platform` repo

2. **Environment Variables:**
   - Copy all variables from your `.env` file
   - Add them to Vercel's environment variables section
   - Make sure to set `NEXTAUTH_URL` to your production domain

3. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

### Custom Domain Setup

1. Add your domain in Vercel dashboard
2. Update DNS records as instructed
3. Update `NEXTAUTH_URL` in environment variables
4. Update Supabase Auth settings with new domain

---

## 🔧 Configuration

### Adding New AI Models

1. **Update database:**
   ```sql
   INSERT INTO ai_models (id, name, provider, model_type, description)
   VALUES ('new-model-id', 'Model Name', 'Provider', 'chat', 'Description');
   ```

2. **Update code:**
   - Add model configuration in `lib/ai/models.ts`
   - Update API integration in `lib/ai/api-integration.ts`

### Customizing Features

- **UI Components:** Modify files in `components/ui/`
- **Dashboard Layout:** Edit `app/dashboard/layout.tsx`
- **Navigation:** Update `components/side-navigation.tsx`
- **Styling:** Customize `tailwind.config.js` and `app/globals.css`

---

## 📊 Usage Analytics

The platform includes comprehensive analytics:

- **Token Usage** - Track API consumption across all models
- **Cost Tracking** - Monitor spending per user and feature
- **User Activity** - Log user actions and feature usage
- **Performance Metrics** - API response times and success rates

Access analytics at `/dashboard/analytics`

---

## 🐛 Troubleshooting

### Common Issues

**🔴 Database Connection Errors**
```bash
# Check Supabase configuration
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**🔴 Authentication Issues**
- Verify `NEXTAUTH_URL` matches your domain
- Check Google OAuth configuration in Supabase
- Ensure Supabase Auth is properly configured

**🔴 AI API Errors**
- Verify API keys are correct and have sufficient credits
- Check rate limits and quotas
- Review error logs in browser console

**🔴 Build Errors**
```bash
# Clear cache and rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Debug

Use the debug endpoint to verify environment variables:
```
GET /api/debug/env
```

### Database Issues

If you encounter database errors:

1. **Check schema:**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

2. **Reset database:** Use `supabase/reset-database.sql` and `supabase/fresh-setup.sql`

3. **Check RLS policies:**
   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a pull request

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- **Documentation:** [Full Setup Guide](DATABASE_RESET_GUIDE.md)
- **Database Setup:** [RLS Setup Guide](RLS_SETUP_GUIDE.md)
- **Issues:** [GitHub Issues](https://github.com/Cyberg7tech/All-in-one-Ai-platform/issues)
- **Contact:** Create an issue for support

---

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Additional AI providers (Azure OpenAI, AWS Bedrock)
- [ ] Advanced workflow automation
- [ ] Team collaboration features
- [ ] API marketplace
- [ ] Plugin system

---

**Built with ❤️ using BuilderKit.ai foundation**

> Transform your ideas into reality with the power of AI ✨