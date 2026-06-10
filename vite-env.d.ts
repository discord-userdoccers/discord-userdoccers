/// <reference types="vite-plugin-pages/client-react" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_ERROR_CODES_ENDPOINT: string;
  readonly VITE_DEV_BUTTON_COMMIT: string;
  readonly VITE_DEV_BUTTON_BRANCH: string;
  readonly VITE_DEV_BUTTON_BRANCH_REPO: string;
  readonly VITE_DEV_BUTTON_PR: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
