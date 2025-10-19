import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
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
  const [isNextClicked, setIsNextClicked] = useState(false);
  const [selectedTeacherSprite, setSelectedTeacherSprite] = useState<string>('teacher_base.png');
  const [selectedStudentSprite, setSelectedStudentSprite] = useState<string>('student_base.png');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Function to convert LaTeX to speech-friendly text
  const convertLatexToSpeech = (text: string): string => {
    // Remove block math delimiters ($$...$$)
    let speechText = text.replace(/\$\$(.*?)\$\$/g, (match, content) => {
      return convertMathToSpeech(content);
    });
    
    // Remove inline math delimiters ($...$)
    speechText = speechText.replace(/\$(.*?)\$/g, (match, content) => {
      return convertMathToSpeech(content);
    });
    
    return speechText;
  };

  // Function to convert mathematical expressions to speech-friendly text
  const convertMathToSpeech = (mathExpression: string): string => {
    let speechText = mathExpression;
    
    // Common mathematical symbols and their speech equivalents
    const mathSymbols: { [key: string]: string } = {
      // Basic operations
      '+': ' plus ',
      '-': ' minus ',
      '*': ' times ',
      '/': ' divided by ',
      '=': ' equals ',
      '\\neq': ' not equals ',
      '\\approx': ' approximately equals ',
      '\\equiv': ' is equivalent to ',
      
      // Comparison symbols
      '<': ' less than ',
      '>': ' greater than ',
      '\\leq': ' less than or equal to ',
      '\\geq': ' greater than or equal to ',
      
      // Powers and roots
      '^': ' to the power of ',
      '\\sqrt': ' square root of ',
      '\\sqrt[3]': ' cube root of ',
      '\\sqrt[4]': ' fourth root of ',
      
      // Fractions
      '\\frac': ' fraction ',
      
      // Greek letters
      '\\alpha': ' alpha ',
      '\\beta': ' beta ',
      '\\gamma': ' gamma ',
      '\\delta': ' delta ',
      '\\epsilon': ' epsilon ',
      '\\theta': ' theta ',
      '\\lambda': ' lambda ',
      '\\mu': ' mu ',
      '\\pi': ' pi ',
      '\\sigma': ' sigma ',
      '\\tau': ' tau ',
      '\\phi': ' phi ',
      '\\omega': ' omega ',
      
      // Functions
      '\\sin': ' sine of ',
      '\\cos': ' cosine of ',
      '\\tan': ' tangent of ',
      '\\log': ' log of ',
      '\\ln': ' natural log of ',
      '\\exp': ' e to the power of ',
      
      // Sets and logic
      '\\in': ' is in ',
      '\\notin': ' is not in ',
      '\\subset': ' is a subset of ',
      '\\supset': ' is a superset of ',
      '\\cup': ' union ',
      '\\cap': ' intersection ',
      '\\emptyset': ' empty set ',
      
      // Calculus
      '\\int': ' integral of ',
      '\\sum': ' sum of ',
      '\\prod': ' product of ',
      '\\lim': ' limit of ',
      '\\infty': ' infinity ',
      
      // Arrows
      '\\rightarrow': ' approaches ',
      '\\leftarrow': ' approaches from ',
      '\\leftrightarrow': ' if and only if ',
      
      // Parentheses and brackets
      '\\left(': ' open parenthesis ',
      '\\right)': ' close parenthesis ',
      '\\left[': ' open bracket ',
      '\\right]': ' close bracket ',
      '\\left\\{': ' open brace ',
      '\\right\\}': ' close brace ',
    };
    
    // Replace mathematical symbols
    Object.entries(mathSymbols).forEach(([symbol, replacement]) => {
      const regex = new RegExp(symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      speechText = speechText.replace(regex, replacement);
    });
    
    // Handle fractions more specifically
    speechText = speechText.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, 'fraction $1 over $2');
    
    // Handle powers with curly braces
    speechText = speechText.replace(/\^\{([^}]+)\}/g, ' to the power of $1');
    
    // Handle subscripts
    speechText = speechText.replace(/_\{([^}]+)\}/g, ' sub $1');
    
    // Clean up extra spaces
    speechText = speechText.replace(/\s+/g, ' ').trim();
    
    return speechText;
  };

  // Function to generate and play speech for AI responses
  const playAISpeech = async (text: string) => {
    // return for now to avoid wasting API calls
    return;
    try {
      // Convert LaTeX to speech-friendly text
      const speechText = convertLatexToSpeech(text);
      
      const response = await fetch('http://localhost:5001/api/actions/generate-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: speechText })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // Play the audio
        audio.play().catch(error => {
          console.error('Error playing audio:', error);
        });

        // Clean up the URL after playing
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };
      } else {
        console.error('Failed to generate speech');
      }
    } catch (error) {
      console.error('Error generating speech:', error);
    }
  };

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

  // Function to render text with KaTeX support
  const renderTextWithMath = (text: string) => {
    // Split text by block math delimiters ($$...$$)
    const blockMathRegex = /\$\$(.*?)\$\$/g;
    const parts = text.split(blockMathRegex);
    
    return parts.map((part, index) => {
      // If it's an odd index, it's a block math expression
      if (index % 2 === 1) {
        try {
          return <BlockMath key={index} math={part} />;
        } catch (error) {
          console.error('Error rendering block math:', error);
          return <span key={index} style={{ color: 'red' }}>Math Error: {part}</span>;
        }
      }
      
      // For regular text, also check for inline math ($...$)
      const inlineMathRegex = /\$(.*?)\$/g;
      const inlineParts = part.split(inlineMathRegex);
      
      return inlineParts.map((inlinePart, inlineIndex) => {
        // If it's an odd index, it's an inline math expression
        if (inlineIndex % 2 === 1) {
          try {
            return <InlineMath key={`${index}-${inlineIndex}`} math={inlinePart} />;
          } catch (error) {
            console.error('Error rendering inline math:', error);
            return <span key={`${index}-${inlineIndex}`} style={{ color: 'red' }}>Math Error: {inlinePart}</span>;
          }
        }
        
        // Regular text
        return <span key={`${index}-${inlineIndex}`}>{inlinePart}</span>;
      });
    });
  };

  // Load saved messages for this page
  useEffect(() => {
    const savedInitialJson = localStorage[`sprite-chat-${spriteNumber}-initial`];
    let savedMessages: string[] = [];
    if (savedInitialJson) {
      savedMessages = JSON.parse(localStorage[`sprite-chat-${spriteNumber}-initial`]);
    }
  
    // Initialize with initial message from upload or default welcome message
    if (savedMessages.length > 0) {
      setMessages(savedMessages.map(x => {
        return {
          text: x,
          isUser: false,
          timestamp: new Date()
        }
      }));
    } else {
      const welcomeMessage: Message = {
        text: (spriteNumber === 1 
          ? "Sorry, I couldn't read the file. Can you explain the problem to me?" 
          : "Can you explain your solution to me?"),
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
    
    // Reset next button state when switching between sprites
    setIsNextClicked(false);
  }, [navigate]);

  // Save messages whenever they change
  useEffect(() => {
    localStorage.setItem(`sprite-chat-${spriteNumber}-messages`, JSON.stringify(messages));
  }, [messages, spriteNumber]);

  // Reset textarea height when message is cleared
  useEffect(() => {
    if (message === '' && textareaRef.current) {
      textareaRef.current.style.height = '46px';
      textareaRef.current.style.overflowY = 'hidden';
    }
  }, [message]);

  // Ensure textarea starts with correct height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '46px';
      textareaRef.current.style.overflowY = 'hidden';
    }
  }, []);

  // Reset textarea height when message is cleared
  useEffect(() => {
    if (message === '' && textareaRef.current) {
      textareaRef.current.style.height = '46px';
      textareaRef.current.style.overflowY = 'hidden';
    }
  }, [message]);

  // Ensure textarea starts with correct height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '46px';
      textareaRef.current.style.overflowY = 'hidden';
    }
  }, []);

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
          const aiResponse: Message[] = result.messages.map((x: string) => {
            return {
              text: x,
              isUser: false,
              timestamp: new Date()
            }
          });
          setMessages(prev => [...prev, ...aiResponse]);
          
          // Generate and play speech for AI response
          // playAISpeech(result.messages);
          
          // Check if teacher mode is done
          if (result.done) {
            if (spriteNumber === 1) {
              setCanSendMessage(false);
              // Redirect to sprite-chat-2 after 3 seconds
              setTimeout(() => {
                navigate('/sprite-chat-2');
                setCanSendMessage(true);
              }, 4500);
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

          // playAISpeech(errorResponse.text);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    
    // Reset height to auto to get accurate scrollHeight
    textarea.style.height = 'auto';
    
    // Get the scroll height and calculate new height
    const scrollHeight = textarea.scrollHeight;
    const minHeight = 46; // Minimum height in pixels
    const maxHeight = 120; // Maximum height in pixels
    
    // Calculate new height, ensuring it never goes below minimum
    let newHeight = scrollHeight;
    if (newHeight < minHeight) {
      newHeight = minHeight;
    } else if (newHeight > maxHeight) {
      newHeight = maxHeight;
    }
    
    // Set the height
    textarea.style.height = newHeight + 'px';
    
    // Only show scrollbar when content exceeds max height
    if (scrollHeight > maxHeight) {
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.overflowY = 'hidden';
    }
  };

  const handleSpriteSelect = (spritePath: string) => {
    if (spriteNumber === 1) {
      setSelectedTeacherSprite(spritePath);
    } else {
      setSelectedStudentSprite(spritePath);
    }
  };

  const handleNext = async () => {
    if (spriteNumber === 1 && user && !isNextClicked) {
      setIsNextClicked(true);
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
          const aiResponse: Message[] = result.messages.map((x: string) => {
            return {
              text: x,
              isUser: false,
              timestamp: new Date()
            }
          });
          setMessages(prev => [...prev, ...aiResponse]);
          
          // Generate and play speech for AI response
          // playAISpeech(result.messages);
          
          // Navigate to sprite-chat-2 after successful API call
          setCanSendMessage(false);
          // Redirect to sprite-chat-2 after 3 seconds
          setTimeout(() => {
            navigate('/sprite-chat-2');
            setCanSendMessage(true);
          }, 4500);
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

return (
    <div className={styles['sprite-chat-container']}>
      <main className={styles['sprite-chat-content']}>
        <div className={styles['sprite-section']}>
          <div className={styles['classroom-background']}>
            <img 
              src={`/assets/${currentSelectedSprite}`} 
              alt={spriteNumber === 1 ? 'Teacher' : 'Student'} 
              className={styles['sprite-image']}
              style={{ transform: 'scale(4)', marginLeft: '-800px' }}
              onClick={() => {
                const currentIndex = currentSprites.indexOf(currentSelectedSprite);
                const nextIndex = (currentIndex + 1) % currentSprites.length;
                handleSpriteSelect(currentSprites[nextIndex]);
              }}
            />
            {spriteNumber === 1 && (
              <button 
                onClick={handleNext} 
                disabled={isNextClicked || isNextLoading}
                className={`${styles['nav-button']} ${styles['next-button']} ${styles['sprite-next-button']} ${isNextClicked ? styles['disabled'] : ''}`}
              >
                {isNextLoading ? 'Switching...' : isNextClicked ? 'Switched to student mode' : 'Continue to teaching stage'}
              </button>
            )}
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
                  {renderTextWithMath(msg.text)}
                </div>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleSendMessage} className={styles['chat-input-form']}>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={spriteNumber === 1 ? "" : ""}
              className={styles['chat-input']}
              rows={1}
              disabled={isLoading || !canSendMessage || isNextClicked}
            />
            <button type="submit" className={styles['send-button']} disabled={isLoading || !canSendMessage || isNextClicked}>
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="110" height="109">
            <path d="M0 0 C23.1 0 46.2 0 70 0 C66.35673312 2.9146135 63.19577983 5.17658768 59.2109375 7.4609375 C58.10363281 8.09773438 56.99632812 8.73453125 55.85546875 9.390625 C55.28231934 9.71740234 54.70916992 10.04417969 54.11865234 10.38085938 C52.39832411 11.3617018 50.68155552 12.34877907 48.96484375 13.3359375 C42.02515016 17.31523001 35.04043649 21.20189315 28 25 C27.54262451 24.62302979 27.08524902 24.24605957 26.61401367 23.85766602 C25.24663584 22.73079297 23.87910963 21.60409996 22.51147461 20.47753906 C20.95830219 19.19766886 19.40573321 17.91706601 17.85375977 16.63574219 C14.39325492 13.78119606 10.9304683 10.93205996 7.421875 8.13671875 C5.94460937 6.95529297 5.94460937 6.95529297 4.4375 5.75 C3.56996094 5.06421875 2.70242187 4.3784375 1.80859375 3.671875 C1.21175781 3.12015625 0.61492188 2.5684375 0 2 C0 1.34 0 0.68 0 0 Z " fill="#ABD254" transform="translate(0,0)"/>
            <path d="M0 0 C0 3.7881961 -1.18631948 5.36701448 -3.12109375 8.6171875 C-3.45271515 9.17864975 -3.78433655 9.740112 -4.12600708 10.31858826 C-5.22386095 12.17434232 -6.33069143 14.02457524 -7.4375 15.875 C-8.20047067 17.16129804 -8.96275009 18.44800632 -9.72436523 19.73510742 C-11.32238098 22.4345267 -12.92343671 25.13210981 -14.52636719 27.82861328 C-18.18684571 33.9931631 -21.80500881 40.18251824 -25.42581177 46.37042236 C-27.24184345 49.47318566 -29.06044311 52.57444258 -30.87890625 55.67578125 C-31.78491577 57.2213269 -31.78491577 57.2213269 -32.70922852 58.7980957 C-33.13518311 59.52472412 -33.5611377 60.25135254 -34 61 C-34.99 60.67 -35.98 60.34 -37 60 C-37.12117188 58.91203125 -37.24234375 57.8240625 -37.3671875 56.703125 C-38.24210569 48.99081801 -39.17842225 41.34089248 -40.6328125 33.7109375 C-41.07400071 30.45365434 -41.05674153 27.28290299 -41 24 C-40.29093506 23.59273682 -39.58187012 23.18547363 -38.85131836 22.76586914 C-19.32929304 11.54685926 -19.32929304 11.54685926 0 0 Z " fill="#ACD356" transform="translate(71,2)"/>
            <path d="M0 0 C0.99 0.33 1.98 0.66 3 1 C-0.46586355 3.89662196 -3.97027917 6.2642398 -7.89453125 8.49609375 C-9.01537109 9.13740234 -10.13621094 9.77871094 -11.29101562 10.43945312 C-12.46470008 11.1057219 -13.63852914 11.77173601 -14.8125 12.4375 C-17.11195495 13.74647973 -19.4096403 15.058487 -21.70703125 16.37109375 C-22.79064941 16.98968262 -23.87426758 17.60827148 -24.99072266 18.24560547 C-27.60078394 19.76725891 -30.15617418 21.34255836 -32.69921875 22.97265625 C-36 25 -36 25 -38 25 C-38.33 25.99 -38.66 26.98 -39 28 C-39.29516602 25.70214844 -39.29516602 25.70214844 -39 23 C-37.03491211 21.29003906 -37.03491211 21.29003906 -34.27734375 19.765625 C-33.27018311 19.19529541 -32.26302246 18.62496582 -31.2253418 18.03735352 C-30.140354 17.44752686 -29.05536621 16.8577002 -27.9375 16.25 C-25.73377228 15.01539813 -23.53064682 13.77972064 -21.328125 12.54296875 C-20.24724609 11.94274902 -19.16636719 11.3425293 -18.05273438 10.72412109 C-13.40409125 8.09866382 -8.87165879 5.28738302 -4.38061523 2.40136719 C-2.73046875 1.37890625 -2.73046875 1.37890625 0 0 Z " fill="#F3F8E9" transform="translate(68,1)"/>
            </svg>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SpriteChat;
