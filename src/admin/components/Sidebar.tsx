import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  Settings, 
  BarChart3, 
  Globe, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Command
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Sidebar as SidebarUI, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: ShoppingBag, label: 'Products', href: '/admin/products' },
  { icon: Package, label: 'Orders', href: '/admin/orders' },
  { icon: Users, label: 'Customers', href: '/admin/customers' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
];

const secondaryNavItems = [
  { icon: Globe, label: 'Storefront', href: '/' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export function Sidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarUI>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Command className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight">VIONNE</span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">Admin Panel</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              {!isCollapsed && (
                <h2 className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Main Menu
                </h2>
              )}
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild tooltip={item.label}>
                      <NavLink 
                        to={item.href}
                        className={({ isActive }) => cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all group relative",
                          isActive 
                            ? "bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <item.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110")} />
                        {!isCollapsed && <span>{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
            <Separator className="mx-4 opacity-50" />
            <div className="px-3 py-2">
              {!isCollapsed && (
                <h2 className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Management
                </h2>
              )}
              <SidebarMenu>
                {secondaryNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild tooltip={item.label}>
                      <NavLink 
                        to={item.href}
                        className={({ isActive }) => cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all group",
                          isActive 
                            ? "bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          </div>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className={cn("flex items-center gap-3 rounded-xl p-2 bg-muted/50 border border-border/50", isCollapsed && "justify-center")}>
          <div className="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px]">
             <div className="h-full w-full rounded-lg bg-card flex items-center justify-center overflow-hidden">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" 
                  alt="Admin" 
                  className="h-full w-full object-cover"
                />
             </div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-xs font-bold leading-none">Admin User</span>
              <span className="truncate text-[10px] text-muted-foreground mt-1">uzafa.shop@gmail.com</span>
            </div>
          )}
          {!isCollapsed && (
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarFooter>
    </SidebarUI>
  );
}
