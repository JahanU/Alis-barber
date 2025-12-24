import { useState } from 'react';
import './BookingForm.css';
import { Customer, Service, SERVICES } from '../../config/calendar';
import { BookingData, getAvailableTimeSlots } from '../../services/googleCalendar';
import TimeSlotPicker from '../TimeSlotPicker/TimeSlotPicker';



interface BookingFormProps {
    onSubmit: (data: BookingData) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

interface FormData {
    date: string;
    timeSlot: string;
    payInStore: boolean;
    customer: Customer,
    service: Service | undefined;
}

function BookingForm({ onSubmit, onCancel, isSubmitting = false }: BookingFormProps) {
    const [formData, setFormData] = useState<FormData>({
        customer: {
            name: 'Adam',
            email: 'adam@adam.com',
            phone: '1234567890',
        },
        service: SERVICES[0],
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        timeSlot: '',
        payInStore: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const availableSlots = formData.date ? getAvailableTimeSlots(new Date(formData.date)) : [];


    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value, type, checked } = e.target;
        console.log(name, value, type, checked);
        setFormData(prev => {
            if (name.startsWith('customer.')) {
                const field = name.split('.')[1];
                return {
                    ...prev,
                    customer: {
                        ...prev.customer,
                        [field]: value
                    }
                };
            }
            if (name === 'service') {
                return {
                    ...prev,
                    service: SERVICES.find(s => s.id === value) // id -> Service
                };
            }
            return {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };
        });
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };


    const handleSlotSelect = (slot: string) => {
        setFormData(prev => ({ ...prev, timeSlot: slot }));
        if (errors.timeSlot) {
            setErrors(prev => ({ ...prev, timeSlot: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.customer.name.trim()) {
            newErrors['customer.name'] = 'Name is required';
        }

        if (!formData.customer.email.trim()) {
            newErrors['customer.email'] = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.customer.email)) {
            newErrors['customer.email'] = 'Please enter a valid email';
        }

        if (!formData.customer.phone.trim()) {
            newErrors['customer.phone'] = 'Phone number is required';
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            if (formData.payInStore) {
                // Pay in store: proceed with normal booking flow
                onSubmit(formData as BookingData);
            } else {
                // Stripe payment: create checkout session
                try {
                    const response = await fetch('/.netlify/functions/create-checkout-session', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData),
                    });

                    if (!response.ok) {
                        throw new Error('Failed to create checkout session');
                    }

                    const { url } = await response.json();

                    // Redirect to Stripe Checkout
                    window.location.href = url;
                } catch (error) {
                    console.error('Checkout error:', error);
                    alert('Failed to start payment process. Please try again.');
                }
            }
        }
    };

    // Get today's date in YYYY-MM-DD format for min attribute
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="booking-form-container">
            <div className="booking-form-header">
                <h2>Book Your Appointment</h2>

            </div>

            <form onSubmit={handleSubmit} className="booking-form">
                <div className="form-section">
                    <h3>Personal Information</h3>

                    <div className="form-group">
                        <label htmlFor="customer.name">Full Name *</label>
                        <input
                            type="text"
                            id="customer.name"
                            name="customer.name"
                            value={formData.customer.name}
                            onChange={handleInputChange}
                            placeholder="Adam Nolan"
                            className={errors['customer.name'] ? 'error' : ''}
                        />
                        {errors['customer.name'] && <span className="error-message">{errors['customer.name']}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="customer.email">Email *</label>
                            <input
                                type="email"
                                id="customer.email"
                                name="customer.email"
                                value={formData.customer.email}
                                onChange={handleInputChange}
                                placeholder="adam@gmail.com"
                                className={errors['customer.email'] ? 'error' : ''}
                            />
                            {errors['customer.email'] && <span className="error-message">{errors['customer.email']}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="customer.phone">Phone *</label>
                            <input
                                type="tel"
                                id="customer.phone"
                                name="customer.phone"
                                value={formData.customer.phone}
                                onChange={handleInputChange}
                                placeholder="+44 7123 456789"
                                className={errors['customer.phone'] ? 'error' : ''}
                            />
                            {errors['customer.phone'] && <span className="error-message">{errors['customer.phone']}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="checkbox-container">
                            <input
                                type="checkbox"
                                name="payInStore"
                                checked={formData.payInStore}
                                onChange={handleInputChange}
                            />
                            <span className="checkbox-label">Pay in store</span>
                        </label>
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
                                    className={`service-card ${formData.service?.id === service.id ? 'selected' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="service"
                                        value={service.id}
                                        checked={formData.service?.id === service.id}
                                        onChange={handleInputChange}
                                    />
                                    <div className="service-content">
                                        <span className="service-name">{service.name}</span>
                                        <div className="service-details">
                                            <span className="service-duration">{service.duration}</span>
                                            <span className="service-price">{service.price}</span>
                                        </div>
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
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookingForm;
