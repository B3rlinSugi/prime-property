import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PUT /api/users/[id] — Update user details (Superadmin only)
export async function PUT(
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
      return NextResponse.json({ message: 'Akses ditolak. Hanya Superadmin yang dapat mengelola pengguna.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, email, isActive } = body;

    // Fetch existing user
    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ message: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    // Prevents superadmin from disabling or modifying their own status/email in this endpoint for safety
    if (existing.id === session.user.id && (isActive === false || existing.email !== email.trim())) {
      return NextResponse.json({ message: 'Anda tidak dapat menonaktifkan atau mengubah email akun Anda sendiri.' }, { status: 400 });
    }

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ message: 'Nama wajib diisi.' }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ message: 'Email wajib diisi.' }, { status: 400 });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ message: 'Format email tidak valid.' }, { status: 400 });
    }

    // Check unique email if modified
    if (existing.email !== email.trim()) {
      const emailCheck = await prisma.user.findUnique({
        where: { email: email.trim() },
      });
      if (emailCheck) {
        return NextResponse.json({ message: 'Email sudah digunakan oleh pengguna lain.' }, { status: 400 });
      }
    }

    // Track changes for audit log
    const changes: Record<string, { old: any; new: any }> = {};
    if (existing.name !== name.trim()) changes.name = { old: existing.name, new: name.trim() };
    if (existing.email !== email.trim()) changes.email = { old: existing.email, new: email.trim() };
    if (existing.isActive !== !!isActive) changes.isActive = { old: existing.isActive, new: !!isActive };

    // Update
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name.trim(),
        email: email.trim(),
        isActive: !!isActive,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    // Write Audit Log if there are changes
    if (Object.keys(changes).length > 0) {
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          entity: 'USER',
          entityId: id,
          changes: JSON.stringify(changes),
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json(updatedUser);
  } catch (err: any) {
    console.error('PUT user error:', err);
    return NextResponse.json({ message: 'Terjadi kesalahan saat memperbarui pengguna.', error: err.message }, { status: 500 });
  }
}

// PATCH /api/users/[id] — Toggle isActive status (Superadmin only)
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
      return NextResponse.json({ message: 'Akses ditolak. Hanya Superadmin yang dapat mengelola pengguna.' }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ message: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    // Prevents superadmin from disabling themselves
    if (existing.id === session.user.id) {
      return NextResponse.json({ message: 'Anda tidak dapat menonaktifkan akun Anda sendiri.' }, { status: 400 });
    }

    const newActiveState = !existing.isActive;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        isActive: newActiveState,
        // Reset failed login / lockout if enabling
        failedLogin: newActiveState ? 0 : existing.failedLogin,
        lockedUntil: newActiveState ? null : existing.lockedUntil,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'USER',
        entityId: id,
        changes: JSON.stringify({
          isActive: { old: existing.isActive, new: newActiveState },
        }),
        userId: session.user.id,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('PATCH user error:', err);
    return NextResponse.json({ message: 'Terjadi kesalahan saat mengubah status pengguna.', error: err.message }, { status: 500 });
  }
}
