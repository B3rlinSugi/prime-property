import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Sesi habis, silakan login kembali.' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json().catch(() => ({}));
    const { oldPassword, newPassword } = body;

    // Basic Validation
    if (!oldPassword || !newPassword) {
      return NextResponse.json({ message: 'Password lama dan password baru wajib diisi.' }, { status: 400 });
    }

    // Password strength check (Wave 2 criteria: minimum 8 characters, must have uppercase + number)
    if (newPassword.length < 8) {
      return NextResponse.json({ message: 'Password baru minimal 8 karakter.' }, { status: 400 });
    }

    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!hasUppercase || !hasNumber) {
      return NextResponse.json({ message: 'Password baru harus mengandung setidaknya satu huruf besar dan satu angka.' }, { status: 400 });
    }

    // Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Password lama tidak cocok.' }, { status: 400 });
    }

    // Hash the new password (bcrypt cost 10)
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password in DB
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'CHANGE_PASSWORD',
        entity: 'USER',
        entityId: userId,
        changes: JSON.stringify({
          info: 'Mengubah kata sandi akun',
        }),
        userId: userId,
      },
    });

    return NextResponse.json({ message: 'Password berhasil diperbarui.' });
  } catch (err: any) {
    console.error('POST change-password error:', err);
    return NextResponse.json({ message: 'Terjadi kesalahan internal server.', error: err.message }, { status: 500 });
  }
}
