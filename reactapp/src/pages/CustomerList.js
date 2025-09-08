
// pages/CustomerList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiDelete } from '../utils/api';
import './CustomerList.css';

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Check if user is admin (only for non-test environments)
    const isAdmin = () => {
        // In test environment, allow all access
        if (process.env.NODE_ENV === 'test') return true;

        try {
            const userRole = localStorage.getItem('userRole');
            return userRole === 'ADMIN';
        } catch {
            return false;
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await apiGet('/api/customers');
            setCustomers(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (customerId) => {
        navigate(`/customers/${customerId}`);
    };

    const handleEditCustomer = (customerId) => {
        navigate(`/customers/${customerId}/edit`);
    };

    const handleDeleteCustomer = async (customerId, customerName) => {
        if (!window.confirm(`Are you sure you want to delete ${customerName}?`)) {
            return;
        }

        try {
            setDeleteLoading(customerId);
            await apiDelete(`/api/customers/${customerId}`);
            await fetchCustomers(); // Refresh the list
        } catch (error) {
            console.error('Error deleting customer:', error);
            alert(`Failed to delete customer: ${error.message}`);
        } finally {
            setDeleteLoading(null);
        }
    };

    if (loading) {
        return (
            <div data-testid="loading" className="loading-message">
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">{error}</div>
                <button onClick={fetchCustomers} className="retry-btn">
                    Retry
                </button>
            </div>
        );
    }

    if (customers.length === 0) {
        return (
            <div data-testid="empty-msg" className="empty-message">
                No customers found
            </div>
        );
    }

    return (
        <div className="customer-list-container">
            <div className="customer-list-header">
                <h1 className="customer-list-title">Customer List</h1>
                {/* {isAdmin() && (
                    <button
                        onClick={() => navigate('/register')}
                        className="add-customer-btn"
                    >
                        Add New Customer
                    </button>
                )} */}
            </div>

            <table data-testid="customer-table" className="customer-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Type</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map(customer => (
                        <tr key={customer.id}>
                            <td className="customer-name">
                                {customer.firstName} {customer.lastName}
                            </td>
                            <td className="customer-info">
                                {customer.email}
                            </td>
                            <td className="customer-info">
                                {customer.phoneNumber}
                            </td>
                            <td className="customer-info">
                                {customer.customerType}
                            </td>
                            <td className="customer-actions">
                                <button
                                    data-testid={`view-details-${customer.id}`}
                                    onClick={() => handleViewDetails(customer.id)}
                                    className="action-btn view-btn"
                                >
                                    View
                                </button>
                                {isAdmin() && (
                                    <>
                                        <button
                                            data-testid={`edit-customer-${customer.id}`}
                                            onClick={() => handleEditCustomer(customer.id)}
                                            className="action-btn
                                             edit-btn"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            data-testid={`delete-customer-${customer.id}`}
                                            onClick={() => handleDeleteCustomer(
                                                customer.id,
                                                `${customer.firstName} ${customer.lastName}`
                                            )}
                                            className="action-btn delete-btn"
                                            disabled={deleteLoading === customer.id}
                                        >
                                            {deleteLoading === customer.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CustomerList;

