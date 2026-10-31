import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import './Deals.css'

function getPaymentInfo(method) {
  switch (method) {
    case 'bank_transfer':
      return { label: 'Bank Transfer (NEFT/RTGS)', icon: 'account_balance' }
    case 'upi':
      return { label: 'UPI Instant Transfer', icon: 'qr_code_2' }
    case 'cheque':
      return { label: 'Demand Draft / Cheque', icon: 'history_edu' }
    case 'cash':
      return { label: 'Cash Settlement', icon: 'payments' }
    case 'loan':
      return { label: 'Home Loan / Escrow', icon: 'real_estate_agent' }
    default:
      return {
        label: method ? method.replace('_', ' ') : 'Payment',
        icon: 'credit_card',
      }
  }
}

function Deals() {
  const [deals, setDeals] = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({
    property_id: '',
    payment_method: 'bank_transfer',
    deal_status: 'pending',
  })
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function fetchData() {
    setLoading(true)
    const [dealRes, propRes] = await Promise.all([
      supabase
        .from('deals')
        .select('*, properties(title, city, locality, listing_type, price, owner_name)')
        .order('deal_id', { ascending: false }),
      supabase
        .from('properties')
        .select('property_id, title, city, locality, price, listing_type')
        .order('property_id', { ascending: false }),
    ])
    setDeals(dealRes.data || [])
    setProperties(propRes.data || [])
    setLoading(false)
  }

  async function handleAddDeal(e) {
    e.preventDefault()
    if (!addForm.property_id) {
      showToast('Please select a property listing', 'error')
      return
    }
    setSubmitting(true)
    const { error } = await supabase.from('deals').insert({
      property_id: Number(addForm.property_id),
      payment_method: addForm.payment_method,
      deal_status: addForm.deal_status || 'pending',
    })
    if (error) {
      showToast('Failed to create deal record', 'error')
    } else {
      showToast('New deal transaction created!')
      setShowAddModal(false)
      setAddForm({
        property_id: '',
        payment_method: 'bank_transfer',
        deal_status: 'pending',
      })
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
      showToast('Failed to update deal status', 'error')
    } else {
      showToast(
        newStatus === 'done'
          ? 'Deal marked as Settled & Closed!'
          : 'Deal status reverted to Pending'
      )
      fetchData()
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('deal_id', deleteTarget.deal_id)
    if (error) {
      showToast('Failed to remove deal record', 'error')
    } else {
      showToast('Deal transaction removed from ledger')
      setDeleteTarget(null)
      fetchData()
    }
  }

  const doneDeals = deals.filter(d => d.deal_status === 'done')
  const pendingDeals = deals.filter(d => d.deal_status === 'pending')

  const totalVolume = deals.reduce(
    (acc, d) => acc + (Number(d.properties?.price) || 0),
    0
  )
  const doneVolume = doneDeals.reduce(
    (acc, d) => acc + (Number(d.properties?.price) || 0),
    0
  )
  const pendingVolume = pendingDeals.reduce(
    (acc, d) => acc + (Number(d.properties?.price) || 0),
    0
  )

  const filtered = deals.filter(d => {
    const q = search.toLowerCase().trim()
    const matchesFilter =
      filterStatus === 'all' || d.deal_status === filterStatus
    const propTitle = d.properties?.title?.toLowerCase() || ''
    const city = d.properties?.city?.toLowerCase() || ''
    const payment = d.payment_method?.toLowerCase() || ''
    const matchesSearch =
      !q ||
      propTitle.includes(q) ||
      city.includes(q) ||
      payment.includes(q)
    return matchesFilter && matchesSearch
  })

  return (
    <div className="deals-page">

      {/* Floating Modern Toast */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-icon-wrap">
            <span className="material-symbols-outlined">
              {toast.type === 'error' ? 'priority_high' : 'check'}
            </span>
          </div>
          <div className="toast-content">
            <p className="toast-title">{toast.msg}</p>
            <p className="toast-subtitle">Deal ledger synchronized</p>
          </div>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => setToast(null)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* Top Page Header & Actions */}
      <div className="deals-header-row">
        <div className="deals-heading">
          <div className="title-with-pill">
            <span className="liquidity-tag">
              PORTFOLIO TRANSACTIONS • LEDGER
            </span>
          </div>
          <div className="title-count-row">
            <h1>Deals Pipeline</h1>
            <span className="total-pipeline-badge">
              {deals.length} Total Deals
            </span>
          </div>
          <p className="deals-subheading">
            Track active settlements, escrow milestones, and transactions across portfolio holdings.
          </p>
        </div>

        <button
          className="btn-create-deal"
          onClick={() => setShowAddModal(true)}
        >
          <span className="material-symbols-outlined">add</span>
          <span>New Deal</span>
        </button>
      </div>

      {/* Top 3 Metric Cards Grid */}
      <div className="metric-cards-grid">
        {/* Card 1: Gross Pipeline */}
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-info">
              <span className="metric-label">Gross Pipeline</span>
              <div className="metric-count-large">
                Total Deals: <span>{deals.length}</span>
              </div>
            </div>
            <div className="metric-icon-box">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
          </div>
          <div className="metric-card-bottom">
            <div className="metric-amount">
              ₹{totalVolume.toLocaleString('en-IN')}
            </div>
            <div className="metric-subtext">Total contractual asset value</div>
          </div>
        </div>

        {/* Card 2: Settled Deals */}
        <div className="metric-card settled">
          <div className="metric-card-top">
            <div className="metric-info">
              <span className="metric-pill done">
                <span className="metric-dot done" />
                Settled &amp; Closed
              </span>
              <div className="metric-count-large">
                Done Deals: <span>{doneDeals.length}</span>
              </div>
            </div>
            <div className="metric-icon-box done">
              <span className="material-symbols-outlined">verified</span>
            </div>
          </div>
          <div className="metric-card-bottom">
            <div className="metric-amount done">
              ₹{doneVolume.toLocaleString('en-IN')}
            </div>
            <div className="metric-subtext">Successfully liquidated volume</div>
          </div>
        </div>

        {/* Card 3: Pending Deals */}
        <div className="metric-card pending">
          <div className="metric-card-top">
            <div className="metric-info">
              <span className="metric-pill pending">
                <span className="metric-dot pending" />
                Awaiting Settlement
              </span>
              <div className="metric-count-large">
                Pending Deals: <span>{pendingDeals.length}</span>
              </div>
            </div>
            <div className="metric-icon-box pending">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
          </div>
          <div className="metric-card-bottom">
            <div className="metric-amount pending">
              ₹{pendingVolume.toLocaleString('en-IN')}
            </div>
            <div className="metric-subtext">Active transactions under escrow</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="deals-toolbar-bar">
        {/* Segmented Filter Buttons */}
        <div className="deals-tabs-group">
          <button
            type="button"
            className={`deals-tab-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            <span className="material-symbols-outlined">apps</span>
            <span>All Deals</span>
            <span className="tab-count-tag">({deals.length})</span>
          </button>
          <button
            type="button"
            className={`deals-tab-btn ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            <span className="tab-dot pending" />
            <span>Pending</span>
            <span className="tab-count-tag">({pendingDeals.length})</span>
          </button>
          <button
            type="button"
            className={`deals-tab-btn ${filterStatus === 'done' ? 'active' : ''}`}
            onClick={() => setFilterStatus('done')}
          >
            <span className="tab-dot done" />
            <span>Done</span>
            <span className="tab-count-tag">({doneDeals.length})</span>
          </button>
        </div>

        {/* Search input */}
        <div className="deals-search-wrap">
          <span className="material-symbols-outlined search-icon">search</span>
          <input
            type="text"
            className="deals-search-input"
            placeholder="Search property title, city, or payment..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch('')}>
              <span className="material-symbols-outlined">cancel</span>
            </button>
          )}
        </div>
      </div>

      {/* Deals List */}
      {loading ? (
        <div className="empty-state-card">
          <div className="loading-spinner" />
          <p>Syncing transactions ledger...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state-card">
          <span className="material-symbols-outlined empty-icon">handshake</span>
          <h3>No transactions found</h3>
          <p>Try adjusting your search query or status filter.</p>
          <button
            className="btn-secondary-reset"
            onClick={() => {
              setSearch('')
              setFilterStatus('all')
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="deals-list-stack">
          {filtered.map(deal => {
            const isDone = deal.deal_status === 'done'
            const payment = getPaymentInfo(deal.payment_method)
            const prop = deal.properties

            return (
              <div
                key={deal.deal_id}
                className={`deal-row-card ${isDone ? 'done' : 'pending'}`}
              >
                {/* Left Side: Status Dot & Property Info */}
                <div className="deal-left-info">
                  <div
                    className={`deal-status-beacon ${isDone ? 'done' : 'pending'}`}
                    title={isDone ? 'Settled & Closed' : 'Pending Escrow'}
                  >
                    <span className="beacon-inner-dot" />
                  </div>

                  <div className="deal-info-content">
                    <div className="deal-title-line">
                      <h3 className="deal-property-title">
                        {prop?.title || 'Unknown Property'}
                      </h3>
                      <span className="deal-id-tag">
                        #TRX-{String(deal.deal_id).padStart(4, '0')}
                      </span>
                    </div>

                    <div className="deal-details-meta">
                      <span className="deal-spec-highlight">
                        {prop?.city || 'India'}
                        {prop?.locality ? `, ${prop.locality}` : ''}
                        &nbsp;•&nbsp;
                        <span className="deal-type-label">
                          {prop?.listing_type === 'sale' ? 'Sale' : 'Rent'}
                        </span>
                        &nbsp;•&nbsp;
                        <strong>
                          ₹{Number(prop?.price || 0).toLocaleString('en-IN')}
                        </strong>
                      </span>

                      <span className="meta-bullet">•</span>

                      <div className="payment-method-chip">
                        <span className="material-symbols-outlined">
                          {payment.icon}
                        </span>
                        <span>{payment.label}</span>
                      </div>

                      <span className="meta-bullet">•</span>

                      <div className="deal-timestamp">
                        <span className="material-symbols-outlined">event</span>
                        <span>
                          {new Date(deal.deal_date || deal.created_at).toLocaleDateString(
                            'en-IN',
                            { day: 'numeric', month: 'short', year: 'numeric' }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Status Badge, Toggle, and Delete */}
                <div className="deal-right-actions">
                  <span className={`deal-state-badge ${isDone ? 'done' : 'pending'}`}>
                    <span className="badge-dot" />
                    {isDone ? 'Settled' : 'Pending'}
                  </span>

                  <button
                    type="button"
                    className={`btn-toggle-deal ${isDone ? 'undo' : 'done'}`}
                    onClick={() => toggleStatus(deal)}
                  >
                    <span className="material-symbols-outlined">
                      {isDone ? 'undo' : 'check'}
                    </span>
                    <span>{isDone ? 'Mark Pending' : 'Mark Settled'}</span>
                  </button>

                  <button
                    type="button"
                    className="btn-delete-deal"
                    title="Remove Transaction"
                    onClick={() => setDeleteTarget(deal)}
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* New Deal Modal */}
      {showAddModal && (
        <div
          className="modal-backdrop-overlay"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="modal-dialog-box modal-deal-dialog"
            onClick={e => e.stopPropagation()}
          >
            {/* Top Bar Accent */}
            <div className="modal-accent-stripe" />

            <div className="modal-top-bar">
              <div className="modal-title-stack">
                <div className="modal-title-row">
                  <h3>Create New Deal</h3>
                  <span className="modal-mode-badge">TRANSACTION</span>
                </div>
                <p className="modal-caption">
                  Attach an active portfolio listing and configure settlement terms.
                </p>
              </div>
              <button
                type="button"
                className="modal-dismiss-btn"
                onClick={() => setShowAddModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddDeal} className="deal-form-body">
              {/* Select Property */}
              <div className="form-field-full">
                <label className="field-label">
                  Select Property Listing <span className="req">*</span>
                </label>
                <div className="select-container">
                  <select
                    value={addForm.property_id}
                    onChange={e =>
                      setAddForm({ ...addForm, property_id: e.target.value })
                    }
                    required
                  >
                    <option value="">-- Choose a property from portfolio --</option>
                    {properties.map(p => (
                      <option key={p.property_id} value={p.property_id}>
                        {p.title} — {p.city} (
                        {p.listing_type === 'sale' ? 'Sale' : 'Rent'}) — ₹
                        {Number(p.price).toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined select-chevron">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="form-field-full">
                <label className="field-label">Payment Settlement Channel</label>
                <div className="select-container">
                  <select
                    value={addForm.payment_method}
                    onChange={e =>
                      setAddForm({ ...addForm, payment_method: e.target.value })
                    }
                  >
                    <option value="bank_transfer">
                      Bank Transfer (NEFT / RTGS / IMPS)
                    </option>
                    <option value="upi">UPI Instant Payment</option>
                    <option value="loan">Home Loan / Bank Escrow</option>
                    <option value="cheque">Demand Draft / Bank Cheque</option>
                    <option value="cash">Direct Cash Settlement</option>
                  </select>
                  <span className="material-symbols-outlined select-chevron">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Initial Deal Status */}
              <div className="form-field-full">
                <label className="field-label">Initial Status Stage</label>
                <div className="deal-status-radio-grid">
                  <div
                    className={`status-radio-card ${
                      addForm.deal_status === 'pending' ? 'selected' : ''
                    }`}
                    onClick={() =>
                      setAddForm({ ...addForm, deal_status: 'pending' })
                    }
                  >
                    <div className="radio-circle">
                      {addForm.deal_status === 'pending' && <span className="radio-dot" />}
                    </div>
                    <div className="radio-text">
                      <div className="radio-title-row">
                        <span className="status-indicator-mini pending" />
                        <strong>Pending</strong>
                      </div>
                      <span className="radio-desc">
                        Under contract / escrow / verification
                      </span>
                    </div>
                  </div>

                  <div
                    className={`status-radio-card ${
                      addForm.deal_status === 'done' ? 'selected' : ''
                    }`}
                    onClick={() => setAddForm({ ...addForm, deal_status: 'done' })}
                  >
                    <div className="radio-circle">
                      {addForm.deal_status === 'done' && <span className="radio-dot" />}
                    </div>
                    <div className="radio-text">
                      <div className="radio-title-row">
                        <span className="status-indicator-mini done" />
                        <strong>Settled &amp; Done</strong>
                      </div>
                      <span className="radio-desc">
                        Full payment cleared &amp; closed
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="modal-bottom-actions">
                <div className="compliance-tag">
                  <span className="material-symbols-outlined">gavel</span>
                  <span>Escrow &amp; legal settlement terms verified</span>
                </div>
                <div className="btn-actions-right">
                  <button
                    type="button"
                    className="btn-modal-cancel"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-modal-save"
                    disabled={submitting}
                  >
                    <span className="material-symbols-outlined">add</span>
                    <span>{submitting ? 'Creating...' : 'Create Deal'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Deal Confirmation Dialog */}
      {deleteTarget && (
        <div
          className="modal-backdrop-overlay"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="confirm-delete-box"
            onClick={e => e.stopPropagation()}
          >
            <div className="delete-icon-circle">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <h3>Remove Deal Transaction?</h3>
            <p>
              Are you sure you want to remove the deal for{' '}
              <strong>{deleteTarget.properties?.title || 'this property'}</strong>{' '}
              from the active ledger? This cannot be undone.
            </p>
            <div className="confirm-actions-row">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-confirm-delete"
                onClick={handleDelete}
              >
                Yes, Delete Transaction
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Deals
