import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/shops/[slug] - Get shop by slug (public)
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const shop = await prisma.shop.findUnique({
      where: { slug: params.slug },
      include: {
        products: {
          where: { inStock: true },
          orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        },
        categories: true,
        user: {
          select: {
            subscription: {
              select: {
                status: true,
                endDate: true,
                plan: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: shop });
  } catch (error) {
    console.error("GET /api/shops/[slug] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
