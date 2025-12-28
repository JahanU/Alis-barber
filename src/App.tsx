import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home/Home';
// import Login from './pages/Login/Login';
// import BookingPage from './pages/Booking/BookingPage';
import PricesPage from './pages/Prices/PricesPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/book" element={<BookingPage />} /> */}
          <Route path="/prices" element={<PricesPage />} />
          {/* <Route path="/login" element={<Login />} /> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
