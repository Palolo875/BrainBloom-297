import {getRequestConfig} from 'next-intl/server';
import { logger } from './lib/utils/logger';
 
export const locales = ['en', 'fr'] as const;
export const defaultLocale = 'en';

type Locale = typeof locales[number];

const isValidLocale = (l: string): l is Locale => (locales as readonly string[]).includes(l);

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!isValidLocale(locale)) {
    logger.warn(`Locale non supportée: ${locale}. Utilisation de la locale par défaut: ${defaultLocale}`);
    locale = defaultLocale; // Fallback to default locale
  }

  try {
    return {
      messages: (await import(`./messages/${locale}.json`)).default
    };
  } catch (error) {
    logger.error(`Erreur lors du chargement des messages pour la locale ${locale}:`, error);
    // Fallback to default locale messages if specific locale messages fail to load
    return {
      messages: (await import(`./messages/${defaultLocale}.json`)).default
    };
  }
});

