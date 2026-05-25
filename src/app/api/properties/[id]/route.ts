import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Helper to serialize BigInt
function serializeProperty(p: any) {
  if (!p) return null;
  return {
    ...p,
    price: p.price.toString(),
  };
}

// GET /api/properties/[id] — Fetch single property details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    if (!property || property.deletedAt) {
      return NextResponse.json({ message: 'Properti tidak ditemukan atau telah dihapus.' }, { status: 404 });
    }

    return NextResponse.json(serializeProperty(property));
  } catch (err: any) {
    console.error('GET property details error:', err);
    return NextResponse.json({ message: 'Terjadi kesalahan internal server.', error: err.message }, { status: 500 });
  }
}

// PUT /api/properties/[id] — Update property (Superadmin only)
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
      return NextResponse.json({ message: 'Akses ditolak. Hanya Superadmin yang memiliki wewenang ini.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const {
      namaProperty,
      group,
      lebar,
      panjang,
      hadap, // string[]
      tipe, // RUKO | VILLA
      tingkat,
      price, // number
      carport,
      status, // IN_STOCK | SOLD_OUT
      siap, // SIAP_HUNI | SIAP_KOSONG | SIAP_HUNI_RENOVASI
      mapsLink,
      kawasan, // string[]
      unit,
    } = body;

    // Fetch existing property
    const existing = await prisma.property.findUnique({
      where: { id },
    });

    if (!existing || existing.deletedAt) {
      return NextResponse.json({ message: 'Properti tidak ditemukan.' }, { status: 404 });
    }

    // Validation
    if (!namaProperty || namaProperty.length < 3 || namaProperty.length > 100) {
      return NextResponse.json({ message: 'Nama properti wajib diisi (3-100 karakter).' }, { status: 400 });
    }
    if (lebar <= 0 || panjang <= 0) {
      return NextResponse.json({ message: 'Lebar dan panjang harus bernilai positif.' }, { status: 400 });
    }
    if (!tipe || (tipe !== 'RUKO' && tipe !== 'VILLA')) {
      return NextResponse.json({ message: 'Tipe harus Ruko atau Villa.' }, { status: 400 });
    }
    if (tingkat <= 0 || tingkat > 10) {
      return NextResponse.json({ message: 'Tingkat lantai tidak valid (1-10).' }, { status: 400 });
    }
    if (!price || price <= 0) {
      return NextResponse.json({ message: 'Harga harus bernilai positif.' }, { status: 400 });
    }
    if (!hadap || !Array.isArray(hadap) || hadap.length === 0) {
      return NextResponse.json({ message: 'Arah hadap wajib dipilih.' }, { status: 400 });
    }
    if (!kawasan || !Array.isArray(kawasan) || kawasan.length === 0) {
      return NextResponse.json({ message: 'Kawasan wajib dipilih.' }, { status: 400 });
    }

    // Compare and track changes for audit logging
    const changes: Record<string, { old: any; new: any }> = {};

    const checkField = (field: string, oldValue: any, newValue: any) => {
      if (oldValue !== newValue) {
        changes[field] = { old: oldValue, new: newValue };
      }
    };

    checkField('namaProperty', existing.namaProperty, namaProperty.trim());
    checkField('group', existing.group, group ? group.trim() : null);
    checkField('lebar', existing.lebar, parseFloat(lebar));
    checkField('panjang', existing.panjang, parseFloat(panjang));
    checkField('tipe', existing.tipe, tipe);
    checkField('tingkat', existing.tingkat, parseFloat(tingkat));
    checkField('price', existing.price.toString(), price.toString());
    checkField('carport', existing.carport, !!carport);
    checkField('status', existing.status, status);
    checkField('siap', existing.siap, siap);
    checkField('mapsLink', existing.mapsLink, mapsLink ? mapsLink.trim() : null);
    checkField('unit', existing.unit, unit ? unit.trim() : null);

    // Hadap list comparison
    try {
      const oldHadap = JSON.parse(existing.hadap);
      if (JSON.stringify(oldHadap.sort()) !== JSON.stringify(hadap.sort())) {
        changes.hadap = { old: oldHadap, new: hadap };
      }
    } catch {
      changes.hadap = { old: existing.hadap, new: hadap };
    }

    // Kawasan list comparison
    try {
      const oldKawasan = JSON.parse(existing.kawasan);
      if (JSON.stringify(oldKawasan.sort()) !== JSON.stringify(kawasan.sort())) {
        changes.kawasan = { old: oldKawasan, new: kawasan };
      }
    } catch {
      changes.kawasan = { old: existing.kawasan, new: kawasan };
    }

    // Update Property
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        namaProperty: namaProperty.trim(),
        group: group ? group.trim() : null,
        lebar: parseFloat(lebar),
        panjang: parseFloat(panjang),
        hadap: JSON.stringify(hadap),
        tipe,
        tingkat: parseFloat(tingkat),
        price: BigInt(price),
        carport: !!carport,
        status: status || 'IN_STOCK',
        siap,
        mapsLink: mapsLink ? mapsLink.trim() : null,
        kawasan: JSON.stringify(kawasan),
        unit: unit ? unit.trim() : null,
      },
    });

    // Write Audit Log if there are changes
    if (Object.keys(changes).length > 0) {
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          entity: 'PROPERTY',
          entityId: id,
          changes: JSON.stringify(changes),
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json(serializeProperty(updatedProperty));
  } catch (err: any) {
    console.error('PUT property details error:', err);
    return NextResponse.json({ message: 'Terjadi kesalahan saat memperbarui properti.', error: err.message }, { status: 500 });
  }
}

// DELETE /api/properties/[id] — Soft delete property (Superadmin only)
export async function DELETE(
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

    if (!existing || existing.deletedAt) {
      return NextResponse.json({ message: 'Properti tidak ditemukan.' }, { status: 404 });
    }

    // Soft delete by setting deletedAt
    const softDeleted = await prisma.property.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entity: 'PROPERTY',
        entityId: id,
        changes: JSON.stringify({
          namaProperty: existing.namaProperty,
          tipe: existing.tipe,
        }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: 'Properti berhasil dihapus.', id: softDeleted.id });
  } catch (err: any) {
    console.error('DELETE property error:', err);
    return NextResponse.json({ message: 'Terjadi kesalahan saat menghapus properti.', error: err.message }, { status: 500 });
  }
}
