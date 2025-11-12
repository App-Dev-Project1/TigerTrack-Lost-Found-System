// AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import tigerLogo from "../assets/tiger.png"; 

// Import views
import DashboardView from './DashboardView';
import ItemsView from './ItemsView';
import SolvedView from './SolvedView';
import ArchiveView from './ArchiveView';
import DisputeView from './DisputeView';

// --- Initial Mock Data (Define here or import from a constants file) ---
// Note: This data was originally in ItemsView.jsx's useEffect, now it lives here.
const initialLostItems = [
    { id: 1, name: "Black Backpack", category: "Bags", floor: "18", location: "Hallway", date: "2025-11-08", time: "2:30 PM", description: "Black Nike backpack with laptop compartment", contactNumber: "09567890123", email: "staff1@ust.edu.ph" },
    { id: 2, name: "Blue Water Bottle", category: "Other", floor: "19", location: "Room 1901", date: "2025-11-07", time: "10:15 AM", description: "Blue Hydro Flask water bottle with stickers", contactNumber: "09123456789", email: "staff2@ust.edu.ph" },
    { id: 3, name: "Silver Laptop", category: "Electronics", floor: "20", location: "Lobby", date: "2025-11-06", time: "4:45 PM", description: "MacBook Pro 13 inch with charger", contactNumber: "09876543210", email: "staff3@ust.edu.ph" },
    { id: 4, name: "Student ID", category: "Documents", floor: "17", location: "Bathroom", date: "2025-11-05", time: "9:20 AM", description: "UST Student ID with name John Doe", contactNumber: "09345678901", email: "staff4@ust.edu.ph" },
    { id: 5, name: "Green Umbrella", category: "Other", floor: "18", location: "Lobby", date: "2025-11-04", time: "11:00 AM", description: "Green folding umbrella with floral pattern", contactNumber: "09234567890", email: "staff5@ust.edu.ph" },
    { id: 6, name: "Red Notebook", category: "Documents", floor: "19", location: "Room 1905", date: "2025-11-03", time: "3:15 PM", description: "Red spiral notebook with physics notes", contactNumber: "09456789012", email: "staff6@ust.edu.ph" },
    { id: 7, name: "White Headphones", category: "Electronics", floor: "20", location: "Cafeteria", date: "2025-11-02", time: "1:45 PM", description: "Apple AirPods Pro with charging case", contactNumber: "09567890123", email: "staff7@ust.edu.ph" },
    { id: 8, name: "Brown Wallet", category: "Documents", floor: "17", location: "Elevator", date: "2025-11-01", time: "8:30 AM", description: "Brown leather wallet with ID cards", contactNumber: "09678901234", email: "staff8@ust.edu.ph" },
    { id: 9, name: "Yellow Jacket", category: "Bags", floor: "18", location: "Room 1802", date: "2025-10-31", time: "5:00 PM", description: "Yellow North Face jacket size M", contactNumber: "09789012345", email: "staff9@ust.edu.ph" },
    { id: 10, name: "Gray Charger", category: "Electronics", floor: "19", location: "Study Area", date: "2025-10-30", time: "7:20 PM", description: "Samsung phone charger with cable", contactNumber: "09890123456", email: "staff10@ust.edu.ph" },
];

const initialFoundItems = [
    { id: 1, name: "Black Backpack", category: "Bags", floor: "18", location: "Hallway", date: "2025-11-08", time: "2:45 PM", description: "Nike black backpack with laptop inside and red keychain attached", contactNumber: "09999888777", email: "finder1@ust.edu.ph", photo: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400" },
    { id: 2, name: "Blue Water Bottle", category: "Other", floor: "19", location: "Room 1901", date: "2025-11-07", time: "10:30 AM", description: "Hydro Flask water bottle with university stickers", contactNumber: "09888777666", email: "finder2@ust.edu.ph", photo: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400" },
    { id: 3, name: "Silver Laptop", category: "Electronics", floor: "20", location: "Lobby", date: "2025-11-06", time: "5:00 PM", description: "MacBook Pro with charger in black case", contactNumber: "09777666555", email: "finder3@ust.edu.ph", photo: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400" },
    { id: 4, name: "Green Notebook", category: "Documents", floor: "18", location: "Hallway", date: "2025-11-05", time: "10:30 AM", description: "Green spiral notebook with math formulas", contactNumber: "09666555444", email: "finder4@ust.edu.ph", photo: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400" },
    { id: 5, name: "Brown Wallet", category: "Documents", floor: "17", location: "Room 1702", date: "2025-11-04", time: "2:00 PM", description: "Brown leather wallet with credit cards inside", contactNumber: "09555444333", email: "finder5@ust.edu.ph", photo: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400" },
    { id: 6, name: "Pink Phone Case", category: "Other", floor: "19", location: "Restroom", date: "2025-11-03", time: "4:30 PM", description: "Pink silicone phone case for iPhone 13", contactNumber: "09444333222", email: "finder6@ust.edu.ph", photo: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400" },
    { id: 7, name: "Black Sunglasses", category: "Other", floor: "20", location: "Reception", date: "2025-11-02", time: "9:15 AM", description: "Ray-Ban black sunglasses with case", contactNumber: "09333222111", email: "finder7@ust.edu.ph", photo: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400" },
    { id: 8, name: "Red USB Drive", category: "Electronics", floor: "17", location: "Computer Lab", date: "2025-11-01", time: "6:45 PM", description: "SanDisk 64GB red USB flash drive", contactNumber: "09222111000", email: "finder8@ust.edu.ph", photo: "https://images.unsplash.com/photo-1624823183493-ed5832f48f18?w=400" },
    { id: 9, name: "Blue Scarf", category: "Bags", floor: "18", location: "Lounge", date: "2025-10-31", time: "12:30 PM", description: "Blue knitted scarf with white stripes", contactNumber: "09111000999", email: "finder9@ust.edu.ph", photo: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400" },
    { id: 10, name: "White AirPods", category: "Electronics", floor: "19", location: "Meeting Room", date: "2025-10-30", time: "3:50 PM", description: "Apple AirPods 2nd generation with case", contactNumber: "09000999888", email: "finder10@ust.edu.ph", photo: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400" },
];

const initialSolvedItems = [
    { id: 100, name: 'Black Wallet', category: 'Personal', resolvedDate: '2024-01-10', claimedBy: 'John Doe', lostId: 1000, foundId: 2000, isClaimed: false },
    { id: 102, name: 'Blue Backpack', category: 'School Supplies', resolvedDate: '2024-01-08', claimedBy: 'Mark Reyes', claimedDate: '2024-01-08', lostId: 1002, foundId: 2002, isClaimed: true },
];
// -------------------------------------------------------------------


const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');

    // --- MASTER STATE MANAGEMENT ADDED HERE ---
    const [lostItems, setLostItems] = useState(initialLostItems);
    const [foundItems, setFoundItems] = useState(initialFoundItems);
    const [solvedItems, setSolvedItems] = useState(initialSolvedItems);

    const handleMatchConfirmed = (resolvedItem) => {
        // 1. Add the new item to the solved list
        setSolvedItems(prev => [...prev, resolvedItem]);

        // 2. Remove the matched items from the active lists
        setLostItems(prev => prev.filter(item => item.id !== resolvedItem.lostId));
        setFoundItems(prev => prev.filter(item => item.id !== resolvedItem.foundId));
    };

    const handleMarkAsClaimed = (itemId) => {
        // Find the item and update its status
        const updatedSolvedItems = solvedItems.map(item => {
            if (item.id === itemId) {
                return { 
                    ...item, 
                    isClaimed: true, 
                    claimedDate: new Date().toISOString().split('T')[0] 
                };
            }
            return item;
        });
        setSolvedItems(updatedSolvedItems);
    };
    // -------------------------------------------

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return <DashboardView />;
            case "items":
                // PASS DATA AND HANDLER TO ItemsView
                return <ItemsView 
                    initialLostItems={lostItems}
                    initialFoundItems={foundItems}
                    onMatchConfirmed={handleMatchConfirmed}
                />;
            case "solved":
                // PASS DATA AND HANDLER TO SolvedView
                return <SolvedView 
                    allResolvedItems={solvedItems}
                    onMarkAsClaimed={handleMarkAsClaimed}
                />;
            case "archive":
                return <ArchiveView />;
            case "dispute":
                return <DisputeView />;
            default:
                return <DashboardView />;
        }
    };

    const [stats] = useState({
        totalItems: 42,
        pending: 30,
        resolved: 12
    });

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            navigate('/');
        }
    };

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <div className="sidebar">
                <img src={tigerLogo} alt="TigerTrack Logo" className="tiger-logo" />
                <div className="sidebar-logo">
                    <h4>TigerTrack</h4>
                    <p>Admin Board</p>
                </div>

                <nav className="sidebar-nav">
                    <NavItem 
                        icon="📊"
                        label="Dashboard"
                        active={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />
                    <NavItem 
                        icon="📦"
                        label="Items"
                        active={activeTab === 'items'}
                        onClick={() => setActiveTab('items')}
                    />
                    <NavItem 
                        icon="🛠️"
                        label="Solved/Claimed"
                        active={activeTab === 'solved'}
                        onClick={() => setActiveTab('solved')}
                    />
                    <NavItem 
                        icon="🗃️"
                        label="Archive"
                        active={activeTab === 'archive'}
                        onClick={() => setActiveTab('archive')}
                    />
                    <NavItem 
                        icon="⚠️"
                        label="Dispute"
                        active={activeTab === 'dispute'}
                        onClick={() => setActiveTab('dispute')}
                    />
                </nav>

                <div className="sidebar-logout">
                    <button className="logout-btn" onClick={handleLogout}>
                        ➜] Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {renderContent()}
            </div>

        </div>
    );
};

const NavItem = ({ icon, label, active, onClick }) => {
    return (
        <button
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={onClick}
        >
            <span className="nav-item-icon">{icon}</span>
            <span>{label}</span>
        </button>
    );
};

export default AdminDashboard;