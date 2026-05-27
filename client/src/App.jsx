// client/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import HabitChecklist from './HabitChecklist';
import Diary from './Diary';
import DiaryHistory from './DiaryHistory';
import Finance from './Finance'; // <--- Import the new page

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/habits" element={<HabitChecklist />} />
      <Route path="/diary" element={<Diary />} />
      <Route path="/diary/history" element={<DiaryHistory />} />
      <Route path="/finance" element={<Finance />} /> {/* <--- New Route */}
    </Routes>
  );
}

export default App;