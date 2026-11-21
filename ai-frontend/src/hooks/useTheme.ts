import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  const [manual, setManual] = useState(() => { try { return Boolean(localStorage.getItem('shiguang-theme')); } catch { return false; } });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#151e2c' : '#f6f8fc');
    if (manual) { try { localStorage.setItem('shiguang-theme', theme); } catch { /* Theme still works when storage is unavailable. */ } }
  }, [theme, manual]);
  useEffect(() => {
    if (manual) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setTheme(media.matches ? 'dark' : 'light');
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [manual]);
  return { theme, toggleTheme: () => { setManual(true); setTheme(value => value === 'light' ? 'dark' : 'light'); } };
}
