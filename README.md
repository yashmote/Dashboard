# 🧭 Life Dashboard

A personal all-in-one tool — tracks habits, logs expenses, and doubles as a diary, all in one place. Built with a React/Vite frontend, Node.js backend, and AI integration, designed to run locally on macOS with a one-click launcher.

---

## Features

**Habit Tracker**
Logs daily habits and visualises them on a GitHub-style contribution heatmap, so you can see streaks and improvement over time at a glance.

**Expense Tracker**
Tracks spending by category, giving a clear picture of exactly where money is going.

**Diary**
A private journal built into the dashboard, keeping notes and reflections alongside your other data.

**AI Integration**
Surfaces insights and assistance across the dashboard using AI.

---

## Project Structure

```
Dashboard/
├── client/          # React + Vite frontend (runs on port 5173)
├── server/          # Node.js backend (runs on port 3001)
├── Launch.command   # One-click launcher (starts both servers)
├── app.command      # Alternate launcher (generic path version)
└── README.md
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- npm

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yashmote/Dashboard.git
cd Dashboard
```

### 2. Install dependencies

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Run the app

**Option A — One-click launcher (macOS)**

Double-click `Launch.command` in Finder.

> If macOS blocks it, go to System Settings → Privacy & Security and allow it, or run:
> ```bash
> chmod +x Launch.command && ./Launch.command
> ```

This starts the backend on `http://localhost:3001` and the frontend on `http://localhost:5173`, then opens the browser automatically after a few seconds. Press **Enter** in the terminal to shut everything down cleanly.

**Option B — Manual**

In two separate terminals:

```bash
# Terminal 1 — backend
cd server && node index.js

# Terminal 2 — frontend
cd client && npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## Ports

| Service  | Port |
|----------|------|
| Frontend | 5173 |
| Backend  | 3001 |

---

## Tech Stack

| Layer    | Tech               |
|----------|--------------------|
| Frontend | React, Vite, CSS   |
| Backend  | Node.js            |
| Launcher | Bash (`.command`)  |

---

## Notes

- The `Launch.command` file has a hardcoded project path. If you clone this to a different location, update the `PROJECT_PATH` variable at the top of the file.
- The `app.command` file is a template version with a placeholder path — edit the `cd` line before using it.

---

## Author

[Yash Mote](https://github.com/yashmote)
