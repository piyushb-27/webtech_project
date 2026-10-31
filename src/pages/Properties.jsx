import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import './Properties.css'

const emptyForm = {
  title: '',
  owner_name: '',
  category_id: '',
  city: '',
  locality: '',
  area_sqft: '',
  bedrooms: '3',
  bathrooms: '2',
  furnishing_status: 'Semi-Furnished',
  listing_type: 'sale',
  price: '',
  description: '',
}

function getCategoryIcon(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('villa')) return 'cottage'
  if (n.includes('penthouse')) return 'villa'
  if (n.includes('plot') || n.includes('land')) return 'landscape'
  if (n.includes('commercial') || n.includes('office')) return 'domain'
  if (n.includes('studio')) return 'home_work'
  return 'apartment'
}

function getInitials(name) {
  if (!name) return 'OW'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function Properties() {
  const [properties, setProperties] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  async function fetchData() {
    setLoading(true)
    const [propRes, catRes] = await Promise.all([
      supabase
        .from('properties')
        .select('*, property_categories(name)')
        .order('property_id', { ascending: false }),
      supabase.from('property_categories').select('*').order('name'),
    ])
    setProperties(propRes.data || [])
    setCategories(catRes.data || [])
    setLoading(false)
  }

  function openAddModal() {
    setForm(emptyForm)
    setEditingId(null)
    setShowModal(true)
  }

  function openEditModal(property) {
    setForm({
      title: property.title || '',
      owner_name: property.owner_name || '',
      category_id: property.category_id ? String(property.category_id) : '',
      city: property.city || '',
      locality: property.locality || '',
      area_sqft: property.area_sqft ? String(property.area_sqft) : '',
      bedrooms: property.bedrooms ? String(property.bedrooms) : '1',
      bathrooms: property.bathrooms ? String(property.bathrooms) : '1',
      furnishing_status: property.furnishing_status || 'Semi-Furnished',
      listing_type: property.listing_type || 'sale',
      price: property.price ? String(property.price) : '',
      description: property.description || '',
    })
    setEditingId(property.property_id)
    setShowModal(true)
  }

  function handleFormChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.owner_name.trim() || !form.category_id || !form.city.trim() || !form.area_sqft || !form.price) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    setSubmitting(true)
    const payload = {
      title: form.title.trim(),
      owner_name: form.owner_name.trim(),
      category_id: Number(form.category_id),
      city: form.city.trim(),
      locality: form.locality ? form.locality.trim() : null,
      area_sqft: Number(form.area_sqft),
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      furnishing_status: form.furnishing_status,
      listing_type: form.listing_type,
      price: Number(form.price),
      description: form.description ? form.description.trim() : null,
    }

    if (editingId) {
      const { error } = await supabase
        .from('properties')
        .update(payload)
        .eq('property_id', editingId)

      if (error) {
        showToast('Failed to update property', 'error')
      } else {
        showToast('Property listing updated successfully!')
        setShowModal(false)
        fetchData()
      }
    } else {
      const { error } = await supabase.from('properties').insert(payload)
      if (error) {
        showToast('Failed to create property listing', 'error')
      } else {
        showToast('New property listing published!')
        setShowModal(false)
        fetchData()
      }
    }
    setSubmitting(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('property_id', deleteTarget.property_id)

    if (error) {
      showToast('Failed to delete property listing', 'error')
    } else {
      showToast('Property listing removed from portfolio')
      setDeleteTarget(null)
      fetchData()
    }
  }

  const filtered = properties.filter(p => {
    const q = search.toLowerCase().trim()
    const matchSearch =
      !q ||
      p.title?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q) ||
      p.locality?.toLowerCase().includes(q) ||
      p.owner_name?.toLowerCase().includes(q)

    const matchType = filterType === 'all' || p.listing_type === filterType
    const matchCategory =
      selectedCategory === 'all' ||
      String(p.category_id) === String(selectedCategory)

    return matchSearch && matchType && matchCategory
  })

  const totalSale = properties.filter(p => p.listing_type === 'sale').length
  const totalRent = properties.filter(p => p.listing_type === 'rent').length

  return (
    <div className="properties-page">

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
            <p className="toast-subtitle">Real-time ledger synchronized</p>
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

      {/* Top Header & Context Stats */}
      <div className="page-header-row">
        <div className="page-heading">
          <div className="title-with-pill">
            <h1>Properties</h1>
            <span className="tag-portfolio">Active Ledger</span>
          </div>
          <p className="page-subheading">
            Portfolio Management & Live Listings
          </p>
          <div className="quick-stats-strip">
            <span className="stat-chip">
              <strong className="stat-accent">{properties.length}</strong> Total
            </span>
            <span className="stat-chip">
              <strong className="stat-accent sale">{totalSale}</strong> For Sale
            </span>
            <span className="stat-chip">
              <strong className="stat-accent rent">{totalRent}</strong> For Rent
            </span>
          </div>
        </div>

        <button className="btn-add-property" onClick={openAddModal}>
          <span className="material-symbols-outlined">add</span>
          <span>Add Property</span>
        </button>
      </div>

      {/* Modern Filter & Search Bar */}
      <div className="filter-card-bar">
        <div className="search-box-wrap">
          <span className="material-symbols-outlined search-icon">search</span>
          <input
            type="text"
            className="search-input-field"
            placeholder="Search by title, city, locality, or owner..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch('')}>
              <span className="material-symbols-outlined">cancel</span>
            </button>
          )}
        </div>

        <div className="filter-controls-group">
          {/* Listing Type Select */}
          <div className="custom-select-wrap">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="type-dropdown"
            >
              <option value="all">All Listings</option>
              <option value="sale">Sale Only</option>
              <option value="rent">Rent Only</option>
            </select>
            <span className="material-symbols-outlined select-arrow">expand_more</span>
          </div>

          {/* Category Filter Pills */}
          <div className="category-pills-scroll">
            <button
              type="button"
              className={`pill-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              <span className="material-symbols-outlined">apps</span>
              <span>All</span>
            </button>
            {categories.map(c => (
              <button
                key={c.category_id}
                type="button"
                className={`pill-btn ${String(selectedCategory) === String(c.category_id) ? 'active' : ''}`}
                onClick={() => setSelectedCategory(c.category_id)}
              >
                <span className="material-symbols-outlined">
                  {getCategoryIcon(c.name)}
                </span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>

          {/* Result Counter */}
          <div className="showing-counter-badge">
            <span className="material-symbols-outlined">view_agenda</span>
            <span>
              Showing <strong>{filtered.length}</strong> of {properties.length}
            </span>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="empty-state-card">
          <div className="loading-spinner" />
          <p>Syncing properties with database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state-card">
          <span className="material-symbols-outlined empty-icon">apartment</span>
          <h3>No properties found</h3>
          <p>Try adjusting your search query or filter options.</p>
          <button className="btn-secondary-reset" onClick={() => { setSearch(''); setFilterType('all'); setSelectedCategory('all') }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="properties-grid">
          {filtered.map(p => {
            const priceSqft = p.area_sqft && p.price ? Math.round(Number(p.price) / Number(p.area_sqft)) : null
            const catName = p.property_categories?.name || 'Property'
            const catIcon = getCategoryIcon(catName)

            return (
              <article className="property-card" key={p.property_id}>
                <div className="card-inner">
                  {/* Card Header Badges */}
                  <div className="card-badge-row">
                    <div className="badge-cluster">
                      <span className={`listing-badge ${p.listing_type}`}>
                        <span className="badge-dot" />
                        {p.listing_type === 'sale' ? 'FOR SALE' : 'FOR RENT'}
                      </span>
                      <span className="category-pill-chip">
                        <span className="material-symbols-outlined">{catIcon}</span>
                        <span>{catName}</span>
                      </span>
                    </div>
                  </div>

                  {/* Title & Location */}
                  <div className="card-title-block">
                    <h2 className="property-title">{p.title}</h2>
                    <div className="property-location">
                      <span className="material-symbols-outlined loc-icon">location_on</span>
                      <span>
                        {p.city}
                        {p.locality ? `, ${p.locality}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* 3-Column Specifications Box */}
                  <div className="specs-grid-box">
                    <div className="spec-item">
                      <span className="spec-label">
                        <span className="material-symbols-outlined">bed</span> Beds
                      </span>
                      <span className="spec-val">{p.bedrooms || 0}</span>
                    </div>
                    <div className="spec-item divider">
                      <span className="spec-label">
                        <span className="material-symbols-outlined">bathtub</span> Baths
                      </span>
                      <span className="spec-val">{p.bathrooms || 0}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">
                        <span className="material-symbols-outlined">square_foot</span> Built-up
                      </span>
                      <span className="spec-val">
                        {Number(p.area_sqft).toLocaleString('en-IN')}{' '}
                        <small>sqft</small>
                      </span>
                    </div>
                  </div>

                  {/* Owner & Furnishing row */}
                  <div className="card-meta-row">
                    <div className="meta-pair">
                      <span className="meta-muted">Furnishing</span>
                      <span className="meta-pill">{p.furnishing_status}</span>
                    </div>
                    <div className="meta-pair">
                      <span className="meta-muted">Owner</span>
                      <span className="meta-owner">
                        <span className="owner-avatar">{getInitials(p.owner_name)}</span>
                        <span>{p.owner_name}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Price & Actions */}
                <div className="card-footer-strip">
                  <div className="price-stack">
                    <div className="price-main">
                      ₹{Number(p.price).toLocaleString('en-IN')}
                    </div>
                    {priceSqft && (
                      <span className="price-sqft">
                        ₹{priceSqft.toLocaleString('en-IN')} / sqft
                      </span>
                    )}
                  </div>

                  <div className="action-buttons-group">
                    <button
                      type="button"
                      className="btn-icon edit"
                      title="Edit Property"
                      onClick={() => openEditModal(p)}
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button
                      type="button"
                      className="btn-icon delete"
                      title="Delete Listing"
                      onClick={() => setDeleteTarget(p)}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Add / Edit Property Modal */}
      {showModal && (
        <div className="modal-backdrop-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-dialog-box" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-top-bar">
              <div className="modal-title-stack">
                <div className="modal-title-row">
                  <h3>{editingId ? 'Edit Property' : 'Add New Property'}</h3>
                  <span className="modal-mode-badge">
                    {editingId ? 'LIVE LEDGER' : 'NEW LISTING'}
                  </span>
                </div>
                <p className="modal-caption">
                  Fill in property specifications to maintain the portfolio ledger.
                </p>
              </div>
              <button
                type="button"
                className="modal-dismiss-btn"
                onClick={() => setShowModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="property-edit-form">
              {/* Listing Type Toggle Switch */}
              <div className="form-field-full">
                <label className="field-label">Listing Type *</label>
                <div className="type-toggle-switch">
                  <button
                    type="button"
                    className={`type-toggle-opt ${form.listing_type === 'sale' ? 'active' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, listing_type: 'sale' }))}
                  >
                    <span className="material-symbols-outlined">sell</span>
                    <span>For Sale</span>
                  </button>
                  <button
                    type="button"
                    className={`type-toggle-opt ${form.listing_type === 'rent' ? 'active' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, listing_type: 'rent' }))}
                  >
                    <span className="material-symbols-outlined">key</span>
                    <span>For Rent</span>
                  </button>
                </div>
              </div>

              {/* Title & Owner */}
              <div className="form-grid-2">
                <div className="form-field-full">
                  <label className="field-label">
                    Property Title <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    placeholder="e.g. Silver Oak Heights Luxury Villa"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">
                    Owner Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="owner_name"
                    value={form.owner_name}
                    onChange={handleFormChange}
                    placeholder="e.g. Rajesh Varma"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">
                    Category <span className="req">*</span>
                  </label>
                  <div className="select-container">
                    <select
                      name="category_id"
                      value={form.category_id}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(c => (
                        <option key={c.category_id} value={c.category_id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined select-chevron">expand_more</span>
                  </div>
                </div>
              </div>

              {/* City & Locality */}
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="field-label">
                    City <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleFormChange}
                    placeholder="e.g. Bengaluru"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Locality</label>
                  <input
                    type="text"
                    name="locality"
                    value={form.locality}
                    onChange={handleFormChange}
                    placeholder="e.g. Whitefield"
                  />
                </div>
              </div>

              {/* Area & Price */}
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="field-label">
                    Carpet Area (sqft) <span className="req">*</span>
                  </label>
                  <input
                    type="number"
                    name="area_sqft"
                    value={form.area_sqft}
                    onChange={handleFormChange}
                    placeholder="e.g. 2400"
                    min="1"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">
                    Expected Price (₹) <span className="req">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleFormChange}
                    placeholder="e.g. 18500000"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Bedrooms & Bathrooms selector buttons */}
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="field-label">Bedrooms</label>
                  <div className="pill-choice-row">
                    {['1', '2', '3', '4', '5+'].map(val => (
                      <button
                        key={val}
                        type="button"
                        className={`choice-btn ${form.bedrooms === val.replace('+', '') ? 'selected' : ''}`}
                        onClick={() => setForm(prev => ({ ...prev, bedrooms: val.replace('+', '') }))}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-field">
                  <label className="field-label">Bathrooms</label>
                  <div className="pill-choice-row">
                    {['1', '2', '3', '4+'].map(val => (
                      <button
                        key={val}
                        type="button"
                        className={`choice-btn ${form.bathrooms === val.replace('+', '') ? 'selected' : ''}`}
                        onClick={() => setForm(prev => ({ ...prev, bathrooms: val.replace('+', '') }))}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Furnishing Status */}
              <div className="form-field-full">
                <label className="field-label">Furnishing Status</label>
                <div className="select-container">
                  <select
                    name="furnishing_status"
                    value={form.furnishing_status}
                    onChange={handleFormChange}
                  >
                    <option value="Fully Furnished">Fully Furnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                  <span className="material-symbols-outlined select-chevron">expand_more</span>
                </div>
              </div>

              {/* Description */}
              <div className="form-field-full">
                <label className="field-label">Property Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="Additional features, floor layout, amenities..."
                />
              </div>

              {/* Modal Footer Controls */}
              <div className="modal-bottom-actions">
                <div className="compliance-tag">
                  <span className="material-symbols-outlined">verified_user</span>
                  <span>Portfolio compliance validated</span>
                </div>
                <div className="btn-actions-right">
                  <button
                    type="button"
                    className="btn-modal-cancel"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-modal-save"
                    disabled={submitting}
                  >
                    <span className="material-symbols-outlined">bookmark_add</span>
                    <span>
                      {submitting
                        ? 'Saving...'
                        : editingId
                        ? 'Update Property'
                        : 'Save Property'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-backdrop-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="confirm-delete-box" onClick={e => e.stopPropagation()}>
            <div className="delete-icon-circle">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <h3>Remove Listing?</h3>
            <p>
              Are you sure you want to delete{' '}
              <strong>{deleteTarget.title}</strong> from the active portfolio?
              This action cannot be undone.
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
                Yes, Delete Listing
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Properties
