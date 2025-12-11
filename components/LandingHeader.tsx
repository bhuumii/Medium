'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';

type LandingHeaderProps = {
  session: any;
  onSignInClick?: () => void;
  onGetStartedClick?: () => void;
};

export default function LandingHeader({ session, onSignInClick, onGetStartedClick }: LandingHeaderProps) {
  const isAuthenticated = !!session?.user;

  return (
    <header style={{
      background: '#F7F4ED',
      borderBottom: '1px solid #242424',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        
        {/* Logo */}
        <Link 
          href="/"
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: '32px',
            fontWeight: '400',
            color: '#242424',
            textDecoration: 'none',
            letterSpacing: '-0.02em'
          }}
        >
          Medium
        </Link>

        {/* Right Side Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {isAuthenticated ? (
            <>
              <Link
                href="/editor"
                style={{
                  fontSize: '14px',
                  color: '#242424',
                  textDecoration: 'none',
                  fontWeight: '400'
                }}
              >
                Write
              </Link>
              
              <Link
                href="/home"
                className="pill-button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 16px',
                  backgroundColor: '#242424',
                  color: 'white',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: '400',
                  textDecoration: 'none',
                }}
              >
                Go to app
              </Link>
              
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                style={{
                  fontSize: '14px',
                  color: '#242424',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '400'
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onSignInClick}
                style={{
                  fontSize: '14px',
                  color: '#242424',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '400'
                }}
              >
                Sign in
              </button>
              
              <button
                onClick={onGetStartedClick}
                className="pill-button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 16px',
                  backgroundColor: '#242424',
                  color: 'white',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: '400',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Get started
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hover styles */}
      <style jsx>{`
        .pill-button {
          transition: background-color 0.2s;
        }
        .pill-button:hover {
          background-color: #000 !important;
        }
      `}</style>
    </header>
  );
}
