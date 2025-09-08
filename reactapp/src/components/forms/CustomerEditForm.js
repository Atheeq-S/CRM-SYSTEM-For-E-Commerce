// components/forms/CustomerEditForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerAPI, authAPI } from '../../utils/api';
import './CustomerEditForm.css';

const CustomerEditForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        customerType: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const customerTypes = ['REGULAR', 'PREMIUM', 'VIP'];

    useEffect(() => {
        if (!authAPI.isAdmin()) {
            navigate('/');
            return;
        }

        fetchCustomer();
    }, [id, navigate]);

    const fetchCustomer = async () => {
        try {
            setLoading(true);
            const customer = await customerAPI.getById(id);
            setFormData({
                firstName: customer.firstName || '',
                lastName: customer.lastName || '',
                email: customer.email || '',
                phoneNumber: customer.phoneNumber || '',
                customerType: customer.customerType || ''
            });
        } catch (err) {
            setError('Failed to load customer data');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.customerType) newErrors.customerType = 'Customer type is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSaving(true);
        setError('');

        try {
            await customerAPI.update(id, formData);
            navigate(`/customers/${id}`, {
                state: { message: 'Customer updated successfully' }
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleCancel = () => {
        navigate(`/customers/${id}`);
    };

    if (loading) {
        return (
            <div data-testid="loading" className="loading-message">
                Loading customer data...
            </div>
        );
    }

    return (
        <div className="edit-form-container">
            <div className="edit-form-card">
                <h2 className="edit-form-title">Edit Customer</h2>

                {error && (
                    <div data-testid="error-message" className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">First Name</label>
                        <input
                            data-testid="firstName-input"
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="form-input"
                            disabled={saving}
                        />
                        {errors.firstName && (
                            <div data-testid="firstName-error" className="form-error">
                                {errors.firstName}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Last Name</label>
                        <input
                            data-testid="lastName-input"
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="form-input"
                            disabled={saving}
                        />
                        {errors.lastName && (
                            <div data-testid="lastName-error" className="form-error">
                                {errors.lastName}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            data-testid="email-input"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-input"
                            disabled={saving}
                        />
                        {errors.email && (
                            <div data-testid="email-error" className="form-error">
                                {errors.email}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input
                            data-testid="phoneNumber-input"
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="form-input"
                            disabled={saving}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Customer Type</label>
                        <select
                            data-testid="customerType-select"
                            name="customerType"
                            value={formData.customerType}
                            onChange={handleChange}
                            className="form-select"
                            disabled={saving}
                        >
                            <option value="">Select</option>
                            {customerTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        {errors.customerType && (
                            <div data-testid="customerType-error" className="form-error">
                                {errors.customerType}
                            </div>
                        )}
                    </div>

                    <div className="button-group">
                        <button
                            data-testid="save-btn"
                            type="submit"
                            className="btn-primary"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>

                        <button
                            data-testid="cancel-btn"
                            type="button"
                            onClick={handleCancel}
                            className="btn-primary"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerEditForm;