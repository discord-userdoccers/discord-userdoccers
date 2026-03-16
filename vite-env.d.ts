/// <reference types="vite-plugin-pages/client-react" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_ALGOLIA_APP_ID: string;
  readonly VITE_ALGOLIA_API_KEY: string;
  readonly VITE_ALGOLIA_INDEX_NAME: string;
  readonly VITE_ALGOLIA_AI_INDEX: string;
  readonly VITE_ALGOLIA_AI_ASSISTANT: string;
  readonly VITE_ERROR_CODES_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
