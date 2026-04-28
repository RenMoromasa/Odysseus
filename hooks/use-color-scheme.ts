<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

let _themeMode: ThemeMode = 'system';
let _listeners: Array<() => void> = [];

export function setThemeMode(mode: ThemeMode) {
  _themeMode = mode;
  _listeners.forEach(fn => fn());
}

export function getThemeMode(): ThemeMode {
  return _themeMode;
}

export function useColorScheme(): 'light' | 'dark' {
  const systemScheme = useSystemColorScheme();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = () => forceUpdate(n => n + 1);
    _listeners.push(listener);
    return () => {
      _listeners = _listeners.filter(l => l !== listener);
    };
  }, []);

  if (_themeMode === 'system') {
    return systemScheme ?? 'dark';
  }
  return _themeMode;
}
=======
export { useColorScheme } from 'react-native';
>>>>>>> e954a3a74699615b4dec0e7bb63dcc6f62efa860
