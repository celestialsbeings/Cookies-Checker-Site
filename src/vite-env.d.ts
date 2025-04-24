/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GOOGLE_AD_CLIENT: string
    readonly VITE_GOOGLE_AD_SLOT: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }