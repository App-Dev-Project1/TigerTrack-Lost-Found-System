// SolvedView.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from "../supabaseClient";
import './SolvedView.css';
import './ItemsView.css';

// Error/Warning Modal Component
const ErrorModal = ({ title, message, onClose }) => {
  return (
    <div className="solved-modal-overlay" onClick={onClose}>
      <div
        className="solved-modal-content error-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="error-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="48"
            height="48"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h3 className="error-title">{title}</h3>
        <p className="error-message">{message}</p>
        <button className="error-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

// Restore Success Modal Component
const RestoreSuccessModal = ({ item, destination, onClose }) => {
  return (
    <div className="solved-modal-overlay" onClick={onClose}> 
      <div
        className="solved-modal-content restore-success-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="restore-success-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 52 52"
            width="52"
            height="52"
            fill="none"
            stroke="#10b981"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="26" cy="26" r="25" />
            <path d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>
        <h3 className="restore-success-title">Success!</h3>
        <p className="restore-success-message">
          The item <strong className="highlight-text">{item}</strong> has been successfully restored back to the <strong className="highlight-text">{destination}</strong> tab.
        </p>
        <button className="restore-success-btn" onClick={onClose}>
          CLOSE
        </button>
      </div>
    </div>
  );
};

const SolvedView = ({ allResolvedItems, onMarkAsClaimed, onRestore }) => {
  const [activeTab, setActiveTab] = useState('solved');
  const [solvedItems, setSolvedItems] = useState([]);
  const [claimedItems, setClaimedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSolvedItem, setSelectedSolvedItem] = useState(null);

  // Restore-related states
  const [restoringId, setRestoringId] = useState(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [itemToRestore, setItemToRestore] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [restoredItemDetails, setRestoredItemDetails] = useState({ name: '', destination: '' });
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  // Restore functions
  const handleRestoreClick = (item, e) => {
    e.stopPropagation();
    setItemToRestore(item);
    setShowRestoreModal(true);
  };

  const handleConfirmRestore = async () => {
    if (!itemToRestore) return;

    const itemName = itemToRestore.name.trim();
    const destination = 'Lost Reports'; // Solved items go back to Lost Reports
    const originalItemToRestore = itemToRestore;

    try {
      setRestoringId(originalItemToRestore.id);
      setShowRestoreModal(false);

      // Call restore function for solved items
      const response = await supabase.rpc("restore_item_to_lost", {
        archive_id: Number(originalItemToRestore.lostId),
      });

      const { data, error } = response;

      if (error) {
        throw new Error(error.message);
      }

      if (data === true) {
        // Update local state
        setSolvedItems((prev) => prev.filter((i) => i.id !== originalItemToRestore.id));
        
        // Show success modal
        setRestoredItemDetails({ name: itemName, destination: destination });
        setShowSuccessModal(true); 

        // Notify parent to refresh
        if (onRestore) {
          onRestore();
        }
      } else {
        throw new Error("Restore returned false. Check database console logs.");
      }
    } catch (error) {
      console.error('Restore failed:', error);
      setErrorMessage(`Failed to restore item: ${error.message}`);
      setShowErrorModal(true);
    } finally {
      setRestoringId(null);
      setItemToRestore(null);
    }
  };

  const handleCancelRestore = () => {
    setShowRestoreModal(false);
    setItemToRestore(null);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage("");
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
                      <>
                        <button
                          className="claim-btn-solved"
                          onClick={() => handleMarkAsClaimed(item.id)}
                        >
                          Mark as Claimed
                        </button>
                        <button
                          className="restore-btn-solved"
                          onClick={(e) => handleRestoreClick(item, e)}
                          disabled={restoringId === item.id}
                        >
                          {restoringId === item.id ? "Restoring..." : "Restore"}
                        </button>
                      </>
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

      {/* Details Modal */}
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

      {/* ERROR MODAL */}
      {showErrorModal && (
        <ErrorModal
          title="Action Required"
          message={errorMessage}
          onClose={handleCloseErrorModal}
        />
      )}

      {/* RESTORE CONFIRMATION MODAL */}
      {showRestoreModal && itemToRestore && (
        <div className="solved-modal-overlay" onClick={handleCancelRestore}>
          <div
            className="solved-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '500px' }}
          >
            <div className="solved-modal-header">
              <h3>Confirm Restore</h3>
            </div>
            <div
              className="solved-modal-subtitle"
              style={{
                fontSize: '16px',
                lineHeight: '1.6',
                marginBottom: '23px',
                textAlign: 'center',
                color: '#000000'
              }}
            >
              Are you sure you want to restore <b>{itemToRestore.name.trim()}</b>?<br />
              This will move it back to active items.
            </div>

            <div className="solved-match-actions">
              <button className="solved-btn-cancel" onClick={handleCancelRestore}>
                Cancel
              </button>
              <button className="solved-btn-confirm" onClick={handleConfirmRestore}>
                Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESTORE SUCCESS MODAL */}
      {showSuccessModal && (
        <RestoreSuccessModal 
          item={restoredItemDetails.name} 
          destination={restoredItemDetails.destination} 
          onClose={handleCloseSuccessModal} 
        />
      )}
    </>
  );
};

export default SolvedView;