import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

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

const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isSignup, setIsSignup] = useState<boolean>(false);
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Check URL parameters to set initial mode
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsSignup(true);
    } else if (mode === 'login') {
      setIsSignup(false);
    }
  }, [searchParams]);

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
        
        // Navigate to file upload page
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

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Meow4.me</h1>
        <p className="login-subtitle">
          {isSignup ? 'Create your account' : 'Welcome back!'}
        </p>
        
        <form onSubmit={handleSubmit} className="login-form">
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
          
          <button type="submit" className="login-button" disabled={isLoading}>
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
  );
};

export default Login;
