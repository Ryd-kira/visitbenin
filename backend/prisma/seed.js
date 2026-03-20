// backend/prisma/seed.js
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({ log: ['error'] })

async function main() {
  console.log('🌱 Seed VisitBénin...')

  // ── ADMIN ──
  const hash = await bcrypt.hash('Pendjari$2025!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'superadmin@visitbenin.bj' },
    update: {},
    create: { email: 'superadmin@visitbenin.bj', name: 'Super Admin', password_hash: hash, role: 'admin', is_verified: true },
  })
  console.log('  ✅ Admin créé')

  // ── VILLES ──
  const cities = await Promise.all([
    prisma.city.upsert({ where: { slug: 'cotonou' },       update: {}, create: { name: 'Cotonou',       slug: 'cotonou',       region: 'Littoral',   description: 'Capitale économique du Bénin, ville dynamique et cosmopolite.',      latitude: 6.3654,  longitude: 2.4183,  population: 800000 } }),
    prisma.city.upsert({ where: { slug: 'porto-novo' },    update: {}, create: { name: 'Porto-Novo',    slug: 'porto-novo',    region: 'Ouémé',      description: 'Capitale politique du Bénin, ville musée.',                          latitude: 6.4969,  longitude: 2.6288,  population: 300000 } }),
    prisma.city.upsert({ where: { slug: 'ouidah' },        update: {}, create: { name: 'Ouidah',        slug: 'ouidah',        region: 'Atlantique', description: 'Berceau du Vodun, porte de la Route des Esclaves.',                  latitude: 6.3646,  longitude: 2.0844,  population: 80000  } }),
    prisma.city.upsert({ where: { slug: 'abomey' },        update: {}, create: { name: 'Abomey',        slug: 'abomey',        region: 'Zou',        description: 'Ancienne capitale du royaume du Dahomey.',                           latitude: 7.1827,  longitude: 1.9914,  population: 90000  } }),
    prisma.city.upsert({ where: { slug: 'grand-popo' },    update: {}, create: { name: 'Grand-Popo',    slug: 'grand-popo',    region: 'Mono',       description: 'Station balnéaire, plages et mangroves.',                            latitude: 6.2833,  longitude: 1.8283,  population: 15000  } }),
    prisma.city.upsert({ where: { slug: 'natitingou' },    update: {}, create: { name: 'Natitingou',    slug: 'natitingou',    region: 'Atacora',    description: "Porte d'entrée des Tata Somba et de la Pendjari.",                  latitude: 10.3033, longitude: 1.3806,  population: 100000 } }),
    prisma.city.upsert({ where: { slug: 'tanguieta' },     update: {}, create: { name: 'Tanguiéta',     slug: 'tanguieta',     region: 'Atacora',    description: 'Ville proche du Parc de la Pendjari.',                               latitude: 10.6167, longitude: 1.2667,  population: 20000  } }),
    prisma.city.upsert({ where: { slug: 'abomey-calavi' }, update: {}, create: { name: 'Abomey-Calavi', slug: 'abomey-calavi', region: 'Atlantique', description: "Ville universitaire, siège de l'UAC.",                              latitude: 6.4482,  longitude: 2.3362,  population: 450000 } }),
    prisma.city.upsert({ where: { slug: 'parakou' },       update: {}, create: { name: 'Parakou',       slug: 'parakou',       region: 'Borgou',     description: 'Capitale du nord, carrefour commercial.',                            latitude: 9.3370,  longitude: 2.6280,  population: 300000 } }),
    prisma.city.upsert({ where: { slug: 'lokossa' },       update: {}, create: { name: 'Lokossa',       slug: 'lokossa',       region: 'Mono',       description: 'Capitale du Mono.',                                                  latitude: 6.6333,  longitude: 1.7167,  population: 60000  } }),
  ])

  const cityMap = Object.fromEntries(cities.map(c => [c.slug, c.id]))
  console.log('  ✅ Villes créées')

  // ── LIEUX — Images Wikimedia Commons (domaine public) ──
  const placesData = [
    {
      name: "Palais Royaux d'Abomey",
      slug: 'palais-royaux-abomey',
      type: 'culture',
      description: "Les Palais royaux d'Abomey sont un ensemble de palais construits par les rois du Dahomey entre le XVIIe et le XIXe siècle. Classés au patrimoine mondial de l'UNESCO en 1985, ils témoignent de la puissance et de la sophistication du royaume du Dahomey. On y découvre les bas-reliefs polychromes racontant les exploits des rois, les trônes royaux, les objets de cour et les fétiches vodun. Le musée abrite plus de 1000 œuvres dont des crânes de chefs ennemis montés sur des trônes, des tambours de guerre et des costumes royaux. Une visite incontournable pour comprendre l'histoire du Bénin.",
      short_desc: "Patrimoine UNESCO • Ancienne capitale du puissant royaume du Dahomey, ses palais millénaires abritent l'âme des rois Fon.",
      city_id: cityMap['abomey'],
      address: 'Quartier ZONGO, Abomey',
      latitude: 7.1827, longitude: 1.9914,
      entry_fee: 3000,
      phone: '+229 22 50 00 01',
      website: 'https://www.whc.unesco.org/fr/list/323',
      cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Palais_royal_abomey.jpg/1200px-Palais_royal_abomey.jpg',
      gallery: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Abomey_Palaces.jpg/1200px-Abomey_Palaces.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Abomey-musee.jpg/1200px-Abomey-musee.jpg',
      ],
      tags: ['UNESCO', 'histoire', 'culture', 'dahomey', 'musee', 'royaute'],
      is_featured: true, is_published: true, is_unesco: true,
      created_by: admin.id,
    },
    {
      name: 'Ganvié — Village Lacustre',
      slug: 'ganvie-village-lacustre',
      type: 'culture',
      description: "Ganvié, surnommée la Venise de l'Afrique, est un village construit entièrement sur des pilotis au milieu du lac Nokoué. Fondé au XVIIe siècle par le peuple Tofinu pour échapper aux razzias des guerriers Fon et Yoruba (qui avaient interdit de traverser l'eau pour leurs croyances vodun), ce village abrite aujourd'hui plus de 20 000 habitants. Les maisons, les mosquées, l'école, le marché flottant — tout est sur l'eau. La pirogue est le seul moyen de transport. Une expérience unique et une leçon d'ingéniosité humaine.",
      short_desc: "La Venise Africaine • 20 000 habitants vivent sur l'eau depuis le XVIIe siècle dans ce village de pilotis fascinant.",
      city_id: cityMap['cotonou'],
      address: 'Lac Nokoué, Sô-Ava',
      latitude: 6.4658, longitude: 2.4175,
      entry_fee: 15000,
      phone: '+229 97 00 00 00',
      cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Ganvie_stilt_village%2C_Benin.jpg/1200px-Ganvie_stilt_village%2C_Benin.jpg',
      gallery: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Ganvie_village.jpg/1200px-Ganvie_village.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Lake_Nokoue.jpg/1200px-Lake_Nokoue.jpg',
      ],
      tags: ['lac', 'pilotis', 'culture', 'tofinu', 'pirogue', 'unique'],
      is_featured: true, is_published: true, is_unesco: false,
      created_by: admin.id,
    },
    {
      name: 'Parc National de la Pendjari',
      slug: 'parc-pendjari',
      type: 'safari',
      description: "Le Parc National de la Pendjari est l'un des derniers grands sanctuaires de la faune sauvage en Afrique de l'Ouest. S'étendant sur 4 800 km² dans le nord-ouest du Bénin, il abrite des populations importantes de lions, d'éléphants, d'hippopotames, de buffles, de guépards et de plus de 300 espèces d'oiseaux. Géré en partenariat avec African Parks, le parc offre des safaris en 4x4, des randonnées pédestres guidées et des nuits en lodge. La rivière Pendjari forme une frontière naturelle avec le Burkina Faso et constitue un couloir migratoire essentiel.",
      short_desc: "Le dernier grand sanctuaire faunique d'Afrique de l'Ouest • Lions, éléphants, hippopotames en liberté dans 4 800 km².",
      city_id: cityMap['tanguieta'],
      address: 'Tanguiéta, Atacora',
      latitude: 11.1653, longitude: 1.5177,
      entry_fee: 5000,
      phone: '+229 23 82 00 00',
      website: 'https://www.african-parks.org/parks/pendjari',
      cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Pendjari_Hippo.jpg/1200px-Pendjari_Hippo.jpg',
      gallery: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Elephant_Pendjari.jpg/1200px-Elephant_Pendjari.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Lion_Pendjari_NP.jpg/1200px-Lion_Pendjari_NP.jpg',
      ],
      tags: ['safari', 'nature', 'lions', 'elephants', 'faune', 'reserve'],
      is_featured: true, is_published: true, is_unesco: false,
      created_by: admin.id,
    },
    {
      name: "Route des Esclaves — Ouidah",
      slug: 'route-des-esclaves-ouidah',
      type: 'historique',
      description: "La Route des Esclaves d'Ouidah est un parcours mémoriel de 4 km qui relie le centre de la ville à la mer, là où des millions d'Africains furent embarqués de force vers les Amériques entre le XVIe et le XIXe siècle. Jalonnée de monuments symboliques — l'Arbre de l'Oubli, la Place des Enchères, la Maison des Esclaves, la Forêt Sacrée — ce chemin se termine à la Porte du Non-Retour, une arche monumentale dressée face à l'Atlantique. Chaque année lors de la Fête du Vodun, des cérémonies de mémoire s'y tiennent.",
      short_desc: "Parcours mémoriel poignant • 4 km de mémoire de la traite négrière, de la Place des Enchères à la Porte du Non-Retour.",
      city_id: cityMap['ouidah'],
      address: "Centre-ville d'Ouidah jusqu'à la plage",
      latitude: 6.3646, longitude: 2.0844,
      entry_fee: 2000,
      cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Porte_du_non_retour_ouidah.jpg/1200px-Porte_du_non_retour_ouidah.jpg',
      gallery: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Ouidah_beach.jpg/1200px-Ouidah_beach.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Temple_des_pythons_ouidah.jpg/1200px-Temple_des_pythons_ouidah.jpg',
      ],
      tags: ['histoire', 'memoire', 'traite', 'vodun', 'patrimoine', 'incontournable'],
      is_featured: true, is_published: true, is_unesco: false,
      created_by: admin.id,
    },
    {
      name: 'Plage de Grand-Popo',
      slug: 'plage-grand-popo',
      type: 'plage',
      description: "Grand-Popo est la perle balnéaire du Bénin. Ses plages de sable fin s'étendent sur plusieurs kilomètres entre l'Atlantique et les mangroves du fleuve Mono. La ville abrite d'authentiques maisons coloniales brésiliennes (construites par des anciens esclaves retournés au Bénin), un marché animé et des pirogues de pêcheurs. Le lac Ahémé tout proche offre des excursions en pirogue dans les mangroves pour observer les oiseaux. Idéal pour la décompression, les couchers de soleil et la cuisine de poissons frais.",
      short_desc: "La perle balnéaire du Bénin • Plages de sable fin, mangroves du fleuve Mono et architecture coloniale brésilienne.",
      city_id: cityMap['grand-popo'],
      address: 'Plage principale, Grand-Popo',
      latitude: 6.2833, longitude: 1.8283,
      entry_fee: 0,
      cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Grand-Popo_Benin.jpg/1200px-Grand-Popo_Benin.jpg',
      gallery: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Grand_Popo_beach_Benin.jpg/1200px-Grand_Popo_beach_Benin.jpg',
      ],
      tags: ['plage', 'mer', 'mangrove', 'colonial', 'detente', 'peche'],
      is_featured: true, is_published: true, is_unesco: false,
      created_by: admin.id,
    },
    {
      name: 'Temple des Pythons — Ouidah',
      slug: 'temple-des-pythons-ouidah',
      type: 'religieux',
      description: "Au cœur d'Ouidah, le Temple des Pythons (ou Daagbo Hounon) est un sanctuaire vodun habité par des dizaines de pythons royaux considérés comme sacrés. Dans la tradition vodun fon, le python Dan représente la force vitale et le lien entre le monde des vivants et celui des esprits. Les visiteurs peuvent entrer dans le temple, laisser un python s'enrouler autour d'eux et assister aux cérémonies. Les prêtres vodun veillent sur ces reptiles depuis des siècles. Une expérience unique et déroutante au cœur de la spiritualité béninoise.",
      short_desc: "Sanctuaire vodun • Des dizaines de pythons royaux sacrés cohabitent avec les fidèles dans ce temple au cœur d'Ouidah.",
      city_id: cityMap['ouidah'],
      address: 'Centre-ville, Ouidah',
      latitude: 6.3611, longitude: 2.0861,
      entry_fee: 1500,
      cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Temple_des_pythons_ouidah.jpg/1200px-Temple_des_pythons_ouidah.jpg',
      gallery: [],
      tags: ['vodun', 'python', 'religieux', 'spiritualite', 'unique', 'ouidah'],
      is_featured: false, is_published: true, is_unesco: false,
      created_by: admin.id,
    },
    {
      name: "Château Tata Somba — Natitingou",
      slug: 'tata-somba-natitingou',
      type: 'culture',
      description: "Les châteaux Tata Somba (ou Tata Batammariba) sont des habitations-forteresses construites par le peuple Batammariba dans les monts Atacora. Classés au patrimoine mondial de l'UNESCO, ces édifices à deux étages en banco (terre crue) sont conçus comme des microcosmes du cosmos. Le rez-de-chaussée abrite les greniers et les animaux, le premier étage les chambres et les autels, et le toit-terrasse les cérémonies. Chaque Tata est unique et reflète le statut et l'histoire familiale de ses habitants. La région d'Koutammakou est le plus bel exemple de ce mode de construction millénaire.",
      short_desc: "Patrimoine UNESCO • Les forteresses-habitations Batammariba défient le temps dans les monts Atacora depuis des siècles.",
      city_id: cityMap['natitingou'],
      address: 'Koutammakou, monts Atacora',
      latitude: 10.5, longitude: 1.25,
      entry_fee: 2000,
      cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Tata_Somba_Benin.jpg/1200px-Tata_Somba_Benin.jpg',
      gallery: [],
      tags: ['UNESCO', 'architecture', 'batammariba', 'atacora', 'culture', 'unique'],
      is_featured: true, is_published: true, is_unesco: true,
      created_by: admin.id,
    },
    {
      name: 'Forêt Sacrée de Kpasse — Ouidah',
      slug: 'foret-sacree-kpasse-ouidah',
      type: 'religieux',
      description: "La Forêt Sacrée de Kpasse est un sanctuaire naturel de 2 hectares au cœur d'Ouidah, dédié au roi-python Kpasse, fondateur légendaire de la ville. Cette forêt abrite des dizaines de statues vodun représentant les divinités (Vodun) du panthéon fon : Legba le gardien des carrefours, Zangbeto le gardien de la nuit, Ogou le dieu de la guerre, Sakpata le dieu de la terre. Un parcours initiatique guidé permet de découvrir la signification de chaque statue et l'histoire de la ville. Incontournable pour comprendre la culture vodun.",
      short_desc: "Sanctuaire de 2 hectares • Statues des divinités Vodun, temples secrets et histoire de la fondation d'Ouidah.",
      city_id: cityMap['ouidah'],
      address: "Centre d'Ouidah",
      latitude: 6.3624, longitude: 2.0841,
      entry_fee: 2000,
      cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Foret_sacree_kpasse.jpg/1200px-Foret_sacree_kpasse.jpg',
      gallery: [],
      tags: ['vodun', 'foret', 'spiritualite', 'divinites', 'histoire', 'initiation'],
      is_featured: false, is_published: true, is_unesco: false,
      created_by: admin.id,
    },
    {
      name: 'Musée Da Silva — Porto-Novo',
      slug: 'musee-da-silva-porto-novo',
      type: 'culture',
      description: "Le Musée Da Silva est installé dans la villa brésilienne de la famille Da Silva, l'une des plus importantes familles d'anciens esclaves retournés au Bénin depuis le Brésil au XIXe siècle. Ces 'Agudas' (Brésiliens) ont profondément marqué l'architecture, la cuisine et la culture de Porto-Novo et de Cotonou. Le musée présente des objets de la vie quotidienne, des costumes, des photos et des documents retraçant cette histoire fascinante des allers-retours entre l'Afrique et le Brésil. L'architecture coloniale brésilienne du bâtiment est en elle-même un témoignage exceptionnel.",
      short_desc: "Villa coloniale brésilienne • Histoire des 'Agudas', anciens esclaves revenus du Brésil avec leur culture et leur architecture.",
      city_id: cityMap['porto-novo'],
      address: 'Rue de France, Porto-Novo',
      latitude: 6.4964, longitude: 2.6289,
      entry_fee: 1500,
      cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Musee_Da_Silva_Porto_Novo.jpg/1200px-Musee_Da_Silva_Porto_Novo.jpg',
      gallery: [],
      tags: ['musee', 'bresil', 'aguda', 'colonial', 'architecture', 'histoire'],
      is_featured: false, is_published: true, is_unesco: false,
      created_by: admin.id,
    },
    {
      name: 'Lac Ahémé et Marché de Possotomé',
      slug: 'lac-aheme-possotome',
      type: 'nature',
      description: "Le Lac Ahémé est un lac lagunaire de 80 km² relié à l'Atlantique et au fleuve Mono. Ses rives abritent des villages de pêcheurs dont Possotomé, réputé pour ses sources thermales et son marché hebdomadaire coloré. Les excursions en pirogue au lever du soleil permettent d'observer les académies de pêche traditionnelle (nasses en bambou), les filets tendus entre des rangées de bambous et les pêcheurs qui remontent leurs prises. Les sources thermales sulfureuses de Possotomé sont réputées pour leurs vertus thérapeutiques.",
      short_desc: "Lac lagunaire de 80 km² • Pêche traditionnelle en pirogue, marché coloré et sources thermales de Possotomé.",
      city_id: cityMap['lokossa'],
      address: 'Possotomé, Lac Ahémé',
      latitude: 6.4167, longitude: 1.8833,
      entry_fee: 0,
      cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Lac_Aheme_Benin.jpg/1200px-Lac_Aheme_Benin.jpg',
      gallery: [],
      tags: ['lac', 'nature', 'peche', 'pirogue', 'thermales', 'marche'],
      is_featured: false, is_published: true, is_unesco: false,
      created_by: admin.id,
    },
  ]

  for (const p of placesData) {
    await prisma.place.upsert({ where: { slug: p.slug }, update: {}, create: p })
  }
  console.log(`  ✅ ${placesData.length} lieux créés`)

  // ── RESTAURANTS — avec vraies adresses béninoises ──
  const restaurantsData = [
    {
      name: 'La Calebasse',
      slug: 'la-calebasse-cotonou',
      description: "Restaurant de référence à Cotonou pour la cuisine béninoise authentique. La Calebasse propose les grands classiques : sauce gluée au gombo, amiwo (pâte rouge), poulet bicyclette grillé, poisson braisé sauce tomate. La terrasse ombragée avec vue sur le jardin et les sculptures en bois en fait un endroit idéal pour découvrir la gastronomie locale dans un cadre agréable.",
      short_desc: 'La référence de la cuisine béninoise à Cotonou • Sauce gluée, amiwo, poisson braisé dans un cadre verdoyant.',
      city_id: cityMap['cotonou'],
      address: 'Haie Vive, Cotonou',
      latitude: 6.3717, longitude: 2.4162,
      price_range: 'medium',
      cuisine_type: 'Béninoise traditionnelle',
      has_reservation: true,
      phone: '+229 21 30 12 34',
      cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Benin_food_sauce.jpg/800px-Benin_food_sauce.jpg',
      gallery: [],
      is_featured: true, is_published: true,
      created_by: admin.id,
    },
    {
      name: 'Maquis de la Plage — Grand-Popo',
      slug: 'maquis-plage-grand-popo',
      description: "Pieds dans le sable, face à l'Atlantique. Ce maquis familial sert les meilleurs poissons et fruits de mer frais du jour : capitaine grillé, crevettes de l'Atlantique, langouste sauce vierge. La pêche est faite chaque matin par les pêcheurs locaux. Une adresse simple et authentique pour déjeuner en regardant les vagues.",
      short_desc: "Pieds dans le sable face à l'Atlantique • Poisson du jour, crevettes fraîches et langouste pêchée le matin même.",
      city_id: cityMap['grand-popo'],
      address: 'Plage principale, Grand-Popo',
      latitude: 6.2820, longitude: 1.8260,
      price_range: 'low',
      cuisine_type: 'Fruits de mer',
      has_reservation: false,
      phone: '+229 97 45 67 89',
      cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Grand_Popo_beach_Benin.jpg/800px-Grand_Popo_beach_Benin.jpg',
      gallery: [],
      is_featured: true, is_published: true,
      created_by: admin.id,
    },
    {
      name: 'Restaurant du Musée — Cotonou',
      slug: 'restaurant-musee-cotonou',
      description: "Attenant au Musée de Plein Air de Cotonou, ce restaurant propose une cuisine fusion mêlant recettes béninoises et influences françaises. Idéal pour un déjeuner culturel après la visite du musée. Spécialités : foie de bœuf à la béninoise, ndolé camerounais, thiéboudienne sénégalais revisité, et les fameux ignames pilés au beurre de karité.",
      short_desc: "Cuisine fusion afro-française • À deux pas du Musée de Plein Air, l'endroit parfait pour un déjeuner culturel.",
      city_id: cityMap['cotonou'],
      address: 'Boulevard Saint-Michel, Cotonou',
      latitude: 6.3591, longitude: 2.4268,
      price_range: 'medium',
      cuisine_type: 'Fusion africaine',
      has_reservation: true,
      phone: '+229 21 31 45 67',
      cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Akassa-benin.jpg/800px-Akassa-benin.jpg',
      gallery: [],
      is_featured: false, is_published: true,
      created_by: admin.id,
    },
  ]

  for (const r of restaurantsData) {
    await prisma.restaurant.upsert({ where: { slug: r.slug }, update: {}, create: r })
  }
  console.log(`  ✅ ${restaurantsData.length} restaurants créés`)

  // ── ÉCOLES ──
  const schoolsData = [
    {
      name: "Université d'Abomey-Calavi (UAC)",
      slug: 'universite-abomey-calavi',
      school_type: 'universite',
      program: 'public',
      description: "L'Université d'Abomey-Calavi (UAC) est la principale université publique du Bénin. Fondée en 1970, elle accueille plus de 80 000 étudiants dans ses différentes facultés et grandes écoles : FASHS (lettres et sciences humaines), FAST (sciences et techniques), Faculté de Droit, Médecine, ENEAM (économie et management), EPAC (polytechnique), et bien d'autres. Le campus principal est situé à Abomey-Calavi, à 20 km de Cotonou.",
      short_desc: "Principale université du Bénin • 80 000 étudiants, 10+ facultés, campus de 600 ha à Abomey-Calavi.",
      city_id: cityMap['abomey-calavi'],
      address: 'Campus UAC, Abomey-Calavi',
      latitude: 6.4082, longitude: 2.3406,
      website: 'https://uac.bj',
      phone: '+229 21 36 00 74',
      email: 'webmaster@uac.bj',
      student_count: 80000,
      founded_year: 1970,
      fees_range_min: 15000,
      fees_range_max: 100000,
      levels: ['Licence', 'Master', 'Doctorat'],
      languages: ['Français'],
      is_aefe: false,
      accepts_international: true,
      cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/University_of_Abomey-Calavi.jpg/1200px-University_of_Abomey-Calavi.jpg',
      gallery: [],
      is_featured: true, is_published: true,
      created_by: admin.id,
    },
    {
      name: 'Lycée Français de Cotonou (LFC)',
      slug: 'lycee-francais-cotonou',
      school_type: 'lycee',
      program: 'prive',
      description: "Le Lycée Français de Cotonou est un établissement homologué par le Ministère de l'Éducation nationale français, membre du réseau AEFE (Agence pour l'Enseignement Français à l'Étranger). Il accueille de la maternelle à la terminale les enfants français expatriés et béninois. Préparation au Baccalauréat français (général, technologique). Internat disponible pour les lycéens. Activités sportives et culturelles nombreuses.",
      short_desc: "Établissement AEFE homologué • Maternelle à Terminale, Baccalauréat français, internat disponible à Cotonou.",
      city_id: cityMap['cotonou'],
      address: 'Haie Vive, Cotonou',
      latitude: 6.3724, longitude: 2.4144,
      website: 'https://www.lfcotonou.org',
      phone: '+229 21 30 01 02',
      email: 'secretariat@lfcotonou.org',
      student_count: 1200,
      founded_year: 1962,
      fees_range_min: 1500000,
      fees_range_max: 3000000,
      levels: ['Maternelle', 'Primaire', 'Collège', 'Lycée'],
      languages: ['Français'],
      is_aefe: true,
      accepts_international: true,
      cover_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/UAC_Bénin.jpg/800px-UAC_Bénin.jpg',
      gallery: [],
      is_featured: true, is_published: true,
      created_by: admin.id,
    },
  ]

  for (const s of schoolsData) {
    await prisma.school.upsert({ where: { slug: s.slug }, update: {}, create: s })
  }
  console.log(`  ✅ ${schoolsData.length} écoles créées`)

  console.log('\n🎉 Seed terminé avec succès !')
}

main().catch(console.error).finally(() => prisma.$disconnect())
