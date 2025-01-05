import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '@/context/AuthContext';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-900 text-white">
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin border-4 border-t-4 border-gray-300 dark:border-gray-700 border-solid rounded-full w-12 h-12"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-gray-900 text-white">
            <Header />
            <main className="flex-1">{children}</main>
            {isAuthenticated && <Footer />}
        </div>
    );
};
