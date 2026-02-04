import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation('common');
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="text-center">
        <h1
          className="text-4xl font-bold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('notFound.title')}
        </h1>
        <p
          className="text-xl mb-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          {t('notFound.message')}
        </p>
        <a
          href="/"
          className="underline"
          style={{ color: 'var(--accent-primary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--accent-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--accent-primary)';
          }}
        >
          {t('notFound.backHome')}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
