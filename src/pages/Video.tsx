import React, { useState, useEffect } from 'react';
import MusicMatrixBackground from '../components/MusicMatrixBackground';
import API_URL from '../config';
import type { Video as VideoType } from '../types';
import './Video.css';

const Video: React.FC = () => {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');

  const ADMIN_PASSWORD = 'mxmartin2024';

  // Fetch videos from database
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/videos`);
      const data: VideoType[] = await response.json();
      setVideos(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching videos:', error);
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

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = async (event: ProgressEvent<FileReader>) => {
          try {
            const response = await fetch(`${API_URL}/videos`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: newTitle || file.name,
                url: event.target?.result as string,
                isEmbed: false
              })
            });
            if (response.ok) {
              await fetchVideos();
              setNewTitle('');
            }
          } catch (error) {
            console.error('Error uploading video:', error);
            alert('Failed to upload video');
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDeleteVideo = async (videoId: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        const response = await fetch(`${API_URL}/videos/${videoId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          await fetchVideos();
        }
      } catch (error) {
        console.error('Error deleting video:', error);
        alert('Failed to delete video');
      }
    }
  };

  return (
    <div className="video-page">
      <MusicMatrixBackground />
      <h2>Videos</h2>

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
          <h3>Upload Videos</h3>
          <input
            type="text"
            placeholder="Video title (optional)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="caption-input"
          />
          <input
            type="file"
            accept="video/*"
            multiple
            onChange={handleVideoUpload}
            className="file-input"
          />
          <button onClick={() => setIsAdmin(false)} className="close-admin-btn">
            Close Admin
          </button>
        </div>
      )}

      <div className="video-grid">
        {videos.map((video: VideoType) => (
          <div key={video.id} className="video-container">
            <h3>{video.title}</h3>
            {video.is_embed || video.isEmbed ? (
              <iframe
                width="100%"
                height="315"
                src={video.url}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <video
                width="100%"
                height="315"
                controls
                src={video.url}
                onClick={() => setSelectedVideo(video)}
              >
                Your browser does not support the video tag.
              </video>
            )}
            {isAdmin && (
              <button
                className="delete-btn"
                onClick={() => handleDeleteVideo(video.id)}
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedVideo && !selectedVideo.is_embed && !selectedVideo.isEmbed && (
        <div className="video-lightbox" onClick={() => setSelectedVideo(null)}>
          <div className="video-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedVideo(null)}>×</button>
            <h3>{selectedVideo.title}</h3>
            <video
              width="100%"
              controls
              autoPlay
              src={selectedVideo.url}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </div>
  );
};

export default Video;
