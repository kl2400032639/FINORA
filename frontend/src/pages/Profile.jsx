import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="animate-in">
      <h1 className="page-title">Profile & Settings</h1>
      <p className="page-subtitle">Manage your account preferences</p>
      
      <div className="card" style={{ marginTop: 24, maxWidth: 600 }}>
        <h3 className="section-title">Account Details</h3>
        
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input type="text" className="form-input" disabled value={user?.name || ''} />
        </div>
        
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input type="email" className="form-input" disabled value={user?.email || ''} />
        </div>
      </div>
    </div>
  );
}
