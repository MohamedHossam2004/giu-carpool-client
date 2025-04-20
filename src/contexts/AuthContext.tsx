'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { gql, useMutation } from '@apollo/client';
import Cookies from 'js-cookie';

interface Car {
  licensePlate: string;
  year: number;
  vehicleName: string;
  passengerSeats: number;
  licensePicture: string;
}

interface Driver {
  approved: boolean;
  car: Car;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  isDriver: boolean;
  isEmailVerified: boolean;
  activated: boolean;
  driver?: Driver;
}

interface CarDetails {
  licensePlate: string;
  year: number;
  vehicleName: string;
  passengerSeats: number;
  licensePicture: string;
}

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  giuId: string;
  phone: string;
  gender: boolean;
  isDriver: boolean;
  carDetails?: CarDetails;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  verifyLogin: (email: string, code: string) => Promise<{ success: boolean; message: string }>;
  register: (input: RegisterInput) => Promise<{ success: boolean; message: string }>;
  verifyRegistration: (email: string, code: string) => Promise<{ success: boolean; message: string }>;
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
  mutation VerifyLogin($input: VerificationInput!) {
    verifyLogin(input: $input) {
      accessToken
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

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      message
    }
  }
`;

const VERIFY_REGISTRATION_MUTATION = gql`
  mutation VerifyRegistration($input: VerificationInput!) {
    verifyRegistration(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        firstName
        lastName
        isEmailVerified
        activated
        isDriver
        driver {
          approved
          car {
            licensePlate
            year
            vehicleName
            passengerSeats
            licensePicture
          }
        }
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
  const [registerMutation] = useMutation(REGISTER_MUTATION);
  const [verifyRegistrationMutation] = useMutation(VERIFY_REGISTRATION_MUTATION);

  useEffect(() => {
    // Check if user is logged in using cookies instead of localStorage
    const accessToken = Cookies.get('accessToken');
    const userStr = Cookies.get('user');
    
    if (accessToken && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Failed to parse user data', error);
        Cookies.remove('accessToken');
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
      
      const { accessToken, refreshToken, user: userData } = data.verifyLogin;
      
      const cookieOptions = {
        expires: 7,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const
      };
      
      Cookies.set('accessToken', accessToken, cookieOptions);
      Cookies.set('refreshToken', refreshToken, cookieOptions);
      Cookies.set('user', JSON.stringify(userData), cookieOptions);
      
      setUser(userData);
      console.log(userData);
      return { success: true, message: 'Login successful' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const register = async (input: RegisterInput) => {
    console.log(input)
    try {
      const { data } = await registerMutation({
        variables: {
          input
        }
      });
      
      return { success: true, message: data.register.message };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const verifyRegistration = async (email: string, code: string) => {
    console.log(email, code)
    try {
      const { data } = await verifyRegistrationMutation({
        variables: {
          input: { email, code }
        }
      });
      
      const { accessToken, refreshToken, user: userData } = data.verifyRegistration;
      
      const cookieOptions = {
        expires: 7,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const
      };
      
      Cookies.set('accessToken', accessToken, cookieOptions);
      Cookies.set('refreshToken', refreshToken, cookieOptions);
      Cookies.set('user', JSON.stringify(userData), cookieOptions);
      console.log(userData);
      setUser(userData);
      return { success: true, message: 'Registration successful' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    Cookies.remove('accessToken');
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
      register,
      verifyRegistration,
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