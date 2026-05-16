import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { goalsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const { data } = await goalsAPI.getAll();
      setGoals(data.data);
    } catch (err) {
      toast.error('Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddFunds = (goal) => {
    setSelectedGoal(goal);
    setIsEditOpen(true);
  };

  const formatCurrency = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);

  if (isLoading) return <div className="skeleton" style={{ height: 400 }}></div>;

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">Set targets and track your progress</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>+ New Goal</button>
      </div>

      {goals.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">🎯</div>
          <h3>No Goals Set</h3>
          <p>You haven't set any savings goals yet. Create one to start tracking!</p>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setIsAddOpen(true)}>+ Create Goal</button>
        </div>
      ) : (
        <div className="grid-3">
          {goals.map(goal => {
            const percent = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
            return (
              <div key={goal._id} className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div className="cat-icon" style={{ background: `${goal.color}20`, color: goal.color, margin: 0 }}>
                    {goal.icon}
                  </div>
                  {goal.isCompleted && <span className="badge badge-green">Completed! 🎉</span>}
                </div>
                
                <h3 style={{ fontSize: 18, marginBottom: 4 }}>{goal.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
                  Target: <b>{formatCurrency(goal.targetAmount)}</b> by {new Date(goal.deadline).toLocaleDateString('en-IN', {month:'short', year:'numeric'})}
                </p>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8, fontWeight: 600 }}>
                    <span>{formatCurrency(goal.savedAmount)}</span>
                    <span style={{ color: 'var(--accent-primary)' }}>{percent}%</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: goal.color, width: `${percent}%`, transition: 'width 0.5s ease' }} />
                  </div>
                </div>

                <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
                  <button 
                    className="btn btn-primary btn-full" 
                    onClick={() => openAddFunds(goal)}
                    disabled={goal.isCompleted}
                  >
                    Add Funds
                  </button>
                  <button 
                    className="btn btn-icon btn-danger" 
                    onClick={async () => {
                      if(window.confirm('Delete this goal?')) {
                        await goalsAPI.delete(goal._id);
                        fetchGoals();
                      }
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isAddOpen && <AddGoalModal onClose={() => setIsAddOpen(false)} onAdd={fetchGoals} />}
      {isEditOpen && <AddFundsModal goal={selectedGoal} onClose={() => setIsEditOpen(false)} onUpdate={fetchGoals} />}
    </div>
  );
}

// ── Modals ──────────────────────────────────────────────────

function AddGoalModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({ title: '', targetAmount: '', deadline: '', icon: '🎯', color: '#4f8ef7' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await goalsAPI.create(formData);
      toast.success('Goal created!');
      onAdd();
      onClose();
    } catch (err) {
      toast.error('Error creating goal');
    } finally { setLoading(false); }
  };

  return createPortal(
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">Create Savings Goal</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Goal Title</label>
            <input required type="text" className="form-input" placeholder="e.g. New MacBook" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Target Amount (₹)</label>
            <input required type="number" min="1" className="form-input" value={formData.targetAmount} onChange={e => setFormData({...formData, targetAmount: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Target Date</label>
            <input required type="date" className="form-input" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Emoji Icon</label>
              <input required type="text" className="form-input" maxLength="2" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Theme Color</label>
              <input type="color" className="form-input" style={{height:42, padding:4}} value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>Create Goal</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function AddFundsModal({ goal, onClose, onUpdate }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newTotal = goal.savedAmount + parseFloat(amount);
      await goalsAPI.update(goal._id, { savedAmount: newTotal });
      toast.success('Funds added successfully! 🎉');
      onUpdate();
      onClose();
    } catch (err) {
      toast.error('Error updating goal');
    } finally { setLoading(false); }
  };

  return createPortal(
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h2 className="modal-title">Add Funds to {goal.icon}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Amount to Add (₹)</label>
            <input required type="number" min="1" max={goal.targetAmount - goal.savedAmount} className="form-input" value={amount} onChange={e => setAmount(e.target.value)} />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Remaining to goal: ₹{goal.targetAmount - goal.savedAmount}
            </p>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>Confirm Transfer</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
