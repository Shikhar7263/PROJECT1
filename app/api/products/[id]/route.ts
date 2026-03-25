import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getVendorProduct(productId: string, userId: string) {
  const shop = await prisma.shop.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!shop) return null;

  return prisma.product.findFirst({
    where: { id: productId, shopId: shop.id },
  });
}

// PUT /api/products/[id] - Update product
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await getVendorProduct(params.id, session.user.id!);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const { name, description, price, salePrice, images, inStock, featured, categoryId } =
      await req.json();

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: name ?? product.name,
        description: description ?? product.description,
        price: price !== undefined ? parseFloat(price) : product.price,
        salePrice: salePrice !== undefined ? (salePrice ? parseFloat(salePrice) : null) : product.salePrice,
        images: images ?? product.images,
        inStock: inStock ?? product.inStock,
        featured: featured ?? product.featured,
        categoryId: categoryId !== undefined ? categoryId : product.categoryId,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await getVendorProduct(params.id, session.user.id!);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
