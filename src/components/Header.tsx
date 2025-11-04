import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <h1>Mx Martin</h1>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/listen">Listen</Link></li>
          <li><Link to="/video">Video</Link></li>
          <li><Link to="/photos">Photos</Link></li>
          <li><Link to="/lyrics">Lyrics</Link></li>
          <li><Link to="/store">Store</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
