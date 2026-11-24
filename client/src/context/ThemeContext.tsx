import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
  } from "react";
  
  type Theme = "light" | "dark";
  
  interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
  }
  
  const ThemeContext = createContext<ThemeContextType | undefined>(
    undefined
  );
  
  function getInitialTheme(): Theme {
    const savedTheme = localStorage.getItem("skillconnect-theme");
  
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
  
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  
  export function ThemeProvider({
    children,
  }: {
    children: ReactNode;
  }) {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);
  
    useEffect(() => {
      const root = document.documentElement;
  
      root.classList.toggle("dark", theme === "dark");
  
      localStorage.setItem("skillconnect-theme", theme);
    }, [theme]);
  
    const toggleTheme = () => {
      setTheme((currentTheme) =>
        currentTheme === "light" ? "dark" : "light"
      );
    };
  
    return (
      <ThemeContext.Provider
        value={{ theme, toggleTheme, setTheme }}
      >
        {children}
      </ThemeContext.Provider>
    );
  }
  
  export function useTheme() {
    const context = useContext(ThemeContext);
  
    if (!context) {
      throw new Error("useTheme must be used within ThemeProvider");
    }
  
    return context;
  }