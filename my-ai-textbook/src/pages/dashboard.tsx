import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { getAuthClient, type User } from '../lib/client/authClient';
import styles from './dashboard.module.css';

export default function Dashboard(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authClient = getAuthClient();

  useEffect(() => {
    // Check if user is authenticated
    const currentUser = authClient.getUser();
    if (!currentUser) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } else {
      setUser(currentUser);
      setIsLoading(false);
    }

    // Subscribe to auth changes
    const unsubscribe = authClient.subscribe((state) => {
      if (!state.isAuthenticated) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } else {
        setUser(state.user);
      }
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await authClient.logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  if (isLoading) {
    return (
      <Layout title="Dashboard" description="Your dashboard">
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" description="Your dashboard">
      <div className={styles.dashboardContainer}>
        {/* Header */}
        <div className={styles.dashboardHeader}>
          <div className={styles.headerContent}>
            <div>
              <h1>Welcome back, {user?.name}! 👋</h1>
              <p className={styles.subtitle}>
                Your learning journey in Physical AI & Robotics
              </p>
            </div>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>

        <div className={styles.dashboardContent}>
          {/* User Info Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>👤 Profile Information</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Name:</span>
                <span className={styles.value}>{user?.name}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Email:</span>
                <span className={styles.value}>{user?.email}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Member since:</span>
                <span className={styles.value}>
                  {user?.createdAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>🚀 Quick Actions</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.actionGrid}>
                <Link to="/docs/chapter1-introduction" className={styles.actionButton}>
                  <span className={styles.actionIcon}>📚</span>
                  <div>
                    <h3>Start Learning</h3>
                    <p>Begin with Chapter 1</p>
                  </div>
                </Link>
                <Link to="/chatbot" className={styles.actionButton}>
                  <span className={styles.actionIcon}>🤖</span>
                  <div>
                    <h3>AI Assistant</h3>
                    <p>Ask questions</p>
                  </div>
                </Link>
                <Link to="/blog" className={styles.actionButton}>
                  <span className={styles.actionIcon}>✍️</span>
                  <div>
                    <h3>Read Blog</h3>
                    <p>Latest insights</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Learning Progress */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>📊 Learning Progress</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.progressList}>
                <div className={styles.progressItem}>
                  <div className={styles.progressHeader}>
                    <span>Chapter 1: Introduction to Physical AI</span>
                    <span className={styles.progressPercent}>0%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{width: '0%'}}></div>
                  </div>
                </div>
                <div className={styles.progressItem}>
                  <div className={styles.progressHeader}>
                    <span>Chapter 2: Humanoid Robotics</span>
                    <span className={styles.progressPercent}>0%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{width: '0%'}}></div>
                  </div>
                </div>
                <div className={styles.progressItem}>
                  <div className={styles.progressHeader}>
                    <span>Chapter 3: ROS 2 Fundamentals</span>
                    <span className={styles.progressPercent}>0%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{width: '0%'}}></div>
                  </div>
                </div>
              </div>
              <p className={styles.comingSoon}>
                💡 Progress tracking coming soon! Start learning to track your progress.
              </p>
            </div>
          </div>

          {/* Resources */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>🎯 Recommended Resources</h2>
            </div>
            <div className={styles.cardBody}>
              <ul className={styles.resourceList}>
                <li>
                  <Link to="/docs/chapter1-introduction">
                    Introduction to Physical AI
                  </Link>
                </li>
                <li>
                  <Link to="/docs/chapter2-humanoid-robotics">
                    Humanoid Robotics Basics
                  </Link>
                </li>
                <li>
                  <Link to="/docs/chapter3-ros2-fundamentals">
                    Getting Started with ROS 2
                  </Link>
                </li>
                <li>
                  <Link to="/docs/chapter4-digital-twin-simulation">
                    Digital Twin Simulation
                  </Link>
                </li>
                <li>
                  <Link to="/docs/chapter5-vision-language-action">
                    Vision-Language-Action Models
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
