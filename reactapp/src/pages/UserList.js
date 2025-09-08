// pages/UserList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiDelete } from '../utils/api';
import './UserList.css';

const UserList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await apiGet('/api/auth/users');
            setUsers(response);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };
    
    const handleEditUser = (id) => {
        navigate(`/users/edit/${id}`);
    };
    
    const handleDeleteUser = async (id, username) => {
        if (window.confirm(`Are you sure you want to delete user ${username}?`)) {
            setDeleteLoading(id);
            try {
                await apiDelete(`/api/users/${id}`);
                setSuccessMessage(`User ${username} deleted successfully`);
                fetchUsers();
            } catch (error) {
                setError(error.message || 'Failed to delete user');
            } finally {
                setDeleteLoading(null);
            }
        }
    };

    const handleAddNewUser = () => {
        navigate('/users/register');
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return 'N/A';
        }
    };

    if (loading) {
        return (
            <div className="user-list-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading users...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="user-list-container">
                <div className="error-state">
                    <h3>Error Loading Users</h3>
                    <p>{error}</p>
                    <button onClick={fetchUsers} className="btn-primary">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="user-list-container">
            <div className="user-list-header">
                <div className="header-content">
                    <h1>User Management</h1>
                    <p>Manage system users and their roles</p>
                </div>
                <div className="header-actions">
                    <button
                        onClick={handleAddNewUser}
                        className="btn-primary"
                    >
                        <span className="btn-icon">➕</span>
                        Add New User
                    </button>
                    <button
                        onClick={handleBackToDashboard}
                        className="btn-secondary"
                    >
                        <span className="btn-icon">←</span>
                        Back to Dashboard
                    </button>
                </div>
            </div>

            <div className="user-list-content">
                {successMessage && (
                    <div className="success-message">{successMessage}</div>
                )}
                <div className="user-stats">
                    <div className="stat-item">
                        <span className="stat-value">{users.length}</span>
                        <span className="stat-label">Total Users</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">
                            {users.filter(user => user.role === 'ADMIN').length}
                        </span>
                        <span className="stat-label">Administrators</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">
                            {users.filter(user => user.role === 'SALES_REP').length}
                        </span>
                        <span className="stat-label">Sales Representatives</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">
                            {users.filter(user => user.role === 'ANALYST').length}
                        </span>
                        <span className="stat-label">Analysts</span>
                    </div>
                </div>

                <div className="user-table-container">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className={`user-row ${user.role.toLowerCase()}`}>
                                    <td>{user.id}</td>
                                    <td>
                                        <span className="username">{user.username}</span>
                                    </td>
                                    <td>
                                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="status-active">Active</span>
                                    </td>
                                    <td className="user-actions">
                                        <button
                                            onClick={() => handleEditUser(user.id)}
                                            className="action-btn edit-btn"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id, user.username)}
                                            className="action-btn delete-btn"
                                            disabled={deleteLoading === user.id}
                                        >
                                            {deleteLoading === user.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <h3>No Users Found</h3>
                        <p>There are no users in the system yet.</p>
                        <button
                            onClick={handleAddNewUser}
                            className="btn-primary"
                        >
                            Add First User
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserList;
