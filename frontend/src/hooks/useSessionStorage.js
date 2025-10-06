// useSessionStorage.js
import { useState, useEffect } from "react";

export const useSessionStorage = (key) => {
  const [value, setValue] = useState(() => {
    const storedValue = sessionStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : null;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const updatedValue = sessionStorage.getItem(key);
      setValue(updatedValue ? JSON.parse(updatedValue) : null);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("session-update", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("session-update", handleStorageChange);
    };
  }, [key]);

  return value;
};

export const clearSessionStorage = () => {
  sessionStorage.clear();
  window.dispatchEvent(new Event("session-update")); // Thông báo thay đổi
};

export const setSessionStorage = (key, value) => {
  sessionStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("session-update")); // Thông báo thay đổi
};