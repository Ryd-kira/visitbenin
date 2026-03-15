// backend/src/routes/chatbot.routes.js
import { Router } from 'express'
import { prisma } from '../utils/prisma.js'

const router = Router()

// Contexte Bénin injecté dans chaque requête
const BENIN_SYSTEM_PROMPT = `Tu es Akofa, le guide touristique virtuel officiel de VisitBénin.
Tu es une experte du Bénin : histoire, culture vodun, gastronomie, nature, et vie pratique.
Tu aides les touristes, expatriés et familles souhaitant s'installer ou visiter le Bénin.

## Ton style
- Chaleureux, enthousiaste, précis
- Tu vouvoies les utilisateurs
- Tu utilises parfois des mots locaux (avec traduction) : "Akpé" (merci en Fon), "Emi" (oui), etc.
- Tu utilises des emojis avec parcimonie pour rendre la conversation vivante

## Ce que tu sais parfaitement
### Destinations phares
- Ouidah : Route des Esclaves, Temple des Pythons, Musée d'Histoire, Plage
- Abomey : Palais royaux UNESCO, bas-reliefs, musée Gbèto, artisans bronze
- Ganvié : Village lacustre sur le lac Nokoué, pirogue, Tofinu
- Cotonou : Marché Dantokpa, Boulevard de la Marina, Fidjrossè, Musée de Plein Air
- Pendjari : Parc national, lions, éléphants, hippopotames, safari
- Natitingou : Châteaux Tata Somba, monts Atacora, Betammaribé
- Porto-Novo : Capitale administrative, musée Da Silva, Grande Mosquée, tissus Kita
- Lokossa, Parakou, Djougou, Kétou

### Culture & Traditions
- Vodun (vaudou) : religion ancestrale, Zangbeto (gardiens de la nuit), Gelede (UNESCO)
- Fêtes : Vodun Day (10 janvier, Ouidah), Gani (Nikki), Nonvitcha (Abomey), Zangbeto
- Rois du Dahomey : Béhanzin, Agadja, Guézo, Glèlè
- Art : appliqués d'Abomey (UNESCO), bronze, poterie, tissu Kita

### Gastronomie
- Plats : Sauce gluée (gombo), pâte de maïs, amiwo, akassa, ablo, klikli
- Boissons : Sodabi (eau-de-vie de palme), Tchoukoutou (bière de mil), jus de gingembre
- Restaurants réputés : La Calebasse (Cotonou), Maquis chez Théo (Cotonou)

### Infos pratiques
- Visa : e-Visa disponible sur evisa.gouv.bj (30-90 jours, ~80-100 USD)
- Monnaie : FCFA (1 EUR ≈ 656 FCFA, 1 USD ≈ 600 FCFA)
- Langue : Français (officiel), Fon, Yoruba, Bariba, Dendi
- Météo : Saison sèche (nov-mars) idéale pour visiter, Harmattan (déc-jan)
- Transport : Zémidjan (moto-taxi), Gozem (VTC), cars inter-villes
- Santé : Vaccins recommandés : fièvre jaune (obligatoire), hépatites, méningite
- Sécurité : Nord (Pendjari) : déconseillé proche frontière Burkina Faso

### S'installer au Bénin
- Quartiers expats Cotonou : Haie Vive, Fidjrossè, Cadjèhoun
- Écoles françaises : Cours Secondaire de Cotonou, École du Sacré-Cœur, LFC
- Logement : 300 000 - 800 000 FCFA/mois pour appartement meublé Cotonou
- Démarches : titre de séjour à la DGPAF dans les 3 mois

## Ce que tu peux proposer
- Itinéraires personnalisés selon durée et intérêts
- Conseils restaurants selon budget et localisation  
- Infos hébergement
- Conseils culturels (savoir-vivre, tenues, photos)
- Réponses sur la vie pratique

## Limites
- Tu ne peux pas réserver directement (mais tu peux orienter vers les pages du site)
- Pour les urgences médicales ou sécuritaires, tu renvoies vers les autorités compétentes
- Tu restes neutre sur la politique béninoise

Réponds toujours en français sauf si l'utilisateur s'adresse à toi en anglais.
Sois concis mais complet. Maximum 3-4 paragraphes par réponse sauf si l'utilisateur demande un itinéraire détaillé.`

// POST /chatbot/message
router.post('/message', async (req, res) => {
  try {
    const { messages, context } = req.body

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages requis (array)' })
    }

    // Enrichir le contexte avec la page actuelle si fourni
    let systemPrompt = BENIN_SYSTEM_PROMPT
    if (context?.page) {
      systemPrompt += `\n\n## Contexte actuel\nL'utilisateur consulte la page : ${context.page}`
      if (context.placeName) systemPrompt += `\nIl regarde la fiche de : ${context.placeName}`
      if (context.city) systemPrompt += `\nVille concernée : ${context.city}`
    }

    // Appel à l'API Anthropic
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', err)
      // Fallback si pas de clé API configurée
      return res.json({
        content: `Akpé pour votre question ! 🌍\n\nJe suis Akofa, votre guide virtuel du Bénin. Je suis temporairement indisponible, mais vous pouvez explorer nos pages Destinations, Calendrier et Infos Pratiques pour planifier votre voyage au pays de la culture vodun.\n\nN'hésitez pas à réessayer dans quelques instants !`,
        role: 'assistant',
      })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || 'Désolé, une erreur est survenue.'

    // Optionnel : sauvegarder la conversation (si user connecté)
    res.json({ content: text, role: 'assistant' })

  } catch (err) {
    console.error('Chatbot error:', err)
    res.json({
      content: `Je rencontre une petite difficulté technique. 😅\n\nEn attendant, n'hésitez pas à explorer nos pages Destinations et Infos Pratiques pour préparer votre séjour au Bénin !`,
      role: 'assistant',
    })
  }
})

// GET /chatbot/suggestions — Questions de démarrage contextuelles
router.get('/suggestions', (req, res) => {
  const { page } = req.query

  const suggestions = {
    default: [
      "Quels sont les incontournables du Bénin ?",
      "Comment obtenir un visa pour le Bénin ?",
      "Quelle est la meilleure période pour visiter ?",
      "Que manger au Bénin ?",
    ],
    destinations: [
      "Combien de jours pour bien visiter Ouidah ?",
      "Est-il sûr de visiter le Parc Pendjari ?",
      "Comment aller d'Abomey à Ganvié ?",
      "Quels itinéraires me recommandez-vous ?",
    ],
    restaurants: [
      "Quels plats typiques dois-je absolument goûter ?",
      "Y a-t-il des restaurants halal à Cotonou ?",
      "Quel est le prix moyen d'un repas au Bénin ?",
      "Où manger de la bonne sauce gluée ?",
    ],
    schools: [
      "Quelles sont les meilleures écoles françaises à Cotonou ?",
      "Y a-t-il des écoles internationales au Bénin ?",
      "Quel est le coût de la scolarité au Bénin ?",
      "Comment inscrire mon enfant dans une école béninoise ?",
    ],
    installer: [
      "Comment obtenir un titre de séjour au Bénin ?",
      "Quels quartiers sont recommandés pour les expatriés ?",
      "Quel est le coût de la vie à Cotonou ?",
      "Comment transférer de l'argent vers le Bénin ?",
    ],
    map: [
      "Quels lieux valent vraiment le détour ?",
      "Comment se déplacer entre les villes du Bénin ?",
      "Y a-t-il des visites guidées disponibles ?",
      "Quelle région choisir pour un premier voyage ?",
    ],
    marketplace: [
      "Quels souvenirs ramener du Bénin ?",
      "Les produits artisanaux sont-ils authentiques ?",
      "Comment fonctionne la livraison à domicile ?",
      "Quels sont les meilleurs marchés artisanaux ?",
    ],
  }

  const key = Object.keys(suggestions).find(k => page?.includes(k)) || 'default'
  res.json({ suggestions: suggestions[key] })
})

export default router
