import { Injectable, signal, computed } from '@angular/core';
import { Lang, Translations, TRANSLATIONS } from '../i18n/translations';

const STORAGE_KEY = 'af_lang';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private _lang = signal<Lang>(this.saved());

  readonly lang = this._lang.asReadonly();
  readonly t = computed<Translations>(() => TRANSLATIONS[this._lang()]);

  private saved(): Lang {
    if (typeof localStorage === 'undefined') return 'sq';
    return (localStorage.getItem(STORAGE_KEY) as Lang) ?? 'sq';
  }

  setLang(lang: Lang): void {
    this._lang.set(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  }

  toggle(): void {
    this.setLang(this._lang() === 'sq' ? 'en' : 'sq');
  }

  /** Replace {n} or {handle} placeholders */
  p(key: keyof Translations, vars: Record<string, string | number> = {}): string {
    let str = this.t()[key] as string;
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v));
    }
    return str;
  }
}
