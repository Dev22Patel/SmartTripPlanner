import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};
