import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './SpriteChat.module.css';

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
  const location = useLocation();
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
    const savedMessageText = localStorage[`sprite-chat-${spriteNumber}-message`];
  
    // Initialize with initial message from upload or default welcome message
    const welcomeMessage: Message = {
      text: savedMessageText || (spriteNumber === 1 
        ? "Hello! I'm your math teacher. Let's solve some problems together!" 
        : "Welcome back! Ready to continue our math journey?"),
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [spriteNumber, location.state, navigate, location.pathname]);

  // Check for stored initial message on component mount (handles page reloads)
  useEffect(() => {
    const storedInitialMessage = localStorage.getItem(`sprite-chat-${spriteNumber}-initial-message`);
    const savedMessages = localStorage.getItem(`sprite-chat-${spriteNumber}-messages`);
    
    // If there's a stored initial message and no saved messages, use the initial message
    if (storedInitialMessage && !savedMessages) {
      const initialMessage: Message = {
        text: storedInitialMessage,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([initialMessage]);
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
    // Clear messages and initial messages for both pages
    localStorage.removeItem('sprite-chat-1-messages');
    localStorage.removeItem('sprite-chat-2-messages');
    localStorage.removeItem('sprite-chat-1-initial-message');
    localStorage.removeItem('sprite-chat-2-initial-message');
    navigate('/file-upload');
  };

  return (
    <div className={styles['sprite-chat-container']}>
      <main className={styles['sprite-chat-content']}>
        <div className={styles['sprite-section']}>
          <div className={styles['classroom-background']}>
            <img 
              src={`/assets/${currentSelectedSprite}`} 
              alt={spriteNumber === 1 ? 'Teacher' : 'Student'} 
              className={styles['sprite-image']}
              style={{ transform: 'scale(4)' }}
              onClick={() => {
                const currentIndex = currentSprites.indexOf(currentSelectedSprite);
                const nextIndex = (currentIndex + 1) % currentSprites.length;
                handleSpriteSelect(currentSprites[nextIndex]);
              }}
            />
          </div>
        </div>
        
        <div className={styles['chat-section']}>
          <div className={styles['chat-messages']}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`${styles['message-bubble']} ${msg.isUser ? styles['user-message'] : styles['ai-message']}`}
              >
                <div className={styles['message-content']}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleSendMessage} className={styles['chat-input-form']}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={spriteNumber === 1 ? "Ask your teacher anything..." : "Share your thoughts..."}
              className={styles['chat-input']}
            />
            <button type="submit" className={styles['send-button']}>
              ✈️
            </button>
          </form>
        </div>
      </main>
      
      
      <div className={styles['navigation-buttons']}>
        {spriteNumber === 2 && (
          <button onClick={handleBack} className={`${styles['nav-button']} ${styles['back-button']}`}>
            ← Back
          </button>
        )}
        
        <button onClick={handleRestart} className={`${styles['nav-button']} ${styles['restart-button']}`}>
          🔄 Restart
        </button>
        
        <button onClick={handleNext} className={`${styles['nav-button']} ${styles['next-button']}`}>
          {spriteNumber === 1 ? 'Next →' : 'Complete ✓'}
        </button>
      </div>
    </div>
  );
};

export default SpriteChat;
