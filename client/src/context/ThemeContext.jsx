import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Check localStorage for an existing preference, default to light mode
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement; // Targets the <html> element

    // Apply or remove the .dark class based on state changes
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }

    // Remember the user's setting across refreshes
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom consumer hook
export const useTheme = () => useContext(ThemeContext);