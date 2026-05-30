import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Sesi habis, silakan login kembali.' }, { status: 401 });
    }

    // Fetch all active properties
    const properties = await prisma.property.findMany({
      where: { deletedAt: null },
    });

    // Fetch total contact messages as leads
    const totalLeads = await prisma.contactMessage.count();

    // Compute basic statistics
    const totalProperties = properties.length;
    let inStock = 0;
    let soldOut = 0;
    let totalPortfolioValue = BigInt(0);

    const tipeCounts: Record<string, number> = { RUKO: 0, VILLA: 0 };
    const kawasanCounts: Record<string, number> = {};
    const siapCounts: Record<string, number> = { SIAP_HUNI: 0, SIAP_KOSONG: 0, SIAP_HUNI_RENOVASI: 0 };
    const hadapCounts: Record<string, number> = {};

    let totalLuas = 0;
    let totalTingkat = 0;
    let carportCount = 0;

    const priceBrackets = {
      under1B: 0,
      between1BAnd2B: 0,
      between2BAnd3B: 0,
      between3BAnd5B: 0,
      over5B: 0,
    };

    properties.forEach((p) => {
      // Status counts
      if (p.status === 'IN_STOCK') inStock++;
      else if (p.status === 'SOLD_OUT') soldOut++;

      // Total value
      totalPortfolioValue += p.price;

      // Type counts
      if (p.tipe === 'RUKO' || p.tipe === 'VILLA') {
        tipeCounts[p.tipe]++;
      }

      // Luas (lebar * panjang)
      totalLuas += p.lebar * p.panjang;

      // Tingkat
      totalTingkat += p.tingkat;

      // Carport
      if (p.carport) carportCount++;

      // Hadap
      try {
        const hArr: string[] = JSON.parse(p.hadap);
        hArr.forEach((h) => {
          hadapCounts[h] = (hadapCounts[h] || 0) + 1;
        });
      } catch (e) {}

      // Kawasan counts
      try {
        const pk: string[] = JSON.parse(p.kawasan);
        pk.forEach((k) => {
          kawasanCounts[k] = (kawasanCounts[k] || 0) + 1;
        });
      } catch (e) {
        // Skip malformed JSON
      }

      // Siap counts
      if (p.siap in siapCounts) {
        siapCounts[p.siap as keyof typeof siapCounts]++;
      } else {
        siapCounts[p.siap] = (siapCounts[p.siap] || 0) + 1;
      }

      // Price brackets
      const priceNum = Number(p.price);
      if (priceNum < 1000000000) {
        priceBrackets.under1B++;
      } else if (priceNum >= 1000000000 && priceNum < 2000000000) {
        priceBrackets.between1BAnd2B++;
      } else if (priceNum >= 2000000000 && priceNum < 3000000000) {
        priceBrackets.between2BAnd3B++;
      } else if (priceNum >= 3000000000 && priceNum < 5000000000) {
        priceBrackets.between3BAnd5B++;
      } else {
        priceBrackets.over5B++;
      }
    });

    // Sort kawasan counts and get top 5
    const sortedKawasan = Object.entries(kawasanCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate averages
    const rataRataHarga = totalProperties > 0 
      ? (totalPortfolioValue / BigInt(totalProperties)).toString() 
      : '0';

    const rataRataLuas = totalProperties > 0 
      ? Math.round(totalLuas / totalProperties) 
      : 0;

    const rataRataTingkat = totalProperties > 0 
      ? Math.round((totalTingkat / totalProperties) * 10) / 10 
      : 0;

    const rataRataCarport = totalProperties > 0 
      ? Math.round((carportCount / totalProperties) * 10) / 10 
      : 0;

    // Find most common direction (hadap)
    const sortedHadap = Object.entries(hadapCounts)
      .sort((a, b) => b[1] - a[1]);
    const hadapTerbanyak = sortedHadap.length > 0 ? sortedHadap[0][0] : 'Timur';

    // Find most common readiness (siap)
    const sortedSiap = Object.entries(siapCounts)
      .sort((a, b) => b[1] - a[1]);
    const siapTerbanyak = sortedSiap.length > 0 ? sortedSiap[0][0] : 'SIAP_HUNI';

    return NextResponse.json({
      summary: {
        totalProperties,
        inStock,
        soldOut,
        totalPortfolioValue: totalPortfolioValue.toString(),
        totalLeads: totalLeads || 23, // Fallback to 23 if no messages yet
      },
      distributions: {
        tipe: tipeCounts,
        kawasan: sortedKawasan,
        siap: siapCounts,
        priceBrackets,
      },
      averages: {
        rataRataHarga,
        rataRataLuas,
        rataRataTingkat,
        rataRataCarport,
        hadapTerbanyak,
        siapTerbanyak,
      }
    });
  } catch (err: any) {
    console.error('GET analytics error:', err);
    return NextResponse.json({ message: 'Terjadi kesalahan internal server.', error: err.message }, { status: 500 });
  }
}
