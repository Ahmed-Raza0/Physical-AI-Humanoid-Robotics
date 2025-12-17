import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { motion } from 'framer-motion';
import { fadeInUp, scaleIn } from '../theme/animations';
import { getAuthClient } from '../lib/client/authClient';
import styles from './auth.module.css';

export default function Login(): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const authClient = getAuthClient();

  useEffect(() => {
    // Redirect if already logged in
    if (authClient.isAuthenticated()) {
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      }
    }

    // Load remembered email if exists
    if (typeof window !== 'undefined') {
      const rememberedEmail = localStorage.getItem('physical_ai_remembered_email');
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await authClient.login({ email, password });

    if (result.success) {
      // Handle remember me
      if (typeof window !== 'undefined') {
        if (rememberMe) {
          localStorage.setItem('physical_ai_remembered_email', email);
        } else {
          localStorage.removeItem('physical_ai_remembered_email');
        }
        window.location.href = '/dashboard';
      }
    } else {
      setError(result.error || 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Login" description="Login to your account">
      <div className={styles.authContainer}>
        <motion.div
          className={styles.authCard}
          initial="hidden"
          animate="visible"
          variants={scaleIn}
        >
          <div className={styles.authHeader}>
            <h1>Welcome Back</h1>
            <p>Login to access your dashboard</p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className={styles.input}
              />
            </div>

            <div className={styles.rememberMeContainer}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>Remember my email</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className={styles.authFooter}>
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className={styles.link}>
                Sign up
              </Link>
            </p>
          </div>

          <div className={styles.demoInfo}>
            <p className={styles.demoTitle}>💡 Demo Mode</p>
            <p className={styles.demoText}>
              This is a client-side auth demo. In production, connect to a real
              backend authentication service.
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
