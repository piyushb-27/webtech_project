import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import './Deals.css'

function Deals() {
  const [deals, setDeals] = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ property_id: '', payment_method: 'bank_transfer' })
  const [submitting, setSubmitting] = useState(false)

  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function fetchData() {
    setLoading(true)
    const [dealRes, propRes] = await Promise.all([
      supabase
        .from('deals')
        .select('*, properties(title, city, listing_type, price)')
        .order('deal_id', { ascending: false }),
      supabase
        .from('properties')
        .select('property_id, title, city, price, listing_type')
        .order('property_id', { ascending: false }),
    ])
    setDeals(dealRes.data || [])
    setProperties(propRes.data || [])
    setLoading(false)
  }

  async function handleAddDeal(e) {
    e.preventDefault()
    if (!addForm.property_id) {
      showToast('Please select a property', 'error')
      return
    }
    setSubmitting(true)
    const { error } = await supabase.from('deals').insert({
      property_id: Number(addForm.property_id),
      payment_method: addForm.payment_method,
      deal_status: 'pending',
    })
    if (error) {
      showToast('Failed to create deal', 'error')
    } else {
      showToast('Deal created!')
      setShowAddModal(false)
      setAddForm({ property_id: '', payment_method: 'bank_transfer' })
      fetchData()
    }
    setSubmitting(false)
  }

  async function toggleStatus(deal) {
    const newStatus = deal.deal_status === 'pending' ? 'done' : 'pending'
    const { error } = await supabase
      .from('deals')
      .update({ deal_status: newStatus })
      .eq('deal_id', deal.deal_id)
    if (error) {
      showToast('Failed to update status', 'error')
    } else {
      showToast(newStatus === 'done' ? 'Deal marked as done!' : 'Deal marked as pending')
      fetchData()
    }
  }

  async function handleDelete(deal) {
    const { error } = await supabase.from('deals').delete().eq('deal_id', deal.deal_id)
    if (error) {
      showToast('Failed to delete deal', 'error')
    } else {
      showToast('Deal removed')
      fetchData()
    }
  }

  const filtered = deals.filter(d => {
    if (filterStatus === 'all') return true
    return d.deal_status === filterStatus
  })

  const doneCnt = deals.filter(d => d.deal_status === 'done').length
  const pendingCnt = deals.filter(d => d.deal_status === 'pending').length

  return (
    <div className="page">

      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}

      <div className="page-top">
        <div>
          <h2>Deals</h2>
          <p>Track property deals and their status</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>+ New Deal</button>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <span className="stat-num">{deals.length}</span>
          <span className="stat-label">Total Deals</span>
        </div>
        <div className="stat-box done">
          <span className="stat-num">{doneCnt}</span>
          <span className="stat-label">Done</span>
        </div>
        <div className="stat-box pending">
          <span className="stat-num">{pendingCnt}</span>
          <span className="stat-label">Pending</span>
        </div>
      </div>

      <div className="filters">
        <button
          className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          Pending
        </button>
        <button
          className={`filter-btn ${filterStatus === 'done' ? 'active' : ''}`}
          onClick={() => setFilterStatus('done')}
        >
          Done
        </button>
      </div>

      {loading ? (
        <p className="state-msg">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="state-msg">No deals found.</p>
      ) : (
        <div className="deals-list">
          {filtered.map(deal => (
            <div className={`deal-card ${deal.deal_status}`} key={deal.deal_id}>
              <div className="deal-left">
                <div className="deal-status-dot" />
                <div>
                  <h3>{deal.properties?.title || 'Unknown Property'}</h3>
                  <p className="deal-meta">
                    📍 {deal.properties?.city}
                    &nbsp;·&nbsp;
                    {deal.properties?.listing_type === 'sale' ? 'Sale' : 'Rent'}
                    &nbsp;·&nbsp;
                    ₹{Number(deal.properties?.price || 0).toLocaleString('en-IN')}
                  </p>
                  <p className="deal-payment">💳 {deal.payment_method.replace('_', ' ')}</p>
                  <p className="deal-date">
                    {new Date(deal.deal_date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="deal-right">
                <span className={`status-badge ${deal.deal_status}`}>
                  {deal.deal_status === 'done' ? '✓ Done' : '⏳ Pending'}
                </span>
                <button
                  className={`toggle-btn ${deal.deal_status === 'done' ? 'undo' : 'mark-done'}`}
                  onClick={() => toggleStatus(deal)}
                >
                  {deal.deal_status === 'done' ? 'Mark Pending' : 'Mark Done'}
                </button>
                <button className="btn-remove" onClick={() => handleDelete(deal)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Deal</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddDeal} className="deal-form">
              <div className="form-group">
                <label>Select Property *</label>
                <select
                  value={addForm.property_id}
                  onChange={e => setAddForm({ ...addForm, property_id: e.target.value })}
                >
                  <option value="">Choose a property</option>
                  {properties.map(p => (
                    <option key={p.property_id} value={p.property_id}>
                      {p.title} — {p.city} ({p.listing_type})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select
                  value={addForm.payment_method}
                  onChange={e => setAddForm({ ...addForm, payment_method: e.target.value })}
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="upi">UPI</option>
                  <option value="loan">Home Loan</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default Deals
