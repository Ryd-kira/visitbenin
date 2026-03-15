// backend/prisma/seed-events.js
// Seed des fêtes, cérémonies et événements culturels du Bénin
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({ log: ['error'] })

const EVENTS = [
  // ── FÊTES NATIONALES ──
  {
    name: 'Fête Nationale du Vodun',
    slug: 'fete-vodun',
    description: "La fête du Vodun est célébrée chaque 10 janvier, jour férié national depuis 1996. Ouidah devient l'épicentre mondial du Vodun avec des cérémonies de possession, danses rituelles, processions colorées sur la Route des Esclaves et la plage. Des adeptes du Bénin, du Togo, du Nigéria, du Brésil et d'Haïti convergent pour honorer les divinités. Une expérience spirituelle et culturelle sans équivalent en Afrique.",
    location: 'Ouidah, Place Chacha et Route des Esclaves',
    city: 'Ouidah',
    latitude: 6.3676,
    longitude: 2.0852,
    cover_image: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=800',
    date_start: new Date('2026-01-10'),
    date_end: new Date('2026-01-12'),
    is_recurring: true,
    recurrence: 'Chaque 10 janvier',
    tags: ['vodun', 'spiritualité', 'culture', 'patrimoine', 'fête-nationale'],
    is_published: true,
  },
  {
    name: 'Fête de l\'Indépendance du Bénin',
    slug: 'independance-benin',
    description: "Le 1er août marque l'indépendance du Bénin depuis 1960. Défilés militaires et civils place du Souvenir à Cotonou, feux d'artifice sur la lagune, spectacles culturels, concerts et événements sportifs dans tout le pays. Les ambassades organisent des réceptions et les musées proposent des visites spéciales.",
    location: 'Place du Souvenir, Cotonou',
    city: 'Cotonou',
    latitude: 6.3654,
    longitude: 2.4183,
    cover_image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800',
    date_start: new Date('2026-08-01'),
    date_end: new Date('2026-08-01'),
    is_recurring: true,
    recurrence: 'Chaque 1er août',
    tags: ['fête-nationale', 'histoire', 'défilé', 'cotonou'],
    is_published: true,
  },

  // ── CÉRÉMONIES TRADITIONNELLES ──
  {
    name: 'Gani — Fête Royale de Nikki',
    slug: 'gani-nikki',
    description: "Le Gani est la fête annuelle du cheval et de la royauté Bariba à Nikki, dans le Borgou. Des centaines de cavaliers en tenue traditionnelle déferlent devant le palais royal dans un spectacle de fantasia époustouflant. Chants, griots, offrandes au roi — une célébration de l'identité Bariba transmise depuis des siècles. L'une des fêtes les plus spectaculaires d'Afrique de l'Ouest.",
    location: 'Palais Royal de Nikki, Borgou',
    city: 'Nikki',
    latitude: 9.9395,
    longitude: 3.2099,
    cover_image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
    date_start: new Date('2026-03-14'),
    date_end: new Date('2026-03-15'),
    is_recurring: true,
    recurrence: 'Annuel (date variable selon calendrier lunaire)',
    tags: ['royauté', 'cheval', 'bariba', 'tradition', 'borgou'],
    is_published: true,
  },
  {
    name: 'Nonvitcha — Cérémonie Fon d\'Abomey',
    slug: 'nonvitcha-abomey',
    description: "Le Nonvitcha est la grande fête annuelle du royaume d'Abomey, organisée par les descendants des rois Fon. Cérémonies de libation aux ancêtres royaux dans les palais classés UNESCO, danses des amazones, exposition des trésors royaux et offrandes aux divinités Fon. Un moment de recueillement et de fierté pour tout le peuple Fon du Bénin.",
    location: 'Palais Royal d\'Abomey',
    city: 'Abomey',
    latitude: 7.1827,
    longitude: 1.9897,
    cover_image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800',
    date_start: new Date('2026-11-15'),
    date_end: new Date('2026-11-16'),
    is_recurring: true,
    recurrence: 'Annuel (novembre)',
    tags: ['royauté', 'fon', 'abomey', 'amazones', 'patrimoine', 'unesco'],
    is_published: true,
  },
  {
    name: 'Gaani — Fête des Dendi de Djougou',
    slug: 'gaani-djougou',
    description: "Le Gaani est la grande fête des communautés Dendi et Yoruba du nord du Bénin, célébrant la fin du ramadan et les traditions guerrières. Fantasia à cheval, luttes traditionnelles (dambe), danses guerrières, tenues brodées somptueuses. Djougou se transforme en capitale culturelle du nord pendant deux jours de festivités intenses.",
    location: 'Djougou, Donga',
    city: 'Djougou',
    latitude: 9.6977,
    longitude: 1.6663,
    cover_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    date_start: new Date('2026-04-02'),
    date_end: new Date('2026-04-03'),
    is_recurring: true,
    recurrence: 'Annuel (après le ramadan)',
    tags: ['dendi', 'yoruba', 'islam', 'cheval', 'tradition', 'nord'],
    is_published: true,
  },
  {
    name: 'Fête des Ignames — Savalou',
    slug: 'fete-ignames-savalou',
    description: "La fête des ignames marque la fin des récoltes dans la région des Collines. Offrandes aux divinités de la terre et de la fertilité, dégustation collective des premières ignames de la saison, danses traditionnelles Idaatcha et cérémonies vodun agricoles. Un rituel de gratitude envers la nature profondément ancré dans les pratiques rurales béninoises.",
    location: 'Savalou, Collines',
    city: 'Savalou',
    latitude: 7.9262,
    longitude: 1.9749,
    cover_image: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=800',
    date_start: new Date('2026-08-20'),
    date_end: new Date('2026-08-21'),
    is_recurring: true,
    recurrence: 'Annuel (août)',
    tags: ['agriculture', 'récolte', 'igname', 'idaatcha', 'collines'],
    is_published: true,
  },
  {
    name: 'Zangbeto — Nuit des Gardiens de la Nuit',
    slug: 'zangbeto-porto-novo',
    description: "Le Zangbeto est la société secrète vodun des gardiens de nuit Goun et Fon. Lors des nuits de cérémonie à Porto-Novo et Grand-Popo, les costumes en paille tourbillonnent dans une transe fascinante, protégeant les quartiers des mauvais esprits. Ces cérémonies nocturnes, à la fois mystérieuses et saisissantes, sont ouvertes aux visiteurs respectueux.",
    location: 'Quartiers traditionnels de Porto-Novo',
    city: 'Porto-Novo',
    latitude: 6.4969,
    longitude: 2.6289,
    cover_image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
    date_start: new Date('2026-02-14'),
    date_end: new Date('2026-02-14'),
    is_recurring: true,
    recurrence: 'Plusieurs fois par an (dates annoncées localement)',
    tags: ['vodun', 'zangbeto', 'nuit', 'mystère', 'porto-novo', 'goun'],
    is_published: true,
  },

  // ── FESTIVALS CULTURELS & ARTISTIQUES ──
  {
    name: 'FITHEB — Festival International de Théâtre',
    slug: 'fitheb-cotonou',
    description: "Le Festival International du Théâtre du Bénin (FITHEB) est l'un des plus grands festivals de théâtre d'Afrique. Pendant 10 jours, Cotonou accueille des compagnies théâtrales du monde entier — Afrique, Europe, Amériques — avec représentations en plein air, ateliers, colloques et spectacles de rue. Un événement majeur pour les amateurs d'arts vivants.",
    location: 'Cotonou — divers théâtres et espaces culturels',
    city: 'Cotonou',
    latitude: 6.3654,
    longitude: 2.4183,
    cover_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    date_start: new Date('2026-05-01'),
    date_end: new Date('2026-05-10'),
    is_recurring: true,
    recurrence: 'Biennal (années paires)',
    tags: ['théâtre', 'arts', 'international', 'festival', 'cotonou'],
    is_published: true,
  },
  {
    name: 'Ouidah 92 — Festival des Arts Vaudou',
    slug: 'festival-arts-vaudou-ouidah',
    description: "Héritier du festival fondateur de 1993, le Festival des Arts Vaudou d'Ouidah célèbre l'héritage vodun à travers l'art contemporain, la danse, la musique et la sculpture. Des artistes béninois, haïtiens, brésiliens et cubains explorent ensemble les racines de la diaspora africaine. Expositions, performances et échanges interculturels sur la Route des Esclaves.",
    location: 'Ouidah — Place Chacha et plage',
    city: 'Ouidah',
    latitude: 6.3676,
    longitude: 2.0852,
    cover_image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
    date_start: new Date('2026-01-08'),
    date_end: new Date('2026-01-12'),
    is_recurring: true,
    recurrence: 'Annuel (début janvier)',
    tags: ['vodun', 'arts', 'diaspora', 'brésil', 'haïti', 'ouidah'],
    is_published: true,
  },
  {
    name: 'Regard Bénin — Festival Photo et Cinéma',
    slug: 'regard-benin-festival',
    description: "Regard Bénin est le festival annuel de photographie et de cinéma documentaire de Cotonou. Projections en plein air, expositions dans les rues du Plateau, rencontres avec des photographes africains et ateliers de formation pour jeunes talents béninois. La vision du Bénin à travers l'objectif des artistes locaux et internationaux.",
    location: 'Cotonou — Quartier Plateau',
    city: 'Cotonou',
    latitude: 6.3680,
    longitude: 2.4250,
    cover_image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800',
    date_start: new Date('2026-10-10'),
    date_end: new Date('2026-10-17'),
    is_recurring: true,
    recurrence: 'Annuel (octobre)',
    tags: ['photo', 'cinéma', 'arts', 'jeunesse', 'cotonou'],
    is_published: true,
  },

  // ── EVENTS TOURISTIQUES & NATURE ──
  {
    name: 'Safari Pendjari — Saison des Pluies',
    slug: 'safari-pendjari-saison',
    description: "De juin à octobre, le Parc National de la Pendjari se transforme : la savane reverdit, les points d'eau attirent lions, éléphants, hippopotames et buffles en grand nombre. C'est la meilleure période pour observer la faune sauvage avec des guides CENAGREF certifiés. Sorties à l'aube en 4x4, nuits en campement dans le parc, rencontres avec les communautés Atacora.",
    location: 'Parc National de la Pendjari, Atacora',
    city: 'Tanguiéta',
    latitude: 11.1653,
    longitude: 1.5177,
    cover_image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
    date_start: new Date('2026-06-01'),
    date_end: new Date('2026-10-31'),
    is_recurring: true,
    recurrence: 'Saisonnier (juin à octobre)',
    tags: ['safari', 'faune', 'pendjari', 'nature', 'lion', 'éléphant'],
    is_published: true,
  },
  {
    name: 'Fête du Lac Nokoué — Ganvié',
    slug: 'fete-lac-nokoue-ganvie',
    description: "Chaque année, les Tofinu de Ganvié célèbrent leur lac nourricier lors d'une fête colorée sur les pirogues. Régates de pirogues décorées, offrandes aux génies de l'eau, dégustation de poissons fumés du lac et danses traditionnelles sur les embarcadères. Une célébration aquatique unique dans la Venise de l'Afrique.",
    location: 'Ganvié, Lac Nokoué',
    city: 'Abomey-Calavi',
    latitude: 6.4658,
    longitude: 2.4175,
    cover_image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
    date_start: new Date('2026-07-12'),
    date_end: new Date('2026-07-13'),
    is_recurring: true,
    recurrence: 'Annuel (juillet)',
    tags: ['ganvié', 'lac', 'pirogue', 'tofinu', 'pêche', 'eau'],
    is_published: true,
  },
  {
    name: 'Marché International de Dantokpa',
    slug: 'grand-marche-dantokpa',
    description: "Dantokpa, le plus grand marché d'Afrique de l'Ouest, organise chaque fin d'année une semaine promotionnelle avec des stands spéciaux pour les artisans des 77 communes du Bénin. Sculptures, tissus Kita, bronze d'Abomey, poteries de Natitingou, broderies peul — le meilleur de l'artisanat béninois réuni en un lieu pour les fêtes.",
    location: 'Marché Dantokpa, Cotonou',
    city: 'Cotonou',
    latitude: 6.3580,
    longitude: 2.4220,
    cover_image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    date_start: new Date('2026-12-20'),
    date_end: new Date('2026-12-27'),
    is_recurring: true,
    recurrence: 'Annuel (décembre)',
    tags: ['marché', 'artisanat', 'cotonou', 'shopping', 'fêtes'],
    is_published: true,
  },
]

async function main() {
  console.log('🎉 Seed événements béninois...')

  let created = 0
  let skipped = 0

  for (const event of EVENTS) {
    try {
      await prisma.event.upsert({
        where: { slug: event.slug },
        update: {},
        create: event,
      })
      created++
      console.log(`  ✅ ${event.name}`)
    } catch (e) {
      skipped++
      console.log(`  ⚠️  ${event.name} — ${e.message}`)
    }
  }

  console.log(`\n📅 ${created} événements créés, ${skipped} ignorés`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
