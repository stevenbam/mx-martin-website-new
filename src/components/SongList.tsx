import React, { useState, useEffect } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import API_URL from '../config';
import { Song } from '../types';
import './SongList.css';

const SongList: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordTitle, setRecordTitle] = useState<string>('');

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/songs`);
      const data: Song[] = await response.json();
      setSongs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching songs:', error);
      setLoading(false);
    }
  };

  const handleLogin = (): void => {
    if (password === '$Aragorn60') {
      setIsAdmin(true);
      setShowLogin(false);
      setPassword('');
    } else {
      alert('Incorrect password');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (!uploadFile || !uploadTitle) {
      alert('Please provide both a title and a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('title', uploadTitle);
    formData.append('song', uploadFile);

    try {
      const response = await fetch(`${API_URL}/songs/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Song uploaded successfully!');
        setUploadTitle('');
        setUploadFile(null);
        fetchSongs(); // Refresh the song list
      } else {
        alert('Failed to upload song');
      }
    } catch (error) {
      console.error('Error uploading song:', error);
      alert('Error uploading song');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      try {
        const response = await fetch(`${API_URL}/songs/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Song deleted successfully!');
          fetchSongs();
        } else {
          alert('Failed to delete song');
        }
      } catch (error) {
        console.error('Error deleting song:', error);
        alert('Error deleting song');
      }
    }
  };

  const startRecording = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please grant permission.');
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const uploadRecording = async (): Promise<void> => {
    if (!recordedBlob || !recordTitle) {
      alert('Please provide a title for the recording');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('title', recordTitle);
    formData.append('song', recordedBlob, `${recordTitle}.webm`);

    try {
      const response = await fetch(`${API_URL}/songs/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Recording uploaded successfully!');
        setRecordTitle('');
        setRecordedBlob(null);
        fetchSongs();
      } else {
        alert('Failed to upload recording');
      }
    } catch (error) {
      console.error('Error uploading recording:', error);
      alert('Error uploading recording');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="song-list">Loading songs...</div>;
  }

  return (
    <div className="song-list">
      {/* Admin Login Button */}
      {!isAdmin && (
        <button onClick={() => setShowLogin(!showLogin)} className="admin-btn">
          Admin Login
        </button>
      )}

      {/* Login Form */}
      {showLogin && !isAdmin && (
        <div className="login-form">
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      )}

      {/* Admin Upload Section */}
      {isAdmin && (
        <div className="admin-section">
          <h3>Upload New Song</h3>
          <div className="upload-form">
            <input
              type="text"
              placeholder="Song Title"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
            />
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
            />
            <button onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Song'}
            </button>
          </div>

          <h3 style={{ marginTop: '20px' }}>Or Record Audio</h3>
          <div className="record-form">
            {!isRecording && !recordedBlob && (
              <button onClick={startRecording} className="record-btn">
                🎤 Start Recording
              </button>
            )}
            {isRecording && (
              <button onClick={stopRecording} className="stop-btn">
                ⏹️ Stop Recording
              </button>
            )}
            {recordedBlob && (
              <div className="recorded-section">
                <p>✅ Recording complete!</p>
                <audio src={URL.createObjectURL(recordedBlob)} controls />
                <input
                  type="text"
                  placeholder="Recording Title"
                  value={recordTitle}
                  onChange={(e) => setRecordTitle(e.target.value)}
                />
                <button onClick={uploadRecording} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Recording'}
                </button>
                <button onClick={() => setRecordedBlob(null)}>
                  Discard
                </button>
              </div>
            )}
          </div>

          <button onClick={() => setIsAdmin(false)} className="logout-btn">
            Logout
          </button>
        </div>
      )}

      {/* Song List */}
      {songs.map((song: Song) => {
        // If file_path starts with /uploads, it's from the backend API
        // Otherwise it's a static file from the frontend
        const audioSrc = song.file_path.startsWith('/uploads')
          ? `${API_URL.replace('/api', '')}${song.file_path}`
          : song.file_path;

        return (
          <div key={song.id} className="song-item">
            <h3>{song.title}</h3>
            <ReactAudioPlayer
              src={audioSrc}
              controls
            />
            {isAdmin && (
              <button onClick={() => handleDelete(song.id)} className="delete-btn">
                Delete
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SongList;
