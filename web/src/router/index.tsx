import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import { Suspense } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
const Home = lazy(() => import("@/pages/home/HomePage"));
const NotFound = lazy(() => import("@/pages/404/NotFoundPage"));

export const router = createBrowserRouter([
    // === home ===
    {
        path: "/",
        element: (
            <Suspense>
                <MainLayout />
            </Suspense>
        ),
        children: [
            {
                index: true,
                element: (
                    <Suspense>
                        <Home />
                    </Suspense>
                ),
            },
            // === 404 ===
            {
                path: "*",
                element: (
                    <Suspense>
                        <NotFound />
                    </Suspense>
                ),
            },
        ]
    },
])