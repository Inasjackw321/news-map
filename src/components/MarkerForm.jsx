import { useState } from 'react'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import '../styles/MarkerForm.css'

function MarkerForm({ position, user, onSubmit, onCancel }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('other')
  const [source, setSource] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const categories = [
    { value: 'conflict', label: '⚔️ Conflict' },
    { value: 'politics', label: '🏛️ Politics' },
    { value: 'disaster', label: '🌪️ Disaster' },
    { value: 'economy', label: '💰 Economy' },
    { value: 'social', label: '👥 Social' },
    { value: 'technology', label: '💻 Technology' },
    { value: 'environment', label: '🌍 Environment' },
    { value: 'other', label: '📍 Other' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim() || !description.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)

    try {
      await addDoc(collection(db, 'markers'), {
        title: title.trim(),
        description: description.trim(),
        category,
        source: source.trim(),
        position: {
          lat: position.lat,
          lng: position.lng
        },
        authorId: user.uid,
        authorName: user.displayName,
        authorEmail: user.email,
        createdAt: serverTimestamp()
      })

      onSubmit()
    } catch (error) {
      console.error('Error creating marker:', error)
      alert('Failed to create marker. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="marker-form-overlay" onClick={onCancel}>
      <div className="marker-form" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2>Add News Marker</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief title for the news event"
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the news event in detail"
              rows={4}
              maxLength={500}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="source">Source (optional)</label>
            <input
              id="source"
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="News source or reference URL"
              maxLength={200}
            />
          </div>

          <div className="form-location">
            <strong>Location:</strong> {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-submit"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Marker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MarkerForm
