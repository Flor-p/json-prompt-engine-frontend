'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  console.log('theme:', theme, 'resolvedTheme:', resolvedTheme);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        console.log('clicking, current resolvedTheme:', resolvedTheme);
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
      }}
      className="h-8 w-8 p-0"
    >
{resolvedTheme === 'dark' ? (
  <Moon className="h-4 w-4" />
) : (
  <Sun className="h-4 w-4" />
)}
    </Button>
  );
}