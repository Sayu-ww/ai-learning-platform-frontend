import { useLayoutEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext, type Theme } from './theme-context';

const darkThemeVariables = {
  '--background': '224 28% 9%',
  '--foreground': '220 20% 96%',
  '--card': '224 25% 12%',
  '--card-foreground': '220 20% 96%',
  '--popover': '224 25% 12%',
  '--popover-foreground': '220 20% 96%',
  '--primary': '250 86% 72%',
  '--primary-foreground': '240 30% 10%',
  '--secondary': '224 20% 17%',
  '--secondary-foreground': '220 20% 94%',
  '--muted': '224 20% 17%',
  '--muted-foreground': '220 12% 66%',
  '--accent': '250 32% 21%',
  '--accent-foreground': '250 90% 84%',
  '--destructive': '0 58% 42%',
  '--destructive-foreground': '0 0% 98%',
  '--border': '224 18% 21%',
  '--input': '224 18% 24%',
  '--ring': '250 86% 72%',
};

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    for (const [property, value] of Object.entries(darkThemeVariables)) {
      if (theme === 'dark') {
        document.documentElement.style.setProperty(property, value);
      } else {
        document.documentElement.style.removeProperty(property);
      }
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
