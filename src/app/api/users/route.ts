import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET /api/users — List all users (Superadmin only, exclude password)
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Sesi habis, silakan login kembali.' }, { status: 401 });
    }

    const isSuperAdmin = session.user.role === 'SUPERADMIN';
    if (!isSuperAdmin) {
      return NextResponse.json({ message: 'Akses ditolak. Hanya Superadmin yang dapat mengelola pengguna.' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(users);
  } catch (err: any) {
    console.error('GET users error:', err);
    return NextResponse.json({ message: 'Terjadi kesalahan internal server.', error: err.message }, { status: 500 });
  }
}

// POST /api/users — Create new agent/admin user (Superadmin only)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Sesi habis, silakan login kembali.' }, { status: 401 });
    }

    const isSuperAdmin = session.user.role === 'SUPERADMIN';
    if (!isSuperAdmin) {
      return NextResponse.json({ message: 'Akses ditolak. Hanya Superadmin yang dapat membuat pengguna baru.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ message: 'Nama wajib diisi.' }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ message: 'Email wajib diisi.' }, { status: 400 });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ message: 'Format email tidak valid.' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ message: 'Password wajib diisi (minimal 6 karakter).' }, { status: 400 });
    }
    if (!role || (role !== 'ADMIN' && role !== 'SUPERADMIN')) {
      return NextResponse.json({ message: 'Role tidak valid.' }, { status: 400 });
    }

    // Check unique email
    const existing = await prisma.user.findUnique({
      where: { email: email.trim() },
    });
    if (existing) {
      return NextResponse.json({ message: 'Email sudah terdaftar di sistem.' }, { status: 400 });
    }

    // Hash password with bcrypt cost 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        password: hashedPassword,
        role,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'USER',
        entityId: newUser.id,
        changes: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        }),
        userId: session.user.id,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (err: any) {
    console.error('POST user error:', err);
    return NextResponse.json({ message: 'Terjadi kesalahan saat membuat pengguna.', error: err.message }, { status: 500 });
  }
}
