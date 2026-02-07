// src/components/SupportedAPISection.tsx

import React, { useEffect, useState } from 'react';
import { FileCode2, ChevronDown, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';

interface ApiEndpoint {
  name: string;
  path: string;
  officialUrl: string;
  icon?: React.ReactNode;
}

interface RouteApiItem {
  name: string;
  path: string;
  target: string;
}

interface RouteApiResponse {
  data: RouteApiItem[];
}

function ApiEndpointCard({ name, path, officialUrl, icon }: ApiEndpoint) {
  return (
    <div className="group relative flex flex-col justify-between rounded-lg border bg-card p-5 text-card-foreground shadow-sm transition-all duration-300 hover:border-primary/60 hover:shadow-md">
      <div>
        <div className="flex items-center gap-4 mb-3">
          {icon ? icon : <FileCode2 className="h-5 w-5 text-muted-foreground" />}
          <h3 className="text-lg font-semibold tracking-tight">{name}</h3>
        </div>
        <div className="flex items-center space-x-2 rounded-md bg-muted px-3 py-1.5 text-sm">
          <span className="text-muted-foreground">Path:</span>
          <code className="font-mono text-foreground">{path}</code>
        </div>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <p className="mt-4 h-10 text-xs text-muted-foreground truncate cursor-help">
            <span className="font-medium">URL:</span> {officialUrl}
          </p>
        </TooltipTrigger>
        <TooltipContent
          side='bottom'
        >{officialUrl}</TooltipContent>
      </Tooltip>
    </div>
  );
}

// main
export default function SupportedAPISection() {
  const { t } = useTranslation();
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);

  const [showAll, setShowAll] = useState(false);
  const initialCount = 8;
  const displayedEndpoints = showAll ? apiEndpoints : apiEndpoints.slice(0, initialCount);

  useEffect(() => {
    fetch('/api/routes')
      .then(res => res.json() as Promise<RouteApiResponse>)
      .then((data) => {
        const formatted = data.data.map((item) => ({
          name: item.name,
          path: item.path,
          officialUrl: item.target,
          icon: item.path === '/self-host'
            ? <CheckCircle2 className="h-5 w-5 text-green-500" />
            : undefined
        }));
        setApiEndpoints(formatted);
      })
      .catch(err => console.error('Failed to fetch routes:', err));
  }, []);

  return (
    <section id='supported-api' className="mt-10 border-t pt-5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tighter">
            {t("home.supported_api.title")}
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-lg">
            {t("home.supported_api.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {displayedEndpoints.map((endpoint) => (
            <ApiEndpointCard key={endpoint.name} {...endpoint} />
          ))}
        </div>

        {apiEndpoints.length > initialCount && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex h-10 items-center justify-center rounded-md border bg-background px-6 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              <span>{showAll ? t("home.supported_api.expand_button.show_less") : t("home.supported_api.expand_button.show_more")}</span>
              <ChevronDown
                className={cn(
                  'ml-2 h-4 w-4 transition-transform duration-300',
                  showAll && 'rotate-180'
                )}
              />
            </button>
          </div>
        )}
      </div>

      <div className="text-center mt-5 text-muted-foreground text-sm">
        {t("home.supported_api.note")}GET <a href="/api/routes" target="_blank" className="underline hover:text-foreground">/api/routes</a>
      </div>
    </section>
  );
}
