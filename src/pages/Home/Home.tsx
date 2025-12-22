import Hero from '../../components/Hero/Hero';
import Gallery from '../../components/Gallery/Gallery';
import ShopInfo from '../../components/ShopInfo/ShopInfo';
import '../../App.css';

function Home() {
    return (
        <div className="Home">
            <Hero />
            <Gallery />
            <ShopInfo />
            <footer className="app-footer">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} Ali Barbers. Professional Grooming Services.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
