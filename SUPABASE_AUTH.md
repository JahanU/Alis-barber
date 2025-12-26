# Supabase Authentication Setup Guide

This guide explains how to configure and use the staff-only authentication system implemented with Supabase.

## 🚀 Overview

The application uses Supabase Authentication for staff-only access. There is no public sign-up flow; staff members must be manually added to the Supabase project by an administrator.

## 🛠️ Implementation Details

### 1. Supabase Client Setup
- **Package**: `@supabase/supabase-js`
- **Config**: `src/config/supabaseClient.ts`
- **Template**: `.env.example`

### 2. Authentication Context
- **Location**: `src/contexts/AuthContext.tsx`
- Provides real-time session management, `signIn()`, and `signOut()` methods.

### 3. Protected Routes
- **Component**: `src/components/ProtectedRoute/ProtectedRoute.tsx`
- Use this wrapper to protect any staff-only pages. Unauthenticated users are redirected to `/login`.

## ⚙️ Configuration Required

> [!IMPORTANT]
> **Authentication will NOT work until you complete these steps.**

### Step 1: Create `.env.local`
Copy the template to your local environment file:
```bash
cp .env.example .env.local
```

### Step 2: Add Credentials
Get your Project URL and Anon Key from [Supabase Dashboard](https://app.supabase.com) → Project Settings → API.

Update `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Add Staff Users
1. Go to **Supabase Dashboard** → **Authentication** → **Users**.
2. Click **Add User** → **Create new user**.
3. Enter the staff member's email and password.

### Step 4: Restart Dev Server
```bash
npx netlify dev
```

## 💻 How to Protect Routes

Wrap your staff-only components with `ProtectedRoute` in `App.tsx`:

```tsx
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

<Route 
  path="/staff-dashboard" 
  element={
    <ProtectedRoute>
      <StaffDashboard />
    </ProtectedRoute>
  } 
/>
```

## 🧪 Testing the Flow

1. Navigate to `/login`.
2. Enter valid staff credentials.
3. Verify redirection to your target page.
4. Try accessing a protected route without logging in to verify the redirect.
