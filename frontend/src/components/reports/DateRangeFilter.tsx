import React from 'react';
import { Calendar, RotateCcw } from 'lucide-react';
import type { DatePreset, ReportFilter } from '../../api/reports.api';

interface DateRangeFilterProps {
  filter: ReportFilter;
  onChange: (filter: ReportFilter) => void;
  hideDates?: boolean;
}

const presets: Array<{ id: DatePreset; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'this_week', label: 'This Week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'this_year', label: 'This Year' },
  { id: 'custom', label: 'Custom' },
];

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  filter,
  onChange,
  hideDates = false,
}) => {
  const currentPreset = filter.preset || (filter.startDate ? 'custom' : 'this_month');

  const handlePresetClick = (preset: DatePreset) => {
    if (preset === 'custom') {
      onChange({
        ...filter,
        preset: 'custom',
        startDate: filter.startDate || new Date().toISOString().slice(0, 10),
        endDate: filter.endDate || new Date().toISOString().slice(0, 10),
      });
    } else {
      onChange({
        preset,
        startDate: undefined,
        endDate: undefined,
      });
    }
  };

  const handleReset = () => {
    onChange({ preset: 'this_month' });
  };

  if (hideDates) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '0.85rem 1.25rem',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Preset Pills */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginRight: '0.5rem',
          }}
        >
          <Calendar size={15} style={{ color: 'var(--primary-500)' }} />
          Period:
        </span>

        {presets.map((p) => {
          const isActive = currentPreset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handlePresetClick(p.id)}
              type="button"
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.825rem',
                fontWeight: isActive ? 600 : 500,
                backgroundColor: isActive ? 'var(--primary-500)' : 'var(--bg-surface)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${isActive ? 'var(--primary-500)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Custom Date Pickers */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
        {currentPreset === 'custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="date"
              value={filter.startDate || ''}
              onChange={(e) => onChange({ ...filter, preset: 'custom', startDate: e.target.value })}
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.825rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
              }}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>to</span>
            <input
              type="date"
              value={filter.endDate || ''}
              onChange={(e) => onChange({ ...filter, preset: 'custom', endDate: e.target.value })}
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.825rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        )}

        <button
          onClick={handleReset}
          type="button"
          title="Reset to This Month"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.4rem 0.75rem',
            fontSize: '0.8rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
            backgroundColor: 'transparent',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={13} />
          Reset
        </button>
      </div>
    </div>
  );
};
