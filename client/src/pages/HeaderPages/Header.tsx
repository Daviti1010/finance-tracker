import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightFromBracket, faCircleUser } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom';
import './Header.css'

export function Header() {

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
                        <div className='profile-text'> <FontAwesomeIcon icon={faCircleUser} /> Username</div>
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