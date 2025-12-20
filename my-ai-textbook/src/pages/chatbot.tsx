import React, { useState, useRef, useEffect } from 'react';
import Layout from '@theme/Layout';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '../styles/animations';
import { getRagClient, type RAGResponse } from '../lib/client/ragClient';
import { TypingIndicator } from '../components/UI/TypingIndicator';
import styles from './chatbot.module.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  sources?: Array<{title: string; excerpt: string}>;
}

const suggestedQuestions = [
  'What is Physical AI?',
  'How does ROS 2 work?',
  'Explain SLAM for robotics',
  'What is sensor fusion?',
  'Tell me about reinforcement learning for robots',
  'How does robot motion planning work?',
  'What are vision-language-action models?',
  'Explain robot manipulation and grasping',
];

export default function Chatbot(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hello! I\'m your Physical AI assistant powered by RAG (Retrieval-Augmented Generation). Ask me anything about robotics, AI, ROS 2, or humanoid robots!',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [errorNotification, setErrorNotification] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ragClient = useRef(getRagClient()).current;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const clearConversation = () => {
    setMessages([
      {
        id: 1,
        text: 'Hello! I\'m your Physical AI assistant powered by RAG (Retrieval-Augmented Generation). Ask me anything about robotics, AI, ROS 2, or humanoid robots!',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  };

  const exportConversation = () => {
    const conversationText = messages
      .map(msg => {
        const time = msg.timestamp.toLocaleString();
        const sender = msg.sender === 'user' ? 'You' : 'AI Assistant';
        let text = `[${time}] ${sender}:\n${msg.text}\n`;

        if (msg.sources && msg.sources.length > 0) {
          text += '\nSources:\n';
          msg.sources.forEach(source => {
            text += `- ${source.title}\n`;
          });
        }

        return text;
      })
      .join('\n---\n\n');

    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatbot-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Use RAG client to get response
      const response: RAGResponse = await ragClient.chat(currentInput);

      const botResponse: Message = {
        id: messages.length + 2,
        text: response.message,
        sender: 'bot',
        timestamp: new Date(),
        sources: response.sources,
      };

      setMessages(prev => [...prev, botResponse]);
      setErrorNotification(null); // Clear any previous errors
    } catch (error) {
      console.error('Error getting response:', error);

      // Determine error type and show appropriate message
      let errorMsg = 'Sorry, I encountered an error processing your request.';
      let notificationMsg = 'An error occurred. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMsg = 'It looks like there\'s an issue with the OpenAI API key. I\'ll use my built-in knowledge base instead.';
          notificationMsg = 'API key error - using fallback mode';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMsg = 'I\'m having trouble connecting to the AI service. Please check your internet connection.';
          notificationMsg = 'Network connection issue';
        } else if (error.message.includes('rate limit')) {
          errorMsg = 'The AI service is currently rate-limited. Please wait a moment and try again.';
          notificationMsg = 'Rate limit reached - please wait';
        }
      }

      setErrorNotification(notificationMsg);
      setTimeout(() => setErrorNotification(null), 5000); // Clear notification after 5 seconds

      const errorMessage: Message = {
        id: messages.length + 2,
        text: errorMsg + ' You can still ask questions - I\'ll do my best to help using the knowledge base!',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
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

  const handleSetApiKey = () => {
    if (apiKey.trim()) {
      // Re-initialize RAG client with API key
      const newClient = getRagClient(apiKey);
      setShowApiKeyInput(false);

      setMessages(prev => [...prev, {
        id: Date.now(),
        text: 'OpenAI API key configured! I can now provide more detailed and accurate responses using GPT models.',
        sender: 'bot',
        timestamp: new Date(),
      }]);
    }
  };

  return (
    <Layout
      title="AI Chatbot"
      description="Chat with our RAG-powered AI assistant about Physical AI and Robotics">
      <div className={styles.chatbotContainer}>
        {/* Error Notification */}
        {errorNotification && (
          <div className={styles.errorNotification}>
            <span className={styles.errorIcon}>⚠️</span>
            <span>{errorNotification}</span>
            <button
              className={styles.closeNotification}
              onClick={() => setErrorNotification(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.botAvatar}>🤖</div>
            <div className={styles.headerInfo}>
              <h1>Physical AI Assistant</h1>
              <p className={styles.status}>
                <span className={styles.statusDot}></span>
                Online • RAG-Powered
              </p>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.clearButton}
                onClick={clearConversation}
                title="Clear conversation"
                disabled={messages.length <= 1}
              >
                🗑️ Clear
              </button>
              <button
                className={styles.exportButton}
                onClick={exportConversation}
                title="Export conversation"
                disabled={messages.length <= 1}
              >
                💾 Export
              </button>
              <button
                className={styles.apiKeyButton}
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                title="Configure OpenAI API Key for advanced AI responses"
              >
                🔑 API Key
              </button>
            </div>
          </div>

          {showApiKeyInput && (
            <div className={styles.apiKeyInput}>
              <input
                type="password"
                placeholder="Enter OpenAI API Key (optional)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className={styles.apiInput}
              />
              <button onClick={handleSetApiKey} className={styles.apiSubmit}>
                Set Key
              </button>
            </div>
          )}
        </div>

        <div className={styles.mainContent}>
          {/* Suggested Questions */}
          {messages.length === 1 && (
            <motion.div
              className={styles.suggestedQuestions}
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.h3 variants={staggerItem}>Suggested Questions:</motion.h3>
              <div className={styles.questionsGrid}>
                {suggestedQuestions.map((question, index) => (
                  <motion.button
                    key={index}
                    className={styles.suggestionButton}
                    onClick={() => handleSuggestedQuestion(question)}
                    variants={staggerItem}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {question}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Messages Container */}
          <div className={styles.messagesContainer}>
            {messages.map(message => (
              <motion.div
                key={message.id}
                className={`${styles.messageWrapper} ${
                  message.sender === 'user' ? styles.userMessage : styles.botMessage
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {message.sender === 'bot' && (
                  <div className={styles.messageAvatar}>🤖</div>
                )}
                <div className={styles.messageBubble}>
                  <p className={styles.messageText}>{message.text}</p>

                  {/* Display sources if available */}
                  {message.sources && message.sources.length > 0 && (
                    <div className={styles.sources}>
                      <p className={styles.sourcesTitle}>📚 Sources:</p>
                      {message.sources.map((source, idx) => (
                        <div key={idx} className={styles.source}>
                          <strong>{source.title}</strong>
                        </div>
                      ))}
                    </div>
                  )}

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
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                className={`${styles.messageWrapper} ${styles.botMessage}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className={styles.messageAvatar}>🤖</div>
                <TypingIndicator />
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={styles.inputArea}>
            <div className={styles.inputContainer}>
              <textarea
                className={styles.input}
                placeholder="Ask about robotics, AI, ROS 2, or humanoid robots..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
              />
              <button
                className={styles.sendButton}
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
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
              <h4>RAG-Powered</h4>
              <p>Retrieves relevant context from course material</p>
            </div>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📚</span>
            <div>
              <h4>Textbook Knowledge</h4>
              <p>Answers based on comprehensive Physical AI content</p>
            </div>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🎯</span>
            <div>
              <h4>Optional AI Enhancement</h4>
              <p>Add OpenAI key for GPT-powered responses</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
