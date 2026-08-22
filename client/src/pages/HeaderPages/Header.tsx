import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightFromBracket, faCircleUser, faLink, faHouse, faBars, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getMe } from '../../api';
import { useTheme } from "../../context/useTheme";
import './Header.css'

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    const [username, setUsername] = useState("")

    const {theme, setTheme} = useTheme();

    const toggleTheme = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTheme(e.target.checked ? "dark" : "light");
    };

    useEffect(() => {
        async function fetchUsername() {
            try {
                const response = await getMe();
                const data = await response.json()

                if (!response.ok) {
                    console.log(data.message)
                    return
                }

                setUsername(data.username)
            } catch (err) {
                console.log(err)
            }
        }

        fetchUsername()
    }, [])

    const navigate = useNavigate();

    function clearToken() {
        localStorage.removeItem('accessToken');
        navigate('/login')
    }

    const location = useLocation();
    const isClientTransactions = /^\/clients\/[^/]+\/transactions$/.test(location.pathname);

    return (
        <>
          <header className='header'>
            <div className='header-container'>
                <div className='left-part'>
                    <div className='left-part-text'>                           
                        <Link to="/dashboard">
                            Finance Tracker
                        </Link>
                    </div>

                    <div className='desktop-links'>
                        {location.pathname === '/dashboard' ? (
                            <Link to="/links">
                                <FontAwesomeIcon icon={faLink} className="link-icon" />
                                {" "} View Links
                            </Link>
                        ) : isClientTransactions ? (
                            <Link to="/links">
                                <FontAwesomeIcon icon={faLink} className="link-icon" />
                                {" "} View Links
                            </Link>
                        ) : (
                            <Link to="/dashboard">
                                <FontAwesomeIcon icon={faHouse} className="link-icon" />
                                {" "} Go to Dashboard
                            </Link>
                        )}
                    </div>
                </div>

                <div className="desktop-nav">
                    <div className='right-part'>
                        <div className="switch-mode">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={theme === "dark"}
                                    onChange={toggleTheme}
                                />
                                <span className="slider round">
                                    {theme === "dark" && <img src="/sun.svg" alt="" className="icon icon-sun" />}
                                    {theme === "light" && <img src="/moon.svg" alt="" className="icon icon-moon" />}
                                </span>
                            </label>
                        </div>

                        <div className='profile'>
                            <div className='profile-text'> <FontAwesomeIcon icon={faCircleUser} /> {username}</div>
                        </div>

                        <div className='logout'>
                            <button className='logout-btn' onClick={clearToken}> <FontAwesomeIcon icon={faRightFromBracket} /> Logout</button>
                        </div>
                    </div>
                </div>

                <div className="profile-and-burger">
                    <div className='profile-hdr'>
                        <div className='profile-text-hdr'> <FontAwesomeIcon icon={faCircleUser} /> {username}</div>
                    </div>

                    <button className="hamburger-button" onClick={() => setIsMenuOpen(prev => !prev)}>
                        <FontAwesomeIcon icon={isMenuOpen ? faXmark : faBars} className="link-icon" />
                    </button>
                </div>

                {isMenuOpen && (
                    <>
                    <div className="mobile-nav-overlay" onClick={() => setIsMenuOpen(false)} />
                        <div className="mobile-nav">
                            <div className='right-part'>
                                <div className="user-controls">
                                    <div className='profile'>
                                        <div className='profile-text'> <FontAwesomeIcon icon={faCircleUser} /> {username}</div>
                                    </div>

                                    <div className='links'>
                                        {location.pathname === '/dashboard' ? (
                                            <Link to="/links">
                                                <FontAwesomeIcon icon={faLink} className="link-icon" />
                                                {" "} View Links
                                            </Link>
                                        ) : isClientTransactions ? (
                                            <Link to="/links">
                                                <FontAwesomeIcon icon={faLink} className="link-icon" />
                                                {" "} View Links
                                            </Link>
                                        ) : (
                                            <Link to="/dashboard">
                                                <FontAwesomeIcon icon={faHouse} className="link-icon" />
                                                {" "} Go to Dashboard
                                            </Link>
                                        )}
                                    </div>

                                    <div className='logout'>
                                        <button className='logout-btn' onClick={clearToken}> <FontAwesomeIcon icon={faRightFromBracket} /> Logout</button>
                                    </div>
                                </div>

                                <div className="switch-mode">
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={theme === "dark"}
                                            onChange={toggleTheme}
                                        />
                                        <span className="slider round">
                                            {theme === "dark" && <img src="/sun.svg" alt="" className="icon icon-sun" />}
                                            {theme === "light" && <img src="/moon.svg" alt="" className="icon icon-moon" />}
                                        </span>
                                    </label>
                                </div>

                            </div>
                        </div>
                    </>
                )}
            </div>
          </header>
        </>
    )
}