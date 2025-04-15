'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { gql, useMutation } from '@apollo/client';
import Cookies from 'js-cookie';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  isDriver: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  verifyLogin: (email: string, code: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      message
    }
  }
`;

const VERIFY_LOGIN_MUTATION = gql`
  mutation VerifyLogin($input: VerifyLoginInput!) {
    verifyLogin(input: $input) {
      token
      refreshToken
      user {
        id
        email
        firstName
        lastName
        isAdmin
        isDriver
      }
    }
  }
`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [verifyLoginMutation] = useMutation(VERIFY_LOGIN_MUTATION);

  useEffect(() => {
    // Check if user is logged in using cookies instead of localStorage
    const token = Cookies.get('token');
    const userStr = Cookies.get('user');
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Failed to parse user data', error);
        Cookies.remove('token');
        Cookies.remove('refreshToken');
        Cookies.remove('user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: {
          input: { email, password }
        }
      });
      
      return { success: true, message: data.login.message };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const verifyLogin = async (email: string, code: string) => {
    try {
      const { data } = await verifyLoginMutation({
        variables: {
          input: { email, code }
        }
      });
      
      const { token, refreshToken, user: userData } = data.verifyLogin;
      
      const cookieOptions = {
        expires: 7,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const
      };
      
      Cookies.set('token', token, cookieOptions);
      Cookies.set('refreshToken', refreshToken, cookieOptions);
      Cookies.set('user', JSON.stringify(userData), cookieOptions);
      
      setUser(userData);
      
      return { success: true, message: 'Login successful' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('refreshToken');
    Cookies.remove('user');
    
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      verifyLogin, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};