import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// GET /api/shops - List active shops (public)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
          { city: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [shops, total] = await Promise.all([
      prisma.shop.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          logo: true,
          banner: true,
          city: true,
          state: true,
          isActive: true,
          createdAt: true,
          _count: { select: { products: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.shop.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: shops,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET /api/shops error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/shops - Update own shop (vendor only)
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((session.user as { role: string }).role !== "VENDOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, logo, banner, address, city, state, pincode, whatsapp, email, openTime, closeTime } = body;

    const shop = await prisma.shop.findUnique({ where: { userId: session.user.id } });
    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    // Update slug if name changed
    let slug = shop.slug;
    if (name && name !== shop.name) {
      const baseSlug = slugify(name);
      const existing = await prisma.shop.findFirst({
        where: { slug: baseSlug, id: { not: shop.id } },
      });
      slug = existing ? `${baseSlug}-${shop.id.slice(-6)}` : baseSlug;
    }

    const updated = await prisma.shop.update({
      where: { id: shop.id },
      data: {
        name: name ?? shop.name,
        slug,
        description,
        logo,
        banner,
        address,
        city,
        state,
        pincode,
        whatsapp,
        email,
        openTime,
        closeTime,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/shops error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
