import React from 'react';
import { Search, Bell, Moon, Sun, SearchIcon, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Topbar() {
  const [isDark, setIsDark] = React.useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-96 group">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search everything... (⌘K)"
            className="w-full bg-muted/30 pl-10 border-none ring-1 ring-border/50 focus-visible:ring-primary/50 rounded-xl transition-all h-10"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50 group-focus-within:opacity-100 transition-opacity pointer-events-none">
            <Command className="h-3 w-3" />
            <span className="text-[10px] font-bold">K</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="rounded-full hover:bg-muted/50"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted/50">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-primary ring-2 ring-background"></span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-2 ring-primary/20 ring-offset-2 ring-offset-background hover:ring-primary/40 transition-all">
              <Avatar className="h-10 w-10">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none">Admin User</p>
                  <p className="text-xs leading-none text-muted-foreground">uzafa.shop@gmail.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg py-2">Profile</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg py-2">Billing</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg py-2">Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg py-2 text-destructive focus:text-destructive">Log out</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
