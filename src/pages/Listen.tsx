import React from 'react';
import SongList from '../components/SongList';
import MusicMatrixBackground from '../components/MusicMatrixBackground';
import './Listen.css';

const Listen: React.FC = () => {
  return (
    <div className="listen">
      <MusicMatrixBackground />
      <h2>Listen to Our Music</h2>
      <SongList />
    </div>
  );
};

export default Listen;
