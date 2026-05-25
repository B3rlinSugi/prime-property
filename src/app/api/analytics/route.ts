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
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    // Compute basic statistics
    const totalProperties = properties.length;
    let inStock = 0;
    let soldOut = 0;
    let totalPortfolioValue = BigInt(0);

    const tipeCounts: Record<string, number> = { RUKO: 0, VILLA: 0 };
    const kawasanCounts: Record<string, number> = {};
    const siapCounts: Record<string, number> = { SIAP_HUNI: 0, SIAP_KOSONG: 0, SIAP_HUNI_RENOVASI: 0 };
    
    // Price distribution brackets
    // Tier 1: < 1 Miliar
    // Tier 2: 1 - 2 Miliar
    // Tier 3: 2 - 3 Miliar
    // Tier 4: 3 - 5 Miliar
    // Tier 5: >= 5 Miliar
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

    // Sort kawasan counts and get top 8
    const sortedKawasan = Object.entries(kawasanCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Fetch 10 recent activities
    const recentActivities = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      summary: {
        totalProperties,
        inStock,
        soldOut,
        totalPortfolioValue: totalPortfolioValue.toString(),
      },
      distributions: {
        tipe: tipeCounts,
        kawasan: sortedKawasan,
        siap: siapCounts,
        priceBrackets,
      },
      recentActivities,
    });
  } catch (err: any) {
    console.error('GET analytics error:', err);
    return NextResponse.json({ message: 'Terjadi kesalahan internal server.', error: err.message }, { status: 500 });
  }
}
