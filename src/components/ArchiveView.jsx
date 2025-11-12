import React, { useState, useEffect } from "react";
import "./ArchiveView.css";

const ArchiveView = () => {
  const [archivedItems, setArchivedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchArchivedItems();
  }, []);

  const fetchArchivedItems = async () => {
    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch("/api/archived-items");
      const data = await response.json();
      setArchivedItems(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching archived items:", error);
      setLoading(false);
    }
  };

  const handleRestore = async (itemId) => {
    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch(`/api/archived-items/${itemId}/restore`, {
        method: "POST",
      });

      if (response.ok) {
        // Remove item from local state
        setArchivedItems(archivedItems.filter((item) => item.id !== itemId));
        alert("Item restored successfully!");
      } else {
        alert("Failed to restore item");
      }
    } catch (error) {
      console.error("Error restoring item:", error);
      alert("Error restoring item");
    }
  };

  const filteredItems = archivedItems.filter((item) => {
    if (filter === "all") return true;
    if (filter === "expired") return item.archiveReason === "expired";
    if (filter === "removed") return item.archiveReason === "removed";
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      {/* ===== HEADER ===== */}
      <div className="archive-header">
        <div className="archive-title-wrapper">
          <div className="archive-icon">
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2>Archive</h2>
        </div>
        <p>View archived items</p>
      </div>

      {/* ===== FILTER TABS ===== */}
      <div className="filter-tabs">
        <button
          className={filter === "all" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={filter === "expired" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("expired")}
        >
          Expired
        </button>
        <button
          className={filter === "removed" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("removed")}
        >
          Removed
        </button>
      </div>

      {/* ===== MAIN CONTAINER ===== */}
      <div className="activity-card">
        {loading ? (
          <div className="activity-empty">
            <div className="loading-spinner"></div>
            <p className="empty-subtitle">Loading archived items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="activity-empty">
            <svg 
              width="80" 
              height="80" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#94a3b8" 
              strokeWidth="1.5"
              className="empty-icon"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            <p className="empty-title">No archived items yet</p>
            <p className="empty-subtitle">
              Items unclaimed for 1 year will automatically appear here
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="archive-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Date Found</th>
                  <th>Archive Date</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>
                      <span className="category-badge">{item.category}</span>
                    </td>
                    <td>{formatDate(item.dateFound)}</td>
                    <td>{formatDate(item.archiveDate)}</td>
                    <td>
                      <span className="reason-text">
                        {item.archiveReason === "expired"
                          ? "Unclaimed for 1 year"
                          : "Removed by admin"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="restore-btn"
                        onClick={() => handleRestore(item.id)}
                      >
                        Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ArchiveView;