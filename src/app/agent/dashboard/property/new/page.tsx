'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PropertyForm, { PropertyFormValues } from '@/components/property/PropertyForm';

export default function NewPropertyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Validate SUPERADMIN role
  const isSuperadmin = session?.user?.role === 'SUPERADMIN';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/agent/login');
    }
  }, [status, router]);

  const handleSubmit = async (values: PropertyFormValues) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          // parseFloat/parseInt for safe storage
          lebar: parseFloat(values.lebar),
          panjang: parseFloat(values.panjang),
          tingkat: parseFloat(values.tingkat),
          price: parseInt(values.price, 10),
        }),
      });

      if (response.ok) {
        const json = await response.json();
        // Store the newly created property ID to trigger highlight on listing page
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('newlyCreatedPropertyId', json.id);
        }
        router.push('/agent/dashboard');
      } else {
        const json = await response.json();
        setError(json.message || 'Gagal menyimpan properti baru.');
      }
    } catch (err) {
      console.error(err);
      setError('Koneksi gagal. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
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
          Maaf, akun Anda tidak memiliki hak akses (SUPERADMIN) untuk menambah unit properti baru. 
          Silakan hubungi administrator utama jika Anda yakin ini adalah kesalahan.
        </p>
        <button className="btn btn-secondary" style={{ marginTop: '24px' }} onClick={() => router.push('/agent/dashboard')}>
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ maxWidth: '1000px', margin: '0 auto 24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>
          Tambah Properti Baru
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Silakan lengkapi formulir di bawah untuk menambahkan unit ruko atau villa baru ke portal.
        </p>
      </div>

      {error && (
        <div className="toast-container" style={{ position: 'static', transform: 'none', marginBottom: '24px', maxWidth: '1000px', margin: '0 auto 24px' }}>
          <div className="toast toast-error" style={{ width: '100%' }}>
            <span>{error}</span>
          </div>
        </div>
      )}

      <PropertyForm 
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Simpan Properti"
      />
    </div>
  );
}
