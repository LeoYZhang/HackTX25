import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginModal.css';

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
      setError('Username is required');
      return;
    }
    
    if (!formData.password.trim()) {
      setError('Password is required');
      return;
    }

    // Additional validation for signup
    if (isSignup) {
      if (!formData.confirmPassword?.trim()) {
        setError('Please confirm your password');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
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
        setError(data.message || (isSignup ? 'Signup failed' : 'Login failed'));
      }
    } catch (error) {
      console.error(isSignup ? 'Signup error:' : 'Login error:', error);
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="login-modal-header">
          <div className="login-modal-logo">
            <img src="/assets/logo.png" alt="educat logo" className="login-logo-icon"/>
            <span className="login-logo-text">
              <span className="login-logo-educat">edu</span>
            </span>
          </div>
          <button className="login-close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="login-modal-body">
          <h1 className="login-modal-title">
            {isSignup ? 'create account' : 'welcome back!'}
          </h1>
          <p className="login-modal-subtitle">
            {isSignup ? 'join the learning adventure' : 'ready to learn with cats?'}
          </p>
          
          <form onSubmit={handleSubmit} className="login-modal-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder={isSignup ? "Create a password" : "Enter your password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </div>

            {isSignup && (
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
              </div>
            )}
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <button type="submit" className="login-modal-button" disabled={isLoading}>
              {isLoading ? (isSignup ? 'Creating Account...' : 'Signing In...') : (isSignup ? 'Create Account' : 'Sign In')}
            </button>

            <div className="toggle-mode">
              <p>
                {isSignup ? 'Already have an account?' : "Don't have an account?"}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="toggle-button"
                >
                  {isSignup ? 'Sign In' : 'Sign Up'}
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
