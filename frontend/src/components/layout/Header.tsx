import React from 'react';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left section - Logo / Primary Nav */}
        <div className="flex items-center gap-4">
          {/* Add your logo and primary navigation here */}
        </div>

        {/* Center section - Optional centered nav */}
        <div className="flex items-center gap-4">
          {/* Add centered navigation items here if needed */}
        </div>

        {/* Right section - Actions / Secondary Nav */}
        <div className="flex items-center gap-4">
          {/* Add auth buttons, user menu, etc. here */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
