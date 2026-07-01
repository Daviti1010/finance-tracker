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
    const [passwordError, setPasswordError] = useState("");
    const [loading, setLoading] = useState(false);
    const [buttonText, setButtonText] = useState("Create Account")

    const [clickedOnScreen, setClickedOnScreen] = useState(false)

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

    function validatePassword(value: string) {
        if (value.length === 0) {
            setPasswordError("");
        } else if (value.length < 8) {
            setPasswordError("Password must be at least 8 characters")
        } else {
            setPasswordError("")
        }
    }

    function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault()
        const value = e.target.value;
        setPassword(value);
        // console.log(e.target.value);

        if (clickedOnScreen) {
            validatePassword(value);
        }
    }

    function handleBlur() {
        setClickedOnScreen(true);
        validatePassword(password)
    } 

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError("")

        if (!username || !email || !password) {
            setError("All fields are required")
            return
        } else {
            setLoading(true);
        }

        try {
            const response = await register(username, email, password)
            const data = await response.json()

            if (data.success === true) {
                setButtonText("Creating account...")

                setTimeout(() => {
                    navigate("/login")
                }, 1500);
                
            } else {
                console.log("Registration Error!")
                if (data.error === "Field Error") {
                    setError(data.message)
                } else if (data.error === "Password Error") {
                    setError("")   // this error already exists in ValidatePassword 
                } else {
                    setError(data.message)
                }
                return;
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
                    <input value={password} onChange={handlePasswordChange} onBlur={handleBlur} type="password" 
                        id="password" name="password" placeholder="At least 8 characters" />
                </div>

                {error && <p className="error-text">{error}</p>}
                {passwordError && <p className="password-error-text">{passwordError}</p>}

                <button type="submit" className="submit-btn" disabled={loading}>{buttonText}</button>

                <p className="footer-text">Already have an account? <Link to="/login">Sign in</Link></p>
            </form>
        </div>
    )
}