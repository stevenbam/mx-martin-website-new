import React from 'react';
import './Home.css';
import MusicMatrixBackground from '../components/MusicMatrixBackground';

const Home: React.FC = () => {
  return (
    <div className="home">
      <MusicMatrixBackground />
      <h2>Welcome to the Mx Martin Official Website</h2>
      <p>Join us on our musical journey</p>
    </div>
  );
};

export default Home;
