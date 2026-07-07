import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { CommandMenu } from './components/CommandMenu';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  // Ensure dark mode is active by default for that SaaS look
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <SidebarProvider>
      <TooltipProvider>
        <div className="flex min-h-screen w-full bg-background font-sans">
          <Sidebar />
          <SidebarInset className="flex flex-col bg-background/50">
            <Topbar />
            <main className="flex-1 overflow-auto p-6 md:p-8">
              <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
        <CommandMenu />
        <Toaster position="top-right" richColors />
      </TooltipProvider>
    </SidebarProvider>
  );
}
