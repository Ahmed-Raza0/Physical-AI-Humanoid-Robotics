/**
 * Client-side authentication system
 * Stores auth state in localStorage for Docusaurus
 * For production, connect to a real backend authentication service
 */

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

const STORAGE_KEY = 'physical_ai_auth';
const USERS_KEY = 'physical_ai_users';

/**
 * Auth Client for managing authentication
 * This is a simplified client-side implementation
 */
export class AuthClient {
  private listeners: Set<(state: AuthState) => void> = new Set();
  private state: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  };

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load auth state from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored);
        user.createdAt = new Date(user.createdAt);
        this.state = {
          user,
          isAuthenticated: true,
          isLoading: false,
        };
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
    }
  }

  /**
   * Save auth state to localStorage
   */
  private saveToStorage(user: User | null): void {
    if (typeof window === 'undefined') return;

    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  }

  /**
   * Get all users from storage (for demo purposes)
   */
  private getUsers(): Record<string, { email: string; password: string; name: string }> {
    if (typeof window === 'undefined') return {};

    try {
      const stored = localStorage.getItem(USERS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load users:', error);
      return {};
    }
  }

  /**
   * Save users to storage
   */
  private saveUsers(users: Record<string, { email: string; password: string; name: string }>): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Failed to save users:', error);
    }
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Get current auth state
   */
  getState(): AuthState {
    return { ...this.state };
  }

  /**
   * Sign up a new user
   */
  async signup(data: SignupData): Promise<{ success: boolean; error?: string }> {
    this.state.isLoading = true;
    this.notifyListeners();

    try {
      // Validate input
      if (!data.email || !data.password || !data.name) {
        throw new Error('All fields are required');
      }

      if (data.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (!data.email.includes('@')) {
        throw new Error('Invalid email address');
      }

      // Check if user already exists
      const users = this.getUsers();
      if (users[data.email]) {
        throw new Error('User already exists with this email');
      }

      // Create new user
      const user: User = {
        id: `user_${Date.now()}`,
        email: data.email,
        name: data.name,
        createdAt: new Date(),
      };

      // Save user credentials (in production, this would be handled by a backend)
      users[data.email] = {
        email: data.email,
        password: data.password, // In production, this would be hashed!
        name: data.name,
      };
      this.saveUsers(users);

      // Update state
      this.state = {
        user,
        isAuthenticated: true,
        isLoading: false,
      };
      this.saveToStorage(user);
      this.notifyListeners();

      return { success: true };
    } catch (error) {
      this.state.isLoading = false;
      this.notifyListeners();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      };
    }
  }

  /**
   * Login with email and password
   */
  async login(data: LoginData): Promise<{ success: boolean; error?: string }> {
    this.state.isLoading = true;
    this.notifyListeners();

    try {
      // Validate input
      if (!data.email || !data.password) {
        throw new Error('Email and password are required');
      }

      // Check credentials
      const users = this.getUsers();
      const userCreds = users[data.email];

      if (!userCreds || userCreds.password !== data.password) {
        throw new Error('Invalid email or password');
      }

      // Create user object
      const user: User = {
        id: `user_${Date.now()}`,
        email: userCreds.email,
        name: userCreds.name,
        createdAt: new Date(),
      };

      // Update state
      this.state = {
        user,
        isAuthenticated: true,
        isLoading: false,
      };
      this.saveToStorage(user);
      this.notifyListeners();

      return { success: true };
    } catch (error) {
      this.state.isLoading = false;
      this.notifyListeners();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    this.state = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };
    this.saveToStorage(null);
    this.notifyListeners();
  }

  /**
   * Get current user
   */
  getUser(): User | null {
    return this.state.user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }
}

/**
 * Singleton instance
 */
let authClientInstance: AuthClient | null = null;

export function getAuthClient(): AuthClient {
  if (!authClientInstance) {
    authClientInstance = new AuthClient();
  }
  return authClientInstance;
}

export default AuthClient;
