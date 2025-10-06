# Complete Backend Deployment Guide
## Using Railway + Qdrant Cloud

Follow these steps in order. Each step should take 5-10 minutes.

---

## ⏱️ **STEP 1: Set Up Qdrant Cloud** (5 minutes)

### 1.1 Create Account
1. Open browser and go to: **https://cloud.qdrant.io**
2. Click **"Sign Up"** or **"Get Started"**
3. Sign up using:
   - GitHub (recommended - fastest)
   - Google
   - Email

### 1.2 Create Your First Cluster
1. After login, you'll see the dashboard
2. Click **"Create Cluster"** button
3. Fill in the details:
   - **Cluster Name**: `rag-system-cluster` (or any name you like)
   - **Plan**: Select **"Free"** (1GB storage)
   - **Region**: Choose closest to you:
     - US East (if you're in India, this is fine)
     - EU West
     - Asia Pacific
4. Click **"Create"**
5. Wait 2-3 minutes for provisioning (status will show "Running" when ready)

### 1.3 Get Connection Details
1. Click on your cluster name to open details
2. You'll see:
   - **Cluster URL**: Something like `https://abc-xyz-123.aws.cloud.qdrant.io:6333`
   - **API Key**: Click "Show" or "Copy" to get it

3. **IMPORTANT**: Copy these to a text file temporarily:
   ```
   QDRANT_URL=https://abc-xyz-123.aws.cloud.qdrant.io:6333
   QDRANT_API_KEY=your-api-key-here
   ```

✅ **Checkpoint**: You should have your Qdrant URL and API Key saved

---

## 🔧 **STEP 2: Prepare Your Code** (3 minutes)

### 2.1 Check Git Status
Open terminal in your project folder and run:
```bash
cd "c:\Users\kashy\OneDrive\Desktop\GenAi-with-javascript\Rag system"
git status
```

### 2.2 Initialize Git (if needed)
If you see "not a git repository", run:
```bash
git init
git add .
git commit -m "Initial commit - RAG system ready for deployment"
```

If git is already initialized, just commit any changes:
```bash
git add .
git commit -m "Backend ready for Railway deployment"
```

✅ **Checkpoint**: Your code is committed to git

---

## 📦 **STEP 3: Push to GitHub** (5 minutes)

### 3.1 Create GitHub Repository
1. Go to: **https://github.com/new**
2. Fill in:
   - **Repository name**: `rag-system` (or any name)
   - **Description**: "RAG System with LangChain and Qdrant"
   - **Visibility**: Public (or Private if you prefer)
   - ⚠️ **DO NOT** check "Initialize with README" (you already have files)
3. Click **"Create repository"**

### 3.2 Push Your Code
GitHub will show you commands. Use these in your terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/rag-system.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME`** with your actual GitHub username!

If prompted for credentials:
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (not your password)
  - Generate one at: https://github.com/settings/tokens
  - Select scope: `repo`

✅ **Checkpoint**: Your code is on GitHub

---

## 🚂 **STEP 4: Deploy to Railway** (10 minutes)

### 4.1 Create Railway Account
1. Go to: **https://railway.app**
2. Click **"Login"**
3. Select **"Login with GitHub"** (easiest option)
4. Authorize Railway to access your GitHub

### 4.2 Create New Project
1. On Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. You'll see a list of your repositories
4. Find and click **"rag-system"** (or whatever you named it)
5. Railway will start analyzing your repo

### 4.3 Configure Backend Service
1. Railway will detect the backend folder
2. You might see a settings panel:
   - **Root Directory**: Type `/backend` or `backend`
   - **Build Command**: Leave empty (uses Dockerfile)
   - **Start Command**: Leave empty (uses Dockerfile CMD)
3. Click **"Deploy"** or it will auto-deploy

### 4.4 Wait for Initial Build
1. You'll see build logs
2. This takes 3-5 minutes (Docker is building)
3. Watch for:
   - ✅ "Build successful"
   - ✅ "Deployment successful"
   - Look for "Server is running on port 5000" in logs

⚠️ **If build fails**: Check that Dockerfile is in the backend folder

✅ **Checkpoint**: Backend is deployed (but not configured yet)

---

## 🔐 **STEP 5: Configure Environment Variables** (5 minutes)

### 5.1 Open Variables Settings
1. In Railway, click on your **backend service** (the box/card)
2. Click on **"Variables"** tab at the top

### 5.2 Add All Variables
Click **"New Variable"** for each of these:

**Variable 1: OPENAI_API_KEY**
```
Name: OPENAI_API_KEY
Value: sk-your-actual-openai-key-here
```
(Get from: https://platform.openai.com/api-keys)

**Variable 2: QDRANT_URL**
```
Name: QDRANT_URL
Value: https://abc-xyz-123.aws.cloud.qdrant.io:6333
```
(Use the URL you copied from Qdrant Cloud in Step 1)

**Variable 3: QDRANT_API_KEY**
```
Name: QDRANT_API_KEY
Value: your-qdrant-api-key-here
```
(Use the API key from Qdrant Cloud in Step 1)

**Variable 4: PORT**
```
Name: PORT
Value: 5000
```

**Variable 5: NODE_ENV**
```
Name: NODE_ENV
Value: production
```

**Variable 6: ALLOWED_ORIGINS**
```
Name: ALLOWED_ORIGINS
Value: https://gen-ai-with-javascript.vercel.app,http://localhost:3000
```

### 5.3 Save and Redeploy
1. After adding all variables, Railway will automatically redeploy
2. Wait 1-2 minutes for the new deployment
3. Check logs for "Server is running on port 5000"

✅ **Checkpoint**: Environment variables are configured

---

## 🌐 **STEP 6: Get Your Backend URL** (2 minutes)

### 6.1 Generate Public Domain
1. In Railway, click on your **backend service**
2. Go to **"Settings"** tab
3. Scroll to **"Networking"** section
4. Under **"Public Networking"**, click **"Generate Domain"**
5. Railway will create a URL like: `rag-system-production.up.railway.app`

### 6.2 Copy Your Backend URL
Copy this URL - you'll need it for frontend!

```
Your Backend URL: https://rag-system-production.up.railway.app
```

✅ **Checkpoint**: Backend has a public URL

---

## ✅ **STEP 7: Test Your Backend** (3 minutes)

### 7.1 Test Health Endpoint
Open your browser and go to:
```
https://your-backend-url.railway.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### 7.2 Check Railway Logs
1. In Railway, click on your backend service
2. Click **"Deployments"** tab
3. Click on the latest deployment
4. Check logs for:
   - ✅ "Server is running on port 5000"
   - ✅ No error messages
   - ✅ Qdrant connection successful (when you make a request)

### 7.3 Test with Curl (Optional)
In your terminal:
```bash
curl https://your-backend-url.railway.app/api/health
```

Should return the JSON response.

✅ **Checkpoint**: Backend is working!

---

## 🎯 **STEP 8: Update Frontend Configuration** (2 minutes)

You'll need to update your frontend to use the Railway backend URL.

### 8.1 Note Down Your URLs
Create a note with these:
```
Backend URL: https://your-backend-url.railway.app
Frontend URL: https://gen-ai-with-javascript.vercel.app
```

### 8.2 We'll Update Frontend Next
In the next steps, we'll:
1. Update the frontend API configuration
2. Deploy frontend to Vercel
3. Test the complete application

---

## 🐛 **Troubleshooting Common Issues**

### ❌ Build fails on Railway
**Solution:**
- Ensure `Dockerfile` is in the `backend` folder
- Check Root Directory is set to `/backend` or `backend`
- Check Dockerfile syntax is correct

### ❌ "Server is running" but health check fails
**Solution:**
- Check PORT environment variable is set to 5000
- Make sure public domain is generated
- Wait 1-2 minutes after deployment

### ❌ CORS errors
**Solution:**
- Add your frontend URL to `ALLOWED_ORIGINS`
- Format: `https://your-app.vercel.app,http://localhost:3000`
- No trailing slashes!

### ❌ OpenAI API errors
**Solution:**
- Check API key is correct
- Ensure you have credits: https://platform.openai.com/usage
- API key should start with `sk-`

### ❌ Qdrant connection errors
**Solution:**
- Verify Qdrant cluster is "Running" in Qdrant Cloud
- Check URL includes `https://` and `:6333`
- Verify API key is correct

---

## 📝 **Deployment Checklist**

Before moving to frontend deployment:

- [ ] Qdrant Cloud cluster is running
- [ ] Code is pushed to GitHub
- [ ] Railway project is created
- [ ] Backend service is deployed
- [ ] All 6 environment variables are set
- [ ] Public domain is generated
- [ ] `/api/health` endpoint returns success
- [ ] No errors in Railway logs
- [ ] Backend URL is saved for frontend use

---

## 🎉 **Success! Backend is Deployed**

Your backend is now live and ready to use!

**What's Next:**
1. Update frontend API URL to point to Railway
2. Deploy frontend to Vercel
3. Test the complete application

**Your Backend URLs:**
- Health Check: `https://your-backend-url.railway.app/api/health`
- Process Text: `https://your-backend-url.railway.app/api/process-text`
- Upload File: `https://your-backend-url.railway.app/api/upload`
- Process URL: `https://your-backend-url.railway.app/api/process-url`
- Query: `https://your-backend-url.railway.app/api/query`

---

**Need help?** Let me know which step you're stuck on!
