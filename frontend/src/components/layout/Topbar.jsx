import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Topbar.css';

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get current greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="hamburger" onClick={onMenuClick}>
          ☰
        </button>
        <div className="greeting-container">
          <h2 className="topbar-greeting">{greeting}, {firstName}! 👋</h2>
          <p className="topbar-subtitle">Let's check your financial health.</p>
        </div>
      </div>

      <div className="topbar-right">
        {/* Quick Add Button */}
        <button className="btn btn-primary quick-add-btn" onClick={() => navigate('/expenses', { state: { openAddModal: true }})}>
          <span>+</span> <span className="hide-mobile">Add Expense</span>
        </button>

        {/* Notifications */}
        <button className="icon-btn notif-btn">
          🔔
          <span className="notif-dot"></span>
        </button>
      </div>
    </header>
  );
}
