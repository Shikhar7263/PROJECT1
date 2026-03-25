import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((session.user as { role: string }).role !== "VENDOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { planId } = await req.json();
    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Create Razorpay order (amount in paise)
    const order = await razorpay.orders.create({
      amount: Math.round(plan.price * 100),
      currency: "INR",
      receipt: `order_${session.user.id}_${Date.now()}`,
      notes: {
        userId: session.user.id!,
        planId: plan.id,
        planName: plan.name,
      },
    });

    // Create pending payment record
    await prisma.payment.create({
      data: {
        amount: plan.price,
        currency: "INR",
        status: "pending",
        razorpayOrderId: order.id,
        userId: session.user.id!,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        plan: { id: plan.id, name: plan.name, price: plan.price },
      },
    });
  } catch (error) {
    console.error("POST /api/payments/create-order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
