# Render.com Deployment Checklist

## ✅ Pre-Deployment Setup

- [x] **render.yaml** configured with proper build and start commands
- [x] **Next.js config** optimized for production (standalone output)
- [x] **Build process** verified locally
- [x] **Environment variables** documented
- [x] **Health check endpoint** configured (`/api/health`)

## 🚀 Deployment Steps

### 1. Repository Setup
- [ ] Push all changes to your Git repository
- [ ] Ensure `render.yaml` is in the root directory
- [ ] Verify all files are committed

### 2. Render.com Setup
- [ ] Create account on [render.com](https://render.com)
- [ ] Connect your Git repository
- [ ] Create a new Web Service
- [ ] Create a PostgreSQL database

### 3. Environment Variables
Set these in your Render service dashboard:

**Required Variables:**
- [ ] `OPENAI_API_KEY` - Your OpenAI API key
- [ ] `SENDGRID_API_KEY` - Your SendGrid API key  
- [ ] `ADMIN_PASSWORD` - Secure admin password
- [ ] `ADMIN_SESSION_SECRET` - Random secret string

**Optional Variables (have defaults):**
- [ ] `OPENAI_MODEL` - Set to "gpt-4o-mini"
- [ ] `SENDGRID_FROM_EMAIL` - Set to "reports@yourdomain.com"
- [ ] `SENDGRID_FROM_NAME` - Set to "T&L LSG Reports"
- [ ] `SITE_URL` - Your Render app URL

### 4. Database Configuration
- [ ] Link the PostgreSQL database to your web service
- [ ] The `DATABASE_URL` will be automatically provided

### 5. Deploy
- [ ] Trigger deployment from Render dashboard
- [ ] Monitor build logs for any errors
- [ ] Check health endpoint: `https://your-app.onrender.com/api/health`

## 🔍 Post-Deployment Verification

- [ ] **Health Check**: Visit `/api/health` to verify all services
- [ ] **Admin Access**: Test admin login at `/admin`
- [ ] **Form Submission**: Test the main assessment form
- [ ] **Email Functionality**: Verify email reports are sent
- [ ] **Database**: Check that submissions are saved

## 🛠️ Troubleshooting

**Build Fails:**
- Check build logs in Render dashboard
- Verify all dependencies are in package.json
- Ensure Prisma client is generated

**Database Issues:**
- Verify DATABASE_URL is set correctly
- Check database connection in Render dashboard
- Run Prisma migrations if needed

**Environment Variables:**
- Double-check all required variables are set
- Verify API keys are valid and have proper permissions
- Check variable names match exactly (case-sensitive)

## 📝 Notes

- The app uses Prisma with PostgreSQL
- Email functionality requires SendGrid API key
- AI features require OpenAI API key
- Admin access is protected with password authentication
- All sensitive data is marked as `sync: false` in render.yaml
