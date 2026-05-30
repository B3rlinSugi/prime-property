'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatTanggalWaktu } from '@/lib/utils';
import styles from './page.module.css';

interface ContactMessage {
  id: string;
  nama: string;
  email: string;
  nomorHp: string;
  pesan: string;
  createdAt: string;
}

export default function PesanMasukPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Deletion state
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<ContactMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Authenticate check
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/agent/login');
    }
  }, [authStatus, router]);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/contact');
      if (res.ok) {
        const json = await res.json();
        setMessages(json.data || []);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || 'Gagal mengambil pesan masuk.');
      }
    } catch (err: any) {
      console.error('Fetch messages error:', err);
      setError('Koneksi gagal. Silakan periksa jaringan Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchMessages();
    }
  }, [authStatus]);

  // Toast helper
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Delete message
  const handleDelete = async () => {
    if (!confirmDeleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/contact?id=${confirmDeleteTarget.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showToast('success', 'Pesan calon pembeli berhasil dihapus.');
        setMessages(messages.filter((m) => m.id !== confirmDeleteTarget.id));
        setConfirmDeleteTarget(null);
      } else {
        const json = await res.json();
        showToast('error', json.message || 'Gagal menghapus pesan.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Koneksi gagal saat menghapus pesan.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter messages based on search query
  const filteredMessages = messages.filter((msg) => {
    const query = searchQuery.toLowerCase();
    return (
      msg.nama.toLowerCase().includes(query) ||
      msg.email.toLowerCase().includes(query) ||
      msg.nomorHp.includes(query) ||
      msg.pesan.toLowerCase().includes(query)
    );
  });

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Memuat pesan masuk calon pembeli...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Toast Alert */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
            <span>{toast.message}</span>
            <button className="toast-close" onClick={() => setToast(null)}>&times;</button>
          </div>
        </div>
      )}

      {/* Header section */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Pesan Masuk (CRM Inbox)</h1>
          <p className={styles.subtitle}>Kelola leads calon pembeli potensial secara langsung dari database.</p>
        </div>
        <div className={styles.countBadge}>{filteredMessages.length} Leads</div>
      </div>

      {/* Search Bar */}
      <div className={styles.searchPanel}>
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            type="text" 
            placeholder="Cari berdasarkan nama, email, nomor HP, atau isi pesan..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button className={styles.clearSearchBtn} onClick={() => setSearchQuery('')}>&times;</button>
          )}
        </div>
      </div>

      {/* Messages Stack */}
      {filteredMessages.length > 0 ? (
        <div className={styles.messageStack}>
          {filteredMessages.map((msg) => {
            // Clean phone number for WhatsApp link
            let waPhone = msg.nomorHp.replace(/\D/g, '');
            if (waPhone.startsWith('0')) {
              waPhone = '62' + waPhone.substring(1);
            }

            const waText = `Halo ${msg.nama}, terima kasih telah menghubungi Prime Property. Saya Berlin Sugiyanto (Senior Property Consultant), siap membantu menjawab pertanyaan Anda terkait pesan: "${msg.pesan.substring(0, 60)}..."`;
            const waLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(waText)}`;

            return (
              <div className={`${styles.messageCard} reveal-active`} key={msg.id}>
                {/* Header Card */}
                <div className={styles.cardHeader}>
                  <div className={styles.avatarWrapper}>
                    <div className={styles.avatar}>{getInitials(msg.nama)}</div>
                    <div className={styles.senderMeta}>
                      <h3 className={styles.senderName}>{msg.nama}</h3>
                      <span className={styles.timestamp}>{formatTanggalWaktu(msg.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Info Row */}
                <div className={styles.contactDetailsRow}>
                  <a href={`mailto:${msg.email}`} className={styles.contactLinkItem} title="Kirim Email">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.contactIcon}>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <span>{msg.email}</span>
                  </a>

                  <a href={`tel:${msg.nomorHp}`} className={styles.contactLinkItem} title="Telepon">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.contactIcon}>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <span>{msg.nomorHp}</span>
                  </a>
                </div>

                {/* Message Body */}
                <div className={styles.messageContentWrapper}>
                  <blockquote className={styles.messageText}>{msg.pesan}</blockquote>
                </div>

                {/* Actions Footer */}
                <div className={styles.cardActions}>
                  <a 
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.waBtn}
                  >
                    <svg className={styles.waIcon} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.706 1.459h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Hubungi via WhatsApp
                  </a>

                  <button 
                    onClick={() => setConfirmDeleteTarget(msg)}
                    className={styles.deleteBtn}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Hapus Leads
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyVisual}>
            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 12h-6l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <h3 className={styles.emptyTitle}>
            {searchQuery ? 'Hasil pencarian nihil' : 'Belum Ada Pesan Masuk'}
          </h3>
          <p className={styles.emptyText}>
            {searchQuery 
              ? 'Silakan cari kata kunci lain.' 
              : 'Ketika pengunjung umum mengisi formulir kontak di website Anda, detail leads mereka akan muncul di sini.'
            }
          </p>
          {searchQuery && (
            <button className="btn btn-secondary" onClick={() => setSearchQuery('')}>Reset Pencarian</button>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal Overlay */}
      {confirmDeleteTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h4 className={styles.modalTitle}>Hapus Pesan Calon Pembeli?</h4>
            <p className={styles.modalText}>
              Anda akan menghapus leads pesan dari **{confirmDeleteTarget.nama}**. Tindakan ini permanen dan tidak dapat dipulihkan di database.
            </p>
            <div className={styles.modalActions}>
              <button 
                onClick={() => setConfirmDeleteTarget(null)}
                className="btn btn-secondary"
                disabled={isDeleting}
              >
                Batal
              </button>
              <button 
                onClick={handleDelete}
                className="btn btn-danger"
                disabled={isDeleting}
                style={{ backgroundColor: '#B33A3A', color: '#FFFFFF', border: 'none' }}
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
