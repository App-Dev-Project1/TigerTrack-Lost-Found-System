// src/components/ArchiveView.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./ArchiveView.css";

const ArchiveView = ({ onRestore }) => {
  const [archivedItems, setArchivedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("expired");
  const [restoringId, setRestoringId] = useState(null);

  // NEW STATES
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedForDonation, setSelectedForDonation] = useState([]);
  const [showDonationModal, setShowDonationModal] = useState(false);

  // Fetch from BOTH 'archives' and 'donations' tables
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
      alert("Error loading items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllItems();
  }, []);

  const handleRestore = async (item) => {
    if (!window.confirm(`Are you sure you want to restore "${item.name}" to active items?`)) return;

    try {
      setRestoringId(item.id);

      console.log('Restoring item:', item);

      let data, error;

      // Determine where to restore based on archive_reason
      if (item.archive_reason === 'expired') {
        // Overdue items (from found_items) go back to found_items
        const response = await supabase.rpc("restore_item_to_found", {
          archive_id: Number(item.id),
        });
        data = response.data;
        error = response.error;
      } else if (item.archive_reason === 'unsolved') {
        // Unsolved items (from lost_items) go back to lost_items
        const response = await supabase.rpc("restore_item_to_lost", {
          archive_id: Number(item.id),
        });
        data = response.data;
        error = response.error;
      } else {
        throw new Error("Unknown archive reason");
      }

      console.log('Restore response:', { data, error });

      if (error) {
        console.error('Restore error details:', error);
        throw new Error(error.message);
      }

      if (data === true) {
        // 1. Optimistic Update: Remove from the UI immediately
        setArchivedItems((prev) => prev.filter((i) => i.id !== item.id || i.sourceType !== item.sourceType));
        
        const destination = item.archive_reason === 'expired' ? 'Found Items' : 'Lost Reports';
        alert(`"${item.name}" restored successfully to ${destination}!`);

        // 2. Notify AdminDashboard to refresh the main Items list
        if (onRestore) {
          console.log('Calling onRestore callback to refresh items list');
          onRestore();
        }

      } else {
        throw new Error("Restore returned false. Check database console logs.");
      }
    } catch (error) {
      console.error('Restore failed:', error);
      alert(`Failed to restore item: ${error.message}`);
      // If failed, reload to show the item again
      await fetchAllItems();
    } finally {
      setRestoringId(null);
    }
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
      alert("Please select at least one item to donate.");
      return;
    }
    setShowDonationModal(true);
  };

  const processDonation = async () => {
    try {
      const { error } = await supabase.rpc("mark_items_for_donation", {
        item_ids: selectedForDonation,
      });

      if (error) throw error;

      alert("Items successfully moved to Donation list!");

      setShowDonationModal(false);
      setBulkMode(false);
      setSelectedForDonation([]);

      await fetchAllItems();
    } catch (error) {
      alert("Donation process failed: " + error.message);
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

        {/* Hide bulk controls if we are already in the Donate tab */}
        {filter !== "donate" && (
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
                  <th>ACTIONS</th>
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

                    <td>
                      {/* ONLY show restore button for archive items, NOT donations */}
                      {item.sourceType === 'archive' && (
                        <button
                          className="restore-btn"
                          onClick={() => handleRestore(item)}
                          disabled={restoringId === item.id || bulkMode}
                        >
                          {restoringId === item.id ? "Restoring..." : "Restore"}
                        </button>
                      )}
                      {/* For donated items, show nothing or a message */}
                      {item.sourceType === 'donation' && (
                        <span className="no-action-text">Donated</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DONATION MODAL */}
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
    </div>
  );
};

export default ArchiveView;