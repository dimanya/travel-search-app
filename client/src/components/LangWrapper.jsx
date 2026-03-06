import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useI18n } from '../i18n';

/**
 * Syncs the i18n language from the URL /:lang/ prefix.
 * Wraps children and forces the correct lang context.
 */
export default function LangWrapper({ children }) {
  const { lang: urlLang } = useParams();
  const { setLang } = useI18n();

  React.useEffect(() => {
    if (urlLang === 'ru' || urlLang === 'en') {
      setLang(urlLang);
    }
  }, [urlLang, setLang]);

  return <>{children}</>;
}
