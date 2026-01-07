import './TimeSlotPicker.css';
import { formatDuration } from '../../utils/duration';

interface TimeSlotPickerProps {
    selectedDate: string;
    selectedSlot: string;
    onSlotSelect: (slot: string) => void;
    availableSlots: string[];
    durationMinutes: number;
}

function TimeSlotPicker({
    selectedDate,
    selectedSlot,
    onSlotSelect,
    availableSlots,
    durationMinutes = 30,
}: TimeSlotPickerProps) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="time-slot-picker">
            <div className="time-slot-header">
                <h3>Select Your Time</h3>
                {selectedDate && (
                    <p className="selected-date">{formatDate(selectedDate)}</p>
                )}
            </div>

            {!selectedDate ? (
                <p className="picker-hint">Please select a date first</p>
            ) : (
                <div className="time-slots-grid">
                    {availableSlots.map((slot) => (
                        <button
                            type="button"
                            key={slot}
                            className={`time-slot ${selectedSlot === slot ? 'selected' : ''}`}
                            onClick={() => onSlotSelect(slot)}
                        >
                            <span className="slot-time">{slot}</span>
                            <span className="slot-duration">{formatDuration(durationMinutes)}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TimeSlotPicker;
