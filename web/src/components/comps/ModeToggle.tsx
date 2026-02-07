// src/components/ThemeToggleButton.tsx
import { Button } from "@/components/ui/button"; 
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "./useTheme";
import { useTranslation } from "react-i18next";

export default function ThemeToggleButton() {
    const { theme, setTheme } = useTheme();
    const { t } = useTranslation();

    const cycleTheme = () => {
        if (theme === "system") {
            setTheme("light");
        } else if (theme === "light") {
            setTheme("dark");
        } else {
            setTheme("system");
        }
    };

    const renderIcon = () => {
        const iconSize = "h-[1.2rem] w-[1.2rem]"; 
        
        switch (theme) {
            case "light":
                return <Sun className={iconSize} />;
            case "dark":
                return <Moon className={iconSize} />;
            default:
                return <Laptop className={iconSize} />;
        }
    };

    return (
        <Button
            variant="ghost"  
            size="icon"     
            onClick={cycleTheme}
            aria-label="Toggle theme"
            title={t("common.toggle_theme")}
        >
            {renderIcon()}
        </Button>
    );
}

