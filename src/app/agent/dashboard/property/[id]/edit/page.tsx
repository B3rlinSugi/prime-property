'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import PropertyForm, { PropertyFormValues } from '@/components/property/PropertyForm';
import { parseJsonArray } from '@/lib/utils';

export default function EditPropertyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  // UI States
  const [initialData, setInitialData] = useState<PropertyFormValues | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Validate SUPERADMIN role
  const isSuperadmin = session?.user?.role === 'SUPERADMIN';

  // Fetch initial property data
  useEffect(() => {
    async function fetchProperty() {
      if (!id) return;
      try {
        const res = await fetch(`/api/properties/${id}`);
        if (res.ok) {
          const json = await res.json();
          // Map backend Property model to form expected initial values
          setInitialData({
            namaProperty: json.namaProperty || '',
            group: json.group || '',
            lebar: json.lebar?.toString() || '',
            panjang: json.panjang?.toString() || '',
            hadap: parseJsonArray(json.hadap),
            tipe: json.tipe || 'VILLA',
            tingkat: json.tingkat?.toString() || '1',
            price: json.price || '',
            carport: !!json.carport,
            status: json.status || 'IN_STOCK',
            siap: json.siap || 'SIAP_HUNI',
            mapsLink: json.mapsLink || '',
            kawasan: parseJsonArray(json.kawasan),
            unit: json.unit || '',
          });
        } else {
          setError('Properti tidak ditemukan atau gagal memuat data.');
        }
      } catch (err) {
        console.error(err);
        setError('Koneksi gagal saat memuat data properti.');
      } finally {
        setIsFetching(false);
      }
    }

    if (status === 'authenticated') {
      fetchProperty();
    }
  }, [id, status]);

  // Auth check redirects
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/agent/login');
    }
  }, [status, router]);

  const handleSubmit = async (values: PropertyFormValues) => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          lebar: parseFloat(values.lebar),
          panjang: parseFloat(values.panjang),
          tingkat: parseFloat(values.tingkat),
          price: parseInt(values.price, 10),
        }),
      });

      if (response.ok) {
        // Redirection
        router.push('/agent/dashboard');
      } else {
        const json = await response.json();
        setError(json.message || 'Gagal menyimpan perubahan properti.');
      }
    } catch (err) {
      console.error(err);
      setError('Koneksi gagal. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || (isFetching && !error)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '16px', color: 'var(--color-text-secondary)' }}>Memuat data properti...</p>
      </div>
    );
  }

  if (!isSuperadmin) {
    return (
      <div className="container" style={{ maxWidth: '600px', textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🚫</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-accent-red)' }}>Akses Ditolak</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '12px', lineHeight: 1.6 }}>
          Maaf, akun Anda tidak memiliki hak akses (SUPERADMIN) untuk menyunting unit properti. 
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
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
          Sunting Properti
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Silakan sesuaikan data unit ruko atau villa premium yang ingin diubah.
        </p>
      </div>

      {error && (
        <div className="toast-container" style={{ position: 'static', transform: 'none', marginBottom: '24px', maxWidth: '1000px', margin: '0 auto 24px' }}>
          <div className="toast toast-error" style={{ width: '100%' }}>
            <span>{error}</span>
          </div>
        </div>
      )}

      {initialData && (
        <PropertyForm 
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          submitLabel="Simpan Perubahan"
        />
      )}
    </div>
  );
}
