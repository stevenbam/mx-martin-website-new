import React, { useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Home from './pages/Home';
import Listen from './pages/Listen';
import StorePage from './pages/StorePage';
import Video from './pages/Video';
import Photos from './pages/Photos';
import Lyrics from './pages/Lyrics';
import './transitions.css';

const Main: React.FC = () => {
  const location = useLocation();
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <TransitionGroup>
      <CSSTransition
        key={location.key}
        classNames="page"
        timeout={300}
        nodeRef={nodeRef}
      >
        <div ref={nodeRef}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/listen" element={<Listen />} />
            <Route path="/video" element={<Video />} />
            <Route path="/photos" element={<Photos />} />
            <Route path="/lyrics" element={<Lyrics />} />
            <Route path="/store" element={<StorePage />} />
          </Routes>
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
};

export default Main;
