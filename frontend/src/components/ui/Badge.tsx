import React from 'react';
import styles from './ui.module.css';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'info', children }) => {
  const variantClass =
    variant === 'success'
      ? styles.badgeSuccess
      : variant === 'warning'
      ? styles.badgeWarning
      : variant === 'danger'
      ? styles.badgeDanger
      : styles.badgeInfo;

  return <span className={`${styles.badge} ${variantClass}`}>{children}</span>;
};
