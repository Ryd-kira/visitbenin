// backend/prisma/seed-marketplace.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({ log: ['error'] })

async function main() {
  console.log('🛒 Seed marketplace...')

  const admin = await prisma.user.findFirst({ where: { role: 'admin' } })
  if (!admin) { console.log('❌ Admin introuvable — lancez seed.js d\'abord'); return }

  // ── BOUTIQUES ──
  const shopsData = [
    {
      owner_id: admin.id,
      name: 'Marché MissèBo',
      slug: 'marche-missebo',
      description: 'Le plus grand marché en ligne du Bénin. Produits locaux frais, artisanat, vêtements traditionnels livrés à domicile à Cotonou.',
      cover_image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      city: 'Cotonou',
      address: 'Quartier Haie Vive, Cotonou',
      phone: '+229 97 55 00 00',
      whatsapp: '+229 97 55 00 00',
      is_verified: true, is_published: true,
    },
    {
      owner_id: admin.id,
      name: 'Atelier Abomey Bronze',
      slug: 'atelier-abomey-bronze',
      description: 'Sculptures et bas-reliefs en bronze d\'Abomey, technique ancestrale transmise depuis les rois Fon. Chaque pièce est unique et signée.',
      cover_image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      city: 'Abomey',
      address: 'Rue des Artisans, Abomey',
      phone: '+229 95 12 34 56',
      whatsapp: '+229 95 12 34 56',
      is_verified: true, is_published: true,
    },
    {
      owner_id: admin.id,
      name: 'Épices & Saveurs du Bénin',
      slug: 'epices-saveurs-benin',
      description: 'Épices rares, condiments traditionnels, huile de palme rouge pressée à froid, poudre de locust bean (nétété) — directement des coopératives rurales.',
      cover_image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800',
      city: 'Cotonou',
      address: 'Marché Dantokpa, Box 412',
      phone: '+229 96 78 90 12',
      whatsapp: '+229 96 78 90 12',
      is_verified: true, is_published: true,
    },
    {
      owner_id: admin.id,
      name: 'Kita Couture — Tissus Traditionnels',
      slug: 'kita-couture',
      description: 'Tissus Kita tissés à la main, pagnes wax authentiques, tenues Yoruba et Fon sur mesure. Expédition internationale disponible.',
      cover_image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800',
      city: 'Porto-Novo',
      address: 'Quartier Ouando, Porto-Novo',
      phone: '+229 97 23 45 67',
      whatsapp: '+229 97 23 45 67',
      is_verified: true, is_published: true,
    },
    {
      owner_id: admin.id,
      name: 'Poterie de Natitingou',
      slug: 'poterie-natitingou',
      description: 'Poteries Betammaribé faites à la main selon les techniques millénaires du nord Bénin. Jarres, bols, sculptures décoratives.',
      cover_image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
      city: 'Natitingou',
      address: 'Village artisanal, Natitingou',
      phone: '+229 95 67 89 01',
      whatsapp: '+229 95 67 89 01',
      is_verified: false, is_published: true,
    },
  ]

  const shops = {}
  for (const s of shopsData) {
    const shop = await prisma.shop.upsert({ where: { slug: s.slug }, update: {}, create: s })
    shops[s.slug] = shop
    console.log(`  ✅ Boutique: ${shop.name}`)
  }

  // ── PRODUITS ──
  const productsData = [
    // MissèBo — Nourriture
    { shop_id: shops['marche-missebo'].id, name: 'Huile de palme rouge bio', slug: 'huile-palme-rouge-bio', description: 'Huile de palme rouge pressée à froid, 100% naturelle sans conservateur. Idéale pour les sauces gluées et plats traditionnels béninois.', price: 3500, unit: 'litre', stock: 50, category: 'nourriture', images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600'], tags: ['bio', 'local', 'cuisine'], is_published: true, is_featured: true },
    { shop_id: shops['marche-missebo'].id, name: 'Pâte d\'arachide artisanale', slug: 'pate-arachide-artisanale', description: 'Pâte d\'arachide pure, broyée à la meule traditionnelle. Sans huile ajoutée, sans sucre. Parfaite pour la sauce d\'arachide.', price: 2000, unit: 'pot 500g', stock: 30, category: 'nourriture', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], tags: ['arachide', 'artisanal', 'sauce'], is_published: true, is_featured: false },
    { shop_id: shops['marche-missebo'].id, name: 'Sodabi artisanal de Savalou', slug: 'sodabi-savalou', description: 'Eau-de-vie de palme distillée traditionnellement à Savalou. 45° naturel, bouteille 50cl. Idéal en cadeau ou dégustation.', price: 4500, unit: 'bouteille 50cl', stock: 20, category: 'nourriture', images: ['https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600'], tags: ['alcool', 'traditionnel', 'cadeau'], is_published: true, is_featured: true },
    { shop_id: shops['marche-missebo'].id, name: 'Crevettes fumées du Lac Nokoué', slug: 'crevettes-fumees-lac-nokoue', description: 'Crevettes séchées et fumées par les pêcheurs Tofinu de Ganvié. Ingrédient essentiel des sauces béninoises.', price: 5000, unit: 'sachet 250g', stock: 40, category: 'nourriture', images: ['https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600'], tags: ['poisson', 'fumé', 'ganvié'], is_published: true, is_featured: false },

    // Abomey Bronze — Artisanat
    { shop_id: shops['atelier-abomey-bronze'].id, name: 'Bas-relief Rois du Dahomey', slug: 'bas-relief-rois-dahomey', description: 'Bas-relief en bronze représentant les exploits des rois du Dahomey. Technique ancestrale à la cire perdue. Dimensions : 30×40cm.', price: 85000, original_price: 100000, unit: 'pièce', stock: 5, category: 'artisanat', images: ['https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=600'], tags: ['bronze', 'dahomey', 'UNESCO', 'art'], is_published: true, is_featured: true },
    { shop_id: shops['atelier-abomey-bronze'].id, name: 'Statuette Vodun Legba', slug: 'statuette-vodun-legba', description: 'Statuette du dieu carrefour Legba en bronze. Symbole de protection et de communication avec les esprits. H: 20cm.', price: 35000, unit: 'pièce', stock: 8, category: 'artisanat', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], tags: ['vodun', 'bronze', 'spiritualité'], is_published: true, is_featured: false },
    { shop_id: shops['atelier-abomey-bronze'].id, name: 'Masque Gelede en bois sculpté', slug: 'masque-gelede-bois', description: 'Masque Gelede sculpté à la main dans du bois de fromager. Utilisé lors des cérémonies Gelede du patrimoine UNESCO.', price: 45000, unit: 'pièce', stock: 6, category: 'artisanat', images: ['https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600'], tags: ['masque', 'gelede', 'bois', 'UNESCO'], is_published: true, is_featured: true },

    // Épices & Saveurs
    { shop_id: shops['epices-saveurs-benin'].id, name: 'Nétété (Locust Bean) en poudre', slug: 'netete-poudre', description: 'Graines de néré fermentées et séchées, l\'umami africain. Indispensable dans les sauces gombos et les ragoûts béninois. 200g.', price: 2500, unit: 'sachet 200g', stock: 60, category: 'nourriture', images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600'], tags: ['épice', 'fermenté', 'traditionnel'], is_published: true, is_featured: true },
    { shop_id: shops['epices-saveurs-benin'].id, name: 'Poivre de Guinée (Maniguette)', slug: 'poivre-guinee-maniguette', description: 'Grains de maniguette (poivre de paradis) du Bénin. Arôme poivré et légèrement citronné. 100g en sachet hermétique.', price: 3000, unit: 'sachet 100g', stock: 45, category: 'nourriture', images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600'], tags: ['épice', 'rare', 'poivre'], is_published: true, is_featured: false },
    { shop_id: shops['epices-saveurs-benin'].id, name: 'Mélange d\'épices Sauce Gluée', slug: 'melange-sauce-gluee', description: 'Mélange prêt-à-l\'emploi pour sauce gluée authentique : gombo séché, nétété, poivre de Guinée. Recette de Grand-mère.', price: 3500, unit: 'sachet', stock: 35, category: 'nourriture', images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600'], tags: ['épice', 'sauce', 'recette'], is_published: true, is_featured: true },

    // Kita Couture
    { shop_id: shops['kita-couture'].id, name: 'Pagne Kita tissé main — Motif Royal', slug: 'pagne-kita-motif-royal', description: 'Pagne Kita tissé sur métier traditionnel à Porto-Novo. Motif royal Yoruba, coloris or et bordeaux. 2m × 1.10m.', price: 18000, original_price: 22000, unit: 'pièce', stock: 12, category: 'vetements', images: ['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600'], tags: ['pagne', 'kita', 'yoruba', 'tissu'], is_published: true, is_featured: true },
    { shop_id: shops['kita-couture'].id, name: 'Boubou Fon brodé homme', slug: 'boubou-fon-homme', description: 'Grand boubou en coton blanc brodé à la main selon les traditions Fon d\'Abomey. Disponible en S, M, L, XL.', price: 35000, unit: 'pièce', stock: 8, category: 'vetements', images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600'], tags: ['boubou', 'brodé', 'homme', 'fon'], is_published: true, is_featured: false },
    { shop_id: shops['kita-couture'].id, name: 'Wax Authentique Vlisco 6 yards', slug: 'wax-vlisco-6-yards', description: 'Wax Vlisco Holland original, 6 yards. Motifs africains exclusifs. Certifié authentique avec étiquette hologramme.', price: 55000, unit: '6 yards', stock: 15, category: 'vetements', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], tags: ['wax', 'vlisco', 'authentique'], is_published: true, is_featured: true },

    // Poterie Natitingou
    { shop_id: shops['poterie-natitingou'].id, name: 'Jarre à eau Betammaribé', slug: 'jarre-eau-betammaribe', description: 'Jarre en terre cuite façonnée à la main selon la tradition Betammaribé. Maintient l\'eau fraîche naturellement. H: 45cm.', price: 12000, unit: 'pièce', stock: 10, category: 'artisanat', images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600'], tags: ['poterie', 'betammaribé', 'terre cuite'], is_published: true, is_featured: true },
    { shop_id: shops['poterie-natitingou'].id, name: 'Set de 4 bols décorés', slug: 'set-bols-decores', description: 'Set de 4 bols en terre cuite décorés de motifs géométriques traditionnels du nord Bénin. Idéal pour la déco ou le service.', price: 18000, unit: 'set de 4', stock: 7, category: 'artisanat', images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600'], tags: ['poterie', 'bols', 'décoration'], is_published: true, is_featured: false },
  ]

  let prodCount = 0
  for (const p of productsData) {
    await prisma.product.upsert({ where: { slug: p.slug }, update: {}, create: p })
    prodCount++
  }
  console.log(`  ✅ ${prodCount} produits créés`)
  console.log(`\n🛒 Marketplace seedée : ${shopsData.length} boutiques, ${prodCount} produits`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
