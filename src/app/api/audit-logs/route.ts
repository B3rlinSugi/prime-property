import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/audit-logs — Paginated list of audit logs (Superadmin only)
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Sesi habis, silakan login kembali.' }, { status: 401 });
    }

    const isSuperAdmin = session.user.role === 'SUPERADMIN';
    if (!isSuperAdmin) {
      return NextResponse.json({ message: 'Akses ditolak. Hanya Superadmin yang dapat mengakses Audit Log.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    // Filters
    const action = searchParams.get('action') || ''; // CREATE | UPDATE | DELETE | RESET_PASSWORD
    const entity = searchParams.get('entity') || ''; // PROPERTY | USER

    const where: any = {};
    if (action) where.action = action;
    if (entity) where.entity = entity;

    // Fetch logs
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (err: any) {
    console.error('GET audit-logs error:', err);
    return NextResponse.json({ message: 'Terjadi kesalahan internal server.', error: err.message }, { status: 500 });
  }
}
