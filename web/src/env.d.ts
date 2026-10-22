/// <reference types="vite/client" />

/** Public site origin, injected by vite.config.ts. */
declare const __SITE_URL__: string;

interface ImportMetaEnv {
  /** Base URL of the community API, e.g. "/api". Unset = community features off. */
  readonly VITE_RUKO_API?: string;
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
