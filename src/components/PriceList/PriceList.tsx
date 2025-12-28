import { useNavigate } from 'react-router-dom';
import './PriceList.css';
import { SERVICES } from '../../config/services';

function PriceList() {
    const navigate = useNavigate();

    const inShopServices = SERVICES.filter(s => s.category === 'inShop');
    const homeServices = SERVICES.filter(s => s.category === 'home');

    const renderServiceCard = (service: any) => (
        <div key={service.id} className="price-card">
            <div className="price-card-main">
                <div className="service-info">
                    <h3 className="service-title">{service.name}</h3>
                    <p className="service-description">{service.description}</p>
                </div>
                <div className="service-meta">
                    <span className="service-cost">{service.price}</span>
                    <span className="service-time">{service.duration}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="price-list-container">
            <div className="price-list-header">
                <h2>Our Services & Prices</h2>
            </div>

            <div className="service-section">
                <h3 className="section-title">In-Shop Services</h3>
                <div className="price-grid">
                    {inShopServices.map(renderServiceCard)}
                </div>
            </div>

            <div className="service-section">
                <h3 className="section-title">Home Service</h3>
                <div className="price-grid">
                    {homeServices.map(renderServiceCard)}
                </div>
                <p className="section-note">
                    Home Service only covers PR8 and PR9 Postcodes.<br />
                    Contact us to schedule a home service.
                </p>

            </div>

            {/* <div className="view-footer">
                <button className="btn btn-primary btn-large" onClick={() => navigate('/book')}>
                    <span>Book Now</span>
                </button>
            </div> */}


        </div>
    );
};

export default PriceList;
