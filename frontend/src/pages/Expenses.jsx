import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { expensesAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Filters
  const [category, setCategory] = useState('All');
  
  useEffect(() => {
    fetchExpenses();
  }, [category]);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const { data } = await expensesAPI.getAll({ category: category !== 'All' ? category : undefined });
      setExpenses(data.data);
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await expensesAPI.delete(id);
      toast.success('Deleted successfully');
      fetchExpenses();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <>
      <div className="animate-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 className="page-title">All Expenses</h1>
            <p className="page-subtitle">Manage and track your transaction history.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>+ Add Expense</button>
        </div>

        <div className="card">
          <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
            <select className="form-select" style={{ width: 200 }} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {isLoading ? (
            <div className="skeleton" style={{ height: 300 }}></div>
          ) : expenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <h3>No expenses found</h3>
              <p>You haven't recorded any expenses in this category yet.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 500 }}>Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 500 }}>Title</th>
                    <th style={{ padding: '12px 16px', fontWeight: 500 }}>Category</th>
                    <th style={{ padding: '12px 16px', fontWeight: 500 }}>Amount</th>
                    <th style={{ padding: '12px 16px', fontWeight: 500 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(exp => (
                    <tr key={exp._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px' }}>{new Date(exp.date).toLocaleDateString('en-IN')}</td>
                      <td style={{ padding: '16px', fontWeight: 500 }}>{exp.title}</td>
                      <td style={{ padding: '16px' }}>
                        <span className="badge badge-blue">{exp.category}</span>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--accent-red)', fontWeight: 600 }}>
                        ₹{exp.amount.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button className="btn-icon btn-ghost" onClick={() => handleDelete(exp._id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {isAddOpen && <AddExpenseModal onClose={() => setIsAddOpen(false)} onAdd={fetchExpenses} />}
    </>
  );
}

function AddExpenseModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({ title: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await expensesAPI.create(formData);
      toast.success('Expense added!');
      onAdd();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding expense');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">Add Expense</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input required type="text" className="form-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input required type="number" min="1" className="form-input" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select required className="form-select" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="" disabled>Select category</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input required type="date" className="form-input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>Save Expense</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
