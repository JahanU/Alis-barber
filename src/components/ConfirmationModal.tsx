import './ConfirmationModal.css';

import { BookingData } from '../services/googleCalendar';

interface ConfirmationModalProps {
    bookingDetails: BookingData;
    onClose: () => void;
    onAddToCalendar: () => void;
    isAddingToCalendar: boolean;
}

function ConfirmationModal({ bookingDetails, onClose, onAddToCalendar, isAddingToCalendar }: ConfirmationModalProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getServiceName = (serviceId: string) => {
        const services: Record<string, string> = {
            haircut: 'Classic Haircut',
            beard: 'Beard Trim & Shape',
            full: 'Full Service (Haircut + Beard)',
            shave: 'Hot Towel Shave',
        };
        return services[serviceId] || serviceId;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-strong" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="success-icon">
                        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                            <circle cx="30" cy="30" r="28" stroke="var(--color-primary)" strokeWidth="3" />
                            <path d="M18 30L26 38L42 22" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h2>Booking Confirmed!</h2>
                    <p className="success-message">Your appointment has been successfully booked.</p>
                </div>

                <div className="booking-details">
                    <div className="detail-row">
                        <span className="detail-label">Name:</span>
                        <span className="detail-value">{bookingDetails.customerName}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{bookingDetails.customerEmail}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{bookingDetails.customerPhone}</span>
                    </div>

                    <div className="detail-row highlight">
                        <span className="detail-label">Service:</span>
                        <span className="detail-value">{getServiceName(bookingDetails.service)}</span>
                    </div>

                    <div className="detail-row highlight">
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">{formatDate(bookingDetails.date)}</span>
                    </div>

                    <div className="detail-row highlight">
                        <span className="detail-label">Time:</span>
                        <span className="detail-value">{bookingDetails.timeSlot}</span>
                    </div>
                </div>

                <div className="modal-actions">
                    <button
                        className="btn btn-primary btn-calendar"
                        onClick={onAddToCalendar}
                        disabled={isAddingToCalendar}
                    >
                        {isAddingToCalendar ? (
                            <>
                                <span className="spinner"></span>
                                Adding to Calendar...
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                                    <path d="M7 2V6M13 2V6M3 8H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                Add to Google Calendar
                            </>
                        )}
                    </button>

                    <button className="btn btn-secondary" onClick={onClose}>
                        Done
                    </button>
                </div>

                <div className="reminder-note">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke="var(--color-primary)" strokeWidth="1.5" />
                        <path d="M8 4V8L11 11" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <p>A confirmation email will be sent to you shortly. We look forward to seeing you!</p>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
