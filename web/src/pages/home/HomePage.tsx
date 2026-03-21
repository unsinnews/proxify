
import ScrollToTopButton from "@/components/layouts/ScrollToTopButton";
import CodeBlockRoutes from "./comps/CodeBlock";
import FeaturesSection from "./comps/FeaturesSection";
import QuickStartSection from "./comps/QuickStartSection";
import SloganSection from "./comps/SloganSection";
import SupportedAPISection from "./comps/SupportedAPISection";

export default function HomePage() {
    return (
        <>
            {/* slogan */}
            <SloganSection />

            {/* features */}
            <FeaturesSection />

            {/* quick start */}
            <QuickStartSection />

            {/* supported api */}
            <SupportedAPISection />

            {/* code block */}
            <CodeBlockRoutes />

            {/* back to top */}
            <ScrollToTopButton />
        </>
    )
}