# Contenus à confirmer — Smartech Formations

Fichier généré lors de l’implémentation P0/P1.  
**Ne pas publier de chiffres, avis ou garanties non validés.**

## Manquant / bloquant

| Élément | Statut | Action requise |
|--------|--------|----------------|
| `Cahier_des_charges_Cursor_Smartech.md` | **Absent du dépôt** | Ajouter le fichier à la racine pour caler les phases suivantes (P2+) et les références d’inspiration |
| Email destinataire PHP `TO_EMAIL` | `direction@smartech-formations.com` | Configuré — tester `mail()` / SPF / DKIM sur l’hébergeur après déploiement |
| Témoignages (`#temoignages`) | **Masqués** (`hidden` + `data-pending-content`) | Fournir avis réels + consentement écrit + prénoms / formations autorisés |
| Badges « Très demandé » | **Masqués** | Confirmer ou retirer définitivement |
| Section « populaires » / classement | **Masquée** | Fournir données mesurables ou laisser le catalogue seul |
| Photos hero locales | Unsplash (externes) | Remplacer par photos centre / salles (WebP) |
| Agréments, partenaires, garanties d’emploi | Non affichés | Ne pas inventer |

## Contacts (à garder cohérents NAP)

- Tél. : +216 29 70 60 46 · +216 40 50 77 93  
- WhatsApp : 21629706046  
- Email public : smart.tech.mahdia@gmail.com  
- Adresse : Avenue Ali Belhouane, au-dessus Magasin Aziza, Rond-Point Café Jbeli, Mahdia 5100  
- Facebook / Instagram : déjà liés dans le footer / float

## Palette confirmée dans le dépôt

Voir `tokens.css` :

- Bleu `#2FAFE3` → `--color-primary`
- Bleu foncé `#123B5D` → `--color-primary-dark`
- Titres `#0F2742` → `--color-heading`
- Jaune `#F8C515` → `--color-accent`
- Fond `#F7F9FC` → `--color-bg`

Polices : **Outfit** (titres) + **Manrope** (corps). Logo : `assets/img/logo-header.webp` (fallback `Logo.png`).

## Offre Intelligence artificielle (à valider avant publication)

| Élément | Statut |
|--------|--------|
| 10 programmes éditoriaux (modules, objectifs, projets) | Propositions — valider pédagogiquement |
| Prix, dates, durées, formateurs | **Non affichés** — « Contactez-nous pour les modalités » |
| Certification / financement | **Non revendiqués** |
| Affiches HTML (`affiches-ia.html`) | `noindex` — usage interne / print |
| Email leads IA | `direction@smartech-formations.com` via `send-inscription.php` — tester `mail()` sur l’hébergeur |
| Visuels `assets/img/ia/*.webp` | Générés — revue DA recommandée |
