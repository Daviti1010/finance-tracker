import { Link } from 'react-router-dom';
import { useNavigate } from "react-router";
import React, { useState } from 'react';
import { login } from '../../api'
import './Auth.css'
// import { faL } from '@fortawesome/free-solid-svg-icons';

export function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [buttonText, setButtonText] = useState("Log In")

    async function enteringEmail(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        setEmail(e.target.value);
    }

    async function enteringPassword(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        setPassword(e.target.value);
    }

    const navigate = useNavigate();

    async function logIntoAccount(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError("")

        if (!email || !password) {
            setError("All fields are required")
            return
        } else {
            setLoading(true);
        }

        try {
            const response = await login(email, password)
            const data = await response.json();

            // console.log(data);
            if (data.success === true) {
                setButtonText("Logging In...")
                localStorage.setItem("accessToken", data.accessToken)

                setTimeout(() => {
                    navigate("/dashboard")
                }, 1500);

                // console.log(data);
            } else {
                console.log("Login Error!")
                setError(data.message);
                return;
            }

        } catch (err) {
            console.log(err)

        } finally  {
            setLoading(false)
        }
    }

    return (
        <div className="page">
            <form className="container" onSubmit={logIntoAccount}>
                <p className="brand">Finance Tracker</p>
                <h1>Log into your account</h1>

                <div className="field">
                    <label htmlFor="email">Email</label>
                    <input value={email} onChange={enteringEmail} 
                        type="email" id="email" name="email" placeholder="something@example.com"/>
                </div>

                <div className="field">
                    <label htmlFor="password">Password</label>
                    <input value={password} onChange={enteringPassword}
                        type="password" id="password" name="password" placeholder="Your Password" />
                </div>

                {error && <p className="error-text">{error}</p>}

                <button type="submit" className="submit-btn" disabled={loading}>{buttonText}</button>

                <p className="footer-text">Do not have an acocunt? <Link to="/register">Sign up</Link></p>
            </form>
        </div>
    )
}