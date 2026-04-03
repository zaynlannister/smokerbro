import { prisma } from "@/lib/prisma";
import MenuContent from "@/components/MenuContent";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const categories = await prisma.category.findMany({
    include: {
      products: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return <MenuContent categories={categories} />;
}
