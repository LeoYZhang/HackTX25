import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './SpriteChat.css';

interface SpriteChatProps {
  spriteNumber: 1 | 2;
}

const SpriteChat: React.FC<SpriteChatProps> = ({ spriteNumber }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean; timestamp: Date }>>([
    { text: spriteNumber === 1 ? "Hello! I'm your math learning companion. Let's solve some problems together!" : "Welcome back! Ready to continue our math journey?", isUser: false, timestamp: new Date() }
  ]);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const sprites = {
    1: { emoji: '🧮', name: 'Calculator', color: '#3b82f6' },
    2: { emoji: '📐', name: 'Geometry', color: '#10b981' }
  };

  const currentSprite = sprites[spriteNumber];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      text: message.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "That's a great question! Let me help you work through this step by step.",
        "I see what you're trying to solve. Here's how we can approach this problem...",
        "Excellent thinking! Now let's apply this concept to the next problem.",
        "You're on the right track! Let me show you an alternative method.",
        "Great work! This is exactly the kind of problem-solving we need for math success."
      ];
      
      const aiResponse = {
        text: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNext = () => {
    if (spriteNumber === 1) {
      navigate('/sprite-chat-2');
    } else {
      // For sprite 2, we could go to a completion screen or restart
      navigate('/file-upload');
    }
  };

  const handleBack = () => {
    if (spriteNumber === 2) {
      navigate('/sprite-chat-1');
    }
  };

  const handleRestart = () => {
    navigate('/file-upload');
  };

  return (
    <div className="sprite-chat-container">
      <header className="sprite-chat-header">
        <h1>Meow4.me</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>
      
      <main className="sprite-chat-content">
        <div className="sprite-section">
          <div 
            className="sprite-display"
            style={{ backgroundColor: `${currentSprite.color}20` }}
          >
            <div className="sprite-emoji">{currentSprite.emoji}</div>
            <div className="sprite-name">{currentSprite.name}</div>
          </div>
        </div>
        
        <div className="chat-section">
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message ${msg.isUser ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-content">
                  {msg.text}
                </div>
                <div className="message-time">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleSendMessage} className="chat-input-form">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything about math..."
              className="chat-input"
            />
            <button type="submit" className="send-button">
              Send
            </button>
          </form>
        </div>
      </main>
      
      <div className="navigation-buttons">
        {spriteNumber === 2 && (
          <button onClick={handleBack} className="nav-button back-button">
            ← Back
          </button>
        )}
        
        <button onClick={handleRestart} className="nav-button restart-button">
          🔄 Restart
        </button>
        
        <button onClick={handleNext} className="nav-button next-button">
          {spriteNumber === 1 ? 'Next →' : 'Complete ✓'}
        </button>
      </div>
    </div>
  );
};

export default SpriteChat;
