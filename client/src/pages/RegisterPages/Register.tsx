import { Link } from 'react-router-dom';
import { useNavigate } from "react-router";
import React, { useState } from 'react';
import { register } from '../../api'
import './Auth.css'
// import { faL } from '@fortawesome/free-solid-svg-icons';

export function Register() {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault()
        setUsername(e.target.value);
        // console.log(e.target.value);
    }

    function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault()
        setEmail(e.target.value);
        // console.log(e.target.value);
    }

    function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault()
        setPassword(e.target.value);
        // console.log(e.target.value);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError("")

        if (!username || !email || !password) {
            setError("All fields are required")
            return
        } else if (password.length < 8) {
            setError("Password must be at least 8 characters")
            return;
        } else {
            setLoading(true);
        }

        try {
            const response = await register(username, email, password)
            const data = await response.json()

            if (!response.ok) {
                setError(data.message)
                return

            } else {
                navigate("/login")
            }


        } catch (err) {
            console.log(err)

        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page">
            <form className="container" onSubmit={handleSubmit}>
                <p className="brand">Finance Tracker</p>
                <h1>Create an account</h1>
                <p className="subtitle">Start tracking your finances today</p>

                <div className="field">
                    <label htmlFor="username">Username</label>
                    <input value={username} onChange={handleUsernameChange} type="text" 
                        id="username" name="username" placeholder="Username" />
                </div>

                <div className="field">
                    <label htmlFor="email">Email</label>
                    <input value={email} onChange={handleEmailChange} type="email" 
                        id="email" name="email" placeholder="something@example.com"/>
                </div>

                <div className="field">
                    <label htmlFor="password">Password</label>
                    <input value={password} onChange={handlePasswordChange} type="password" 
                        id="password" name="password" placeholder="At least 8 characters" />
                </div>

                {error && <p className="error-text">{error}</p>}

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Creating account..." : "Create account"}
                </button>

                <p className="footer-text">Already have an account? <Link to="/login">Sign in</Link></p>
            </form>
        </div>
    )
}