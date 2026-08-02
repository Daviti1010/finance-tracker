import { useState } from "react"
import { useNavigate } from "react-router-dom";


export function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [showButton, setShowButton] = useState(true);
    const [showPasswordInputs, setShowPasswordInputs] = useState(false)

    const [emailError, setEmailError] = useState("");
    const [codeError, setCodeError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");

    const [submitButtonText, setSubmitButtonText] = useState("Submit New Password")
    const [isSendingCode, setIsSendingCode] = useState(false);

    function enteringEmail(e: React.ChangeEvent<HTMLInputElement>) {
        setEmail(e.target.value);
    }

    function enteringCode(e: React.ChangeEvent<HTMLInputElement>) {
        const digitsOnly = e.target.value.replace(/\D/g, "");
        setCode(digitsOnly);
    }

    function enteringPassword(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setPassword(value);

        if (value.length >= 8) {
            setPasswordError("");
        }

        if (confirmPassword && value === confirmPassword) {
            setConfirmPasswordError("");
        }
    }

    function enteringConfirmPassword(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setConfirmPassword(value);

        if (value === password) {
            setConfirmPasswordError("");
        }
    }

    function isValidEmailFormat(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    async function handleSendCode() {
        if (!isValidEmailFormat(email)) {
            setEmailError("Please enter a valid email address");
            return;
        }

        setEmailError("");
        setIsSendingCode(true);

        const success = await sendCode()

        setIsSendingCode(false);

        if (success) {
            setShowCodeInput(true);
            setShowButton(false);
        } else {
            setEmailError("Something went wrong. Please try again.");
        }

    }

    async function sendCode() {    
        try {
            const response = await fetch("/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })

            const data = await response.json();
            console.log(data);

            return response.ok;

        } catch (err) {
            console.error(err)
        }
    }

    function handleCheckCode() {
        if (code.length !== 6) {
            setCodeError("Code needs to be 6 digit")
            return;
        }

        setCodeError("");
        checkCode()
    }

    async function checkCode() {
        try {
            const response = await fetch("/auth/check-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code })
            })

            const data = await response.json();
            console.log(data)

            if (data.valid === true) {
                setShowCodeInput(false)
                setShowPasswordInputs(true)
            } else {
                setCodeError("Code is incorrect")
            }

        } catch (err) {
            console.error(err)
        }
    }

    function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (password.length < 8) {
            setPasswordError("Password must be at least 8 characters")
            return
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError("Passwords must be the same");
            return;
        }

        setPasswordError("")
        setConfirmPasswordError("")
        resetPassword()
    }

    async function resetPassword() {
        try {
            const response = await fetch("/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, new_password: password })
            })

            const data = await response.json();
            console.log(data)

            if (data.success === true) {
                // console.log(data.message);
                
                setSubmitButtonText("Changing password...")
                setTimeout(() => {
                    navigate("/login")
                }, 1500);

            } else {
                console.log("Password reset is not successful")
            }

        } catch (err) {
            console.error(err)
        }
    }

    
    return (
         <div className="page">
            <form className="container" onSubmit={handleResetPassword}>
                <p className="brand">Finance Tracker</p>
                <h1>Update your password</h1>

                <div className="field">
                    <label htmlFor="email">Email</label>
                    <input value={email} onChange={enteringEmail}
                        type="email" id="email" name="email" placeholder="your.email@example.com"/>
                    {emailError && <p className="email-error">{emailError}</p>}
                </div>

                {showButton && (
                    <button className="send-code-btn" type="button" 
                    onClick={handleSendCode}
                    disabled={isSendingCode}
                    >{isSendingCode ? "Sending Code..." : "Send Recovery Code To Email"}</button>
                )}


                {showCodeInput && (
                    <>
                        <div className="field">
                            <label htmlFor="code">Code</label>
                            <input value={code} onChange={enteringCode}
                                type="text" inputMode="numeric" id="code" name="code" placeholder="123456" maxLength={6}/>
                            {codeError && <p className="code-error">{codeError}</p>}
                        </div>

                        <button className="confirm-code-btn" type="button" onClick={handleCheckCode}>Confirm Code</button>
                    </>
                )}


                {showPasswordInputs && (
                    <>
                        <div className="field">
                            <label htmlFor="password">New Password</label>
                            <input value={password} onChange={enteringPassword}
                                type="password" id="password" name="new_password" placeholder="New Password" />
                            {passwordError && <p className="password-error">{passwordError}</p>}
                        </div>

                        <div className="field">
                            <label htmlFor="password">Confirm Password</label>
                            <input value={confirmPassword} onChange={enteringConfirmPassword}
                                type="password" id="password" name="confirm_new_password" placeholder="New Password" />
                            {confirmPasswordError && <p className="confirm-password-error">{confirmPasswordError}</p>}
                        </div>

                        <button type="submit" className="submit-btn">{submitButtonText}</button>
                    </>
                )}

            </form>
        </div>
    )
}