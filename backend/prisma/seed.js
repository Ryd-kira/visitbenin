// prisma/seed.js — Seed complet VisitBénin
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({ log: ['error'] })

async function main() {
  console.log('🌱 Démarrage du seed...\n')

  // ── ADMIN ──────────────────────────────────────────────────────
  const hash = await bcrypt.hash('Pendjari$2025!', 12)
  const admin = await prisma.user.upsert({
    where:  { email: 'superadmin@visitbenin.bj' },
    update: {},
    create: { email: 'superadmin@visitbenin.bj', name: 'Super Admin', password_hash: hash, role: 'admin', is_verified: true },
  })
  console.log('✅ Admin créé:', admin.email)

  // ── VILLES ─────────────────────────────────────────────────────
  const cities = await Promise.all([
    prisma.city.upsert({ where: { slug: 'cotonou' },       update: {}, create: { name: 'Cotonou',       slug: 'cotonou',       region: 'Littoral',   description: 'Capitale économique du Bénin, ville dynamique et cosmopolite.',              latitude: 6.3654,  longitude: 2.4183,  population: 800000  } }),
    prisma.city.upsert({ where: { slug: 'porto-novo' },    update: {}, create: { name: 'Porto-Novo',    slug: 'porto-novo',    region: 'Ouémé',      description: 'Capitale politique du Bénin, ville musée.',                                  latitude: 6.4969,  longitude: 2.6288,  population: 300000  } }),
    prisma.city.upsert({ where: { slug: 'ouidah' },        update: {}, create: { name: 'Ouidah',        slug: 'ouidah',        region: 'Atlantique', description: 'Berceau du Vodun, porte de la Route des Esclaves.',                         latitude: 6.3646,  longitude: 2.0844,  population: 80000   } }),
    prisma.city.upsert({ where: { slug: 'abomey' },        update: {}, create: { name: 'Abomey',        slug: 'abomey',        region: 'Zou',        description: 'Ancienne capitale du royaume du Dahomey.',                                   latitude: 7.1827,  longitude: 1.9914,  population: 90000   } }),
    prisma.city.upsert({ where: { slug: 'grand-popo' },    update: {}, create: { name: 'Grand-Popo',    slug: 'grand-popo',    region: 'Mono',       description: 'Station balnéaire, plages et mangroves.',                                    latitude: 6.2833,  longitude: 1.8283,  population: 15000   } }),
    prisma.city.upsert({ where: { slug: 'natitingou' },    update: {}, create: { name: 'Natitingou',    slug: 'natitingou',    region: 'Atacora',    description: "Porte d'entrée des Tata Somba et de la Pendjari.",                          latitude: 10.3033, longitude: 1.3806,  population: 100000  } }),
    prisma.city.upsert({ where: { slug: 'tanguieta' },     update: {}, create: { name: 'Tanguiéta',     slug: 'tanguieta',     region: 'Atacora',    description: 'Ville proche du Parc de la Pendjari.',                                       latitude: 10.6167, longitude: 1.2667,  population: 20000   } }),
    prisma.city.upsert({ where: { slug: 'abomey-calavi' }, update: {}, create: { name: 'Abomey-Calavi', slug: 'abomey-calavi', region: 'Atlantique', description: "Ville universitaire, siège de l'UAC.",                                       latitude: 6.4482,  longitude: 2.3362,  population: 450000  } }),
  ])
  console.log(`✅ ${cities.length} villes créées`)

  const cityMap = Object.fromEntries(cities.map(c => [c.slug, c.id]))

  // ── LIEUX ───────────────────────────────────────────────────────
  const placesData = [
    {
      name: "Palais Royaux d'Abomey", slug: 'palais-royaux-abomey', type: 'culture',
      description: "Les Palais Royaux d'Abomey constituent l'un des patrimoines historiques les plus importants du Bénin. Ce complexe palatial fut le siège du puissant royaume du Dahomey pendant près de trois siècles. Classé au patrimoine mondial de l'UNESCO en 1985, il abrite aujourd'hui un musée exceptionnel retraçant l'histoire des 12 rois du Dahomey.",
      short_desc: "Patrimoine UNESCO · 12 rois du Dahomey · Musée royal exceptionnel",
      city_id: cityMap['abomey'], latitude: 7.1827, longitude: 1.9914,
      entry_fee: 3000, cover_image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
      is_featured: true, is_published: true, is_unesco: true, tags: ['UNESCO', 'histoire', 'culture', 'musée'],
      created_by: admin.id,
    },
    {
      name: 'Ganvié — Village Lacustre', slug: 'ganvie-village-lacustre', type: 'culture',
      description: "Ganvié, surnommé le Venise de l'Afrique, est un village unique entièrement construit sur les eaux du lac Nokoué. Fondé au XVIIe siècle par le peuple Tofinu pour échapper aux razzias des guerriers Fon, ce village de 20 000 habitants vit aujourd'hui encore sur pilotis. Marchés flottants, piroguiers et maisons de bois créent un spectacle inoubliable.",
      short_desc: "Le Venise de l'Afrique · 20 000 habitants sur pilotis · Marchés flottants",
      city_id: cityMap['cotonou'], latitude: 6.4617, longitude: 2.4167,
      entry_fee: 15000, cover_image: 'https://images.unsplash.com/photo-1596386461350-326ccb383e9f?w=800',
      is_featured: true, is_published: true, tags: ['UNESCO', 'culture', 'nature', 'incontournable'],
      created_by: admin.id,
    },
    {
      name: 'Parc National de la Pendjari', slug: 'parc-pendjari', type: 'nature',
      description: "Le Parc National de la Pendjari est l'une des réserves naturelles les mieux préservées d'Afrique de l'Ouest, couvrant 4 800 km² de savane soudanienne. Il abrite l'une des dernières populations de lions, guépards et éléphants de la sous-région. Classé réserve de biosphère par l'UNESCO, il offre des safaris photo d'exception.",
      short_desc: "4800 km² · Lions, éléphants, hippopotames · L'une des meilleures réserves d'Afrique",
      city_id: cityMap['natitingou'], latitude: 11.1000, longitude: 1.5000,
      entry_fee: 5000, cover_image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
      is_featured: true, is_published: true, is_unesco: true, tags: ['safari', 'nature', 'UNESCO', 'incontournable'],
      created_by: admin.id,
    },
    {
      name: 'Route des Esclaves — Ouidah', slug: 'route-des-esclaves-ouidah', type: 'historique',
      description: "La Route des Esclaves de Ouidah est un mémorial historique poignant dédié aux millions d'Africains déportés en esclavage entre le XVIe et XIXe siècle. Ce chemin de 4 km, parsemé de monuments symboliques, mène de la place Chacha à la Porte du Non-Retour sur la plage atlantique. Un lieu de mémoire incontournable et émouvant.",
      short_desc: "Mémorial historique · 4 km de monuments · Porte du Non-Retour",
      city_id: cityMap['ouidah'], latitude: 6.3602, longitude: 2.0859,
      entry_fee: 2000, cover_image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      is_featured: true, is_published: true, tags: ['histoire', 'émouvant', 'mémorial', 'incontournable'],
      created_by: admin.id,
    },
    {
      name: 'Plage de Grand-Popo', slug: 'plage-grand-popo', type: 'plage',
      description: "Grand-Popo possède l'une des plus belles plages du Bénin — sable fin doré, palmiers, vagues de l'Atlantique et villages de pêcheurs authentiques. Loin du tourisme de masse, cette station balnéaire préservée offre un cadre idyllique pour la détente, le surf et la découverte de la culture locale.",
      short_desc: "Plage sauvage préservée · Surf · Villages de pêcheurs · Couchers de soleil",
      city_id: cityMap['grand-popo'], latitude: 6.2833, longitude: 1.8283,
      entry_fee: 0, cover_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      is_featured: false, is_published: true, tags: ['plage', 'surf', 'détente', 'nature'],
      created_by: admin.id,
    },
    {
      name: "Musée da Silva — Porto-Novo", slug: 'musee-da-silva-porto-novo', type: 'culture',
      description: "Le Musée da Silva est installé dans une magnifique demeure afro-brésilienne du XIXe siècle à Porto-Novo. Construit par la famille da Silva, des afro-brésiliens revenus d'esclavage, il retrace l'histoire de cette communauté unique et expose arts, objets et archives de l'époque coloniale.",
      short_desc: "Architecture afro-brésilienne · Histoire unique · Porto-Novo",
      city_id: cityMap['porto-novo'], latitude: 6.4969, longitude: 2.6288,
      entry_fee: 1500, cover_image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      is_featured: false, is_published: true, tags: ['musée', 'histoire', 'architecture', 'culture'],
      created_by: admin.id,
    },
  ]

  let placeCreated = 0
  for (const p of placesData) {
    await prisma.place.upsert({ where: { slug: p.slug }, update: {}, create: p })
      .then(() => placeCreated++).catch(e => console.warn('  ⚠️ place skip:', p.name, e.message))
  }
  console.log(`✅ ${placeCreated}/${placesData.length} lieux créés`)

  // ── RESTAURANTS ─────────────────────────────────────────────────
  const restaurantsData = [
    {
      name: 'Le Cameleon Cotonou', slug: 'le-cameleon-cotonou',
      description: 'Restaurant gastronomique beninois. Tartare de thon, barracuda grille, fondant au cacao local. Terrasse panoramique sur le lac.',
      short_desc: 'Gastronomie beninoise · Terrasse sur le lac · Fruits de mer',
      city_id: cityMap['cotonou'], price_range: 'high',
      latitude: 6.3721, longitude: 2.4198,
      cover_image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      phone: '+229 21 32 00 00', has_delivery: false, has_wifi: true, has_parking: true, has_ac: true,
      rating: 4.7, review_count: 89, is_published: true, is_featured: true,
      created_by: admin.id,
    },
    {
      name: 'Chez Clarisse', slug: 'chez-clarisse-cotonou',
      description: 'Cuisine beninoise authentique. Amiwo, sauce graine, tchoukoutou, poisson braise. Cours de cuisine sur reservation.',
      short_desc: 'Cuisine beninoise authentique · Cours de cuisine · Cadre familial',
      city_id: cityMap['cotonou'], price_range: 'medium',
      latitude: 6.3612, longitude: 2.4105,
      cover_image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
      phone: '+229 95 00 00 00', has_delivery: true, has_wifi: false, has_parking: false, has_ac: false,
      rating: 4.8, review_count: 203, is_published: true, is_featured: true,
      created_by: admin.id,
    },
    {
      name: 'La Pirogue de Grand-Popo', slug: 'la-pirogue-grand-popo',
      description: 'Fruits de mer frais peches le matin. Homard, crevettes geantes, barracuda grille. Les pieds dans le sable.',
      short_desc: 'Fruits de mer frais · Les pieds dans le sable · Couchers de soleil',
      city_id: cityMap['grand-popo'], price_range: 'medium',
      latitude: 6.2850, longitude: 1.8290,
      cover_image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
      phone: '+229 94 00 00 00', has_delivery: false, has_wifi: false, has_parking: true, has_ac: false,
      rating: 4.6, review_count: 147, is_published: true,
      created_by: admin.id,
    },
  ]

  let restoCreated = 0
  for (const r of restaurantsData) {
    await prisma.restaurant.upsert({ where: { slug: r.slug }, update: {}, create: r })
      .then(() => restoCreated++).catch(e => console.warn('  ⚠️ resto skip:', r.name, e.message))
  }
  console.log(`✅ ${restoCreated}/${restaurantsData.length} restaurants créés`)

  // ── ÉCOLES ──────────────────────────────────────────────────────
  const schoolsData = [
    {
      name: "Universite d'Abomey-Calavi", slug: 'universite-abomey-calavi',
      school_type: 'universite', program: 'francais',
      description: "Plus grande universite du Benin avec plus de 80 000 etudiants. Toutes disciplines.",
      short_desc: "80 000 etudiants · Principale universite du Benin · Francophone",
      city_id: cityMap['abomey-calavi'],
      latitude: 6.4228, longitude: 2.3347,
      cover_image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
      phone: '+229 21 36 00 84', website: 'https://uac.bj',
      is_aefe: false, is_published: true, rating: 4.1, review_count: 234,
      created_by: admin.id,
    },
    {
      name: 'Ecole Internationale de Cotonou', slug: 'ecole-internationale-cotonou',
      school_type: 'secondaire', program: 'international',
      description: "Ecole internationale offrant le baccalaureat francais et le diplome IB. Bilingue francais-anglais. Ideale pour les familles expatriees.",
      short_desc: "Bac francais + IB · Bilingue FR/EN · Familles expatriees",
      city_id: cityMap['cotonou'],
      latitude: 6.3589, longitude: 2.4203,
      cover_image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800',
      phone: '+229 21 30 00 00', website: 'https://eic.bj',
      is_aefe: true, is_published: true, rating: 4.5, review_count: 67,
      created_by: admin.id,
    },
    {
      name: 'Lycee Behanzin Porto-Novo', slug: 'lycee-behanzin-porto-novo',
      school_type: 'lycee', program: 'francais',
      description: "Plus vieux lycee du Benin, fonde en 1913. Formation generale et technique. Internat disponible.",
      short_desc: "Fonde en 1913 · Lycee historique · Internat · Bons resultats bac",
      city_id: cityMap['porto-novo'],
      latitude: 6.4900, longitude: 2.6250,
      cover_image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
      is_aefe: false, is_published: true, rating: 4.0, review_count: 89,
      created_by: admin.id,
    },
  ]

  let schoolCreated = 0
  for (const s of schoolsData) {
    await prisma.school.upsert({ where: { slug: s.slug }, update: {}, create: s })
      .then(() => schoolCreated++).catch(e => console.warn('  ⚠️ school skip:', s.name, e.message))
  }
  console.log(`✅ ${schoolCreated}/${schoolsData.length} écoles créées`)

  // ── ACTIVITÉS ───────────────────────────────────────────────────
  await prisma.activity.deleteMany()
  const activitiesData = [
    { icon: '🦁', title: 'Safari Pendjari',           description: "Lions, éléphants, hippos — 4 800 km² de savane protégée",                       type: 'excursion',  city: 'Natitingou',  price: 80000, duration: 480, tags: ['nature','safari','incontournable'],    order: 1,  is_published: true },
    { icon: '🚣', title: 'Ganvié en pirogue',          description: "Le Venise de l'Afrique — village lacustre sur le lac Nokoué",                    type: 'excursion',  city: 'Cotonou',     price: 15000, duration: 180, tags: ['UNESCO','culture','famille'],          order: 2,  is_published: true },
    { icon: '⛓️', title: 'Route des Esclaves',          description: "Mémorial historique poignant de la traite négrière à Ouidah",                   type: 'decouverte', city: 'Ouidah',      price: 3000,  duration: 120, tags: ['histoire','UNESCO','émouvant'],        order: 3,  is_published: true },
    { icon: '👑', title: "Palais Royaux d'Abomey",     description: "Site du patrimoine mondial — 12 rois du Dahomey",                               type: 'decouverte', city: 'Abomey',      price: 3000,  duration: 150, tags: ['UNESCO','histoire','culture'],         order: 4,  is_published: true },
    { icon: '🥁', title: 'Fête du Vodun',               description: "10 janvier — Célébration nationale à Ouidah",                                   type: 'activite',   city: 'Ouidah',      price: 0,     duration: 360, tags: ['festival','vodun','gratuit'],          order: 5,  is_published: true },
    { icon: '🏖️', title: 'Plage de Grand-Popo',         description: "Plage sauvage préservée, pêcheurs et couchers de soleil inoubliables",          type: 'activite',   city: 'Grand-Popo',  price: 0,     duration: 240, tags: ['plage','détente','gratuit'],           order: 6,  is_published: true },
    { icon: '🛍️', title: 'Marché Dantokpa',             description: "Le plus grand marché d'Afrique de l'Ouest — artisanat, épices, tissus",         type: 'activite',   city: 'Cotonou',     price: 0,     duration: 120, tags: ['shopping','culture','incontournable'], order: 7,  is_published: true },
    { icon: '🏛️', title: "Musée d'Abomey",              description: "Trésors royaux et arts du royaume du Dahomey",                                  type: 'decouverte', city: 'Abomey',      price: 2000,  duration: 90,  tags: ['musée','histoire','culture'],          order: 8,  is_published: true },
    { icon: '🏰', title: 'Tata Somba',                   description: "Maisons fortifiées des Betammaribé classées UNESCO",                            type: 'excursion',  city: 'Natitingou',  price: 5000,  duration: 300, tags: ['UNESCO','architecture','unique'],      order: 9,  is_published: true },
    { icon: '🚣', title: 'Kayak Lac Ahémé',              description: "Pagayez entre villages de pêcheurs sur le lac Ahémé",                          type: 'activite',   city: 'Grand-Popo',  price: 12000, duration: 180, tags: ['sport','nature','originalité'],        order: 10, is_published: true },
    { icon: '🍲', title: 'Cours de cuisine béninoise',   description: "Apprenez à préparer amiwo, tchoukoutou et sauce graine",                       type: 'activite',   city: 'Cotonou',     price: 20000, duration: 180, tags: ['gastronomie','culture','famille'],     order: 11, is_published: true },
    { icon: '🏄', title: 'Surf & Body Board',             description: "Vagues atlantiques sur la côte béninoise à Grand-Popo",                        type: 'activite',   city: 'Grand-Popo',  price: 8000,  duration: 120, tags: ['sport','plage','adrénaline'],          order: 12, is_published: true },
  ]
  for (const act of activitiesData) {
    await prisma.activity.create({ data: act }).catch(e => console.warn('  ⚠️ activity:', act.title, e.message))
  }
  console.log(`✅ ${activitiesData.length} activités créées`)

  // ── LOCATIONS ───────────────────────────────────────────────────
  await prisma.rental.deleteMany()
  const rentalsData = [
    { icon: '🚗', title: 'Citadine (Dacia, Kia)',      type: 'Voiture', price_day: 25000, features: ['Climatisé','GPS','Assurance'],              ideal: 'Cotonou & environs',       order: 1, is_published: true },
    { icon: '🚙', title: 'SUV 4x4 (Toyota Hilux)',     type: 'Voiture', price_day: 55000, features: ['4x4','Climatisé','GPS','Long trajet'],      ideal: 'Pendjari, Nord-Bénin',     order: 2, is_published: true },
    { icon: '🚐', title: 'Minibus (8-12 places)',       type: 'Voiture', price_day: 70000, features: ['Groupe','Climatisé','Bagages'],             ideal: 'Groupes & familles',       order: 3, is_published: true },
    { icon: '🛵', title: 'Moto-taxi privé (journée)',   type: 'Moto',    price_day: 8000,  features: ['Flexible','Rapide','Economique'],          ideal: 'Ville uniquement',         order: 4, is_published: true },
    { icon: '🏠', title: 'Studio meublé',               type: 'Appart',  price_day: 15000, features: ['WiFi','Cuisine equipee','Climatisé'],      ideal: 'Sejour 1 semaine+',        order: 5, is_published: true },
    { icon: '🏡', title: 'Appartement F2',              type: 'Appart',  price_day: 25000, features: ['WiFi','2 pieces','Cuisine','Climatisé'],   ideal: 'Couple ou petite famille', order: 6, is_published: true },
    { icon: '🏘️', title: 'Villa avec piscine',          type: 'Appart',  price_day: 80000, features: ['Piscine','Jardin','Personnel','Climatisé'], ideal: 'Sejour haut de gamme',   order: 7, is_published: true },
  ]
  for (const r of rentalsData) {
    await prisma.rental.create({ data: r }).catch(e => console.warn('  ⚠️ rental:', r.title, e.message))
  }
  console.log(`✅ ${rentalsData.length} locations créées`)

  // ── PARTENAIRES ─────────────────────────────────────────────────
  const partnersData = [
    {
      name: 'Bénin Découvertes Tours', slug: 'benin-decouvertes-tours',
      type: 'agence_tourisme', price_range: 'medium',
      description: "Agence spécialisée dans les circuits culturels et écotouristiques au Bénin. Guides certifiés, excursions Pendjari, Ganvié, Route des Esclaves.",
      short_desc: "Circuits culturels & écotourisme · Guides certifiés · Pendjari & Ganvié",
      city_id: cityMap['cotonou'],
      email: 'contact@benin-decouvertes.bj', phone: '+229 21 31 XX XX',
      website: 'https://benin-decouvertes.bj',
      services: ['Circuits guidés','Transferts aéroport','Safari Pendjari','Excursion Ganvié'],
      languages: ['Français','Anglais','Fon'],
      is_certified: true, is_featured: true, is_published: true, rating: 4.8, review_count: 124,
    },
    {
      name: 'Royal Palm Cotonou', slug: 'royal-palm-cotonou',
      type: 'hebergement', price_range: 'high',
      description: "Hôtel 4 étoiles en bord de mer à Cotonou. Piscine, restaurant gastronomique, spa, salles de conférence. Idéal pour voyages professionnels et de loisirs.",
      short_desc: "Hôtel 4 étoiles · Bord de mer · Piscine · Restaurant · Spa",
      city_id: cityMap['cotonou'],
      email: 'reservations@royalpalm.bj', phone: '+229 21 30 XX XX',
      website: 'https://royalpalm-cotonou.bj',
      services: ['Hébergement','Restaurant','Piscine','Spa','Salle conférence','WiFi','Navette'],
      languages: ['Français','Anglais'],
      is_certified: true, is_featured: true, is_published: true, rating: 4.6, review_count: 89,
    },
    {
      name: 'Ouidah Transfers', slug: 'ouidah-transfers',
      type: 'transport', price_range: 'low',
      description: "Service de transferts et locations de véhicules climatisés entre Cotonou, Ouidah, Grand-Popo et tout le Bénin. Chauffeurs expérimentés.",
      short_desc: "Transferts · Location voiture · Cotonou-Ouidah-Grand-Popo",
      city_id: cityMap['ouidah'],
      email: 'ouidahtransfers@gmail.com', phone: '+229 97 XX XX XX',
      services: ['Transfert aéroport','Location voiture','Chauffeur privé'],
      languages: ['Français','Anglais'],
      is_certified: false, is_featured: false, is_published: true, rating: 4.3, review_count: 42,
    },
    {
      name: 'Pendjari Safari Lodge', slug: 'pendjari-safari-lodge',
      type: 'excursion', price_range: 'high',
      description: "Spécialiste des safaris dans le Parc National de la Pendjari. Hébergement en lodge, guides animaliers certifiés, safaris photo et 4x4.",
      short_desc: "Safari Pendjari · Lodge · Guides certifiés · 4x4",
      city_id: cityMap['natitingou'],
      email: 'info@pendjari-lodge.bj', phone: '+229 23 XX XX XX',
      services: ['Safari 4x4','Lodge','Guide animalier','Safari photo','Pension complète'],
      languages: ['Français','Anglais','Allemand'],
      is_certified: true, is_featured: true, is_published: true, rating: 4.9, review_count: 67,
    },
  ]

  let partCreated = 0
  for (const p of partnersData) {
    await prisma.partner.upsert({ where: { slug: p.slug }, update: {}, create: p })
      .then(() => partCreated++).catch(e => console.warn('  ⚠️ partner skip:', p.name, e.message))
  }
  console.log(`✅ ${partCreated}/${partnersData.length} partenaires créés`)

  // ── HÔTELS ──────────────────────────────────────────────────────
  const hotelsData = [
    {
      name: "Hôtel du Lac Cotonou", slug: 'hotel-du-lac-cotonou',
      description: "Hôtel historique en bord de lagune, référence à Cotonou depuis 1963. Restaurant panoramique, piscine, business center.",
      city_id: cityMap['cotonou'], stars: 4, price_range: 'high',
      rating: 4.2, review_count: 156, is_published: true,
    },
    {
      name: "Auberge de la Côte", slug: 'auberge-cote-grand-popo',
      description: "Auberge de charme face à l'Atlantique à Grand-Popo. Bungalows en bois, piscine, restaurant de fruits de mer.",
      city_id: cityMap['grand-popo'], stars: 3, price_range: 'medium',
      rating: 4.5, review_count: 88, is_published: true,
    },
    {
      name: "Tata Somba Hotel", slug: 'tata-somba-hotel-natitingou',
      description: "Hôtel inspiré de l'architecture Tata Somba à Natitingou. Idéal comme base pour explorer la Pendjari.",
      city_id: cityMap['natitingou'], stars: 3, price_range: 'medium',
      rating: 4.1, review_count: 45, is_published: true,
    },
  ]

  let hotelCreated = 0
  for (const h of hotelsData) {
    await prisma.hotel.upsert({ where: { slug: h.slug }, update: {}, create: h })
      .then(() => hotelCreated++).catch(e => console.warn('  ⚠️ hotel skip:', h.name, e.message))
  }
  console.log(`✅ ${hotelCreated}/${hotelsData.length} hôtels créés`)

  console.log('\n🎉 Seed terminé avec succès !')
}

main()
  .catch(e => { console.error('❌ Seed échoué:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
