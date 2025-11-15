import React, { useState, useEffect } from 'react';
import MusicMatrixBackground from '../components/MusicMatrixBackground';
import API_URL from '../config';
import { Photo } from '../types';
import './Photos.css';

const Photos: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [newCaption, setNewCaption] = useState<string>('');

  const ADMIN_PASSWORD = '$Aragorn60';

  // Fetch photos from database
  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/photos`);
      const data: Photo[] = await response.json();
      setPhotos(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowAdmin(true);
      setPassword('');
    } else {
      alert('Incorrect password');
      setPassword('');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = async (event: ProgressEvent<FileReader>) => {
          try {
            const response = await fetch(`${API_URL}/photos`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                url: event.target?.result as string,
                caption: newCaption || file.name
              })
            });
            if (response.ok) {
              await fetchPhotos();
              setNewCaption('');
            }
          } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Failed to upload photo');
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDeletePhoto = async (photoId: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        const response = await fetch(`${API_URL}/photos/${photoId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          await fetchPhotos();
        }
      } catch (error) {
        console.error('Error deleting photo:', error);
        alert('Failed to delete photo');
      }
    }
  };

  return (
    <div className="photos-page">
      <MusicMatrixBackground />
      <h2>Photo Gallery</h2>

      {!isAdmin && (
        <button className="admin-toggle" onClick={() => setShowAdmin(!showAdmin)}>
          {showAdmin ? 'Hide Admin' : 'Admin Login'}
        </button>
      )}

      {showAdmin && !isAdmin && (
        <form className="admin-login" onSubmit={handleAdminLogin}>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      )}

      {isAdmin && (
        <div className="upload-panel">
          <h3>Upload Photos</h3>
          <input
            type="text"
            placeholder="Photo caption (optional)"
            value={newCaption}
            onChange={(e) => setNewCaption(e.target.value)}
            className="caption-input"
          />
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="file-input"
          />
          <button onClick={() => setIsAdmin(false)} className="close-admin-btn">
            Close Admin
          </button>
        </div>
      )}

      <div className="photo-grid">
        {photos.map((photo: Photo) => (
          <div
            key={photo.id}
            className="photo-item"
          >
            <img
              src={photo.url}
              alt={photo.caption}
              onClick={() => setSelectedPhoto(photo)}
            />
            <p>{photo.caption}</p>
            {isAdmin && (
              <button
                className="delete-btn"
                onClick={() => handleDeletePhoto(photo.id)}
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <div className="lightbox" onClick={() => setSelectedPhoto(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedPhoto(null)}>×</button>
            <img src={selectedPhoto.url} alt={selectedPhoto.caption} />
            <p>{selectedPhoto.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Photos;
