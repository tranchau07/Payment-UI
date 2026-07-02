import { useCallback, useState } from 'react';

const resolveValue = (value) => value instanceof Function ? value() : value;

export function useSessionStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return resolveValue(initialValue);
    }
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : resolveValue(initialValue);
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return resolveValue(initialValue);
    }
  });

  const setValue = useCallback(value => {
    try {
      setStoredValue(current => {
        const valueToStore = value instanceof Function ? value(current) : value;
        if (typeof window !== "undefined") window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error);
    }
  }, [key]);

  const removeItem = useCallback(() => {
    try {
      setStoredValue(resolveValue(initialValue));
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeItem];
}
