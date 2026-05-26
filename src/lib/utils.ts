// Format price to Indonesian Rupiah: Rp 1.350.000.000
export function formatRupiah(amount: number | bigint): string {
  const num = typeof amount === 'bigint' ? Number(amount) : amount;
  return 'Rp ' + Math.round(num).toLocaleString('id-ID', { maximumFractionDigits: 0 });
}

// Format date to Indonesian format: 24 Mei 2026
export function formatTanggal(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  });
}

// Format date with time
export function formatTanggalWaktu(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }) + ' WIB';
}

// Format dimensions
export function formatDimensi(lebar: number, panjang: number): string {
  return `${lebar} × ${panjang} m`;
}

// Parse hadap from JSON string to array
export function parseJsonArray(jsonStr: string): string[] {
  try {
    return JSON.parse(jsonStr);
  } catch {
    return [];
  }
}

// Format hadap array for display
export function formatHadap(hadapJson: string): string {
  const arr = parseJsonArray(hadapJson);
  return arr.join(', ');
}

// Format kawasan array for display
export function formatKawasan(kawasanJson: string): string {
  const arr = parseJsonArray(kawasanJson);
  return arr.join(', ');
}

// Status label mapping
export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    IN_STOCK: 'In Stock',
    SOLD_OUT: 'Sold Out',
  };
  return map[status] || status;
}

// Siap label mapping
export function getSiapLabel(siap: string): string {
  const map: Record<string, string> = {
    SIAP_HUNI: 'Siap Huni',
    SIAP_KOSONG: 'Siap Kosong',
    SIAP_HUNI_RENOVASI: 'Siap Huni Renovasi',
  };
  return map[siap] || siap;
}

// Tipe label mapping
export function getTipeLabel(tipe: string): string {
  const map: Record<string, string> = {
    RUKO: 'Ruko',
    VILLA: 'Villa',
  };
  return map[tipe] || tipe;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Validate email format
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate phone number (min 10 digits)
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

// Validate Google Maps URL
export function isValidMapsLink(url: string): boolean {
  if (!url) return true; // optional field
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes('google.com') && parsed.pathname.includes('/maps');
  } catch {
    return false;
  }
}
