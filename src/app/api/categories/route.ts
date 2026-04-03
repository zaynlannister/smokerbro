import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { products: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      icon: data.icon || "",
      sortOrder: data.sortOrder ?? 0,
    },
  });
  return NextResponse.json(category, { status: 201 });
}
