import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/plans - List all plans
export async function GET(_req: NextRequest) {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });
    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    console.error("GET /api/admin/plans error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/plans - Create plan (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, price, duration, features } = await req.json();
    if (!name || price === undefined || !duration) {
      return NextResponse.json({ error: "Name, price and duration are required" }, { status: 400 });
    }

    const plan = await prisma.plan.create({
      data: {
        name,
        price: parseFloat(price),
        duration: parseInt(duration),
        features: features || [],
      },
    });

    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/plans error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
