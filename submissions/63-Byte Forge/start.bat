@echo off
echo Starting Complaint Chatbot System...

echo Starting Backend Server...
start cmd /k "cd backend && npm start"

echo Starting Frontend Server...
start cmd /k "cd frontend && npm run dev"

echo.
echo =========================================================
echo Setup Complete!
echo 1. Ensure you have added your GEMINI_API_KEY in backend/.env
echo 2. Access the Chat App: http://localhost:5173
echo 3. Access Agent Dashboard: http://localhost:5173/agent
echo =========================================================
pause
