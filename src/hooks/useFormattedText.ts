import { useCallback } from 'react';
import useLanguage from '@/store/useLanguage';
import { formatVietnameseText } from '@/utils/string';

/**
 * Hook to format Vietnamese text based on current language
 * Automatically removes diacritics for EN/JA languages
 * @returns Formatter function that takes Vietnamese text and returns formatted text
 */
export const useFormattedText = () => {
  const { lang } = useLanguage();

  const formatText = useCallback(
    (text: string | null | undefined): string => {
      if (!text) return '';
      return formatVietnameseText(text, lang);
    },
    [lang]
  );

  return { formatText, currentLang: lang };
};
