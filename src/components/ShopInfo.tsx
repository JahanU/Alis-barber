import React from 'react';
import './ShopInfo.css';

const ShopInfo: React.FC = () => {
    const hours = [
        { day: 'Monday', time: '9 am – 6 pm' },
        { day: 'Tuesday', time: '9 am – 6 pm' },
        { day: 'Wednesday', time: '9 am – 6 pm' },
        { day: 'Thursday', time: '9 am – 6 pm' },
        { day: 'Friday', time: '9 am – 7 pm' },
        { day: 'Saturday', time: '9 am – 7 pm' },
        { day: 'Sunday', time: '10 am – 6 pm' },
    ];

    return (
        <section className="shop-info">
            <div className="container">
                <div className="shop-info-grid">
                    <div className="shop-details">
                        <a
                            href="https://www.google.com/maps/search/?api=1&query=63+Eastbank+St,+Southport+PR8+1EJ"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="info-card location-card"
                        >
                            <h3>📍 Visit Us</h3>
                            <p className="address">
                                63 Eastbank St<br />
                                Southport<br />
                                PR8 1EJ
                            </p>
                            <span className="click-hint">Click for Map ↗</span>
                        </a>
                    </div>

                    <div className="shop-hours">
                        <div className="info-card">
                            <h3>⏰ Opening Hours</h3>
                            <div className="hours-table">
                                {hours.map((item) => (
                                    <div key={item.day} className="hours-row">
                                        <span className="day">{item.day}</span>
                                        <span className="time">{item.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ShopInfo;
