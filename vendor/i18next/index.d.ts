export interface InitOptions {
  resources?: Record<string, { translation: Record<string, unknown> }>;
  lng?: string;
  fallbackLng?: string;
  interpolation?: {
    escapeValue?: boolean;
  };
}

declare class I18n {
  language: string;
  use(plugin: { init?: (i18n: I18n) => void }): this;
  init(options?: InitOptions): this;
  t(key: string, values?: Record<string, unknown>): string;
  changeLanguage(language: string): Promise<string>;
  on(event: string, handler: (payload: string) => void): this;
  off(event: string, handler: (payload: string) => void): this;
}

declare const i18n: I18n;
export default i18n;
