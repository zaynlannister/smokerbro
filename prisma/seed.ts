import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: { password: hashedPassword },
    create: { username: "admin", password: hashedPassword },
  });
  console.log("Admin erstellt: admin / admin123");

  // Categories
  const shisha = await prisma.category.upsert({
    where: { slug: "shisha" },
    update: {},
    create: { name: "Shisha", slug: "shisha", icon: "\uD83C\uDF3F", sortOrder: 0 },
  });
  const drinks = await prisma.category.upsert({
    where: { slug: "getraenke" },
    update: {},
    create: { name: "Getr\u00e4nke", slug: "getraenke", icon: "\uD83E\uDD43", sortOrder: 1 },
  });
  const snacks = await prisma.category.upsert({
    where: { slug: "snacks" },
    update: {},
    create: { name: "Snacks", slug: "snacks", icon: "\uD83C\uDF7D", sortOrder: 2 },
  });
  const desserts = await prisma.category.upsert({
    where: { slug: "desserts" },
    update: {},
    create: { name: "Desserts", slug: "desserts", icon: "\uD83C\uDF6E", sortOrder: 3 },
  });
  console.log("Kategorien erstellt");

  // Only seed products if none exist
  const productCount = await prisma.product.count();
  if (productCount > 0) {
    console.log(`Produkte existieren bereits (${productCount}), \u00fcbersprungen`);
    return;
  }

  await prisma.product.createMany({
    data: [
      // Shisha
      { name: "Doppelapfel", description: "Orientalischer Klassiker \u2014 intensives Anisaroma mit reifen Apfelnoten", price: 15.0, badge: "beliebt", sortOrder: 0, categoryId: shisha.id },
      { name: "Waldbeeren", description: "Himbeere, Brombeere und schwarze Johannisbeere in samtiger Rauchwolke", price: 16.0, sortOrder: 1, categoryId: shisha.id },
      { name: "Mango-Maracuja", description: "Tropischer Mix \u2014 saftige Mango mit s\u00e4uerlicher Maracuja", price: 17.0, badge: "neu", sortOrder: 2, categoryId: shisha.id },
      { name: "W\u00fcrzige Orange", description: "Sizilianische Orange, Zimt und eine Prise Kardamom", price: 16.0, badge: "scharf", sortOrder: 3, categoryId: shisha.id },
      { name: "Melone-Minze", description: "Honigmelone mit eisiger Minze \u2014 erfrischender Sommergeschmack", price: 15.5, sortOrder: 4, categoryId: shisha.id },
      { name: "Grapefruit-Rosmarin", description: "Herbe Grapefruit mit kr\u00e4uterigem Rosmarin. F\u00fcr Kenner", price: 18.0, sortOrder: 5, categoryId: shisha.id },
      { name: "Hausmischung", description: "Unser Shishameister kreiert einen einzigartigen Mix nach deiner Stimmung", price: 20.0, badge: "beliebt", sortOrder: 6, categoryId: shisha.id },
      { name: "Fruchtschale Premium", description: "Premium-Shisha in frischer Ananas oder Grapefruit serviert", price: 25.0, sortOrder: 7, categoryId: shisha.id },
      // Getr\u00e4nke
      { name: "Smoker Old Fashioned", description: "Bourbon, Rauchzucker, Angostura, Orangenzeste", price: 12.0, badge: "beliebt", sortOrder: 0, categoryId: drinks.id },
      { name: "Smoky Negroni", description: "Gin, Campari, roter Wermut, Kirschholzrauch", price: 11.5, sortOrder: 1, categoryId: drinks.id },
      { name: "Goldener Sour", description: "Whisky, Zitrone, Honig, Eiwei\u00df \u2014 seidige Schaumkrone mit Goldstaub", price: 11.0, badge: "neu", sortOrder: 2, categoryId: drinks.id },
      { name: "Dark Mojito", description: "Dunkler Rum, Rohrzucker, Limette, Minze, Soda", price: 10.5, sortOrder: 3, categoryId: drinks.id },
      { name: "Lavendel Gin Tonic", description: "Craft-Gin, Fever-Tree Tonic, Lavendelsirup, Lavendelbl\u00fcte", price: 10.0, sortOrder: 4, categoryId: drinks.id },
      { name: "Beeren-Smoke", description: "Alkoholfrei \u2014 Brombeere, Thymian, Soda, ger\u00e4uchertes Eis", price: 7.5, badge: "neu", sortOrder: 5, categoryId: drinks.id },
      { name: "Hauslimonade", description: "Zitrone, Yuzu, Ingwer, Rohrzuckersirup \u2014 unser Hausrezept", price: 6.0, sortOrder: 6, categoryId: drinks.id },
      { name: "Sanddorn-Tee", description: "Hei\u00dfer Tee mit Sanddorn, Honig und Zimtstange, Kanne 600 ml", price: 7.0, sortOrder: 7, categoryId: drinks.id },
      { name: "Matcha Latte", description: "Zeremonie-Matcha, Hafermilch, Vanille. Hei\u00df oder kalt", price: 7.5, sortOrder: 8, categoryId: drinks.id },
      { name: "Frisch gepresster Saft", description: "Orange, Grapefruit oder Mix nach Wahl \u2014 300 ml", price: 5.5, sortOrder: 9, categoryId: drinks.id },
      // Snacks
      { name: "K\u00e4seplatte", description: "Brie, Gorgonzola, Parmesan, Cheddar \u2014 Honig, Waln\u00fcsse, Trauben", price: 16.0, badge: "beliebt", sortOrder: 0, categoryId: snacks.id },
      { name: "Bruschetta Auswahl", description: "Drei Sorten: Tomate-Basilikum, Lachs-Frischk\u00e4se, Prosciutto-Rucola", price: 11.0, sortOrder: 1, categoryId: snacks.id },
      { name: "Knusprige Calamari", description: "In Panko mit Chili-Limetten-Sauce und Mikrogr\u00fcn", price: 10.0, badge: "neu", sortOrder: 2, categoryId: snacks.id },
      { name: "Nachos Grande", description: "Maischips, Cheddar, Jalape\u00f1o, Guacamole, Sauerrahm", price: 9.5, badge: "scharf", sortOrder: 3, categoryId: snacks.id },
      { name: "Fleischplatte", description: "Prosciutto, Salami, Coppa, Oliven, Kapern, Grissini", price: 15.0, sortOrder: 4, categoryId: snacks.id },
      { name: "Edamame mit Tr\u00fcffelsalz", description: "Gr\u00fcne Sojabohnen, ger\u00f6stet mit Knoblauch und Tr\u00fcffel\u00f6l", price: 7.0, sortOrder: 5, categoryId: snacks.id },
      // Desserts
      { name: "Tiramisu", description: "Mascarpone, L\u00f6ffelbiskuits, Espresso, Kakao \u2014 unser Hausrezept", price: 8.5, badge: "beliebt", sortOrder: 0, categoryId: desserts.id },
      { name: "Cheesecake San Sebasti\u00e1n", description: "Baskischer Cheesecake mit karamellisierter Kruste und Beerensauce", price: 9.0, sortOrder: 1, categoryId: desserts.id },
      { name: "Schokoladen-Fondant", description: "Warmer Kuchen mit fl\u00fcssigem Kern aus 72% Schokolade, Vanilleeis", price: 8.0, badge: "neu", sortOrder: 2, categoryId: desserts.id },
      { name: "Cr\u00e8me br\u00fbl\u00e9e", description: "Klassische Vanillecreme mit knuspriger Karamellkruste", price: 7.0, sortOrder: 3, categoryId: desserts.id },
      { name: "Honig-Baklava", description: "Hausgemachte Baklava mit Pistazie \u2014 drei St\u00fcck mit Honig", price: 6.0, sortOrder: 4, categoryId: desserts.id },
    ],
  });

  console.log("29 Produkte erstellt");
}

main()
  .then(() => {
    console.log("Seed abgeschlossen");
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });
