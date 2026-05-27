// client/src/HabitTracker.jsx
import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { getHabits, createHabit, getLogs, toggleLog } from './api';
import './HabitTracker.css'; // We will create this next

export default function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]); // Array of log objects
  const [newHabit, setNewHabit] = useState('');

  // Generate last 7 days (including today)
  const dates = Array.from({ length: 7 }, (_, i) => 
    format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const habitsRes = await getHabits();
    const logsRes = await getLogs(dates[0], dates[6]); // Fetch logs for this date range
    setHabits(habitsRes.data);
    setLogs(logsRes.data);
  };

  const handleToggle = async (habitId, date) => {
    // Optimistic UI update (update screen immediately before server responds)
    const isLogged = logs.find(l => l.habit_id === habitId && l.date === date);
    
    if (isLogged) {
      setLogs(logs.filter(l => !(l.habit_id === habitId && l.date === date)));
    } else {
      setLogs([...logs, { habit_id: habitId, date }]);
    }

    // Send to backend
    await toggleLog(habitId, date);
    // Optional: reload data to ensure sync
    // loadData(); 
  };

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabit) return;
    await createHabit(newHabit);
    setNewHabit('');
    loadData();
  };

  return (
    <div className="tracker-container">
      <h2>Weekly Tracker</h2>
      
      {/* The Grid */}
      <div className="grid-container">
        {/* Header Row: Empty top-left corner + Dates */}
        <div className="header-cell">Habit</div>
        {dates.map(date => (
          <div key={date} className="header-cell date-header">
            {format(new Date(date), 'EEE')} <br/>
            <span className="date-num">{format(new Date(date), 'd')}</span>
          </div>
        ))}

        {/* Habit Rows */}
        {habits.map(habit => (
          <>
            <div className="habit-name">{habit.name}</div>
            {dates.map(date => {
              const done = logs.find(l => l.habit_id === habit.id && l.date === date);
              return (
                <div 
                  key={`${habit.id}-${date}`} 
                  className={`check-cell ${done ? 'done' : ''}`}
                  onClick={() => handleToggle(habit.id, date)}
                >
                  {done ? '✓' : ''}
                </div>
              );
            })}
          </>
        ))}
      </div>

      {/* Add New Habit Form */}
      <form onSubmit={handleAddHabit} className="add-form">
        <input 
          type="text" 
          value={newHabit} 
          onChange={(e) => setNewHabit(e.target.value)} 
          placeholder="New Habit..." 
        />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}