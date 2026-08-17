import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==========================================
// 1. TYPES & DICTIONARIES
// ==========================================

export interface LanguageInfo {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  flagEmoji: string;
}

export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'pt' | 'nl' | 'yo' | 'ha' | 'ig';

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flagEmoji: '🇬🇧' },
  { code: 'nl', label: 'Dutch', nativeLabel: 'Nederlands', flagEmoji: '🇳🇱' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', flagEmoji: '🇵🇹' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', flagEmoji: '🇩🇪' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', flagEmoji: '🇫🇷' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', flagEmoji: '🇪🇸' },
  { code: 'yo', label: 'Yoruba', nativeLabel: 'Yorùbá', flagEmoji: '🇳🇬' },
  { code: 'ha', label: 'Hausa', nativeLabel: 'Hausa', flagEmoji: '🇳🇬' },
  { code: 'ig', label: 'Igbo', nativeLabel: 'Asụsụ Igbo', flagEmoji: '🇳🇬' },
];

/**
 * Translation Dictionary Schema
 */
type TranslationDictionary = Record<string, string>;

const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    welcome: 'Welcome back, {name}!',
    driverArrived: 'Driver Has Arrived',
    meetAtPickup: 'Meet your driver at pickup point',
    whereTo: 'Where to go?',
    confirmPickup: 'Confirm Pickup',
    requestRide: 'Request Ride',
    callDriver: 'Call Driver',
    chatDriver: 'Chat',
    walkingOut: "I'm Walking Out Now",
    cancelRide: 'Cancel Ride',
    ridePin: 'RIDE PIN',
  },
  fr: {
    welcome: 'Bon retour, {name} !',
    driverArrived: 'Le chauffeur est arrivé',
    meetAtPickup: 'Retrouvez votre chauffeur au point de prise en charge',
    whereTo: 'Où allez-vous ?',
    confirmPickup: 'Confirmer la prise en charge',
    requestRide: 'Commander la course',
    callDriver: 'Appeler',
    chatDriver: 'Discuter',
    walkingOut: "J'arrive maintenant",
    cancelRide: 'Annuler la course',
    ridePin: 'CODE PIN',
  },
  es: {
    welcome: '¡Bienvenido de nuevo, {name}!',
    driverArrived: 'El conductor ha llegado',
    meetAtPickup: 'Reúnete con tu conductor en el punto de recogida',
    whereTo: '¿A dónde vas?',
    confirmPickup: 'Confirmar recogida',
    requestRide: 'Solicitar viaje',
    callDriver: 'Llamar',
    chatDriver: 'Chatear',
    walkingOut: 'Ya salgo',
    cancelRide: 'Cancelar viaje',
    ridePin: 'PIN DE VIAJE',
  },
  de: {},
  pt: {},
  nl: {},
  yo: {
    welcome: 'Kú àbọ̀, {name}!',
    driverArrived: 'Owakọ ti dé',
    meetAtPickup: 'Pàdé owakọ rẹ ní ibi ti a ti ń mútẹ́',
    whereTo: 'Nibo lo n lọ?',
    confirmPickup: 'Fọwọ́sí Ibi Mú',
    requestRide: 'Tọrọ Irìn Àjò',
    callDriver: 'Pè Owakọ',
    chatDriver: 'Sọ̀rọ̀',
    walkingOut: 'Mò ń bọ̀ níta nísinyìí',
    cancelRide: 'Fagilee Irìn Àjò',
    ridePin: 'PIN IRÌN ÀJÒ',
  },
  ha: {
    welcome: 'Barka da dawowa, {name}!',
    driverArrived: 'Maikada Yazo',
    meetAtPickup: 'Haɗu da matukin jirgi a wurin ɗaukar kaya',
    whereTo: 'Ina zaka je?',
    confirmPickup: 'Tabbatar da Dauka',
    requestRide: 'Nemi Tafiya',
    callDriver: 'Kira Matuki',
    chatDriver: 'Yi Magana',
    walkingOut: 'Ina Fitowa Yanzu',
    cancelRide: 'Soke Tafiya',
    ridePin: 'PIN TAFIYA',
  },
  ig: {
    welcome: 'Nnọọ ọzọ, {name}!',
    driverArrived: 'Onye ọkwọ ụgbọ ala abịala',
    meetAtPickup: 'Zute onye ọkwọ ụgbọ ala gị ebe a na-anata',
    whereTo: 'Ebee ka ị na-aga?',
    confirmPickup: 'Gbaa mbọ na iburu',
    requestRide: 'Rịọ Njem',
    callDriver: 'Kpọọ Onye Ọkwọ Ụgbọ',
    chatDriver: 'Kparịta ụka',
    walkingOut: 'A na m apụta ugbu a',
    cancelRide: 'Kagbuo Njem',
    ridePin: 'PIN NJEM',
  },
};

// ==========================================
// 2. CONTEXT INTERFACE
// ==========================================

export interface LanguageContextType {
  /** Currently selected language code */
  language: SupportedLanguage;
  /** Active language metadata */
  currentLanguageInfo: LanguageInfo;
  /** List of available languages */
  supportedLanguages: LanguageInfo[];
  /** Translation function accepting key and optional dynamic interpolation variables */
  t: (key: string, params?: Record<string, string | number>) => string;
  /** Change current app language and save to storage */
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  /** Indicates if language settings are loading from disk */
  isLoading: boolean;
  /** Backward-compatible aliases used by older screens. */
  currentLanguage: SupportedLanguage;
  changeLanguage: (lang: SupportedLanguage) => Promise<void>;
}

const STORAGE_KEY = '@spleaz_language_code';

// ==========================================
// 3. CONTEXT CREATION & PROVIDER
// ==========================================

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load language preference from persistent storage
  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedLang && savedLang in translations) {
          setLanguageState(savedLang as SupportedLanguage);
        }
      } catch (error) {
        console.error('Failed to load language preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedLanguage();
  }, []);

  // Update and persist language setting
  const setLanguage = useCallback(async (newLang: SupportedLanguage) => {
    try {
      setLanguageState(newLang);
      await AsyncStorage.setItem(STORAGE_KEY, newLang);
    } catch (error) {
      console.error('Failed to persist language setting:', error);
    }
  }, []);

  // Translation helper lookup with string interpolation support
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const activeDict = translations[language] || translations.en;
      let text = activeDict[key] || translations.en[key] || key;

      if (params) {
        Object.keys(params).forEach((paramKey) => {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(params[paramKey]));
        });
      }

      return text;
    },
    [language]
  );

  const currentLanguageInfo =
    SUPPORTED_LANGUAGES.find((item) => item.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        currentLanguageInfo,
        supportedLanguages: SUPPORTED_LANGUAGES,
        t,
        setLanguage,
        isLoading,
        currentLanguage: language,
        changeLanguage: setLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// ==========================================
// 4. CUSTOM HOOK
// ==========================================

/**
 * Hook to access language translations and language switches
 */
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;