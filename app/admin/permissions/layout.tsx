import React from 'react';

interface PermissionsLayoutProps {
  children: React.ReactNode;
}

const PermissionsLayout: React.FC<PermissionsLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-full">
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold">Permissions Management</h1>
      </header>
      <main className="flex-1 p-4 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default PermissionsLayout; 