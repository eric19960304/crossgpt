# Docker Deployment Guide for Google SSO

## Overview

This guide explains how to deploy the CrossGPT application with Google SSO authentication using Docker on your Raspberry Pi 4B.

## Prerequisites

- Docker and Docker Compose installed on Raspberry Pi
- Google OAuth credentials (Client ID and Secret)
- Domain configured (https://chat.ericlauchiho.me)

## Step 1: Update Docker Compose Configuration

Your existing `docker-compose.yml` should be updated to include the new environment variables. Here's an example configuration:

```yaml
version: "3"

services:
  crossgpt:
    build: .
    ports:
      - "3000:3000"
    environment:
      # Google OAuth Credentials (NEW - Required)
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}

      # Existing API Keys
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - XAI_API_KEY=${XAI_API_KEY}

      # Other existing configurations...
      - CODE=${CODE}
      - PROXY_URL=${PROXY_URL}
      - BASE_URL=${BASE_URL}

    restart: unless-stopped
```

## Step 2: Set Environment Variables on Raspberry Pi

### Option A: Using .env file (Recommended)

Create or update `/home/eric/projects/crossgpt/.env` file:

```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# NextAuth Configuration
NEXTAUTH_SECRET=your-random-32-char-secret
NEXTAUTH_URL=https://chat.ericlauchiho.me

# Existing API Keys
OPENAI_API_KEY=sk-xxxx
GOOGLE_API_KEY=your-gemini-api-key
XAI_API_KEY=your-grok-api-key
```

**Generate NEXTAUTH_SECRET**:

```bash
openssl rand -base64 32
```

### Option B: Export Environment Variables

Add to your shell profile (`~/.bashrc` or `~/.zshrc`):

```bash
export GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="your-client-secret"
export NEXTAUTH_SECRET="your-random-32-char-secret"
export NEXTAUTH_URL="https://chat.ericlauchiho.me"

# Existing variables
export OPENAI_API_KEY="sk-xxxx"
export GOOGLE_API_KEY="your-gemini-api-key"
export XAI_API_KEY="your-grok-api-key"
```

Then reload:

```bash
source ~/.bashrc  # or source ~/.zshrc
```

## Step 3: Update Deployment Script

Your existing deployment script should work, but here's the complete version:

```bash
#!/bin/bash

# Pull latest code
echo "Pulling latest code from repository..."
git -C /home/eric/projects/crossgpt pull

# Build and deploy with Docker Compose
echo "Building and starting Docker containers..."
docker compose -f /home/eric/projects/crossgpt/docker-compose.yml up -d --build

# Check status
echo "Checking container status..."
docker compose -f /home/eric/projects/crossgpt/docker-compose.yml ps

echo "Deployment complete!"
```

## Step 4: Deploy

Run your deployment script:

```bash
cd /home/eric/projects/crossgpt
git pull
docker compose up -d --build
```

## Step 5: Verify Deployment

### Check Container Logs

```bash
docker compose -f /home/eric/projects/crossgpt/docker-compose.yml logs -f
```

Look for:

- ✅ No errors related to authentication
- ✅ Server started successfully
- ✅ No missing environment variable warnings

### Test the Application

1. Open browser and go to: `https://chat.ericlauchiho.me`
2. You should be redirected to `/login`
3. Click "Sign in with Google"
4. Complete Google OAuth flow
5. You should be redirected to `/chat` after successful login

### Verify Environment Variables

Check if environment variables are loaded correctly:

```bash
docker compose -f /home/eric/projects/crossgpt/docker-compose.yml exec crossgpt env | grep -E 'GOOGLE_|NEXTAUTH_'
```

You should see (values will be masked):

```
GOOGLE_CLIENT_ID=***
GOOGLE_CLIENT_SECRET=***
NEXTAUTH_SECRET=***
NEXTAUTH_URL=https://chat.ericlauchiho.me
```

## Troubleshooting

### Issue: "Configuration error" when trying to sign in

**Cause**: Missing or incorrect environment variables

**Solution**:

```bash
# Check if variables are set
echo $GOOGLE_CLIENT_ID
echo $NEXTAUTH_SECRET
echo $NEXTAUTH_URL

# If empty, set them in .env file or shell profile
# Then restart the container
docker compose restart
```

### Issue: "Redirect URI mismatch" error from Google

**Cause**: The redirect URI in Google Console doesn't match your domain

**Solution**:

1. Go to Google Cloud Console
2. Navigate to your OAuth credentials
3. Add the correct redirect URI: `https://chat.ericlauchiho.me/api/auth/callback/google`
4. Save and try again

### Issue: Container fails to start

**Cause**: Build or dependency errors

**Solution**:

```bash
# Check logs
docker compose logs crossgpt

# Rebuild from scratch
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Issue: Authentication works locally but not in production

**Cause**: `NEXTAUTH_URL` not set correctly

**Solution**:

```bash
# Make sure NEXTAUTH_URL matches your domain exactly
export NEXTAUTH_URL="https://chat.ericlauchiho.me"

# Restart container
docker compose restart
```

## Nginx/Reverse Proxy Configuration

If you're using Nginx as a reverse proxy, ensure these headers are passed:

```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

## Security Checklist

- [ ] `NEXTAUTH_SECRET` is a strong random value (32+ characters)
- [ ] Environment variables are not committed to git
- [ ] `.env` file has restricted permissions (`chmod 600 .env`)
- [ ] SSL/TLS certificate is valid and up to date
- [ ] Google OAuth redirect URI uses HTTPS
- [ ] Docker container runs as non-root user (if applicable)

## Maintenance

### Updating the Application

```bash
# Pull latest code
git -C /home/eric/projects/crossgpt pull

# Rebuild and restart
docker compose -f /home/eric/projects/crossgpt/docker-compose.yml up -d --build
```

### Viewing Logs

```bash
# Real-time logs
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100

# Specific service logs
docker compose logs crossgpt
```

### Restarting the Service

```bash
# Restart without rebuilding
docker compose restart

# Stop and start
docker compose down
docker compose up -d
```

## Performance Tips

1. **Enable Docker BuildKit** for faster builds:

   ```bash
   export DOCKER_BUILDKIT=1
   ```

2. **Clean up unused images** periodically:

   ```bash
   docker system prune -a
   ```

3. **Monitor resource usage**:
   ```bash
   docker stats crossgpt
   ```

## Backup Recommendations

Since user data is currently session-only (JWT tokens), backups are minimal:

1. **Backup environment variables**: Keep a secure copy of your `.env` file
2. **Backup Nginx configuration**: If using reverse proxy
3. **Document Google OAuth credentials**: Keep credentials in a secure password manager

When you implement database storage later, you'll need to add database backups to this list.

## Support

If you encounter issues:

1. Check container logs first
2. Verify all environment variables are set
3. Confirm Google OAuth settings are correct
4. Test locally before deploying to production
5. Provide error messages if asking for help

## Quick Reference Commands

```bash
# Deploy
git pull && docker compose up -d --build

# View logs
docker compose logs -f

# Restart
docker compose restart

# Stop
docker compose down

# Check status
docker compose ps

# Access container shell
docker compose exec crossgpt sh
```
