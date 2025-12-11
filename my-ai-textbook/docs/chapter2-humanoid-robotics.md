# Chapter 2: Basics of Humanoid Robotics

## Overview

Humanoid robots are autonomous machines designed to resemble and mimic human form and behavior. They represent one of the most challenging and fascinating areas of robotics, combining mechanical engineering, control systems, artificial intelligence, and human-robot interaction. This chapter explores the fundamentals of humanoid robotics, from basic anatomy to advanced locomotion and manipulation.

## What is a Humanoid Robot?

A humanoid robot is a robot with:
- **Human-like appearance**: Head, torso, arms, and legs
- **Bipedal locomotion**: Ability to walk on two legs
- **Manipulation capabilities**: Hands/grippers for object interaction
- **Sensory systems**: Vision, hearing, touch, and proprioception
- **Cognitive abilities**: Decision-making, learning, and adaptation

### Why Build Humanoid Robots?

1. **Human Environment Compatibility**: Our world is designed for humans (stairs, doors, tools)
2. **Natural Interaction**: Humans find it easier to interact with human-like forms
3. **Versatility**: Can perform a wide range of tasks
4. **Research Platform**: Test theories about human intelligence and movement
5. **Assistive Applications**: Help elderly, disabled, or isolated individuals

## Anatomy of a Humanoid Robot

### 1. Head and Sensory Systems

The head houses primary sensory systems:

```python
# Example: Head control system with pan-tilt camera
class HumanoidHead:
    def __init__(self):
        self.pan_angle = 0    # Horizontal rotation (-90 to 90 degrees)
        self.tilt_angle = 0   # Vertical rotation (-45 to 45 degrees)
        self.camera = CameraSystem()
        self.microphones = MicrophoneArray()

    def track_object(self, object_position):
        """Track object by adjusting head orientation"""
        # Calculate required angles
        pan_target = calculate_pan_angle(object_position)
        tilt_target = calculate_tilt_angle(object_position)

        # Smooth movement
        self.pan_angle = smooth_transition(self.pan_angle, pan_target)
        self.tilt_angle = smooth_transition(self.tilt_angle, tilt_target)

        # Update actuators
        self.set_head_position(self.pan_angle, self.tilt_angle)
```

**Key Components**:
- **Vision**: Stereo cameras for depth perception
- **Audio**: Microphone arrays for sound localization
- **Expression**: LED displays or mechanical features
- **Degrees of Freedom**: Typically 2-3 (pan, tilt, roll)

### 2. Torso and Core

The torso provides:
- Structural support for other components
- Housing for computers and power systems
- Balance and weight distribution
- Connection point for limbs

```python
# Example: Torso balance control
class TorsoController:
    def __init__(self):
        self.imu = IMUSensor()  # Inertial Measurement Unit
        self.lean_angle = 0

    def maintain_balance(self):
        """Adjust torso lean to maintain balance"""
        # Read current orientation
        orientation = self.imu.get_orientation()

        # Calculate compensation
        if orientation.pitch > TILT_THRESHOLD:
            self.lean_angle = -compensate_forward_tilt(orientation.pitch)
        elif orientation.pitch < -TILT_THRESHOLD:
            self.lean_angle = compensate_backward_tilt(orientation.pitch)

        return self.lean_angle
```

### 3. Arms and Manipulation

Humanoid arms typically have 6-7 degrees of freedom per arm:

**Arm Structure**:
1. **Shoulder**: 3 DOF (pitch, roll, yaw)
2. **Elbow**: 1 DOF (pitch)
3. **Wrist**: 2-3 DOF (pitch, roll, yaw)

```python
# Example: Inverse kinematics for arm reaching
import numpy as np

class HumanoidArm:
    def __init__(self):
        self.shoulder_pitch = 0
        self.shoulder_roll = 0
        self.shoulder_yaw = 0
        self.elbow_pitch = 0
        self.wrist_pitch = 0
        self.wrist_roll = 0

    def reach_target(self, target_position):
        """Calculate joint angles to reach target position"""
        # Simplified inverse kinematics
        joint_angles = self.inverse_kinematics(target_position)

        # Update joint positions
        self.shoulder_pitch = joint_angles[0]
        self.shoulder_roll = joint_angles[1]
        self.shoulder_yaw = joint_angles[2]
        self.elbow_pitch = joint_angles[3]
        self.wrist_pitch = joint_angles[4]
        self.wrist_roll = joint_angles[5]

        return joint_angles

    def inverse_kinematics(self, target_pos):
        """Solve IK problem (simplified)"""
        # Geometric or numerical IK solution
        # This is a placeholder - real IK is complex
        angles = optimize_joint_angles(
            target_position=target_pos,
            link_lengths=self.get_link_lengths(),
            constraints=self.get_joint_limits()
        )
        return angles
```

### 4. Hands and Grippers

Hands vary from simple grippers to complex multi-fingered designs:

**Types**:
- **Two-finger grippers**: Simple but effective
- **Three-finger hands**: Good compromise
- **Five-finger hands**: Maximum dexterity

```python
# Example: Adaptive gripper control
class AdaptiveGripper:
    def __init__(self, num_fingers=2):
        self.num_fingers = num_fingers
        self.finger_positions = [0] * num_fingers
        self.force_sensors = [ForceSensor() for _ in range(num_fingers)]

    def grasp_object(self, object_size):
        """Grasp object with appropriate force"""
        # Close fingers until contact
        for i in range(self.num_fingers):
            while self.force_sensors[i].read() < MIN_CONTACT_FORCE:
                self.finger_positions[i] += STEP_SIZE

        # Apply holding force
        target_force = calculate_holding_force(object_size, object_weight)
        self.regulate_force(target_force)

    def regulate_force(self, target_force):
        """Maintain constant gripping force"""
        for i in range(self.num_fingers):
            current_force = self.force_sensors[i].read()
            error = target_force - current_force
            adjustment = PID_control(error)
            self.finger_positions[i] += adjustment
```

### 5. Legs and Feet

Legs provide mobility through bipedal locomotion:

**Leg Structure** (per leg):
1. **Hip**: 3 DOF (pitch, roll, yaw)
2. **Knee**: 1 DOF (pitch)
3. **Ankle**: 2 DOF (pitch, roll)

**Total**: 6 DOF per leg, 12 DOF for both legs

```python
# Example: Simple walking gait generator
class BipedalWalking:
    def __init__(self):
        self.step_length = 0.1  # meters
        self.step_height = 0.05  # meters
        self.step_duration = 0.8  # seconds
        self.phase = 0  # Current phase in gait cycle

    def generate_walking_trajectory(self, time):
        """Generate foot trajectory for walking"""
        # Normalize time to phase (0 to 1)
        self.phase = (time % self.step_duration) / self.step_duration

        # Swing phase (foot in air)
        if self.phase < 0.5:
            t = self.phase / 0.5  # Normalize to 0-1
            x = self.step_length * t
            z = self.step_height * np.sin(np.pi * t)
        # Stance phase (foot on ground)
        else:
            t = (self.phase - 0.5) / 0.5
            x = self.step_length * (1 - t)
            z = 0

        return {"x": x, "y": 0, "z": z}
```

## Bipedal Locomotion

Walking on two legs is incredibly complex and requires:

### 1. Balance Control

```python
# Example: Zero Moment Point (ZMP) balance controller
class ZMPBalanceController:
    def __init__(self):
        self.cop_x = 0  # Center of Pressure
        self.cop_y = 0

    def calculate_zmp(self, robot_state):
        """Calculate Zero Moment Point"""
        total_mass = robot_state.get_total_mass()
        com = robot_state.get_center_of_mass()
        com_accel = robot_state.get_com_acceleration()

        # ZMP equation
        zmp_x = com.x - (com.z * com_accel.x) / (com_accel.z + GRAVITY)
        zmp_y = com.y - (com.z * com_accel.y) / (com_accel.z + GRAVITY)

        return (zmp_x, zmp_y)

    def is_stable(self, zmp, support_polygon):
        """Check if ZMP is within support polygon"""
        return point_in_polygon(zmp, support_polygon)
```

### 2. Gait Patterns

**Common Gaits**:
- **Static Walking**: Always statically stable (slow)
- **Dynamic Walking**: Uses momentum (faster, more efficient)
- **Running**: Both feet off ground simultaneously
- **Jumping**: Explosive movement

### 3. Terrain Adaptation

```python
# Example: Foot placement for uneven terrain
class TerrainAdaptation:
    def __init__(self):
        self.terrain_map = TerrainMap()
        self.foot_planner = FootPlanner()

    def adapt_step(self, next_step_location):
        """Adjust step for terrain"""
        # Get terrain height at location
        terrain_height = self.terrain_map.get_height(next_step_location)

        # Check if location is safe
        if self.is_safe_foothold(next_step_location):
            adjusted_location = next_step_location
            adjusted_location.z = terrain_height
        else:
            # Find alternative foothold
            adjusted_location = self.find_safe_foothold(next_step_location)

        return adjusted_location

    def is_safe_foothold(self, location):
        """Check if location provides stable support"""
        slope = self.terrain_map.get_slope(location)
        friction = self.terrain_map.get_friction(location)

        return (slope < MAX_SLOPE and friction > MIN_FRICTION)
```

## Actuation Systems

### Types of Actuators

1. **Electric Motors**:
   - DC motors with gearboxes
   - Precise control, efficient
   - Most common in humanoids

2. **Hydraulic Actuators**:
   - High power-to-weight ratio
   - Used in large robots (Boston Dynamics Atlas)
   - Complex maintenance

3. **Pneumatic Actuators**:
   - Compliant, safe
   - Less precise control
   - Good for soft robotics

```python
# Example: Motor control with position feedback
class ServoMotor:
    def __init__(self, motor_id):
        self.id = motor_id
        self.current_position = 0
        self.target_position = 0
        self.max_speed = 100  # degrees/second
        self.max_torque = 10  # Nm

    def set_target(self, position, speed=None):
        """Set target position and optional speed"""
        self.target_position = np.clip(
            position,
            self.min_position,
            self.max_position
        )

        if speed:
            self.max_speed = min(speed, MAX_SPEED_LIMIT)

    def update(self, dt):
        """Update motor position"""
        error = self.target_position - self.current_position

        # Calculate velocity
        velocity = np.sign(error) * min(abs(error) / dt, self.max_speed)

        # Update position
        self.current_position += velocity * dt

        # Check if reached target
        if abs(error) < POSITION_TOLERANCE:
            self.current_position = self.target_position

        return self.current_position
```

## Sensors and Perception

### 1. Vision Systems

```python
# Example: Object detection and tracking
class VisionSystem:
    def __init__(self):
        self.left_camera = Camera("left")
        self.right_camera = Camera("right")
        self.object_detector = ObjectDetector()

    def detect_objects(self):
        """Detect objects in stereo vision"""
        left_image = self.left_camera.capture()
        right_image = self.right_camera.capture()

        # Detect objects in left image
        detections = self.object_detector.detect(left_image)

        # Calculate 3D positions using stereo
        objects_3d = []
        for detection in detections:
            depth = self.calculate_stereo_depth(
                left_image,
                right_image,
                detection.bbox
            )
            position_3d = self.pixel_to_3d(detection.center, depth)
            objects_3d.append({
                "class": detection.class_name,
                "position": position_3d,
                "confidence": detection.confidence
            })

        return objects_3d
```

### 2. Force and Tactile Sensors

```python
# Example: Tactile feedback for grasping
class TactileSensor:
    def __init__(self, sensor_array_size=(4, 4)):
        self.array_size = sensor_array_size
        self.readings = np.zeros(sensor_array_size)

    def read_pressure_map(self):
        """Read pressure distribution"""
        self.readings = self.get_sensor_data()
        return self.readings

    def detect_contact(self, threshold=0.1):
        """Detect if object is in contact"""
        return np.any(self.readings > threshold)

    def get_contact_center(self):
        """Calculate center of contact pressure"""
        if not self.detect_contact():
            return None

        # Weighted average of pressure points
        total_pressure = np.sum(self.readings)
        center_x = np.sum(self.readings * np.arange(self.array_size[0])) / total_pressure
        center_y = np.sum(self.readings.T * np.arange(self.array_size[1])) / total_pressure

        return (center_x, center_y)
```

### 3. Inertial Measurement Units (IMU)

```python
# Example: IMU for balance and orientation
class IMU:
    def __init__(self):
        self.accelerometer = Accelerometer()
        self.gyroscope = Gyroscope()
        self.magnetometer = Magnetometer()
        self.orientation = Quaternion(1, 0, 0, 0)

    def get_orientation(self):
        """Estimate orientation using sensor fusion"""
        accel_data = self.accelerometer.read()
        gyro_data = self.gyroscope.read()
        mag_data = self.magnetometer.read()

        # Madgwick or Mahony filter for orientation estimation
        self.orientation = self.sensor_fusion(
            accel_data,
            gyro_data,
            mag_data,
            self.orientation
        )

        return self.orientation

    def get_linear_acceleration(self):
        """Get acceleration excluding gravity"""
        total_accel = self.accelerometer.read()
        gravity_vector = self.orientation.rotate_vector([0, 0, 9.81])
        linear_accel = total_accel - gravity_vector

        return linear_accel
```

## Notable Humanoid Robots

### 1. ASIMO (Honda, 2000-2018)
- First to achieve stable bipedal walking
- 57 degrees of freedom
- Could run, hop on one leg, kick a ball
- Discontinued in 2018

### 2. Atlas (Boston Dynamics, 2013-present)
- Hydraulic actuation
- Parkour, backflips, complex terrain
- 28 degrees of freedom
- Height: 1.5m, Weight: 89kg

### 3. Pepper (SoftBank Robotics, 2014-present)
- Social interaction robot
- Emotion recognition
- Wheeled base (not bipedal)
- Used in retail and hospitality

### 4. Tesla Optimus (Tesla, 2021-present)
- Designed for general-purpose labor
- Electric actuation
- Target price: $20,000-$30,000
- Height: 1.73m, Weight: 57kg

### 5. Figure 01 (Figure AI, 2023-present)
- Commercial humanoid for warehouses
- Collaborative with OpenAI
- Focus on practical applications

## Applications of Humanoid Robots

### 1. Service Industry
- Hospitality and reception
- Customer service
- Elderly care
- Education and tutoring

### 2. Manufacturing
- Assembly tasks
- Quality inspection
- Collaborative work with humans
- Hazardous environment operations

### 3. Research and Development
- Study of human locomotion
- AI and machine learning testbed
- Human-robot interaction research
- Prosthetics development

### 4. Entertainment
- Theme parks
- Movies and TV
- Sports demonstrations
- Art and performances

## Challenges in Humanoid Robotics

### Technical Challenges

1. **Energy Efficiency**: Bipedal walking is energy-intensive
2. **Dexterity**: Matching human hand manipulation
3. **Real-time Control**: Processing sensor data and controlling many joints
4. **Robustness**: Operating in unstructured environments
5. **Cost**: Making humanoids affordable

### Design Trade-offs

1. **Performance vs. Safety**: Fast movement vs. safe operation
2. **Complexity vs. Reliability**: More DOF vs. easier maintenance
3. **Size vs. Capability**: Larger robots can do more but are harder to control
4. **Specialization vs. Generalization**: Optimized for specific tasks vs. versatile

## Future of Humanoid Robotics

### Near-term (2025-2030)
- Deployment in warehouses and factories
- Improved manipulation and dexterity
- Better human-robot collaboration
- More affordable platforms

### Medium-term (2030-2040)
- Household humanoid robots
- Advanced social interaction
- Learning from human demonstrations
- Widespread commercial adoption

### Long-term (2040+)
- Human-level dexterity and mobility
- Seamless integration in society
- Ethical and legal frameworks established
- Ubiquitous presence in daily life

## Key Takeaways

1. Humanoid robots mimic human form and function for versatility and natural interaction
2. Core systems include locomotion, manipulation, perception, and control
3. Bipedal walking remains one of the most challenging aspects
4. Multiple actuation and sensing technologies are employed
5. Applications span service, manufacturing, research, and entertainment
6. Significant progress has been made, but many challenges remain

## Practice Exercises

1. Calculate the number of possible poses for a 6-DOF robotic arm
2. Design a simple gait pattern for bipedal walking
3. Research and compare the actuators used in Atlas vs. Tesla Optimus
4. Implement a basic PID controller for a single joint
5. Discuss the ethical implications of humanoid robots in care homes

## Further Reading

- **Books**:
  - "Humanoid Robotics: A Reference" by Ambarish Goswami
  - "Introduction to Humanoid Robotics" by Shuuji Kajita
  - "Humanoid Robots: Modeling and Control" by Dragomir Nenchev

- **Research Papers**:
  - "Atlas: A New Generation of Humanoid Robot"
  - "Whole-Body Model Predictive Control for Humanoid Robots"
  - "Learning Dexterous Manipulation for a Soft Robotic Hand"

- **Videos and Demos**:
  - Boston Dynamics Atlas parkour demonstrations
  - Tesla Optimus development updates
  - Honda ASIMO historical videos

---

**Previous Chapter**: [← Chapter 1: Introduction to Physical AI](chapter1-introduction.md)
**Next Chapter**: [Chapter 3: ROS 2 Fundamentals →](chapter3-ros2-fundamentals.md)
