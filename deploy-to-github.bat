@echo off
echo Setting up Git repository...

REM Configure Git
git config user.name "Satyam Chandra"
git config user.email "chandrasatyam31@gmail.com"

REM Add remote (using quotes to handle special characters)
git remote add origin "https://github.com/C0DER-B0T/SatyamChandra.info.git"

REM Verify remote
git remote -v

REM Stage all files
git add .

REM Commit
git commit -m "feat: Complete portfolio with EXP bar, Contact section, typing animation, and SEO optimization"

REM Create main branch and push
git branch -M main
git push -u origin main

echo.
echo ========================================
echo Git push complete!
echo Repository: https://github.com/C0DER-B0T/SatyamChandra.info
echo ========================================
echo.
echo Next step: Deploy to Vercel
echo 1. Go to https://vercel.com/dashboard
echo 2. Click "Add New" - "Project"
echo 3. Import: C0DER-B0T/SatyamChandra.info
echo 4. Deploy!
echo.
pause
