import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { Loader } from 'lucide-react';

// Updated to match what's in the JWT token
interface DecodedToken extends JwtPayload {
  id: string;
  email: string;
  name: string;
  firstname?: string;
  lastname?: string;
  picture?: string;
}

interface UserData {
  id?: string;
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

  // Enhanced token processing function with detailed logging
  const processToken = (token: string): UserData | null => {
    try {
      console.log("Processing token...");

      // Log the raw token for debugging (careful with this in production)
      console.log("Token first 20 chars:", token.substring(0, 20) + "...");

      const decoded = jwtDecode<DecodedToken>(token);
      console.log("Decoded token structure:", Object.keys(decoded));
      console.log("Decoded token user info:", {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name
      });

      if (decoded.exp && decoded.exp * 1000 > Date.now()) {
        // Check if we have the minimum required fields
        if (!decoded.email || !decoded.name) {
          console.error("Token missing required fields:", decoded);
          return null;
        }

        // Return user data from the token
        const userData = {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture
        };

        console.log("Extracted user data:", userData);
        return userData;
      } else {
        console.log("Token expired or invalid");
      }
    } catch (error) {
      console.error('Error processing token:', error);
    }
    return null;
  };

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication status...");
        const token = localStorage.getItem('token');

        if (!token) {
          console.log("No token found in localStorage");
          setIsLoading(false);
          return;
        }

        console.log("Token found in localStorage");
        const userData = processToken(token);

        if (userData) {
          console.log("Valid user data extracted from token:", userData);
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          console.warn("Invalid token found, removing from localStorage");
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Error during auth check:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (token: string): Promise<void> => {
    setIsLoading(true);
    try {
      console.log("Login attempt with token");

      if (!token) {
        throw new Error('No token provided');
      }

      const userData = processToken(token);
      if (userData) {
        console.log("Login successful, setting user data:", userData);
        localStorage.setItem('token', token);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.error("Login failed: Could not extract user data from token");
        throw new Error('Invalid token format');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log("Logging out");
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const contextValue = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout
  };

  console.log("Auth context current state:", {
    isAuthenticated,
    isLoading,
    hasUser: user !== null
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin" /></div>;
  }

  return (
    <AuthContext.Provider value={contextValue}>
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
