// pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await authAPI.login(formData);

            // Handle different response formats
            let authData = {
                token: response.token,
                role: response.user?.role || response.role || 'USER',
                username: response.user?.username || response.username || formData.username
            };

            // If no token received, throw error
            if (!authData.token) {
                throw new Error('Invalid server response - no token received');
            }

            // Save auth data to localStorage
            localStorage.setItem('authToken', authData.token);
            localStorage.setItem('userRole', authData.role);
            localStorage.setItem('username', authData.username);
            localStorage.setItem('dummy', true);

            console.log('Login successful:', {
                token: !!authData.token,
                role: authData.role,
                username: authData.username,
                authToken: authData.token
            });

            // Update authentication state in parent component
            if (onLoginSuccess) {
                console.log('Calling onLoginSuccess callback');
                onLoginSuccess();
            } else {
                console.warn('onLoginSuccess callback not provided');
            }

            // Navigate to dashboard
            navigate('/dashboard', { replace: true });

        } catch (err) {
            console.error('Login error:', err);

            // Handle different types of errors
            if (err.message.includes('401') || err.message.includes('403') ||
                err.message.includes('Invalid credentials') || err.message.includes('Unauthorized')) {
                setError('Invalid username or password');
            } else if (err.message.includes('Network')) {
                setError('Network error. Please check your connection and try again.');
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-title">CRM System Login</h1>
                    <p className="login-subtitle">Sign in to access your account</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            data-testid="username-input"
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="form-input"
                            disabled={loading}
                            placeholder="Enter your username"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            data-testid="password-input"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-input"
                            disabled={loading}
                            placeholder="Enter your password"
                        />
                    </div>

                    {error && (
                        <div data-testid="error-message" className="error-message">
                            {error}
                        </div>
                    )}

                    <button
                        data-testid="login-btn"
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="demo-credentials">
                    <h4>Demo Credentials:</h4>
                    <div className="credentials-grid">
                        <div>
                            <strong>Admin:</strong>
                            <br />Username: admin
                            <br />Password: admin123
                        </div>
                        <div>
                            <strong>Sales Rep:</strong>
                            <br />Username: sales
                            <br />Password: sales123
                        </div>
                        <div>
                            <strong>Analyst:</strong>
                            <br />Username: analyst
                            <br />Password: analyst123
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;