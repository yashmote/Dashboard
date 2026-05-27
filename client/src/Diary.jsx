import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getDiary, saveDiary } from './api';
import './Diary.css';

export default function Diary() {
  const [searchParams] = useSearchParams();
  const queryDate = searchParams.get('date'); // This is null if coming from Dashboard
  const navigate = useNavigate();

  // State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(3);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load entry for specific date OR today
    loadEntry(queryDate || new Date().toLocaleDateString('en-CA'));
  }, [queryDate]);

  const loadEntry = async (dateStr) => {
    const res = await getDiary(dateStr);
    
    // --- NEW LOGIC START ---
    // If data exists AND we didn't ask for a specific date (meaning we came from Dashboard)
    // Then assume the user wants to see history instead of editing again.
    if (res.data && res.data.id && !queryDate) {
       navigate('/diary/history');
       return; // Stop loading the form
    }
    // --- NEW LOGIC END ---

    if (res.data) {
      setTitle(res.data.title || '');
      setContent(res.data.content || '');
      setMood(res.data.mood || 3);
    } else {
      // Reset form for new entry
      setTitle('');
      setContent('');
      setMood(3);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const dateToSave = queryDate || new Date().toLocaleDateString('en-CA');
    
    // 1. Save to backend
    await saveDiary({ date: dateToSave, title, content, mood });
    
    // 2. INSTANT REDIRECT (No delay)
    navigate('/diary/history');
  };

  const getMoodEmoji = (m) => {
    const moods = ['😭', '😢', '😐', '🙂', '🤩'];
    return moods[m - 1];
  };

  const getDisplayDate = () => {
    const dateObj = queryDate ? new Date(queryDate) : new Date();
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="diary-container">
      <div className="journal-header">
        <Link to="/" className="back-link">← Dashboard</Link>
        
        <div className="date-display">
          <span className="sub-label">{queryDate ? 'Viewing Entry For' : 'Today'}</span>
          <h2>{getDisplayDate()}</h2>
        </div>

        <Link to="/diary/history" className="history-link">
          View History 📜
        </Link>
      </div>

      {queryDate && (
        <button className="back-today-btn" onClick={() => navigate('/diary')}>
          <span>←</span> Write for Today
        </button>
      )}

      <div className="paper-sheet">
        <input 
          type="text" 
          className="diary-title-input" 
          placeholder="Title or Quote of the Day..." 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="mood-row">
          {[1, 2, 3, 4, 5].map(m => (
            <button 
              key={m} 
              className={`mood-btn ${mood === m ? 'selected' : ''}`} 
              onClick={() => setMood(m)}
            >
              {getMoodEmoji(m)}
            </button>
          ))}
        </div>

        <textarea 
          className="diary-textarea" 
          placeholder="Dear Diary..." 
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="save-row">
           <button className="save-btn" onClick={handleSave}>
             {isSaving ? 'Saving...' : 'Update Entry'}
           </button>
        </div>
      </div>
    </div>
  );
}