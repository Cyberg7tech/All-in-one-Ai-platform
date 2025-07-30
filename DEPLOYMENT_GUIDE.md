# 🚀 Vercel Deployment Guide

## **Quick Deploy Steps**

### **Method 1: One-Click Deploy (Recommended)**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/Cyberg7tech/All-in-one-Ai-platform)

### **Method 2: Manual Deployment**

#### **1. Connect GitHub Repository**
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click **"Add New" → "Project"**
4. **Import your GitHub repository:**
   ```
   https://github.com/Cyberg7tech/All-in-one-Ai-platform
   ```

#### **2. Configure Project Settings**
- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

#### **3. Set Environment Variables**

**Required Variables:**
```bash
# Database (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Together AI (Required for AI features)
TOGETHER_API_KEY=your_together_api_key

# App Settings (Required)
NEXTAUTH_SECRET=your_random_secret_string
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
```

**Optional Variables:**
```bash
# ElevenLabs (Optional - for text-to-speech)
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

#### **4. Deploy**
Click **"Deploy"** and wait for build completion (~2-3 minutes)

---

## **Environment Variables Setup**

### **1. Supabase Configuration**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings → API**
4. Copy the values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### **2. Together AI Setup**
1. Go to [Together AI](https://api.together.ai/)
2. Sign up/login
3. Go to **API Keys**
4. Create new key → `TOGETHER_API_KEY`

### **3. Authentication Secret**
Generate a random secret:
```bash
# Option 1: Use online generator
https://generate-secret.vercel.app/32

# Option 2: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **4. NextAuth URL**
Set to your Vercel domain:
```
https://your-project-name.vercel.app
```

---

## **Deployment Process**

### **Build Steps (Automatic)**
1. **Install Dependencies** (~30s)
2. **Build Next.js App** (~90s)
3. **Generate Static Pages** (~60s)
4. **Deploy to CDN** (~30s)

### **Total Deployment Time: ~3-4 minutes**

---

## **Post-Deployment Setup**

### **1. Database Schema**
Run the SQL schema in your Supabase dashboard:
```sql
-- Copy content from supabase/schema.sql
-- Paste in Supabase SQL Editor
-- Execute
```

### **2. Test Deployment**
Visit your Vercel URL and test:
- ✅ **Home page loads**
- ✅ **Login/Signup works**
- ✅ **Chat interface works**
- ✅ **Together AI models load**

### **3. Custom Domain (Optional)**
1. Go to Vercel dashboard
2. Select your project
3. Go to **Settings → Domains**
4. Add your custom domain

---

## **Performance Optimizations**

### **Vercel Configuration**
The included `vercel.json` optimizes:
- **Function timeout:** 30 seconds for AI APIs
- **Region:** US East (iad1) for fast response
- **Environment variables:** Secure handling

### **Expected Performance**
- **Global CDN:** Sub-100ms static content
- **API responses:** 1-3 seconds for AI calls
- **First load:** ~2-3 seconds
- **Subsequent loads:** <1 second

---

## **Troubleshooting**

### **Common Issues**

#### **1. Build Fails**
```bash
Error: Environment variables not set
```
**Solution:** Add all required environment variables in Vercel dashboard

#### **2. Database Connection Error**
```bash
Error: Invalid Supabase configuration
```
**Solution:** Verify Supabase URLs and keys are correct

#### **3. AI API Errors**
```bash
Error: Together AI API key not configured
```
**Solution:** Add `TOGETHER_API_KEY` in environment variables

#### **4. Authentication Issues**
```bash
Error: NextAuth configuration error
```
**Solution:** 
- Set `NEXTAUTH_SECRET` (random 32-character string)
- Set `NEXTAUTH_URL` to your Vercel domain

### **Debug Steps**
1. Check **Vercel Dashboard → Functions → Logs**
2. Verify **Environment Variables** are set
3. Test **Database connection** via API health endpoint
4. Check **Build logs** for specific errors

---

## **Scaling & Monitoring**

### **Vercel Pro Features**
- **Analytics:** Built-in performance monitoring
- **Speed Insights:** Real user metrics
- **Function logs:** Detailed API debugging
- **Team collaboration:** Multiple developers

### **Cost Optimization**
- **Free tier:** 100GB bandwidth, 100 serverless function executions
- **Pro tier:** $20/month for production apps
- **Together AI:** $0.88/1M tokens (very cost-effective)

---

## **Maintenance**

### **Automatic Deployments**
- **Every git push** to main branch triggers deployment
- **Preview deployments** for pull requests
- **Rollback capability** to previous versions

### **Updates**
```bash
# Update dependencies
npm update

# Deploy updates
git add .
git commit -m "Update dependencies"
git push origin main
```

---

## **Security Checklist**

- ✅ **Environment variables** stored securely in Vercel
- ✅ **API keys** not exposed in client code
- ✅ **Database RLS** policies enabled in Supabase
- ✅ **HTTPS** enforced automatically
- ✅ **CORS** configured properly for APIs

---

## **Support**

### **Resources**
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Together AI Docs:** [docs.together.ai](https://docs.together.ai)

### **Getting Help**
- **Vercel Support:** Built-in chat support
- **GitHub Issues:** Report bugs in repository
- **Community:** Next.js Discord, Supabase Discord

---

**🎉 Your AI platform is now live on Vercel! 🚀** 