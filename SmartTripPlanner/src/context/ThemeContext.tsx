import React, { createContext, useState, useContext, useEffect } from 'react';
import { Loader } from '@/components/common/Loader';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => Promise<void>;
  isLoading: boolean;
  defaultTheme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isThemeSet, setIsThemeSet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const userPrefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(savedTheme || (userPrefersDarkMode ? 'dark' : 'light'));
    setIsThemeSet(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add delay for visual feedback
      setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    } finally {
      // Small delay before hiding loader
      setTimeout(() => setIsLoading(false), 100);
    }
  };

  if (!isThemeSet) return null;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isLoading, defaultTheme: 'light' }}>
      {isLoading && <Loader />}
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
