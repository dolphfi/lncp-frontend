import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="flex h-14 items-center border-b bg-card px-6">
            <h1 className="text-lg font-semibold text-card-foreground">Documents</h1>
        </header>
    );
}

export default Header;
