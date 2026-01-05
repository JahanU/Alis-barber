import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import BookingPage from './pages/Booking/BookingPage';
import PricesPage from './pages/Prices/PricesPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/prices" element={<PricesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
