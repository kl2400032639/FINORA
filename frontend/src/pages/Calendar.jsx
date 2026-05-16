import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday } from 'date-fns';
import toast from 'react-hot-toast';
import './Calendar.css';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyData, setDailyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    setIsLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const { data } = await analyticsAPI.getDailyBreakdown({ year, month });
      setDailyData(data.data);
    } catch (err) {
      toast.error('Failed to load calendar data');
    } finally {
      setIsLoading(false);
    }
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  // Generate calendar grid
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
  const startingDayIndex = getDay(startDate); // 0 = Sunday
  const blanks = Array.from({ length: startingDayIndex }, (_, i) => i);

  const formatCurrency = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Expense Calendar</h1>
          <p className="page-subtitle">Track your spending patterns day by day</p>
        </div>
        <div className="calendar-controls card">
          <button className="btn-icon" onClick={prevMonth}>←</button>
          <span style={{ fontWeight: 600, width: 140, textAlign: 'center' }}>
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button className="btn-icon" onClick={nextMonth}>→</button>
        </div>
      </div>

      <div className="card calendar-container">
        <div className="calendar-header">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-header-cell">{day}</div>
          ))}
        </div>

        {isLoading ? (
          <div className="skeleton" style={{ height: 400, marginTop: 16 }}></div>
        ) : (
          <div className="calendar-grid">
            {blanks.map(blank => (
              <div key={`blank-${blank}`} className="calendar-cell empty"></div>
            ))}
            
            {daysInMonth.map((dayDate) => {
              const dayStr = format(dayDate, 'yyyy-MM-dd');
              const dayData = dailyData.find(d => d.date === dayStr);
              const total = dayData?.total || 0;
              
              // Intensity calculation for heatmap effect
              const intensity = total > 5000 ? 'high' : total > 1000 ? 'medium' : total > 0 ? 'low' : 'none';

              return (
                <div key={dayStr} className={`calendar-cell ${isToday(dayDate) ? 'today' : ''} heatmap-${intensity}`}>
                  <span className="cell-date">{format(dayDate, 'd')}</span>
                  {total > 0 && (
                    <div className="cell-amount">
                      {formatCurrency(total)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
