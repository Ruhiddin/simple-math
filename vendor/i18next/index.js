class I18n {
  constructor() {
    this.language = 'en';
    this.options = { resources: {}, fallbackLng: 'en' };
    this.plugins = [];
    this.events = new Map();
  }

  use(plugin) {
    this.plugins.push(plugin);
    if (plugin && typeof plugin.init === 'function') {
      plugin.init(this);
    }
    return this;
  }

  init(options = {}) {
    this.options = { ...this.options, ...options };
    this.language = options.lng || this.options.fallbackLng || 'en';
    return this;
  }

  t(key, values = {}) {
    const parts = String(key).split('.');
    const resources = this.options.resources || {};
    const namespace = resources[this.language]?.translation ?? resources[this.options.fallbackLng]?.translation;
    let text = parts.reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), namespace);
    if (typeof text !== 'string') return key;

    return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, token) => {
      return values[token] == null ? '' : String(values[token]);
    });
  }

  changeLanguage(language) {
    this.language = language;
    this.emit('languageChanged', language);
    return Promise.resolve(language);
  }

  on(event, handler) {
    const handlers = this.events.get(event) || new Set();
    handlers.add(handler);
    this.events.set(event, handlers);
    return this;
  }

  off(event, handler) {
    const handlers = this.events.get(event);
    if (handlers) handlers.delete(handler);
    return this;
  }

  emit(event, payload) {
    const handlers = this.events.get(event);
    if (!handlers) return;
    handlers.forEach((handler) => handler(payload));
  }
}

const i18n = new I18n();

export default i18n;
