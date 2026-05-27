#!/bin/bash

# 1. Navigate to your project folder
# (REPLACE THIS PATH WITH YOUR ACTUAL PATH)
cd /Users/yourname/Projects/LifeDashboard

echo "=================================================="
echo "       🚀 STARTING LIFE DASHBOARD..."
echo "       (Don't close this window yet!)"
echo "=================================================="

# 2. Start the app in the background
# We silence the output slightly so it doesn't clutter the prompt
npm start > /dev/null 2>&1 &
SERVER_PID=$!

# 3. Open the browser after 3 seconds
(sleep 3 && open "http://localhost:5173") &

# 4. Show the "Kill Switch"
echo ""
echo "   🟢 APP IS RUNNING."
echo "   🛑 PRESS [ENTER] TO STOP SERVER AND EXIT."
echo ""

# 5. Wait for you to press Enter
read -p ""

# 6. NUCLEAR CLEANUP
# This kills the npm process AND forces any process using ports 3001 or 5173 to die.
echo "   💥 Shutting down..."
kill $SERVER_PID 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

echo "   ✅ Done. Bye!"
exit