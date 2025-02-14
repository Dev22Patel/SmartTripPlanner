// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { Loader } from 'lucide-react';

interface UserData {
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserData | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);

  // Function to validate and process token
  const processToken = (token: string): UserData | null => {
    try {
      const decoded = jwtDecode<JwtPayload & UserData>(token);
      if (decoded.exp && decoded.exp * 1000 > Date.now()) {
        return {
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture
        };
      }
    } catch (error) {
      console.error('Error processing token:', error);
    }
    return null;
  };

  // Check authentication status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = processToken(token);
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (token: string): Promise<void> => {
    try {
      const userData = processToken(token);
      if (userData) {
        localStorage.setItem('token', token);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        throw new Error('Invalid token');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setIsLoading(true);
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout
      }}
    >
      {isLoading && <Loader/>}
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
