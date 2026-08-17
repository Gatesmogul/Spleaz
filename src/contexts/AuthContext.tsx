import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'RIDER' | 'DRIVER' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  avatarUrl?: string;
  isVerified?: boolean;
  country?: string;
  state?: string;
  city?: string;
}

export interface AuthState {
  token: string | null;
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (token: string, user: UserProfile) => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
  updateUserProfile: (updatedFields: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

export const TOKEN_KEY = 'spleaz_auth_token';
export const USER_KEY = 'spleaz_user_profile';

const storageSet = async (key: string, value: string) => Platform.OS === 'web' ? AsyncStorage.setItem(key, value) : SecureStore.setItemAsync(key, value);
const storageGet = async (key: string) => Platform.OS === 'web' ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key);
const storageDelete = async (key: string) => Platform.OS === 'web' ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key);

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export interface AuthProviderProps { children: ReactNode; }

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({ token: null, user: null, role: null, isAuthenticated: false, isLoading: true });

  useEffect(() => {
    let mounted = true;
    const restore = async () => {
      try {
        const [token, rawUser] = await Promise.all([storageGet(TOKEN_KEY), storageGet(USER_KEY)]);
        if (!mounted) return;
        if (token && rawUser) {
          const user = JSON.parse(rawUser) as UserProfile;
          setAuthState({ token, user, role: user.role, isAuthenticated: true, isLoading: false });
        } else setAuthState(prev => ({ ...prev, isLoading: false }));
      } catch (error) {
        console.error('Failed to restore auth session:', error);
        if (mounted) setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };
    void restore();
    return () => { mounted = false; };
  }, []);

  const login = useCallback(async (token: string, user: UserProfile) => {
    await Promise.all([storageSet(TOKEN_KEY, token), storageSet(USER_KEY, JSON.stringify(user))]);
    setAuthState({ token, user, role: user.role, isAuthenticated: true, isLoading: false });
  }, []);

  const switchRole = useCallback(async (newRole: UserRole) => {
    setAuthState(prev => {
      if (!prev.user) return prev;
      const user = { ...prev.user, role: newRole };
      void storageSet(USER_KEY, JSON.stringify(user));
      return { ...prev, user, role: newRole };
    });
  }, []);

  const updateUserProfile = useCallback(async (fields: Partial<UserProfile>) => {
    setAuthState(prev => {
      if (!prev.user) return prev;
      const user = { ...prev.user, ...fields };
      void storageSet(USER_KEY, JSON.stringify(user));
      return { ...prev, user, role: user.role };
    });
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([storageDelete(TOKEN_KEY), storageDelete(USER_KEY)]);
    setAuthState({ token: null, user: null, role: null, isAuthenticated: false, isLoading: false });
  }, []);

  const value = useMemo(() => ({ ...authState, login, switchRole, updateUserProfile, logout }), [authState, login, switchRole, updateUserProfile, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
