import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/themeContext';
const ThemeToggle = () => {
  // Use the custom hook to access theme state and the toggle function
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      // Using Tailwind classes designed for the button style you approved
      className="toggle-button p-2 rounded-full text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-municipal-700 hover:bg-gray-300 dark:hover:bg-municipal-600 transition-all duration-300 shadow-md"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
};

export default ThemeToggle;
