# Dynamic Portfolio - Quick Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```



If you encounter peer dependency issues:
```bash
npm install --legacy-peer-deps
```

### 2. Environment Setup
The `.env` file is already configured with your Firebase and Cloudinary credentials.

### 3. Create Admin Account
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `portfolio-3a687`
3. Navigate to **Authentication** → **Users** → **Add User**
4. Create your admin credentials

### 4. Start Development Server
```bash
npm run dev
```

### 5. Access Admin Panel
- Public Portfolio: `http://localhost:5173`
- Admin Login: `http://localhost:5173/admin/login`
- Admin Dashboard: `http://localhost:5173/admin/dashboard`

## 📋 Features

### Admin Panel (`/admin/dashboard`)
- **Profile Management**: Update name, title, bio, profile photo, social links
- **Projects**: Add/Edit/Delete projects with image uploads
- **Certifications**: Manage certifications and skills
- **Work Experience**: Add work history with responsibilities

### Public Portfolio (`/`)
- All sections dynamically fetch from Firebase
- Optimized images from Cloudinary
- Responsive design with smooth animations

## 🔐 Security

- `.env` file contains sensitive credentials (already in `.gitignore`)
- Admin routes protected with Firebase Authentication
- Firestore rules allow public read, authenticated write

## 📦 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Images**: Cloudinary
- **Routing**: React Router

## 🛠️ Build for Production

```bash
npm run build
```

## 📚 Full Documentation

See [walkthrough.md](file:///C:/Users/intel/.gemini/antigravity/brain/03f33f50-bd62-4170-8820-969cbc1d14ce/walkthrough.md) for detailed documentation.

## ⚠️ Important Notes

1. **First Time Setup**: Database is empty - add content through admin panel
2. **Firebase Rules**: Update Firestore security rules (see walkthrough)
3. **Cloudinary**: Verify upload preset is set to "Unsigned"
4. **Environment Variables**: Never commit `.env` to Git

## 🐛 Troubleshooting

- **Images not uploading**: Check Cloudinary settings
- **Auth not working**: Verify Firebase credentials
- **Data not showing**: Check Firestore rules and console

For detailed troubleshooting, see the walkthrough document.
