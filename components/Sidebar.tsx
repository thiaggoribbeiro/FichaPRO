import React from 'react';

interface SidebarProps {
    children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
    return (
        <aside className="w-full lg:w-[450px] space-y-8">
            {children}
        </aside>
    );
};

export default Sidebar;
