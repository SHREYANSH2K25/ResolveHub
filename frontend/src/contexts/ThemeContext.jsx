import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Initialize the Theme Context
const ThemeContext = createContext();

// 2. Create the custom hook for components to access the theme state
export const useTheme = () => useContext(ThemeContext);

// 3. Theme Provider Component
export const ThemeProvider = ({ children }) => {
  // Determine initial state based on system preference or local storage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Default to system preference if no theme is saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Effect to apply the 'dark' class to the HTML element on change
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      htmlElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Function to toggle the theme state
  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const value = {
    isDarkMode,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
