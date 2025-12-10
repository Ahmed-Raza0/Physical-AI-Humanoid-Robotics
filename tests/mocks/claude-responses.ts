/**
 * Mock Claude API responses for testing
 */

/**
 * Mock successful response for a section generation
 */
export const MOCK_SECTION_RESPONSE = {
  id: 'msg_01abc123',
  type: 'message' as const,
  role: 'assistant' as const,
  content: [
    {
      type: 'text' as const,
      text: `---
title: "What is Physical AI?"
description: "Introduction to Physical AI and its core concepts"
keywords: ["embodied AI", "robotics", "sensors", "actuators"]
sidebar_position: 1
---

# What is Physical AI?

Physical AI refers to artificial intelligence systems that interact with and learn from the physical world through sensors and actuators. Unlike traditional AI that operates purely in digital environments, Physical AI is embodied in robots, autonomous vehicles, and other physical systems.

## Key Characteristics

Physical AI systems share several defining characteristics:

1. **Embodiment**: They have a physical form and presence in the real world
2. **Sensing**: They perceive their environment through cameras, LIDAR, touch sensors, and other modalities
3. **Action**: They can manipulate objects and navigate spaces through motors, grippers, and wheels
4. **Learning**: They improve their performance through experience in the physical world

## Differences from Traditional AI

While traditional AI systems process data and make predictions in virtual environments, Physical AI must contend with:

- **Uncertainty**: Real-world conditions are unpredictable and noisy
- **Real-time constraints**: Actions must be taken within strict time limits
- **Physical consequences**: Mistakes can cause damage or safety issues
- **Continuous learning**: The environment is constantly changing

These challenges require specialized algorithms, robust safety systems, and careful engineering to create effective Physical AI systems.`,
    },
  ],
  model: 'claude-sonnet-4-20250514',
  stop_reason: 'end_turn' as const,
  stop_sequence: null,
  usage: {
    input_tokens: 650,
    output_tokens: 1200,
    cache_creation_input_tokens: 0,
    cache_read_input_tokens: 0,
  },
};

/**
 * Mock response with code example
 */
export const MOCK_CODE_EXAMPLE_RESPONSE = {
  id: 'msg_01def456',
  type: 'message' as const,
  role: 'assistant' as const,
  content: [
    {
      type: 'text' as const,
      text: `## Simple Robot Control Example

Here's a basic example of controlling a robot using Python:

\`\`\`python
import time
from robot_controller import Robot

# Initialize robot
robot = Robot(port='/dev/ttyUSB0')

# Move forward for 2 seconds
robot.set_motors(left=100, right=100)
time.sleep(2)

# Turn right
robot.set_motors(left=100, right=-100)
time.sleep(1)

# Stop
robot.stop()
\`\`\`

This example demonstrates the basic control loop pattern common in Physical AI systems.`,
    },
  ],
  model: 'claude-sonnet-4-20250514',
  stop_reason: 'end_turn' as const,
  stop_sequence: null,
  usage: {
    input_tokens: 550,
    output_tokens: 800,
    cache_creation_input_tokens: 0,
    cache_read_input_tokens: 0,
  },
};

/**
 * Mock error response (rate limit)
 */
export const MOCK_RATE_LIMIT_ERROR = {
  type: 'error' as const,
  error: {
    type: 'rate_limit_error' as const,
    message: 'Rate limit exceeded. Please retry after 60 seconds.',
  },
};

/**
 * Mock error response (overloaded)
 */
export const MOCK_OVERLOADED_ERROR = {
  type: 'error' as const,
  error: {
    type: 'overloaded_error' as const,
    message: 'The API is currently overloaded. Please try again in a few seconds.',
  },
};

/**
 * Mock error response (invalid API key)
 */
export const MOCK_INVALID_API_KEY_ERROR = {
  type: 'error' as const,
  error: {
    type: 'authentication_error' as const,
    message: 'Invalid API key provided.',
  },
};

/**
 * Mock error response (invalid request)
 */
export const MOCK_INVALID_REQUEST_ERROR = {
  type: 'error' as const,
  error: {
    type: 'invalid_request_error' as const,
    message: 'Invalid request: max_tokens must be between 1 and 200000.',
  },
};

/**
 * Mock response with thinking tokens
 */
export const MOCK_RESPONSE_WITH_THINKING = {
  id: 'msg_01ghi789',
  type: 'message' as const,
  role: 'assistant' as const,
  content: [
    {
      type: 'text' as const,
      text: `# Advanced Concepts in Physical AI

Physical AI systems must solve complex challenges that don't exist in purely digital environments. These include real-time decision making, sensor fusion, and robust error handling.

## Real-Time Processing

One of the most critical aspects of Physical AI is the need for real-time responsiveness. A robot navigating through a crowded environment must process sensor data and make decisions within milliseconds to avoid collisions.

## Sensor Fusion

Physical AI systems typically combine multiple sensor modalities (vision, LIDAR, touch, proprioception) to build a comprehensive understanding of their environment. This sensor fusion is essential for robust operation.`,
    },
  ],
  model: 'claude-sonnet-4-20250514',
  stop_reason: 'end_turn' as const,
  stop_sequence: null,
  usage: {
    input_tokens: 700,
    output_tokens: 1500,
    cache_creation_input_tokens: 0,
    cache_read_input_tokens: 0,
  },
};

/**
 * Mock minimal valid markdown response
 */
export const MOCK_MINIMAL_RESPONSE = {
  id: 'msg_01jkl012',
  type: 'message' as const,
  role: 'assistant' as const,
  content: [
    {
      type: 'text' as const,
      text: `---
title: "Test Section"
description: "Minimal test section"
keywords: ["test"]
sidebar_position: 1
---

# Test Section

This is a minimal test section with basic content.`,
    },
  ],
  model: 'claude-sonnet-4-20250514',
  stop_reason: 'end_turn' as const,
  stop_sequence: null,
  usage: {
    input_tokens: 400,
    output_tokens: 200,
    cache_creation_input_tokens: 0,
    cache_read_input_tokens: 0,
  },
};

/**
 * Helper function to create a mock response with custom content
 */
export function createMockResponse(
  markdown: string,
  inputTokens: number = 600,
  outputTokens: number = 1000
) {
  return {
    id: `msg_${Math.random().toString(36).substr(2, 9)}`,
    type: 'message' as const,
    role: 'assistant' as const,
    content: [
      {
        type: 'text' as const,
        text: markdown,
      },
    ],
    model: 'claude-sonnet-4-20250514',
    stop_reason: 'end_turn' as const,
    stop_sequence: null,
    usage: {
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
    },
  };
}

/**
 * Helper to create a mock error response
 */
export function createMockError(
  errorType: 'rate_limit_error' | 'overloaded_error' | 'authentication_error' | 'invalid_request_error',
  message: string
) {
  return {
    type: 'error' as const,
    error: {
      type: errorType,
      message,
    },
  };
}
