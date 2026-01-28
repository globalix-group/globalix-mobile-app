import React, { createContext, useState, useContext } from 'react';
import { ThemeColors } from './index'; // This matches the file you just created

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: any) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark(!isDark);
  
  // Select colors based on state
  const theme = isDark ? ThemeColors.dark : ThemeColors.light;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);