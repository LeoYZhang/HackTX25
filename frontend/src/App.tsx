import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import FileUpload from './components/FileUpload';
import SpriteChat from './components/SpriteChat';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
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
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
