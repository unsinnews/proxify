import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggleButton from '../comps/ModeToggle'
import LanguageSwitcher from '../comps/LanguageSwitcher'
import { useTranslation } from 'react-i18next'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t } = useTranslation()

  const NAV_ITEMS = [
    { label: t("home.navbar.home"), href: "/" },
    { label: t("home.navbar.features"), href: "#features" },
    { label: t("home.navbar.quick_start"), href: "#quick-start" },
    { label: t("home.navbar.supported_api"), href: "#supported-api" },
    { label: t("home.navbar.code_examples"), href: "#code-block" },
  ]

  return (
    <header className="w-full border-b bg-[#FBFBFB] dark:border-b-white text-gray-900 dark:bg-[#0B0B0C] dark:text-gray-100 border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-1 flex justify-between items-center h-12">
        {/* Logo */}
        <Link to={"/"}>
          <div className="flex items-center space-x-2 hover:cursor-pointer">
            <img src="/x.svg" alt="logo" className="w-6 h-6 object-contain" />
            <span className="text-xl font-semibold tracking-tight">Proxify</span>
          </div>
        </Link>

        {/* desktop */}
        <div className="hidden md:flex items-center space-x-3">
          <nav className="hidden md:flex space-x-6 text-gray-700 mr-4 dark:text-gray-200">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-black dark:hover:text-white transition-colors text-sm"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="h-4 w-px bg-border" />
          <LanguageSwitcher />
          <ThemeToggleButton />
          <div className="h-4 w-px bg-border" />
          <a
            href="https://github.com/poixeai/proxify"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://img.shields.io/github/stars/poixeai/proxify?style=social"
              alt="GitHub stars"
            />
          </a>
        </div>

        {/* mobile button */}
        <button
          className="md:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <nav className="flex flex-col items-start p-4 space-y-3 text-gray-700 dark:text-gray-200">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="w-full hover:text-black dark:hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}

            <div className="flex items-center justify-between w-full pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-row gap-4">
                <LanguageSwitcher />
                <ThemeToggleButton />
              </div>
              <a
                href="https://github.com/poixeai/proxify"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="https://img.shields.io/github/stars/poixeai/proxify?style=social"
                  alt="GitHub stars"
                />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
