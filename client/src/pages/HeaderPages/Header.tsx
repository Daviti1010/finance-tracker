import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightFromBracket, faCircleUser } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getMe } from '../../api';
import './Header.css'

export function Header() {

    const [username, setUsername] = useState("")

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

    return (
        <>
          <header className='header'>
            <div className='header-container'>
                <div className='left-part'>
                    <div className='left-part-text'>Finance Tracker</div>
                </div>

                <div className='right-part'>
                    <div className='profile'>
                        <div className='profile-text'> <FontAwesomeIcon icon={faCircleUser} /> {username}</div>
                    </div>

                    <div className='logout'>
                        <button className='logout-btn' onClick={clearToken}> <FontAwesomeIcon icon={faRightFromBracket} /> Logout</button>
                    </div>
                </div>
            </div>
          </header>
        </>
    )
}