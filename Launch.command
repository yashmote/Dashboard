#!/bin/bash

# --- CONFIGURATION ---
PROJECT_PATH="/Users/yashvardhanmote/Desktop/P2/life-dashboard"

echo "=================================================="
echo "       🚀 STARTING LIFE DASHBOARD..."
echo "       (Don't close this window yet!)"
echo "=================================================="

# 1. Start SERVER (The manual way)
# We go into /server and run node index.js in the background (&)
cd "$PROJECT_PATH/server"
echo "   ...Starting Backend (Port 3001)"
node index.js > /dev/null 2>&1 &

# 2. Start CLIENT (The manual way)
# We go into /client and run npm run dev in the background (&)
cd "$PROJECT_PATH/client"
echo "   ...Starting Frontend (Port 5173)"
npm run dev > /dev/null 2>&1 &

# 3. Open Browser
(sleep 4 && open "http://localhost:5173") &

# 4. The Kill Switch
echo ""
echo "   🟢 EVERYTHING IS RUNNING."
echo "   🛑 PRESS [ENTER] TO KILL BOTH AND EXIT."
echo ""

read -p ""

# 5. Nuclear Cleanup
# This finds whatever is running on ports 3001 and 5173 and kills them.
echo "   💥 Shutting down..."
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

echo "   ✅ Bye!"
exit