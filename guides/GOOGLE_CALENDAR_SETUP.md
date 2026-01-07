# Google Calendar Setup Guide

## Quick Start: Get Your Client ID

Follow these steps to enable Google Calendar integration for the barbers booking app:

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `Ali-Barbers-Booking` (or your preferred name)
4. Click **"Create"**

### 2. Enable Google Calendar API

1. In the Cloud Console, navigate to **"APIs & Services"** → **"Library"**
2. Search for **"Google Calendar API"**
3. Click on it, then click **"Enable"**

### 3. Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** user type, click **"Create"**
3. Fill in required information:
   - **App name**: `Ali's Barbers Booking`
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **"Save and Continue"**
5. On the **Scopes** page:
   - Click **"Add or Remove Scopes"**
   - Search for `calendar` and select:
     - `https://www.googleapis.com/auth/calendar.events` (Create, read, update, and delete events)
   - Click **"Update"** → **"Save and Continue"**
6. On **Test users** page:
   - Click **"Add Users"**
   - Add your email address (and any testers)
   - Click **"Save and Continue"**
7. Review and click **"Back to Dashboard"**

### 4. Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Choose **"Web application"**
4. Fill in:
   - **Name**: `Barbers Booking Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (for local development)
     - Add your production URL when deploying (e.g., `https://yourdomain.com`)
   - **Authorized redirect URIs**:
     - `http://localhost:5173` (for local development)
     - Add your production URL when deploying
5. Click **"Create"**
6. **✅ COPY YOUR CLIENT ID** - it will look like:
   ```
   123456789-abcdefghijklmnop.apps.googleusercontent.com
   ```

### 5. Update Your App

1. Open the file: [src/config/calendar.js](file:///Users/jahan/code/ali-barbers/src/config/calendar.js)

2. Replace this line:
   ```javascript
   clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
   ```
   
   With your actual Client ID:
   ```javascript
   clientId: '123456789-abcdefghijklmnop.apps.googleusercontent.com',
   ```

3. (Optional) Update the timezone if you're not in Eastern Time:
   ```javascript
   timeZone: 'America/New_York', // Change to your timezone
   ```
   
   Common timezones:
   - `America/Los_Angeles` (Pacific)
   - `America/Chicago` (Central)
   - `America/Denver` (Mountain)
   - `America/New_York` (Eastern)
   - `Europe/London` (UK)

4. Save the file

### 6. Test the Integration

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Open http://localhost:5173

3. Complete a booking:
   - Fill in your details
   - Select a service, date, and time
   - Click "Confirm Booking"

4. In the confirmation modal, click **"Add to Google Calendar"**

5. You'll see a Google OAuth popup:
   - Sign in with your Google account
   - Grant calendar permissions
   - The event will be created automatically

6. Check your [Google Calendar](https://calendar.google.com) to see the appointment!

---

## Troubleshooting

### "Access blocked: Authorization Error"
**Solution**: Make sure you added yourself as a test user in the OAuth consent screen settings.

### "Redirect URI mismatch"
**Solution**: Verify that `http://localhost:5173` is added to "Authorized redirect URIs" in your OAuth client settings.

### "API key not valid"
**Solution**: Ensure you've enabled the Google Calendar API in your project.

### Calendar event not creating
**Solution**: Check the browser console for errors. Make sure you've granted calendar permissions when signing in.

---

## Production Deployment

When deploying to production:

1. Add your production URL to OAuth settings:
   - Go to **Google Cloud Console** → **Credentials**
   - Edit your OAuth client
   - Add production URLs to:
     - Authorized JavaScript origins: `https://yourdomain.com`
     - Authorized redirect URIs: `https://yourdomain.com`

2. Update the OAuth consent screen to "Production" status (optional, requires verification)

3. Update your app's `clientId` if creating a separate production OAuth client

---

## Security Notes

> [!WARNING]
> - Never commit your Client ID to public repositories if it's associated with sensitive data
> - The Client ID used here is for frontend OAuth and is safe to expose in your app
> - For production apps handling business calendar, consider implementing a backend service

---

## Need Help?

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [OAuth 2.0 Setup Guide](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com)
