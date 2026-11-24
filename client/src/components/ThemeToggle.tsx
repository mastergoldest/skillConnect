import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            className="
        flex h-10 w-10 items-center justify-center
        rounded-xl border border-border
        bg-card text-foreground
        transition-all duration-200
        hover:bg-muted hover:scale-105
        active:scale-95
      "
        >
            {theme === "light" ? (
                <Moon size={19} />
            ) : (
                <Sun size={19} />
            )}
        </button>
    );
}