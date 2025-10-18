import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './FileUpload.css';

const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    // Simulate file upload process
    setTimeout(() => {
      setIsUploading(false);
      navigate('/sprite-chat-1');
    }, 1500);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="file-upload-container">
      <header className="file-upload-header">
        <h1>Meow4.me</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>
      
      <main className="file-upload-content">
        <div className="upload-card">
          <div className="upload-icon">📚</div>
          <h2>Upload Your Math Questions</h2>
          <p>Please upload a file containing your math questions to begin your learning adventure!</p>
          
          <div className="upload-area">
            <input
              type="file"
              id="file-input"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="file-input" className="file-label">
              {selectedFile ? (
                <div className="file-selected">
                  <span className="file-icon">📄</span>
                  <span className="file-name">{selectedFile.name}</span>
                </div>
              ) : (
                <div className="file-placeholder">
                  <span className="upload-icon-large">📁</span>
                  <span>Click to select a file</span>
                  <span className="file-types">Supports: .txt, .pdf, .doc, .docx</span>
                </div>
              )}
            </label>
          </div>
          
          <button 
            onClick={handleUpload} 
            className="upload-button"
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Processing...' : 'Start Learning Journey'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default FileUpload;
