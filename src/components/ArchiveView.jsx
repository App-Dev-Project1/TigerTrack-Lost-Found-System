// src/components/ArchiveView.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./ArchiveView.css";

const ArchiveView = () => {
  const [archivedItems, setArchivedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("expired");
  const [restoringId, setRestoringId] = useState(null);

  // NEW STATES
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedForDonation, setSelectedForDonation] = useState([]);
  const [showDonationModal, setShowDonationModal] = useState(false);

  const fetchArchivedItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("archives")
        .select("*")
        .order("archived_at", { ascending: false });

      if (error) throw error;
      setArchivedItems(data || []);
    } catch (error) {
      console.error("Error fetching archives:", error);
      alert("Error loading archived items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedItems();
  }, []);

  const handleRestore = async (itemId, itemName) => {
    if (!window.confirm(`Are you sure you want to restore "${itemName}" to active items?`)) return;

    try {
      setRestoringId(itemId);

      const { data, error } = await supabase.rpc("restore_item_from_archive", {
        archive_id: itemId,
      });

      if (error) throw new Error(error.message);

      if (data === true) {
        setArchivedItems((prev) => prev.filter((item) => item.id !== itemId));

        alert(`"${itemName}" restored successfully!`);
        await fetchArchivedItems();

        window.dispatchEvent(
          new CustomEvent("itemsUpdated", {
            detail: { action: "restore", itemId, itemName },
          })
        );
      } else {
        throw new Error("Restore returned false");
      }
    } catch (error) {
      alert(`Failed to restore item: ${error.message}`);
      await fetchArchivedItems();
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

  // -----------------------------
  // NEW: Handle bulk donation mode
  // -----------------------------
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
      const { data, error } = await supabase.rpc("mark_items_for_donation", {
        item_ids: selectedForDonation,
      });

      if (error) throw error;

      alert("Items successfully marked for donation!");

      setShowDonationModal(false);
      setBulkMode(false);
      setSelectedForDonation([]);

      await fetchArchivedItems();
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
            <p>View archived items</p>
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

        {/* NEW DONATION TAB */}
        <button
          className={filter === "donate" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("donate")}
        >
          Donate ({archivedItems.filter((i) => i.archive_reason === "donate").length})
        </button>

      {/* NEW BULK MODE BUTTON */}
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

      </div>

     

      {/* Main Content */}
      <div className="activity-card">
        {loading ? (
          <div className="activity-empty">
            <div className="loading-spinner"></div>
            <p className="empty-subtitle">Loading archived items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="activity-empty">
            <div className="empty-icon">📁</div>
            <p className="empty-title">No archived items found</p>
            <p className="empty-subtitle">
              {filter === "expired"
                ? "Found items unclaimed for 1 year will appear here"
                : filter === "donate"
                ? "Items marked for donation will appear here"
                : "Lost items with no matches will appear here"}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="archive-table">
              <thead>
                <tr>
                  {bulkMode && <th>Select</th>}
                  <th>ID</th>
                  <th>ITEM NAME</th>
                  <th>CATEGORY</th>
                  <th>FLOOR</th>
                  <th>LOCATION</th>
                  <th>ORIGINAL DATE</th>
                  <th>ARCHIVE DATE</th>
                  <th>REASON</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    {bulkMode && (
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
                    <td>{formatDate(item.archived_at)}</td>
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
                          ? "For Donation"
                          : "Unsolved"}
                      </span>
                    </td>

                    <td>
                      <button
                        className="restore-btn"
                        onClick={() => handleRestore(item.id, item.name)}
                        disabled={restoringId === item.id || bulkMode}
                      >
                        {restoringId === item.id ? "Restoring..." : "Restore"}
                      </button>
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
              Are you sure you want to mark <strong>{selectedForDonation.length}</strong> item(s) for donation?
            </p>

            <div className="donation-modal-actions">
              <button
                className="donation-modal-cancel"
                onClick={() => setShowDonationModal(false)}
              >
                Cancel
              </button>

              <button className="donation-modal-confirm" onClick={processDonation}>
                Yes, Donate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ArchiveView;
