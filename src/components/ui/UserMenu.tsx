import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { LogOut, Palette, Check, ChevronDown, User } from 'lucide-react';

interface UserMenuProps {
  userEmail: string | undefined;
  displayName?: string;
  onSignOut: () => void;
  variant?: 'light' | 'dark'; // light dla jasnych headerów, dark dla ciemnych
}

const UserMenu: React.FC<UserMenuProps> = ({
  userEmail,
  displayName,
  onSignOut,
  variant = 'dark',
}) => {
  const { currentTheme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Zamknij menu po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowThemes(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Skróć email do wyświetlenia
  const shortEmail = userEmail ? userEmail.split('@')[0] : 'Użytkownik';
  const displayText = displayName || shortEmail;

  // Renderuj podgląd kolorów motywu
  const renderColorPreview = (theme: typeof currentTheme) => (
    <div className="flex gap-0.5 shrink-0">
      <div
        className="w-3 h-3 rounded-l-sm"
        style={{ backgroundColor: theme.colors.accentPrimary }}
      />
      <div
        className="w-3 h-3"
        style={{ backgroundColor: theme.colors.sidebarBg }}
      />
      <div
        className="w-3 h-3 rounded-r-sm border"
        style={{
          backgroundColor: theme.colors.bgSecondary,
          borderColor: theme.colors.borderPrimary,
        }}
      />
    </div>
  );

  // Style zależne od wariantu
  const buttonStyles = variant === 'dark'
    ? 'bg-white/10 hover:bg-white/20 text-white border-white/10'
    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200';

  return (
    <div ref={menuRef} className="relative">
      {/* Przycisk menu */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowThemes(false);
        }}
        className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-all border backdrop-blur-md ${buttonStyles}`}
      >
        <User className="w-4 h-4" />
        <span className="hidden sm:inline max-w-[120px] truncate">{displayText}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-64 rounded-xl border py-2 z-50 overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-secondary)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Nagłówek z emailem */}
          <div
            className="px-4 py-3 border-b"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {displayName || 'Użytkownik'}
            </div>
            <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {userEmail}
            </div>
          </div>

          {/* Wybór motywu */}
          <div className="py-1">
            <button
              onClick={() => setShowThemes(!showThemes)}
              className="w-full px-4 py-2.5 flex items-center gap-3 transition-colors"
              style={{ backgroundColor: showThemes ? 'var(--bg-accent)' : 'transparent' }}
              onMouseEnter={(e) => {
                if (!showThemes) e.currentTarget.style.backgroundColor = 'var(--bg-accent)';
              }}
              onMouseLeave={(e) => {
                if (!showThemes) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Palette className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              <span className="flex-1 text-left text-sm" style={{ color: 'var(--text-primary)' }}>
                Motyw
              </span>
              {renderColorPreview(currentTheme)}
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${showThemes ? 'rotate-180' : ''}`}
                style={{ color: 'var(--text-muted)' }}
              />
            </button>

            {/* Lista motywów (rozwijana) */}
            {showThemes && (
              <div
                className="border-t border-b my-1 py-1"
                style={{ borderColor: 'var(--border-primary)' }}
              >
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setTheme(theme.id);
                    }}
                    className="w-full px-4 py-2 flex items-center gap-3 transition-colors"
                    style={{
                      backgroundColor: currentTheme.id === theme.id ? 'var(--accent-light)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (currentTheme.id !== theme.id) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-accent)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        currentTheme.id === theme.id ? 'var(--accent-light)' : 'transparent';
                    }}
                  >
                    {renderColorPreview(theme)}
                    <div className="flex-1 text-left min-w-0">
                      <div
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {theme.name}
                      </div>
                    </div>
                    {currentTheme.id === theme.id && (
                      <Check
                        className="w-4 h-4 shrink-0"
                        style={{ color: 'var(--accent-primary)' }}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Wyloguj */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
              className="w-full px-4 py-2.5 flex items-center gap-3 transition-colors"
              style={{ color: 'var(--error)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--error-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Wyloguj</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
