import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/contact — Public contact form submission
export async function POST(request: Request) {
  try {
    // Get IP for anti-spam rate limiting
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // Database-backed rate limiting (AC-4.2): max 3 submissions per IP per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const count = await prisma.contactMessage.count({
      where: {
        ip,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    if (count >= 3) {
      return NextResponse.json(
        { message: 'Terlalu banyak mengirim pesan. Batas maksimal adalah 3 pesan per jam.' }, 
        { status: 429 }
      );
    }

    const body = await request.json();
    const { nama, email, nomorHp, pesan } = body;

    // Validation
    if (!nama || !nama.trim()) {
      return NextResponse.json({ message: 'Nama wajib diisi.' }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ message: 'Email wajib diisi.' }, { status: 400 });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ message: 'Format email tidak valid.' }, { status: 400 });
    }
    if (!nomorHp || !nomorHp.trim()) {
      return NextResponse.json({ message: 'Nomor HP wajib diisi.' }, { status: 400 });
    } else {
      const digits = nomorHp.replace(/\D/g, '');
      if (digits.length < 10) {
        return NextResponse.json({ message: 'Nomor HP minimal 10 digit angka.' }, { status: 400 });
      }
    }
    if (!pesan || !pesan.trim()) {
      return NextResponse.json({ message: 'Pesan wajib diisi.' }, { status: 400 });
    }

    // Save message to database with IP
    const contactMessage = await prisma.contactMessage.create({
      data: {
        nama: nama.trim(),
        email: email.trim(),
        nomorHp: nomorHp.trim(),
        pesan: pesan.trim(),
        ip,
      },
    });

    return NextResponse.json({ message: 'Pesan berhasil terkirim.', id: contactMessage.id }, { status: 201 });
  } catch (err: any) {
    console.error('POST contact message error:', err);
    return NextResponse.json({ message: 'Gagal mengirim pesan. Terjadi kesalahan internal.', error: err.message }, { status: 500 });
  }
}

// GET /api/contact — Authenticated listing of contact messages
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Sesi habis, silakan login kembali.' }, { status: 401 });
    }

    // Fetch all contact messages ordered by newest first
    const messages = await prisma.contactMessage.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ data: messages });
  } catch (err: any) {
    console.error('GET contact messages error:', err);
    return NextResponse.json({ message: 'Gagal mengambil pesan. Terjadi kesalahan internal.', error: err.message }, { status: 500 });
  }
}

// DELETE /api/contact — Authenticated deletion of a contact message
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Sesi habis, silakan login kembali.' }, { status: 401 });
    }

    // Read ID from query string
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'ID pesan wajib disertakan.' }, { status: 400 });
    }

    // Delete the contact message
    await prisma.contactMessage.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: 'Pesan berhasil dihapus.' });
  } catch (err: any) {
    console.error('DELETE contact message error:', err);
    return NextResponse.json({ message: 'Gagal menghapus pesan. Terjadi kesalahan internal.', error: err.message }, { status: 500 });
  }
}
