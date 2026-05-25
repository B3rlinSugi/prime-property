'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function SettingsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  // Change password form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Keyboard shortcut listener (Request 18 - press / to focus first input on pages)
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/agent/login');
    }
  }, [authStatus, router]);

  if (authStatus === 'loading') {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Memuat profil pengaturan...</p>
      </div>
    );
  }

  if (!session || !session.user) return null;

  const user = session.user;

  // Get Avatar Initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getRoleLabel = (role: string) => {
    return role === 'SUPERADMIN' ? 'Superadmin' : 'Admin';
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    // Client-side validations
    if (!oldPassword) {
      setErrorMessage('Kata sandi saat ini wajib diisi.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('Kata sandi baru minimal 8 karakter.');
      return;
    }
    
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (!hasUppercase || !hasNumber) {
      setErrorMessage('Kata sandi baru harus mengandung setidaknya satu huruf besar dan satu angka.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const json = await res.json();

      if (res.ok) {
        setSuccessMessage('Kata sandi berhasil diperbarui.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMessage(json.message || 'Gagal memperbarui kata sandi.');
      }
    } catch (err) {
      console.error('Submit change password error:', err);
      setErrorMessage('Koneksi internet bermasalah. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Pengaturan Akun</h1>
        <p>Kelola rincian keamanan akun, profil agen, dan konfigurasi operasi.</p>
      </div>

      <div className={styles.grid}>
        {/* Profile Card */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Profil Pengguna</div>
          <div className={styles.profileWrapper}>
            <div className={styles.avatar}>{getInitials(user.name)}</div>
            <div className={styles.profileName}>{user.name}</div>
            <div className={styles.profileEmail}>{user.email}</div>
            <div className={styles.roleBadge}>{getRoleLabel(user.role)}</div>
          </div>

          <div className={styles.profileDetailList}>
            <div className={styles.profileDetailItem}>
              <span className={styles.profileDetailLabel}>ID Pengguna</span>
              <span className={styles.profileDetailValue} style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                {user.id}
              </span>
            </div>
            <div className={styles.profileDetailItem}>
              <span className={styles.profileDetailLabel}>Status Akun</span>
              <span className={styles.profileDetailValue} style={{ color: '#4CAF50' }}>
                🟢 Aktif
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Ubah Kata Sandi</div>
          
          {successMessage && (
            <div className={`${styles.message} ${styles.successMessage}`}>
              {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div className={`${styles.message} ${styles.errorMessage}`}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="oldPassword">
                Kata Sandi Lama
              </label>
              <input
                className={styles.formInput}
                type="password"
                id="oldPassword"
                placeholder="Masukkan kata sandi saat ini"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="newPassword">
                Kata Sandi Baru
              </label>
              <input
                className={styles.formInput}
                type="password"
                id="newPassword"
                placeholder="Minimal 8 karakter, huruf besar & angka"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="confirmPassword">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                className={styles.formInput}
                type="password"
                id="confirmPassword"
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start', marginTop: '8px' }}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Memperbarui...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
