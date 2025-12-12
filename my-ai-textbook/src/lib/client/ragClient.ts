/**
 * Client-side RAG implementation for chatbot
 * Uses OpenAI API directly from the browser (requires API key)
 */

import OpenAI from 'openai';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface RAGResponse {
  message: string;
  sources?: Array<{
    title: string;
    excerpt: string;
  }>;
}

/**
 * Simple knowledge base for RAG - can be expanded
 */
const knowledgeBase = {
  'physical ai': {
    title: 'Physical AI Overview',
    content: 'Physical AI refers to AI systems that interact with the physical world through sensors and actuators. Unlike purely digital AI, Physical AI is embodied in robots and physical devices that can perceive their environment, make decisions, and take actions in the real world. This includes humanoid robots, autonomous vehicles, and industrial automation systems.',
  },
  'ros 2': {
    title: 'ROS 2 Architecture',
    content: 'ROS 2 (Robot Operating System 2) is a middleware framework that provides communication infrastructure between different parts of a robot. It uses a publish-subscribe pattern with topics, synchronous services, and asynchronous actions to enable modular robot development. Key improvements over ROS 1 include real-time capabilities, better security, and multi-platform support.',
  },
  'humanoid robot': {
    title: 'Humanoid Robotics',
    content: 'Humanoid robots are designed to resemble and mimic human form and behavior. They typically have a head, torso, two arms, and two legs. Locomotion involves bipedal walking which requires complex balance control using techniques like Zero Moment Point (ZMP). Applications include research, entertainment, healthcare assistance, and space exploration.',
  },
  'digital twin': {
    title: 'Digital Twin Simulation',
    content: 'A digital twin is a virtual replica of a physical robot that allows you to simulate and test behaviors before deploying them in the real world. It helps reduce risks, save costs, and accelerate development by testing in simulation first. Digital twins can use physics engines like Gazebo, Isaac Sim, or PyBullet.',
  },
  'vision language': {
    title: 'Vision-Language-Action Models',
    content: 'Vision-Language-Action (VLA) models combine computer vision, natural language processing, and action prediction to enable robots to understand visual scenes, interpret language commands, and execute appropriate actions. These models leverage foundation models like GPT-4V and CLIP to create more adaptable and intelligent robots.',
  },
};

/**
 * Retrieve relevant context from knowledge base
 */
function retrieveContext(query: string): Array<{title: string; excerpt: string}> {
  const queryLower = query.toLowerCase();
  const results: Array<{title: string; excerpt: string}> = [];

  for (const [key, data] of Object.entries(knowledgeBase)) {
    if (queryLower.includes(key)) {
      results.push({
        title: data.title,
        excerpt: data.content,
      });
    }
  }

  return results;
}

/**
 * RAG Client - handles context retrieval and answer generation
 */
export class RAGClient {
  private openai: OpenAI | null = null;
  private conversationHistory: Message[] = [];

  constructor(apiKey?: string) {
    if (apiKey && typeof window !== 'undefined') {
      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true, // Required for browser use
      });
    }
  }

  /**
   * Send a message and get a RAG-enhanced response
   */
  async chat(
    userMessage: string,
    options: ChatOptions = {}
  ): Promise<RAGResponse> {
    const {
      temperature = 0.7,
      maxTokens = 500,
      model = 'gpt-3.5-turbo',
    } = options;

    // Retrieve relevant context from knowledge base
    const sources = retrieveContext(userMessage);
    const context = sources.map(s => `${s.title}: ${s.excerpt}`).join('\n\n');

    // If no OpenAI key, return a simple response with context
    if (!this.openai) {
      return this.getFallbackResponse(userMessage, sources);
    }

    // Build messages with context
    const systemMessage: Message = {
      role: 'system',
      content: `You are a helpful AI assistant specializing in Physical AI and Humanoid Robotics. Use the following context to answer questions accurately and concisely.

Context:
${context || 'No specific context found. Use your general knowledge.'}

If the context doesn't contain the answer, provide a general response based on your knowledge of robotics and AI.`,
    };

    const messages: Message[] = [
      systemMessage,
      ...this.conversationHistory,
      { role: 'user', content: userMessage },
    ];

    try {
      const response = await this.openai.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });

      const assistantMessage = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

      // Update conversation history
      this.conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: assistantMessage }
      );

      // Keep only last 10 messages to avoid context limit
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      return {
        message: assistantMessage,
        sources: sources.length > 0 ? sources : undefined,
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getFallbackResponse(userMessage, sources);
    }
  }

  /**
   * Fallback response when OpenAI is not available
   */
  private getFallbackResponse(
    userMessage: string,
    sources: Array<{title: string; excerpt: string}>
  ): RAGResponse {
    if (sources.length > 0) {
      return {
        message: `Based on the course material:\n\n${sources[0].excerpt}\n\nWould you like to know more about this topic?`,
        sources,
      };
    }

    // Generic fallback
    const queryLower = userMessage.toLowerCase();
    if (queryLower.includes('hello') || queryLower.includes('hi')) {
      return {
        message: 'Hello! I\'m your Physical AI assistant. Ask me about robotics, ROS 2, humanoid robots, digital twins, or AI vision systems.',
      };
    }

    return {
      message: 'I don\'t have specific information about that in my knowledge base. Please explore the textbook chapters for comprehensive information on Physical AI and Humanoid Robotics. You can also provide an OpenAI API key to enable advanced AI responses.',
    };
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get current conversation history
   */
  getHistory(): Message[] {
    return [...this.conversationHistory];
  }
}

/**
 * Create a singleton instance
 */
let ragClientInstance: RAGClient | null = null;

export function getRagClient(apiKey?: string): RAGClient {
  if (!ragClientInstance) {
    ragClientInstance = new RAGClient(apiKey);
  }
  return ragClientInstance;
}

export default RAGClient;
