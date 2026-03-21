import { Button } from "@/components/ui/button";
import ProxyAnimation from "./ProxyAnimation";
import { useTranslation } from "react-i18next";

export default function SloganSection() {
    const { t } = useTranslation();

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between gap-6">
                {/* left */}
                <div className="w-full flex flex-col gap-15 pt-20">
                    <h1 className="text-4xl font-semibold tracking-tight leading-tight">
                        {t("home.hero.slogan")}
                    </h1>

                    <p className="text-lg text-muted-foreground max-w-lg">
                        {t("home.hero.subtitle")}
                    </p>

                    <div className="flex flex-row gap-4 justify-between px-2 md:px-0 md:justify-start">
                        <a href="#quick-start">
                            <Button size="lg" className="text-base hover:cursor-pointer">
                                {t("home.hero.get_started")}
                            </Button>
                        </a>
                        <a href="https://github.com/poixeai/proxify" target="_blank">
                            <Button size="lg" variant="outline" className="text-base hover:cursor-pointer flex flex-row items-center">
                                {t("home.hero.view_on_github")}
                            </Button>
                        </a>
                    </div>
                </div>

                {/* right */}
                <div className="w-full pt-10">
                    <ProxyAnimation />
                </div>
            </div>
        </>
    )
}