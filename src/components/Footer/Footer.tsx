import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>Contact Us</h3>
                        <a href="tel:07380730540" className="footer-link phone-link">
                            <span className="icon">📞</span>
                            07380 730540
                        </a>
                    </div>

                    <div className="footer-section">
                        <h3>Follow Us</h3>
                        <a
                            href="https://www.instagram.com/ali_barber1/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer-link instagram-link"
                        >
                            <span className="icon">📸</span>
                            @ali_barber1
                        </a>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Ali's Barber. Professional Grooming Services.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
