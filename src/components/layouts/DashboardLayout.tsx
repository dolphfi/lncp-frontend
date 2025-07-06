import React from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from '../includes/Sidebar';
import Header from '../includes/Header';
import { SidebarProvider, SidebarInset } from '../ui/sidebar';

const DashboardLayout: React.FC = () => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex h-screen flex-col">
                <Header />
                <div className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default DashboardLayout;
