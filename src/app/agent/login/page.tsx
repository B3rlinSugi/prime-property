'use client';

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function AgentLoginPage() {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Field validation state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  function validateForm(): boolean {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email wajib diisi.');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Format email tidak valid.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password wajib diisi.');
      isValid = false;
    }

    return isValid;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (!result) {
        setError('Terjadi kesalahan. Silakan coba lagi.');
        return;
      }

      if (result.error) {
        if (result.error.includes('ACCOUNT_LOCKED')) {
          setError('Akun terkunci sementara. Silakan coba lagi dalam 15 menit.');
        } else if (result.error === 'CredentialsSignin') {
          setError('Email atau password salah.');
        } else {
          setError('Terjadi kesalahan. Silakan coba lagi.');
        }
        return;
      }

      if (result.ok) {
        router.push('/agent/dashboard');
        router.refresh();
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.loginPage}>
      {/* Left branding panel — desktop only */}
      <aside className={styles.brandingPanel}>
        <div className={styles.brandingContent}>
          <h1 className={styles.brandingLogo}>
            PRIME{' '}
            <span className={styles.brandingLogoAccent}>PROPERTY</span>
          </h1>
          <hr className={styles.brandingDivider} />
          <p className={styles.brandingTagline}>Portal Agent Internal</p>
          <p className={styles.brandingSubtext}>
            Kelola properti, pantau listing, dan akses dashboard agent Anda dari satu tempat.
          </p>
        </div>
      </aside>

      {/* Right form panel */}
      <div className={styles.formPanel}>
        {/* Mobile header */}
        <div className={styles.mobileHeader}>
          <span className={styles.mobileHeaderLogo}>
            PRIME <span className={styles.mobileHeaderAccent}>PROPERTY</span>
          </span>
        </div>

        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>Masuk ke Dashboard</h2>
          <p className={styles.formSubtitle}>
            Silakan masuk dengan akun agent Anda
          </p>

          {/* Global error alert */}
          {error && (
            <div className={styles.errorAlert} role="alert">
              <svg
                className={styles.errorAlertIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {/* Email field */}
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>
                Email
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="email"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  className={`${styles.formInput} ${emailError ? styles.formInputError : ''}`}
                  disabled={isLoading}
                />
              </div>
              {emailError && (
                <span className={styles.fieldError}>{emailError}</span>
              )}
            </div>

            {/* Password field */}
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>
                Password
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  className={`${styles.formInput} ${styles.passwordInput} ${passwordError ? styles.formInputError : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? (
                    /* Eye-off icon */
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    /* Eye icon */
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && (
                <span className={styles.fieldError}>{passwordError}</span>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner} />
                  <span>Memproses...</span>
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
