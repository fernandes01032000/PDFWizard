import { Button } from "@/components/ui/button";
import { FileText, Settings, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

type Mode = "design" | "fill";

interface TopNavigationProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
  onOpenTemplates: () => void;
}

export function TopNavigation({ currentMode, onModeChange, onOpenTemplates }: TopNavigationProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "light";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">PDF Form Builder</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-muted rounded-md p-1">
        <Button
          variant={currentMode === "design" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onModeChange("design")}
          className="relative"
          data-testid="button-mode-design"
        >
          <Settings className="h-4 w-4 mr-2" />
          Design Mode
          {currentMode === "design" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
          )}
        </Button>
        <Button
          variant={currentMode === "fill" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onModeChange("fill")}
          className="relative"
          data-testid="button-mode-fill"
        >
          <FileText className="h-4 w-4 mr-2" />
          Fill Mode
          {currentMode === "fill" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
          )}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenTemplates}
          data-testid="button-templates"
        >
          <FileText className="h-4 w-4 mr-2" />
          Templates
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          data-testid="button-theme-toggle"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}
