import React, { useState, useRef, useEffect } from 'react';
import Layout from '@theme/Layout';
import { getRagClient, type RAGResponse } from '../lib/client/ragClient';
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
  'Explain humanoid robot locomotion',
  'What is a digital twin?',
  'Tell me about vision-language-action models',
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ragClient = useRef(getRagClient()).current;

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
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage: Message = {
        id: messages.length + 2,
        text: 'Sorry, I encountered an error. Please try again or check your API key if using advanced AI features.',
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
            <button
              className={styles.apiKeyButton}
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              title="Configure OpenAI API Key for advanced AI responses"
            >
              🔑 API Key
            </button>
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
