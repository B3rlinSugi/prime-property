import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/properties — List properties with comprehensive filtering, search, pagination, and sorting
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    // Sorting
    const sort = searchParams.get('sort') || 'created_desc';
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'nama_asc') orderBy = { namaProperty: 'asc' };
    else if (sort === 'nama_desc') orderBy = { namaProperty: 'desc' };
    else if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'created_asc') orderBy = { createdAt: 'asc' };
    else if (sort === 'created_desc') orderBy = { createdAt: 'desc' };
    else if (sort === 'status_asc') orderBy = { status: 'asc' };
    else if (sort === 'status_desc') orderBy = { status: 'desc' };

    // Search and Filters
    const search = searchParams.get('search') || '';
    const featured = searchParams.get('featured') === 'true';
    const tipe = searchParams.get('tipe') || ''; // RUKO | VILLA
    const status = searchParams.get('status') || ''; // IN_STOCK | SOLD_OUT
    const carport = searchParams.get('carport'); // true | false
    const lebarMin = searchParams.get('lebarMin');
    const priceMax = searchParams.get('priceMax');
    const kawasan = searchParams.get('kawasan') ? searchParams.get('kawasan')?.split(',') : null;
    const hadap = searchParams.get('hadap') ? searchParams.get('hadap')?.split(',') : null;
    const siap = searchParams.get('siap') ? searchParams.get('siap')?.split(',') : null;

    const showArchived = searchParams.get('archived') === 'true';

    // Base query conditions (exclude soft deleted properties by default)
    const where: any = {
      deletedAt: showArchived ? { not: null } : null,
    };

    // For landing page (featured): returns top 6 IN_STOCK
    if (featured) {
      where.status = 'IN_STOCK';
      const featuredProperties = await prisma.property.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: {
          createdBy: {
            select: { name: true, email: true },
          },
        },
      });

      // Serialize BigInt price to string for JSON serialization
      const serialized = featuredProperties.map((p) => ({
        ...p,
        price: p.price.toString(),
      }));

      return NextResponse.json({ data: serialized });
    }

    // Search term matching
    if (search) {
      where.OR = [
        { namaProperty: { contains: search } },
        { group: { contains: search } },
        { kawasan: { contains: search } },
      ];
    }

    // Direct filters
    if (tipe) where.tipe = tipe;
    if (status) where.status = status;
    if (carport === 'true') where.carport = true;
    if (carport === 'false') where.carport = false;

    // Range filters
    if (lebarMin) {
      where.lebar = { gte: parseFloat(lebarMin) };
    }
    if (priceMax) {
      where.price = { lte: BigInt(parseInt(priceMax, 10)) };
    }

    // Fetch all properties to perform array/JSON filtering in SQLite locally (or use SQLite JSON functions if needed)
    // To make it simple and extremely bulletproof, we will fetch all matching base properties and filter arrays in TypeScript
    const allMatchingProperties = await prisma.property.findMany({
      where,
      orderBy,
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    // Filtering JSON array string lists (kawasan, hadap, siap) in TypeScript
    let filteredList = allMatchingProperties;

    if (kawasan && kawasan.length > 0) {
      filteredList = filteredList.filter((p) => {
        try {
          const pk: string[] = JSON.parse(p.kawasan);
          return pk.some((k) => kawasan.includes(k));
        } catch {
          return false;
        }
      });
    }

    if (hadap && hadap.length > 0) {
      filteredList = filteredList.filter((p) => {
        try {
          const ph: string[] = JSON.parse(p.hadap);
          return ph.some((h) => hadap.includes(h));
        } catch {
          return false;
        }
      });
    }

    if (siap && siap.length > 0) {
      filteredList = filteredList.filter((p) => siap.includes(p.siap));
    }

    // Calculate pagination totals on the filtered list
    const total = filteredList.length;
    const totalPages = Math.ceil(total / limit);

    // Get slice for the current page
    const paginatedList = filteredList.slice(skip, skip + limit);

    // Serialize BigInt price to string for JSON serialization
    const serialized = paginatedList.map((p) => ({
      ...p,
      price: p.price.toString(),
    }));

    return NextResponse.json({
      data: serialized,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (err: any) {
    console.error('GET properties error:', err);
    return NextResponse.json({ message: 'Terjadi kesalahan internal server.', error: err.message }, { status: 500 });
  }
}

// POST /api/properties — Create Property (Superadmin only)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Sesi habis, silakan login kembali.' }, { status: 401 });
    }

    const isSuperAdmin = session.user.role === 'SUPERADMIN';
    if (!isSuperAdmin) {
      return NextResponse.json({ message: 'Akses ditolak. Hanya Superadmin yang memiliki wewenang ini.' }, { status: 403 });
    }

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

    // Server-side validation
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

    if (mapsLink && mapsLink.trim()) {
      const trimmedLink = mapsLink.trim();
      const isValidMaps = trimmedLink.includes('google.com/maps') || trimmedLink.includes('maps.google.com') || trimmedLink.includes('goo.gl/maps');
      if (!isValidMaps) {
        return NextResponse.json({ message: 'Tautan Google Maps tidak valid. Wajib berisi domain google.com/maps atau goo.gl/maps.' }, { status: 400 });
      }
    }

    // Create property in DB
    const newProperty = await prisma.property.create({
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
        createdById: session.user.id,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'PROPERTY',
        entityId: newProperty.id,
        changes: JSON.stringify({
          namaProperty: newProperty.namaProperty,
          tipe: newProperty.tipe,
          price: newProperty.price.toString(),
        }),
        userId: session.user.id,
      },
    });

    const responseData = {
      ...newProperty,
      price: newProperty.price.toString(),
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (err: any) {
    console.error('POST property error:', err);
    return NextResponse.json({ message: 'Terjadi kesalahan saat menyimpan properti.', error: err.message }, { status: 500 });
  }
}
