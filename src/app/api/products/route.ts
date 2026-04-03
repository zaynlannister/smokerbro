import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const categoryId = req.nextUrl.searchParams.get("categoryId");
  const where = categoryId ? { categoryId: Number(categoryId) } : {};
  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const product = await prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      images: data.images || [],
      badge: data.badge || null,
      categoryId: data.categoryId,
      sortOrder: data.sortOrder ?? 0,
    },
  });
  return NextResponse.json(product, { status: 201 });
}
