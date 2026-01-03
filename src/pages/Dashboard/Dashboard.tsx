import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    StaffAvailability,
    DAY_NAMES,
    getMyAvailability,
    saveAllAvailability
} from '../../services/availabilityService';
import CalendarView from '../../components/CalendarView/CalendarView';
import AppointmentsList from '../../components/AppointmentsList/AppointmentsList';
import './Dashboard.css';

// Group availability ranges by day
interface DayAvailability {
    day_of_week: number;
    ranges: StaffAvailability[];
}

function Dashboard() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'template' | 'calendar' | 'appointments'>('calendar');
    const [availability, setAvailability] = useState<DayAvailability[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Initialize with empty structure for all 7 days
    const initializeEmptyAvailability = (): DayAvailability[] => {
        return DAY_NAMES.map((_, index) => ({
            day_of_week: index,
            ranges: []
        }));
    };

    // Load existing availability on mount
    useEffect(() => {
        const loadAvailability = async () => {
            try {
                const data = await getMyAvailability();

                // Group by day_of_week
                const grouped = initializeEmptyAvailability();
                data.forEach(range => {
                    // Sanitize HH:MM:SS to HH:MM
                    const sanitizedRange = {
                        ...range,
                        start_time: range.start_time.substring(0, 5),
                        end_time: range.end_time.substring(0, 5)
                    };
                    grouped[range.day_of_week].ranges.push(sanitizedRange);
                });

                setAvailability(grouped);
            } catch (error) {
                console.error('Failed to load availability:', error);
                setAvailability(initializeEmptyAvailability());
            } finally {
                setLoading(false);
            }
        };

        loadAvailability();
    }, []);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const handleAddTimeRange = (dayIndex: number) => {
        setAvailability(prev => prev.map(day =>
            day.day_of_week === dayIndex
                ? {
                    ...day,
                    ranges: [...day.ranges, {
                        day_of_week: dayIndex,
                        start_time: '09:00',
                        end_time: '17:00',
                        // TODO ?
                        // is_available: true,
                    }]
                }
                : day
        ));
    };

    const handleRemoveTimeRange = (dayIndex: number, rangeIndex: number) => {
        setAvailability(prev => prev.map(day =>
            day.day_of_week === dayIndex
                ? {
                    ...day,
                    ranges: day.ranges.filter((_, idx) => idx !== rangeIndex)
                }
                : day
        ));
    };

    const handleTimeChange = (dayIndex: number, rangeIndex: number, field: 'start_time' | 'end_time', value: string) => {
        setAvailability(prev => prev.map(day =>
            day.day_of_week === dayIndex
                ? {
                    ...day,
                    ranges: day.ranges.map((range, idx) =>
                        idx === rangeIndex
                            ? { ...range, [field]: value }
                            : range
                    )
                }
                : day
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            // Flatten all ranges from all days
            const allRanges = availability.flatMap(day => day.ranges);
            await saveAllAvailability(allRanges);
            setMessage({ type: 'success', text: 'Availability saved successfully!' });
        } catch (error) {
            console.error('Failed to save availability:', error);
            setMessage({ type: 'error', text: 'Failed to save. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    // Generate time options for dropdowns
    const timeOptions: { value: string; label: string }[] = [];
    for (let hour = 6; hour <= 23; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const period = hour >= 12 ? 'PM' : 'AM';
        timeOptions.push({ value: time, label: `${displayHour}:00 ${period}` });
    }

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-state">Loading availability...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav glass-strong">
                <div className="nav-content">
                    <h1>Ali Barbers</h1>
                    <div className="nav-actions">
                        <span className="user-email">{user?.email}</span>
                        <button onClick={handleSignOut} className="btn btn-secondary">
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            <main className="dashboard-main">
                <div className="dashboard-header">
                    <h2>Staff Dashboard</h2>
                    <p>Manage your availability and appointments</p>
                </div>

                <div className="dashboard-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'template' ? 'active' : ''}`}
                        onClick={() => setActiveTab('template')}
                    >
                        Weekly Template
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
                        onClick={() => setActiveTab('calendar')}
                    >
                        Calendar
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('appointments')}
                    >
                        Appointments
                    </button>
                </div>

                {activeTab === 'template' && (
                    <div className="availability-section glass-strong">
                        <div className="section-header">
                            <h3>Weekly Availability</h3>
                            <button
                                onClick={handleSave}
                                className="btn btn-primary"
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                        {message && (
                            <div className={`message ${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="availability-grid">
                            {availability.map((day) => (
                                <div key={day.day_of_week} className="day-card glass-strong">
                                    <div className="day-header">
                                        <span className="day-name">{DAY_NAMES[day.day_of_week]}</span>
                                        <button
                                            onClick={() => handleAddTimeRange(day.day_of_week)}
                                            className="btn-add-range"
                                            title="Add time range"
                                        >
                                            + Add
                                        </button>
                                    </div>

                                    {day.ranges.length === 0 ? (
                                        <div className="day-closed">
                                            Closed - Click "+ Add" to set hours
                                        </div>
                                    ) : (
                                        <div className="time-ranges">
                                            {day.ranges.map((range, rangeIndex) => (
                                                <div key={rangeIndex} className="time-range-item">
                                                    <div className="time-selectors">
                                                        <div className="time-field">
                                                            <label>Start</label>
                                                            <select
                                                                value={range.start_time}
                                                                onChange={(e) => handleTimeChange(day.day_of_week, rangeIndex, 'start_time', e.target.value)}
                                                            >
                                                                {timeOptions.map(opt => (
                                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="time-field">
                                                            <label>End</label>
                                                            <select
                                                                value={range.end_time}
                                                                onChange={(e) => handleTimeChange(day.day_of_week, rangeIndex, 'end_time', e.target.value)}
                                                            >
                                                                {timeOptions.map(opt => (
                                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveTimeRange(day.day_of_week, rangeIndex)}
                                                        className="btn-remove-range"
                                                        title="Remove this time range"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'calendar' && (
                    <div className="section-container glass-strong">
                        <CalendarView />
                    </div>
                )}

                {activeTab === 'appointments' && (
                    <div className="section-container glass-strong">
                        <AppointmentsList />
                    </div>
                )}
            </main>
        </div>
    );
}

export default Dashboard;
