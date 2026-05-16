import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import './Analytics.css';

const COLORS = ['#4f8ef7', '#10d9a0', '#a78bfa', '#fbbf24', '#f87171', '#fb923c', '#60a5fa', '#34d399'];

export default function Analytics() {
  const [categories, setCategories] = useState([]);
  const [trends, setTrends] = useState([]);
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, trendRes, insightRes] = await Promise.all([
        analyticsAPI.getCategoryBreakdown(),
        analyticsAPI.getMonthlyTrend(),
        analyticsAPI.getInsights()
      ]);
      setCategories(catRes.data.data);
      setTrends(trendRes.data.data);
      setInsights(insightRes.data.data.insights);
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);

  if (isLoading) {
    return (
      <div className="analytics-grid">
        <div className="skeleton" style={{ height: 300 }}></div>
        <div className="skeleton" style={{ height: 300 }}></div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Analytics Dashboard</h1>
        <p className="page-subtitle">Deep dive into your spending habits</p>
      </div>

      {/* AI Insights Section */}
      {insights.length > 0 && (
        <div className="insights-container">
          <h3 className="section-title">✨ AI Spending Insights</h3>
          <div className="insights-grid">
            {insights.map((insight, idx) => (
              <div key={idx} className={`insight-card type-${insight.type}`}>
                <span className="insight-icon">{insight.icon}</span>
                <div className="insight-content">
                  <h4>{insight.title}</h4>
                  <p>{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="analytics-grid">
        {/* Category Pie Chart */}
        <div className="card">
          <h3 className="section-title">Spending by Category (This Month)</h3>
          {categories.length === 0 ? (
            <div className="empty-state">No data available yet</div>
          ) : (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="total"
                    nameKey="category"
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                {categories.map((cat, idx) => (
                  <div key={idx} className="legend-item">
                    <span className="legend-dot" style={{ background: COLORS[idx % COLORS.length] }}></span>
                    <span className="legend-label">{cat.category}</span>
                    <span className="legend-value">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Monthly Trend Area Chart */}
        <div className="card">
          <h3 className="section-title">6-Month Spending Trend</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trends.slice(-6)}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="total" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
