import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const DashboardView = () => {
  const [stats, setStats] = useState({
    totalItems: 42,
    pending: 30,
    resolved: 12
  });

  useEffect(() => {
    // TODO: Fetch statistics from API
  }, []);

  return (
    <div className="dashboard-view"> {/* ✅ wrapper keeps layout inside AdminDashboard */}
      <h1>Welcome, Admin</h1>
      <p className="dashboard-subtitle">Manage your lost and found items</p>

      {/* ✅ horizontal container */}
      <div className="dashboard-stats-container">
        <div className="stat-card total">
          <div className="stat-icon">📦</div>
          <h3>{stats.totalItems}</h3>
          <p>Total Items</p>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <h3>{stats.pending}</h3>
          <p>Pending</p>
        </div>

        <div className="stat-card resolved">
          <div className="stat-icon">✅</div>
          <h3>{stats.resolved}</h3>
          <p>Resolved</p>
        </div>
      </div>

      <div className="recent-activity-box">
        <h5>Recent Activity</h5>
        <p>
          <a href="#">View all items in the Items section</a>
        </p>
      </div>
    </div>
  );
};

export default DashboardView;
