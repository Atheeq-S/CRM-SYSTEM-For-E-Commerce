import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPut } from '../utils/api';
import '../styles/UserEdit.css';

const UserEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState({
        username: '',
        role: '',
        password: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await apiGet(`/api/users/${id}`);
                setUser({
                    ...userData,
                    password: '' // Don't display the password
                });
                setLoading(false);
            } catch (err) {
                setError(err.message || 'Failed to fetch user');
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prevUser => ({
            ...prevUser,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Create a copy of the user object
            const userToUpdate = { ...user };
            
            // If password is empty, remove it from the request
            if (!userToUpdate.password) {
                delete userToUpdate.password;
            }
            
            await apiPut(`/api/users/${id}`, userToUpdate);
            setSuccessMessage('User updated successfully');
            setTimeout(() => {
                navigate('/users');
            }, 1500);
        } catch (err) {
            setError(err.message || 'Failed to update user');
            setLoading(false);
        }
    };

    if (loading && !successMessage) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="user-edit-container">
            {successMessage && (
                <div className="success-message">{successMessage}</div>
            )}
            <h1>Edit User</h1>
            <form onSubmit={handleSubmit} className="user-edit-form">
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={user.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <select
                        id="role"
                        name="role"
                        value={user.role}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Role</option>
                        <option value="ADMIN">Admin</option>
                        <option value="SALES_REP">Sales</option>
                        <option value="ANALYST">Analyst</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password (leave blank to keep current)</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={user.password}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/users')} className="cancel-btn">
                        Cancel
                    </button>
                    <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserEdit;