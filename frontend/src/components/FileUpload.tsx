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
    navigate('/');
  };

  return (
    <div className="file-upload-container">
      <main className="file-upload-content">
        <div className="upload-card">
          <h2>upload your questions</h2>
          <p>please upload a file containing a problem set to begin learning!</p>
          
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
                  <span>click to select a file</span>
                  <span className="file-types">supports: .txt, .pdf, .doc, .docx</span>
                </div>
              )}
            </label>
          </div>
          
          <button 
            onClick={handleUpload} 
            className="upload-button"
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'processing...' : 'start learning'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default FileUpload;