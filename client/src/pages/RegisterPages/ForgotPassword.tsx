import { useState } from "react"
import { useNavigate } from "react-router-dom";


export function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [showButton, setShowButton] = useState(true);
    const [showPasswordInputs, setShowPasswordInputs] = useState(false)

    function enteringEmail(e: React.ChangeEvent<HTMLInputElement>) {
        setEmail(e.target.value);
    }

    function enteringCode(e: React.ChangeEvent<HTMLInputElement>) {
        setCode(e.target.value);
    }

    function enteringPassword(e: React.ChangeEvent<HTMLInputElement>) {
        setPassword(e.target.value);
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

        } catch (err) {
            console.error(err)
        }
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
            }

        } catch (err) {
            console.error(err)
        }
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

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        await resetPassword();
    }

    
    return (
         <div className="page">
            <form className="container" onSubmit={handleSubmit}>
                <p className="brand">Finance Tracker</p>
                <h1>Update your password</h1>

                <div className="field">
                    <label htmlFor="email">Email</label>
                    <input value={email} onChange={enteringEmail}
                        type="email" id="email" name="email" placeholder="your.email@example.com"/>
                </div>

                {showButton && (
                        <button className="send-code-btn" type="button" onClick={() => {
                        sendCode()
                        setShowCodeInput(true)
                        setShowButton(false)
                    }}>Send Code</button>
                )}


                {showCodeInput && (
                    <>
                        <div className="field">
                            <label htmlFor="code">Code</label>
                            <input value={code} onChange={enteringCode}
                                type="number" inputMode="numeric" id="code" name="code" placeholder="123456"/>
                        </div>

                        <button className="confirm-code-btn" type="button" onClick={checkCode}>Confirm Code</button>
                    </>
                )}


                {showPasswordInputs && (
                    <>
                        <div className="field">
                            <label htmlFor="password">New Password</label>
                            <input value={password} onChange={enteringPassword}
                                type="password" id="password" name="new_password" placeholder="New Password" />
                        </div>

                        <div className="field">
                            <label htmlFor="password">Confirm Password</label>
                            <input
                                type="password" id="password" name="new_password_" placeholder="New Password" />
                        </div>


                        <button type="submit" className="submit-btn" onClick={resetPassword}>Submit New Password</button>
                    </>
                )}



            </form>
        </div>
    )
}