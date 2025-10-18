import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

interface LoginFormData {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    // For demo purposes, accept any non-empty credentials
    // In a real app, you'd validate against a backend
    if (formData.username.trim() && formData.password.trim()) {
      navigate('/file-upload');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Meow4.me</h1>
        
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
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
