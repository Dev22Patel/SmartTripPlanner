import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '@/context/AuthContext';
import { Loader } from '../common/Loader';
import UniqueFooter from '../ui/footer-unauthenticated';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-gray-900 text-white">
            <Header />
            <main className="flex-1 mb-auto">{children}</main>
            <div className="mt-auto bg-slate-200 dark:bg-gray-800 shadow-lg">
                {isAuthenticated ? <Footer /> : <UniqueFooter />}
            </div>
        </div>
    );
};
