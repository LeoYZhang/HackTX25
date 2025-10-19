import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './UserProfileModal.module.css';

interface UserProfileData {
  id: string;
  username: string;
  points: number;
  createdAt: string;
  updatedAt: string;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [updating, setUpdating] = useState(false);
  
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
      setUserData(user);
      setNewUsername('');
      setLoading(false);
    }
  }, [user]);

  // Fetch latest user details from backend when modal opens
  useEffect(() => {
    const fetchUser = async () => {
      if (!isOpen || !user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:5001/api/users/${user.id}`);
        if (response.ok) {
          const result = await response.json();
          setUserData(result.data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to load user profile');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isOpen, user?.id]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setError('Current password is required');
      return;
    }
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
      const response = await fetch(`http://localhost:5001/api/users/${user?.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword
        }),
      });

      if (response.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
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
    if (!currentPassword) {
      setError('Current password is required');
      return;
    }
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
      const response = await fetch(`http://localhost:5001/api/users/${user?.id}/username`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newUsername: newUsername,
          currentPassword: currentPassword
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUserData(updatedUser.data);
        setCurrentPassword('');
        logout();
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

  const handleClearCache = async (e: React.FormEvent) => {
    e.preventDefault();

    setUpdating(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5001/api/users/${user?.id}/mindmap`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setUserData(result.data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to clear cache');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const resetForms = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setNewUsername('');
    setError(null);
  };

  // Clear all fields when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      resetForms();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles['modal-overlay']} onClick={onClose}>
      <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
        <div className={styles['modal-header']}>
          <h2>profile</h2>
          <button onClick={onClose} className={styles['close-button']}>×</button>
        </div>

        {loading ? (
          <div className={styles['loading']}>loading...</div>
        ) : userData ? (
          <div className={styles['modal-body']}>
            {/* Profile Info */}
            <div className={styles['profile-info']}>
              <img src="/assets/profile_pic.png" alt="Profile" className={styles['avatar']} />
              <div className={styles['user-details']}>
                <h3>{userData.username}</h3>
                <div className={styles['stats']}>
                  <div className={styles['stat']}>
                    <span className={styles['stat-label']}>Points:</span>
                    <span className={styles['stat-value']}>{userData.points}</span>
                  </div>
                  <div className={styles['stat']}>
                    <span className={styles['stat-label']}>Joined:</span>
                    <span className={styles['stat-value']}>
                      {new Date(userData.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className={styles['error']}>
                <span>{error}</span>
                <button onClick={() => setError(null)}>×</button>
              </div>
            )}

            {/* Forms */}
            <form onSubmit={handleChangeUsername} className={styles['form']}>
              <h4>change username</h4>
              <input
                type="password"
                placeholder="current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="new username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                minLength={3}
              />
              <div className={styles['form-actions']}>
                <button type="submit" disabled={updating}>
                  {updating ? 'updating...' : 'update username'}
                </button>
                <button type="button" onClick={resetForms}>reset</button>
              </div>
            </form>

            <form onSubmit={handleChangePassword} className={styles['form']}>
              <h4>change password</h4>
              <input
                type="password"
                placeholder="current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
              <input
                type="password"
                placeholder="confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <div className={styles['form-actions']}>
                <button type="submit" disabled={updating}>
                  {updating ? 'updating...' : 'update password'}
                </button>
                <button type="button" onClick={resetForms}>reset</button>
              </div>
            </form>

            <form onSubmit={handleClearCache} className={styles['form']}>
              <h4>clear cache</h4>
              <p>this will permanently delete all your learning progress.</p>
              <div className={styles['form-actions']}>
                <button type="submit" disabled={updating} className={styles['danger']}>
                  {updating ? 'clearing...' : 'clear cache'}
                </button>
                <button type="button" onClick={resetForms}>reset</button>
              </div>
            </form>
          </div>
        ) : (
          <div className={styles['error']}>failed to load profile data</div>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;
