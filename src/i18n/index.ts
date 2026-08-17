import i18n, { LanguageDetectorAsyncModule } from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en.json';
import fr from './fr.json';
import es from './es.json';
import de from './de.json';
import pt from './pt.json';
import nl from './nl.json';

const yo = en;
const ha = en;
const ig = en;
export const LANGUAGE_STORAGE_KEY = '@spleaz_language_code';
export const DEFAULT_LANGUAGE = 'en';
export const resources = { en:{translation:en}, fr:{translation:fr}, es:{translation:es}, de:{translation:de}, pt:{translation:pt}, nl:{translation:nl}, yo:{translation:yo}, ha:{translation:ha}, ig:{translation:ig} } as const;
export type SupportedLanguageKeys = keyof typeof resources;

const languageDetector: LanguageDetectorAsyncModule = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved && saved in resources) { callback(saved as SupportedLanguageKeys); return saved as SupportedLanguageKeys; }
      const locale = Localization.getLocales()[0]?.languageCode;
      if (locale && locale in resources) { callback(locale as SupportedLanguageKeys); return locale as SupportedLanguageKeys; }
    } catch (error) { console.error('Language detection failed:', error); }
    callback(DEFAULT_LANGUAGE); return DEFAULT_LANGUAGE;
  },
  init: () => undefined,
  cacheUserLanguage: async (lng: string) => {
    try { await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng); }
    catch (error) { console.error('Failed to persist language:', error); }
  },
};

i18n.use(languageDetector).use(initReactI18next).init({
  resources,
  fallbackLng: DEFAULT_LANGUAGE,
  compatibilityJSON: 'v4',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});
export default i18n;
