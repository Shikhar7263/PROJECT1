import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";
import { getAppUrl } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shop = await prisma.shop.findFirst({
      where: {
        id: params.shopId,
        userId: session.user.id!,
      },
    });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const shopUrl = `${getAppUrl()}/shop/${shop.slug}`;
    const qrCodeDataUrl = await QRCode.toDataURL(shopUrl, {
      errorCorrectionLevel: "M",
      type: "image/png",
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Save the QR code URL to the shop if not already set
    if (!shop.qrCodeUrl) {
      await prisma.shop.update({
        where: { id: shop.id },
        data: { qrCodeUrl: shopUrl },
      });
    }

    return NextResponse.json({ success: true, data: { qrCode: qrCodeDataUrl, url: shopUrl } });
  } catch (error) {
    console.error("GET /api/qr/[shopId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
