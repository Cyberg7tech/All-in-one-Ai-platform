# 🤖 AI Modules Setup Guide - BuilderKit Pro Configuration

This guide will help you set up all AI modules according to [BuilderKit.ai documentation](https://docs.builderkit.ai/).

## 📋 Overview

Your All-in-One AI Platform includes **18+ AI modules** built following BuilderKit Pro patterns:

### 🎯 **Core AI Modules**
- **MultiLLM ChatGPT** - Chat with 200+ AI models
- **Content Writer** - AI-powered content generation  
- **Image Generator** - DALL-E and Stable Diffusion
- **Text-to-Speech** - Voice synthesis with ElevenLabs
- **Voice Transcription** - Audio to text conversion

### 🧠 **Advanced AI Apps**
- **Chat with PDF** - Document Q&A with vector search
- **Chat with YouTube** - Video transcript analysis
- **Headshot Generator** - Professional AI portraits
- **QR Generator** - Custom QR codes with AI
- **Interior Design** - AI-powered room design

### 🎨 **Creative AI Tools**
- **Music Generator** - AI music composition
- **Image Upscaler** - Enhance image resolution
- **Ghibli Generator** - Studio Ghibli style art
- **Quiz Generator** - Educational content creation
- **YouTube Content** - Video script generation

### 💬 **Specialized Chat Apps**
- **DeepSeek Chat** - Advanced reasoning models
- **Gemini Chat** - Google's multimodal AI
- **Llama Chat** - Open-source Meta models

---

## 🛠️ Environment Configuration

Create a `.env` file in your project root with the following variables:

### **Required Core Setup**
```env
# Supabase (Required for all modules)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication (Required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_generate_one
```

### **Primary AI Providers** (Choose at least one)
```env
# OpenAI - For GPT models and DALL-E
OPENAI_API_KEY=sk-your-openai-api-key

# Together AI - For open-source models (Llama, Mistral)
TOGETHER_API_KEY=your_together_ai_api_key

# AI/ML API - For 200+ models (Claude, Gemini, Grok)
AIML_API_KEY=your_aiml_api_key
```

### **Specialized Services** (Optional)
```env
# Image Generation
REPLICATE_API_TOKEN=r8_your_replicate_token

# Audio Services
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Video Generation
HEYGEN_API_KEY=your_heygen_api_key

# Music Generation
SUNO_API_KEY=your_suno_api_key

# Vector Search (for PDF chat)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
```

---

## 🔑 API Key Setup Instructions

### 1. **Supabase Setup** (Required)
1. Go to [supabase.com](https://supabase.com) and create a project
2. In your project dashboard, go to **Settings > API**
3. Copy the **Project URL** and **anon public key**
4. Copy the **service_role secret key** (never expose this publicly)

### 2. **OpenAI Setup** (Recommended)
1. Visit [platform.openai.com](https://platform.openai.com/api-keys)
2. Create an account and add billing information
3. Generate an API key (starts with `sk-`)
4. **Enables**: GPT models, DALL-E image generation, Whisper transcription

### 3. **Together AI Setup** (Recommended for Open Source)
1. Go to [api.together.ai](https://api.together.ai/)
2. Sign up and get your API key
3. **Enables**: Llama, Mistral, CodeLlama, Qwen models (much cheaper than OpenAI)

### 4. **AI/ML API Setup** (For Premium Models)
1. Visit [aimlapi.com](https://aimlapi.com/)
2. Get access to 200+ models including:
   - **Claude 3.5 Sonnet** (Anthropic)
   - **Gemini Pro** (Google)
   - **Grok** (xAI)
   - **o1 Preview** (OpenAI)

### 5. **Replicate Setup** (For Advanced Image/Video AI)
1. Go to [replicate.com](https://replicate.com/account/api-tokens)
2. Create an account and get your token (starts with `r8_`)
3. **Enables**: Flux image generation, video models, face enhancement

### 6. **ElevenLabs Setup** (For Text-to-Speech)
1. Visit [elevenlabs.io](https://elevenlabs.io/)
2. Create account and get API key
3. **Enables**: High-quality voice synthesis in multiple languages

---

## 🧪 Testing Your Setup

### 1. **Health Check**
Visit: `http://localhost:3000/api/health`

This will show which APIs are configured correctly.

### 2. **Test Core Modules**

#### **MultiLLM Chat**
- Go to `/dashboard/ai-apps/multillm-chatgpt`
- Try different models (GPT-4, Claude, Llama)
- Verify responses are generated

#### **Image Generator**
- Go to `/dashboard/ai-apps/image-generator`
- Generate an image with DALL-E
- Check if images are displayed

#### **Text-to-Speech**
- Go to `/dashboard/ai-apps/text-to-speech`
- Convert text to speech
- Verify audio playback works

### 3. **Verify Database Connection**
- Try logging in/signing up
- Check if user sessions persist
- Verify chat history is saved

---

## 📊 Module Requirements Matrix

| AI Module | Required APIs | Optional APIs |
|-----------|---------------|---------------|
| **MultiLLM Chat** | Any AI provider | All providers for model variety |
| **Content Writer** | Any AI provider | - |
| **Image Generator** | OPENAI_API_KEY | REPLICATE_API_TOKEN |
| **Text-to-Speech** | ELEVENLABS_API_KEY | - |
| **Voice Transcription** | OPENAI_API_KEY | - |
| **Chat with PDF** | Any AI provider | PINECONE_API_KEY |
| **Chat with YouTube** | Any AI provider | - |
| **Headshot Generator** | REPLICATE_API_TOKEN | - |
| **QR Generator** | Any AI provider | - |
| **Interior Design** | TOGETHER_API_KEY | - |
| **Music Generator** | SUNO_API_KEY | - |
| **Image Upscaler** | REPLICATE_API_TOKEN | - |
| **Ghibli Generator** | REPLICATE_API_TOKEN | - |
| **Quiz Generator** | Any AI provider | - |
| **DeepSeek Chat** | AIML_API_KEY | DEEPSEEK_API_KEY |
| **Gemini Chat** | AIML_API_KEY | GOOGLE_AI_API_KEY |
| **Llama Chat** | TOGETHER_API_KEY | - |
| **YouTube Content** | Any AI provider | - |

---

## 🚀 Quick Start (Minimum Setup)

To get started with basic functionality, you only need:

```env
# Database & Auth
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key  
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXTAUTH_SECRET=generate_random_string

# At least one AI provider
TOGETHER_API_KEY=your_together_key  # Cheapest option
# OR
OPENAI_API_KEY=sk-your_openai_key   # Premium option
```

This enables:
- ✅ User authentication
- ✅ Basic chat functionality
- ✅ Content generation
- ✅ Most AI modules (with limitations)

---

## 🔧 Advanced Configuration

### **Cost Optimization**
- Use **Together AI** for most chat interactions (much cheaper)
- Use **OpenAI** only for premium features (DALL-E, Whisper)
- Use **AI/ML API** for accessing premium models without direct subscriptions

### **Performance Optimization**
- Configure **Pinecone** for faster PDF search
- Use **Replicate** for high-quality image generation
- Enable multiple providers for automatic fallbacks

### **Feature Completeness**
- Add **HeyGen** for talking avatars
- Add **Suno** for music generation
- Add **ElevenLabs** for professional voice synthesis

---

## 🎯 BuilderKit Pro Integration

This setup follows [BuilderKit.ai documentation](https://docs.builderkit.ai/) patterns:

- ✅ **Modular Architecture** - Each AI app is independent
- ✅ **Unified API Layer** - Single service handles all providers
- ✅ **Proper Error Handling** - Graceful fallbacks and user feedback
- ✅ **Cost Management** - Intelligent provider routing
- ✅ **Scalable Design** - Easy to add new models and providers

---

## 📞 Support & Resources

- **BuilderKit Documentation**: [docs.builderkit.ai](https://docs.builderkit.ai/)
- **API Health Check**: `/api/health`
- **Model Status**: `/api/ai/models`
- **Configuration Test**: `/dashboard/explore`

---

## ✅ Setup Checklist

- [ ] Supabase project created and configured
- [ ] Database schema applied (`supabase/simple-db-reset-and-setup.sql`)
- [ ] Environment variables configured
- [ ] At least one AI provider API key added
- [ ] Development server running (`npm run dev`)
- [ ] Health check passing (`/api/health`)
- [ ] User authentication working
- [ ] AI modules accessible from dashboard
- [ ] Sample AI interactions successful

---

**🎉 Congratulations!** Your BuilderKit AI platform is now configured with industry-standard AI integrations, ready for development and deployment following BuilderKit Pro patterns.
