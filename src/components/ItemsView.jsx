// ItemsView.jsx
import React, { useState, useEffect } from "react";
import {
  Package,
  Download,
  Search,
  ChevronUp,
  ChevronDown,
  Eye,
  X,
  Trash2,
} from "lucide-react";
import "./ItemsView.css";

const ItemsView = ({
  initialLostItems,
  initialFoundItems,
  onMatchConfirmed,
  onDeleteLostItem,
  onDeleteFoundItem,
}) => {
  const lostItems = initialLostItems;
  const foundItems = initialFoundItems;

  const [currentLostPage, setCurrentLostPage] = useState(1);
  const [currentFoundPage, setCurrentFoundPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedLostId, setSelectedLostId] = useState(null);
  const [selectedFoundId, setSelectedFoundId] = useState(null);
  const [showLostModal, setShowLostModal] = useState(false);
  const [showFoundModal, setShowFoundModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedLostItem, setSelectedLostItem] = useState(null);
  const [selectedFoundItem, setSelectedFoundItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteItemType, setDeleteItemType] = useState(null); // 'lost' or 'found'

  const [lostSearchTerm, setLostSearchTerm] = useState("");
  const [lostCategoryFilter, setLostCategoryFilter] = useState("All Categories");
  const [lostFloorFilter, setLostFloorFilter] = useState("All Floors");
  const [foundSearchTerm, setFoundSearchTerm] = useState("");
  const [foundCategoryFilter, setFoundCategoryFilter] = useState("All Categories");
  const [foundFloorFilter, setFoundFloorFilter] = useState("All Floors");

  const [lostSortConfig, setLostSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [foundSortConfig, setFoundSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  useEffect(() => {
    setSelectedLostId(null);
    setSelectedFoundId(null);
    setSelectedLostItem(null);
    setSelectedFoundItem(null);
    setShowMatchModal(false);
  }, [initialLostItems, initialFoundItems]);

  const handleLostSelect = (id) => {
    setSelectedLostId((prev) => (prev === id ? null : id));
    setSelectedFoundId(null);
  };

  const handleFoundSelect = (id) => {
    if (!selectedLostId) return;
    const newSelectedFoundId = selectedFoundId === id ? null : id;
    setSelectedFoundId(newSelectedFoundId);

    if (selectedLostId && newSelectedFoundId) {
      const lostItem = lostItems.find((item) => item.id === selectedLostId);
      const foundItem = foundItems.find((item) => item.id === newSelectedFoundId);
      setSelectedLostItem(lostItem);
      setSelectedFoundItem(foundItem);
      setShowMatchModal(true);
    }
  };

  const handleViewLostItem = (item) => {
    setSelectedLostItem(item);
    setShowLostModal(true);
  };

  const handleViewFoundItem = (item) => {
    setSelectedFoundItem(item);
    setShowFoundModal(true);
  };

  const handleConfirmMatch = () => {
    if (!selectedLostItem || !selectedFoundItem) return;

    const solvedItem = {
      id: Date.now(),
      name: selectedLostItem.name,
      category: selectedLostItem.category,
      resolvedDate: new Date().toISOString().split("T")[0],
      claimedBy: selectedLostItem.email,
      lostId: selectedLostItem.id,
      foundId: selectedFoundItem.id,
      isClaimed: false,
      lostDetails: selectedLostItem,
      foundDetails: selectedFoundItem,
    };

    if (onMatchConfirmed) {
      onMatchConfirmed(solvedItem);
    }

    setShowMatchModal(false);
    setSelectedLostId(null);
    setSelectedFoundId(null);
    setSelectedLostItem(null);
    setSelectedFoundItem(null);
  };

  const handleCancelMatch = () => {
    setShowMatchModal(false);
  };

  const handleDeleteClick = (item, type, e) => {
    e.stopPropagation();
    setItemToDelete(item);
    setDeleteItemType(type);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete || !deleteItemType) return;

    if (deleteItemType === 'lost' && onDeleteLostItem) {
      onDeleteLostItem(itemToDelete.id);
    } else if (deleteItemType === 'found' && onDeleteFoundItem) {
      onDeleteFoundItem(itemToDelete.id);
    }

    setShowDeleteModal(false);
    setItemToDelete(null);
    setDeleteItemType(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
    setDeleteItemType(null);
  };
  
  const sortItems = (items, sortConfig) => {
    if (!sortConfig.key) return items;

    return [...items].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const handleLostSort = (key) => {
    setLostSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleFoundSort = (key) => {
    setFoundSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filterLostItems = (items) => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(lostSearchTerm.toLowerCase()) ||
        (item.ownerName &&
          item.ownerName.toLowerCase().includes(lostSearchTerm.toLowerCase())) ||
        item.category.toLowerCase().includes(lostSearchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(lostSearchTerm.toLowerCase());

      const matchesCategory =
        lostCategoryFilter === "All Categories" ||
        item.category === lostCategoryFilter;
      const matchesFloor =
        lostFloorFilter === "All Floors" || item.floor === lostFloorFilter;

      return matchesSearch && matchesCategory && matchesFloor;
    });
  };

  const filterFoundItems = (items) => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(foundSearchTerm.toLowerCase()) ||
        (item.finderName &&
          item.finderName.toLowerCase().includes(foundSearchTerm.toLowerCase())) ||
        item.category.toLowerCase().includes(foundSearchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(foundSearchTerm.toLowerCase());

      const matchesCategory =
        foundCategoryFilter === "All Categories" ||
        item.category === foundCategoryFilter;
      const matchesFloor =
        foundFloorFilter === "All Floors" || item.floor === foundFloorFilter;

      return matchesSearch && matchesCategory && matchesFloor;
    });
  };

  const lostCategories = [
    "All Categories",
    ...new Set(lostItems.map((item) => item.category)),
  ];
  
  // Updated lostFloors with "All Floors" first
  const lostFloors = [
    "All Floors",
    ...new Set(lostItems.map((item) => item.floor).filter(floor => floor && floor !== "All Floors"))
  ].sort((a, b) => {
    if (a === "All Floors") return -1;
    if (b === "All Floors") return 1;
    return a.localeCompare(b, undefined, { numeric: true });
  });
  
  const foundCategories = [
    "All Categories",
    ...new Set(foundItems.map((item) => item.category)),
  ];
  
  // Updated foundFloors with "All Floors" first
  const foundFloors = [
    "All Floors",
    ...new Set(foundItems.map((item) => item.floor).filter(floor => floor && floor !== "All Floors"))
  ].sort((a, b) => {
    if (a === "All Floors") return -1;
    if (b === "All Floors") return 1;
    return a.localeCompare(b, undefined, { numeric: true });
  });

  const filteredLostItems = sortItems(filterLostItems(lostItems), lostSortConfig);
  const indexOfLastLostItem = currentLostPage * itemsPerPage;
  const indexOfFirstLostItem = indexOfLastLostItem - itemsPerPage;
  const currentLostItems = filteredLostItems.slice(
    indexOfFirstLostItem,
    indexOfLastLostItem
  );

  const totalLostPages =
    Math.ceil(filteredLostItems.length / itemsPerPage) || 1;

  const filteredFoundItems = sortItems(
    filterFoundItems(foundItems),
    foundSortConfig
  );

  const indexOfLastFoundItem = currentFoundPage * itemsPerPage;
  const indexOfFirstFoundItem = indexOfLastFoundItem - itemsPerPage;
  const currentFoundItems = filteredFoundItems.slice(
    indexOfFirstFoundItem,
    indexOfLastFoundItem
  );

  const totalFoundPages =
    Math.ceil(filteredFoundItems.length / itemsPerPage) || 1;

  useEffect(() => {
  const refreshItems = () => fetchItems();
  window.addEventListener("itemsUpdated", refreshItems);

  return () => {
    window.removeEventListener("itemsUpdated", refreshItems);
  };
}, []);
  
  return (
    <div className="items-container">
      <div className="items-header">
        <h2 className="items-title">
          All Items
        </h2>
      </div>

      {/* Lost Items Section */}
      <div className="section">
        <h3 className="section-title">Lost Reports</h3>

        <div className="search-filter-section">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search lost items, owners, categories..."
              value={lostSearchTerm}
              onChange={(e) => {
                setLostSearchTerm(e.target.value);
                setCurrentLostPage(1);
              }}
              className="search-input"
            />
          </div>
          
          {/* Category Filter with dropdown arrow */}
          <div className="filter-select-container">
            <select
              value={lostCategoryFilter}
              onChange={(e) => {
                setLostCategoryFilter(e.target.value);
                setCurrentLostPage(1);
              }}
              className="filter-select"
            >
              {lostCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          
          {/* Floor Filter with dropdown arrow - Now with "All Floors" first */}
          <div className="filter-select-container">
            <select
              value={lostFloorFilter}
              onChange={(e) => {
                setLostFloorFilter(e.target.value);
                setCurrentLostPage(1);
              }}
              className="filter-select"
            >
              {lostFloors.map((floor) => (
                <option key={floor} value={floor}>
                  {floor}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-card">
          <table className="table">
            <thead>
              <tr>
                <th>Select</th>
                <th>ID</th>
                <th
                  className="sortable-header"
                  onClick={() => handleLostSort("name")}
                >
                  <div className="header-content">
                    Item Name
                  </div>
                </th>
                <th>Category</th>
                <th
                  className="sortable-header"
                  onClick={() => handleLostSort("floor")}
                >
                  <div className="header-content">
                    Floor
                  </div>
                </th>
                <th>Location</th>
                <th
                  className="sortable-header"
                  onClick={() => handleLostSort("date")}
                >
                  <div className="header-content">
                    Date
                  </div>
                </th>
                <th
                  className="sortable-header"
                  onClick={() => handleLostSort("time")}
                >
                  <div className="header-content">
                    Time
                  </div>
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentLostItems.map((item) => (
                <tr
                  key={item.id}
                  className={`${
                    selectedLostId === item.id ? "selected-row-lost" : ""
                  } ${
                    selectedLostId && selectedLostId !== item.id
                      ? "blurred-row"
                      : ""
                  }`}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedLostId === item.id}
                      onChange={() => handleLostSelect(item.id)}
                      className="checkbox-no-animation"
                    />
                  </td>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.floor}</td>
                  <td>{item.location}</td>
                  <td>{item.date}</td>
                  <td>{item.time}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="view-btn-solved"
                        onClick={() => handleViewLostItem(item)}
                      >
                        View
                      </button>
                      <div
                        className="delete-icon"
                        onClick={(e) => handleDeleteClick(item, 'lost', e)}
                        style={{
                          cursor: 'pointer',
                          color: '#6b7280',
                          padding: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Trash2 size={16} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => setCurrentLostPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentLostPage === 1}
          >
            Prev
          </button>
          <span className="page-info">
            Page {currentLostPage} of {totalLostPages}
          </span>
          <button
            className="page-btn"
            onClick={() =>
              setCurrentLostPage((prev) => Math.min(prev + 1, totalLostPages))
            }
            disabled={currentLostPage === totalLostPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Found Items Section */}
      <div className="section">
        <h3 className="section-title">Found Items</h3>

        <div className="search-filter-section">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search found items, finders, categories..."
              value={foundSearchTerm}
              onChange={(e) => {
                setFoundSearchTerm(e.target.value);
                setCurrentFoundPage(1);
              }}
              className="search-input"
            />
          </div>
          
          {/* Category Filter with dropdown arrow */}
          <div className="filter-select-container">
            <select
              value={foundCategoryFilter}
              onChange={(e) => {
                setFoundCategoryFilter(e.target.value);
                setCurrentFoundPage(1);
              }}
              className="filter-select"
            >
              {foundCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          
          {/* Floor Filter with dropdown arrow - Now with "All Floors" first */}
          <div className="filter-select-container">
            <select
              value={foundFloorFilter}
              onChange={(e) => {
                setFoundFloorFilter(e.target.value);
                setCurrentFoundPage(1);
              }}
              className="filter-select"
            >
              {foundFloors.map((floor) => (
                <option key={floor} value={floor}>
                  {floor}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-card">
          <table className="table">
            <thead>
              <tr>
                <th>Select</th>
                <th>ID</th>
                <th
                  className="sortable-header"
                  onClick={() => handleFoundSort("name")}
                >
                  <div className="header-content">
                    Item Name
                  </div>
                </th>
                <th>Category</th>
                <th
                  className="sortable-header"
                  onClick={() => handleFoundSort("floor")}
                >
                  <div className="header-content">
                    Floor
                  </div>
                </th>
                <th>Location</th>
                <th
                  className="sortable-header"
                  onClick={() => handleFoundSort("date")}
                >
                  <div className="header-content">
                    Date
                  </div>
                </th>
                <th
                  className="sortable-header"
                  onClick={() => handleFoundSort("time")}
                >
                  <div className="header-content">
                    Time
                  </div>
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentFoundItems.map((item) => (
                <tr
                  key={item.id}
                  className={`${
                    selectedFoundId === item.id ? "selected-row-found" : ""
                  } ${
                    selectedLostId &&
                    selectedFoundId &&
                    selectedFoundId !== item.id
                      ? "blurred-row"
                      : ""
                  }`}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedFoundId === item.id}
                      onChange={() => handleFoundSelect(item.id)}
                      className="checkbox-no-animation"
                      disabled={!selectedLostId}
                    />
                  </td>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.floor}</td>
                  <td>{item.location}</td>
                  <td>{item.date}</td>
                  <td>{item.time}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="view-btn-solved"
                        onClick={() => handleViewFoundItem(item)}
                      >
                        View
                      </button>
                      <div
                        className="delete-icon"
                        onClick={(e) => handleDeleteClick(item, 'found', e)}
                        style={{
                          cursor: 'pointer',
                          color: '#6b7280',
                          padding: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Trash2 size={16} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button
            className="page-btn"
            onClick={() =>
              setCurrentFoundPage((prev) => Math.max(prev - 1, 1))
            }
            disabled={currentFoundPage === 1}
          >
            Prev
          </button>
          <span className="page-info">
            Page {currentFoundPage} of {totalFoundPages}
          </span>
          <button
            className="page-btn"
            onClick={() =>
              setCurrentFoundPage((prev) =>
                Math.min(prev + 1, totalFoundPages)
              )
            }
            disabled={currentFoundPage === totalFoundPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* MODALS */}

      {showLostModal && selectedLostItem && (
        <div className="modal-overlay" onClick={() => setShowLostModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Lost Item Details</h3>
              <button
                className="close-btn"
                onClick={() => setShowLostModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <p className="modal-subtitle">
              View complete information about this lost report.
            </p>

            <div className="modal-body">
              <div className="modal-grid">
                <div className="modal-field">
                  <label>Item Name</label>
                  <p>{selectedLostItem.name}</p>
                </div>
                <div className="modal-field">
                  <label>Category</label>
                  <p>{selectedLostItem.category}</p>
                </div>

                <div className="modal-field">
                  <label>Owner Name</label>
                  <p>{selectedLostItem.ownerName || "N/A"}</p>
                </div>
                <div className="modal-field">
                  <label>Occupation</label>
                  <p>{selectedLostItem.occupation || "N/A"}</p>
                </div>

                <div className="modal-field">
                  <label>Floor</label>
                  <p>{selectedLostItem.floor}</p>
                </div>
                <div className="modal-field">
                  <label>Location</label>
                  <p>{selectedLostItem.location}</p>
                </div>
                <div className="modal-field">
                  <label>Date</label>
                  <p>{selectedLostItem.date}</p>
                </div>
                <div className="modal-field">
                  <label>Time</label>
                  <p>{selectedLostItem.time}</p>
                </div>
              </div>

              <div className="modal-field-full">
                <label>Description</label>
                <p>{selectedLostItem.description}</p>
              </div>

              <div className="modal-grid">
                <div className="modal-field">
                  <label>Contact Number</label>
                  <p>{selectedLostItem.contactNumber}</p>
                </div>
                <div className="modal-field">
                  <label>Email</label>
                  <p>{selectedLostItem.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFoundModal && selectedFoundItem && (
        <div className="modal-overlay" onClick={() => setShowFoundModal(false)}>
          <div
            className="modal-content modal-content-wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Found Item Details</h3>
              <button
                className="close-btn"
                onClick={() => setShowFoundModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <p className="modal-subtitle">
              View complete information about this found item.
            </p>

            <div className="modal-body-with-photo">
              <div className="modal-left">
                <div className="modal-grid">
                  <div className="modal-field">
                    <label>Item Name</label>
                    <p>{selectedFoundItem.name}</p>
                  </div>
                  <div className="modal-field">
                    <label>Category</label>
                    <p>{selectedFoundItem.category}</p>
                  </div>
                  <div className="modal-field">
                    <label>Finder Name</label>
                    <p>{selectedFoundItem.finderName || "N/A"}</p>
                  </div>
                  <div className="modal-field">
                    <label>Occupation</label>
                    <p>{selectedFoundItem.occupation || "N/A"}</p>
                  </div>

                  <div className="modal-field">
                    <label>Floor</label>
                    <p>{selectedFoundItem.floor}</p>
                  </div>
                  <div className="modal-field">
                    <label>Location</label>
                    <p>{selectedFoundItem.location}</p>
                  </div>
                  <div className="modal-field">
                    <label>Date</label>
                    <p>{selectedFoundItem.date}</p>
                  </div>
                  <div className="modal-field">
                    <label>Time</label>
                    <p>{selectedFoundItem.time}</p>
                  </div>
                </div>

                <div className="modal-field-full">
                  <label>Description</label>
                  <p>{selectedFoundItem.description}</p>
                </div>

                <div className="modal-grid">
                  <div className="modal-field">
                    <label>Contact Number</label>
                    <p>{selectedFoundItem.contactNumber}</p>
                  </div>
                  <div className="modal-field">
                    <label>Email</label>
                    <p>{selectedFoundItem.email}</p>
                  </div>
                </div>
              </div>

              <div className="modal-right">
                <label>Photo</label>
                <img
                  src={selectedFoundItem.photo}
                  alt={selectedFoundItem.name}
                  className="item-photo"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showMatchModal && selectedLostItem && selectedFoundItem && (
        <div className="modal-overlay" onClick={handleCancelMatch}>
          <div
            className="modal-content modal-content-match"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3>Confirm Match</h3>
                <p className="modal-subtitle">
                  Review the details to confirm the match.
                </p>
              </div>
              <button className="close-btn" onClick={handleCancelMatch}>
                <X size={24} />
              </button>
            </div>

            <div className="match-comparison">
              {/* Lost Report Side */}
              <div className="match-card match-card-lost">
                <div className="match-card-header">
                  <span className="status-dot status-dot-lost"></span>
                  <h4>Lost Report</h4>
                </div>
                <div className="match-details">
                  <div className="match-row">
                    <div className="match-field">
                      <label>Item Name</label>
                      <p>{selectedLostItem.name}</p>
                    </div>
                    <div className="match-field">
                      <label>Category</label>
                      <p>{selectedLostItem.category}</p>
                    </div>
                  </div>
                  <div className="match-row">
                    <div className="match-field">
                      <label>Owner Name</label>
                      <p>{selectedLostItem.ownerName || "N/A"}</p>
                    </div>
                    <div className="match-field">
                      <label>Occupation</label>
                      <p>{selectedLostItem.occupation || "N/A"}</p>
                    </div>
                  </div>
                  <div className="match-row">
                    <div className="match-field">
                      <label>Location</label>
                      <p>{selectedLostItem.location}</p>
                    </div>
                    <div className="match-field">
                      <label>Date</label>
                      <p>{selectedLostItem.date}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Found Item Side */}
              <div className="match-card match-card-found">
                <div className="match-card-header">
                  <span className="status-dot status-dot-found"></span>
                  <h4>Found Item</h4>
                </div>
                <div className="match-details">
                  <div className="match-row">
                    <div className="match-field">
                      <label>Item Name</label>
                      <p>{selectedFoundItem.name}</p>
                    </div>
                    <div className="match-field">
                      <label>Category</label>
                      <p>{selectedFoundItem.category}</p>
                    </div>
                  </div>
                  <div className="match-row">
                    <div className="match-field">
                      <label>Finder Name</label>
                      <p>{selectedFoundItem.finderName || "N/A"}</p>
                    </div>
                    <div className="match-field">
                      <label>Occupation</label>
                      <p>{selectedFoundItem.occupation || "N/A"}</p>
                    </div>
                  </div>
                  <div className="match-row">
                    <div className="match-field">
                      <label>Location</label>
                      <p>{selectedFoundItem.location}</p>
                    </div>
                    <div className="match-field">
                      <label>Date</label>
                      <p>{selectedFoundItem.date}</p>
                    </div>
                  </div>
                </div>
                {selectedFoundItem.photo && (
                  <div className="match-photo">
                    <img
                      src={selectedFoundItem.photo}
                      alt={selectedFoundItem.name}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="match-actions">
              <button className="btn-cancel" onClick={handleCancelMatch}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={handleConfirmMatch}>
                Confirm Match
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '500px' }}
          >
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
            </div>
            <div
              className="modal-subtitle"
              style={{
                fontSize: '16px',
                lineHeight: '1.6',
                marginBottom: '23px',
                textAlign: 'center',
                color: '#000000'
              }}
            >
              Are you sure you want to delete <b>{itemToDelete.name.trim()}</b>?<br />
              This action cannot be undone.
            </div>

            <div className="match-actions">
              <button className="btn-cancel" onClick={handleCancelDelete}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsView;