import React from 'react';
import styles from './ui.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
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

  const sizeClass =
    size === 'sm'
      ? styles.buttonSm
      : size === 'lg'
      ? styles.buttonLg
      : '';

  return (
    <button className={`${styles.button} ${variantClass} ${sizeClass} ${className}`} {...props}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};
