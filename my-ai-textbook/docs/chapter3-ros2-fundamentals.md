# Chapter 3: ROS 2 Fundamentals

## Overview

ROS 2 (Robot Operating System 2) is the next-generation middleware framework for building robot applications. It provides tools, libraries, and conventions that simplify the task of creating complex and robust robot behavior across a wide variety of robotic platforms. This chapter covers the fundamentals of ROS 2, from installation to building your first robot application.

## What is ROS 2?

ROS 2 is not an operating system but rather a **middleware** that sits between your robot's hardware and application code, providing:
- **Communication infrastructure** between different parts of your robot
- **Hardware abstraction** to work with various sensors and actuators
- **Package management** for organizing and sharing code
- **Development tools** for debugging, visualization, and simulation

### Key Improvements from ROS 1

1. **Real-time Capable**: Deterministic communication for safety-critical applications
2. **Multi-platform**: Linux, Windows, macOS, and embedded systems
3. **Security**: Built-in encryption and authentication
4. **Better Reliability**: No single point of failure (no roscore)
5. **Modern C++**: Uses C++17 features
6. **DDS Middleware**: Data Distribution Service for robust communication

## Core Concepts

### 1. Nodes

Nodes are the fundamental building blocks - individual processes that perform computation.

```python
# Example: Simple ROS 2 Python node
import rclpy
from rclpy.node import Node

class MinimalPublisher(Node):
    def __init__(self):
        super().__init__('minimal_publisher')
        self.publisher_ = self.create_publisher(String, 'topic', 10)
        self.timer = self.create_timer(0.5, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello World: {self.i}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Publishing: "{msg.data}"')
        self.i += 1

def main(args=None):
    rclpy.init(args=args)
    minimal_publisher = MinimalPublisher()
    rclpy.spin(minimal_publisher)
    minimal_publisher.destroy_node()
    rclpy.shutdown()
```

### 2. Topics

Topics enable asynchronous many-to-many communication via publish-subscribe pattern.

```python
# Publisher example
from std_msgs.msg import String

class SensorPublisher(Node):
    def __init__(self):
        super().__init__('sensor_publisher')
        self.publisher_ = self.create_publisher(String, 'sensor_data', 10)
        self.timer = self.create_timer(0.1, self.publish_sensor_data)

    def publish_sensor_data(self):
        msg = String()
        msg.data = f'Sensor reading: {read_sensor()}'
        self.publisher_.publish(msg)
```

```python
# Subscriber example
class SensorSubscriber(Node):
    def __init__(self):
        super().__init__('sensor_subscriber')
        self.subscription = self.create_subscription(
            String,
            'sensor_data',
            self.listener_callback,
            10
        )

    def listener_callback(self, msg):
        self.get_logger().info(f'Received: "{msg.data}"')
```

### 3. Services

Services provide synchronous request-response communication.

```python
# Service server
from example_interfaces.srv import AddTwoInts

class AdditionServer(Node):
    def __init__(self):
        super().__init__('addition_server')
        self.srv = self.create_service(
            AddTwoInts,
            'add_two_ints',
            self.add_two_ints_callback
        )

    def add_two_ints_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info(f'Request: {request.a} + {request.b} = {response.sum}')
        return response
```

```python
# Service client
class AdditionClient(Node):
    def __init__(self):
        super().__init__('addition_client')
        self.cli = self.create_client(AddTwoInts, 'add_two_ints')
        while not self.cli.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Service not available, waiting...')

    def send_request(self, a, b):
        req = AddTwoInts.Request()
        req.a = a
        req.b = b
        future = self.cli.call_async(req)
        return future
```

### 4. Actions

Actions provide goal-oriented communication with feedback and cancellation.

```python
# Action server example
from action_tutorials_interfaces.action import Fibonacci
from rclpy.action import ActionServer

class FibonacciActionServer(Node):
    def __init__(self):
        super().__init__('fibonacci_action_server')
        self._action_server = ActionServer(
            self,
            Fibonacci,
            'fibonacci',
            self.execute_callback
        )

    async def execute_callback(self, goal_handle):
        self.get_logger().info('Executing goal...')
        feedback_msg = Fibonacci.Feedback()
        feedback_msg.partial_sequence = [0, 1]

        for i in range(1, goal_handle.request.order):
            feedback_msg.partial_sequence.append(
                feedback_msg.partial_sequence[i] +
                feedback_msg.partial_sequence[i-1]
            )
            goal_handle.publish_feedback(feedback_msg)
            await asyncio.sleep(1)

        goal_handle.succeed()
        result = Fibonacci.Result()
        result.sequence = feedback_msg.partial_sequence
        return result
```

## ROS 2 Package Structure

```text
my_robot_package/
├── package.xml           # Package metadata
├── CMakeLists.txt        # Build configuration (C++)
├── setup.py              # Build configuration (Python)
├── resource/             # Package resources
├── my_robot_package/     # Python package
│   ├── __init__.py
│   └── my_node.py
├── launch/               # Launch files
│   └── robot_launch.py
├── config/               # Configuration files
│   └── params.yaml
├── urdf/                 # Robot descriptions
│   └── robot.urdf
└── rviz/                 # Visualization configs
    └── config.rviz
```

## Launch Files

Launch files start multiple nodes with configured parameters.

```python
# launch/robot_launch.py
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='my_robot_package',
            executable='sensor_node',
            name='sensor_reader',
            parameters=[{
                'sensor_rate': 10.0,
                'sensor_topic': '/sensors/imu'
            }]
        ),
        Node(
            package='my_robot_package',
            executable='controller_node',
            name='robot_controller',
            remappings=[
                ('/cmd_vel', '/robot/cmd_vel'),
            ]
        ),
    ])
```

## Parameters

Parameters configure node behavior at runtime.

```python
# Using parameters in a node
class ParameterNode(Node):
    def __init__(self):
        super().__init__('parameter_node')

        # Declare parameters
        self.declare_parameter('my_parameter', 'default_value')
        self.declare_parameter('update_rate', 10.0)

        # Get parameter values
        my_param = self.get_parameter('my_parameter').value
        rate = self.get_parameter('update_rate').value

        self.get_logger().info(f'Parameter value: {my_param}')
```

```yaml
# config/params.yaml
parameter_node:
  ros__parameters:
    my_parameter: 'configured_value'
    update_rate: 20.0
```

## TF2 (Transform Library)

TF2 manages coordinate frames and transformations.

```python
# Publishing transforms
from geometry_msgs.msg import TransformStamped
from tf2_ros import TransformBroadcaster

class FramePublisher(Node):
    def __init__(self):
        super().__init__('frame_publisher')
        self.tf_broadcaster = TransformBroadcaster(self)
        self.timer = self.create_timer(0.1, self.broadcast_timer_callback)

    def broadcast_timer_callback(self):
        t = TransformStamped()
        t.header.stamp = self.get_clock().now().to_msg()
        t.header.frame_id = 'world'
        t.child_frame_id = 'robot_base'

        # Set translation and rotation
        t.transform.translation.x = 1.0
        t.transform.translation.y = 2.0
        t.transform.translation.z = 0.0

        # Quaternion rotation
        t.transform.rotation.x = 0.0
        t.transform.rotation.y = 0.0
        t.transform.rotation.z = 0.0
        t.transform.rotation.w = 1.0

        self.tf_broadcaster.sendTransform(t)
```

```python
# Listening to transforms
from tf2_ros import TransformListener, Buffer

class FrameListener(Node):
    def __init__(self):
        super().__init__('frame_listener')
        self.tf_buffer = Buffer()
        self.tf_listener = TransformListener(self.tf_buffer, self)
        self.timer = self.create_timer(1.0, self.on_timer)

    def on_timer(self):
        try:
            trans = self.tf_buffer.lookup_transform(
                'world',
                'robot_base',
                rclpy.time.Time()
            )
            self.get_logger().info(f'Transform: {trans}')
        except Exception as e:
            self.get_logger().warn(f'Could not transform: {e}')
```

## URDF (Unified Robot Description Format)

URDF describes robot kinematics and dynamics.

```xml
<!-- urdf/simple_robot.urdf -->
<?xml version="1.0"?>
<robot name="simple_robot">
  <!-- Base Link -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.6 0.4 0.2"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 0.8 1"/>
      </material>
    </visual>
  </link>

  <!-- Wheel Link -->
  <link name="left_wheel">
    <visual>
      <geometry>
        <cylinder length="0.05" radius="0.1"/>
      </geometry>
      <material name="black">
        <color rgba="0 0 0 1"/>
      </material>
    </visual>
  </link>

  <!-- Joint -->
  <joint name="left_wheel_joint" type="continuous">
    <parent link="base_link"/>
    <child link="left_wheel"/>
    <origin xyz="0 0.2 0" rpy="1.57 0 0"/>
    <axis xyz="0 0 1"/>
  </joint>
</robot>
```

## ROS 2 Tools

### Command Line Tools

```bash
# List active nodes
ros2 node list

# Get node information
ros2 node info /my_node

# List topics
ros2 topic list

# Echo topic messages
ros2 topic echo /sensor_data

# Publish to a topic
ros2 topic pub /cmd_vel geometry_msgs/msg/Twist "{linear: {x: 1.0}}"

# List services
ros2 service list

# Call a service
ros2 service call /add_two_ints example_interfaces/srv/AddTwoInts "{a: 2, b: 3}"

# Show parameters
ros2 param list

# Get parameter value
ros2 param get /my_node my_parameter
```

### RViz2 (Visualization)

RViz2 visualizes sensor data, robot models, and planning results.

```bash
# Launch RViz2
ros2 run rviz2 rviz2

# Launch with config file
rviz2 -d config/my_config.rviz
```

### rqt (GUI Tools)

```bash
# Launch rqt
rqt

# Specific rqt plugins
rqt_graph          # Node graph visualization
rqt_plot           # Real-time plotting
rqt_console        # Log messages
rqt_reconfigure    # Dynamic parameter reconfiguration
```

## Building a Simple Mobile Robot

### Step 1: Create Package

```bash
cd ~/ros2_ws/src
ros2 pkg create --build-type ament_python my_mobile_robot \
  --dependencies rclpy geometry_msgs sensor_msgs
```

### Step 2: Create Robot Controller

```python
# my_mobile_robot/robot_controller.py
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from sensor_msgs.msg import LaserScan

class RobotController(Node):
    def __init__(self):
        super().__init__('robot_controller')

        # Publisher for velocity commands
        self.cmd_vel_pub = self.create_publisher(Twist, 'cmd_vel', 10)

        # Subscriber for laser scan
        self.scan_sub = self.create_subscription(
            LaserScan,
            'scan',
            self.scan_callback,
            10
        )

        self.obstacle_detected = False

    def scan_callback(self, msg):
        # Simple obstacle detection
        min_distance = min(msg.ranges)
        self.obstacle_detected = min_distance < 0.5

        # Control logic
        cmd = Twist()
        if self.obstacle_detected:
            cmd.linear.x = 0.0
            cmd.angular.z = 0.5  # Turn
        else:
            cmd.linear.x = 0.3  # Move forward
            cmd.angular.z = 0.0

        self.cmd_vel_pub.publish(cmd)
        self.get_logger().info(
            f'Min distance: {min_distance:.2f}, Turning: {self.obstacle_detected}'
        )

def main(args=None):
    rclpy.init(args=args)
    controller = RobotController()
    rclpy.spin(controller)
    controller.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 3: Build and Run

```bash
# Build the package
cd ~/ros2_ws
colcon build --packages-select my_mobile_robot

# Source the workspace
source install/setup.bash

# Run the node
ros2 run my_mobile_robot robot_controller
```

## Quality of Service (QoS)

QoS profiles control communication reliability and performance.

```python
from rclpy.qos import QoSProfile, QoSReliabilityPolicy, QoSHistoryPolicy

# Define custom QoS
qos_profile = QoSProfile(
    reliability=QoSReliabilityPolicy.RELIABLE,
    history=QoSHistoryPolicy.KEEP_LAST,
    depth=10
)

# Use in publisher/subscriber
self.publisher_ = self.create_publisher(String, 'topic', qos_profile)
```

**Common QoS Profiles**:
- `sensor_data`: Best effort, volatile
- `services_default`: Reliable, volatile
- `parameters`: Reliable, volatile
- `system_default`: Reliable, volatile

## ROS 2 Best Practices

### 1. Node Design
- Keep nodes focused on single responsibilities
- Use parameters for configuration
- Provide meaningful log messages
- Handle exceptions gracefully

### 2. Topic Naming
```text
/robot_name/sensor_type/specific_sensor
Example: /robot1/camera/front/image_raw
```

### 3. Message Types
- Use standard messages when possible
- Create custom messages for domain-specific data
- Keep messages simple and composable

### 4. Launch File Organization
- Separate launch files by functionality
- Use arguments for flexibility
- Include comments and documentation

## Common Patterns

### 1. State Machine

```python
from enum import Enum

class RobotState(Enum):
    IDLE = 1
    MOVING = 2
    TURNING = 3
    OBSTACLE_AVOIDANCE = 4

class StateMachineNode(Node):
    def __init__(self):
        super().__init__('state_machine')
        self.state = RobotState.IDLE
        self.timer = self.create_timer(0.1, self.state_machine_update)

    def state_machine_update(self):
        if self.state == RobotState.IDLE:
            self.handle_idle()
        elif self.state == RobotState.MOVING:
            self.handle_moving()
        # ... other states
```

### 2. Behavior Tree

```python
class BehaviorTree:
    def __init__(self, node):
        self.node = node
        self.root = SequenceNode([
            ConditionNode(self.check_battery),
            SelectorNode([
                SequenceNode([
                    ConditionNode(self.obstacle_detected),
                    ActionNode(self.avoid_obstacle)
                ]),
                ActionNode(self.move_forward)
            ])
        ])

    def tick(self):
        return self.root.execute()
```

## Integration with Simulation

### Gazebo Integration

```python
# launch/gazebo_launch.py
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        IncludeLaunchDescription(
            'gazebo_ros/launch/gazebo.launch.py',
        ),
        Node(
            package='gazebo_ros',
            executable='spawn_entity.py',
            arguments=['-entity', 'my_robot', '-file', 'urdf/robot.urdf'],
        ),
    ])
```

## Debugging Tips

1. **Check node connectivity**:
   ```bash
   ros2 node list
   ros2 topic list
   rqt_graph
   ```

2. **Monitor messages**:
   ```bash
   ros2 topic echo /my_topic
   ros2 topic hz /my_topic  # Check frequency
   ```

3. **Inspect transforms**:
   ```bash
   ros2 run tf2_ros tf2_echo world robot_base
   ros2 run tf2_tools view_frames  # Generate PDF of TF tree
   ```

4. **Check logs**:
   ```bash
   ros2 run rqt_console rqt_console
   ```

## Key Takeaways

1. ROS 2 provides middleware for robot communication and control
2. Core concepts: Nodes, Topics, Services, Actions
3. Launch files orchestrate multiple nodes
4. TF2 manages coordinate transformations
5. URDF describes robot structure
6. Rich ecosystem of tools and libraries
7. Improved over ROS 1: real-time, security, multi-platform

## Practice Exercises

1. Create a simple publisher-subscriber pair
2. Implement a service that performs a calculation
3. Write a launch file that starts multiple nodes
4. Create a URDF model of a simple robot
5. Build a node that uses TF2 to transform coordinates
6. Implement obstacle avoidance using laser scan data

## Further Reading

- **Official Docs**: https://docs.ros.org/en/humble/
- **Books**:
  - "A Gentle Introduction to ROS 2"
  - "ROS 2 Robotics Developer Guide"
- **Tutorials**:
  - ROS 2 official tutorials
  - The Construct ROS 2 courses
- **Community**:
  - ROS Discourse forum
  - ROS 2 GitHub discussions

---

**Previous Chapter**: [← Chapter 2: Basics of Humanoid Robotics](chapter2-humanoid-robotics.md)
**Next Chapter**: [Chapter 4: Digital Twin & Simulation →](chapter4-digital-twin-simulation.md)
