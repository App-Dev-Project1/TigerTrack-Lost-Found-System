import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tigerLogo from '../assets/tiger.png';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage-wrapper">
      <div className="glow-circle-top"></div>
      <div className="glow-circle-bottom"></div>

      <div className="homepage-container">
        <div className="homepage-header">
          <img src={tigerLogo} alt="TigerTrack Logo" />
          <h1>TigerTrack</h1>
          <p>UST-CICS Lost and Found System</p>
        </div>

        <div className="homepage-body">
          <h2>Welcome to TigerTrack</h2>
          <p>Lost something? Found an item? Let’s help each other bring them back to their owners.</p>

          <div className="card-grid">
            <div className="choice-card" onClick={() => navigate('/lost-item')}>
              <div className="choice-card-icon">🔍</div>
              <h3>I Lost an Item</h3>
              <p>Report a missing item</p>
            </div>

            <div className="choice-card" onClick={() => navigate('/found-item')}>
              <div className="choice-card-icon">✨</div>
              <h3>I Found an Item</h3>
              <p>Help someone by reporting it</p>
            </div>
          </div>

          <div className="admin-section">
            <div className="admin-icon">🔐</div>
            <h4>Tech Administrator Access</h4>
            <center>
            <p>Authorized personnel may log in</p>
            </center>
            <button onClick={() => navigate('/admin-login')} className="admin-btn">
              Admin Login
            </button>
          </div>
        </div>

        <div className="homepage-footer">
          © 2025 TigerTrack
        </div>
      </div>
    </div>
  );
};

export default HomePage;
