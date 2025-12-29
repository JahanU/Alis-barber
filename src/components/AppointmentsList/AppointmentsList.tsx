import { useState, useEffect } from 'react';
import { getMyAppointments, cancelAppointment, Appointment } from '../../services/appointmentService';
import './AppointmentsList.css';

function AppointmentsList() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        setLoading(true);
        try {
            const data = await getMyAppointments();
            setAppointments(data);
        } catch (error) {
            console.error('Failed to load appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (appointmentId: string) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        try {
            // Find the appointment to get the google_event_id
            const appointment = appointments.find(apt => apt.id === appointmentId);

            // 1. Cancel in Google Calendar if event ID exists
            if (appointment?.google_event_id) {
                try {
                    const response = await fetch('/.netlify/functions/cancel-booking', {
                        method: 'POST',
                        body: JSON.stringify({
                            eventId: appointment.google_event_id,
                            customerEmail: appointment.customer_email,
                            customerName: appointment.customer_name,
                            serviceName: appointment.service_name,
                            appointmentDate: `${appointment.appointment_date} at ${appointment.appointment_time}`,
                        }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.warn('Google Calendar cancellation failed:', errorData.message);
                        // We continue with local cancellation even if Google fails
                    }
                } catch (gcalError) {
                    console.error('Error calling cancel-booking function:', gcalError);
                }
            }

            // 2. Cancel in Supabase
            await cancelAppointment(appointmentId);

            // Reload appointments
            await loadAppointments();
        } catch (error) {
            console.error('Failed to cancel appointment:', error);
            alert('Failed to cancel appointment. Please try again.');
        }
    };

    const filterAppointments = () => {
        const today = new Date().toISOString().split('T')[0];

        switch (filter) {
            case 'upcoming':
                return appointments.filter(apt =>
                    apt.appointment_date >= today && apt.status === 'confirmed'
                );
            case 'past':
                return appointments.filter(apt =>
                    apt.appointment_date < today || apt.status !== 'confirmed'
                );
            default:
                return appointments;
        }
    };

    const filteredAppointments = filterAppointments();

    if (loading) {
        return <div className="appointments-loading">Loading appointments...</div>;
    }

    return (
        <div className="appointments-list">
            <div className="appointments-header">
                <h3>Appointments</h3>
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setFilter('upcoming')}
                    >
                        Upcoming
                    </button>
                    <button
                        className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
                        onClick={() => setFilter('past')}
                    >
                        Past
                    </button>
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                </div>
            </div>

            {filteredAppointments.length === 0 ? (
                <div className="no-appointments">
                    No {filter !== 'all' ? filter : ''} appointments found.
                </div>
            ) : (
                <div className="appointments-grid">
                    {filteredAppointments.map(apt => (
                        <div key={apt.id} className={`appointment-card glass-strong ${apt.status}`}>
                            <div className="appointment-header">
                                <div className="appointment-date">
                                    <span className="date-day">
                                        {new Date(apt.appointment_date).toLocaleDateString('en-US', { weekday: 'short' })}
                                    </span>
                                    <span className="date-number">
                                        {new Date(apt.appointment_date).getDate()}
                                    </span>
                                    <span className="date-month">
                                        {new Date(apt.appointment_date).toLocaleDateString('en-US', { month: 'short' })}
                                    </span>
                                </div>
                                <div className="appointment-time">
                                    {apt.appointment_time.substring(0, 5)}
                                </div>
                            </div>

                            <div className="appointment-details">
                                <div className="detail-row">
                                    <span className="detail-label">Customer:</span>
                                    <span className="detail-value">{apt.customer_name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Email:</span>
                                    <span className="detail-value">{apt.customer_email}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Phone:</span>
                                    <span className="detail-value">{apt.customer_phone}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Service:</span>
                                    <span className="detail-value">{apt.service_name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Price:</span>
                                    <span className="detail-value">{apt.service_price}</span>
                                </div>
                            </div>

                            <div className="appointment-footer">
                                <div className="status-badges">
                                    <span className={`badge status-${apt.status}`}>
                                        {apt.status}
                                    </span>
                                    <span className={`badge payment-${apt.payment_status}`}>
                                        {apt.payment_status?.replace('_', ' ')}
                                    </span>
                                </div>
                                {apt.status === 'confirmed' && (
                                    <button
                                        onClick={() => handleCancel(apt.id!)}
                                        className="btn-cancel"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AppointmentsList;
