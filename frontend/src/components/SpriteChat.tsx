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
  const [isLoading, setIsLoading] = useState(false);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [canSendMessage, setCanSendMessage] = useState(true);
  const [selectedTeacherSprite, setSelectedTeacherSprite] = useState<string>('teacher_base.png');
  const [selectedStudentSprite, setSelectedStudentSprite] = useState<string>('student_base.png');
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

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
        ? "Can you explain the problem to me?" 
        : "Can you explain your solution to me?"),
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [spriteNumber, navigate]);

  // Save messages whenever they change
  useEffect(() => {
    localStorage.setItem(`sprite-chat-${spriteNumber}-messages`, JSON.stringify(messages));
  }, [messages, spriteNumber]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || !canSendMessage) return;

    const newMessage: Message = {
      text: message.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    try {
      if (user) {
        const endpoint = spriteNumber === 1 ? 'teacher-cat-message' : 'student-cat-message';
        // Send message to teacher cat API
        const response = await fetch(`http://localhost:5001/api/actions/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: user.username,
            message: userMessage
          })
        });

        const result = await response.json();

        if (result.success) {
          const aiResponse: Message = {
            text: result.message,
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiResponse]);
          
          // Check if teacher mode is done
          if (result.done) {
            if (spriteNumber === 1) {
              setCanSendMessage(false);
              // Redirect to sprite-chat-2 after 3 seconds
              setTimeout(() => {
                navigate('/sprite-chat-2');
                setCanSendMessage(true);
              }, 3000);
            } else {
              alert("Student mode is done");
            }
          }
        } else {
          // Handle API error
          const errorResponse: Message = {
            text: "Sorry, I encountered an error. Please try again.",
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorResponse]);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorResponse: Message = {
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
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

  const handleNext = async () => {
    if (spriteNumber === 1 && user) {
      setIsNextLoading(true);
      try {
        // Send request to teacher-cat-done endpoint
        const response = await fetch('http://localhost:5001/api/actions/teacher-cat-done', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: user.username,
            isDone: true
          })
        });

        const result = await response.json();

        if (result.success) {
          const aiResponse: Message = {
            text: result.message,
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiResponse]);
          // Navigate to sprite-chat-2 after successful API call
          setCanSendMessage(false);
          // Redirect to sprite-chat-2 after 3 seconds
          setTimeout(() => {
            navigate('/sprite-chat-2');
            setCanSendMessage(true);
          }, 3000);
        } else {
          console.error('Failed to complete teacher mode:', result.message);
          // Still navigate even if API fails, but log the error
          navigate('/sprite-chat-2');
        }
      } catch (error) {
        console.error('Error completing teacher mode:', error);
        // Still navigate even if API fails, but log the error
        navigate('/sprite-chat-2');
      } finally {
        setIsNextLoading(false);
      }
    } else if (spriteNumber === 2) {
      navigate('/file-upload');
    } else {
      // Fallback for when no user is available
      navigate('/sprite-chat-2');
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
              disabled={isLoading || !canSendMessage}
            />
            <button type="submit" className={styles['send-button']} disabled={isLoading || !canSendMessage}>
              {isLoading ? '⏳' : canSendMessage ? '✈️' : '🔒'}
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
        
        <button 
          onClick={handleNext} 
          className={`${styles['nav-button']} ${styles['next-button']}`}
          disabled={isNextLoading}
        >
          {isNextLoading ? '⏳' : (spriteNumber === 1 ? 'Next →' : 'Complete ✓')}
        </button>
      </div>
    </div>
  );
};

export default SpriteChat;
