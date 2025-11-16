// SolvedView.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './SolvedView.css';
import './ItemsView.css';

const SolvedView = ({ allResolvedItems, onMarkAsClaimed }) => {
  const [activeTab, setActiveTab] = useState('solved');
  const [solvedItems, setSolvedItems] = useState([]);
  const [claimedItems, setClaimedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSolvedItem, setSelectedSolvedItem] = useState(null);

  useEffect(() => {
    setLoading(true);
    const solved = allResolvedItems.filter(item => !item.isClaimed);
    const claimed = allResolvedItems.filter(item => item.isClaimed);

    setSolvedItems(solved);
    setClaimedItems(claimed);
    setLoading(false);
  }, [allResolvedItems]);

  const handleMarkAsClaimed = (itemId) => {
    if (onMarkAsClaimed) {
      onMarkAsClaimed(itemId);
    }
  };

  const handleViewDetails = (item) => {
    setSelectedSolvedItem(item);
    setShowDetailsModal(true);
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
                <td className="item-id-cell">{item.lostId}</td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.claimedBy}</td>
                <td>{type === 'solved' ? item.resolvedDate : item.claimedDate}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="view-btn-solved"
                      onClick={() => handleViewDetails(item)}
                    >
                      View
                    </button>
                    {type === 'solved' ? (
                      <button
                        className="claim-btn-solved"
                        onClick={() => handleMarkAsClaimed(item.id)}
                      >
                        Mark as Claimed
                      </button>
                    ) : (
                      <button
                        className="dispute-btn"
                        onClick={() => console.log("Mark dispute:", item.id)}
                      >
                        Mark Dispute
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

      {showDetailsModal && selectedSolvedItem && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content modal-content-match" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Solved Item Details</h3>
                <p className="modal-subtitle">Review the details for this matched item.</p>
              </div>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="match-comparison">
              <div className="match-card match-card-lost">
                <div className="match-card-header">
                  <span className="status-dot status-dot-lost"></span>
                  <h4>Lost Report Details</h4>
                </div>
                <div className="match-details">
                  <div className="match-row">
                    <div className="match-field">
                      <label>Item Name</label>
                      <p>{selectedSolvedItem.lost_details?.name || 'N/A'}</p>
                    </div>
                    <div className="match-field">
                      <label>Category</label>
                      <p>{selectedSolvedItem.lost_details?.category || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="match-row">
                    <div className="match-field">
                      <label>Owner Name</label>
                      <p>{selectedSolvedItem.lost_details?.ownerName || 'N/A'}</p>
                    </div>
                    <div className="match-field">
                      <label>Occupation</label>
                      <p>{selectedSolvedItem.lost_details?.occupation || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="match-row">
                    <div className="match-field">
                      <label>Location</label>
                      <p>{selectedSolvedItem.lost_details?.location || 'N/A'}</p>
                    </div>
                    <div className="match-field">
                      <label>Date Lost</label>
                      <p>{selectedSolvedItem.lost_details?.date || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="match-row">
                    <div className="match-field">
                      <label>Contact Email</label>
                      <p>{selectedSolvedItem.lost_details?.email || 'N/A'}</p>
                    </div>
                    <div className="match-field">
                      <label>Contact Number</label>
                      <p>{selectedSolvedItem.lost_details?.contactNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="match-card match-card-found">
                <div className="match-card-header">
                  <span className="status-dot status-dot-found"></span>
                  <h4>Found Item Details</h4>
                </div>
                <div className="match-details">
                  <div className="match-row">
                    <div className="match-field">
                      <label>Item Name</label>
                      <p>{selectedSolvedItem.found_details?.name || 'N/A'}</p>
                    </div>
                    <div className="match-field">
                      <label>Category</label>
                      <p>{selectedSolvedItem.found_details?.category || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="match-row">
                    <div className="match-field">
                      <label>Finder Name</label>
                      <p>{selectedSolvedItem.found_details?.finderName || 'N/A'}</p>
                    </div>
                    <div className="match-field">
                      <label>Occupation</label>
                      <p>{selectedSolvedItem.found_details?.occupation || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="match-row">
                    <div className="match-field">
                      <label>Location</label>
                      <p>{selectedSolvedItem.found_details?.location || 'N/A'}</p>
                    </div>
                    <div className="match-field">
                      <label>Date Found</label>
                      <p>{selectedSolvedItem.found_details?.date || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="match-row">
                    <div className="match-field">
                      <label>Contact Email</label>
                      <p>{selectedSolvedItem.found_details?.email || 'N/A'}</p>
                    </div>
                    <div className="match-field">
                      <label>Contact Number</label>
                      <p>{selectedSolvedItem.found_details?.contactNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                {selectedSolvedItem.found_details?.photo && (
                  <div className="match-photo">
                    <img src={selectedSolvedItem.found_details.photo} alt={selectedSolvedItem.found_details.name} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SolvedView;