# Maintenance — Smartech Formations (site statique)

## Stack

- HTML / CSS / JS vanilla (pas de framework, pas de bundler)
- 1 endpoint PHP : `send-inscription.php` (JSON, `mail()`, honeypot, rate-limit session)
- Apache : `.htaccess` (HTTPS + www, cache, compression)

## Structure utile

| Fichier | Rôle |
|---------|------|
| `tokens.css` | Design tokens (palette, rayons, typos) — source unique |
| `styles.css` | Styles globaux (`@import` tokens) |
| `app.js` | Menu, reveal, FAQ, **formulaire + préremplissage `?formation=`** |
| `formations.js` | Catalogue : **filtres + recherche** |
| `offers-carousel.js` | Hero carrousel (lazy backgrounds) |
| `llms.txt` / `sitemap.xml` / `robots.txt` | SEO / GEO |

## Navigation (P0)

Liens principaux unifiés : **Formations · Équipe · FAQ · Inscription** (+ téléphone / CTA).  
Logo = Accueil. Funnel entrepreneuriat : Accueil · Formations · Équipe · Inscription.

## Formulaires

1. Accueil `#inscription` → `POST send-inscription.php` (`form_source=accueil`)
2. Funnel `entrepreneuriat-inscription.html` → même PHP (`form_source=entrepreneuriat`)

Destinataire : **`direction@smartech-formations.com`** (email HTML charte Smartech + Reply-To = email du prospect si fourni).

Préremplissage catalogue :

```
index.html?formation=Anglais#inscription
```

Succès affiché **uniquement** si `{"ok":true}` renvoyé par le serveur (pas de succès simulé côté front).

## Catalogue

- Filtres : `?categorie=langues|tests|digital|technique|entrepreneuriat`
- Recherche : `?q=ielts` (champ `#catalogue-search`)
- Cartes : `data-search` + liens inscription contextualisés + WhatsApp

## Contenu masqué volontairement

Éléments avec `hidden` + `data-pending-content` : ne pas réafficher sans validation (voir `CONTENUS_A_CONFIRMER.md`).

## Checks locaux recommandés

```bash
# Servir le site (exemple)
npx --yes serve -l 4173 .

# Vérifier
# - 360 / 390 / 768 / 1024 / 1440 px
# - clavier : Tab, Escape (menu), Entrée (filtres / form)
# - recherche + filtres catalogue
# - préremplissage formation
# - erreur form (champ vide) + message réseau si PHP absent en local
# - tel: / wa.me / mailto:
```

En local sans PHP, le formulaire doit afficher une **erreur** (pas un succès).

## Déploiement (hors scope de la tâche P0/P1)

Ne pas publier depuis cette session. Lors du déploiement manuel :

1. Uploader fichiers + `assets/img/*` (webp + og-default.jpg)
2. Vérifier `mail()` / destinataire
3. Tester une vraie inscription
4. Soumettre `sitemap.xml` Search Console
