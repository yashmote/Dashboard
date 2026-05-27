// client/src/HabitChecklist.jsx
import { useState, useEffect } from 'react';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { getHabits, getLogs, toggleLog, createHabit, deleteHabit } from './api';
import './HabitChecklist.css'; // Ensure this exists (or create if missing)

export default function HabitChecklist() {
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  
  // Carousel State: Center date is "Today" initially
  const [centerDate, setCenterDate] = useState(new Date());

  useEffect(() => {
    loadData();
  }, [centerDate]);

  const loadData = async () => {
    // 1. Fetch Habits
    const hRes = await getHabits();
    setHabits(hRes.data);

    // 2. Fetch Logs for the 3 visible days
    // Calculate range: Center - 1 day to Center + 1 day
    const startStr = format(subDays(centerDate, 1), 'yyyy-MM-dd');
    const endStr = format(addDays(centerDate, 1), 'yyyy-MM-dd');
    
    const lRes = await getLogs(startStr, endStr);
    setLogs(lRes.data);
  };

  const handleToggle = async (habitId, dateStr) => {
    // Optimistic UI Update (Instant Toggle)
    const isLogged = logs.some(l => l.habit_id === habitId && l.date === dateStr);
    
    if (isLogged) {
      setLogs(logs.filter(l => !(l.habit_id === habitId && l.date === dateStr)));
    } else {
      setLogs([...logs, { habit_id: habitId, date: dateStr }]);
    }

    // Send to backend
    await toggleLog(habitId, dateStr);
    // Reload to be safe (optional)
    // loadData(); 
  };

  const handleCreate = async () => {
    if (!newHabitName) return;
    await createHabit(newHabitName);
    setNewHabitName('');
    loadData();
  };

  const handleDelete = async (id) => {
    if (confirm('Archive this habit?')) {
      await deleteHabit(id);
      loadData();
    }
  };

  // --- NAVIGATION ---
  const goNext = () => setCenterDate(addDays(centerDate, 1));
  const goPrev = () => setCenterDate(subDays(centerDate, 1));

  // --- RENDER HELPERS ---
  const daysToShow = [
    subDays(centerDate, 1), // Previous Day
    centerDate,             // Current Focus
    addDays(centerDate, 1)  // Next Day
  ];

  return (
    <div className="habit-container">
      <div className="habit-header">
        <button className="nav-btn" onClick={() => window.location.href='/'}>← Dashboard</button>
        <h1>Daily Tracker</h1>
      </div>

      <div className="carousel-wrapper">
        <button className="arrow-btn" onClick={goPrev}>‹</button>

        <div className="cards-row">
          {daysToShow.map((dateObj, index) => {
            const dateStr = format(dateObj, 'yyyy-MM-dd');
            const isToday = format(dateObj, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            const isCenter = index === 1; // The middle card

            return (
              <div key={dateStr} className={`day-card ${isCenter ? 'center-card' : 'side-card'}`}>
                <div className="card-date-header">
                  <span className="day-name">{isToday ? 'Today' : format(dateObj, 'EEEE')}</span>
                  <span className="day-date">{format(dateObj, 'MMM d')}</span>
                </div>

                <div className="habit-list">
                  {habits
                    .filter(habit => {
                      // --- THE FIX IS HERE ---
                      // Only show if the card date is >= habit creation date
                      // If created_at is missing (old habits), we assume show it (true)
                      if (!habit.created_at) return true;
                      return dateStr >= habit.created_at;
                    })
                    .map(habit => {
                    const isDone = logs.some(l => l.habit_id === habit.id && l.date === dateStr);
                    
                    return (
                        <div 
                          key={habit.id} 
                          className={`habit-item ${isDone ? 'done' : ''}`} 
                          onClick={() => handleToggle(habit.id, dateStr)}
                        >
                          <div className="habit-left">
                            <div className="checkbox-circle"></div>
                            <span className="habit-name">{habit.name}</span>
                          </div>
                          
                          {/* Only show delete on the Center Card (Today/Focus) */}
                          {isCenter && (
                            <button 
                              className="mini-del-btn" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(habit.id);
                              }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      );
                  })}
                  
                  {habits.length === 0 && <p className="empty-msg">No habits yet.</p>}
                </div>
              </div>
            );
          })}
        </div>

        <button className="arrow-btn" onClick={goNext}>›</button>
      </div>

      {/* ADD NEW INPUT */}
      <div className="add-habit-bar">
        <input 
          type="text" 
          placeholder="+ Add new habit..." 
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <button onClick={handleCreate}>Add</button>
      </div>
    </div>
  );
}