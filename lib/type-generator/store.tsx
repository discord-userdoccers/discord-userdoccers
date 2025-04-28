import React, { useState, useEffect, useCallback, Dispatch, SetStateAction, createContext, useContext } from "react";

import { ToastContainer, ToastOptions, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define default options, now with Tailwind classes
const defaultOptions: ToastOptions = {
  position: "bottom-center",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
  theme: "light", // Keep the theme option, react-toastify handles it.
};

// Success and error options (can be extended if needed)
const successOptions: ToastOptions = {
  ...defaultOptions,
  className:
    "bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-100 border border-green-400 dark:border-green-600 rounded-md shadow-lg",
  // icon: <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-300 mr-2" />,
};

const errorOptions: ToastOptions = {
  ...defaultOptions,
  className:
    "bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-100 border border-red-400 dark:border-red-600 rounded-md shadow-lg",
  // icon: <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-300 mr-2" />,
};

// Define the context for the toast functionality
interface ToastContextProps {
  showSuccessToast: (message: React.ReactNode) => void;
  showErrorToast: (message: React.ReactNode) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

// Create the Toast Provider component
const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const showSuccessToast = useCallback((message: React.ReactNode) => {
    toast.success(message, successOptions);
  }, []);

  const showErrorToast = useCallback((message: React.ReactNode) => {
    toast.error(message, errorOptions);
  }, []);

  const contextValue = {
    showSuccessToast,
    showErrorToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

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

export type SupportedLanguages = "TypeScript" | "Python";

// Create a context for the language selection
interface CodegenLanguageContextProps {
  selectedLanguage: SupportedLanguages;
  setSelectedLanguage: (language: SupportedLanguages) => void;
}

const CodegenLanguageContext = React.createContext<CodegenLanguageContextProps | undefined>(undefined);

// Create a provider component
export const CodegenLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useLocalStorage<SupportedLanguages>(
    "selected-codegen-language",
    "Python",
  );

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
