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
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordTitle, setRecordTitle] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const videoPreviewRef = React.useRef<HTMLVideoElement>(null);
  const cameraPreviewRef = React.useRef<HTMLVideoElement>(null);

  const ADMIN_PASSWORD = 'mxmartin2024';

  // Fetch videos from database
  useEffect(() => {
    fetchVideos();
  }, []);

  // Start camera preview when admin mode is active
  useEffect(() => {
    if (isAdmin && !isRecording && !recordedBlob) {
      startCameraPreview();
    } else {
      stopCameraPreview();
    }

    return () => {
      stopCameraPreview();
    };
  }, [isAdmin, isRecording, recordedBlob]);

  const startCameraPreview = async (): Promise<void> => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      setPreviewStream(mediaStream);

      if (cameraPreviewRef.current) {
        cameraPreviewRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera for preview:', error);
    }
  };

  const stopCameraPreview = (): void => {
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
      setPreviewStream(null);
      if (cameraPreviewRef.current) {
        cameraPreviewRef.current.srcObject = null;
      }
    }
  };

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

  const startVideoRecording = async (): Promise<void> => {
    // Stop the preview stream first
    stopCameraPreview();

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setStream(mediaStream);

      // Show preview
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = mediaStream;
      }

      const recorder = new MediaRecorder(mediaStream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        mediaStream.getTracks().forEach(track => track.stop());
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = null;
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access camera/microphone. Please grant permission.');
    }
  };

  const stopVideoRecording = (): void => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const uploadRecordedVideo = async (): Promise<void> => {
    if (!recordedBlob || !recordTitle) {
      alert('Please provide a title for the recording');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event: ProgressEvent<FileReader>) => {
      try {
        const response = await fetch(`${API_URL}/videos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: recordTitle,
            url: event.target?.result as string,
            isEmbed: false
          })
        });

        if (response.ok) {
          alert('Recording uploaded successfully!');
          setRecordTitle('');
          setRecordedBlob(null);
          await fetchVideos();
        } else {
          alert('Failed to upload recording');
        }
      } catch (error) {
        console.error('Error uploading recording:', error);
        alert('Error uploading recording');
      }
    };
    reader.readAsDataURL(recordedBlob);
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

          <h3 style={{ marginTop: '20px' }}>Or Record Video</h3>
          <div className="record-section">
            {!isRecording && !recordedBlob && (
              <>
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ color: '#ff6600', fontWeight: 'bold', marginBottom: '10px' }}>📹 Camera Preview</p>
                  <video
                    ref={cameraPreviewRef}
                    autoPlay
                    muted
                    style={{
                      width: '100%',
                      maxWidth: '500px',
                      borderRadius: '8px',
                      border: '2px solid #228b22',
                      marginBottom: '10px'
                    }}
                  />
                </div>
                <button onClick={startVideoRecording} className="record-btn">
                  🎥 Start Recording
                </button>
              </>
            )}

            {isRecording && (
              <>
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  muted
                  style={{ width: '100%', maxWidth: '500px', marginBottom: '10px' }}
                />
                <button onClick={stopVideoRecording} className="stop-btn">
                  ⏹️ Stop Recording
                </button>
              </>
            )}

            {recordedBlob && (
              <div className="recorded-section">
                <p>✅ Recording complete!</p>
                <video
                  src={URL.createObjectURL(recordedBlob)}
                  controls
                  style={{ width: '100%', maxWidth: '500px', marginBottom: '10px' }}
                />
                <input
                  type="text"
                  placeholder="Video Title"
                  value={recordTitle}
                  onChange={(e) => setRecordTitle(e.target.value)}
                  style={{ display: 'block', marginBottom: '10px', padding: '8px' }}
                />
                <button onClick={uploadRecordedVideo} style={{ marginRight: '10px' }}>
                  Upload Recording
                </button>
                <button onClick={() => setRecordedBlob(null)}>
                  Discard
                </button>
              </div>
            )}
          </div>

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
