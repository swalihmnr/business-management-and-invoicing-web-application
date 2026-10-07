import React from 'react';
import { Menu, User as UserIcon, LogOut, Sun, Moon } from 'lucide-react';
import { useUIStore } from '../../store/ui.store';
import { useAuthStore } from '../../store/auth.store';
import { useThemeStore } from '../../store/theme.store';
import styles from './layout.module.css';

export const TopBar: React.FC = () => {
  const { toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className={styles.topbar}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          className={styles.menuButton}
          onClick={toggleSidebar}
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {user?.name ? `Welcome, ${user.name}` : 'Business Management Portal'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
            transition: 'all 0.15s ease',
          }}
        >
          {theme === 'dark' ? (
            <Sun size={18} color="#f59e0b" />
          ) : (
            <Moon size={18} color="var(--primary-600)" />
          )}
        </button>

        {/* User Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.875rem',
          }}
        >
          <UserIcon size={16} color="var(--primary-500)" />
          <span style={{ color: 'var(--text-secondary)' }}>
            {user?.email || 'admin@business.local'}
          </span>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={logout}
          title="Sign out"
          style={{
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.15s ease',
          }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};
