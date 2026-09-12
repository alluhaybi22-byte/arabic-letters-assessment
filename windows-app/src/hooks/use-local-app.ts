import { useCallback, useEffect, useState } from 'react';
import type { AssessmentResult } from '@/lib/types';

export type AppSettings = { theme: 'light' | 'dark'; reducedMotion: boolean };

const SETTINGS_KEY = 'arabic-letters-settings';
const RESULTS_KEY = 'arabic-letters-results';
const defaultSettings: AppSettings = { theme: 'light', reducedMotion: false };

function read<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

export function useLocalApp() {
  const [settings, setSettings] = useState<AppSettings>(() => read(SETTINGS_KEY, defaultSettings));
  const [results, setResults] = useState<AssessmentResult[]>(() => read(RESULTS_KEY, []));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    document.documentElement.classList.toggle('reduced-motion', settings.reducedMotion);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
  }, [results]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const saveResult = useCallback((result: AssessmentResult) => {
    setResults((current) => [result, ...current].slice(0, 40));
  }, []);

  const resetData = useCallback(() => {
    localStorage.removeItem(RESULTS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    setResults([]);
    setSettings(defaultSettings);
  }, []);

  return { settings, results, updateSettings, saveResult, resetData };
}