import { useState, useEffect } from 'react';
import { expensesAPI, analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, expensesRes] = await Promise.all([
        expensesAPI.getStats(),
        expensesAPI.getAll({ limit: 5, sortBy: 'date', order: 'desc' })
      ]);
      setStats(statsRes.data.data);
      setRecent(expensesRes.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);

  if (isLoading) {
    return (
      <div className="dashboard-grid">
        <div className="skeleton" style={{ height: 120 }}></div>
        <div className="skeleton" style={{ height: 120 }}></div>
        <div className="skeleton" style={{ height: 120 }}></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container animate-in">
      
      {/* SUMMARY CARDS */}
      <div className="stats-grid">
        <div className="stat-card balance-card">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <p className="stat-label">Monthly Budget</p>
            <h3 className="stat-value text-blue">{formatCurrency(stats?.budget)}</h3>
          </div>
        </div>

        <div className="stat-card expense-card">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <p className="stat-label">Spent This Month</p>
            <h3 className="stat-value text-red">{formatCurrency(stats?.currentMonthTotal)}</h3>
            <p className="stat-sub">
              {stats?.changePercent > 0 ? (
                <span style={{ color: 'var(--accent-red)' }}>↑ {stats.changePercent}% from last month</span>
              ) : (
                <span style={{ color: 'var(--accent-green)' }}>↓ {Math.abs(stats?.changePercent || 0)}% from last month</span>
              )}
            </p>
          </div>
        </div>

        <div className="stat-card savings-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <p className="stat-label">Remaining</p>
            <h3 className="stat-value text-green">{formatCurrency(stats?.remaining)}</h3>
            <div className="progress-bg" style={{ marginTop: 8, height: 4, background: 'var(--border)', borderRadius: 2 }}>
              <div 
                style={{ 
                  height: '100%', 
                  background: 'var(--accent-green)', 
                  width: `${Math.min(100, (stats?.remaining / stats?.budget) * 100 || 0)}%` 
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="dashboard-bottom grid-2" style={{ marginTop: 24 }}>
        
        {/* RECENT TRANSACTIONS */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Recent Transactions</h3>
            <a href="/expenses" style={{ fontSize: 13, fontWeight: 500 }}>View All →</a>
          </div>
          
          {recent.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <span className="empty-icon">📝</span>
              <p>No expenses recorded yet.</p>
            </div>
          ) : (
            <div className="recent-list">
              {recent.map(exp => (
                <div key={exp._id} className="recent-item">
                  <div className={`cat-icon cat-${exp.category.toLowerCase()}`}>
                    {exp.category === 'Food' ? '🍔' : exp.category === 'Travel' ? '🚗' : '🛍️'}
                  </div>
                  <div className="recent-info">
                    <p className="recent-title">{exp.title}</p>
                    <p className="recent-date">{new Date(exp.date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</p>
                  </div>
                  <div className="recent-amount" style={{ color: 'var(--accent-red)', fontWeight: 600 }}>
                    -{formatCurrency(exp.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QUICK INSIGHTS PLACEHOLDER */}
        <div className="card card-glass" style={{ background: 'linear-gradient(135deg, rgba(79,142,247,0.1), rgba(167,139,250,0.05))' }}>
          <h3 className="section-title">✨ AI Insights</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Your spending looks steady! You've spent <b>{((stats?.currentMonthTotal / stats?.budget)*100).toFixed(0)}%</b> of your budget. Keep it up to reach your savings goals.
          </p>
          <div style={{ marginTop: 24 }}>
            <a href="/analytics" className="btn btn-primary btn-sm">View Full Analytics</a>
          </div>
        </div>

      </div>

    </div>
  );
}
