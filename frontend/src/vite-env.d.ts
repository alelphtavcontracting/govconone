
/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** The mode the app is running in. */
  readonly MODE: string;
  /** Whether the app is running in production. */
  readonly PROD: boolean;
  /** Whether the app is running in development (dev server). */
  readonly DEV: boolean;
  /** Base URL of the API. */
  readonly VITE_API_URL: string;
  /** Google OAuth client ID. */
  readonly VITE_GOOGLE_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
