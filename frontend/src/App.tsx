import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import FileUpload from './components/FileUpload';
import SpriteChat from './components/SpriteChat';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/file-upload" element={<FileUpload />} />
          <Route path="/sprite-chat-1" element={<SpriteChat spriteNumber={1} />} />
          <Route path="/sprite-chat-2" element={<SpriteChat spriteNumber={2} />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
