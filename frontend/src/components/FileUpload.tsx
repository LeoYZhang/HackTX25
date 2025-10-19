import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './FileUpload.module.css';

const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;
    
    setIsUploading(true);
    
    try {
      // Convert file to base64 for sending
      const reader = new FileReader();
      reader.onload = async () => {
        const fileData = reader.result as string;
        const base64Data = fileData.split(',')[1]; // Remove data:type;base64, prefix
        
        const response = await fetch('http://localhost:5001/api/actions/upload-problem', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: user.username,
            file: base64Data,
            mimeType: selectedFile.type
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Navigate to sprite-chat-1 with the message from the response
          localStorage.setItem('sprite-chat-1-message', result.message);
          navigate('/sprite-chat-1');
        } else {
          console.error('Upload failed:', result.message);
          // Handle error - could show a toast or error message
        }
      };
      
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Error uploading file:', error);
      // Handle error
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles['file-upload-container']}>
      <img 
        src="/assets/orange_cat_yarn.png" 
        alt="Orange cat with yarn" 
        className={styles['orange-cat']}
      />
      <img 
        src="/assets/gray_cat_yarn.png" 
        alt="Gray cat with yarn" 
        className={styles['gray-cat']}
      />
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
                  <img src="/assets/icons/page.png" alt="Document" className={styles['file-icon']} />
                  <span className={styles['file-name']}>{selectedFile.name}</span>
                </div>
              ) : (
                <div className={styles['file-placeholder']}>
                  <img src="/assets/icons/folder.png" alt="Folder" className={styles['upload-icon-large']} />
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