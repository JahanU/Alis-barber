import React from 'react';
import './TimeSlotPicker.css';

const TimeSlotPicker = ({ selectedDate, selectedSlot, onSlotSelect, availableSlots }) => {
    const formatDate = (date) => {
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
                            key={slot}
                            className={`time-slot ${selectedSlot === slot ? 'selected' : ''}`}
                            onClick={() => onSlotSelect(slot)}
                        >
                            <span className="slot-time">{slot}</span>
                            <span className="slot-duration">1 hour</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TimeSlotPicker;
