import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard',  icon: '🏠', label: 'Dashboard'  },
  { to: '/expenses',   icon: '💸', label: 'Expenses'   },
  { to: '/analytics',  icon: '📊', label: 'Analytics'  },
  { to: '/goals',      icon: '🎯', label: 'Goals'      },
  { to: '/calendar',   icon: '📅', label: 'Calendar'   },
  { to: '/profile',    icon: '👤', label: 'Profile'    },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout }   = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out. See you soon! 👋');
    navigate('/login');
  };

  // Generate avatar color from user name
  const avatarHue = user ? (user.name.charCodeAt(0) * 37) % 360 : 220;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-logo">💰</div>
          <div>
            <h1 className="brand-name"><span className="brand-accent">Fin</span>ora</h1>
            <p className="brand-tagline">Expense Tracker</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="nav-section">Menu</p>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          ))}

          <p className="nav-section">Preferences</p>
        </nav>

        {/* User Info + Logout */}
        <div className="sidebar-user">
          <div className="user-avatar" style={{ background: `hsl(${avatarHue}, 55%, 38%)` }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <p className="user-name">{user?.name}</p>
            <p className="user-email">{user?.email}</p>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            🚪
          </button>
        </div>
      </aside>
    </>
  );
}
