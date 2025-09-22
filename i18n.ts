import {getRequestConfig} from 'next-intl/server';
 
export const locales = ['en', 'fr'] as const;
export const defaultLocale = 'en';

type Locale = typeof locales[number];

const isProduction = process.env.NODE_ENV === 'production';

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!((locales as readonly string[]).includes(locale))) {
    if (!isProduction) {
      console.warn(`Locale non supportée: ${locale}. Utilisation de la locale par défaut: ${defaultLocale}`);
    }
    locale = defaultLocale; // Fallback to default locale
  }

  try {
    return {
      messages: (await import(`./messages/${locale}.json`)).default
    };
  } catch (error) {
    if (!isProduction) {
      console.error(`Erreur lors du chargement des messages pour la locale ${locale}:`, error);
    }
    // Fallback to default locale messages if specific locale messages fail to load
    return {
      messages: (await import(`./messages/${defaultLocale}.json`)).default
    };
  }
});

