# Physical AI & Humanoid Robotics - Interactive Learning Platform

A comprehensive, AI-powered educational platform for learning Physical AI and Humanoid Robotics, built with Docusaurus, React, and cutting-edge AI technologies.

## 🚀 Features

### 1. **RAG-Powered AI Chatbot**
- **Retrieval-Augmented Generation (RAG)**: Intelligent chatbot that retrieves relevant context from course material
- **OpenAI Integration**: Optional GPT integration for advanced AI responses
- **Knowledge Base**: Built-in knowledge about Physical AI, ROS 2, Humanoid Robotics, Digital Twins, and VLA models
- **Source Citations**: Shows sources for responses to build trust and enable further learning
- **Conversation History**: Maintains context across multiple messages

### 2. **Authentication System**
- **User Registration**: Sign up with email and password
- **Secure Login**: Client-side authentication with localStorage (demo mode)
- **Protected Dashboard**: Personalized user dashboard with learning progress
- **Session Management**: Automatic session persistence

### 3. **Comprehensive Textbook Content**
- 6 complete chapters on Physical AI and Robotics
- Covers Introduction, Humanoid Robotics, ROS 2, Digital Twins, VLA Models, and Capstone Projects

### 4. **Blog Platform**
- Curated articles on robotics and AI
- Category filtering and search functionality
- Newsletter subscription (UI ready)

### 5. **Intelligent Task System**
- TaskRunner for complex AI workflows
- Retry logic, caching, parallel/sequential execution
- 55+ passing tests

## 🛠️ Tech Stack

- React 19 + TypeScript + Docusaurus 3.9.2
- OpenAI GPT + Embeddings
- Vitest for testing
- CSS Modules with animations

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your OPENAI_API_KEY (optional)

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
\`\`\`

## 📚 Usage

### AI Chatbot
1. Go to `/chatbot`
2. Ask questions about robotics and AI
3. Optionally add OpenAI API key for enhanced responses

### Authentication
1. Sign up at `/signup`
2. Login at `/login`
3. Access your dashboard at `/dashboard`

## 📁 Project Structure

\`\`\`
my-ai-textbook/
├── docs/                  # Textbook markdown files
├── src/
│   ├── pages/            # Pages (blog, chatbot, auth)
│   ├── lib/client/       # RAG & Auth clients
│   ├── tasks/            # Intelligent task system
│   └── components/       # React components
├── vitest.config.ts      # Test configuration
└── ARCHITECTURE.md       # Detailed architecture docs
\`\`\`

## 🧪 Testing

\`\`\`bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
\`\`\`

## 🚀 Deployment

Deploy to Vercel, Netlify, or any static hosting:

\`\`\`bash
npm run build
# Upload the 'build' directory
\`\`\`

## 📖 Documentation

- **Architecture**: See `ARCHITECTURE.md`
- **API Docs**: See component files
- **Tasks System**: See `src/tasks/README.md` (if available)

## 🔐 Security

**Note**: Current auth is client-side demo mode. For production:
- Integrate with Firebase Auth, Auth0, or Supabase
- Move OpenAI API calls to backend
- Use HTTPS

## 🙏 Acknowledgments

Built with Docusaurus, powered by OpenAI, made with ❤️ for education.

---

**Made by AI, for learning AI** 🤖
