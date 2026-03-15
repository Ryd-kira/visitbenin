// prisma/seed-planner.js
// Seed rapide : activités + locations uniquement
// Usage : node prisma/seed-planner.js
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({ log: ['error'] })

const ACTIVITIES = [
  { icon: '🦁', title: 'Safari Pendjari',           description: 'Lions, éléphants, hippos — 4 800 km² de savane protégée',                        type: 'excursion',  city: 'Natitingou',  price: 80000, duration: 480, tags: ['nature','safari','incontournable'],   order: 1,  is_published: true },
  { icon: '🚣', title: 'Ganvié en pirogue',          description: 'Le Venise de l\'Afrique — village lacustre sur le lac Nokoué',                    type: 'excursion',  city: 'Cotonou',     price: 15000, duration: 180, tags: ['UNESCO','culture','famille'],         order: 2,  is_published: true },
  { icon: '⛓️', title: 'Route des Esclaves',          description: 'Mémorial historique poignant de la traite négrière à Ouidah',                    type: 'decouverte', city: 'Ouidah',      price: 3000,  duration: 120, tags: ['histoire','UNESCO','émouvant'],       order: 3,  is_published: true },
  { icon: '👑', title: 'Palais Royaux d\'Abomey',    description: 'Site du patrimoine mondial — 12 rois du Dahomey',                                 type: 'decouverte', city: 'Abomey',      price: 3000,  duration: 150, tags: ['UNESCO','histoire','culture'],        order: 4,  is_published: true },
  { icon: '🥁', title: 'Fête du Vodun',               description: '10 janvier — Célébration nationale à Ouidah',                                    type: 'activite',   city: 'Ouidah',      price: 0,     duration: 360, tags: ['festival','vodun','gratuit'],         order: 5,  is_published: true },
  { icon: '🏖️', title: 'Plage de Grand-Popo',         description: 'Plage sauvage préservée, pêcheurs et couchers de soleil inoubliables',           type: 'activite',   city: 'Grand-Popo',  price: 0,     duration: 240, tags: ['plage','détente','gratuit'],          order: 6,  is_published: true },
  { icon: '🛍️', title: 'Marché Dantokpa',             description: 'Le plus grand marché d\'Afrique de l\'Ouest — artisanat, épices, tissus',        type: 'activite',   city: 'Cotonou',     price: 0,     duration: 120, tags: ['shopping','culture','incontournable'],order: 7,  is_published: true },
  { icon: '🏛️', title: 'Musée d\'Abomey',             description: 'Trésors royaux et arts du royaume du Dahomey',                                   type: 'decouverte', city: 'Abomey',      price: 2000,  duration: 90,  tags: ['musée','histoire','culture'],         order: 8,  is_published: true },
  { icon: '🏰', title: 'Tata Somba',                   description: 'Maisons fortifiées des Betammaribé classées UNESCO',                             type: 'excursion',  city: 'Natitingou',  price: 5000,  duration: 300, tags: ['UNESCO','architecture','unique'],     order: 9,  is_published: true },
  { icon: '🚣', title: 'Kayak Lac Ahémé',              description: 'Pagayez entre villages de pêcheurs sur le lac Ahémé',                           type: 'activite',   city: 'Grand-Popo',  price: 12000, duration: 180, tags: ['sport','nature','originalité'],       order: 10, is_published: true },
  { icon: '🍲', title: 'Cours de cuisine béninoise',   description: 'Apprenez à préparer amiwo, tchoukoutou et sauce graine',                        type: 'activite',   city: 'Cotonou',     price: 20000, duration: 180, tags: ['gastronomie','culture','famille'],    order: 11, is_published: true },
  { icon: '🏄', title: 'Surf & Body Board',             description: 'Vagues atlantiques sur la côte béninoise à Grand-Popo',                        type: 'activite',   city: 'Grand-Popo',  price: 8000,  duration: 120, tags: ['sport','plage','adrénaline'],         order: 12, is_published: true },
]

const RENTALS = [
  { icon: '🚗', title: 'Citadine (Dacia, Kia)',      type: 'Voiture', price_day: 25000, features: ['Climatisé','GPS','Assurance'],                ideal: 'Cotonou & environs',   order: 1, is_published: true },
  { icon: '🚙', title: 'SUV 4x4 (Toyota Hilux)',     type: 'Voiture', price_day: 55000, features: ['4x4','Climatisé','GPS','Long trajet'],        ideal: 'Pendjari, Nord-Bénin', order: 2, is_published: true },
  { icon: '🚐', title: 'Minibus (8–12 places)',       type: 'Voiture', price_day: 70000, features: ['Groupe','Climatisé','Bagages'],               ideal: 'Groupes & familles',   order: 3, is_published: true },
  { icon: '🛵', title: 'Moto-taxi privé (journée)',   type: 'Moto',    price_day: 8000,  features: ['Flexible','Rapide','Économique'],             ideal: 'Ville uniquement',     order: 4, is_published: true },
  { icon: '🏠', title: 'Studio meublé',               type: 'Appart',  price_day: 15000, features: ['WiFi','Cuisine équipée','Climatisé'],         ideal: 'Séjour 1 semaine+',    order: 5, is_published: true },
  { icon: '🏡', title: 'Appartement F2',              type: 'Appart',  price_day: 25000, features: ['WiFi','2 pièces','Cuisine','Climatisé'],      ideal: 'Couple ou petite famille', order: 6, is_published: true },
  { icon: '🏘️', title: 'Villa avec piscine',          type: 'Appart',  price_day: 80000, features: ['Piscine','Jardin','Personnel','Climatisé'],   ideal: 'Séjour haut de gamme', order: 7, is_published: true },
]

async function main() {
  console.log('🌱 Seed planificateur...\n')

  // Vider et re-créer
  await prisma.activity.deleteMany()
  await prisma.rental.deleteMany()
  console.log('🗑️  Tables vidées')

  for (const act of ACTIVITIES) {
    await prisma.activity.create({ data: act })
  }
  console.log(`✅ ${ACTIVITIES.length} activités créées`)

  for (const r of RENTALS) {
    await prisma.rental.create({ data: r })
  }
  console.log(`✅ ${RENTALS.length} locations créées`)

  console.log('\n🎉 Seed planificateur terminé !')
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
