// components/common/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = [], adminOnly = false }) => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');

    // Check authentication
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Check role requirements
    const hasRequiredRole = () => {
        // If adminOnly is true, check for ADMIN role
        if (adminOnly) {
            return userRole === 'ADMIN';
        }

        // If no role requirement, allow access
        if (!requiredRole && allowedRoles.length === 0) {
            return true;
        }

        // Check specific required role
        if (requiredRole) {
            return userRole === requiredRole;
        }

        // Check allowed roles
        if (allowedRoles.length > 0) {
            return allowedRoles.includes(userRole) || userRole === 'ANALYST';
        }

        return false;
    };

    if (!hasRequiredRole()) {
        return (
            <div className="access-denied" style={{
                textAlign: 'center',
                padding: '40px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                margin: '20px'
            }}>
                <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>Access Denied</h2>
                <p style={{ fontSize: '16px', marginBottom: '10px' }}>
                    You do not have permission to access this page.
                </p>
                <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '5px' }}>
                    Required: {requiredRole || (adminOnly ? 'ADMIN' : allowedRoles.join(', '))}
                </p>
                <p style={{ fontSize: '14px', color: '#6c757d' }}>
                    Your role: {userRole || 'Unknown'}
                </p>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;