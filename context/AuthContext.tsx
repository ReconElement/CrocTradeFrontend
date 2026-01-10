'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api, ApiError } from '@/lib/api';
import type { Profile, LoginRequest, SignupRequest } from '@/lib/types';

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await api.getProfile();
      setUser(response.profile);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.getProfile();
        setUser(response.profile);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    await api.login(data);
    await refreshProfile();
  };

  const signup = async (data: SignupRequest) => {
    await api.signup(data);
  };

  const logout = () => {
    // Clear user state
    setUser(null);
    
    // Clear all auth-related cookies by setting them to expire in the past
    const cookiesToClear = ['token', 'auth_token', 'session', 'jwt', 'access_token', 'refresh_token'];
    const domains = [window.location.hostname, `.${window.location.hostname}`, ''];
    const paths = ['/', ''];
    
    cookiesToClear.forEach((cookieName) => {
      // Try clearing with different domain/path combinations
      domains.forEach((domain) => {
        paths.forEach((path) => {
          let cookieString = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          if (path) cookieString += `; path=${path}`;
          if (domain) cookieString += `; domain=${domain}`;
          document.cookie = cookieString;
        });
      });
    });
    
    // Also clear any cookie that contains common auth patterns
    document.cookie.split(';').forEach((cookie) => {
      const cookieName = cookie.split('=')[0].trim();
      if (cookieName) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    });
    
    // Redirect to home
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
