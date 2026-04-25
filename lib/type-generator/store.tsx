import React, {
  createContext,
  Dispatch,
  SetStateAction,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Language } from "@lib/type-generator/languageConfig";

const successClassName =
  "bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-100 border border-green-400 dark:border-green-600 rounded-md shadow-lg";
const errorClassName =
  "bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-100 border border-red-400 dark:border-red-600 rounded-md shadow-lg";

// Lazy-load react-toastify
const LazyToastContainer = React.lazy(() => import("react-toastify").then((m) => ({ default: m.ToastContainer })));

// Dynamically load toast + CSS on first use
let toastFn: typeof import("react-toastify").toast | null = null;
async function getToast() {
  if (toastFn) return toastFn;
  const [mod] = await Promise.all([import("react-toastify"), import("react-toastify/dist/ReactToastify.css")]);
  toastFn = mod.toast;
  return toastFn;
}

// Define the context for the toast functionality
interface ToastContextProps {
  showSuccessToast: (message: React.ReactNode) => void;
  showErrorToast: (message: React.ReactNode) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

// Create the Toast Provider component
const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasToasted, setHasToasted] = useState(false);

  const showSuccessToast = useCallback((message: React.ReactNode) => {
    setHasToasted(true);
    getToast().then((t) =>
      t.success(message, { position: "bottom-center", autoClose: 3000, className: successClassName }),
    );
  }, []);

  const showErrorToast = useCallback((message: React.ReactNode) => {
    setHasToasted(true);
    getToast().then((t) => t.error(message, { position: "bottom-center", autoClose: 3000, className: errorClassName }));
  }, []);

  const contextValue = {
    showSuccessToast,
    showErrorToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {hasToasted && (
        <Suspense fallback={null}>
          <LazyToastContainer position="bottom-center" autoClose={3000} theme="light" />
        </Suspense>
      )}
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
