import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/payments - List all payments (admin only)
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

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        include: {
          user: { select: { name: true, email: true } },
          subscription: { include: { plan: { select: { name: true } } } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.count(),
    ]);

    // Compute totals
    const stats = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "captured" },
    });

    return NextResponse.json({
      success: true,
      data: payments,
      stats: { totalRevenue: stats._sum.amount || 0 },
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET /api/admin/payments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
