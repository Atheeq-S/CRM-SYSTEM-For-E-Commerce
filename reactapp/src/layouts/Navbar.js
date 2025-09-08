// layouts/Navbar.js
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../utils/api';
import './Navbar.css';

const Navbar = ({ userRole, username, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Debug logging
    console.log('Navbar rendered with props:', { userRole, username, hasOnLogout: !!onLogout });

    const handleLogout = async () => {
        console.log('Logout initiated');
        try {
            // Call logout API (optional since you don't use Spring Security)
            await authAPI.logout();
        } catch (error) {
            console.log('Logout API call failed, but continuing with local logout');
        } finally {
            // Always clear local storage regardless of API call result
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('username');

            console.log('Local storage cleared, calling onLogout callback');
            // Update authentication state in parent component
            if (onLogout) {
                onLogout();
            } else {
                console.warn('onLogout callback not provided');
            }

            // Navigate to login
            navigate('/login', { replace: true });
        }
    };

    const isActiveRoute = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo/Brand */}
                <div className="navbar-brand">
                    <Link to="/dashboard" className="brand-link">
                        CRM System
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="navbar-nav">
                    <Link
                        to="/dashboard"
                        className={`nav-link ${isActiveRoute('/dashboard') ? 'active' : ''}`}
                    >
                        Dashboard
                    </Link>

                    <Link
                        to="/customers"
                        className={`nav-link ${isActiveRoute('/customers') ? 'active' : ''}`}
                    >
                        Customers
                    </Link>

                    {/* Admin Only: Add Customer */}
                    {userRole === 'ADMIN' && (
                        <Link
                            to="/customers/register"
                            className={`nav-link ${isActiveRoute('/register') ? 'active' : ''}`}
                        >
                            Add Customer
                        </Link>
                    )}

                    {/* Admin Only: User Management */}
                    {userRole === 'ADMIN' && (
                        <Link
                            to="/users"
                            className={`nav-link ${isActiveRoute('/users') ? 'active' : ''}`}
                        >
                            User Management
                        </Link>
                    )}

                    {/* Admin and Analyst: Analytics Dashboard */}
                    {(userRole === 'ADMIN' || userRole === 'ANALYST') && (
                        <Link
                            to="/analytics"
                            className={`nav-link ${isActiveRoute('/analytics') ? 'active' : ''}`}
                        >
                            Analytics
                        </Link>
                    )}
                </div>

                {/* User Info and Logout */}
                <div className="navbar-user">
                    <div className="user-info">
                        <span className="username">{username}</span>
                        <span className={`user-role ${userRole?.toLowerCase()}`}>
                            {userRole}
                        </span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="logout-btn"
                        title="Logout"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;