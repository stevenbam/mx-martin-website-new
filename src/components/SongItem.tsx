import React from 'react';
import { Song } from '../types';
import './SongItem.css';

interface SongItemProps {
  song: Song;
}

const SongItem: React.FC<SongItemProps> = ({ song }) => {
  return (
    <div className="song-item">
      <h3>{song.title}</h3>
      <audio controls>
        <source src={song.file_path} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default SongItem;
