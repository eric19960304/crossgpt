# Google SSO Setup Checklist

Follow this checklist step-by-step to implement Google SSO authentication.

## ✅ Pre-Deployment Checklist

### 1. Install Dependencies

```bash
cd /home/eric/projects/crossgpt
npm install
# or
yarn install
```

- [ ] Dependencies installed successfully
- [ ] No error messages during installation

### 2. Create Google OAuth Credentials

Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

- [ ] Created or selected a Google Cloud project
- [ ] Enabled Google+ API (or Google People API)
- [ ] Created OAuth 2.0 Client ID (Web application)
- [ ] Added authorized redirect URI: `https://chat.ericlauchiho.me/api/auth/callback/google`
- [ ] Copied Client ID
- [ ] Copied Client Secret

### 3. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

- [ ] Generated random secret
- [ ] Saved the secret securely

### 4. Configure Environment Variables

Choose one method:

#### Method A: .env file

Create `/home/eric/projects/crossgpt/.env`:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=https://chat.ericlauchiho.me

# Existing variables
OPENAI_API_KEY=sk-xxxx
GOOGLE_API_KEY=your-gemini-key
XAI_API_KEY=your-grok-key
```

- [ ] Created .env file
- [ ] Added all required variables
- [ ] Set proper file permissions: `chmod 600 .env`

#### Method B: Export in shell profile

Add to `~/.bashrc` or `~/.zshrc`:

```bash
export GOOGLE_CLIENT_ID="..."
export GOOGLE_CLIENT_SECRET="..."
export NEXTAUTH_SECRET="..."
export NEXTAUTH_URL="https://chat.ericlauchiho.me"
```

- [ ] Added exports to shell profile
- [ ] Reloaded profile: `source ~/.bashrc`
- [ ] Verified variables: `echo $GOOGLE_CLIENT_ID`

### 5. Update Docker Configuration (if using Docker)

Update `docker-compose.yml` to include new environment variables:

```yaml
environment:
  - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
  - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
  - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
  - NEXTAUTH_URL=${NEXTAUTH_URL}
  # ... existing variables
```

- [ ] Updated docker-compose.yml
- [ ] Verified all variables are mapped correctly

## ✅ Deployment Checklist

### 6. Build the Application

#### Local Development:

```bash
npm run dev
# or
yarn dev
```

#### Production with Docker:

```bash
git pull
docker compose up -d --build
```

- [ ] Build completed without errors
- [ ] Application started successfully
- [ ] No missing module errors

### 7. Verify Deployment

#### Check if the server is running:

```bash
# Local
curl http://localhost:3000

# Production
curl https://chat.ericlauchiho.me
```

- [ ] Server responds successfully
- [ ] No 500 errors

#### Check Docker logs (if using Docker):

```bash
docker compose logs -f
```

- [ ] No authentication errors
- [ ] No missing environment variable warnings
- [ ] Server started successfully

### 8. Test Authentication Flow

#### Step 1: Access the application

- [ ] Open browser: `https://chat.ericlauchiho.me`
- [ ] Redirected to `/login` page
- [ ] Login page displays correctly

#### Step 2: Sign in with Google

- [ ] Click "Sign in with Google" button
- [ ] Redirected to Google OAuth consent screen
- [ ] Select a Google account
- [ ] Grant permissions
- [ ] Redirected back to application

#### Step 3: Verify successful login

- [ ] Redirected to `/chat` page
- [ ] User profile appears in sidebar
- [ ] User name displays correctly
- [ ] User email displays correctly
- [ ] User avatar displays correctly

#### Step 4: Test protected routes

Try accessing these URLs directly:

- [ ] `/chat` - Accessible (shows chat interface)
- [ ] `/settings` - Accessible (shows settings)
- [ ] `/new-chat` - Accessible (shows new chat)

#### Step 5: Test sign out

- [ ] Click "Sign Out" button in sidebar
- [ ] Redirected to `/login` page
- [ ] Cannot access protected routes without logging in again

### 9. Test User Information Access

#### Test API endpoint:

```bash
# While logged in, open browser console and run:
fetch('/api/user')
  .then(res => res.json())
  .then(data => console.log(data));
```

- [ ] Returns user object with `id`, `email`, `name`, `image`
- [ ] No errors in console

## ✅ Production Checklist

### 10. Security Verification

- [ ] `NEXTAUTH_SECRET` is a strong random value (not a simple password)
- [ ] Environment variables are not committed to git
- [ ] `.env` file permissions are restricted: `ls -la .env` shows `-rw-------`
- [ ] SSL certificate is valid: Check browser address bar shows 🔒
- [ ] Google OAuth redirect URI uses HTTPS (not HTTP)

### 11. Performance & Monitoring

- [ ] Application loads quickly (< 3 seconds)
- [ ] No console errors in browser
- [ ] Authentication flow is smooth (< 5 seconds)
- [ ] Session persists after browser refresh
- [ ] Session persists after closing and reopening browser

### 12. Documentation

- [ ] Read `GOOGLE_SSO_SETUP.md` for detailed usage
- [ ] Read `IMPLEMENTATION_SUMMARY.md` for overview
- [ ] Read `DOCKER_DEPLOYMENT.md` for Docker-specific instructions
- [ ] Understand how to access user information in code

## ✅ Troubleshooting Checklist

If something doesn't work, check:

### Authentication Issues

- [ ] All environment variables are set correctly
- [ ] `NEXTAUTH_URL` matches your domain exactly
- [ ] Google OAuth redirect URI matches: `https://[your-domain]/api/auth/callback/google`
- [ ] Google+ API is enabled in Google Cloud Console
- [ ] Client ID and Secret are correct (no extra spaces)

### Build/Runtime Issues

- [ ] Dependencies installed: `node_modules` directory exists
- [ ] Node.js version is compatible (v18+ recommended)
- [ ] No port conflicts (port 3000 is available)
- [ ] Docker is running (if using Docker)

### Browser Issues

- [ ] Cookies are enabled in browser
- [ ] No browser extensions blocking OAuth
- [ ] Try in incognito/private mode
- [ ] Clear browser cache and cookies

## 📝 Testing Scenarios

### Scenario 1: First-time user

1. Visit the site (never logged in before)
2. See login page
3. Sign in with Google
4. See chat interface
5. Profile appears in sidebar

**Expected**: ✅ Smooth login flow, no errors

### Scenario 2: Returning user

1. Visit the site (logged in before, session active)
2. Immediately see chat interface (no login required)
3. Profile appears in sidebar

**Expected**: ✅ Auto-authenticated, no login prompt

### Scenario 3: Expired session

1. Visit site with expired session (30+ days old)
2. See login page
3. Sign in again

**Expected**: ✅ Prompted to login again

### Scenario 4: Sign out

1. Click sign out in sidebar
2. Redirected to login page
3. Try to access `/chat` directly
4. Redirected back to login

**Expected**: ✅ Fully logged out, cannot access protected routes

### Scenario 5: Direct URL access (while logged out)

1. Sign out
2. Try to visit `https://chat.ericlauchiho.me/chat`
3. Redirected to login page

**Expected**: ✅ Protected route access denied

## 🎉 Success Criteria

Your implementation is successful when:

- ✅ Users can sign in with Google
- ✅ Users can sign out
- ✅ Protected routes require authentication
- ✅ User information displays in sidebar
- ✅ Sessions persist correctly
- ✅ No console errors
- ✅ No server errors in logs

## 📞 Next Steps

After successful implementation:

1. **Monitor Usage**: Check logs for any authentication issues
2. **User Feedback**: Ask users if the login flow is smooth
3. **Decide on Storage**: Determine if you need to store user data in a database
4. **Implement Features**: Add user-specific features if needed

## 🆘 Getting Help

If you encounter issues:

1. Check the logs: `docker compose logs -f`
2. Review error messages carefully
3. Verify all checklist items above
4. Consult the documentation files
5. Provide specific error messages when asking for help

## 📄 Documentation Files

- `GOOGLE_SSO_SETUP.md` - Detailed setup guide and usage examples
- `IMPLEMENTATION_SUMMARY.md` - Overview of what was implemented
- `DOCKER_DEPLOYMENT.md` - Docker-specific deployment guide
- `SETUP_CHECKLIST.md` - This file (step-by-step checklist)

---

**Remember**: Never commit `.env` files or secrets to version control!
