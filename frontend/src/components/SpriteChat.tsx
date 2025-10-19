import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './SpriteChat.css';

interface SpriteChatProps {
  spriteNumber: 1 | 2;
}

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const SpriteChat: React.FC<SpriteChatProps> = ({ spriteNumber }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedTeacherSprite, setSelectedTeacherSprite] = useState<string>('teacher_base.png');
  const [selectedStudentSprite, setSelectedStudentSprite] = useState<string>('student_base.png');
  const navigate = useNavigate();
  const { logout } = useAuth();

  const teacherSprites = [
    'teacher_base.png',
    'teacher_confused.png',
    'teacher_explanation.png',
    'teacher_pleased.png',
    'teacher_talking_pawup.png',
    'teacher_talking.png',
    'teacher_weary.png'
  ];

  const studentSprites = [
    'student_base.png',
    'student_nodesk.png'
  ];

  const currentSprites = spriteNumber === 1 ? teacherSprites : studentSprites;
  const currentSelectedSprite = spriteNumber === 1 ? selectedTeacherSprite : selectedStudentSprite;

  // Load saved messages for this page
  useEffect(() => {
    const savedMessages = localStorage.getItem(`sprite-chat-${spriteNumber}-messages`);
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      setMessages(parsedMessages);
    } else {
      // Initialize with welcome message
      const welcomeMessage: Message = {
        text: spriteNumber === 1 
          ? "Hello! I'm your math teacher. Let's solve some problems together!" 
          : "Welcome back! Ready to continue our math journey?",
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [spriteNumber]);

  // Save messages whenever they change
  useEffect(() => {
    localStorage.setItem(`sprite-chat-${spriteNumber}-messages`, JSON.stringify(messages));
  }, [messages, spriteNumber]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      text: message.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const responses = spriteNumber === 1 ? [
        "That's a great question! Let me help you work through this step by step.",
        "I see what you're trying to solve. Here's how we can approach this problem...",
        "Excellent thinking! Now let's apply this concept to the next problem.",
        "You're on the right track! Let me show you an alternative method.",
        "Great work! This is exactly the kind of problem-solving we need for math success."
      ] : [
        "I understand! Let me work through this problem with you.",
        "That's an interesting approach. Here's what I'm thinking...",
        "I'm learning too! Let's figure this out together.",
        "Good point! I see it differently though. What if we...",
        "I'm getting confused. Can you explain that part again?"
      ];
      
      const aiResponse: Message = {
        text: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleSpriteSelect = (spritePath: string) => {
    if (spriteNumber === 1) {
      setSelectedTeacherSprite(spritePath);
    } else {
      setSelectedStudentSprite(spritePath);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNext = () => {
    if (spriteNumber === 1) {
      navigate('/sprite-chat-2');
    } else {
      navigate('/file-upload');
    }
  };

  const handleBack = () => {
    if (spriteNumber === 2) {
      navigate('/sprite-chat-1');
    }
  };

  const handleRestart = () => {
    // Clear messages for both pages
    localStorage.removeItem('sprite-chat-1-messages');
    localStorage.removeItem('sprite-chat-2-messages');
    navigate('/file-upload');
  };

  return (
    <div className="sprite-chat-container">
      <main className="sprite-chat-content">
        <div className="sprite-section">
          <div className="classroom-background">
            <img 
              src={`/assets/${currentSelectedSprite}`} 
              alt={spriteNumber === 1 ? 'Teacher' : 'Student'} 
              className="sprite-image"
              style={{ transform: 'scale(4)' }}
              onClick={() => {
                const currentIndex = currentSprites.indexOf(currentSelectedSprite);
                const nextIndex = (currentIndex + 1) % currentSprites.length;
                handleSpriteSelect(currentSprites[nextIndex]);
              }}
            />
          </div>
        </div>
        
        <div className="chat-section">
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message-bubble ${msg.isUser ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-content">
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleSendMessage} className="chat-input-form">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={spriteNumber === 1 ? "Ask your teacher anything..." : "Share your thoughts..."}
              className="chat-input"
            />
            <button type="submit" className="send-button">
              ✈️
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
