import React from 'react';
import './Home.css';
import MusicMatrixBackground from '../components/MusicMatrixBackground';

const Home: React.FC = () => {
  return (
    <div className="home">
      <MusicMatrixBackground />
      <h2>Welcome to Mx Martin's Official Website</h2>
      <p>Explore our music and merchandise</p>
    </div>
  );
};

export default Home;
