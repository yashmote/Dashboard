// server/index.js
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const db = new Database('tracker.db'); // Opens your existing file

app.use(cors());
app.use(express.json());

const initDb = () => {
  // 1. Create Tables if they don't exist (Safe to run every time)
  db.exec(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#4CAF50',
      archived INTEGER DEFAULT 0,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS habit_logs (
      habit_id INTEGER,
      date TEXT,
      PRIMARY KEY (habit_id, date),
      FOREIGN KEY (habit_id) REFERENCES habits (id)
    );
    CREATE TABLE IF NOT EXISTS diary_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE,
      content TEXT,
      mood INTEGER,
      tags TEXT
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT
    );
    CREATE TABLE IF NOT EXISTS user_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // --- MIGRATION: SAFELY ADD 'TITLE' COLUMN ---
  // This try-catch block attempts to add the column. 
  // If it already exists, it catches the error and moves on.
  try {
    db.prepare("ALTER TABLE diary_entries ADD COLUMN title TEXT").run();
    console.log("Migration: Added 'title' column to diary_entries.");
  } catch (err) {
    // If error contains "duplicate column name", we are good.
    if (!err.message.includes("duplicate column name")) {
      console.log("Database schema is up to date.");
    }
  }

  // Initialize Balance if missing
  const balance = db.prepare("SELECT value FROM user_settings WHERE key = 'balance'").get();
  if (!balance) {
    db.prepare("INSERT INTO user_settings (key, value) VALUES ('balance', '0')").run();
  }
  
  console.log('Database initialized.');
};

initDb();

// --- ROUTES ---

// HABITS
app.get('/habits', (req, res) => {
  const habits = db.prepare('SELECT * FROM habits WHERE archived = 0').all();
  res.json(habits);
});
app.post('/habits', (req, res) => {
  const { name, color, created_at } = req.body;
  const dateToSave = created_at || new Date().toISOString().split('T')[0];
  const stmt = db.prepare('INSERT INTO habits (name, color, created_at) VALUES (?, ?, ?)');
  const info = stmt.run(name, color || '#4CAF50', dateToSave);
  res.json({ id: info.lastInsertRowid, name, color, created_at: dateToSave });
});
app.delete('/habits/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM habit_logs WHERE habit_id = ?').run(id);
  db.prepare('DELETE FROM habits WHERE id = ?').run(id);
  res.json({ message: 'Deleted' });
});
app.get('/logs', (req, res) => {
  const { start, end } = req.query;
  const logs = db.prepare('SELECT * FROM habit_logs WHERE date >= ? AND date <= ?').all(start, end);
  res.json(logs);
});
app.post('/logs/toggle', (req, res) => {
  const { habit_id, date } = req.body;
  const existing = db.prepare('SELECT * FROM habit_logs WHERE habit_id = ? AND date = ?').get(habit_id, date);
  if (existing) {
    db.prepare('DELETE FROM habit_logs WHERE habit_id = ? AND date = ?').run(habit_id, date);
    res.json({ status: 'removed' });
  } else {
    db.prepare('INSERT INTO habit_logs (habit_id, date) VALUES (?, ?)').run(habit_id, date);
    res.json({ status: 'added' });
  }
});

// DIARY (UPDATED WITH TITLE)
app.get('/diary/:date', (req, res) => {
  const entry = db.prepare('SELECT * FROM diary_entries WHERE date = ?').get(req.params.date);
  res.json(entry || {});
});
app.post('/diary', (req, res) => {
  const { date, title, content, mood } = req.body;
  
  // Update query to include Title
  db.prepare(`
    INSERT OR REPLACE INTO diary_entries (id, date, title, content, mood)
    VALUES ((SELECT id FROM diary_entries WHERE date = ?), ?, ?, ?, ?)
  `).run(date, date, title, content, mood);
  
  res.json({ message: 'Saved' });
});
app.get('/diary-history', (req, res) => {
  const entries = db.prepare('SELECT * FROM diary_entries ORDER BY date DESC').all();
  res.json(entries);
});

// FINANCE
app.get('/finance/balance', (req, res) => {
  const row = db.prepare("SELECT value FROM user_settings WHERE key = 'balance'").get();
  res.json({ balance: parseFloat(row.value) });
});
app.post('/finance/balance', (req, res) => {
  const { amount } = req.body;
  db.prepare("UPDATE user_settings SET value = ? WHERE key = 'balance'").run(amount.toString());
  res.json({ success: true, balance: amount });
});
app.get('/finance/transactions', (req, res) => {
  const transactions = db.prepare("SELECT * FROM transactions ORDER BY date DESC, id DESC").all();
  res.json(transactions);
});
app.post('/finance/transactions', (req, res) => {
  const { type, amount, category, date, description } = req.body;
  const stmt = db.prepare("INSERT INTO transactions (type, amount, category, date, description) VALUES (?, ?, ?, ?, ?)");
  const info = stmt.run(type, amount, category, date, description);
  
  const current = db.prepare("SELECT value FROM user_settings WHERE key = 'balance'").get();
  let newBalance = parseFloat(current.value);
  if (type === 'income') newBalance += parseFloat(amount);
  else newBalance -= parseFloat(amount);

  db.prepare("UPDATE user_settings SET value = ? WHERE key = 'balance'").run(newBalance.toString());
  res.json({ id: info.lastInsertRowid, newBalance });
});
app.delete('/finance/transactions/:id', (req, res) => {
  const { id } = req.params;
  const trans = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id);
  if (!trans) return res.status(404).json({ error: "Not found" });

  db.prepare("DELETE FROM transactions WHERE id = ?").run(id);

  const current = db.prepare("SELECT value FROM user_settings WHERE key = 'balance'").get();
  let newBalance = parseFloat(current.value);
  if (trans.type === 'income') newBalance -= parseFloat(trans.amount);
  else newBalance += parseFloat(trans.amount);

  db.prepare("UPDATE user_settings SET value = ? WHERE key = 'balance'").run(newBalance.toString());
  res.json({ success: true, newBalance });
});

app.listen(3001, () => console.log('Server running on port 3001'));