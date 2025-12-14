import React, { useState } from 'react';
import TimeSlotPicker from './TimeSlotPicker';
import { getAvailableTimeSlots } from '../services/googleCalendar';
import './BookingForm.css';

const SERVICES = [
    { id: 'haircut', name: 'Classic Haircut', duration: '1 hour' },
    { id: 'beard', name: 'Beard Trim & Shape', duration: '1 hour' },
    { id: 'full', name: 'Full Service (Haircut + Beard)', duration: '1 hour' },
    { id: 'shave', name: 'Hot Towel Shave', duration: '1 hour' },
];

const BookingForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        service: '',
        date: '',
        timeSlot: '',
    });

    const [errors, setErrors] = useState({});

    const availableSlots = formData.date ? getAvailableTimeSlots(new Date(formData.date)) : [];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSlotSelect = (slot) => {
        setFormData(prev => ({ ...prev, timeSlot: slot }));
        if (errors.timeSlot) {
            setErrors(prev => ({ ...prev, timeSlot: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.customerName.trim()) {
            newErrors.customerName = 'Name is required';
        }

        if (!formData.customerEmail.trim()) {
            newErrors.customerEmail = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
            newErrors.customerEmail = 'Please enter a valid email';
        }

        if (!formData.customerPhone.trim()) {
            newErrors.customerPhone = 'Phone number is required';
        }

        if (!formData.service) {
            newErrors.service = 'Please select a service';
        }

        if (!formData.date) {
            newErrors.date = 'Please select a date';
        } else {
            const selectedDate = new Date(formData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                newErrors.date = 'Please select a future date';
            }
        }

        if (!formData.timeSlot) {
            newErrors.timeSlot = 'Please select a time slot';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            onSubmit(formData);
        }
    };

    // Get today's date in YYYY-MM-DD format for min attribute
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="booking-form-container">
            <div className="booking-form-header">
                <h2>Book Your Appointment</h2>
                <button className="close-btn" onClick={onCancel} aria-label="Close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="booking-form">
                <div className="form-section">
                    <h3>Personal Information</h3>

                    <div className="form-group">
                        <label htmlFor="customerName">Full Name *</label>
                        <input
                            type="text"
                            id="customerName"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className={errors.customerName ? 'error' : ''}
                        />
                        {errors.customerName && <span className="error-message">{errors.customerName}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="customerEmail">Email *</label>
                            <input
                                type="email"
                                id="customerEmail"
                                name="customerEmail"
                                value={formData.customerEmail}
                                onChange={handleInputChange}
                                placeholder="john@example.com"
                                className={errors.customerEmail ? 'error' : ''}
                            />
                            {errors.customerEmail && <span className="error-message">{errors.customerEmail}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="customerPhone">Phone *</label>
                            <input
                                type="tel"
                                id="customerPhone"
                                name="customerPhone"
                                value={formData.customerPhone}
                                onChange={handleInputChange}
                                placeholder="+44 7123 456789"
                                className={errors.customerPhone ? 'error' : ''}
                            />
                            {errors.customerPhone && <span className="error-message">{errors.customerPhone}</span>}
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Service Selection</h3>

                    <div className="form-group">
                        <label htmlFor="service">Choose Your Service *</label>
                        <div className="service-grid">
                            {SERVICES.map(service => (
                                <label
                                    key={service.id}
                                    className={`service-card ${formData.service === service.id ? 'selected' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="service"
                                        value={service.id}
                                        checked={formData.service === service.id}
                                        onChange={handleInputChange}
                                    />
                                    <div className="service-content">
                                        <span className="service-name">{service.name}</span>
                                        <span className="service-duration">{service.duration}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                        {errors.service && <span className="error-message">{errors.service}</span>}
                    </div>
                </div>

                <div className="form-section">
                    <h3>Date & Time</h3>

                    <div className="form-group">
                        <label htmlFor="date">Select Date *</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            min={today}
                            className={errors.date ? 'error' : ''}
                        />
                        {errors.date && <span className="error-message">{errors.date}</span>}
                    </div>

                    <TimeSlotPicker
                        selectedDate={formData.date}
                        selectedSlot={formData.timeSlot}
                        onSlotSelect={handleSlotSelect}
                        availableSlots={availableSlots}
                    />
                    {errors.timeSlot && <span className="error-message">{errors.timeSlot}</span>}
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                        Confirm Booking
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookingForm;
