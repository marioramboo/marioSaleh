@echo off
echo 🚀 Starting Super Mario ML Portfolio Server...
echo.
echo This will start a local web server so the images load properly.
echo The website will open automatically in your browser.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

python run_server.py

echo.
echo Server stopped. Press any key to exit...
pause >nul
