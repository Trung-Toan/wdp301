import { useState, useEffect } from "react";

export const useSessionStorage = (key, defaultValue = null) => {
  const [value, setValue] = useState(() => {
    try {
      const storedValue = sessionStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (err) {
      console.warn(`Cannot parse sessionStorage key "${key}":`, err);
      return defaultValue;
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const updatedValue = sessionStorage.getItem(key);
        setValue(updatedValue ? JSON.parse(updatedValue) : defaultValue);
      } catch (err) {
        console.warn(`Cannot parse sessionStorage key "${key}" on update:`, err);
        setValue(defaultValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("session-update", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("session-update", handleStorageChange);
    };
  }, [key, defaultValue]);

  return value;
};

export const clearSessionStorage = () => {
  sessionStorage.clear();
  window.dispatchEvent(new Event("session-update"));
};

export const setSessionStorage = (key, value) => {
  try {
    if (value === undefined) {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, JSON.stringify(value));
    }
    window.dispatchEvent(new Event("session-update"));
  } catch (err) {
    console.error(`Cannot set sessionStorage key "${key}":`, err);
  }
};
