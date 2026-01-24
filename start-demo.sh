#!/bin/bash

# V-CTRIP Demo Launcher (Unix version)
echo "========================================================"
echo "      🚀 Starting V-CTRIP Platform for Demo"
echo "========================================================"
echo

# 1. Start Backend
echo "[1/3] 🌱 Starting Backend Server..."
cd backend && npm run start:dev &
BACKEND_PID=$!

# Wait for backend to initialize
sleep 8

# 2. Start Frontend
echo "[2/3] 🎨 Starting Frontend Client..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

# Wait for frontend
sleep 5

# 3. Launch Browser (Cross-platform opener)
echo "[3/3] 🌐 Launching Browser..."
if command -v xdg-open > /dev/null; then
  xdg-open http://localhost:5173
elif command -v open > /dev/null; then
  open http://localhost:5173
else
  echo "Please open http://localhost:5173 in your browser"
fi

echo
echo "✅ Demo Environment Running!"
echo "   - Backend: http://localhost:3000"
echo "   - Frontend: http://localhost:5173"
echo
echo "Press Ctrl+C to stop both servers."

# Handle cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM EXIT
wait
