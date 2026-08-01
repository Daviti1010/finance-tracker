



export function ForgotPassword() {
    return (
         <div className="page">
            <form className="container">
                <p className="brand">Finance Tracker</p>
                <h1>Update your password</h1>

                <div className="field">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email" id="email" name="email" placeholder="your.email@example.com"/>
                </div>

                <div className="field">
                    <label htmlFor="password">New Password</label>
                    <input
                        type="password" id="password" name="password" placeholder="New Password" />
                </div>

                <div className="field">
                    <label htmlFor="password">Confirm Password</label>
                    <input
                        type="password" id="password" name="password" placeholder="New Password" />
                </div>


                {/* <button type="submit" className="submit-btn" ></button> */}

            </form>
        </div>
    )
}