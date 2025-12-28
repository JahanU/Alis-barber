import Hero from '../../components/Hero/Hero';
import Gallery from '../../components/Gallery/Gallery';
import ShopInfo from '../../components/ShopInfo/ShopInfo';
import Footer from '../../components/Footer/Footer';
import '../../App.css';

function Home() {
    return (
        <div className="Home">
            <Hero />
            <Gallery />
            <ShopInfo />
            <Footer />
        </div>
    );
};

export default Home;
