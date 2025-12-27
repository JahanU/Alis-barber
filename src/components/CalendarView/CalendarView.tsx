import { useState, useEffect } from 'react';
import { getAppointmentsForDateRange, Appointment } from '../../services/appointmentService';
import './CalendarView.css';

interface CalendarViewProps {
    onDateClick?: (date: Date) => void;
}

function CalendarView({ onDateClick }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    // Get first and last day of current month
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Load appointments for current month
    useEffect(() => {
        const loadAppointments = async () => {
            setLoading(true);
            try {
                const startDate = firstDayOfMonth.toISOString().split('T')[0];
                const endDate = lastDayOfMonth.toISOString().split('T')[0];
                const data = await getAppointmentsForDateRange(startDate, endDate);
                setAppointments(data);
            } catch (error) {
                console.error('Failed to load appointments:', error);
            } finally {
                setLoading(false);
            }
        };

        loadAppointments();
    }, [currentDate]);

    // Navigate months
    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Generate calendar days
    const generateCalendarDays = () => {
        const days = [];
        const firstDay = firstDayOfMonth.getDay();
        const daysInMonth = lastDayOfMonth.getDate();

        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
        }

        return days;
    };

    // Get appointments for a specific date
    const getAppointmentsForDay = (date: Date | null) => {
        if (!date) return [];
        const dateString = date.toISOString().split('T')[0];
        return appointments.filter(apt => apt.appointment_date === dateString);
    };

    // Check if date is today
    const isToday = (date: Date | null) => {
        if (!date) return false;
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const calendarDays = generateCalendarDays();
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="calendar-view">
            <div className="calendar-header">
                <button onClick={previousMonth} className="btn btn-secondary">
                    ← Previous
                </button>
                <div className="calendar-title">
                    <h3>{monthName}</h3>
                    <button onClick={goToToday} className="btn-today">
                        Today
                    </button>
                </div>
                <button onClick={nextMonth} className="btn btn-secondary">
                    Next →
                </button>
            </div>

            {loading ? (
                <div className="calendar-loading">Loading appointments...</div>
            ) : (
                <div className="calendar-grid">
                    <div className="calendar-day-header">Sun</div>
                    <div className="calendar-day-header">Mon</div>
                    <div className="calendar-day-header">Tue</div>
                    <div className="calendar-day-header">Wed</div>
                    <div className="calendar-day-header">Thu</div>
                    <div className="calendar-day-header">Fri</div>
                    <div className="calendar-day-header">Sat</div>

                    {calendarDays.map((date, index) => {
                        const dayAppointments = getAppointmentsForDay(date);
                        const isCurrentDay = isToday(date);

                        return (
                            <div
                                key={index}
                                className={`calendar-day ${!date ? 'empty' : ''} ${isCurrentDay ? 'today' : ''}`}
                                onClick={() => date && onDateClick && onDateClick(date)}
                            >
                                {date && (
                                    <>
                                        <div className="day-number">{date.getDate()}</div>
                                        {dayAppointments.length > 0 && (
                                            <div className="appointments-indicator">
                                                <span className="appointment-count">
                                                    {dayAppointments.length} {dayAppointments.length === 1 ? 'booking' : 'bookings'}
                                                </span>
                                                <div className="appointment-list">
                                                    {dayAppointments.map(apt => (
                                                        <div key={apt.id} className="appointment-preview">
                                                            <span className="apt-time">
                                                                {apt.appointment_time.substring(0, 5)}
                                                            </span>
                                                            <span className="apt-customer">
                                                                {apt.customer_name}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default CalendarView;
