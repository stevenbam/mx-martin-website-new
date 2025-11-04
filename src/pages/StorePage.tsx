import React from 'react';
import Store from '../components/Store';
import MusicMatrixBackground from '../components/MusicMatrixBackground';
import './StorePage.css';

const StorePage: React.FC = () => {
  return (
    <div className="store-page">
      <MusicMatrixBackground />
      <h2>Merchandise Store</h2>
      <Store />
    </div>
  );
};

export default StorePage;
