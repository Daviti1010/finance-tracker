import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';


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

    // const [submitButtonText, setSubmitButtonText] = useState("Submit New Password")
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [isCheckingCode, setIsCheckingCode] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    function toggleShowNewPassword() {
        setShowNewPassword(!showNewPassword);
    }

    function toggleShowConfirmPassword() {
        setShowConfirmPassword(!showConfirmPassword);
    }

    async function handleSendCode() {
        if (!isValidEmailFormat(email)) {
            setEmailError("Please enter a valid email address");
            return;
        }

        setEmailError("");
        setIsSendingCode(true);

        const result = await sendCode()

        setIsSendingCode(false);

        if (result.success) {
            setShowCodeInput(true);
            setShowButton(false);
        } else if (result.rateLimited) {
            setEmailError("Too many attempts. Please try again later.");
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

            if (!response.ok) {
                return { success: false, rateLimited: response.status === 429 };
            }

            await response.json();
            // const data = await response.json();
            // console.log(data);

            return { success: true, rateLimited: false };

            // return response.ok;

        } catch (err) {
            console.error(err);
            return { success: false, rateLimited: false };
        }
    }

    async function handleResendCode() {
        setCodeError("");
        setIsSendingCode(true);

        const result = await sendCode();

        setIsSendingCode(false);

        if (!result.success) {
            setCodeError(
                result.rateLimited
                    ? "Too many attempts. Please try again later."
                    : "Failed to resend code. Please try again."
            );
        }
    }

    async function handleCheckCode() {
        if (code.length !== 6) {
            setCodeError("Code needs to be 6 digit")
            return;
        }

        setCodeError("");
        setIsCheckingCode(true);
        await checkCode()
        setIsCheckingCode(false);
    }

    async function checkCode() {
        try {
            const response = await fetch("/auth/check-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code })
            })

            if (!response.ok) {
                if (response.status === 429) {
                    setCodeError("Too many attempts. Please try again later.");
                } else {
                    setCodeError("Something went wrong. Please try again.");
                }
                return;
            }

            const data = await response.json();
            // console.log(data)

            if (data.valid === true) {
                setShowCodeInput(false)
                setShowPasswordInputs(true)
            } else {
                setCodeError(data.message ?? "Code is incorrect");
            }

        } catch (err) {
            console.error(err)
            setCodeError("Network error. Please check your connection and try again.");
        }
    }

    async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
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
        setIsResettingPassword(true)
        await resetPassword()
        // setIsResettingPassword(false);
    }

    async function resetPassword() {
        try {
            const response = await fetch("/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, new_password: password })
            })

            if (!response.ok) {
                if (response.status === 429) {
                    setPasswordError("Too many attempts. Please try again later.");
                } else {
                    setPasswordError("Something went wrong. Please try again.");
                }
                return;
            }

            const data = await response.json();
            // console.log(data)

            if (data.success === true) {
                // console.log(data.message);
                
                // setSubmitButtonText("Changing password...")
                setTimeout(() => {
                    navigate("/login")
                }, 1500);

            } else {
                setPasswordError(data.message ?? "Password reset failed");
            }

        } catch (err) {
            console.error(err)
            setPasswordError("Network error. Please check your connection and try again.");
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

                        <button className="confirm-code-btn" type="button" 
                        onClick={handleCheckCode}
                        disabled={isCheckingCode}
                        >
                        {isCheckingCode ? "Checking..." : "Confirm Code"}</button>

                        <button className="resend-code-btn" type="button" onClick={handleResendCode} disabled={isSendingCode}>
                            {isSendingCode ? "Resending..." : "Didn't get a code? Resend"}
                        </button>
                    </>
                )}


                {showPasswordInputs && (
                    <>
                        <div className="field">
                            <label htmlFor="password">New Password</label>
                            <div className="password-wrapper">
                                <input value={password} onChange={enteringPassword}
                                    type={showNewPassword ? "text" : "password"} id="new-password" name="new_password" placeholder="New Password" />
                                <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} onClick={toggleShowNewPassword} className='toggle-password'/>
                            </div>
                            {passwordError && <p className="password-error">{passwordError}</p>}
                        </div>

                        <div className="field">
                            <label htmlFor="password">Confirm Password</label>
                            <div className="password-wrapper">
                                <input value={confirmPassword} onChange={enteringConfirmPassword}
                                    type={showConfirmPassword ? "text" : "password"} id="confirm-password" name="confirm_new_password" placeholder="New Password" />
                                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} onClick={toggleShowConfirmPassword} className='toggle-password'/>
                            </div>
                            {confirmPasswordError && <p className="confirm-password-error">{confirmPasswordError}</p>}
                        </div>

                        <button type="submit" className="submit-btn" disabled={isResettingPassword}>
                            {isResettingPassword ? "Resetting..." : "Submit New Password"}</button>
                    </>
                )}

            </form>
        </div>
    )
}