# Deployment Guide - GitHub & Vercel

## 🚀 Quick Deployment Steps

Follow these exact commands in order:

### Step 1: Configure Git (if not already done)
```bash
cd c:\Users\intel\Desktop\Port\SatyamChandraPortfolio
git config user.name "Satyam Chandra"
git config user.email "chandrasatyam31@gmail.com"
```

### Step 2: Check Git Status
```bash
git status
```

### Step 3: Add Remote Repository
```bash
# Remove existing remote if any
git remote remove origin

# Add new remote (use quotes for special characters)
git remote add origin https://github.com/C0DER-B0T/SatyamChandra.info.git

# Verify remote
git remote -v
```

### Step 4: Stage All Files
```bash
git add .
```

### Step 5: Commit Changes
```bash
git commit -m "feat: Complete portfolio with EXP bar, Contact section, typing animation, and SEO optimization"
```

### Step 6: Push to GitHub
```bash
# Try main branch first
git push -u origin main

# If main doesn't exist, try master
git push -u origin master

# If branch doesn't exist, create it
git branch -M main
git push -u origin main
```

---

## 🌐 Vercel Deployment

### Option 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set custom domain (if needed)
vercel domains add satyamchandra.info.vercel.app
```

### Option 2: Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Click "Import Git Repository"
4. Select: `C0DER-B0T/SatyamChandra.info`
5. Configure Build Settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`
6. Add Environment Variables:
   ```
   VITE_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN
   VITE_FIREBASE_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID
   VITE_FIREBASE_APP_ID
   VITE_CLOUDINARY_CLOUD_NAME
   VITE_CLOUDINARY_UPLOAD_PRESET
   ```
7. Click "Deploy"

### Option 3: If Domain Already Exists
If `satyamchandra.info.vercel.app` is already taken:

1. Go to Vercel Dashboard
2. Find the old project using that domain
3. Go to Settings → Domains
4. Remove `satyamchandra.info.vercel.app`
5. Delete the old project (if not needed)
6. Deploy new project
7. Add domain `satyamchandra.info.vercel.app`

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Portfolio loads at https://satyamchandra.info.vercel.app/
- [ ] All sections visible (Home, About, Skills, Education, Work, Projects, Certificates, Contact)
- [ ] Typing animation works on Home section
- [ ] EXP bar animates in About section
- [ ] Projects sorted by level (Advanced first)
- [ ] Contact form shows WhatsApp/Email modal
- [ ] Admin panel accessible at /admin/login
- [ ] Dark mode toggle works
- [ ] Mobile responsive
- [ ] Images load from Cloudinary

---

## 🐛 Troubleshooting

### Issue: Git push rejected
**Solution:**
```bash
git pull origin main --rebase
git push -u origin main
```

### Issue: Vercel build fails
**Check:**
- Environment variables are set
- Build command is correct: `npm run build`
- Output directory is: `build`
- Node version: 18.x or higher

### Issue: Domain not available
**Solution:**
1. Contact Vercel support
2. Or use alternative: `satyam-chandra-portfolio.vercel.app`
3. Update index.html meta tags with new URL

### Issue: Firebase not working
**Solution:**
- Verify all VITE_ environment variables in Vercel
- Check Firebase rules allow read/write
- Verify API keys are correct

---

## 📝 Important Notes

- **Repository:** https://github.com/C0DER-B0T/SatyamChandra.info
- **Live URL:** https://satyamchandra.info.vercel.app/
- **Admin:** https://satyamchandra.info.vercel.app/admin/login
- **Credentials:** chandrasatyam31@gmail.com / 2206713322067133

---

## 🎯 Next Steps After Deployment

1. Test all features on live site
2. Update Firebase security rules if needed
3. Add custom domain (if you have one)
4. Set up analytics (Google Analytics, Vercel Analytics)
5. Monitor performance with Lighthouse
6. Share portfolio link on social media!

---

**Need Help?** Check Vercel docs: https://vercel.com/docs
