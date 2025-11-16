// src/components/AdminDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import tigerLogo from "../assets/tiger.png";
import { supabase } from '../supabaseClient';

// Import views
import DashboardView from './DashboardView';
import ItemsView from './ItemsView';
import SolvedView from './SolvedView';
import ArchiveView from './ArchiveView';
import DisputeView from './DisputeView';

// Helper function to convert military time to 12-hour format
const formatTimeTo12Hour = (timeString) => {
    if (!timeString) return '';
    
    try {
        // Handle both "HH:MM:SS" and "HH:MM" formats
        const timeParts = timeString.split(':');
        const hours = parseInt(timeParts[0], 10);
        const minutes = timeParts[1];
        
        const period = hours >= 12 ? 'PM' : 'AM';
        const twelveHour = hours % 12 || 12;
        
        return `${twelveHour}:${minutes} ${period}`;
    } catch (error) {
        console.error('Error formatting time:', error);
        return timeString; // Return original if conversion fails
    }
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);

    const [lostItems, setLostItems] = useState([]);
    const [foundItems, setFoundItems] = useState([]);
    const [solvedItems, setSolvedItems] = useState([]);

    const [logoutPopup, setLogoutPopup] = useState(false);

    // Match Confirmed Popup
    const [matchPopup, setMatchPopup] = useState({ open: false, itemName: "" });

    // Claim Confirmed Popup
    const [claimPopup, setClaimPopup] = useState({ open: false, itemName: "" });

    // Fetch all data
    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            // Lost items
            const { data: lostData, error: lostError } = await supabase
                .from('lost_items')
                .select('*')
                .eq('status', 'pending')
                .order('lost_date', { ascending: false });
            if (lostError) throw lostError;

            const mappedLostItems = lostData.map(item => ({
                ...item,
                date: item.lost_date,
                time: formatTimeTo12Hour(item.lost_time), // Convert to 12-hour format
                email: item.contact_email,
                ownerName: item.owner_name,
                occupation: item.occupation,
                contactNumber: item.contact_number,
                description: item.description
            }));
            setLostItems(mappedLostItems);

            // Found items
            const { data: foundData, error: foundError } = await supabase
                .from('found_items')
                .select('*')
                .eq('status', 'pending')
                .order('found_date', { ascending: false });
            if (foundError) throw foundError;

            const mappedFoundItems = foundData.map(item => ({
                ...item,
                date: item.found_date,
                time: formatTimeTo12Hour(item.found_time), // Convert to 12-hour format
                photo: item.photo_url,
                email: item.contact_email,
                finderName: item.finder_name,
                occupation: item.occupation,
                contactNumber: item.contact_number,
                description: item.description
            }));
            setFoundItems(mappedFoundItems);

            // Solved items
            const { data: solvedData, error: solvedError } = await supabase
                .from('solved_items')
                .select('*')
                .order('created_at', { ascending: false });
            if (solvedError) throw solvedError;

            const mappedSolvedItems = solvedData.map(item => ({
                ...item,
                claimedBy: item.claimed_by_email,
                resolvedDate: item.resolved_date,
                lostId: item.lost_item_id,
                foundId: item.found_item_id,
                isClaimed: item.is_claimed,
                claimedDate: item.claimed_date
            }));
            setSolvedItems(mappedSolvedItems);

        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Could not fetch data: " + error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Auth + Realtime Listener
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/admin-login');
            } else {
                fetchAllData();
            }
        };
        checkUser();

        const changes = supabase
            .channel('db-changes')
            .on('postgres_changes', { event: '*', schema: 'public' }, () => {
                fetchAllData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(changes);
        };
    }, [navigate, fetchAllData]);

    // Confirm Match
    const handleMatchConfirmed = async (resolvedItem) => {
        try {
            const { error: solvedError } = await supabase
                .from('solved_items')
                .insert([{
                    name: resolvedItem.name,
                    category: resolvedItem.category,
                    resolved_date: resolvedItem.resolvedDate,
                    claimed_by_email: resolvedItem.claimedBy,
                    lost_item_id: resolvedItem.lostId,
                    found_item_id: resolvedItem.foundId,
                    is_claimed: false,
                    lost_details: resolvedItem.lostDetails,
                    found_details: resolvedItem.foundDetails
                }]);

            if (solvedError) throw solvedError;

            await supabase.from('lost_items').update({ status: 'solved' }).eq('id', resolvedItem.lostId);
            await supabase.from('found_items').update({ status: 'solved' }).eq('id', resolvedItem.foundId);

            await fetchAllData();

            setMatchPopup({
                open: true,
                itemName: resolvedItem.name || "Item"
            });

        } catch (error) {
            console.error("Error confirming match:", error);
            alert("Error confirming match: " + error.message);
        }
    };

    // Claim Handler
    const handleMarkAsClaimed = async (itemId) => {
        try {
            const item = solvedItems.find(i => i.id === itemId);

            const { error } = await supabase
                .from('solved_items')
                .update({
                    is_claimed: true,
                    claimed_date: new Date().toISOString().split('T')[0]
                })
                .eq('id', itemId);
            if (error) throw error;

            await fetchAllData();

            setClaimPopup({
                open: true,
                itemName: item?.name || "Item"
            });

        } catch (error) {
            console.error("Error marking as claimed:", error);
            alert("Error: " + error.message);
        }
    };

    const confirmLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    // Stats
    const stats = useMemo(() => {
        const pendingCount = lostItems.length + foundItems.length;
        const resolvedCount = solvedItems.length;
        const totalCount = pendingCount + resolvedCount;

        return {
            totalItems: totalCount,
            pending: pendingCount,
            resolved: resolvedCount
        };
    }, [lostItems, foundItems, solvedItems]);

    const renderContent = () => {
        if (loading && activeTab !== 'dashboard') {
            return (
                <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem' }}>
                    Loading data from database...
                </div>
            );
        }

        switch (activeTab) {
            case "dashboard":
                return <DashboardView stats={stats} />;
            case "items":
                return (
                    <ItemsView
                        initialLostItems={lostItems}
                        initialFoundItems={foundItems}
                        onMatchConfirmed={handleMatchConfirmed}
                    />
                );
            case "solved":
                return (
                    <SolvedView
                        allResolvedItems={solvedItems}
                        onMarkAsClaimed={handleMarkAsClaimed}
                    />
                );
            case "archive":
                return <ArchiveView />;
            case "dispute":
                return <DisputeView />;
            default:
                return <DashboardView stats={stats} />;
        }
    };

    return (
        <>
            {/* LOGOUT POPUP */}
            {logoutPopup && (
                <div className="logout-overlay">
                    <div className="logout-modal">
                        <h2>Logout Confirmation</h2>
                        <p>Are you sure you want to logout?</p>

                        <div className="logout-actions">
                            <button className="cancel-btn" onClick={() => setLogoutPopup(false)}>
                                Cancel
                            </button>
                            <button className="confirm-btn" onClick={confirmLogout}>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MATCH CONFIRMED POPUP - updated design */}
            {matchPopup.open && (
                <div className="match-overlay">
                    <div className="claim-modal">
                        <div className="claim-icon">✓</div>

                        <h2>Match Confirmed</h2>
                        <p>
                            The item <strong>{matchPopup.itemName}</strong> has been successfully matched.
                        </p>

                        <button 
                            className="claim-close-btn"
                            onClick={() => setMatchPopup({ open: false, itemName: "" })}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {/* CLAIM CONFIRMED POPUP */}
            {claimPopup.open && (
                <div className="claim-overlay">
                    <div className="claim-modal">
                        <div className="claim-icon">✓</div>

                        <h2>Item Successfully Claimed</h2>
                        <p>
                            The item <strong>{claimPopup.itemName}</strong> has been marked as claimed.
                        </p>

                        <button 
                            className="claim-close-btn"
                            onClick={() => setClaimPopup({ open: false, itemName: "" })}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            <div className="admin-container">
                <div className="sidebar">
                    <img src={tigerLogo} alt="TigerTrack Logo" className="tiger-logo" />

                    <div className="sidebar-logo">
                        <h4>TigerTrack</h4>
                        <p>Admin Board</p>
                    </div>

                    <nav className="sidebar-nav">
                        <NavItem icon="📊" label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                        <NavItem icon="📦" label="Items" active={activeTab === 'items'} onClick={() => setActiveTab('items')} />
                        <NavItem icon="🛠️" label="Solved/Claimed" active={activeTab === 'solved'} onClick={() => setActiveTab('solved')} />
                        <NavItem icon="🗃️" label="Archive" active={activeTab === 'archive'} onClick={() => setActiveTab('archive')} />
                        <NavItem icon="⚠️" label="Dispute" active={activeTab === 'dispute'} onClick={() => setActiveTab('dispute')} />
                    </nav>

                    <div className="sidebar-logout">
                        <button className="logout-btn" onClick={() => setLogoutPopup(true)}>
                            ➜ Logout
                        </button>
                    </div>
                </div>

                <div className="main-content">
                    {renderContent()}
                </div>
            </div>
        </>
    );
};

// NavItem Component
const NavItem = ({ icon, label, active, onClick }) => {
    return (
        <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
            <span className="nav-item-icon">{icon}</span>
            <span>{label}</span>
        </button>
    );
};

export default AdminDashboard;