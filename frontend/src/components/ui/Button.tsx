import React from 'react';
import styles from './ui.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  icon,
  className = '',
  ...props
}) => {
  const variantClass =
    variant === 'primary'
      ? styles.buttonPrimary
      : variant === 'secondary'
      ? styles.buttonSecondary
      : styles.buttonDanger;

  return (
    <button className={`${styles.button} ${variantClass} ${className}`} {...props}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};
