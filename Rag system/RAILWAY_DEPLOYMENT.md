# Railway Deployment Guide - RAG System Backend

This guide will walk you through deploying your RAG system backend to Railway.

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **OpenAI API Key**: Get one from [platform.openai.com](https://platform.openai.com)

---

## 🚀 Step-by-Step Deployment

### **Step 1: Prepare Your Repository**

1. **Initialize Git (if not already done)**
   ```bash
   cd "c:\Users\kashy\OneDrive\Desktop\GenAi-with-javascript\Rag system"
   git init
   git add .
   git commit -m "Initial commit - RAG system"
   ```

2. **Create a GitHub repository**
   - Go to [github.com/new](https://github.com/new)
   - Create a new repository (e.g., `rag-system`)
   - Don't initialize with README (you already have files)

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/rag-system.git
   git branch -M main
   git push -u origin main
   ```

---

### **Step 2: Set Up Railway Project**

1. **Login to Railway**
   - Go to [railway.app](https://railway.app)
   - Click "Login" and sign in with GitHub

2. **Create a New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your repositories
   - Select your `rag-system` repository

3. **Configure Build Settings**
   - Railway will auto-detect the Dockerfile in the `backend` folder
   - Root directory: `/backend` (or select the backend folder)
   - Railway will use the Dockerfile we created

---

### **Step 3: Add Qdrant Service**

1. **Add Qdrant to your Railway project**
   
   **Option A: Use Qdrant Template (Recommended)**
   - In your Railway project dashboard, click "New"
   - Select "Database" → "Add Qdrant"
   - Railway will create a Qdrant instance for you

   **Option B: Deploy from Docker**
   - Click "New" → "Empty Service"
   - Go to "Settings" → "Source"
   - Select "Docker Image"
   - Image: `qdrant/qdrant:v1.7.0`
   - Add volumes: `/qdrant/storage`

2. **Note the Qdrant URL**
   - Railway will provide an internal URL like: `qdrant.railway.internal:6333`
   - You'll use this in environment variables

---

### **Step 4: Configure Environment Variables**

1. **Go to your backend service** in Railway dashboard

2. **Click on "Variables" tab**

3. **Add the following environment variables:**

   ```bash
   # Required Variables
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   
   # Qdrant Configuration (use Railway's internal URL)
   QDRANT_URL=http://qdrant.railway.internal:6333
   
   # Server Configuration
   PORT=5000
   NODE_ENV=production
   
   # CORS - Add your Vercel frontend URL later
   ALLOWED_ORIGINS=http://localhost:3000
   ```

   **Important Notes:**
   - Replace `sk-your-actual-openai-api-key-here` with your real OpenAI API key
   - The `QDRANT_URL` should use Railway's internal networking
   - You'll update `ALLOWED_ORIGINS` after deploying the frontend

4. **Save the variables** - Railway will auto-deploy

---

### **Step 5: Deploy and Monitor**

1. **Wait for Deployment**
   - Railway will build your Docker image
   - This takes 3-5 minutes on first deploy
   - Watch the logs in the "Deployments" tab

2. **Check Deployment Logs**
   - Click on "Deployments" tab
   - Select the latest deployment
   - Check for any errors
   - Look for: `Server is running on port 5000`

3. **Common Issues & Fixes:**

   **Problem: Build fails**
   - Check the Dockerfile path is correct
   - Ensure `backend` folder is selected as root directory

   **Problem: Qdrant connection fails**
   - Verify `QDRANT_URL` uses Railway's internal URL
   - Check Qdrant service is running

   **Problem: Out of memory**
   - Increase RAM in Settings → Resources
   - Default is 512MB, try 1GB

---

### **Step 6: Get Your Backend URL**

1. **Generate Public URL**
   - Go to "Settings" tab
   - Under "Networking" → "Public Networking"
   - Click "Generate Domain"
   - Railway will provide a URL like: `your-app.railway.app`

2. **Copy this URL** - you'll need it for the frontend

3. **Test the Backend**
   - Visit: `https://your-app.railway.app/api/health`
   - You should see: `{"status":"ok","message":"Server is running"}`

---

### **Step 7: Update CORS for Frontend**

After deploying your frontend to Vercel (next step), you'll need to:

1. **Get your Vercel URL** (e.g., `https://your-app.vercel.app`)

2. **Update Railway environment variable:**
   - Go to Railway → Variables
   - Update `ALLOWED_ORIGINS`:
     ```
     ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
     ```

3. **Railway will auto-redeploy** with new CORS settings

---

## 🎯 Quick Reference

### Railway Dashboard URLs
- **Project Dashboard**: `https://railway.app/project/YOUR_PROJECT_ID`
- **Backend Service Logs**: Click on service → "Deployments" → Latest deployment
- **Environment Variables**: Click on service → "Variables"

### Important Commands

**View Logs:**
```bash
# Install Railway CLI (optional)
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# View logs
railway logs
```

**Redeploy:**
- Push to GitHub → Railway auto-deploys
- Or click "Redeploy" in Railway dashboard

---

## 💰 Pricing & Resource Usage

**Free Tier:**
- $5 credit per month
- Enough for development and testing
- ~500 hours of 512MB service

**Typical Usage:**
- Backend service: ~$3-5/month
- Qdrant service: ~$2-4/month
- Total: ~$5-9/month

**Optimization Tips:**
- Use Railway's sleep feature for dev environments
- Monitor usage in "Usage" tab
- Scale down when not in use

---

## 🐛 Troubleshooting

### Backend won't start
1. Check environment variables are set correctly
2. View deployment logs for errors
3. Ensure Dockerfile builds successfully locally

### Qdrant connection errors
1. Verify Qdrant service is running (green status)
2. Check `QDRANT_URL` uses internal Railway URL
3. Test connection in logs

### CORS errors
1. Verify `ALLOWED_ORIGINS` includes your frontend URL
2. Check frontend is using correct backend URL
3. View browser console for specific origin being blocked

### File upload issues
1. Railway has ephemeral filesystem (files don't persist)
2. Your current setup is OK (files are processed then deleted)
3. For permanent storage, use S3 or Railway volumes

---

## 📝 Next Steps

1. ✅ **Deploy Backend to Railway** (you're here)
2. 🔄 **Deploy Frontend to Vercel** (next)
3. 🔗 **Connect Frontend to Backend**
4. 🧪 **Test the Full Application**

---

## 🆘 Need Help?

- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Status**: [status.railway.app](https://status.railway.app)

---

## ✅ Deployment Checklist

Before going live, ensure:

- [ ] Backend deployed successfully on Railway
- [ ] Qdrant service running and connected
- [ ] All environment variables set
- [ ] Health check endpoint working (`/api/health`)
- [ ] OpenAI API key is valid and has credits
- [ ] CORS configured for frontend URL
- [ ] Logs show no errors
- [ ] Test file upload functionality
- [ ] Test URL processing
- [ ] Test query functionality

---

**Ready to deploy? Let's go! 🚀**
