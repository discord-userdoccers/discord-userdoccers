import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { Language } from "@lib/type-generator/languageConfig";
import { ToastProvider } from "../../components/Toast";

export { useToast } from "../../components/Toast";

// Define the type for the store value.  Use a generic for the localStorage hook
type StoreValue<T> = T;

// Define the type for the set function.
type SetStoreValue<T> = Dispatch<SetStateAction<T>>;

function useLocalStorage<T>(key: string, initialValue: T): [StoreValue<T>, SetStoreValue<T>] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const item = window.localStorage.getItem(key);
      const stored = item ? (JSON.parse(item) as T) : initialValue;
      setStoredValue(stored);
    } catch (error) {
      console.error(`Error getting item from local storage:`, error);
    }
  }, [key, initialValue]);

  const setValue: SetStoreValue<T> = useCallback(
    (value) => {
      setStoredValue((prevValue) => {
        const newValue = value instanceof Function ? value(prevValue) : value;
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(key, JSON.stringify(newValue));
          } catch (e) {
            console.error(`Error setting item ${key} in localStorage`, e);
          }
        }
        return newValue;
      });
    },
    [key],
  );

  return [storedValue, setValue];
}

// Create a context for the language selection
interface CodegenLanguageContextProps {
  selectedLanguage: Language;
  setSelectedLanguage: (language: Language) => void;
}

const CodegenLanguageContext = React.createContext<CodegenLanguageContextProps | undefined>(undefined);

// Create a provider component
export const CodegenLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useLocalStorage<Language>("selected-codegen-language", "Python");

  const contextValue = {
    selectedLanguage,
    setSelectedLanguage,
  };

  return (
    <CodegenLanguageContext.Provider value={contextValue}>
      <ToastProvider>{children}</ToastProvider>
    </CodegenLanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useCodegenLanguage = () => {
  const context = React.useContext(CodegenLanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
