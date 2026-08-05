import { Link } from 'react-router-dom';
import { useNavigate } from "react-router";
import React, { useState, useRef } from 'react';
import { checkUsername, register } from '../../api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './Auth.css'

interface PasswordCheck {
    label: string;
    passed: boolean;
}

export function Register() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const [loading, setLoading] = useState(false);
    const [buttonText, setButtonText] = useState("Create Account")

    const [error, setError] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [usernameAvailable, setUsernameAvailable] = useState(false);

    const [checkingUsername, setCheckingUsername] = useState(false);

    const [touchedPassword, setTouchedPassword] = useState(false)


    const [showPassword, setShowPassword] = useState(false);
    
    const passwordInputRef = useRef<HTMLInputElement>(null);

    function toggleShowPassword() {
        // console.log("toggle called, current showPassword:", showPassword);
        const input = passwordInputRef.current;
        const cursorPosition = input?.selectionStart ?? 0;

        setShowPassword(!showPassword);
        setTouchedPassword(true);
        validatePassword(password);

        requestAnimationFrame(() => {
            input?.setSelectionRange(cursorPosition, cursorPosition);
            input?.focus();
        });
    }


    // function toggleShowPassword() {
    //     setShowPassword(!showPassword);
    // }

    function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault()
        const value = e.target.value
        setUsername(value);
        // console.log(e.target.value);
    }

    async function validateUsername(value: string) {
        if (value.length === 0) {
            setUsernameError("");
            return;
        }

        setCheckingUsername(true);

        try {
            const response = await checkUsername(value);
            const data = await response.json();

            if (data.exists) {
                setTimeout(() => {
                    setUsernameError("Username is already in use.")
                    setUsernameAvailable(false)
                }, 1500);
            } else {
                setTimeout(() => {
                    setUsernameError("")
                    setUsernameAvailable(true)
                }, 1500);
            }

        } catch (err) {
            console.log(err);
        } finally {
            setTimeout(() => {
                setCheckingUsername(false)
            }, 1500);
        }
    }

    const handleUsernameBlur = () => {
        validateUsername(username)
    }

    ////////////////////

    function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault()
        setEmail(e.target.value);
        // console.log(e.target.value);
    }

    ////////////////////

    function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault()
        const value = e.target.value;
        setPassword(value);
        // console.log(e.target.value);

        if (touchedPassword) {
            validatePassword(value);
        }
    }

    function validatePassword(value: string) {
        if (value.length === 0) {
            setPasswordError("");
        } else if (value.length < 8) {
            // setPasswordError("Password must be at least 8 characters")
            setPasswordError("")
        } else {
            setPasswordError("")
        }
    }

    function handlePasswordBlur() {
        setTouchedPassword(true);
        validatePassword(password)
    } 

    function getPasswordChecks(password: string): PasswordCheck[] {
        return [
            { label: "At least 8 characters", passed: password.length >= 8 },
            { label: "One letter", passed: /[A-Za-z]/.test(password) },
            { label: "One number", passed: /[0-9]/.test(password) },
            { label: "One special character (e.g., !@#)", passed: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
        ];
    }

    function isPasswordValid(password: string): boolean {
        return getPasswordChecks(password).every(check => check.passed);
    }

    ////////////////////

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError("")

        if (!username || !email || !password) {
            setError("All fields are required")
            return
        } else if (usernameError) {
            return
        } else if (!isPasswordValid(password)) {
            setError("Please meet all password requirements")
            return
        } else {
            setLoading(true);
        }


        try {
            const response = await register(username, email, password)
            const data = await response.json()

            if (data.success === true) {
                setButtonText("Creating account...")

                localStorage.setItem("accessToken", data.accessToken)
                setTimeout(() => {
                    navigate("/dashboard")
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
                    <input value={username} onChange={handleUsernameChange} onBlur={handleUsernameBlur} type="text" 
                        id="username" name="username" placeholder="Username" />
                </div>
                
                {checkingUsername && <p id="username-text">Checking availability...</p>}
                {!checkingUsername && usernameError && <p className="username-error-text">{usernameError}</p>}
                {!checkingUsername && usernameAvailable && <p className="username-available-text">Username is available</p>}

                <div className="field">
                    <label htmlFor="email">Email</label>
                    <input value={email} onChange={handleEmailChange} type="email" 
                        id="email" name="email" placeholder="something@example.com"/>
                </div>

                <div className="field">
                    <label htmlFor="password">Password</label>
                    <div className='password-wrapper'>
                        <input value={password} onChange={handlePasswordChange} onBlur={handlePasswordBlur}
                            type={showPassword ? "text" : "password"}
                            id="password" name="password" placeholder="Your Password"
                            ref={passwordInputRef}
                        />
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} 
                            onClick={toggleShowPassword} 
                            onMouseDown={(e) => e.preventDefault()} 
                            className='toggle-password'/>
                    </div>
                    {password.length > 0 && (
                        <ul className="password-requirements">
                            {getPasswordChecks(password).map((check) => (
                                <li key={check.label} className={check.passed ? "met" : "unmet"}>
                                    {check.passed ? "✓" : "○"} {check.label}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {passwordError && <p className="password-error-text">{passwordError}</p>}
                {error && <p className="error-text">{error}</p>}

                <button type="submit" className="submit-btn" disabled={!getPasswordChecks(password).every((check) => check.passed) || loading}>{buttonText}</button>

                <p className="footer-text">Already have an account? <Link to="/login">Sign in</Link></p>
            </form>
        </div>
    )
}