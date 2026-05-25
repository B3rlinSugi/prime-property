'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatTanggalWaktu } from '@/lib/utils';
import styles from './page.module.css';

interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESET_PASSWORD';
  entity: 'PROPERTY' | 'USER';
  entityId: string;
  changes: string | null; // JSON string
  userId: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export default function AuditLogPage() {
  return (
    <Suspense fallback={<div className="loading-state"><div className="spinner"></div><p>Memuat audit log...</p></div>}>
      <AuditLogPageContent />
    </Suspense>
  );
}

function AuditLogPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Validate SUPERADMIN role
  const isSuperadmin = session?.user?.role === 'SUPERADMIN';

  // UI States
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Active details modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Filter parameters
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [limit, setLimit] = useState(parseInt(searchParams.get('limit') || '50', 10));
  const [action, setAction] = useState(searchParams.get('action') || ''); // Semua | CREATE | UPDATE | DELETE | RESET_PASSWORD
  const [entity, setEntity] = useState(searchParams.get('entity') || ''); // Semua | PROPERTY | USER

  // Fetch audit logs on filter changes
  useEffect(() => {
    async function fetchLogs() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', limit.toString());
        if (action) params.set('action', action);
        if (entity) params.set('entity', entity);

        // Sync to URL address bar
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({ path: newUrl }, '', newUrl);

        const res = await fetch(`/api/audit-logs?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setLogs(json.data || []);
          setTotalCount(json.pagination?.total || 0);
        } else {
          setError('Gagal memuat log audit.');
        }
      } catch (err) {
        console.error(err);
        setError('Koneksi gagal. Silakan coba kembali.');
      } finally {
        setIsLoading(false);
      }
    }

    if (status === 'authenticated' && isSuperadmin) {
      fetchLogs();
    }
  }, [page, limit, action, entity, status, isSuperadmin]);

  // Auth redirects
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/agent/login');
    }
  }, [status, router]);

  // Formatting helpers
  const getActionBadgeClass = (act: string) => {
    switch (act) {
      case 'CREATE':
        return 'badge-in-stock'; // green
      case 'UPDATE':
        return 'badge-siap-huni'; // gold
      case 'DELETE':
        return 'badge-sold-out'; // red
      case 'RESET_PASSWORD':
        return 'badge-siap-kosong'; // purple
      default:
        return 'badge-secondary';
    }
  };

  const getEntityLabel = (ent: string) => {
    return ent === 'PROPERTY' ? 'Properti' : 'Pengguna';
  };

  // Safe JSON changes parser
  const parseChanges = (changesStr: string | null) => {
    if (!changesStr) return {};
    try {
      return JSON.parse(changesStr);
    } catch {
      return {};
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
          Maaf, halaman riwayat aktivitas (Audit Log) hanya dapat diakses oleh akun dengan wewenang SUPERADMIN.
        </p>
        <button className="btn btn-secondary" style={{ marginTop: '24px' }} onClick={() => router.push('/agent/dashboard')}>
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.header}>
        <h1 className={styles.title}>Riwayat Aktivitas (Audit Log)</h1>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '180px' }}>
          <label htmlFor="action" className="form-label" style={{ fontSize: '0.8rem' }}>Filter Aksi</label>
          <div className="form-select-wrapper">
            <select 
              id="action" 
              className="form-select"
              value={action}
              onChange={(e) => { setAction(e.target.value); setPage(1); }}
            >
              <option value="">Semua Aksi</option>
              <option value="CREATE">CREATE (Tambah)</option>
              <option value="UPDATE">UPDATE (Ubah)</option>
              <option value="DELETE">DELETE (Hapus)</option>
              <option value="RESET_PASSWORD">RESET_PASSWORD</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '180px' }}>
          <label htmlFor="entity" className="form-label" style={{ fontSize: '0.8rem' }}>Filter Objek</label>
          <div className="form-select-wrapper">
            <select 
              id="entity" 
              className="form-select"
              value={entity}
              onChange={(e) => { setEntity(e.target.value); setPage(1); }}
            >
              <option value="">Semua Objek</option>
              <option value="PROPERTY">Properti (Ruko/Villa)</option>
              <option value="USER">Pengguna (Admin/Agent)</option>
            </select>
          </div>
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={() => { setAction(''); setEntity(''); setPage(1); }}
        >
          Reset Filter
        </button>
      </div>

      {/* Audit Log Table */}
      <div className={styles.tableCard}>
        {isLoading ? (
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '16px', color: 'var(--color-text-secondary)' }}>Memuat data aktivitas...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-accent-red)' }}>
            {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="table-empty" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📝</div>
            <h3>Belum Ada Riwayat Aktivitas</h3>
            <p>Aktivitas penambahan, perubahan, dan penghapusan data akan terekam di halaman ini.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Tanggal & Waktu</th>
                  <th>Aktor (Admin)</th>
                  <th>Aksi</th>
                  <th>Objek</th>
                  <th>ID Objek</th>
                  <th>Detail Perubahan</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const hasDetail = log.changes && log.changes !== 'null';

                  return (
                    <tr key={log.id}>
                      <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{formatTanggalWaktu(log.createdAt)}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{log.user?.name || 'Super Admin'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{log.user?.email}</div>
                      </td>
                      <td>
                        <span className={`badge ${getActionBadgeClass(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-secondary" style={{ opacity: 0.9 }}>
                          {getEntityLabel(log.entity)}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        {log.entityId}
                      </td>
                      <td>
                        {hasDetail ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className={styles.changesWrapper}>{log.changes}</div>
                            <button 
                              className={styles.viewDetailBtn}
                              onClick={() => setSelectedLog(log)}
                            >
                              Lihat Detail
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-light)', fontStyle: 'italic' }}>Tidak ada detail</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {!isLoading && logs.length > 0 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Tampilkan:</span>
            <div className="form-select-wrapper" style={{ width: '80px', marginBottom: 0 }}>
              <select 
                className="form-select" 
                style={{ padding: '6px 24px 6px 12px' }}
                value={limit}
                onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1); }}
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              dari {totalCount} baris
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '8px 16px' }}
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Sebelumnya
            </button>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>
              Halaman {page} dari {Math.ceil(totalCount / limit) || 1}
            </span>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '8px 16px' }}
              disabled={page >= Math.ceil(totalCount / limit)}
              onClick={() => setPage(page + 1)}
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      {/* Detailed Diff Changes Modal */}
      {selectedLog && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Rincian Perubahan Aset</h3>
              <button className="modal-close" onClick={() => setSelectedLog(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px' }}>
                <strong>Aksi:</strong>
                <div>
                  <span className={`badge ${getActionBadgeClass(selectedLog.action)}`}>{selectedLog.action}</span>
                </div>
                <strong>Aktor:</strong>
                <div>{selectedLog.user?.name} ({selectedLog.user?.email})</div>
                <strong>Waktu:</strong>
                <div>{formatTanggalWaktu(selectedLog.createdAt)}</div>
                <strong>ID Aset:</strong>
                <div style={{ fontFamily: 'monospace' }}>{selectedLog.entityId}</div>
              </div>

              {selectedLog.action === 'UPDATE' ? (
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '12px' }}>
                    Daftar Field Yang Berubah:
                  </h4>
                  <table className={styles.diffTable}>
                    <thead>
                      <tr>
                        <th>Field / Kolom</th>
                        <th>Nilai Lama (Sebelum)</th>
                        <th>Nilai Baru (Sesudah)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(parseChanges(selectedLog.changes)).map(([field, diff]: [string, any]) => {
                        const isArrDiff = Array.isArray(diff?.old) || Array.isArray(diff?.new);
                        const oldValDisplay = isArrDiff ? JSON.stringify(diff.old) : diff.old?.toString();
                        const newValDisplay = isArrDiff ? JSON.stringify(diff.new) : diff.new?.toString();

                        return (
                          <tr key={field}>
                            <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.85rem' }}>{field}</td>
                            <td>
                              <span className={styles.oldVal}>{oldValDisplay ?? '—'}</span>
                            </td>
                            <td>
                              <span className={styles.newVal}>{newValDisplay ?? '—'}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '12px' }}>
                    Data Rekaman Aset:
                  </h4>
                  <div style={{ padding: '4px 0' }}>
                    {Object.entries(parseChanges(selectedLog.changes)).map(([key, val]: [string, any]) => (
                      <div key={key} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{key}</strong>
                        <span className={styles.simpleVal}>{val?.toString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={() => setSelectedLog(null)}>
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
