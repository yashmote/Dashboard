import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { jsPDF } from 'jspdf';
import DiaryHeatmap from './DiaryHeatmap'; 
import './Diary.css';

export default function DiaryHistory() {
  const [entries, setEntries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3001/diary-history')
      .then(res => setEntries(res.data))
      .catch(err => console.error(err));
  }, []);

  const getMoodEmoji = (mood) => {
    const moods = ['😭', '😢', '😐', '🙂', '🤩'];
    return moods[mood - 1] || '😐';
  };

  const getMoodLabel = (mood) => {
    const labels = ['Awful', 'Bad', 'Okay', 'Good', 'Great'];
    return labels[mood - 1] || 'Unknown';
  };

  // --- FIXED PDF EXPORT FUNCTION ---
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height; // Usually 297mm (A4)
    const margin = 20;
    const maxLineWidth = 170; // Width of text area
    const lineHeight = 7; 
    let yPos = margin;

    // Helper to check for page break
    const checkPageBreak = (spaceNeeded) => {
      if (yPos + spaceNeeded > pageHeight - margin) {
        doc.addPage();
        yPos = margin; // Reset to top of new page
      }
    };

    // Title Page
    doc.setFontSize(22);
    doc.text("My Journal", margin, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPos);
    yPos += 20;

    // Sort Oldest -> Newest
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedEntries.forEach((entry) => {
      const dateStr = format(parseISO(entry.date), 'EEEE, MMMM do, yyyy');
      const moodStr = getMoodLabel(entry.mood);
      
      // 1. DATE HEADER
      checkPageBreak(20); // Ensure header fits
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`${dateStr} | Mood: ${moodStr}`, margin, yPos);
      yPos += 8;

      // 2. ENTRY TITLE (If exists)
      if (entry.title) {
        doc.setFontSize(16);
        doc.setTextColor(0, 200, 83); // Green
        doc.setFont(undefined, 'bold');
        
        const splitTitle = doc.splitTextToSize(entry.title, maxLineWidth);
        checkPageBreak(splitTitle.length * 8); // Check if title fits
        
        doc.text(splitTitle, margin, yPos);
        yPos += (splitTitle.length * 8) + 4;
        doc.setFont(undefined, 'normal'); 
      }

      // 3. MAIN CONTENT (The Fix)
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      const content = entry.content || "(No content)";
      const splitText = doc.splitTextToSize(content, maxLineWidth);

      // Loop through EVERY line of text
      splitText.forEach(line => {
        // If this specific line hits the bottom, add a new page
        if (yPos > pageHeight - margin) {
          doc.addPage();
          yPos = margin; 
        }
        doc.text(line, margin, yPos);
        yPos += lineHeight;
      });

      // Add space after entry
      yPos += 15;
    });

    doc.save("My_Journal.pdf");
  };

  return (
    <div className="history-container">
       <div className="history-header">
        <Link to="/" className="back-link">← Back to Home</Link>
        <h1>Journal History</h1>
        
        <button className="export-btn" onClick={handleExportPDF}>
          📥 Export PDF
        </button>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <DiaryHeatmap />
      </div>
      
      <div className="history-grid">
        {entries.map(entry => (
          <div 
            key={entry.id} 
            className="history-card"
            onClick={() => navigate(`/diary?date=${entry.date}`)}
          >
            <div className="card-top-row">
              <span className="card-date">{format(parseISO(entry.date), 'MMM do, yyyy')}</span>
              <span className="card-mood">{getMoodEmoji(entry.mood)}</span>
            </div>
            
            {entry.title && <h3 className="card-title">{entry.title}</h3>}
            
            <p className="card-preview">
              {entry.content.length > 100 
                ? entry.content.substring(0, 100) + '...' 
                : entry.content || '(No text)'}
            </p>
            
            <div className="card-footer">
               <span className="read-more">Read Entry →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}