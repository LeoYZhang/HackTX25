import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './UserProfile.module.css';

interface UserProfileData {
  id: string;
  username: string;
  points: number;
  createdAt: string;
  updatedAt: string;
}

const UserProfile: React.FC = () => {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangeUsername, setShowChangeUsername] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [updating, setUpdating] = useState(false);
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
      setUserData(user);
      setNewUsername(user.username);
      setLoading(false);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/api/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: newPassword
        }),
      });

      if (response.ok) {
        setShowChangePassword(false);
        setNewPassword('');
        setConfirmPassword('');
        alert('Password updated successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername === user?.username) {
      setError('New username must be different from current username');
      return;
    }
    if (newUsername.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/api/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: newUsername
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUserData(updatedUser.data);
        setShowChangeUsername(false);
        alert('Username updated successfully! Please log in again.');
        logout();
        navigate('/login');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update username');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleClearMindmap = async () => {
    if (!window.confirm('Are you sure you want to clear your mindmap? This action cannot be undone.')) {
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/api/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mindmap: {}
        }),
      });

      if (response.ok) {
        alert('Mindmap cleared successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to clear mindmap');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className={styles['user-profile-container']}>
        <div className={styles['loading-spinner']}>
          <div className={styles['spinner']}></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className={styles['user-profile-container']}>
        <div className={styles['error-state']}>
          <div className={styles['error-icon']}>⚠️</div>
          <h2>Profile Not Found</h2>
          <p>We couldn't load your profile data.</p>
          <button onClick={() => navigate('/login')} className={styles['retry-button']}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['user-profile-container']}>
      {/* Main Content */}
      <main className={styles['profile-main']}>
        <div className={styles['profile-hero']}>
          <div className={styles['hero-content']}>
            <div className={styles['profile-avatar-section']}>
              <div className={styles['avatar-container']}>
                <div className={styles['avatar-ring']}></div>
                <div className={styles['avatar-emoji']}>👨‍🎓</div>
                <div className={styles['avatar-badge']}>
                  <span className={styles['badge-text']}>Level {Math.floor(userData.points / 100) + 1}</span>
                </div>
              </div>
            </div>
            
            <div className={styles['profile-info']}>
              <h2 className={styles['profile-name']}>{userData.username}</h2>
              <p className={styles['profile-subtitle']}>Mathematics Student</p>
              
              <div className={styles['stats-grid']}>
                <div className={`${styles['stat-card']} ${styles['points']}`}>
                  <div className={styles['stat-icon']}>🎯</div>
                  <div className={styles['stat-content']}>
                    <div className={styles['stat-value']}>{userData.points}</div>
                    <div className={styles['stat-label']}>Points Earned</div>
                  </div>
                </div>
                
                <div className={`${styles['stat-card']} ${styles['streak']}`}>
                  <div className={styles['stat-icon']}>📈</div>
                  <div className={styles['stat-content']}>
                    <div className={styles['stat-value']}>{Math.floor(Math.random() * 7) + 1}</div>
                    <div className={styles['stat-label']}>Day Streak</div>
                  </div>
                </div>
                
                <div className={`${styles['stat-card']} ${styles['member']}`}>
                  <div className={styles['stat-icon']}>📚</div>
                  <div className={styles['stat-content']}>
                    <div className={styles['stat-value']}>{new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    <div className={styles['stat-label']}>Member Since</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className={styles['settings-section']}>
          <div className={styles['settings-container']}>
            <h3 className={styles['settings-title']}>Account Settings</h3>
            
            {error && (
              <div className={styles['error-banner']}>
                <span className={styles['error-icon']}>⚠️</span>
                <span className={styles['error-text']}>{error}</span>
                <button onClick={() => setError(null)} className={styles['error-close']}>×</button>
              </div>
            )}
            
            <div className={styles['settings-grid']}>
              <div className={styles['setting-card']}>
                <div className={styles['setting-header']}>
                  <div className={styles['setting-icon']}>🔐</div>
                  <div className={styles['setting-info']}>
                    <h4>Password</h4>
                    <p>Update your account password</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className={styles['setting-button']}
                  disabled={updating}
                >
                  {showChangePassword ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              <div className={styles['setting-card']}>
                <div className={styles['setting-header']}>
                  <div className={styles['setting-icon']}>👤</div>
                  <div className={styles['setting-info']}>
                    <h4>Username</h4>
                    <p>Change your display name</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowChangeUsername(!showChangeUsername)}
                  className={styles['setting-button']}
                  disabled={updating}
                >
                  {showChangeUsername ? 'Cancel' : 'Change Username'}
                </button>
              </div>

              <div className={styles['setting-card']}>
                <div className={styles['setting-header']}>
                  <div className={styles['setting-icon']}>🗂️</div>
                  <div className={styles['setting-info']}>
                    <h4>Learning Data</h4>
                    <p>Clear your learning progress</p>
                  </div>
                </div>
                <button 
                  onClick={handleClearMindmap}
                  className={`${styles['setting-button']} ${styles['danger']}`}
                  disabled={updating}
                >
                  Clear Learning Data
                </button>
              </div>
            </div>

            {/* Forms */}
            {showChangePassword && (
              <div className={styles['form-container']}>
                <form onSubmit={handleChangePassword} className={styles['settings-form']}>
                  <h4>Change Password</h4>
                  <div className={styles['form-group']}>
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className={styles['form-group']}>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className={styles['form-actions']}>
                    <button type="submit" className={`${styles['form-button']} ${styles['primary']}`} disabled={updating}>
                      {updating ? 'Updating...' : 'Update Password'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowChangePassword(false);
                        setNewPassword('');
                        setConfirmPassword('');
                        setError(null);
                      }}
                      className={`${styles['form-button']} ${styles['secondary']}`}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {showChangeUsername && (
              <div className={styles['form-container']}>
                <form onSubmit={handleChangeUsername} className={styles['settings-form']}>
                  <h4>Change Username</h4>
                  <div className={styles['form-group']}>
                    <label htmlFor="newUsername">New Username</label>
                    <input
                      type="text"
                      id="newUsername"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter new username"
                      required
                      minLength={3}
                      maxLength={30}
                    />
                  </div>
                  <div className={styles['form-actions']}>
                    <button type="submit" className={`${styles['form-button']} ${styles['primary']}`} disabled={updating}>
                      {updating ? 'Updating...' : 'Update Username'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowChangeUsername(false);
                        setNewUsername(userData.username);
                        setError(null);
                      }}
                      className={`${styles['form-button']} ${styles['secondary']}`}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles['profile-footer']}>
          <div className={styles['footer-content']}>
            <span className={styles['footer-text']}>Built for HackTX25 • Empowering Math Education</span>
            <div className={styles['footer-links']}>
              <button onClick={() => navigate('/file-upload')} className={styles['footer-link']}>
                📁 Upload Files
              </button>
              <button onClick={() => navigate('/sprite-chat-1')} className={styles['footer-link']}>
                🎓 Start Learning
              </button>
            </div>
          </div>
      </footer>
    </div>
  );
};

export default UserProfile;

