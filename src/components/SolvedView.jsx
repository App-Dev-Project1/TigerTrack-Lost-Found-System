// SolvedView.jsx
import React, { useState, useEffect } from 'react';
import './SolvedView.css';

const SolvedView = ({ allResolvedItems, onMarkAsClaimed }) => {
  const [activeTab, setActiveTab] = useState('solved');
  const [solvedItems, setSolvedItems] = useState([]);
  const [claimedItems, setClaimedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Effect to separate solved (not claimed) and claimed items 
  useEffect(() => {
    setLoading(true);
    // Filter the incoming master list into the two display lists
    const solved = allResolvedItems.filter(item => !item.isClaimed);
    const claimed = allResolvedItems.filter(item => item.isClaimed);

    setSolvedItems(solved);
    setClaimedItems(claimed);
    setLoading(false);
  }, [allResolvedItems]); 

  const handleMarkAsClaimed = (itemId) => {
    // Calls the handler function passed from AdminDashboard to update the master state
    if (onMarkAsClaimed) {
        onMarkAsClaimed(itemId);
    }
  };

  const handleViewDetails = (itemId) => {
    console.log('Viewing details for item:', itemId);
  };

  const renderTable = (items, type) => {
    if (loading) {
      return (
        <div className="activity-empty">
          <p>Loading items...</p>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="activity-empty">
          <div className="empty-icon">✅</div>
          <p>No {type} items yet</p>
          <p>Matched items will appear here</p>
        </div>
      );
    }

    return (
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              {/* Note: The header ID represents the Lost Report ID */}
              <th>Lost Item ID</th> 
              <th>Item Name</th>
              <th>Category</th>
              <th>Reported By (Lost)</th>
              <th>{type === 'solved' ? 'Resolved Date' : 'Claimed Date'}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                {/* --- MODIFICATION HERE: Display item.lostId instead of item.id --- */}
                <td>{item.lostId}</td>
                {/* ------------------------------------------------------------------ */}
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.claimedBy}</td> 
                <td>{type === 'solved' ? item.resolvedDate : item.claimedDate}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-info"
                      onClick={() => handleViewDetails(item.id)}
                    >
                      View Details
                    </button>
                    {type === 'solved' && (
                      <button 
                        className="btn-claimed"
                        onClick={() => handleMarkAsClaimed(item.id)}
                      >
                        Mark as Claimed
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <div className="content-header">
        <h2>Solved Items</h2>
        <p>View all matched and claimed items</p>
      </div>

      <div className="activity-card">
        <div className="tab-buttons">
          <button
            className={activeTab === 'solved' ? 'active' : ''}
            onClick={() => setActiveTab('solved')}
          >
            Solved Items
          </button>
          <button
            className={activeTab === 'claimed' ? 'active' : ''}
            onClick={() => setActiveTab('claimed')}
          >
            Claimed Items
          </button>
        </div>

        {activeTab === 'solved'
          ? renderTable(solvedItems, 'solved')
          : renderTable(claimedItems, 'claimed')}
      </div>
    </>
  );
};

export default SolvedView;