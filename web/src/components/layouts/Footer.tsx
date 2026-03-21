// src/components/Footer.tsx

import { Github, Twitter, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="w-full border-t text-foreground bg-[#FBFBFB] dark:bg-[#0B0B0C] dark:border-t-white">
            <div className="container max-w-6xl mx-auto py-12 px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* brand */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-xl font-bold">Proxify</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t("home.footer.slogan")}
                        </p>
                        <div className="mt-4 text-sm text-muted-foreground">
                            Powered by <a href="https://poixe.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:underline">Poixe AI</a>
                        </div>
                    </div>

                    {/* project */}
                    <div>
                        <h4 className="font-semibold tracking-wide">{t("home.footer.project.title")}</h4>
                        <ul className="mt-4 space-y-2">
                            <li><a href="/api/routes" target='_blank' className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("home.footer.project.supported_api")}</a></li>
                            <li><a href="https://poixe.com/products/free" target='_blank' className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("home.footer.project.free_models")}</a></li>
                            <li><a href="https://community.poixe.com/" target='_blank' className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("home.footer.project.community")}</a></li>
                            <li><a href="https://chat-gpt-oss.com/" target='_blank' className="text-sm text-muted-foreground hover:text-foreground transition-colors">Chat-GPT-OSS</a></li>
                        </ul>
                    </div>

                    {/* team */}
                    <div>
                        <h4 className="font-semibold tracking-wide">{t("home.footer.team.title")}</h4>
                        <ul className="mt-4 space-y-2">
                            <li><a href="https://poixe.com/about/team" target='_blank' className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("home.footer.team.about")}</a></li>
                            <li><a href="https://poixe.com/about/contact" target='_blank' className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("home.footer.team.contact")}</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        {/* copyright */}
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} Poixe AI. All rights reserved.
                        </p>

                        {/* links */}
                        <div className="flex items-center space-x-4">
                            <a href="mailto:support@poixe.com" aria-label="Email" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Mail className="h-5 w-5" />
                            </a>
                            <a href="https://github.com/poixeai/proxify" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="https://x.com/PoixeAI" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
