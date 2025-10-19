import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './FileUpload.module.css';

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
    <div className={styles['file-upload-container']}>
      <main className={styles['file-upload-content']}>
        <div className={styles['upload-card']}>
          <h2>upload your questions</h2>
          <p>please upload a file containing a problem set to begin learning!</p>
          
          <div className={styles['upload-area']}>
            <input
              type="file"
              id="file-input"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className={styles['file-input']}
            />
            <label htmlFor="file-input" className={styles['file-label']}>
              {selectedFile ? (
                <div className={styles['file-selected']}>
                  <span className={styles['file-icon']}>📄</span>
                  <span className={styles['file-name']}>{selectedFile.name}</span>
                </div>
              ) : (
                <div className={styles['file-placeholder']}>
                  <span className={styles['upload-icon-large']}>📁</span>
                  <span>click to select a file</span>
                  <span className={styles['file-types']}>supports: .txt, .pdf, .doc, .docx</span>
                </div>
              )}
            </label>
          </div>
          
          <button 
            onClick={handleUpload} 
            className={styles['upload-button']}
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