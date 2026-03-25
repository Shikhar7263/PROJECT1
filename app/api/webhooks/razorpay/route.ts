import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    if (eventType === "payment.captured") {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;

      // Update payment record
      await prisma.payment.updateMany({
        where: { razorpayOrderId: orderId },
        data: { status: "captured", razorpayPaymentId: paymentId },
      });

      // Find the payment to get userId
      const paymentRecord = await prisma.payment.findFirst({
        where: { razorpayOrderId: orderId },
      });

      if (paymentRecord?.subscriptionId) {
        await prisma.subscription.update({
          where: { id: paymentRecord.subscriptionId },
          data: { status: "ACTIVE" },
        });
        await prisma.shop.updateMany({
          where: { userId: paymentRecord.userId },
          data: { isActive: true },
        });
      }
    }

    if (eventType === "payment.failed") {
      const payment = event.payload.payment.entity;
      await prisma.payment.updateMany({
        where: { razorpayOrderId: payment.order_id },
        data: { status: "failed" },
      });
    }

    if (eventType === "subscription.cancelled") {
      const sub = event.payload.subscription.entity;
      await prisma.subscription.updateMany({
        where: { razorpaySubId: sub.id },
        data: { status: "CANCELLED" },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
