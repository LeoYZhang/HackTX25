import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import FileUpload from './components/FileUpload';
import SpriteChat from './components/SpriteChat';
import UserProfile from './components/UserProfile';
import ProtectedRoute from './components/ProtectedRoute';
import styles from './App.module.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className={styles['App']}>
          <Header />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/file-upload" 
              element={
                <ProtectedRoute>
                  <FileUpload />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sprite-chat-1" 
              element={
                <ProtectedRoute>
                  <SpriteChat spriteNumber={1} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sprite-chat-2" 
              element={
                <ProtectedRoute>
                  <SpriteChat spriteNumber={2} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } 
            />
          </Routes>            
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
