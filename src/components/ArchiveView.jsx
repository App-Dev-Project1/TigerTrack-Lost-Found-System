// src/components/ArchiveView.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./ArchiveView.css";

const ArchiveView = () => {
  const [archivedItems, setArchivedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("expired");
  const [restoringId, setRestoringId] = useState(null);

  const fetchArchivedItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('archives')
        .select('*')
        .order('archived_at', { ascending: false });

      if (error) throw error;
      setArchivedItems(data || []);
    } catch (error) {
      console.error('Error fetching archives:', error);
      alert('Error loading archived items');
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
      console.log('Starting restore for:', itemId, itemName);

      const { data, error } = await supabase.rpc('restore_item_from_archive', {
        archive_id: itemId
      });

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Restore result:', data);

      if (data === true) {
        // IMMEDIATELY remove from UI
        setArchivedItems(prev => prev.filter(item => item.id !== itemId));
        
        // Show success
        alert(`"${itemName}" restored successfully! It will now appear in the Items tab.`);
        
        // Double-check by refreshing
        await fetchArchivedItems();
        
        // Notify ItemsView to refresh
        window.dispatchEvent(new CustomEvent('itemsUpdated', { 
          detail: { 
            action: 'restore', 
            itemId: itemId,
            itemName: itemName
          } 
        }));
        
        console.log('Restore completed successfully');

      } else {
        throw new Error('Restore failed - function returned false');
      }

    } catch (error) {
      console.error('Restore failed:', error);
      alert(`Failed to restore item: ${error.message}`);
      // Refresh to ensure UI is consistent
      await fetchArchivedItems();
    } finally {
      setRestoringId(null);
    }
  };

  const filteredItems = archivedItems.filter((item) => 
    filter === "all" || item.archive_reason === filter
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString("en-US");
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (timeString) {
        const [hours, minutes] = timeString.split(':');
        date.setHours(parseInt(hours), parseInt(minutes));
      }
      return date.toLocaleString("en-US");
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="archive-container">
      {/* Header - Made larger like Solved Items */}
      <div className="archive-header">
        <div className="archive-title-wrapper">
          <h1>Archive</h1>
          <p className="archive-subtitle">View archived items - {archivedItems.length} total</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={filter === "expired" ? "filter-btn active" : "filter-btn"} 
          onClick={() => setFilter("expired")}
        >
          Expired ({archivedItems.filter(i => i.archive_reason === 'expired').length})
        </button>
        <button 
          className={filter === "unsolved" ? "filter-btn active" : "filter-btn"} 
          onClick={() => setFilter("unsolved")}
        >
          Unsolved ({archivedItems.filter(i => i.archive_reason === 'unsolved').length})
        </button>
        <button 
          className={filter === "all" ? "filter-btn active" : "filter-btn"} 
          onClick={() => setFilter("all")}
        >
          All Items ({archivedItems.length})
        </button>
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
                : "Lost items with no matches will appear here"}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="archive-table">
              <thead>
                <tr>
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
                  <tr key={item.id} className={restoringId === item.id ? 'restoring-row' : ''}>
                    <td>{item.original_id || item.id}</td>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.category}</td>
                    <td>{item.floor}</td>
                    <td>{item.location}</td>
                    <td>{formatDateTime(item.item_date, item.item_time)}</td>
                    <td>{formatDate(item.archived_at)}</td>
                    <td>
                      <span className={`reason-plain ${item.archive_reason === 'expired' ? 'reason-expired' : 'reason-unsolved'}`}>
                        {item.archive_reason === "expired" ? "Expired" : "Unsolved"}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="restore-btn"
                        onClick={() => handleRestore(item.id, item.name)}
                        disabled={restoringId === item.id}
                        title={`Restore ${item.name} to active items`}
                      >
                        {restoringId === item.id ? 'Restoring...' : 'Restore'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchiveView;