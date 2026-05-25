import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PATCH /api/properties/[id]/restore — Restore a soft-deleted property (Superadmin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Sesi habis, silakan login kembali.' }, { status: 401 });
    }

    const isSuperAdmin = session.user.role === 'SUPERADMIN';
    if (!isSuperAdmin) {
      return NextResponse.json({ message: 'Akses ditolak. Hanya Superadmin yang memiliki wewenang ini.' }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.property.findUnique({
      where: { id },
    });

    if (!existing || !existing.deletedAt) {
      return NextResponse.json({ message: 'Properti tidak ditemukan atau tidak berada di arsip.' }, { status: 404 });
    }

    // Restore by setting deletedAt to null
    const restored = await prisma.property.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'RESTORE',
        entity: 'PROPERTY',
        entityId: id,
        changes: JSON.stringify({
          namaProperty: existing.namaProperty,
          tipe: existing.tipe,
        }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: 'Properti berhasil dipulihkan dari arsip.', id: restored.id });
  } catch (err: any) {
    console.error('RESTORE property error:', err);
    return NextResponse.json({ message: 'Terjadi kesalahan saat memulihkan properti.', error: err.message }, { status: 500 });
  }
}
