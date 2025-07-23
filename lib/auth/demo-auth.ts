// Demo Authentication System for Testing

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'developer';
  avatar?: string;
  subscription: 'free' | 'pro' | 'enterprise';
  joinedAt: Date;
  lastLogin: Date;
  isActive: boolean;
  preferences: {
    theme: string;
    notifications: boolean;
    language: string;
  };
}

// Demo user credentials
export const DEMO_USERS: Record<string, { password: string; user: DemoUser }> = {
  'admin@oneai.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@oneai.com',
      name: 'Admin User',
      role: 'admin',
      avatar: '/avatars/admin.jpg',
      subscription: 'pro',
      joinedAt: new Date('2024-01-01'),
      lastLogin: new Date(),
      isActive: true,
      preferences: {
        theme: 'dark',
        notifications: true,
        language: 'en'
      }
    }
  },
  'john@oneai.com': {
    password: 'user123',
    user: {
      id: '2',
      email: 'john@oneai.com',
      name: 'John Developer',
      role: 'developer',
      avatar: '/avatars/john.jpg',
      subscription: 'free',
      joinedAt: new Date('2024-01-15'),
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isActive: true,
      preferences: {
        theme: 'light',
        notifications: false,
        language: 'en'
      }
    }
  },
  'sarah@oneai.com': {
    password: 'user123',
    user: {
      id: '3',
      email: 'sarah@oneai.com',
      name: 'Sarah Manager',
      role: 'user',
      avatar: '/avatars/sarah.jpg',
      subscription: 'free',
      joinedAt: new Date('2024-01-20'),
      lastLogin: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      isActive: true,
      preferences: {
        theme: 'system',
        notifications: true,
        language: 'en'
      }
    }
  }
};

// Demo authentication functions
export class DemoAuthService {
  private static readonly AUTH_KEY = 'demo-auth-user';
  private static readonly SESSION_KEY = 'demo-auth-session';

  // Login with email and password
  static async login(email: string, password: string): Promise<{ user: DemoUser; token: string } | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const credentials = DEMO_USERS[email.toLowerCase()];
    if (!credentials || credentials.password !== password) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(credentials.user.id);
    const session = {
      user: credentials.user,
      token,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };

    // Store in localStorage
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(credentials.user));
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

    return { user: credentials.user, token };
  }

  // Logout
  static logout(): void {
    localStorage.removeItem(this.AUTH_KEY);
    localStorage.removeItem(this.SESSION_KEY);
  }

  // Get current user from localStorage
  static getCurrentUser(): DemoUser | null {
    try {
      const userStr = localStorage.getItem(this.AUTH_KEY);
      const sessionStr = localStorage.getItem(this.SESSION_KEY);
      
      if (!userStr || !sessionStr) return null;

      const session = JSON.parse(sessionStr);
      
      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }

      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Generate a fake JWT token
  private static generateToken(userId: string): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      sub: userId, 
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    }));
    const signature = btoa(`demo-signature-${userId}`);
    
    return `${header}.${payload}.${signature}`;
  }

  // Refresh session (extend expiry)
  static refreshSession(): boolean {
    try {
      const sessionStr = localStorage.getItem(this.SESSION_KEY);
      if (!sessionStr) return false;

      const session = JSON.parse(sessionStr);
      session.expiresAt = Date.now() + (24 * 60 * 60 * 1000); // Extend 24 hours
      
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      return true;
    } catch {
      return false;
    }
  }

  // Get demo statistics for dashboard
  static getDemoStats(userId: string) {
    const baseStats = {
      aiAgents: 3,
      apiCalls: 1247,
      forecasts: 8,
      alerts: 2,
      documentsProcessed: 45,
      totalTokensUsed: 125680,
      monthlyUsage: 78.5, // percentage
      storageUsed: 2.3 // GB
    };

    // Vary stats based on user role
    const user = Object.values(DEMO_USERS).find(u => u.user.id === userId)?.user;
    if (!user) return baseStats;

    switch (user.role) {
      case 'admin':
        return {
          ...baseStats,
          aiAgents: 15,
          apiCalls: 15420,
          forecasts: 32,
          alerts: 8,
          documentsProcessed: 156,
          totalTokensUsed: 890000,
          monthlyUsage: 95.2,
          storageUsed: 8.7
        };
      case 'developer':
        return {
          ...baseStats,
          aiAgents: 7,
          apiCalls: 5680,
          forecasts: 15,
          alerts: 3,
          documentsProcessed: 89,
          totalTokensUsed: 345000,
          monthlyUsage: 65.8,
          storageUsed: 4.2
        };
      default:
        return baseStats;
    }
  }

  // Get recent activities for dashboard
  static getRecentActivities(userId: string) {
    const activities = [
      { type: 'Agent Created', name: 'Customer Service Bot', time: '2 hours ago', icon: '🤖' },
      { type: 'Forecast Generated', name: 'Sales Prediction Q1', time: '4 hours ago', icon: '📈' },
      { type: 'Anomaly Detected', name: 'Traffic Spike Alert', time: '6 hours ago', icon: '⚠️' },
      { type: 'Document Processed', name: 'Product Manual', time: '1 day ago', icon: '📄' },
      { type: 'API Integration', name: 'Slack Webhook', time: '2 days ago', icon: '🔗' },
      { type: 'Model Training', name: 'Custom Classifier', time: '3 days ago', icon: '🧠' },
    ];

    const user = Object.values(DEMO_USERS).find(u => u.user.id === userId)?.user;
    if (user?.role === 'admin') {
      return [
        { type: 'User Registered', name: 'new-user@company.com', time: '1 hour ago', icon: '👤' },
        { type: 'System Alert', name: 'High API Usage', time: '3 hours ago', icon: '🚨' },
        ...activities.slice(0, 4)
      ];
    }

    return activities.slice(0, 4);
  }
} 