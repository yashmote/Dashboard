// client/src/Heatmap.jsx
import { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css'; // Default styling
import { subYears, format } from 'date-fns';
import { getLogs } from './api';
import './Heatmap.css'; // Custom colors

export default function Heatmap() {
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // 1. Fetch ALL logs for the past year
    const today = new Date();
    const oneYearAgo = subYears(today, 1);
    
    // We request a wide range
    const start = format(oneYearAgo, 'yyyy-MM-dd');
    const end = format(today, 'yyyy-MM-dd');
    
    const res = await getLogs(start, end);
    const logs = res.data;

    // 2. Process Data: Count completions per day
    // We need an array like: [{ date: '2023-01-01', count: 3 }]
    const counts = {};
    
    logs.forEach(log => {
      // log.date is "YYYY-MM-DD"
      counts[log.date] = (counts[log.date] || 0) + 1;
    });

    // Convert object to array
    const formattedData = Object.keys(counts).map(date => ({
      date: date,
      count: counts[date]
    }));

    setHeatmapData(formattedData);
  };

  return (
    <div className="heatmap-container">
      <h3>Consistency Graph (Last 365 Days)</h3>
      <CalendarHeatmap
        startDate={subYears(new Date(), 1)}
        endDate={new Date()}
        values={heatmapData}
        classForValue={(value) => {
          if (!value || value.count === 0) {
            return 'color-empty';
          }
          // Returns color-scale-1, color-scale-2, etc. based on how many habits done
          // We cap it at 4 (so 4+ habits is the darkest green)
          return `color-scale-${Math.min(value.count, 4)}`;
        }}
        showWeekdayLabels={true}
      />
    </div>
  );
}