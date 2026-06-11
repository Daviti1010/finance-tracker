import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightFromBracket, faCircleUser } from '@fortawesome/free-solid-svg-icons'
import './Header.css'

export function Header() {
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
                        <button className='logout-btn'> <FontAwesomeIcon icon={faRightFromBracket} /> Logout</button>
                    </div>
                </div>
            </div>
          </header>
        </>
    )
}