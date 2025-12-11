import React, { useState, useRef, useEffect } from 'react';
import Layout from '@theme/Layout';
import styles from './chatbot.module.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const suggestedQuestions = [
  'What is Physical AI?',
  'How does ROS 2 work?',
  'Explain humanoid robot locomotion',
  'What is a digital twin?',
  'How do I get started with robotics?',
];

const botResponses: Record<string, string> = {
  'what is physical ai': 'Physical AI refers to AI systems that interact with the physical world through sensors and actuators. Unlike purely digital AI, Physical AI is embodied in robots and physical devices that can perceive their environment, make decisions, and take actions in the real world.',
  'how does ros 2 work': 'ROS 2 (Robot Operating System 2) is a middleware framework that provides communication infrastructure between different parts of a robot. It uses a publish-subscribe pattern with topics, synchronous services, and asynchronous actions to enable modular robot development.',
  'explain humanoid robot locomotion': 'Humanoid robot locomotion involves bipedal walking, which requires complex balance control using techniques like Zero Moment Point (ZMP). The robot must coordinate multiple joints, maintain stability, and adapt to terrain while walking.',
  'what is a digital twin': 'A digital twin is a virtual replica of a physical robot that allows you to simulate and test behaviors before deploying them in the real world. It helps reduce risks, save costs, and accelerate development by testing in simulation first.',
  'how do i get started with robotics': 'To get started with robotics: 1) Learn programming basics (Python/C++), 2) Study ROS 2 fundamentals, 3) Understand basic mechanics and electronics, 4) Build simple projects, and 5) Join robotics communities. Our textbook covers all these topics!',
  default: 'That\'s an interesting question! I recommend exploring our comprehensive textbook chapters on Physical AI and Humanoid Robotics. You can also ask me about specific topics like ROS 2, sensors, locomotion, or AI integration.',
};

function getBotResponse(userMessage: string): string {
  const normalizedMessage = userMessage.toLowerCase().trim();

  for (const [key, response] of Object.entries(botResponses)) {
    if (normalizedMessage.includes(key)) {
      return response;
    }
  }

  return botResponses.default;
}

export default function Chatbot(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hello! I\'m your Physical AI assistant. Ask me anything about robotics, AI, ROS 2, or humanoid robots!',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: getBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Layout
      title="AI Chatbot"
      description="Chat with our AI assistant about Physical AI and Robotics">
      <div className={styles.chatbotContainer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.botAvatar}>🤖</div>
            <div className={styles.headerInfo}>
              <h1>Physical AI Assistant</h1>
              <p className={styles.status}>
                <span className={styles.statusDot}></span>
                Online
              </p>
            </div>
          </div>
        </div>

        <div className={styles.mainContent}>
          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className={styles.suggestedQuestions}>
              <h3>Suggested Questions:</h3>
              <div className={styles.questionsGrid}>
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    className={styles.suggestionButton}
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div className={styles.messagesContainer}>
            {messages.map(message => (
              <div
                key={message.id}
                className={`${styles.messageWrapper} ${
                  message.sender === 'user' ? styles.userMessage : styles.botMessage
                }`}
              >
                {message.sender === 'bot' && (
                  <div className={styles.messageAvatar}>🤖</div>
                )}
                <div className={styles.messageBubble}>
                  <p className={styles.messageText}>{message.text}</p>
                  <span className={styles.messageTime}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {message.sender === 'user' && (
                  <div className={styles.messageAvatar}>👤</div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className={`${styles.messageWrapper} ${styles.botMessage}`}>
                <div className={styles.messageAvatar}>🤖</div>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={styles.inputArea}>
            <div className={styles.inputContainer}>
              <textarea
                className={styles.input}
                placeholder="Type your question about robotics or AI..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
              />
              <button
                className={styles.sendButton}
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
              >
                <span className={styles.sendIcon}>➤</span>
              </button>
            </div>
            <p className={styles.inputHint}>
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>⚡</span>
            <div>
              <h4>Instant Answers</h4>
              <p>Get quick responses to your robotics questions</p>
            </div>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📚</span>
            <div>
              <h4>Textbook Knowledge</h4>
              <p>Answers based on comprehensive course material</p>
            </div>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🎯</span>
            <div>
              <h4>Contextual Help</h4>
              <p>Guidance tailored to your learning journey</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
