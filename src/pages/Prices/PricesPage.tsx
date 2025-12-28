import PriceList from "../../components/PriceList/PriceList";
import Footer from "../../components/Footer/Footer";

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
