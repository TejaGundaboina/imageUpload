import { useEffect, useRef, useState } from 'react'
import './App.css'

const defaultImageModules = import.meta.glob('./assets/*.{jpg,jpeg,png,gif,svg,webp}', {
  eager: true,
  import: 'default',
})

function App() {
  const fileInputRef = useRef(null)
  const [showAll, setShowAll] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [uploadedImages, setUploadedImages] = useState([])

  const defaultPictures = Object.entries(defaultImageModules)
    .filter(([path]) => !path.includes('/uploads/'))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, src], index) => ({
      id: path,
      src,
      label: `Image ${index + 1}`,
    }))

  const pictures = [...defaultPictures, ...uploadedImages]
  const activePic = pictures[currentIndex] || pictures[0]

  useEffect(() => {
    const loadUploadedImages = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/images')
        if (!response.ok) return
        const images = await response.json()
        setUploadedImages(images)
      } catch (error) {
        console.error('Failed to load uploaded images:', error)
      }
    }

    loadUploadedImages()
  }, [])

  useEffect(() => {
    if (currentIndex >= pictures.length) {
      setCurrentIndex(0)
    }
  }, [currentIndex, pictures.length])

  const nextPic = () => {
    if (pictures.length <= 1) return
    setCurrentIndex((prev) => (prev + 1) % pictures.length)
  }

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    const formData = new FormData()
    files.forEach((file) => formData.append('images', file))

    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      setUploadedImages((prev) => [...result.images, ...prev])
      setCurrentIndex(0)
      event.target.value = ''
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">Photo Gallery</div>

        <div className="header-actions">
          <label className="header-button upload-button">
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleUpload}
            />
            Upload Pics
          </label>

          <button
            className="header-button"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? 'Hide Pics' : 'Show All Pics'}
          </button>
        </div>
      </header>

      {pictures.length === 0 ? (
        <div className="photo-viewer">
          <h1>No images found</h1>
        </div>
      ) : showAll ? (
        <div className="gallery-grid">
          {pictures.map((pic) => (
            <div key={pic.id} className="gallery-card">
              <img src={pic.src} alt={pic.label} className="gallery-image" />
              <p>{pic.label}</p>
            </div>
          ))}
        </div>
      ) : (
        <main className="photo-viewer">
          <div className="photo-frame">
            <img src={activePic.src} alt={activePic.label} className="main-image" />
          </div>

          <h1>{activePic.label}</h1>

          <div className="card">
            <button onClick={nextPic}>Next Pic</button>
          </div>
        </main>
      )}
    </div>
  )
}

export default App
