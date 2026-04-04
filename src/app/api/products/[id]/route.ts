import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = await req.json();
  const product = await prisma.product.update({
    where: { id: Number(params.id) },
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      images: data.images || [],
      badge: data.badge || null,
      tags: data.tags ?? null,
      categoryId: data.categoryId,
      sortOrder: data.sortOrder,
    },
  });
  return NextResponse.json(product);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.product.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ ok: true });
}
