import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/vendors - List all vendors (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [vendors, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: "VENDOR" },
        include: {
          shop: { select: { name: true, slug: true, isActive: true } },
          subscription: {
            include: { plan: { select: { name: true, price: true } } },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where: { role: "VENDOR" } }),
    ]);

    const safeVendors = vendors.map(({ password: _, ...v }) => v);

    return NextResponse.json({
      success: true,
      data: safeVendors,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET /api/admin/vendors error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
