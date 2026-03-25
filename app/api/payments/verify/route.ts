import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planId } =
      await req.json();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !planId) {
      return NextResponse.json({ error: "Missing required payment fields" }, { status: 400 });
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000);

    // Upsert subscription
    const subscription = await prisma.subscription.upsert({
      where: { userId: session.user.id! },
      create: {
        userId: session.user.id!,
        planId,
        status: "ACTIVE",
        startDate,
        endDate,
      },
      update: {
        planId,
        status: "ACTIVE",
        startDate,
        endDate,
      },
    });

    // Update payment record
    await prisma.payment.updateMany({
      where: { razorpayOrderId, userId: session.user.id! },
      data: {
        status: "captured",
        razorpayPaymentId,
        razorpaySignature,
        subscriptionId: subscription.id,
      },
    });

    // Activate the shop
    await prisma.shop.updateMany({
      where: { userId: session.user.id! },
      data: { isActive: true },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified and subscription activated",
    });
  } catch (error) {
    console.error("POST /api/payments/verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
