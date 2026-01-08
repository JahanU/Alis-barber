import { useNavigate } from 'react-router-dom';
import './Hero.css';

function Hero() {
    const navigate = useNavigate();
    return (
        <section className="hero">
            <div className="hero-background">
                <div className="hero-overlay"></div>
            </div>

            <div className="container hero-content">
                <div className="hero-text fade-in">
                    <h1>
                        <span className="hero-title-line text-gradient">Ali's Barber</span>
                        <span className="hero-subtitle">Premium Barbering Excellence</span>
                    </h1>

                    <p className="hero-description">
                        Experience the art of classic barbering with modern style.
                        Book your appointment in seconds and let us transform your look.
                    </p>

                    <div className="hero-actions">
                        <button className="btn btn-primary btn-large" onClick={() => navigate('/book')}>
                            <span>Book Your Appointment</span>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button className="btn btn-secondary btn-large" onClick={() => navigate('/prices')}>
                            <span>Prices</span>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M9 15L14 10L9 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="hero-features slide-up">
                    <div className="feature-card glass">
                        <div className="feature-icon">✂️</div>
                        <h3>Expert Cuts</h3>
                        <p>Master barbers with years of experience</p>
                    </div>

                    <div className="feature-card glass">
                        <div className="feature-icon">⚡</div>
                        <h3>Quick Booking</h3>
                        <p>Select your time slot in just a few clicks</p>
                    </div>

                    <div className="feature-card glass">
                        <div className="feature-icon">🏠</div>
                        <h3>Home Bookings</h3>
                        <p>Enjoy premium barbering in your own space</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
