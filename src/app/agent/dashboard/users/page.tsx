'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatTanggal } from '@/lib/utils';
import styles from './page.module.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SUPERADMIN';
  isActive: boolean;
  createdAt: string;
}

export default function UserManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Validate SUPERADMIN role
  const isSuperadmin = session?.user?.role === 'SUPERADMIN';

  // UI States
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form States (New User)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'SUPERADMIN'>('ADMIN');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Modal States (Reset Password)
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Fetch users on mount
  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const json = await res.json();
          setUsers(json);
        } else {
          setError('Gagal memuat daftar pengguna.');
        }
      } catch (err) {
        console.error(err);
        setError('Koneksi gagal. Silakan coba kembali.');
      } finally {
        setIsLoading(false);
      }
    }

    if (status === 'authenticated' && isSuperadmin) {
      fetchUsers();
    }
  }, [status, isSuperadmin]);

  // Auth check redirects
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/agent/login');
    }
  }, [status, router]);

  // Toast handler
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Add User validation and submission
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Nama wajib diisi.';
    if (!email.trim()) {
      errs.email = 'Email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Format email tidak valid.';
    }
    if (!password || password.length < 6) {
      errs.password = 'Password minimal 6 karakter.';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsCreatingUser(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        }),
      });

      if (res.ok) {
        const newUser = await res.json();
        setUsers([newUser, ...users]);
        showToast('success', `Pengguna "${newUser.name}" berhasil dibuat.`);
        // Reset form
        setName('');
        setEmail('');
        setPassword('');
        setRole('ADMIN');
        setFormErrors({});
      } else {
        const json = await res.json();
        showToast('error', json.message || 'Gagal membuat pengguna baru.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Koneksi gagal saat membuat pengguna baru.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Toggle isActive status
  const handleToggleStatus = async (user: User) => {
    // Prevent superadmin from disabling themselves
    if (user.id === session?.user?.id) {
      showToast('error', 'Anda tidak dapat menonaktifkan akun Anda sendiri.');
      return;
    }

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
      });

      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map((u) => (u.id === user.id ? { ...u, isActive: updated.isActive } : u)));
        showToast(
          'success',
          `Pengguna "${user.name}" sekarang ${updated.isActive ? 'AKTIF' : 'NONAKTIF'}.`
        );
      } else {
        const json = await res.json();
        showToast('error', json.message || 'Gagal mengubah status pengguna.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Koneksi gagal saat mengubah status pengguna.');
    }
  };

  // Reset Password submission
  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetError('');
    setResetSuccessMsg('');

    if (!resetTarget) return;
    if (!newPassword || newPassword.length < 6) {
      setResetError('Password minimal 6 karakter.');
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch(`/api/users/${resetTarget.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      if (res.ok) {
        setResetSuccessMsg(`Password untuk "${resetTarget.name}" berhasil direset.`);
        showToast('success', `Password "${resetTarget.name}" direset.`);
      } else {
        const json = await res.json();
        setResetError(json.message || 'Gagal meriset password.');
      }
    } catch (err) {
      console.error(err);
      setResetError('Koneksi gagal saat meriset password.');
    } finally {
      setIsResetting(false);
    }
  };

  const closeResetModal = () => {
    setResetTarget(null);
    setNewPassword('');
    setResetError('');
    setResetSuccessMsg('');
  };

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '16px', color: 'var(--color-text-secondary)' }}>Memuat data sesi...</p>
      </div>
    );
  }

  if (!isSuperadmin) {
    return (
      <div className="container" style={{ maxWidth: '600px', textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🚫</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-accent-red)' }}>Akses Ditolak</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '12px', lineHeight: 1.6 }}>
          Maaf, halaman pengelolaan akun pengguna (User Management) hanya dapat diakses oleh akun dengan wewenang SUPERADMIN.
        </p>
        <button className="btn btn-secondary" style={{ marginTop: '24px' }} onClick={() => router.push('/agent/dashboard')}>
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
            <span>{toast.message}</span>
            <button className="toast-close" onClick={() => setToast(null)}>&times;</button>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>Pengelolaan Pengguna</h1>
      </div>

      {/* Add User Panel */}
      <div className={styles.addUserSection}>
        <h2 className={styles.addUserTitle}>Tambah Admin Baru</h2>
        <form onSubmit={handleCreateUser} noValidate>
          <div className={styles.addUserGrid}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="name" className="form-label">Nama Lengkap *</label>
              <input 
                type="text" 
                id="name" 
                className={`form-input ${formErrors.name ? 'form-input-error' : ''}`}
                placeholder="Nama..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isCreatingUser}
              />
              {formErrors.name && <span className="form-error">{formErrors.name}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="email" className="form-label">Email *</label>
              <input 
                type="email" 
                id="email" 
                className={`form-input ${formErrors.email ? 'form-input-error' : ''}`}
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isCreatingUser}
              />
              {formErrors.email && <span className="form-error">{formErrors.email}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="password" className="form-label">Password *</label>
              <input 
                type="password" 
                id="password" 
                className={`form-input ${formErrors.password ? 'form-input-error' : ''}`}
                placeholder="Password (min 6 char)..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isCreatingUser}
              />
              {formErrors.password && <span className="form-error">{formErrors.password}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="role" className="form-label">Wewenang *</label>
              <div className="form-select-wrapper">
                <select 
                  id="role" 
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  disabled={isCreatingUser}
                >
                  <option value="ADMIN">Admin (Read-only)</option>
                  <option value="SUPERADMIN">Superadmin (Full CRUD)</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isCreatingUser}
              style={{ height: '46px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isCreatingUser ? 'Menyimpan...' : 'Simpan User'}
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className={styles.userTableCard}>
        {isLoading ? (
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '16px', color: 'var(--color-text-secondary)' }}>Memuat data pengguna...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-accent-red)' }}>
            {error}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Nama Pengguna</th>
                  <th>Email</th>
                  <th>Wewenang</th>
                  <th>Tanggal Terdaftar</th>
                  <th>Status</th>
                  <th>Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === session?.user?.id;

                  return (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>
                        {u.name} {isSelf && <span style={{ color: 'var(--color-accent-gold)', fontStyle: 'italic', fontSize: '0.8rem' }}>(Anda)</span>}
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'SUPERADMIN' ? 'badge-primary' : 'badge-secondary'}`}>
                          {u.role === 'SUPERADMIN' ? 'Superadmin' : 'Admin'}
                        </span>
                      </td>
                      <td>{formatTanggal(u.createdAt)}</td>
                      <td>
                        <button 
                          className={styles.statusToggleBtn}
                          onClick={() => handleToggleStatus(u)}
                          disabled={isSelf}
                          title={isSelf ? 'Anda tidak bisa menonaktifkan akun Anda sendiri' : 'Klik untuk mengubah status aktif'}
                        >
                          <span className={`badge ${u.isActive ? 'badge-in-stock' : 'badge-sold-out'}`}>
                            {u.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </button>
                      </td>
                      <td>
                        <div className={styles.actionCell}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => setResetTarget(u)}
                          >
                            Reset Password
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {resetTarget && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Reset Password</h3>
              <button className="modal-close" onClick={closeResetModal}>&times;</button>
            </div>
            <form onSubmit={handleResetPassword} noValidate>
              <div className="modal-body">
                {resetSuccessMsg ? (
                  <div>
                    <div className="messageBox messageBoxSuccess" style={{ display: 'block', padding: '12px', border: '1px solid #c8e6c9', borderRadius: '6px', color: '#2e7d32', background: '#e8f5e9' }}>
                      {resetSuccessMsg}
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                      Silakan berikan password baru ini kepada agent <strong>{resetTarget.name}</strong>.
                    </p>
                    <div className={styles.resetPwdValue}>
                      <span>{newPassword}</span>
                      <button 
                        type="button" 
                        className={styles.copyBtn}
                        onClick={() => {
                          navigator.clipboard.writeText(newPassword);
                          showToast('success', 'Password disalin ke clipboard.');
                        }}
                      >
                        Salin
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ lineHeight: 1.5, marginBottom: '16px' }}>
                      Reset password untuk akun agent <strong>{resetTarget.name}</strong> ({resetTarget.email}).
                    </p>

                    {resetError && (
                      <div className="messageBox messageBoxError" style={{ display: 'block', padding: '10px', border: '1px solid #ffcdd2', borderRadius: '6px', color: '#c62828', background: '#fdeaea', marginBottom: '12px' }}>
                        {resetError}
                      </div>
                    )}

                    <div className="form-group">
                      <label htmlFor="newPassword" className="form-label">Password Baru *</label>
                      <input 
                        type="text" 
                        id="newPassword" 
                        className="form-input"
                        placeholder="Masukkan password baru..."
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isResetting}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                {resetSuccessMsg ? (
                  <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={closeResetModal}>
                    Selesai
                  </button>
                ) : (
                  <>
                    <button type="button" className="btn btn-secondary" onClick={closeResetModal} disabled={isResetting}>
                      Batal
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isResetting}>
                      {isResetting ? 'Memproses...' : 'Reset Password'}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
