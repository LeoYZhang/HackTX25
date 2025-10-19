import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './FileUpload.module.css';

const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [ellipsisCount, setEllipsisCount] = useState(0);
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

    const readFileAsBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const fileData = reader.result as string;
          const base64Data = fileData.split(',')[1] || '';
          resolve(base64Data);
        };
        reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

    try {
      const base64Data = await readFileAsBase64(selectedFile);

      const response = await fetch('http://localhost:5001/api/actions/upload-problem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.username,
          file: base64Data,
          mimeType: selectedFile.type,
        }),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('sprite-chat-1-initial', JSON.stringify(result.messages));
        navigate('/sprite-chat-1');
      } else {
        console.error('Upload failed:', result.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!isUploading) {
      setEllipsisCount(0);
      return;
    }
    const intervalId = setInterval(() => {
      setEllipsisCount((prev) => (prev + 1) % 4);
    }, 450);
    return () => clearInterval(intervalId);
  }, [isUploading]);

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
            {isUploading ? `parsing file${'.'.repeat(ellipsisCount)}` : 'start learning'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default FileUpload;