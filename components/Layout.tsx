import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { User } from '@supabase/supabase-js';

interface LayoutProps {
    children: React.ReactNode;
    user?: User | null;
    currentView: string;
    onViewChange: (view: any) => void;
    onSaveDraft?: () => void;
    onGeneratePdf?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, currentView, onViewChange, onSaveDraft, onGeneratePdf }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar user={user} currentView={currentView} onViewChange={onViewChange} />
            <main className="flex-1 flex flex-col max-w-[1440px] mx-auto w-full px-6 py-6 gap-6">
                {children}
            </main>
        </div>
    );
};

export default Layout;
