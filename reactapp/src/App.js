// App.js
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import CustomerList from './pages/CustomerList';
import CustomerDetails from './pages/CustomerDetails';
import CustomerRegistrationForm from './components/forms/CustomerRegistrationForm';
import CustomerEditForm from './components/forms/CustomerEditForm';
import Dashboard from './pages/Dashboard';
import AnalystDashboard from './pages/AnalystDashboard';
import Navbar from './layouts/Navbar';
import UserRegistrationForm from './components/forms/UserRegistrationForm';
import UserList from './pages/UserList';
import UserEdit from './pages/UserEdit';
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [username, setUsername] = useState(null);

    // Check authentication status
    const checkAuthStatus = useCallback(() => {
        const token = localStorage.getItem('authToken');
        const role = localStorage.getItem('userRole');
        const name = localStorage.getItem('username');

        const wasAuthenticated = isAuthenticated;
        const newAuthState = !!token;

        setIsAuthenticated(newAuthState);
        setUserRole(role);
        setUsername(name);

        // Log authentication state changes for debugging
        if (wasAuthenticated !== newAuthState) {
            console.log('Authentication state changed:', {
                wasAuthenticated,
                isAuthenticated: newAuthState,
                userRole: role,
                username: name
            });
        }
    }, [isAuthenticated]);

    // Update authentication state
    const updateAuthState = useCallback(() => {
        checkAuthStatus();

        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('authStateChanged'));
    }, [checkAuthStatus]);

    // Check authentication status on component mount and when localStorage changes
    useEffect(() => {
        // Check initial status
        checkAuthStatus();

        // Listen for storage changes (when localStorage is updated from other tabs/windows)
        const handleStorageChange = (e) => {
            if (e.key === 'authToken' || e.key === 'userRole' || e.key === 'username') {
                checkAuthStatus();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Custom event listener for authentication changes within the same tab
        const handleAuthChange = () => {
            checkAuthStatus();
        };

        window.addEventListener('authStateChanged', handleAuthChange);

        // Listen for focus events to check auth status when tab becomes active
        const handleFocus = () => {
            checkAuthStatus();
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('authStateChanged', handleAuthChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [checkAuthStatus]);

    const PublicRoute = ({ children }) => {
        return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
    };

    return (
        <Router>
            <div className="App">
                {/* Show navbar only when authenticated */}
                {isAuthenticated && <Navbar userRole={userRole} username={username} onLogout={updateAuthState} />}

                <main className={`main-content ${isAuthenticated ? 'with-navbar' : ''}`}>
                    <Routes>
                        {/* Public Routes */}
                        <Route
                            path="/login"
                            element={
                                <PublicRoute>
                                    <Login onLoginSuccess={updateAuthState} />
                                </PublicRoute>
                            }
                        />

                        {/* Protected Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/customers"
                            element={
                                <ProtectedRoute>
                                    <CustomerList />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/customers/:id"
                            element={
                                <ProtectedRoute>
                                    <CustomerDetails />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/customers/register"
                            element={
                                <ProtectedRoute requiredRole="ADMIN">
                                    <CustomerRegistrationForm />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/register"
                            element={
                                <ProtectedRoute requiredRole="ADMIN">
                                    <CustomerRegistrationForm />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/customers/:id/edit"
                            element={
                                <ProtectedRoute requiredRole="ADMIN">
                                    <CustomerEditForm />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/users/register"
                            element={
                                <ProtectedRoute requiredRole="ADMIN">
                                    <UserRegistrationForm />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/users"
                            element={
                                <ProtectedRoute requiredRole="ADMIN">
                                    <UserList />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/users/edit/:id"
                            element={
                                <ProtectedRoute requiredRole="ADMIN">
                                    <UserEdit />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/analytics"
                            element={
                                <ProtectedRoute allowedRoles={["ADMIN", "ANALYST"]}>
                                    <AnalystDashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Default redirects */}
                        <Route
                            path="/"
                            element={
                                isAuthenticated ?
                                    <Navigate to="/dashboard" replace /> :
                                    <Navigate to="/login" replace />
                            }
                        />

                        {/* 404 Route */}
                        <Route
                            path="*"
                            element={
                                <div className="not-found">
                                    <h2>404 - Page Not Found</h2>
                                    <p>The page you are looking for does not exist.</p>
                                    {isAuthenticated && (
                                        <button
                                            onClick={() => window.location.href = '/dashboard'}
                                            className="btn-primary"
                                        >
                                            Go to Dashboard
                                        </button>
                                    )}
                                </div>
                            }
                        />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;