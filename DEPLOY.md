# Deployment Instructions

## Step 1: Create GitHub Repository

A browser window should have opened to https://github.com/new

1. **Repository name**: `naths-job-matcher-web`
2. **Description**: "PROTOCOL 1A v3 job scoring tool"
3. **Visibility**: Public
4. **Initialize with**: Leave unchecked (we already have code)
5. Click "Create repository"

## Step 2: Add Remote & Push

Once the repository is created, run:

```powershell
cd "C:\Users\Nathaniel Jared\Downloads\naths-job-matcher-web"

# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/naths-job-matcher-web.git
git branch -M main
git push -u origin main
```

## Step 3: Connect to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Click "Import Git Repository"
4. Select your GitHub account
5. Find and select "naths-job-matcher-web"
6. Click "Import"
7. Vercel auto-detects Next.js, no config needed
8. Click "Deploy"

## Step 4: Auto-Deployment Enabled

Once deployed, every push to `main` branch auto-deploys to production.

```powershell
# Test: Make a change and push
git add .
git commit -m "Test auto-deployment"
git push
# Watch deployment at: https://vercel.com/dashboard
```

---

**That's it!** Your job matcher is live and auto-updates on every commit.
