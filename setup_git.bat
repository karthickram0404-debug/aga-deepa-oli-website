@echo off
set PATH=%PATH%;C:\Program Files\Git\cmd
git add -A
git commit -m "Add render.yaml for one-click deployment"
git push origin main
echo.
echo === PUSHED TO GITHUB ===
