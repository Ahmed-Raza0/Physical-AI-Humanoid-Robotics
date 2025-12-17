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
 * Expanded knowledge base for RAG
 */
const knowledgeBase = {
  'physical ai': {
    title: 'Physical AI Overview',
    content: 'Physical AI refers to AI systems that interact with the physical world through sensors and actuators. Unlike purely digital AI, Physical AI is embodied in robots and physical devices that can perceive their environment, make decisions, and take actions in the real world. This includes humanoid robots, autonomous vehicles, industrial automation systems, and smart manufacturing. Physical AI combines computer vision, sensor fusion, motion planning, and real-time control to achieve intelligent physical interactions.',
  },
  'ros 2': {
    title: 'ROS 2 Architecture',
    content: 'ROS 2 (Robot Operating System 2) is a middleware framework that provides communication infrastructure between different parts of a robot. It uses a publish-subscribe pattern with topics, synchronous services, and asynchronous actions to enable modular robot development. Key improvements over ROS 1 include real-time capabilities with DDS (Data Distribution Service), better security with SROS2, multi-platform support (Linux, Windows, macOS), and improved lifecycle management for nodes.',
  },
  'humanoid robot': {
    title: 'Humanoid Robotics',
    content: 'Humanoid robots are designed to resemble and mimic human form and behavior. They typically have a head, torso, two arms, and two legs. Locomotion involves bipedal walking which requires complex balance control using techniques like Zero Moment Point (ZMP), Model Predictive Control (MPC), and whole-body control. Applications include research, entertainment, healthcare assistance, elderly care, space exploration, and disaster response. Notable examples include Tesla Optimus, Boston Dynamics Atlas, and Figure 01.',
  },
  'digital twin': {
    title: 'Digital Twin Simulation',
    content: 'A digital twin is a virtual replica of a physical robot that allows you to simulate and test behaviors before deploying them in the real world. It helps reduce risks, save costs, and accelerate development by testing in simulation first. Digital twins can use physics engines like Gazebo Classic, Gazebo Ignition, Isaac Sim (NVIDIA), PyBullet, MuJoCo, or Webots. They enable testing of control algorithms, sensor configurations, and robot behaviors in various scenarios without physical hardware.',
  },
  'vision language': {
    title: 'Vision-Language-Action Models',
    content: 'Vision-Language-Action (VLA) models combine computer vision, natural language processing, and action prediction to enable robots to understand visual scenes, interpret language commands, and execute appropriate actions. These models leverage foundation models like GPT-4V, CLIP, and PaLM-E to create more adaptable and intelligent robots. VLA models enable zero-shot task generalization, allowing robots to perform tasks they were never explicitly trained on by understanding natural language instructions.',
  },
  'sensor fusion': {
    title: 'Sensor Fusion for Robotics',
    content: 'Sensor fusion combines data from multiple sensors (cameras, LiDAR, IMU, encoders) to create a more accurate and robust understanding of the environment. Common techniques include Kalman filters, particle filters, and sensor fusion networks. In robotics, sensor fusion is crucial for localization (SLAM), navigation, object detection, and state estimation. It helps overcome individual sensor limitations and provides redundancy.',
  },
  'slam': {
    title: 'SLAM: Simultaneous Localization and Mapping',
    content: 'SLAM is a fundamental problem in mobile robotics where a robot must build a map of an unknown environment while simultaneously tracking its location within that map. Popular SLAM algorithms include ORB-SLAM (visual), Cartographer (LiDAR), and RTAB-Map (RGB-D). SLAM is essential for autonomous navigation, AR/VR applications, and robot exploration.',
  },
  'motion planning': {
    title: 'Motion Planning and Path Planning',
    content: 'Motion planning involves finding a collision-free path for a robot to move from start to goal configuration. Common algorithms include RRT (Rapidly-exploring Random Trees), PRM (Probabilistic Roadmap), A* for grid-based planning, and trajectory optimization methods. For manipulators, motion planning must consider joint limits, singularities, and inverse kinematics.',
  },
  'reinforcement learning': {
    title: 'Reinforcement Learning for Robotics',
    content: 'Reinforcement Learning (RL) enables robots to learn behaviors through trial and error by maximizing cumulative rewards. Popular RL algorithms for robotics include PPO (Proximal Policy Optimization), SAC (Soft Actor-Critic), and TD3 (Twin Delayed DDPG). RL is particularly useful for learning complex manipulation tasks, locomotion controllers, and adaptive behaviors that are hard to program manually.',
  },
  'computer vision': {
    title: 'Computer Vision in Robotics',
    content: 'Computer vision enables robots to interpret and understand visual information from cameras. Key tasks include object detection (YOLO, Faster R-CNN), semantic segmentation, depth estimation, pose estimation, and visual tracking. Modern approaches leverage deep learning models and transformers (ViT, DETR) for robust perception. Vision is crucial for manipulation, navigation, and human-robot interaction.',
  },
  'manipulation': {
    title: 'Robot Manipulation and Grasping',
    content: 'Robot manipulation involves controlling robotic arms to interact with objects through grasping, placing, assembly, and tool use. Key challenges include grasp planning, force control, tactile sensing, and dexterous manipulation. Modern approaches use deep learning for grasp prediction, reinforcement learning for manipulation policies, and model predictive control for precise movements.',
  },
  'control systems': {
    title: 'Robot Control Systems',
    content: 'Robot control systems regulate robot behavior to achieve desired performance. Common control approaches include PID (Proportional-Integral-Derivative) control for basic regulation, Model Predictive Control (MPC) for optimal trajectories, and impedance/admittance control for physical interaction. Real-time control loops typically run at 100Hz-1kHz depending on the application.',
  },
  'navigation': {
    title: 'Autonomous Navigation',
    content: 'Autonomous navigation enables robots to move from one location to another while avoiding obstacles. The navigation stack typically includes global path planning (A*, Dijkstra), local planning (DWA, TEB), obstacle detection, and localization. ROS 2 Navigation (Nav2) provides a complete navigation framework with recovery behaviors, waypoint following, and dynamic reconfiguration.',
  },
  'machine learning': {
    title: 'Machine Learning in Robotics',
    content: 'Machine learning enhances robot capabilities through data-driven approaches. Supervised learning is used for object recognition and classification. Unsupervised learning helps with clustering and anomaly detection. Imitation learning enables robots to learn from human demonstrations. Transfer learning allows knowledge transfer between tasks and sim-to-real deployment.',
  },
}

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
