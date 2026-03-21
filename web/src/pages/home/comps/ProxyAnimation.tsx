import { useState, useEffect } from 'react';
import { MoveDown } from 'lucide-react'; 
import { useTranslation } from 'react-i18next';

const ROUTES = [
  { path: '/openai', target: 'https://api.openai.com' },
  { path: '/claude', target: 'https://api.anthropic.com' },
  { path: '/gemini', target: 'https://generativelanguage.googleapis.com' },
  { path: '/azure', target: 'https://azure.com' },
  { path: '/deepseek', target: 'https://api.deepseek.com' },
  { path: '/poixe', target: 'https://api.poixe.com' },
  { path: '/grok', target: 'https://api.x.ai' },
];

const COLORS = [
  { text: 'text-[#299D90]', bg: 'bg-cyan-900/50', border: 'border-cyan-500' },
  { text: 'text-[#E8C469]', bg: 'bg-green-900/50', border: 'border-green-500' },
  { text: 'text-[#F4A362]', bg: 'bg-amber-900/50', border: 'border-amber-500' },
  { text: 'text-[#E76E50]', bg: 'bg-violet-900/50', border: 'border-violet-500' },
  { text: 'text-[#284754]', bg: 'bg-violet-900/50', border: 'border-violet-500' },
  { text: 'text-[#5F90FC]', bg: 'bg-violet-900/50', border: 'border-violet-500' },
  { text: 'text-[#8B3DCE]', bg: 'bg-violet-900/50', border: 'border-violet-500' },
  { text: 'text-[#E6406C]', bg: 'bg-violet-900/50', border: 'border-violet-500' },
];

const TEXTS = [
  { text: 'Hello! How can I help you today?' }, // 🇺🇸
  { text: '你好！有什么我可以帮忙的吗？' }, // 🇨🇳
  { text: 'こんにちは！今日はどのようにお手伝いできますか？' }, // 🇯🇵
  { text: 'Здравствуйте! Чем я могу вам помочь сегодня?' }, // 🇷🇺
  { text: '¡Hola! ¿En qué puedo ayudarte hoy?' }, // 🇪🇸
  { text: 'Hallo! Wie kann ich Ihnen heute helfen?' }, // 🇩🇪
  { text: 'Ciao! Come posso aiutarti oggi?' }, // 🇮🇹
  { text: '안녕하세요! 오늘 어떻게 도와드릴까요?' }, // 🇰🇷
]

export default function ProxyAnimation() {
  const { t } = useTranslation();

  const [routeIndex, setRouteIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);

  const timerDuration = 4000; // 4 seconds

  useEffect(() => {
    const routeTimer = setInterval(() => {
      setRouteIndex((prev) => (prev + 1) % ROUTES.length);
    }, timerDuration);

    const colorTimer = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % COLORS.length);
    }, timerDuration);

    const textTimer = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % TEXTS.length);
    }, timerDuration);

    return () => {
      clearInterval(routeTimer);
      clearInterval(colorTimer);
      clearInterval(textTimer);
    };
  }, []);

  const currentRoute = ROUTES[routeIndex];
  const currentColor = COLORS[colorIndex];
  const currentText = TEXTS[textIndex];

  return (
    <div
      className="
        flex flex-col items-center justify-center p-6 rounded-2xl border
        bg-white/70 dark:bg-[#0B0B0C]/60
        backdrop-blur-md
        border-gray-200 dark:border-gray-800
        shadow-xl dark:shadow-[0_0_20px_rgba(255,255,255,0.05)]
        transition-all duration-700
        font-mono
      "
    >
      <div className="flex flex-col items-center justify-between w-full space-x-4 gap-6">
        {/* from */}
        <div className="flex-1 p-4 rounded-lg text-left">
          <span className="text-gray-500 dark:text-white">https://proxify.poixe.com</span>
          <span
            className={`font-bold transition-colors duration-500 ${currentColor.text}`}
          >
            {currentRoute.path}
          </span>
        </div>

        {/* arrow */}
        <div className="text-gray-500 dark:text-white flex flex-row items-center gap-2">
          <MoveDown size={24} />
          <span className='text-sm font-bold'>{t("home.hero.animation_proxy")}</span>
        </div>

        {/* to */}
        <div className="flex-1 p-4 rounded-lg text-left">
          <span
            className={`font-bold transition-colors duration-500 ${currentColor.text}`}
          >
            {currentRoute.target}
          </span>
        </div>

        <div className="text-gray-500 dark:text-white flex flex-row items-center gap-2">
          <MoveDown size={24} />
          <span className='text-sm font-bold'>AI</span>
        </div>

        <div className="flex-1 p-4 rounded-lg text-left">
          <span className="text-gray-500 dark:text-white">
            "{currentText.text}"
          </span>
        </div>
      </div>
    </div>
  );
};