import React, { useState } from 'react';
import '../styles/SelectionPage.css';
import { useNavigate } from 'react-router-dom';

const SelectionPage = () => {
  const navigate = useNavigate();

  const [hovered, setHovered] = useState(null); // 'queueit' | 'spear' | null

  const handleSpearClick = () => {
    navigate('/landing');
  };

  const handleQueueitClick = () => {
    window.open('https://queueit39.netlify.app', '_blank', 'noopener,noreferrer');
  };

  let containerClass = 'selection-container';
  if (hovered === 'queueit') containerClass += ' queueit-hover';
  if (hovered === 'spear') containerClass += ' spear-hover';

  return (
    <div className={containerClass}>
      <div
        className="side-section queueit-section"
        onMouseEnter={() => setHovered('queueit')}
        onMouseLeave={() => setHovered(null)}
      >
        <h2 className="section-title">QueueIT</h2>
        <p className="section-description">Queue Management System</p>
        <button className="spear-btn" onClick={handleQueueitClick}>Enter Queueit</button>
      </div>
      <div className="center-divider" />
      <div
        className="side-section spear-section"
        onMouseEnter={() => setHovered('spear')}
        onMouseLeave={() => setHovered(null)}
      >
        <h2 className="section-title">CapstoneConnect</h2>
        <p className="section-description">Team Collaboration with Predictive Matching Platform</p>
        <button className="spear-btn" onClick={handleSpearClick}>Enter CapstoneConnect</button>
      </div>
    </div>
  );
};

export default SelectionPage;
