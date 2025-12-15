import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder for login logic
        console.log('Login attempt:', { email, password });
        alert('Login functionality coming soon!');
    };

    return (
        <div className="login-container">
            <div className="login-card glass-strong">
                <div className="login-header">
                    <h2>Ali Barbers</h2>
                    <p>Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <div className="forgot-password">
                        <Link to="#">Forgot password?</Link>
                    </div>

                    <button type="submit" className="btn btn-primary btn-login">
                        Sign In
                    </button>
                </form>

                <Link to="/" className="back-link">
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
};

export default Login;
