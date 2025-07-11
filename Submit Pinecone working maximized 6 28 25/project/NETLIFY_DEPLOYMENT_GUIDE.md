# Netlify Deployment Guide for UnionBolt AI

## 🎉 GitHub Repository Ready!

Your project has been successfully pushed to GitHub:
**Repository:** https://github.com/Rubling66/unionbolt-ai-hackathon

## Step-by-Step Netlify Deployment

### 1. Connect GitHub to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub account
5. Select the repository: `Rubling66/unionbolt-ai-hackathon`

### 2. Configure Build Settings

```yaml
# Build Settings
Build command: npm run build
Publish directory: .next
Node version: 18.x
```

### 3. Environment Variables Setup

In Netlify Dashboard → Site Settings → Environment Variables, add:

```bash
# Database & AI Configuration
DATABASE_URL=your_database_url
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=your_pinecone_env
PINECONE_INDEX_NAME=your_index_name

# Tavus API
TAVUS_API_KEY=your_tavus_key
TAVUS_REPLICA_ID=your_replica_id

# DeepSeek R1 (if using external API)
DEEPSEEK_API_KEY=your_deepseek_key

# Next.js
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-netlify-domain.netlify.app

# Payment Integration
STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
PAYPAL_CLIENT_ID=your_paypal_id
```

### 4. Domain Configuration

#### Option A: Use Netlify Subdomain
- Your site will be available at: `https://your-site-name.netlify.app`
- Update your Hostinger domain forwarding to point to this URL

#### Option B: Custom Domain
1. In Netlify Dashboard → Domain Settings
2. Click **"Add custom domain"**
3. Enter: `unionbolts.com`
4. Follow DNS configuration instructions
5. Update your Hostinger DNS settings as instructed

### 5. Build Configuration

Create/update `netlify.toml` in your project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

### 6. Deploy!

1. Click **"Deploy site"**
2. Wait for the build to complete (usually 2-5 minutes)
3. Your site will be live!

## 🔧 Post-Deployment Checklist

- [ ] Test all API endpoints
- [ ] Verify database connections
- [ ] Test Tavus video chat functionality
- [ ] Check payment integration
- [ ] Test gatekeeper routing
- [ ] Verify DeepSeek R1 responses

## 🚀 Automatic Deployments

Once connected, every push to the `main` branch will automatically trigger a new deployment!

## 📊 Monitoring

- **Build Logs:** Available in Netlify Dashboard
- **Function Logs:** Real-time monitoring of API routes
- **Analytics:** Built-in traffic and performance metrics

## 🔄 Rollback Strategy

Netlify keeps all previous deployments. You can instantly rollback to any previous version if needed.

---

**Next Steps:**
1. Go to Netlify and start the deployment process
2. Configure your environment variables
3. Test the deployment
4. Update your domain settings

**Repository:** https://github.com/Rubling66/unionbolt-ai-hackathon
**Current Status:** ✅ Ready for Netlify deployment