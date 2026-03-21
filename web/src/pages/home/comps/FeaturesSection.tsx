import { useTranslation } from "react-i18next";
import FeatureCard from "./FeatureCard";

export default function FeaturesSection() {
    const { t } = useTranslation();

    return (
        <>
            <section className="mt-15 border-t pt-5" id="features">
                <h2 className="text-3xl font-semibold text-center mb-8">{t("home.features.title")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        title={t("home.features.extensibility.title")}
                        description={t("home.features.extensibility.description")}
                    />
                    <FeatureCard
                        title={t("home.features.streaming_optimization.title")}
                        description={t("home.features.streaming_optimization.description")}
                    />
                    <FeatureCard
                        title={t("home.features.multi_domain_routing.title")}
                        description={t("home.features.multi_domain_routing.description")}
                    />

                    <FeatureCard
                        title={t("home.features.lightweight.title")}
                        description={t("home.features.lightweight.description")}
                    />
                    <FeatureCard
                        title={t("home.features.security.title")}
                        description={t("home.features.security.description")}
                    />
                    <FeatureCard
                        title={t("home.features.open_source.title")}
                        description={t("home.features.open_source.description")}
                    />

                    <FeatureCard
                        title={t("home.features.maintenance.title") }
                        description={t("home.features.maintenance.description")}
                    />
                    <FeatureCard
                        title={t("home.features.ease_of_use.title")}
                        description={t("home.features.ease_of_use.description")}
                    />
                    <FeatureCard
                        title={t("home.features.tail_end_sprinting.title")}
                        description={t("home.features.tail_end_sprinting.description")}
                    />
                </div>

                <div className="text-center mt-10 text-muted-foreground text-sm">
                    {t("home.features.mit")}
                </div>
            </section>
        </>
    )
}