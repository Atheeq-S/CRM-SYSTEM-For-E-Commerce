// pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState({
        totalCustomers: 0,
        newCustomersThisMonth: 0,
        totalInteractions: 0,
        pendingInteractions: 0,
        customerTypeDistribution: {}
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('username');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch dashboard statistics
            const customers = await apiGet('/api/customers');

            // Calculate statistics
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const newCustomersThisMonth = customers.filter(customer => {
                if (!customer.createdAt && !customer.registrationDate) return false;
                const createdDate = new Date(customer.createdAt || customer.registrationDate);
                return createdDate.getMonth() === currentMonth &&
                    createdDate.getFullYear() === currentYear;
            }).length;

            const customerTypeDistribution = customers.reduce((acc, customer) => {
                const type = customer.customerType || 'UNKNOWN';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {});

            // Fetch real interaction counts
            let interactionCounts = {
                totalInteractions: customers.length * 2, // Fallback for mock data
                pendingInteractions: Math.floor(customers.length * 0.3) // Fallback for mock data
            };

            try {
                const interactionData = await apiGet('/api/interactions/count');
                interactionCounts = {
                    totalInteractions: interactionData.totalInteractions || 0,
                    pendingInteractions: interactionData.pendingInteractions || 0
                };
            } catch (interactionError) {
                console.warn('Could not fetch interaction counts, using fallback:', interactionError);
                // Keep the fallback values
            }

            
            setDashboardData({
                totalCustomers: customers.length,
                newCustomersThisMonth,
                totalInteractions: interactionCounts.totalInteractions,
                pendingInteractions: interactionCounts.pendingInteractions,
                customerTypeDistribution
            });

        } catch (err) {
            console.error('Dashboard error:', err);
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleNavigateToCustomers = () => {
        navigate('/customers');
    };

    const handleNavigateToRegistration = () => {
        navigate('/customers/register');
    };

    const handleNavigateToUserRegistration = () => {
        navigate('/users');
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="error-state">
                    <h3>Error Loading Dashboard</h3>
                    <p>{error}</p>
                    <button onClick={fetchDashboardData} className="btn-primary">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }
    // console.log('Auth',localStorage.getItem('authToken'));
    // if(localStorage.getItem('dummy')!==false){
    //.    localStorage.setItem('dummy',false);
    //.    window.location.reload();
    // }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Welcome back, {userName || 'User'}!</h1>
                <p>Here's an overview of your customer management system</p>
            </div>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <div className="stat-value">{dashboardData.totalCustomers}</div>
                    <div className="stat-label">Total Customers</div>
                    <button
                        onClick={handleNavigateToCustomers}
                        className="stat-action"
                    >
                        View All
                    </button>
                </div>

                <div className="stat-card">
                    <div className="stat-value">{dashboardData.newCustomersThisMonth}</div>
                    <div className="stat-label">New This Month</div>
                </div>

                <div className="stat-card">
                    <div className="stat-value">{dashboardData.totalInteractions}</div>
                    <div className="stat-label">Total Interactions</div>
                </div>

                <div className="stat-card">
                    <div className="stat-value">{dashboardData.pendingInteractions}</div>
                    <div className="stat-label">Pending Interactions</div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="dashboard-section">
                    <h3>Customer Distribution by Type</h3>
                    <div className="customer-type-chart">
                        {Object.entries(dashboardData.customerTypeDistribution).map(([type, count]) => (
                            <div key={type} className="type-item">
                                <div className="type-bar">
                                    <div
                                        className={`type-fill ${type.toLowerCase()}`}
                                        style={{
                                            width: `${(count / dashboardData.totalCustomers) * 100}%`
                                        }}
                                    ></div>
                                </div>
                                <div className="type-info">
                                    <span className="type-name">{type}</span>
                                    <span className="type-count">{count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dashboard-section">
                    <h3>Quick Actions</h3>
                    <div className="quick-actions">
                        <button
                            onClick={handleNavigateToCustomers}
                            className="action-btn"
                        >
                            <div className="action-icon"> 👥</div>
                            <div>View All Customers</div>
                        </button>

                        {userRole === 'ADMIN' && (
                            <button
                                onClick={handleNavigateToRegistration}
                                className="action-btn"
                            >
                                <div className="action-icon">➕</div>
                                <div>Add New Customer</div>
                            </button>
                        )}

                        {userRole === 'ADMIN' && (
                            <button
                                onClick={handleNavigateToUserRegistration}
                                className="action-btn"
                            >
                                <div className="action-icon">👤</div>
                                <div>Register New User</div>
                            </button>
                        )}

                        <button
                            onClick={() => fetchDashboardData()}
                            className="action-btn"
                        >
                            <div className="action-icon">⟳</div>
                            <div>Refresh Data</div>
                        </button>
                    </div>
                </div>
            </div>

            <div className="dashboard-footer">
                <p>Last updated: {new Date().toLocaleString()}</p>
            </div>
        </div>
    );
};

export default Dashboard;