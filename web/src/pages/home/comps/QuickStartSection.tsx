
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CodeBlock = ({ children }: { children: React.ReactNode }) => (
    <pre className="mt-2 rounded-md bg-zinc-100 p-4 font-mono text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 overflow-x-auto">
        <code>{children}</code>
    </pre>
);

export default function QuickStartSection() {
    const { t } = useTranslation();

    return (
        <section className="mt-10 border-t pt-5" id='quick-start'>
            <div className="mx-auto max-w-4xl px-6 lg:px-8">
                {/* title */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        {t("home.quick_start.title")}
                    </h2>
                    <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                        {t("home.quick_start.subtitle")}
                    </p>
                </div>

                {/* step */}
                <div className="mt-10 space-y-12">
                    {/* Step 1 */}
                    <div className="flex flex-col gap-6 md:flex-row md:items-start">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-50">
                            <span className="text-xl font-bold text-white dark:text-black">1</span>
                        </div>
                        <div className="flex-grow">
                            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                                {t("home.quick_start.step.one.title")}
                            </h3>
                            <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                                {t("home.quick_start.step.one.description")}
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col gap-6 md:flex-row md:items-start">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-50">
                            <span className="text-xl font-bold text-white dark:text-black">2</span>
                        </div>
                        <div className="flex-grow">
                            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                                {t("home.quick_start.step.two.title")}
                            </h3>
                            <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                                {t("home.quick_start.step.two.description")}
                            </p>
                            <div className="mt-4 space-y-2">
                                <div>
                                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t("home.quick_start.step.two.meta.origin_address")}</span>
                                    <CodeBlock>
                                        https://
                                        <span className="text-[#E6406C] font-semibold">api.openai.com</span>
                                        /v1/chat/completions</CodeBlock>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t("home.quick_start.step.two.meta.replace_with")}</span>
                                    <CodeBlock>
                                        http://proxify.poixe.com
                                        <span className="text-[#E6406C] font-semibold">/openai</span>
                                        /v1/chat/completions
                                    </CodeBlock>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col gap-6 md:flex-row md:items-start">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-50">
                            <span className="text-xl font-bold text-white dark:text-black">3</span>
                        </div>
                        <div className="flex-grow">
                            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                                {t("home.quick_start.step.three.title")}
                            </h3>
                            <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                                {t("home.quick_start.step.three.description")}
                            </p>
                            <div className="mt-4 flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                                <CheckCircle className="h-5 w-5 flex-shrink-0 text-[#299D90]" />
                                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                    {t("home.quick_start.step.three.note")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
