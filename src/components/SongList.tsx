import React, { useState, useEffect } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import API_URL from '../config';
import { Song } from '../types';
import './SongList.css';

const SongList: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  if (loading) {
    return <div className="song-list">Loading songs...</div>;
  }

  return (
    <div className="song-list">
      {songs.map((song: Song) => (
        <div key={song.id} className="song-item">
          <h3>{song.title}</h3>
          <ReactAudioPlayer
            src={song.file_path}
            controls
          />
        </div>
      ))}
    </div>
  );
};

export default SongList;
