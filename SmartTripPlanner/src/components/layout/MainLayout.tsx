import React from 'react';
import { Header } from './Header';
import Footer from './Footer';
import { useAuth } from '@/context/AuthContext';
import { Loader } from '../common/Loader';
export const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const { isLoading } = useAuth();

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 text-white">
            <Header />
            <main className="flex-grow min-h-[calc(100vh-100px)]">{children}</main>
            <div className="bg-slate-200 dark:bg-gray-800 shadow-lg">
            <Footer />
            </div>
        </div>
    );
};
