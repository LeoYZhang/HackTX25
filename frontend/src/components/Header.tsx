import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Header.module.css';

interface HeaderProps {
  showUserActions?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showUserActions }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Don't show header on landing page
  if (location.pathname === '/') {
    return null;
  }
  
  // Don't show user actions if user is not logged in
  const shouldShowUserActions = showUserActions !== false && user;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header className={styles['app-header']}>
      <div className={styles['header-content']}>
        <div className={styles['logo-section']} onClick={() => navigate('/')}>
          <img src="/assets/logo.png" alt="educat logo" className={styles['logo-icon']}/>
          <h1 className={styles['app-title']}>edu<span className={styles['logo-cat']}>cat</span></h1>
        </div>
        
        {shouldShowUserActions && (
          <div className={styles['header-actions']}>
            <button 
              onClick={handleProfileClick}
              className={`${styles['header-button']} ${styles['profile-button']}`}
              title="View Profile"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
            <button 
              onClick={handleLogout}
              className={`${styles['header-button']} ${styles['logout-button']}`}
              title="Logout"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
