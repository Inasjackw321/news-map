import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import { db, isFirebaseConfigured } from '../firebase'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import L from 'leaflet'
import '../styles/Map.css'

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom marker icons based on category
const categoryIcons = {
  conflict: '⚔️',
  politics: '🏛️',
  disaster: '🌪️',
  economy: '💰',
  social: '👥',
  technology: '💻',
  environment: '🌍',
  other: '📍'
}

const createCustomIcon = (category, isRecent) => {
  const emoji = categoryIcons[category] || categoryIcons.other
  const opacity = isRecent ? 1 : 0.7

  return L.divIcon({
    html: `<div class="custom-marker ${isRecent ? 'recent' : ''}" style="opacity: ${opacity}">${emoji}</div>`,
    className: 'custom-marker-container',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  })
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng })
    }
  })
  return null
}

function Map({ user, onMapClick, autoMode }) {
  const [markers, setMarkers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!autoMode || !db) {
      setLoading(false)
      return
    }

    // Real-time listener for markers
    const markersRef = collection(db, 'markers')
    const q = query(markersRef, orderBy('createdAt', 'desc'), limit(100))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const markersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }))
      setMarkers(markersData)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching markers:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [autoMode])

  const isRecentMarker = (createdAt) => {
    if (!createdAt) return false
    const hoursDiff = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
    return hoursDiff < 24
  }

  const formatDate = (date) => {
    if (!date) return 'Unknown date'
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="map-container">
      {!isFirebaseConfigured && (
        <div className="firebase-warning">
          ⚠️ Firebase not configured. Map is in view-only mode. See README for setup instructions.
        </div>
      )}

      {loading && (
        <div className="map-loading">
          <div className="loading-spinner"></div>
        </div>
      )}

      <MapContainer
        center={[20, 0]}
        zoom={2}
        className="leaflet-map"
        minZoom={2}
        maxZoom={18}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapClickHandler onMapClick={onMapClick} />

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.position.lat, marker.position.lng]}
            icon={createCustomIcon(marker.category, isRecentMarker(marker.createdAt))}
          >
            <Popup>
              <div className="marker-popup">
                <div className="popup-header">
                  <span className="popup-category">{marker.category}</span>
                  <span className="popup-date">{formatDate(marker.createdAt)}</span>
                </div>
                <h3>{marker.title}</h3>
                <p>{marker.description}</p>
                {marker.source && (
                  <div className="popup-source">
                    <strong>Source:</strong> {marker.source}
                  </div>
                )}
                <div className="popup-footer">
                  <span className="popup-author">By {marker.authorName}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="map-legend">
        <h4>Categories</h4>
        {Object.entries(categoryIcons).map(([category, icon]) => (
          <div key={category} className="legend-item">
            <span className="legend-icon">{icon}</span>
            <span className="legend-label">{category}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Map
