// client/src/DiaryHeatmap.jsx
import { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { subYears, format } from 'date-fns';
import { getDiaryHistory } from './api';
import './DiaryHeatmap.css'; // We'll make this BLUE

export default function DiaryHeatmap() {
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getDiaryHistory();
      const entries = res.data; // Array of { date, content, mood }

      // Map entries to the format heatmap needs
      // If there is an entry, count = 1 (completed), else 0
      const formattedData = entries.map(entry => ({
        date: entry.date,
        count: 1 // Simple boolean: Wrote or didn't write
      }));

      setHeatmapData(formattedData);
    } catch (err) {
      console.error("Failed to load diary history:", err);
    }
  };

  return (
    <div className="heatmap-container diary-theme">
      <h3>📖 Journaling Consistency</h3>
      <CalendarHeatmap
        startDate={subYears(new Date(), 1)}
        endDate={new Date()}
        values={heatmapData}
        classForValue={(value) => {
          if (!value || value.count === 0) {
            return 'color-empty';
          }
          return `color-filled`; // Just one color for "Done"
        }}
        showWeekdayLabels={true}
        tooltipDataAttrs={(value) => {
            return {
              'data-tip': value.date ? `${value.date}: Written` : 'No entry',
            };
        }}
      />
    </div>
  );
}