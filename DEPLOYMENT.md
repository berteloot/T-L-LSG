# Deployment Guide for Render.com

## Prerequisites

1. **Database**: PostgreSQL database (configured in render.yaml)
2. **Environment Variables**: Set the following in Render dashboard

## Required Environment Variables

Set these in your Render service dashboard:

### Database
- `DATABASE_URL` - Automatically provided by Render database

### OpenAI Configuration
- `OPENAI_API_KEY` - Your OpenAI API key
- `OPENAI_MODEL` - Set to "gpt-4o-mini" (default)

### SendGrid Configuration
- `SENDGRID_API_KEY` - Your SendGrid API key
- `SENDGRID_FROM_EMAIL` - Email address for sending reports
- `SENDGRID_FROM_NAME` - Display name for emails

### Application Configuration
- `NODE_ENV` - Set to "production"
- `SITE_URL` - Your Render app URL (e.g., https://tl-lsg-app.onrender.com)

### Admin Configuration
- `ADMIN_PASSWORD` - Secure password for admin access
- `ADMIN_SESSION_SECRET` - Random secret for session management

## Deployment Steps

1. **Push to Git**: Ensure your code is pushed to your Git repository
2. **Connect to Render**: Link your repository to Render
3. **Set Environment Variables**: Add all required environment variables in Render dashboard
4. **Deploy**: Render will automatically build and deploy using the render.yaml configuration

## Build Process

The build process includes:
1. `npm install` - Install dependencies
2. `npx prisma generate` - Generate Prisma client
3. `npm run build` - Build the Next.js application

## Health Check

The application includes a health check endpoint at `/api/health` that verifies:
- Database connection
- OpenAI API key
- SendGrid API key
- SendGrid from email

## Database Setup

The PostgreSQL database will be automatically created by Render. The Prisma schema will be applied during the first deployment.

## Troubleshooting

- Check the Render logs for build errors
- Verify all environment variables are set correctly
- Ensure the database is properly connected
- Check the health endpoint for service status
