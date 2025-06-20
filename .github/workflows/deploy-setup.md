# Vercel Deployment Setup Guide

## Prerequisites

1. **Vercel Account**: Create an account at https://vercel.com
2. **Vercel Project**: Import your GitHub repository in Vercel dashboard
3. **Database**: Set up a production PostgreSQL database (e.g., Supabase, Neon, Railway)

## Required GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

### Vercel Secrets
- `VERCEL_TOKEN`: Your Vercel personal access token
  - Get it from: https://vercel.com/account/tokens
- `VERCEL_ORG_ID`: Your Vercel organization ID
  - Find in: https://vercel.com/account
- `VERCEL_PROJECT_ID`: Your Vercel project ID
  - Find in: Vercel project settings

### Environment Variables in Vercel

Set these in your Vercel project settings (Settings → Environment Variables):

#### Production & Preview
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Random secret (generate with `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID`: From Google Cloud Console
- `GOOGLE_CLIENT_SECRET`: From Google Cloud Console

#### Production Only
- `NEXTAUTH_URL`: Your production domain (e.g., https://yourdomain.com)

## How to Get Vercel IDs

1. Install Vercel CLI locally:
   ```bash
   pnpm add -g vercel
   ```

2. Link your project:
   ```bash
   vercel link
   ```

3. The `.vercel/project.json` file will contain:
   ```json
   {
     "projectId": "YOUR_PROJECT_ID",
     "orgId": "YOUR_ORG_ID"
   }
   ```

## Workflow Features

### Preview Deployments
- Automatically deploys PRs to preview URLs
- Comments PR with deployment link
- Isolated environment for testing

### Production Deployments
- Deploys to production when pushing to `main`
- Uses production environment variables
- Automatic SSL and CDN

## Database Migration Strategy

For production deployments, consider:

1. **Option 1**: Run migrations in build step
   Add to `package.json`:
   ```json
   "vercel-build": "prisma generate && prisma migrate deploy && next build"
   ```

2. **Option 2**: Manual migrations
   Run migrations separately before deploying

3. **Option 3**: Use Prisma Migrate in preview
   Add preview-specific build command in `vercel.json`

## Testing the Setup

1. Create a test PR to see preview deployment
2. Merge to `main` to trigger production deployment
3. Check Vercel dashboard for deployment status

## Troubleshooting

- **Build fails**: Check Vercel function logs
- **Database connection**: Ensure DATABASE_URL is correct
- **Auth issues**: Verify NEXTAUTH_URL matches your domain