import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ReceiptText, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/auth.store';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleDemoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Quick demo login for Milestone 0
    setAuth(
      { id: 'demo-user-id', name: 'Demo Administrator', email: 'admin@bizinvoice.local' },
      'demo-jwt-token'
    );
    toast.success('Welcome back! Signed in successfully.');
    navigate('/dashboard');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'radial-gradient(ellipse at top, #1a233b 0%, var(--bg-app) 70%)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginBottom: '0.75rem',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            }}
          >
            <ReceiptText size={26} />
          </div>
          <h2>Welcome back</h2>
          <p style={{ marginTop: '0.25rem' }}>Sign in to manage your commercial operations</p>
        </div>

        <Card>
          <form onSubmit={handleDemoLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email address</label>
              <input
                type="email"
                defaultValue="admin@bizinvoice.local"
                required
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Password</label>
              <input
                type="password"
                defaultValue="password123"
                required
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                }}
              />
            </div>

            <Button type="submit" variant="primary" icon={<LogIn size={16} />}>
              Sign In
            </Button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
            <Link to="/register" style={{ fontWeight: 500 }}>Create an account</Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
