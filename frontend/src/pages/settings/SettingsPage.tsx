import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const SettingsPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
      <div>
        <h1>Business & System Settings</h1>
        <p>Configure company legal details, tax number, currency, and invoice numbering</p>
      </div>

      <Card title="Business Profile">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Business Name</label>
            <input
              type="text"
              defaultValue="My Commercial Business"
              style={{
                width: '100%',
                marginTop: '0.35rem',
                padding: '0.6rem 0.8rem',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>GST / Tax Number</label>
              <input
                type="text"
                placeholder="22AAAAA0000A1Z5"
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.6rem 0.8rem',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Invoice Prefix</label>
              <input
                type="text"
                defaultValue="INV"
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.6rem 0.8rem',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <Button variant="primary">Save Changes</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
