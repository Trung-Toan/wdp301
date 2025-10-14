import { useState, useEffect, useCallback } from "react";

// Hook chính
export const useSessionStorage = (key, defaultValue = null) => {
  const [value, setValue] = useState(() => {
    try {
      const storedValue = sessionStorage.getItem(key);
      return storedValue && storedValue !== "undefined"
        ? JSON.parse(storedValue)
        : defaultValue;
    } catch (err) {
      console.warn(`Cannot parse sessionStorage key "${key}":`, err);
      return defaultValue;
    }
  });

  // Cập nhật khi storage thay đổi
  const updateValue = useCallback(() => {
    try {
      const storedValue = sessionStorage.getItem(key);
      setValue(
        storedValue && storedValue !== "undefined"
          ? JSON.parse(storedValue)
          : defaultValue
      );
    } catch (err) {
      console.warn(`Cannot parse sessionStorage key "${key}" on update:`, err);
      setValue(defaultValue);
    }
  }, [key, defaultValue]);

  useEffect(() => {
    window.addEventListener("storage", updateValue);
    window.addEventListener("session-update", updateValue);

    return () => {
      window.removeEventListener("storage", updateValue);
      window.removeEventListener("session-update", updateValue);
    };
  }, [updateValue]);

  return value;
};

// Xóa tất cả sessionStorage và thông báo thay đổi
export const clearSessionStorage = () => {
  sessionStorage.clear();
  window.dispatchEvent(new Event("session-update"));
};

// Lưu giá trị vào sessionStorage an toàn
export const setSessionStorage = (key, value) => {
  try {
    if (value === undefined || value === null) {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, JSON.stringify(value));
    }
    window.dispatchEvent(new Event("session-update"));
  } catch (err) {
    console.error(`Cannot set sessionStorage key "${key}":`, err);
  }
};
