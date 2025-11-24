// src/components/ArchiveView.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./ArchiveView.css";

// Error/Warning Modal Component (NEW)
const ErrorModal = ({ title, message, onClose }) => {
  return (
    <div className="archive-modal-overlay" onClick={onClose}>
      <div
        className="archive-modal-content error-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="error-icon">
          {/* SVG Warning Icon (Exclamation mark in a triangle/circle) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="48"
            height="48"
            fill="none"
            stroke="#f59e0b" /* Amber/Yellow color */
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


// Donation Success Modal Component (EXISTING)
const DonationSuccessModal = ({ count, onClose }) => {
  return (
    <div className="archive-modal-overlay" onClick={onClose}> 
      <div
        className="archive-modal-content donation-success-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="donation-success-icon">
          {/* SVG Checkmark icon */}
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
        <h3 className="donation-success-title">Success!</h3>
        <p className="donation-success-message">
          <strong className="highlight-text">{count} item(s)</strong> successfully moved to the <strong className="highlight-text">Donation</strong> list.
        </p>
        <button className="donation-success-btn" onClick={onClose}>
          CLOSE
        </button>
      </div>
    </div>
  );
};


// Restore Success Modal Component (EXISTING)
const RestoreSuccessModal = ({ item, destination, onClose }) => {
  return (
    <div className="archive-modal-overlay" onClick={onClose}> 
      <div
        className="archive-modal-content restore-success-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="restore-success-icon">
          {/* SVG Checkmark icon */}
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


const ArchiveView = ({ onRestore }) => {
  const [archivedItems, setArchivedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("expired");
  const [restoringId, setRestoringId] = useState(null);

  // Bulk Mode States
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedForDonation, setSelectedForDonation] = useState([]);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showDonationSuccessModal, setShowDonationSuccessModal] = useState(false);
  const [donatedItemCount, setDonatedItemCount] = useState(0);

  // Error/Warning State (NEW)
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Restore Confirmation Modal States
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [itemToRestore, setItemToRestore] = useState(null);
  
  // Restore Success Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [restoredItemDetails, setRestoredItemDetails] = useState({ name: '', destination: '' });


  // Fetching and utility functions remain the same
  const fetchAllItems = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Archives (Unsolved & Overdue)
      const { data: archivesData, error: archivesError } = await supabase
        .from("archives")
        .select("*")
        .order("archived_at", { ascending: false });

      if (archivesError) throw archivesError;

      // 2. Fetch Donations
      const { data: donationsData, error: donationsError } = await supabase
        .from("donations")
        .select("*")
        .order("donated_at", { ascending: false });

      if (donationsError) throw donationsError;

      // 3. Format and Combine
      const formattedArchives = (archivesData || []).map(item => ({
        ...item,
        sourceType: 'archive',
        displayDate: item.archived_at
      }));

      const formattedDonations = (donationsData || []).map(item => ({
        ...item,
        sourceType: 'donation',
        archive_reason: 'donate',
        displayDate: item.donated_at
      }));

      setArchivedItems([...formattedArchives, ...formattedDonations]);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Using custom modal for generic errors too now
      setErrorMessage("Error loading items: " + error.message);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllItems();
  }, []);

  const handleRestoreClick = (item, e) => {
    e.stopPropagation();
    setItemToRestore(item);
    setShowRestoreModal(true);
  };

  const handleConfirmRestore = async () => {
    if (!itemToRestore) return;

    // Capture details before state changes
    const itemName = itemToRestore.name.trim();
    // Determine the destination based on archive reason for the message
    const destination = itemToRestore.archive_reason === 'expired' ? 'Found Items' : 'Lost Reports';
    const originalItemToRestore = itemToRestore;

    try {
      setRestoringId(originalItemToRestore.id);
      setShowRestoreModal(false);

      let data, error;

      // Determine where to restore based on archive_reason
      if (originalItemToRestore.archive_reason === 'expired') {
        const response = await supabase.rpc("restore_item_to_found", {
          archive_id: Number(originalItemToRestore.id),
        });
        data = response.data;
        error = response.error;
      } else if (originalItemToRestore.archive_reason === 'unsolved') {
        const response = await supabase.rpc("restore_item_to_lost", {
          archive_id: Number(originalItemToRestore.id),
        });
        data = response.data;
        error = response.error;
      } else {
        throw new Error("Unknown archive reason");
      }

      if (error) {
        throw new Error(error.message);
      }

      if (data === true) {
        // 1. Optimistic Update: Remove from the UI immediately
        setArchivedItems((prev) => prev.filter((i) => i.id !== originalItemToRestore.id || i.sourceType !== originalItemToRestore.sourceType));
        
        // 2. Show Success Modal with determined destination
        setRestoredItemDetails({ name: itemName, destination: destination });
        setShowSuccessModal(true); 

        // 3. Notify AdminDashboard to refresh the main Items list
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
      await fetchAllItems();
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
  
  const handleCloseDonationSuccessModal = () => {
    setShowDonationSuccessModal(false);
  };
  
  const handleCloseErrorModal = () => { // NEW function
    setShowErrorModal(false);
    setErrorMessage("");
  };

  const filteredItems = archivedItems.filter(
    (item) => filter === "all" || item.archive_reason === filter
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US");
    } catch {
      return "Invalid Date";
    }
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (timeString) {
        const [hours, minutes] = timeString.split(":");
        date.setHours(parseInt(hours), parseInt(minutes));
      }
      return date.toLocaleString("en-US");
    } catch {
      return "Invalid Date";
    }
  };

  // Bulk Donation Logic
  const toggleBulkMode = () => {
    setBulkMode(!bulkMode);
    setSelectedForDonation([]);
  };

  const toggleSelectItem = (id) => {
    setSelectedForDonation((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const confirmDonation = () => {
    if (selectedForDonation.length === 0) {
      // Show the new custom ErrorModal instead of alert()
      setErrorMessage("Please select at least one item to donate.");
      setShowErrorModal(true);
      return;
    }
    setShowDonationModal(true);
  };

  const processDonation = async () => {
    const donationCount = selectedForDonation.length; // Capture count before clearing
    try {
      // 1. Close confirmation modal
      setShowDonationModal(false);

      // 2. Perform the database RPC call
      const { error } = await supabase.rpc("mark_items_for_donation", {
        item_ids: selectedForDonation,
      });

      if (error) throw error;

      // 3. Update state for success
      setDonatedItemCount(donationCount);
      setShowDonationSuccessModal(true); // Show the new success modal

      // 4. Reset UI state
      setBulkMode(false);
      setSelectedForDonation([]);

      // 5. Refresh the list to show items in the 'Donated' tab
      await fetchAllItems();
    } catch (error) {
      // Use the custom error modal for failure
      setErrorMessage("Donation process failed: " + error.message);
      setShowErrorModal(true);
      
      // Reset state in case of failure
      setBulkMode(false);
      setSelectedForDonation([]);
    }
  };


  return (
    <div className="archive-container">
      {/* Header */}
      <div className="archive-header">
        <div className="archive-title-wrapper">
          <div>
            <h2>Archive</h2>
            <p>View archived and donated items</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={filter === "expired" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("expired")}
        >
          Overdue ({archivedItems.filter((i) => i.archive_reason === "expired").length})
        </button>

        <button
          className={filter === "unsolved" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("unsolved")}
        >
          Unsolved ({archivedItems.filter((i) => i.archive_reason === "unsolved").length})
        </button>

        <button
          className={filter === "donate" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("donate")}
        >
          Donated ({archivedItems.filter((i) => i.archive_reason === "donate").length})
        </button>

        {/* Bulk controls are now only displayed for the 'expired' (Overdue) tab */}
        {filter === "expired" && ( 
          <div className="bulk-controls">
            <button className="donation-bulk-btn" onClick={toggleBulkMode}>
              {bulkMode ? "Cancel Selection" : "Select Items for Donation"}
            </button>

            {bulkMode && (
              <button className="confirm-donation-btn" onClick={confirmDonation}>
                Confirm Donation ({selectedForDonation.length})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="activity-card">
        {loading ? (
          <div className="activity-empty">
            <div className="loading-spinner"></div>
            <p className="empty-subtitle">Loading items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="activity-empty">
            <div className="empty-icon">📁</div>
            <p className="empty-title">No items found</p>
            <p className="empty-subtitle">
              {filter === "donate"
                ? "Items moved to donation will appear here"
                : "Items archived will appear here"}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="archive-table">
              <thead>
                <tr>
                  {bulkMode && filter !== "donate" && <th>Select</th>}
                  <th>ID</th>
                  <th>ITEM NAME</th>
                  <th>CATEGORY</th>
                  <th>FLOOR</th>
                  <th>LOCATION</th>
                  <th>ORIGINAL DATE</th>
                  <th>{filter === "donate" ? "DONATED DATE" : "ARCHIVE DATE"}</th>
                  <th>STATUS</th>
                  
                  {/* ACTIONS COLUMN: Conditionally rendered */}
                  {filter !== 'donate' && <th>ACTIONS</th>} 
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    {bulkMode && filter !== "donate" && (
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedForDonation.includes(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                        />
                      </td>
                    )}

                    <td>{item.original_id || item.id}</td>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.category}</td>
                    <td>{item.floor}</td>
                    <td>{item.location}</td>
                    <td>{formatDateTime(item.item_date, item.item_time)}</td>
                    <td>{formatDate(item.displayDate)}</td>
                    <td>
                      <span
                        className={`reason-plain ${
                          item.archive_reason === "expired"
                            ? "reason-expired"
                            : item.archive_reason === "donate"
                            ? "reason-donate"
                            : "reason-unsolved"
                        }`}
                      >
                        {item.archive_reason === "expired"
                          ? "Overdue"
                          : item.archive_reason === "donate"
                          ? "Donated"
                          : "Unsolved"}
                      </span>
                    </td>

                    {/* ACTIONS COLUMN: Conditionally rendered */}
                    {filter !== 'donate' && (
                      <td>
                        {item.sourceType === 'archive' && (
                          <button
                            className="restore-btn"
                            onClick={(e) => handleRestoreClick(item, e)}
                            disabled={restoringId === item.id || bulkMode}
                          >
                            {restoringId === item.id ? "Restoring..." : "Restore"}
                          </button>
                        )}
                        {item.sourceType === 'donation' && (
                          <span className="no-action-text">Donated</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DONATION CONFIRMATION MODAL */}
      {showDonationModal && (
        <div className="donation-modal-overlay">
          <div className="donation-modal">
            <h3>Confirm Donation</h3>
            <p>
              Move <strong>{selectedForDonation.length}</strong> item(s) to the Donation list?
            </p>

            <div className="donation-modal-actions">
              <button
                className="donation-modal-cancel"
                onClick={() => setShowDonationModal(false)}
              >
                Cancel
              </button>

              <button className="donation-modal-confirm" onClick={processDonation}>
                Yes, Move
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* DONATION SUCCESS MODAL */}
      {showDonationSuccessModal && (
        <DonationSuccessModal 
          count={donatedItemCount} 
          onClose={handleCloseDonationSuccessModal} 
        />
      )}
      
      {/* NEW: ERROR/WARNING MODAL */}
      {showErrorModal && (
        <ErrorModal
          title="Action Required"
          message={errorMessage}
          onClose={handleCloseErrorModal}
        />
      )}

      {/* RESTORE CONFIRMATION MODAL (Scoped Classes) */}
      {showRestoreModal && itemToRestore && (
        <div className="archive-modal-overlay" onClick={handleCancelRestore}>
          <div
            className="archive-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '500px' }}
          >
            <div className="archive-modal-header">
              <h3>Confirm Restore</h3>
            </div>
            <div
              className="archive-modal-subtitle"
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

            <div className="archive-match-actions">
              <button className="archive-btn-cancel" onClick={handleCancelRestore}>
                Cancel
              </button>
              <button className="archive-btn-confirm" onClick={handleConfirmRestore}>
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
    </div>
  );
};

export default ArchiveView;