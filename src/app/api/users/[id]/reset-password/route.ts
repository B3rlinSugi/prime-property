import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// POST /api/users/[id]/reset-password — Reset user password (Superadmin only)
export async function POST(
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
      return NextResponse.json({ message: 'Akses ditolak. Hanya Superadmin yang dapat melakukan reset password.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ message: 'Password baru wajib diisi (minimal 6 karakter).' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ message: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    // Hash the new password with bcryptjs cost 10
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        failedLogin: 0,
        lockedUntil: null, // unlock account if it was locked
      },
    });

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'RESET_PASSWORD',
        entity: 'USER',
        entityId: id,
        changes: JSON.stringify({
          info: `Password reset by Superadmin ${session.user.name}`,
        }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: 'Password pengguna berhasil direset.' });
  } catch (err: any) {
    console.error('Reset password error:', err);
    return NextResponse.json({ message: 'Terjadi kesalahan saat meriset password.', error: err.message }, { status: 500 });
  }
}
