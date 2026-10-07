import React from 'react';
import styles from './ui.module.css';

interface CardProps {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, action, children, className = '' }) => {
  return (
    <div className={`${styles.card} ${className}`}>
      {(title || action) && (
        <div className={styles.cardHeader}>
          {title && <h3 className={styles.cardTitle}>{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
