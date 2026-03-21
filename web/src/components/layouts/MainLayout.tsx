import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function MainLayout() {

    return (
        <>
            <Header />

            <main className="max-w-6xl mx-auto px-4 py-1">
                <Outlet />
            </main>

            <Footer />
        </>
    )
}