# Quick Admin Setup Guide

## 🔐 Step 1: Create Firebase Admin Account

Before you can use the admin panel, you need to create an admin user account in Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **portfolio-3a687**
3. Click **Authentication** in the left sidebar
4. Click the **Users** tab
5. Click **Add User** button
6. Enter your email and password (remember these!)
7. Click **Add User**

## 🚀 Step 2: Access the Admin Panel

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Open your browser and go to:
   ```
   http://localhost:5173/admin/login
   ```

3. Enter the email and password you created in Step 1

4. You'll be redirected to the dashboard!

## 📋 Step 3: Using the Dashboard

### Navigation
- **Top Navigation Bar** - Click on any tab to switch between sections:
  - **Home** - Display name, roles, resume link, social links
  - **About** - Profile picture, bios, current focus
  - **Education** - Schools, degrees, achievements
  - **Experience** - Jobs, contributions, skills
  - **Projects** - Project details, cover photos, tech stack
  - **Certificates** - Certifications, skills learned, images

### Adding Data
1. Click on a section tab
2. Click the **"Add [Item]"** button (e.g., "Add Project")
3. Fill in the form
4. For arrays (like tech stack, skills), use the **"Add Item"** button
5. Upload images where needed
6. Click **Save**

### Editing Data
1. Find the item you want to edit
2. Click the **Edit** button
3. Make your changes
4. Click **Save**

### Deleting Data
1. Find the item you want to delete
2. Click the **Delete** button
3. Confirm the deletion

## 🎨 Navigation Style

The admin panel now uses a **top navigation bar** just like your live portfolio:
- Desktop: Full tabs with icons and text
- Mobile: Scrollable tabs (swipe left/right to see all)
- Active tab is highlighted in blue
- Logout button on the right

## ⚠️ Troubleshooting

### "Only Home section visible"
- **Solution**: The navigation is now at the TOP of the page, not on the side. Look for the tabs: Home | About | Education | etc.

### "Not working properly"
- **Check**: Make sure you're logged in (created Firebase admin account)
- **Check**: Browser console for errors (F12)
- **Check**: Firestore security rules allow authenticated writes

### Login Issues
- Make sure you created the admin user in Firebase Console
- Use the exact email/password you set up
- Check that your `.env` file has the correct Firebase credentials

## 📝 Firestore Collections

Your data is stored in these Firestore collections:
- `home` - Home section data
- `about` - About section data
- `education` - Education entries
- `experience` - Experience entries
- `projects` - Project entries
- `certificates` - Certificate entries

## 🔒 Security Rules

Make sure your Firestore security rules allow authenticated writes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read
    match /{document=**} {
      allow read: if true;
    }
    
    // Allow authenticated writes
    match /{document=**} {
      allow write: if request.auth != null;
    }
  }
}
```

---

**Need Help?** Check the browser console (F12) for error messages and share them for troubleshooting.
