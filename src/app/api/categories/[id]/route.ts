import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = await req.json();
  const category = await prisma.category.update({
    where: { id: Number(params.id) },
    data: {
      name: data.name,
      slug: data.slug,
      icon: data.icon,
      sortOrder: data.sortOrder,
    },
  });
  return NextResponse.json(category);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.category.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ ok: true });
}
