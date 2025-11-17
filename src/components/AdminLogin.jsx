// src/components/AdminLogin.jsx

import React, { useState } from 'react';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import tigerLogo from '../assets/tiger.png'; 
import cicsBuilding from '../assets/cics.png';
import './AdminLogin.css';
import { supabase } from '../supabaseClient';

const AdminLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);

    // ---------------------------------------------------------
    // LOGIC CHANGE: Automatically append the fake domain
    // User types: "admin" -> Supabase gets: "admin@tigertrack.com"
    // ---------------------------------------------------------
    const emailForSupabase = `${formData.username}@tigertrack.com`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailForSupabase,
      password: formData.password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 1500);
    }
  };

  return (
    <div className="admin-login-page">

      {showSuccess && (
        <div className="admin-success-popup">
          <svg xmlns="http://www.w3.org/2000/svg" className="admin-success-icon" viewBox="0 0 24 24" fill="none" stroke="#00b300" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <h3>Login Successful!</h3>
        </div>
      )}

      <button 
        className="admin-back-btn"
        onClick={() => navigate('/')}
      >
        ← Back
      </button>

      <div className="admin-login-left">
        <img src={tigerLogo} alt="TigerTrack Logo" className="admin-tiger-logo" />
        <h1 className="admin-welcome-text">TigerTrack</h1>
        <p className="admin-welcome-subtext">
          UST-CICS Lost & Found System<br/>
          Secure Administrator Portal
        </p>
      </div>

      <div className="cics-circle-container">
        <div className="cics-circle">
          <img 
            src={cicsBuilding} 
            alt="CICS Logo" 
            className="cics-building-img" 
          />
        </div>
      </div>

      <Card className="admin-login-card">
        <div className="admin-login-header">
          <h5 className="admin-login-heading">Administrator Access</h5>
          <p className="admin-login-text">Please log in with your admin credentials.</p>
        </div>

        <Card.Body className="admin-login-body">
          {error && (
            <Alert 
              variant="danger" 
              dismissible 
              onClose={() => setError('')} 
              className="admin-login-alert"
            >
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {/* USERNAME FIELD - Changed type to text */}
            <Form.Group className="mb-3">
              <Form.Label className="admin-login-label">Username</Form.Label>
              <Form.Control
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="admin-login-input"
                placeholder="Enter Username"
                disabled={loading}
                required
              />
            </Form.Group>

            {/* PASSWORD FIELD */}
            <Form.Group className="mb-4 admin-input-container">
              <Form.Label className="admin-login-label">Password</Form.Label>
              <div className="admin-input-wrapper">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="admin-login-input"
                  placeholder="Enter Password"
                  disabled={loading}
                  required
                />
                <span
                  className="admin-eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3-11-7 1.16-2.57 3.53-4.71 6.44-5.71"/>
                      <path d="M1 1l22 22"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </span>
              </div>
            </Form.Group>

            <Button 
              type="submit"
              className="admin-login-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Form>

          <div className="admin-login-note">
            <strong>Note:</strong><br />
            Only authorized admin username and password are allowed to access this page.
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminLogin;