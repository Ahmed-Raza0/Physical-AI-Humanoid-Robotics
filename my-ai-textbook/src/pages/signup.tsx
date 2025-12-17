import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { motion } from 'framer-motion';
import { fadeInUp, scaleIn } from '../theme/animations';
import { getAuthClient } from '../lib/client/authClient';
import styles from './auth.module.css';

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  suggestions: string[];
}

const calculatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const suggestions: string[] = [];

  if (password.length === 0) {
    return { score: 0, label: '', color: '#E2E8F0', suggestions: [] };
  }

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  else suggestions.push('Use at least 12 characters');

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  else suggestions.push('Mix uppercase and lowercase letters');

  if (/\d/.test(password)) score++;
  else suggestions.push('Include numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else suggestions.push('Add special characters (!@#$%^&*)');

  // Determine label and color
  const strengthMap = [
    { label: 'Very Weak', color: '#EF4444' },
    { label: 'Weak', color: '#F59E0B' },
    { label: 'Fair', color: '#F59E0B' },
    { label: 'Good', color: '#10B981' },
    { label: 'Strong', color: '#10B981' },
  ];

  const strength = strengthMap[Math.min(score, 4)];
  return { score, ...strength, suggestions };
};

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function Signup(): JSX.Element {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(
    calculatePasswordStrength('')
  );
  const authClient = getAuthClient();

  useEffect(() => {
    // Redirect if already logged in
    if (authClient.isAuthenticated()) {
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      }
    }
  }, []);

  // Real-time validation
  useEffect(() => {
    const errors: ValidationErrors = {};

    // Validate name
    if (touchedFields.has('name') && name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Validate email
    if (touchedFields.has('email')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    // Validate password
    if (touchedFields.has('password') && password.length > 0 && password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Validate confirm password
    if (touchedFields.has('confirmPassword') && confirmPassword.length > 0) {
      if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setValidationErrors(errors);
  }, [name, email, password, confirmPassword, touchedFields]);

  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    const result = await authClient.signup({ name, email, password });

    if (result.success) {
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      }
    } else {
      setError(result.error || 'Signup failed');
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Sign Up" description="Create a new account">
      <div className={styles.authContainer}>
        <motion.div
          className={styles.authCard}
          initial="hidden"
          animate="visible"
          variants={scaleIn}
        >
          <div className={styles.authHeader}>
            <h1>Create Account</h1>
            <p>Sign up to get started with Physical AI</p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleFieldBlur('name')}
                required
                disabled={isLoading}
                className={`${styles.input} ${
                  validationErrors.name ? styles.inputError : ''
                }`}
              />
              {validationErrors.name && (
                <span className={styles.fieldError}>{validationErrors.name}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleFieldBlur('email')}
                required
                disabled={isLoading}
                className={`${styles.input} ${
                  validationErrors.email ? styles.inputError : ''
                }`}
              />
              {validationErrors.email && (
                <span className={styles.fieldError}>{validationErrors.email}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordStrength(calculatePasswordStrength(e.target.value));
                }}
                onBlur={() => handleFieldBlur('password')}
                required
                minLength={6}
                disabled={isLoading}
                className={`${styles.input} ${
                  validationErrors.password ? styles.inputError : ''
                }`}
              />
              {validationErrors.password && (
                <span className={styles.fieldError}>{validationErrors.password}</span>
              )}

              {/* Password Strength Indicator */}
              {password && (
                <div className={styles.passwordStrength}>
                  <div className={styles.strengthMeter}>
                    <div className={styles.strengthTrack}>
                      {[0, 1, 2, 3, 4].map((index) => (
                        <div
                          key={index}
                          className={`${styles.strengthSegment} ${
                            index < passwordStrength.score ? styles.strengthActive : ''
                          }`}
                          style={{
                            backgroundColor:
                              index < passwordStrength.score
                                ? passwordStrength.color
                                : '#E2E8F0',
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className={styles.strengthLabel}
                      style={{ color: passwordStrength.color }}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  {passwordStrength.suggestions.length > 0 && (
                    <ul className={styles.strengthSuggestions}>
                      {passwordStrength.suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleFieldBlur('confirmPassword')}
                required
                minLength={6}
                disabled={isLoading}
                className={`${styles.input} ${
                  validationErrors.confirmPassword ? styles.inputError : ''
                }`}
              />
              {validationErrors.confirmPassword && (
                <span className={styles.fieldError}>
                  {validationErrors.confirmPassword}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className={styles.authFooter}>
            <p>
              Already have an account?{' '}
              <Link to="/login" className={styles.link}>
                Login
              </Link>
            </p>
          </div>

          <div className={styles.demoInfo}>
            <p className={styles.demoTitle}>💡 Demo Mode</p>
            <p className={styles.demoText}>
              This is a client-side auth demo. Your data is stored locally.
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
