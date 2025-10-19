import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './LoginModal.module.css';

interface LoginFormData {
  username: string;
  password: string;
  confirmPassword?: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    username: string;
    points: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [isSignup, setIsSignup] = useState<boolean>(initialMode === 'signup');
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setIsSignup(initialMode === 'signup');
      setFormData({
        username: '',
        password: '',
        confirmPassword: ''
      });
      setError('');
    }
  }, [isOpen, initialMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setFormData({
      username: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.username.trim()) {
      setError('username is required');
      return;
    }
    
    if (!formData.password.trim()) {
      setError('password is required');
      return;
    }

    // Additional validation for signup
    if (isSignup) {
      if (!formData.confirmPassword?.trim()) {
        setError('please confirm your password');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('passwords do not match');
        return;
      }
      
      if (formData.password.length < 6) {
        setError('password must be at least 6 characters long');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      const endpoint = isSignup ? 'http://localhost:5001/api/users' : 'http://localhost:5001/api/users/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password
        }),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.data) {
        // Use auth context to store user data
        login(data.data);
        
        // Close modal and navigate to file upload page
        onClose();
        navigate('/file-upload');
      } else {
        setError(data.message || (isSignup ? 'signup failed' : 'login failed'));
      }
    } catch (error) {
      console.error(isSignup ? 'signup error:' : 'login error:', error);
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles['login-modal-overlay']} onClick={onClose}>
      <div className={styles['login-modal-content']} onClick={(e) => e.stopPropagation()}>
        <div className={styles['login-modal-header']}>
          <div className={styles['login-modal-logo']}>
            <img src="/assets/logo.png" alt="educat logo" className={styles['login-logo-icon']}/>
            <span className={styles['login-logo-text']}>
              <span className={styles['login-logo-educat']}>edu</span>
            </span>
          </div>
          <button className={styles['login-close-button']} onClick={onClose}>×</button>
        </div>
        
        <div className={styles['login-modal-body']}>
          <h1 className={styles['login-modal-title']}>
            {isSignup ? 'create account' : 'welcome back!'}
          </h1>
          <p className={styles['login-modal-subtitle']}>
            {isSignup ? 'join the learning adventure' : 'ready to learn with cats?'}
          </p>
          
          <form onSubmit={handleSubmit} className={styles['login-modal-form']}>
            <div className={styles['form-group']}>
              <label htmlFor="username" className={styles['form-label']}>
                username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={styles['form-input']}
                placeholder="enter your username"
                autoComplete="username"
              />
            </div>
            
            <div className={styles['form-group']}>
              <label htmlFor="password" className={styles['form-label']}>
                password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={styles['form-input']}
                placeholder={isSignup ? "create a password" : "enter your password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </div>

            {isSignup && (
              <div className={styles['form-group']}>
                <label htmlFor="confirmPassword" className={styles['form-label']}>
                  confirm password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={styles['form-input']}
                  placeholder="confirm your password"
                  autoComplete="new-password"
                />
              </div>
            )}
            
            {error && (
              <div className={styles['error-message']}>
                {error}
              </div>
            )}
            
            <button type="submit" className={styles['login-modal-button']} disabled={isLoading}>
              {isLoading ? (isSignup ? 'creating Account...' : 'signing In...') : (isSignup ? 'create Account' : 'sign In')}
            </button>

            <div className={styles['toggle-mode']}>
              <p>
                {isSignup ? 'already have an account?' : "don't have an account?"}
                <button
                  type="button"
                  onClick={toggleMode}
                  className={styles['toggle-button']}
                >
                  {isSignup ? 'sign In' : 'sign Up'}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
