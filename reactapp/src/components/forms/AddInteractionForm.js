

// components/forms/AddInteractionForm.js
import React, { useState, useEffect } from 'react';
import { apiPost, apiPut } from '../../utils/api';
import './AddInteractionForm.css';

const AddInteractionForm = ({ customerId, onSuccess, editingInteraction }) => {
    const [formData, setFormData] = useState({
        interactionType: '',
        description: '',
        status: ''
    });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const interactionTypes = ['PURCHASE', 'INQUIRY', 'SUPPORT', 'COMPLAINT'];
    const statuses = ['OPEN', 'CLOSED', 'PENDING'];

    // Update form when editingInteraction changes
    useEffect(() => {
        if (editingInteraction) {
            setFormData({
                interactionType: editingInteraction.interactionType || '',
                description: editingInteraction.description || '',
                status: editingInteraction.status || ''
            });
        } else {
            // Reset form for new interaction
            setFormData({
                interactionType: '',
                description: '',
                status: ''
            });
        }
        // Clear any existing messages when switching modes
        setSuccessMessage('');
        setErrors({});
    }, [editingInteraction]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.interactionType) newErrors.interactionType = 'Interaction type is required';
        if (!formData.description) newErrors.description = 'Description is required';
        if (!formData.status) newErrors.status = 'Status is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setErrors({});
        setSuccessMessage('');

        try {
            if (editingInteraction) {
                // Update existing interaction
                await apiPut(`/api/interactions/${editingInteraction.id}`, {
                    customerId,
                    ...formData
                });
                setSuccessMessage('Interaction updated successfully');
            } else {
                // Create new interaction
                await apiPost('/api/interactions', {
                    customerId,
                    ...formData
                });
                setSuccessMessage('Interaction added successfully');
                // Reset form only when adding new interaction
                setFormData({
                    interactionType: '',
                    description: '',
                    status: ''
                });
            }

            // Call success callback to refresh data
            onSuccess();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);

        } catch (error) {
            console.error('Error saving interaction:', error);
            setErrors({
                submit: error.message || `Failed to ${editingInteraction ? 'update' : 'add'} interaction`
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const isEditMode = !!editingInteraction;
    const submitButtonText = isEditMode ? 'Update Interaction' : 'Add Interaction';
    const successText = isEditMode ? 'updated' : 'added';

    return (
        <form onSubmit={handleSubmit}>
            <div className="interaction-form-group">
                <label className="interaction-form-label">Interaction Type</label>
                <select
                    data-testid="interactionType-select"
                    name="interactionType"
                    value={formData.interactionType}
                    onChange={handleChange}
                    className="interaction-form-select"
                    disabled={loading}
                >
                    <option value="">Select Interaction Type</option>
                    {interactionTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                {errors.interactionType && (
                    <div data-testid="interactionType-error" className="interaction-form-error">
                        {errors.interactionType}
                    </div>
                )}
            </div>

            <div className="interaction-form-group">
                <label className="interaction-form-label">Description</label>
                <textarea
                    data-testid="description-input"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="interaction-form-textarea"
                    disabled={loading}
                />
                {errors.description && (
                    <div data-testid="description-error" className="interaction-form-error">
                        {errors.description}
                    </div>
                )}
            </div>

            <div className="interaction-form-group-submit">
                <label className="interaction-form-label">Status</label>
                <select
                    data-testid="status-select"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="interaction-form-select"
                    disabled={loading}
                >
                    <option value="">Select Status</option>
                    {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
                {errors.status && (
                    <div data-testid="status-error" className="interaction-form-error">
                        {errors.status}
                    </div>
                )}
            </div>

            {/* Show general submit errors */}
            {errors.submit && (
                <div data-testid="submit-error" className="interaction-form-error">
                    {errors.submit}
                </div>
            )}

            <div className="interaction-submit-container">
                <button
                    data-testid={isEditMode ? "update-btn" : "add-btn"}
                    type="submit"
                    className="interaction-submit-btn"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : submitButtonText}
                </button>
            </div>

            {successMessage && (
                <div data-testid="success-msg" className="interaction-success-message">
                    {successMessage}
                </div>
            )}
        </form>
    );
};

export default AddInteractionForm;