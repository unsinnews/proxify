import { useTranslation } from "react-i18next";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const LANGUAGES = [
    { code: "en", label: "English", short: "EN" },
    { code: "zh-CN", label: "简体中文", short: "CN" },
    { code: "zh-TW", label: "繁體中文", short: "TW" },
    { code: "ja", label: "日本語", short: "JP" },
    { code: "ru", label: "Русский", short: "RU" },
    { code: "ko", label: "한국어", short: "KR" },
];

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const currentLang = i18n.language || "en";

    const handleChange = (lang: string) => {
        i18n.changeLanguage(lang);
        localStorage.setItem("i18nextLng", lang);
    };

    const current = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Change language"
                >
                    {current.short}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-36 rounded-md border border-gray-200 bg-white/95 backdrop-blur-sm p-1 shadow-sm"
            >
                {LANGUAGES.map((lang) => {
                    const isActive = currentLang === lang.code;
                    return (
                        <DropdownMenuItem
                            key={lang.code}
                            onClick={() => handleChange(lang.code)}
                            className={`flex justify-between items-center px-2 py-1.5 text-sm rounded-md cursor-pointer transition-colors
                ${isActive
                                    ? "bg-gray-100 text-foreground font-medium dark:text-black dark:hover:text-white"
                                    : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
                                }`}
                        >
                            <span>{lang.label}</span>
                            <span className="text-xs opacity-70">{lang.short}</span>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
