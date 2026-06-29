import { Link } from 'react-router-dom';
// import { useNavigate } from "react-router";
// import React, { useState } from 'react';
// import { register } from '../../api'
import './Auth.css'
// import { faL } from '@fortawesome/free-solid-svg-icons';

export function Login() {

    return (
        <div className="page">
            <form className="container">
                <p className="brand">Finance Tracker</p>
                <h1>Log into your account</h1>

                <div className="field">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" placeholder="something@example.com"/>
                </div>

                <div className="field">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="At least 8 characters" />
                </div>


                <button type="submit" className="submit-btn">Log In</button>

                <p className="footer-text">Do not have an acocunt? <Link to="/register">Sign up</Link></p>
            </form>
        </div>
    )
}