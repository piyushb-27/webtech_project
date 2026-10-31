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
  bedrooms: '',
  bathrooms: '',
  furnishing_status: 'semi-furnished',
  listing_type: 'sale',
  price: '',
  description: '',
}

function Properties() {
  const [properties, setProperties] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

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
    setTimeout(() => setToast(null), 3000)
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
      title: property.title,
      owner_name: property.owner_name,
      category_id: property.category_id,
      city: property.city,
      locality: property.locality || '',
      area_sqft: property.area_sqft,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      furnishing_status: property.furnishing_status,
      listing_type: property.listing_type,
      price: property.price,
      description: property.description || '',
    })
    setEditingId(property.property_id)
    setShowModal(true)
  }

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title || !form.owner_name || !form.category_id || !form.city || !form.area_sqft || !form.price) {
      showToast('Please fill all required fields', 'error')
      return
    }
    setSubmitting(true)

    const payload = {
      title: form.title,
      owner_name: form.owner_name,
      category_id: Number(form.category_id),
      city: form.city,
      locality: form.locality,
      area_sqft: Number(form.area_sqft),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      furnishing_status: form.furnishing_status,
      listing_type: form.listing_type,
      price: Number(form.price),
      description: form.description,
    }

    if (editingId) {
      const { error } = await supabase.from('properties').update(payload).eq('property_id', editingId)
      if (error) {
        showToast('Failed to update property', 'error')
      } else {
        showToast('Property updated!')
        setShowModal(false)
        fetchData()
      }
    } else {
      const { error } = await supabase.from('properties').insert(payload)
      if (error) {
        showToast('Failed to add property', 'error')
      } else {
        showToast('Property added!')
        setShowModal(false)
        fetchData()
      }
    }
    setSubmitting(false)
  }

  async function handleDelete() {
    const { error } = await supabase.from('properties').delete().eq('property_id', deleteTarget.property_id)
    if (error) {
      showToast('Failed to delete property', 'error')
    } else {
      showToast('Property deleted')
      setDeleteTarget(null)
      fetchData()
    }
  }

  const filtered = properties.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || p.listing_type === filterType
    return matchSearch && matchType
  })

  return (
    <div className="page">

      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}

      <div className="page-top">
        <div>
          <h2>Properties</h2>
          <p>All listed properties</p>
        </div>
        <button className="btn-primary" onClick={openAddModal}>+ Add Property</button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by title or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="filter-select">
          <option value="all">All Types</option>
          <option value="sale">Sale</option>
          <option value="rent">Rent</option>
        </select>
      </div>

      {loading ? (
        <p className="state-msg">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="state-msg">No properties found.</p>
      ) : (
        <div className="cards-grid">
          {filtered.map(p => (
            <div className="property-card" key={p.property_id}>
              <div className="card-top">
                <span className={`badge ${p.listing_type}`}>{p.listing_type}</span>
                <span className="category-tag">{p.property_categories?.name}</span>
              </div>
              <h3>{p.title}</h3>
              <p className="location">📍 {p.city}{p.locality ? `, ${p.locality}` : ''}</p>
              <div className="card-details">
                <span>🛏 {p.bedrooms} bed</span>
                <span>🚿 {p.bathrooms} bath</span>
                <span>📐 {p.area_sqft} sqft</span>
              </div>
              <p className="owner">Owner: {p.owner_name}</p>
              <p className="furnishing">{p.furnishing_status}</p>
              <div className="card-footer">
                <span className="price">₹{Number(p.price).toLocaleString('en-IN')}</span>
                <div className="card-actions">
                  <button className="btn-edit" onClick={() => openEditModal(p)}>Edit</button>
                  <button className="btn-delete" onClick={() => setDeleteTarget(p)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Property' : 'Add Property'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="property-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input name="title" value={form.title} onChange={handleFormChange} placeholder="e.g. 3BHK in Bandra" />
                </div>
                <div className="form-group">
                  <label>Owner Name *</label>
                  <input name="owner_name" value={form.owner_name} onChange={handleFormChange} placeholder="Owner full name" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select name="category_id" value={form.category_id} onChange={handleFormChange}>
                    <option value="">Select category</option>
                    {categories.map(c => (
                      <option key={c.category_id} value={c.category_id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Listing Type</label>
                  <select name="listing_type" value={form.listing_type} onChange={handleFormChange}>
                    <option value="sale">Sale</option>
                    <option value="rent">Rent</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input name="city" value={form.city} onChange={handleFormChange} placeholder="e.g. Mumbai" />
                </div>
                <div className="form-group">
                  <label>Locality</label>
                  <input name="locality" value={form.locality} onChange={handleFormChange} placeholder="e.g. Andheri West" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Area (sqft) *</label>
                  <input type="number" name="area_sqft" value={form.area_sqft} onChange={handleFormChange} placeholder="e.g. 1200" />
                </div>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input type="number" name="price" value={form.price} onChange={handleFormChange} placeholder="e.g. 5000000" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Bedrooms</label>
                  <input type="number" name="bedrooms" value={form.bedrooms} onChange={handleFormChange} placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Bathrooms</label>
                  <input type="number" name="bathrooms" value={form.bathrooms} onChange={handleFormChange} placeholder="0" />
                </div>
              </div>

              <div className="form-group">
                <label>Furnishing Status</label>
                <select name="furnishing_status" value={form.furnishing_status} onChange={handleFormChange}>
                  <option value="furnished">Furnished</option>
                  <option value="semi-furnished">Semi-Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleFormChange} rows={3} placeholder="Optional description..." />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingId ? 'Update Property' : 'Add Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <h3>Delete Property?</h3>
            <p>Are you sure you want to delete <strong>{deleteTarget.title}</strong>? This cannot be undone.</p>
            <div className="form-actions" style={{ marginTop: '20px' }}>
              <button className="btn-cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-delete-confirm" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Properties
