'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
};

export default function AuthModal({ isOpen, onClose, mode: initialMode }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/home' });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      // Register
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.error || 'Registration failed');
        }

        // Auto sign-in after registration
        const loginRes = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (!loginRes || loginRes.error) {
          setError(loginRes?.error || 'Failed to sign in');
          setLoading(false);
          return;
        }

        router.push('/home');
        router.refresh();
      } catch (err: any) {
        setError(err?.message || 'Something went wrong');
        setLoading(false);
      }
    } else {
      // Sign in
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      setLoading(false);

      if (!res || res.error) {
        setError('Invalid email or password');
        return;
      }

      router.push('/home');
      router.refresh();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 9998,
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '48px',
          width: '90%',
          maxWidth: '460px',
          zIndex: 9999,
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            fontSize: '28px',
            cursor: 'pointer',
            color: '#757575',
            lineHeight: '1',
          }}
        >
          ×
        </button>

        {/* Title */}
        <h2
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: '28px',
            fontWeight: '400',
            marginBottom: '32px',
            textAlign: 'center',
            color: '#242424',
          }}
        >
          {mode === 'signin' ? 'Welcome back.' : 'Join Medium.'}
        </h2>

        {/* Google Sign-in Button */}
        <button
          onClick={handleGoogleSignIn}
          style={{
            width: '100%',
            padding: '12px 24px',
            border: '1px solid #242424',
            borderRadius: '999px',
            backgroundColor: 'white',
            fontSize: '14px',
            fontWeight: '400',
            cursor: 'pointer',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          
          <span>{mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}</span>
        </button>

        {/* Divider */}
        <div
          style={{
            textAlign: 'center',
            margin: '24px 0',
            color: '#757575',
            fontSize: '14px',
          }}
        >
          or
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} style={{ marginBottom: '16px' }}>
          {mode === 'signup' && (
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <div
              style={{
                color: '#c94a4a',
                fontSize: '13px',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 24px',
              backgroundColor: '#242424',
              color: 'white',
              border: 'none',
              borderRadius: '999px',
              fontSize: '14px',
              fontWeight: '400',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        {/* Toggle mode */}
        <div style={{ textAlign: 'center', fontSize: '13px', color: '#757575' }}>
          {mode === 'signin' ? (
            <>
              No account?{' '}
              <button
                onClick={() => setMode('signup')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1a8917',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  fontSize: '13px',
                }}
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('signin')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1a8917',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  fontSize: '13px',
                }}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
