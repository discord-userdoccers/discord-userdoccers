/// <reference types="vite-plugin-pages/client-react" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_ERROR_CODES_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
