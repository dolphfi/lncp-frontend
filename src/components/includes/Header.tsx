import React from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { Menu } from 'lucide-react';

const Header: React.FC = () => {
    return (
        <header className="flex h-14 items-center border-b bg-card px-6">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden">
                    <Menu className="h-5 w-5" />
                </SidebarTrigger>
                <h1 className="text-lg font-semibold text-card-foreground">Documents</h1>
            </div>
        </header>
    );
}

export default Header;
