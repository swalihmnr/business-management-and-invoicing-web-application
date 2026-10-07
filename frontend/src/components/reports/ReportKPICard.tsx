import React from 'react';
import { Card } from '../ui/Card';

export interface ReportKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'cyan';
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
}

const variantStyles = {
  primary: {
    bg: 'rgba(99, 102, 241, 0.12)',
    color: '#6366f1',
    border: 'rgba(99, 102, 241, 0.25)',
  },
  success: {
    bg: 'rgba(16, 185, 129, 0.12)',
    color: '#10b981',
    border: 'rgba(16, 185, 129, 0.25)',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.12)',
    color: '#f59e0b',
    border: 'rgba(245, 158, 11, 0.25)',
  },
  danger: {
    bg: 'rgba(239, 68, 68, 0.12)',
    color: '#ef4444',
    border: 'rgba(239, 68, 68, 0.25)',
  },
  purple: {
    bg: 'rgba(168, 85, 247, 0.12)',
    color: '#a855f7',
    border: 'rgba(168, 85, 247, 0.25)',
  },
  cyan: {
    bg: 'rgba(6, 182, 212, 0.12)',
    color: '#06b6d4',
    border: 'rgba(6, 182, 212, 0.25)',
  },
};

export const ReportKPICard: React.FC<ReportKPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'primary',
  trend,
}) => {
  const currentVariant = variantStyles[variant];

  return (
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem 1.4rem',
        borderRadius: 'var(--radius-lg)',
        border: `1px solid var(--border-subtle)`,
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-card)',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Top row: Label & Icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text-secondary)',
          }}
        >
          {title}
        </span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: currentVariant.bg,
            color: currentVariant.color,
            border: `1px solid ${currentVariant.border}`,
          }}
        >
          <Icon size={19} />
        </div>
      </div>

      {/* Middle: Large Metric Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.35rem' }}>
        <span
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}
        >
          {value}
        </span>
      </div>

      {/* Bottom: Subtitle or Trend indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        {trend && (
          <span
            style={{
              fontWeight: 600,
              color: trend.isPositive ? 'var(--success)' : 'var(--danger)',
            }}
          >
            {trend.value}
          </span>
        )}
        {subtitle && <span>{subtitle}</span>}
      </div>
    </Card>
  );
};
