import React, { useState, useEffect } from 'react';
import './Apps.css';

const Apps: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  // Password for the Apps page (same as admin password)
  const APPS_PASSWORD = 'mxmartin2024';

  useEffect(() => {
    // Check if user is already authenticated (stored in session)
    const auth = sessionStorage.getItem('appsAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password === APPS_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('appsAuthenticated', 'true');
      setError('');
      setPassword('');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('appsAuthenticated');
    setSelectedApp(null);
  };

  const apps = [
    {
      id: 'audio-to-sheet',
      name: 'Audio to Sheet Music',
      description: 'Convert audio files or live recordings into sheet music and guitar/bass tabs',
      icon: '🎵',
      color: '#667eea'
    }
    // Add more apps here in the future
  ];

  if (!isAuthenticated) {
    return (
      <div className="apps-page">
        <div className="password-container">
          <div className="password-card">
            <div className="lock-icon">🔐</div>
            <h2>Apps Access</h2>
            <p>Enter password to access applications</p>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="password-input"
                autoFocus
              />
              {error && <p className="error-message">{error}</p>}
              <button type="submit" className="submit-btn">
                Unlock Apps
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (selectedApp) {
    return (
      <div className="apps-page">
        <div className="app-header">
          <button className="back-btn" onClick={() => setSelectedApp(null)}>
            ← Back to Apps
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            🔒 Logout
          </button>
        </div>
        <div className="app-container">
          {selectedApp === 'audio-to-sheet' && (
            <iframe
              src="/apps/audio-to-sheet-music/index.html"
              title="Audio to Sheet Music"
              className="app-iframe"
              sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-downloads"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="apps-page">
      <div className="apps-header">
        <h1>Applications</h1>
        <button className="logout-btn" onClick={handleLogout}>
          🔒 Logout
        </button>
      </div>
      <div className="apps-grid">
        {apps.map((app) => (
          <div
            key={app.id}
            className="app-card"
            onClick={() => setSelectedApp(app.id)}
            style={{ borderColor: app.color }}
          >
            <div className="app-icon" style={{ color: app.color }}>
              {app.icon}
            </div>
            <h3>{app.name}</h3>
            <p>{app.description}</p>
            <button className="launch-btn" style={{ background: app.color }}>
              Launch App
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Apps;
