import { Link } from 'react-router-dom';
import './Register.css'

export function Register() {

    return (
        <div className="page">
            <form className="container">
                <p className="brand">Finance Tracker</p>
                <h1>Create an account</h1>
                <p className="subtitle">Start tracking your finances today</p>

                <div className="field">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" name="username" placeholder="Username" />
                </div>

                <div className="field">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" placeholder="something@example.com" />
                </div>

                <div className="field">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="At least 8 characters" />
                </div>

                <button type="submit" className="submit-btn">Create account</button>

                <p className="footer-text">Already have an account? <Link to="/login">Sign in</Link></p>
            </form>
        </div>
    )
}