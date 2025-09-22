import {getRequestConfig} from 'next-intl/server';
 
export const locales = ['en', 'fr'];
export const defaultLocale = 'en';

export default getRequestConfig(async ({locale}) => {
  return {
    messages: (await import(`./messages/${locale}.json`)).default
  };
});

