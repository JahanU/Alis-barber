import Footer from "../../components/Footer/Footer";
import PriceList from "../../components/PriceList/PriceList";

function PricesPage() {
    return (
        <div className="prices-page-view">
            <div className="prices-view">
                <div className="container">
                    <PriceList />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PricesPage;
