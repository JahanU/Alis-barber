import './ShopInfo.css';

function ShopInfo() {
    const hours = [
        { day: 'Monday', time: '09:00 am – 06:00 pm' },
        { day: 'Tuesday', time: '09:00 am – 06:00 pm' },
        { day: 'Wednesday', time: '09:00 am – 06:00 pm' },
        { day: 'Thursday', time: '09:00 am – 06:00 pm' },
        { day: 'Friday', time: '09:00 am – 06:00 pm' },
        { day: 'Saturday', time: '09:00 am – 06:00 pm' },
        { day: 'Sunday', time: '10:00 am – 04:00 pm' },
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
