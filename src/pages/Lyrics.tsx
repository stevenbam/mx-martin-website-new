import React, { useState, useEffect } from 'react';
import MusicMatrixBackground from '../components/MusicMatrixBackground';
import API_URL from '../config';
import { Lyric } from '../types';
import './Lyrics.css';

interface EditingSong {
  id?: number;
  title: string;
  lyrics: string;
}

const Lyrics: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [newSong, setNewSong] = useState<EditingSong>({ title: '', lyrics: '' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingSong, setEditingSong] = useState<EditingSong>({ title: '', lyrics: '' });
  const [songs, setSongs] = useState<Lyric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch lyrics from database
  useEffect(() => {
    fetchLyrics();
  }, []);

  const fetchLyrics = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/lyrics`);
      const data: Lyric[] = await response.json();
      setSongs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      setLoading(false);
    }
  };

  const ADMIN_PASSWORD = 'mxmartin2024';

  const nextPage = (): void => {
    if (currentPage < songs.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = (): void => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
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

  const handleAddSong = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (newSong.title && newSong.lyrics) {
      try {
        const response = await fetch(`${API_URL}/lyrics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSong)
        });
        if (response.ok) {
          await fetchLyrics();
          setNewSong({ title: '', lyrics: '' });
          alert('Song added successfully!');
        }
      } catch (error) {
        console.error('Error adding song:', error);
        alert('Failed to add song');
      }
    }
  };

  const handleEditClick = (index: number): void => {
    setEditingIndex(index);
    setEditingSong({ ...songs[index] });
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (editingSong.title && editingSong.lyrics && editingSong.id) {
      try {
        const response = await fetch(`${API_URL}/lyrics/${editingSong.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingSong)
        });
        if (response.ok) {
          await fetchLyrics();
          setEditingIndex(null);
          setEditingSong({ title: '', lyrics: '' });
          alert('Song updated successfully!');
        }
      } catch (error) {
        console.error('Error updating song:', error);
        alert('Failed to update song');
      }
    }
  };

  const handleCancelEdit = (): void => {
    setEditingIndex(null);
    setEditingSong({ title: '', lyrics: '' });
  };

  const handleDeleteSong = async (index: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      try {
        const songId = songs[index].id;
        const response = await fetch(`${API_URL}/lyrics/${songId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          await fetchLyrics();
          if (currentPage >= songs.length - 1 && currentPage > 0) {
            setCurrentPage(currentPage - 1);
          }
          alert('Song deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting song:', error);
        alert('Failed to delete song');
      }
    }
  };

  return (
    <div className="lyrics-page">
      <MusicMatrixBackground />
      <h2>Lyrics Notebook</h2>

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

      {isAdmin && editingIndex === null && (
        <div className="admin-panel">
          <h3>Add New Song</h3>
          <form onSubmit={handleAddSong}>
            <input
              type="text"
              placeholder="Song Title"
              value={newSong.title}
              onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Song Lyrics"
              value={newSong.lyrics}
              onChange={(e) => setNewSong({ ...newSong, lyrics: e.target.value })}
              rows={10}
              required
            />
            <button type="submit">Add Song</button>
            <button type="button" onClick={() => setIsAdmin(false)}>Close Admin</button>
          </form>
        </div>
      )}

      {isAdmin && editingIndex !== null && (
        <div className="admin-panel">
          <h3>Edit Song</h3>
          <form onSubmit={handleSaveEdit}>
            <input
              type="text"
              placeholder="Song Title"
              value={editingSong.title}
              onChange={(e) => setEditingSong({ ...editingSong, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Song Lyrics"
              value={editingSong.lyrics}
              onChange={(e) => setEditingSong({ ...editingSong, lyrics: e.target.value })}
              rows={10}
              required
            />
            <button type="submit">Save Changes</button>
            <button type="button" onClick={handleCancelEdit}>Cancel</button>
          </form>
        </div>
      )}

      <div className="notebook">
        <div className="notebook-cover">
          <div className="notebook-spine"></div>
        </div>

        <div className="notebook-page left-page">
          <div className="page-lines">
            <h3>{songs[currentPage]?.title}</h3>
            <pre className="lyrics-text">{songs[currentPage]?.lyrics}</pre>
            {isAdmin && (
              <div className="song-actions">
                <button
                  className="edit-song-btn"
                  onClick={() => handleEditClick(currentPage)}
                >
                  Edit Song
                </button>
                <button
                  className="delete-song-btn"
                  onClick={() => handleDeleteSong(currentPage)}
                >
                  Delete Song
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="page-navigation">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="page-btn prev-btn"
          >
            ← Previous
          </button>
          <span className="page-number">
            Page {currentPage + 1} of {songs.length}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === songs.length - 1}
            className="page-btn next-btn"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lyrics;
