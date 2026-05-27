// client/src/Home.jsx
import { Link } from 'react-router-dom';
import Heatmap from './Heatmap';
import './Home.css';

export default function Home() {
  return (
    <div className="dashboard-container">
      
      <header className="dashboard-header">
        <h1>Dashboard</h1>
      </header>

      {/* Analytics Section */}
      <section className="dashboard-card heatmap-section">
        <div className="card-top">
          <h3>📊 Year at a Glance</h3>
        </div>
        <div className="heatmap-wrapper">
          <Heatmap />
        </div>
      </section>

      {/* Action Grid */}
      <section className="action-grid">
        
        {/* Habits */}
        <Link to="/habits" className="action-card habit-card">
          <div className="icon-box">✅</div>
          <div className="card-info">
            <h2>Habit Checklist</h2>
            <p>Track your daily goals.</p>
          </div>
          <div className="arrow-icon">→</div>
        </Link>

        {/* Diary */}
        <Link to="/diary" className="action-card diary-card">
          <div className="icon-box">📖</div>
          <div className="card-info">
            <h2>Daily Journal</h2>
            <p>Reflect on your progress.</p>
          </div>
          <div className="arrow-icon">→</div>
        </Link>

        {/* --- NEW: Finance Card --- */}
        <Link to="/finance" className="action-card finance-card">
          <div className="icon-box">💰</div>
          <div className="card-info">
            <h2>My Wallet</h2>
            <p>Track balance & expenses.</p>
          </div>
          <div className="arrow-icon">→</div>
        </Link>

      </section>
    </div>
  );
}