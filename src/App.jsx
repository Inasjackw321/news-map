import { useState, useEffect } from 'react'
import { auth, googleProvider } from './firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import Map from './components/Map'
import AuthPanel from './components/AuthPanel'
import MarkerForm from './components/MarkerForm'
import './styles/App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showMarkerForm, setShowMarkerForm] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [autoMode, setAutoMode] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Login error:', error)
      alert('Failed to log in. Please try again.')
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleMapClick = (position) => {
    if (!user) {
      alert('Please log in to place markers')
      return
    }
    setSelectedPosition(position)
    setShowMarkerForm(true)
  }

  const handleMarkerSubmit = () => {
    setShowMarkerForm(false)
    setSelectedPosition(null)
  }

  const handleMarkerCancel = () => {
    setShowMarkerForm(false)
    setSelectedPosition(null)
  }

  const toggleAutoMode = () => {
    setAutoMode(!autoMode)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🗺️ News Map</h1>
          <div className="header-controls">
            <button
              className={`auto-mode-btn ${autoMode ? 'active' : ''}`}
              onClick={toggleAutoMode}
              title={autoMode ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
            >
              {autoMode ? '🔄 Auto' : '⏸️ Manual'}
            </button>
            <AuthPanel
              user={user}
              onLogin={handleLogin}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </header>

      <main className="app-main">
        <Map
          user={user}
          onMapClick={handleMapClick}
          autoMode={autoMode}
        />

        {showMarkerForm && (
          <MarkerForm
            position={selectedPosition}
            user={user}
            onSubmit={handleMarkerSubmit}
            onCancel={handleMarkerCancel}
          />
        )}
      </main>

      {!user && (
        <div className="login-prompt">
          <p>Log in with Google to place news markers on the map</p>
        </div>
      )}
    </div>
  )
}

export default App
